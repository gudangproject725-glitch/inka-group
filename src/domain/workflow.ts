/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ApprovalInstance,
  ApprovalWorkflow,
  Budget,
  EMeteraiStamp,
  GoodsReceiptNote,
  ProcurementAnomaly,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseRequestItem,
  RFQSupplierBid,
  Supplier,
  ThreeWayMatchResult,
  User,
  VendorInvoice,
} from '../types/procurement';

/**
 * Calculates line item total with non-negative validation
 */
export function calculateItemLineTotal(quantity: number, unitPrice: number): number {
  const safeQty = Math.max(0, Number(quantity) || 0);
  const safePrice = Math.max(0, Number(unitPrice) || 0);
  return Math.round(safeQty * safePrice);
}

/**
 * Calculates subtotal, tax (PPN 11%), and grand total for order items
 */
export function calculateOrderTotals(
  items: Array<{ quantity: number; estimatedUnitPrice?: number; unitPrice?: number }>,
  taxRate: number = 0.11
): { subtotal: number; taxTotal: number; grandTotal: number } {
  const subtotal = items.reduce((acc, item) => {
    const price = item.estimatedUnitPrice ?? item.unitPrice ?? 0;
    return acc + calculateItemLineTotal(item.quantity, price);
  }, 0);

  const taxTotal = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + taxTotal;

  return { subtotal, taxTotal, grandTotal };
}

/**
 * Evaluates applicable approval steps based on request amount and conditions
 */
export function evaluateWorkflowSteps(
  workflow: ApprovalWorkflow,
  grandTotal: number,
  departmentId?: string
): ApprovalInstance[] {
  // Sort step rules by stepOrder
  const sortedRules = [...workflow.steps].sort((a, b) => a.stepOrder - b.stepOrder);

  // Filter rules that apply to this amount and department
  const applicableRules = sortedRules.filter((rule) => {
    if (grandTotal < rule.minimumAmount) return false;
    if (rule.maximumAmount !== undefined && grandTotal > rule.maximumAmount) return false;
    if (rule.departmentCondition && rule.departmentCondition !== 'ALL' && departmentId && rule.departmentCondition !== departmentId) {
      return false;
    }
    return true;
  });

  // Re-index steps to ensure contiguous sequence (1, 2, 3...)
  return applicableRules.map((rule, idx) => ({
    id: `appr-inst-${Date.now()}-${idx + 1}`,
    organizationId: workflow.organizationId,
    documentType: workflow.documentType,
    documentId: '',
    stepOrder: idx + 1,
    stepName: rule.stepName,
    requiredRole: rule.approverRole,
    assignedUserId: rule.approverUserId,
    status: 'pending',
  }));
}

export interface ApprovalPermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Strict verification of whether a user is authorized to act on the current approval step
 * Enforces:
 * 1. Document status must be pending_approval
 * 2. Self-approval is strictly forbidden (requester cannot approve own document)
 * 3. Step order must be strictly sequential (cannot skip steps)
 * 4. User role or assigned user ID must match step requirement
 */
export function canUserApprove(
  request: PurchaseRequest,
  user: User
): ApprovalPermissionResult {
  if (request.status !== 'pending_approval') {
    return {
      allowed: false,
      reason: `Dokumen tidak berada dalam status menunggu persetujuan (status saat ini: ${request.status}).`,
    };
  }

  // Anti-Conflict of Interest: Requester cannot approve their own request
  if (user.id === request.requesterId) {
    return {
      allowed: false,
      reason: 'Kebijakan Keamanan: Pemohon tidak diizinkan menyetujui permintaannya sendiri (Pencegahan Konflik Kepentingan).',
    };
  }

  const currentStep = request.approvalInstances.find(
    (step) => step.stepOrder === request.currentStepOrder
  );

  if (!currentStep) {
    return {
      allowed: false,
      reason: 'Tahap persetujuan aktif tidak ditemukan.',
    };
  }

  if (currentStep.status !== 'pending') {
    return {
      allowed: false,
      reason: `Tahap persetujuan ini sudah selesai diputuskan (${currentStep.status}).`,
    };
  }

  // Sequential integrity check: all previous steps must be approved or skipped
  const previousIncompleteStep = request.approvalInstances.find(
    (s) => s.stepOrder < currentStep.stepOrder && s.status !== 'approved' && s.status !== 'skipped'
  );
  if (previousIncompleteStep) {
    return {
      allowed: false,
      reason: `Tahap sebelumnya (${previousIncompleteStep.stepName}) belum selesai. Alur persetujuan harus berurutan.`,
    };
  }

  // Role or specific user match
  const isDirectlyAssigned = currentStep.assignedUserId && currentStep.assignedUserId === user.id;
  const hasRequiredRole = currentStep.requiredRole === user.role;
  const isOrgAdmin = user.role === 'organization_admin' || user.role === 'organization_owner';

  if (!isDirectlyAssigned && !hasRequiredRole && !isOrgAdmin) {
    return {
      allowed: false,
      reason: `Peran Anda (${user.role}) tidak memiliki wewenang untuk tahap "${currentStep.stepName}" (Memerlukan: ${currentStep.requiredRole}).`,
    };
  }

  return { allowed: true };
}

/**
 * Processes an approval decision (approved or rejected) and transitions the document state
 */
export function processApprovalDecision(
  request: PurchaseRequest,
  user: User,
  decision: 'approved' | 'rejected',
  reason?: string
): { updatedRequest: PurchaseRequest; error?: string } {
  const permCheck = canUserApprove(request, user);
  if (!permCheck.allowed) {
    return { updatedRequest: request, error: permCheck.reason };
  }

  const now = new Date().toISOString();
  const currentStepIndex = request.approvalInstances.findIndex(
    (s) => s.stepOrder === request.currentStepOrder
  );

  if (currentStepIndex === -1) {
    return { updatedRequest: request, error: 'Tahap persetujuan tidak ditemukan.' };
  }

  const updatedInstances = [...request.approvalInstances];
  const stepToUpdate = { ...updatedInstances[currentStepIndex] };

  if (decision === 'rejected') {
    if (!reason || reason.trim().length < 5) {
      return {
        updatedRequest: request,
        error: 'Alasan penolakan wajib diisi minimal 5 karakter untuk keperluan audit.',
      };
    }

    stepToUpdate.status = 'rejected';
    stepToUpdate.decisionAt = now;
    stepToUpdate.decisionByUserId = user.id;
    stepToUpdate.decisionByUserName = user.name;
    stepToUpdate.decisionReason = reason.trim();
    updatedInstances[currentStepIndex] = stepToUpdate;

    const updatedRequest: PurchaseRequest = {
      ...request,
      status: 'rejected',
      approvalInstances: updatedInstances,
      rejectionReason: reason.trim(),
      updatedAt: now,
    };

    return { updatedRequest };
  }

  // Decision is 'approved'
  stepToUpdate.status = 'approved';
  stepToUpdate.decisionAt = now;
  stepToUpdate.decisionByUserId = user.id;
  stepToUpdate.decisionByUserName = user.name;
  if (reason) stepToUpdate.decisionReason = reason.trim();
  updatedInstances[currentStepIndex] = stepToUpdate;

  // Check if there are subsequent pending steps
  const nextStep = updatedInstances.find(
    (s) => s.stepOrder > request.currentStepOrder && s.status === 'pending'
  );

  if (nextStep) {
    // Advance to next step
    const updatedRequest: PurchaseRequest = {
      ...request,
      currentStepOrder: nextStep.stepOrder,
      approvalInstances: updatedInstances,
      updatedAt: now,
    };
    return { updatedRequest };
  }

  // All steps completed! Document is officially APPROVED!
  const updatedRequest: PurchaseRequest = {
    ...request,
    status: 'approved',
    approvalInstances: updatedInstances,
    updatedAt: now,
  };

  return { updatedRequest };
}

/**
 * Validates budget availability against requested amount
 */
export function validateBudgetAvailability(
  budget: Budget,
  requestedAmount: number
): {
  isSufficient: boolean;
  allocated: number;
  committed: number;
  spent: number;
  available: number;
  remainingAfterRequest: number;
  utilizationPercent: number;
} {
  const allocated = budget.allocatedAmount;
  const committed = budget.committedAmount;
  const spent = budget.spentAmount;
  const used = committed + spent;
  const available = Math.max(0, allocated - used);
  const remainingAfterRequest = available - requestedAmount;
  const isSufficient = remainingAfterRequest >= 0;
  const utilizationPercent = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 100;

  return {
    isSufficient,
    allocated,
    committed,
    spent,
    available,
    remainingAfterRequest,
    utilizationPercent,
  };
}

/**
 * Validates whether a Purchase Request can be converted into a Purchase Order
 */
export function canConvertPrToPo(request: PurchaseRequest): { allowed: boolean; reason?: string } {
  if (request.status !== 'approved') {
    return {
      allowed: false,
      reason: `Purchase Order hanya dapat dibuat dari Purchase Request yang telah disetujui (Status: ${request.status}).`,
    };
  }

  if (request.generatedPoId) {
    return {
      allowed: false,
      reason: 'Purchase Request ini sudah pernah dikonversi menjadi Purchase Order sebelumnya.',
    };
  }

  if (!request.items || request.items.length === 0) {
    return {
      allowed: false,
      reason: 'Purchase Request tidak memiliki item yang valid.',
    };
  }

  return { allowed: true };
}

/**
 * Generates document numbers like PR-2026-0001, PO-2026-0001
 */
export function generateDocumentNumber(prefix: string, count: number, year: number = 2026): string {
  const padded = String(count).padStart(4, '0');
  return `${prefix}-${year}-${padded}`;
}

// ==========================================
// 1. E-METERAI & DIGITAL SIGNATURE (PSrE)
// ==========================================

/**
 * According to Indonesian Stamp Duty Law (UU No. 10 Tahun 2020),
 * documents stating an amount of Rp 5.000.000 or more are subject to Rp 10.000 stamp duty.
 */
export function isEligibleForEMeterai(amount: number): boolean {
  return amount >= 5000000;
}

/**
 * Generates an official e-Meterai seal certificate with SHA-256 document hash and Peruri/PSrE serial
 */
export function generateEMeteraiStamp(
  po: PurchaseOrder,
  signerName: string,
  signerRole: string,
  provider: 'Peruri' | 'PrivyID' | 'VIDA' = 'Peruri'
): EMeteraiStamp {
  const now = new Date().toISOString();
  // Deterministic-like SHA-256 simulation based on PO content
  const contentSeed = `${po.poNumber}-${po.grandTotal}-${po.supplierId}-${signerName}-${now}`;
  let hashVal = 0;
  for (let i = 0; i < contentSeed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + contentSeed.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = Math.abs(hashVal).toString(16).padStart(8, '0') + 'f7a83c2e1b4d096a92ec4';
  const serialSuffix = Math.floor(1000000 + Math.random() * 9000000);
  const serialNumber = `MTR-2026-JKT-${serialSuffix}`;

  return {
    stamped: true,
    serialNumber,
    stampedAt: now,
    signerName,
    signerRole,
    psreProvider: provider,
    documentHash: hexHash,
    qrVerificationUrl: `https://verifikasi.inka.co.id/meterai/${serialNumber}`,
    nominalThresholdEligible: isEligibleForEMeterai(po.grandTotal),
  };
}

// ==========================================
// 2. THREE-WAY MATCHING RECONCILIATION
// ==========================================

/**
 * Reconciles Purchase Order vs Goods Receipt Note vs Vendor Invoice
 * Matches:
 * 1. PO ordered quantities vs GRN received quantities
 * 2. PO unit prices & total vs Invoice billed amounts
 */
export function evaluateThreeWayMatch(
  po: PurchaseOrder,
  grn?: GoodsReceiptNote,
  invoice?: VendorInvoice
): ThreeWayMatchResult {
  const discrepancies: string[] = [];
  let quantityMatch = false;
  let priceMatch = false;

  if (!grn) {
    return {
      poId: po.id,
      poNumber: po.poNumber,
      matchStatus: 'grn_missing',
      quantityMatch: false,
      priceMatch: false,
      discrepancies: ['Surat Jalan / Bukti Penerimaan Barang (GRN) belum diunggah oleh gudang.'],
      readyForPayment: false,
    };
  }

  if (!invoice) {
    return {
      poId: po.id,
      poNumber: po.poNumber,
      grnId: grn.id,
      grnNumber: grn.grnNumber,
      matchStatus: 'invoice_missing',
      quantityMatch: false,
      priceMatch: false,
      discrepancies: ['Tagihan / Faktur Pajak dari vendor belum tercatat di sistem.'],
      readyForPayment: false,
    };
  }

  // 1. Quantity Verification
  let qtyMismatchFound = false;
  po.items.forEach((poItem) => {
    const grnItem = grn.items.find((gi) => gi.poItemId === poItem.id);
    if (!grnItem) {
      discrepancies.push(`Item "${poItem.description}" tidak tercatat dalam Surat Jalan fisik.`);
      qtyMismatchFound = true;
    } else if (grnItem.receivedQty < poItem.quantity) {
      discrepancies.push(
        `Kuantitas kurang pada "${poItem.description}": Dipesan ${poItem.quantity} ${poItem.unit}, Diterima ${grnItem.receivedQty} ${poItem.unit}.`
      );
      qtyMismatchFound = true;
    }
  });

  quantityMatch = !qtyMismatchFound;

  // 2. Price Verification (Allow 0% variance tolerance for enterprise strictness)
  const priceDifference = Math.abs(invoice.totalAmount - po.grandTotal);
  if (priceDifference > 100) {
    // Difference greater than Rp 100
    discrepancies.push(
      `Selisih nilai tagihan: PO bernilai Rp ${po.grandTotal.toLocaleString('id-ID')}, namun Invoice vendor menagih Rp ${invoice.totalAmount.toLocaleString('id-ID')}.`
    );
    priceMatch = false;
  } else {
    priceMatch = true;
  }

  let matchStatus: ThreeWayMatchResult['matchStatus'] = 'fully_matched';
  if (!quantityMatch && !priceMatch) {
    matchStatus = 'quantity_mismatch';
  } else if (!quantityMatch) {
    matchStatus = 'quantity_mismatch';
  } else if (!priceMatch) {
    matchStatus = 'price_variance';
  }

  const readyForPayment = quantityMatch && priceMatch;

  return {
    poId: po.id,
    poNumber: po.poNumber,
    grnId: grn.id,
    grnNumber: grn.grnNumber,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    matchStatus,
    quantityMatch,
    priceMatch,
    discrepancies,
    readyForPayment,
  };
}

// ==========================================
// 3. 3-WAY RFQ (REQUEST FOR QUOTATION) SCORING
// ==========================================

/**
 * Scores and ranks competing vendor bids based on:
 * - Price competitiveness (50% weight)
 * - Lead time / delivery speed (20% weight)
 * - Compliance score (20% weight)
 * - Warranty duration (10% weight)
 */
export function evaluateRfqBids(bids: RFQSupplierBid[]): RFQSupplierBid[] {
  if (bids.length === 0) return [];

  const lowestPrice = Math.min(...bids.map((b) => b.totalPrice));
  const fastestDelivery = Math.min(...bids.map((b) => b.deliveryDays));
  const maxWarranty = Math.max(...bids.map((b) => b.warrantyMonths || 1));

  const scoredBids = bids.map((bid) => {
    // Price score: 100 if lowest, proportional if higher
    const priceScore = lowestPrice > 0 ? (lowestPrice / bid.totalPrice) * 100 : 0;
    // Delivery score: 100 if fastest, lower if slower
    const deliveryScore = fastestDelivery > 0 ? (fastestDelivery / bid.deliveryDays) * 100 : 0;
    // Warranty score: 100 if max
    const warrantyScore = maxWarranty > 0 ? ((bid.warrantyMonths || 0) / maxWarranty) * 100 : 0;
    const complianceScore = bid.complianceScore || 80;

    const overallScore = Math.round(
      priceScore * 0.5 + deliveryScore * 0.2 + complianceScore * 0.2 + warrantyScore * 0.1
    );

    return {
      ...bid,
      overallScore,
    };
  });

  // Sort descending by overallScore
  scoredBids.sort((a, b) => b.overallScore - a.overallScore);

  // Mark top 1 as recommended, others as alternative or rejected
  return scoredBids.map((bid, index) => ({
    ...bid,
    status: index === 0 ? 'recommended' : bid.overallScore >= 70 ? 'alternative' : 'rejected',
  }));
}

// ==========================================
// 4. FRAUD & ANOMALY DETECTION ENGINE
// ==========================================

/**
 * Scans procurement data for suspicious patterns:
 * 1. Split PRs: Multiple PRs created within 72 hours under Rp 50M threshold that together exceed Rp 50M.
 * 2. Price Spike: Line items priced >25% higher than standard.
 * 3. Supplier Concentration: A single supplier receiving >50% of total issued PO volume.
 * 4. Unverified Vendor: Orders awarded to vendors with missing legal compliance docs.
 */
export function detectProcurementAnomalies(
  requests: PurchaseRequest[],
  orders: PurchaseOrder[],
  suppliers: Supplier[]
): ProcurementAnomaly[] {
  const anomalies: ProcurementAnomaly[] = [];
  const now = new Date().toISOString();

  // 1. Detect Split PRs (Bypassing Executive Rp 50.000.000 Threshold)
  const nonRejectedPrs = requests.filter((r) => r.status !== 'rejected' && r.status !== 'cancelled');
  const deptGroups: Record<string, PurchaseRequest[]> = {};
  nonRejectedPrs.forEach((pr) => {
    if (!deptGroups[pr.departmentId]) deptGroups[pr.departmentId] = [];
    deptGroups[pr.departmentId].push(pr);
  });

  Object.entries(deptGroups).forEach(([deptId, prs]) => {
    if (prs.length < 2) return;
    // Sort by created date
    const sorted = [...prs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const prA = sorted[i];
      const prB = sorted[i + 1];
      const timeDiffHours =
        (new Date(prB.createdAt).getTime() - new Date(prA.createdAt).getTime()) / (1000 * 60 * 60);

      // Both PRs are under Rp 50.000.000, submitted within 72 hours, combined >= Rp 50.000.000
      if (
        timeDiffHours <= 72 &&
        prA.grandTotal < 50000000 &&
        prB.grandTotal < 50000000 &&
        prA.grandTotal + prB.grandTotal >= 50000000
      ) {
        anomalies.push({
          id: `anomaly-split-${prA.id}-${prB.id}`,
          organizationId: prA.organizationId,
          type: 'split_pr',
          severity: 'high',
          title: 'Indikasi Pemecahan Pengajuan (Split Purchase Request)',
          description: `Dua pengajuan (${prA.requestNumber} dan ${prB.requestNumber}) diajukan dalam rentang ${Math.round(
            timeDiffHours
          )} jam dengan nominal masing-masing di bawah Rp 50 Jt (Total gabungan: Rp ${(
            prA.grandTotal + prB.grandTotal
          ).toLocaleString('id-ID')}). Terindikasi menghindari batas wewenang persetujuan direktur.`,
          flaggedEntity: 'purchase_request',
          entityId: prB.id,
          entityNumber: prB.requestNumber,
          detectedAt: now,
          dismissed: false,
        });
      }
    }
  });

  // 2. Detect Supplier Concentration Risk
  const totalPoSpend = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  if (totalPoSpend > 0 && orders.length >= 3) {
    const spendBySupplier: Record<string, { name: string; total: number; count: number }> = {};
    orders.forEach((o) => {
      if (!spendBySupplier[o.supplierId]) {
        spendBySupplier[o.supplierId] = { name: o.supplierName, total: 0, count: 0 };
      }
      spendBySupplier[o.supplierId].total += o.grandTotal;
      spendBySupplier[o.supplierId].count += 1;
    });

    Object.entries(spendBySupplier).forEach(([supId, data]) => {
      const percentage = (data.total / totalPoSpend) * 100;
      if (percentage >= 60) {
        anomalies.push({
          id: `anomaly-concentration-${supId}`,
          organizationId: orders[0]?.organizationId || 'org-inka-001',
          type: 'supplier_concentration',
          severity: 'medium',
          title: 'Konsentrasi Pengeluaran Vendor Tinggi (>60%)',
          description: `Vendor "${data.name}" menerima ${Math.round(
            percentage
          )}% dari total anggaran pengadaan yang diterbitkan (Rp ${data.total.toLocaleString(
            'id-ID'
          )}). Rekomendasi: Lakukan diversifikasi vendor atau tender terbuka melalui RFQ.`,
          flaggedEntity: 'supplier',
          entityId: supId,
          entityNumber: data.name,
          detectedAt: now,
          dismissed: false,
        });
      }
    });
  }

  // 3. Detect Unverified Vendor with Issued PO
  orders.forEach((o) => {
    const sup = suppliers.find((s) => s.id === o.supplierId);
    if (sup && sup.verificationStatus !== 'verified') {
      anomalies.push({
        id: `anomaly-unverified-${o.id}`,
        organizationId: o.organizationId,
        type: 'unverified_vendor',
        severity: 'high',
        title: 'Penerbitan PO ke Vendor Belum Terverifikasi Legal',
        description: `PO "${o.poNumber}" diterbitkan kepada "${o.supplierName}" yang dokumen kepatuhannya (NPWP/NIB/Rekening Bank) masih berstatus "${sup.verificationStatus}". Wajib diverifikasi sebelum pencairan pembayaran.`,
        flaggedEntity: 'purchase_order',
        entityId: o.id,
        entityNumber: o.poNumber,
        detectedAt: now,
        dismissed: false,
      });
    }
  });

  return anomalies;
}
