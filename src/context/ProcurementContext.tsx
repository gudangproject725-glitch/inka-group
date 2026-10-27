/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ApprovalWorkflow,
  AuditLog,
  Budget,
  CatalogItem,
  CostCenter,
  Department,
  EMeteraiStamp,
  GoodsReceiptNote,
  InAppNotification,
  Organization,
  ProcurementAnomaly,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseRequest,
  PurchaseRequestItem,
  RFQ,
  RFQSupplierBid,
  Supplier,
  ThreeWayMatchResult,
  User,
  VendorInvoice,
} from '../types/procurement';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BUDGETS,
  INITIAL_CATALOG,
  INITIAL_COST_CENTERS,
  INITIAL_DEPARTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORGANIZATION,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
  INITIAL_WORKFLOWS,
} from '../data/seedData';
import {
  INITIAL_ANOMALIES,
  INITIAL_GOODS_RECEIPTS,
  INITIAL_RFQS,
  INITIAL_SUPPLIER_LEGAL_DOCS,
  INITIAL_VENDOR_INVOICES,
} from '../data/advancedSeedData';
import {
  calculateOrderTotals,
  canConvertPrToPo,
  canUserApprove,
  detectProcurementAnomalies,
  evaluateRfqBids,
  evaluateThreeWayMatch,
  evaluateWorkflowSteps,
  generateDocumentNumber,
  generateEMeteraiStamp,
  isEligibleForEMeterai,
  processApprovalDecision,
} from '../domain/workflow';

interface CreatePrInput {
  purpose: string;
  departmentId: string;
  costCenterId: string;
  neededBy: string;
  deliveryLocation: string;
  items: Array<{
    catalogItemId?: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
  }>;
  submitImmediately: boolean;
}

interface CreatePoInput {
  purchaseRequestId?: string;
  supplierId: string;
  paymentTerms: string;
  expectedDeliveryDate: string;
  notes?: string;
  items: Array<{
    catalogItemId?: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
}

interface CreateRfqInput {
  title: string;
  departmentId: string;
  targetBudget: number;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    targetPrice?: number;
  }>;
}

interface ProcurementContextType {
  // Organization & Context
  organization: Organization;
  currentUser: User;
  users: User[];
  setCurrentUserById: (userId: string) => void;
  updateOrganization: (org: Partial<Organization>) => void;

  // Master Data
  departments: Department[];
  costCenters: CostCenter[];
  suppliers: Supplier[];
  catalogItems: CatalogItem[];
  workflows: ApprovalWorkflow[];
  budgets: Budget[];

  // Master Data Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'organizationId'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  verifySupplierComplianceDoc: (supplierId: string, docType: string, verified: boolean) => void;
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'organizationId'>) => void;
  updateCatalogItem: (id: string, item: Partial<CatalogItem>) => void;
  updateWorkflow: (workflow: ApprovalWorkflow) => void;

  // Transactions (PR & PO)
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  auditLogs: AuditLog[];
  notifications: InAppNotification[];

  // PR / PO Actions
  createPurchaseRequest: (input: CreatePrInput) => { pr: PurchaseRequest; error?: string };
  updatePurchaseRequestDraft: (id: string, input: Partial<CreatePrInput>) => { error?: string };
  submitPurchaseRequest: (id: string) => { error?: string };
  cancelPurchaseRequest: (id: string) => { error?: string };
  decideApproval: (
    prId: string,
    decision: 'approved' | 'rejected',
    reason?: string
  ) => { error?: string };
  convertPrToPurchaseOrder: (input: CreatePoInput) => { po: PurchaseOrder; error?: string };
  updatePoStatus: (poId: string, status: PurchaseOrder['status']) => void;
  stampPoWithMeterai: (
    poId: string,
    signerName?: string,
    signerRole?: string,
    provider?: 'Peruri' | 'PrivyID' | 'VIDA'
  ) => { success: boolean; meterai?: EMeteraiStamp; error?: string };

  // 3-Way RFQ
  rfqs: RFQ[];
  createRfq: (input: CreateRfqInput) => RFQ;
  submitRfqBid: (rfqId: string, bid: Omit<RFQSupplierBid, 'overallScore' | 'status'>) => void;
  awardRfq: (rfqId: string, supplierId: string, reason: string) => void;

  // 3-Way Matching (GRN & Invoices)
  goodsReceiptNotes: GoodsReceiptNote[];
  vendorInvoices: VendorInvoice[];
  createGoodsReceipt: (input: Omit<GoodsReceiptNote, 'id' | 'organizationId' | 'grnNumber'>) => GoodsReceiptNote;
  createVendorInvoice: (input: Omit<VendorInvoice, 'id' | 'organizationId' | 'status'>) => VendorInvoice;
  approveInvoiceForPayment: (invoiceId: string) => void;
  getThreeWayMatchForPo: (poId: string) => ThreeWayMatchResult;

  // Fraud & Anomaly Radar
  anomalies: ProcurementAnomaly[];
  dismissAnomaly: (anomalyId: string, reason: string) => void;
  refreshAnomalies: () => void;

  // Vendor Portal State
  portalSupplierId: string | null;
  setPortalSupplierId: (supplierId: string | null) => void;

  // Audit and System Actions
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToDefaultData: () => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

const STORAGE_KEY = 'inka_procurement_state_v2';

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_org`);
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATION;
  });

  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_curr_user`) || 'usr-andi';
  });

  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [costCenters] = useState<CostCenter[]>(INITIAL_COST_CENTERS);

  // Initialize Suppliers with Compliance Documents
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
    if (saved) return JSON.parse(saved);
    return INITIAL_SUPPLIERS.map((s) => {
      const legalInfo = INITIAL_SUPPLIER_LEGAL_DOCS[s.id] || {
        verificationStatus: 'verified',
        bankName: 'Bank Central Asia (BCA)',
        bankAccountNumber: '001-234-5678',
        bankAccountHolder: s.name,
        portalAccessEmail: s.email,
        legalDocs: [
          {
            type: 'NPWP' as const,
            docNumber: s.taxId,
            verified: true,
            verifiedAt: '2026-01-10T10:00:00Z',
          },
          {
            type: 'NIB' as const,
            docNumber: '9120008877665',
            verified: true,
            verifiedAt: '2026-01-10T10:30:00Z',
          },
        ],
      };
      return {
        ...s,
        ...legalInfo,
      };
    });
  });

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_catalog`);
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });

  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_workflows`);
    return saved ? JSON.parse(saved) : INITIAL_WORKFLOWS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prs`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_REQUESTS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pos`);
    if (saved) return JSON.parse(saved);
    // Stamp the first PO by default with e-Meterai for immediate visual confidence
    return INITIAL_PURCHASE_ORDERS.map((po) => {
      if (po.poNumber === 'PO-2026-0001' && isEligibleForEMeterai(po.grandTotal)) {
        return {
          ...po,
          meterai: generateEMeteraiStamp(po, 'Dewi Kartika', 'Senior Procurement Specialist', 'Peruri'),
        };
      }
      return po;
    });
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Advanced States: RFQ, Goods Receipts, Invoices, Anomalies, Vendor Portal
  const [rfqs, setRfqs] = useState<RFQ[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rfqs`);
    return saved ? JSON.parse(saved) : INITIAL_RFQS;
  });

  const [goodsReceiptNotes, setGoodsReceiptNotes] = useState<GoodsReceiptNote[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_grns`);
    return saved ? JSON.parse(saved) : INITIAL_GOODS_RECEIPTS;
  });

  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_VENDOR_INVOICES;
  });

  const [anomalies, setAnomalies] = useState<ProcurementAnomaly[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_anomalies`);
    return saved ? JSON.parse(saved) : INITIAL_ANOMALIES;
  });

  const [portalSupplierId, setPortalSupplierId] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_portal_sup`) || null;
  });

  // Active Current User
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_org`, JSON.stringify(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_curr_user`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_catalog`, JSON.stringify(catalogItems));
  }, [catalogItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_workflows`, JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prs`, JSON.stringify(purchaseRequests));
  }, [purchaseRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pos`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rfqs`, JSON.stringify(rfqs));
  }, [rfqs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_grns`, JSON.stringify(goodsReceiptNotes));
  }, [goodsReceiptNotes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(vendorInvoices));
  }, [vendorInvoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_anomalies`, JSON.stringify(anomalies));
  }, [anomalies]);

  useEffect(() => {
    if (portalSupplierId) {
      localStorage.setItem(`${STORAGE_KEY}_portal_sup`, portalSupplierId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_portal_sup`);
    }
  }, [portalSupplierId]);

  // Helper: Append Audit Log
  const logAudit = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    entityReference: string,
    details: string,
    before?: any,
    after?: any
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: organization.id,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      entityReference,
      details,
      beforeJson: before ? JSON.stringify(before) : undefined,
      afterJson: after ? JSON.stringify(after) : undefined,
      ipAddress: '10.240.12.89',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper: Append In-App Notification
  const notifyUser = (
    userId: string,
    type: InAppNotification['type'],
    title: string,
    message: string,
    documentId?: string,
    documentType?: 'purchase_request' | 'purchase_order'
  ) => {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: organization.id,
      userId,
      type,
      title,
      message,
      documentId,
      documentType,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Organization & User Actions
  const setCurrentUserById = (userId: string) => {
    setCurrentUserId(userId);
  };

  const updateOrganization = (orgUpdates: Partial<Organization>) => {
    setOrganization((prev) => {
      const updated = { ...prev, ...orgUpdates };
      logAudit(
        'ORGANIZATION_UPDATED',
        'organization',
        prev.id,
        prev.name,
        'Memperbarui data profil organisasi.',
        prev,
        updated
      );
      return updated;
    });
  };

  // Master Data Actions
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'organizationId'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      organizationId: organization.id,
      verificationStatus: supplierData.verificationStatus || 'verified',
      bankName: supplierData.bankName || 'Bank Mandiri',
      bankAccountNumber: supplierData.bankAccountNumber || '123-456-7890',
      bankAccountHolder: supplierData.bankAccountHolder || supplierData.name,
      legalDocs: supplierData.legalDocs || [],
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    logAudit(
      'SUPPLIER_CREATED',
      'supplier',
      newSupplier.id,
      newSupplier.name,
      `Menambahkan vendor rekanan baru: ${newSupplier.name} (${newSupplier.code}).`,
      undefined,
      newSupplier
    );
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          logAudit(
            'SUPPLIER_UPDATED',
            'supplier',
            id,
            s.name,
            `Memperbarui informasi vendor rekanan: ${s.name}.`,
            s,
            updated
          );
          return updated;
        }
        return s;
      })
    );
  };

  const verifySupplierComplianceDoc = (supplierId: string, docType: string, verified: boolean) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const updatedDocs = s.legalDocs.map((doc) => {
            if (doc.type === docType) {
              return {
                ...doc,
                verified,
                verifiedAt: verified ? new Date().toISOString() : undefined,
              };
            }
            return doc;
          });
          const allVerified = updatedDocs.every((d) => d.verified);
          const updated: Supplier = {
            ...s,
            legalDocs: updatedDocs,
            verificationStatus: allVerified ? 'verified' : 'action_required',
          };
          logAudit(
            'SUPPLIER_COMPLIANCE_VERIFIED',
            'supplier',
            s.id,
            s.name,
            `Verifikasi kepatuhan dokumen ${docType} untuk vendor ${s.name} diubah menjadi: ${verified ? 'Terverifikasi' : 'Belum Terverifikasi'}.`
          );
          return updated;
        }
        return s;
      })
    );
  };

  const addCatalogItem = (itemData: Omit<CatalogItem, 'id' | 'organizationId'>) => {
    const newItem: CatalogItem = {
      ...itemData,
      id: `cat-${Date.now()}`,
      organizationId: organization.id,
    };
    setCatalogItems((prev) => [...prev, newItem]);
  };

  const updateCatalogItem = (id: string, updates: Partial<CatalogItem>) => {
    setCatalogItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const updateWorkflow = (updatedWorkflow: ApprovalWorkflow) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id === updatedWorkflow.id) {
          logAudit(
            'WORKFLOW_UPDATED',
            'workflow',
            wf.id,
            wf.name,
            `Memperbarui aturan alur persetujuan: ${wf.name} (v${updatedWorkflow.version}).`,
            wf,
            updatedWorkflow
          );
          return updatedWorkflow;
        }
        return wf;
      })
    );
  };

  // Transaction: Create Purchase Request
  const createPurchaseRequest = (input: CreatePrInput): { pr: PurchaseRequest; error?: string } => {
    const nextPrNumber = generateDocumentNumber('PR', purchaseRequests.length + 1);
    const totals = calculateOrderTotals(input.items);
    const activeWorkflow = workflows.find(
      (w) => w.documentType === 'purchase_request' && w.status === 'active'
    );

    const steps = activeWorkflow
      ? evaluateWorkflowSteps(activeWorkflow, totals.grandTotal, input.departmentId)
      : [];

    const now = new Date().toISOString();
    const newPrId = `pr-${Date.now()}`;

    const newPr: PurchaseRequest = {
      id: newPrId,
      organizationId: organization.id,
      requestNumber: nextPrNumber,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      departmentId: input.departmentId,
      costCenterId: input.costCenterId,
      purpose: input.purpose,
      neededBy: input.neededBy,
      deliveryLocation: input.deliveryLocation,
      currency: 'IDR',
      estimatedTotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      status: input.submitImmediately ? 'pending_approval' : 'draft',
      submittedAt: input.submitImmediately ? now : undefined,
      createdAt: now,
      updatedAt: now,
      items: input.items.map((item, idx) => ({
        id: `pri-${Date.now()}-${idx + 1}`,
        purchaseRequestId: newPrId,
        catalogItemId: item.catalogItemId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        estimatedUnitPrice: item.estimatedUnitPrice,
        lineTotal: Math.round(item.quantity * item.estimatedUnitPrice),
      })),
      approvalInstances: steps.map((s) => ({ ...s, documentId: newPrId })),
      currentStepOrder: 1,
    };

    setPurchaseRequests((prev) => [newPr, ...prev]);

    logAudit(
      input.submitImmediately ? 'PR_SUBMITTED' : 'PR_CREATED_DRAFT',
      'purchase_request',
      newPr.id,
      newPr.requestNumber,
      `Membuat pengajuan PR baru: ${newPr.requestNumber} senilai Rp ${totals.grandTotal.toLocaleString(
        'id-ID'
      )}.`,
      undefined,
      newPr
    );

    // If submitted, notify the first approver
    if (input.submitImmediately && steps.length > 0) {
      const firstStep = steps[0];
      const eligibleApprovers = users.filter((u) => u.role === firstStep.requiredRole);
      eligibleApprovers.forEach((appr) => {
        notifyUser(
          appr.id,
          'approval_request',
          `Permohonan Persetujuan: ${newPr.requestNumber}`,
          `${currentUser.name} mengajukan PR ${newPr.requestNumber} senilai Rp ${totals.grandTotal.toLocaleString(
            'id-ID'
          )}. Menunggu review Level 1 Anda.`,
          newPr.id,
          'purchase_request'
        );
      });
    }

    // Trigger Anomaly Scan automatically in background
    setTimeout(() => {
      refreshAnomalies();
    }, 100);

    return { pr: newPr };
  };

  const updatePurchaseRequestDraft = (
    id: string,
    input: Partial<CreatePrInput>
  ): { error?: string } => {
    const existing = purchaseRequests.find((p) => p.id === id);
    if (!existing) return { error: 'Purchase Request tidak ditemukan.' };
    if (existing.status !== 'draft') {
      return { error: 'Hanya draf PR yang dapat diubah.' };
    }

    let items = existing.items;
    let totals = {
      subtotal: existing.estimatedTotal,
      taxTotal: existing.taxTotal,
      grandTotal: existing.grandTotal,
    };

    if (input.items) {
      totals = calculateOrderTotals(input.items);
      items = input.items.map((item, idx) => ({
        id: `pri-${Date.now()}-${idx + 1}`,
        purchaseRequestId: id,
        catalogItemId: item.catalogItemId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        estimatedUnitPrice: item.estimatedUnitPrice,
        lineTotal: Math.round(item.quantity * item.estimatedUnitPrice),
      }));
    }

    const updated: PurchaseRequest = {
      ...existing,
      purpose: input.purpose ?? existing.purpose,
      departmentId: input.departmentId ?? existing.departmentId,
      costCenterId: input.costCenterId ?? existing.costCenterId,
      neededBy: input.neededBy ?? existing.neededBy,
      deliveryLocation: input.deliveryLocation ?? existing.deliveryLocation,
      estimatedTotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      items,
      updatedAt: new Date().toISOString(),
    };

    setPurchaseRequests((prev) => prev.map((pr) => (pr.id === id ? updated : pr)));
    return {};
  };

  const submitPurchaseRequest = (id: string): { error?: string } => {
    const pr = purchaseRequests.find((p) => p.id === id);
    if (!pr) return { error: 'Purchase Request tidak ditemukan.' };
    if (pr.status !== 'draft' && pr.status !== 'rejected') {
      return { error: 'Dokumen ini sudah dalam proses approval atau telah disetujui.' };
    }

    const activeWorkflow = workflows.find(
      (w) => w.documentType === 'purchase_request' && w.status === 'active'
    );
    const steps = activeWorkflow
      ? evaluateWorkflowSteps(activeWorkflow, pr.grandTotal, pr.departmentId)
      : [];

    const now = new Date().toISOString();
    const updated: PurchaseRequest = {
      ...pr,
      status: 'pending_approval',
      submittedAt: now,
      updatedAt: now,
      approvalInstances: steps.map((s) => ({ ...s, documentId: pr.id, status: 'pending' })),
      currentStepOrder: 1,
      rejectionReason: undefined,
    };

    setPurchaseRequests((prev) => prev.map((p) => (p.id === id ? updated : p)));
    logAudit(
      'PR_SUBMITTED',
      'purchase_request',
      pr.id,
      pr.requestNumber,
      `Mengirimkan ${pr.requestNumber} untuk proses persetujuan resmi.`
    );
    return {};
  };

  const cancelPurchaseRequest = (id: string): { error?: string } => {
    const pr = purchaseRequests.find((p) => p.id === id);
    if (!pr) return { error: 'PR tidak ditemukan.' };
    if (pr.status === 'converted_to_po') {
      return { error: 'PR yang sudah dikonversi menjadi PO tidak dapat dibatalkan secara sepihak.' };
    }

    const updated: PurchaseRequest = {
      ...pr,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    setPurchaseRequests((prev) => prev.map((p) => (p.id === id ? updated : p)));
    logAudit(
      'PR_CANCELLED',
      'purchase_request',
      pr.id,
      pr.requestNumber,
      `Membatalkan pengajuan ${pr.requestNumber}.`
    );
    return {};
  };

  const decideApproval = (
    prId: string,
    decision: 'approved' | 'rejected',
    reason?: string
  ): { error?: string } => {
    const pr = purchaseRequests.find((p) => p.id === prId);
    if (!pr) return { error: 'Purchase Request tidak ditemukan.' };

    const { updatedRequest, error } = processApprovalDecision(pr, currentUser, decision, reason);
    if (error) return { error };

    setPurchaseRequests((prev) => prev.map((p) => (p.id === prId ? updatedRequest : p)));

    logAudit(
      decision === 'approved' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
      'purchase_request',
      pr.id,
      pr.requestNumber,
      decision === 'approved'
        ? `Menyetujui tahap persetujuan pada ${pr.requestNumber}. Status dokumen sekarang: ${updatedRequest.status}.`
        : `Menolak ${pr.requestNumber}. Alasan: ${reason}`,
      pr,
      updatedRequest
    );

    // Notify requester
    notifyUser(
      pr.requesterId,
      decision === 'approved' ? 'approval_granted' : 'approval_rejected',
      decision === 'approved'
        ? `Persetujuan Diberikan: ${pr.requestNumber}`
        : `Pengajuan Ditolak: ${pr.requestNumber}`,
      decision === 'approved'
        ? `${currentUser.name} telah menyetujui pengajuan Anda. Status saat ini: ${updatedRequest.status}.`
        : `${currentUser.name} menolak pengajuan Anda. Alasan: "${reason}".`,
      pr.id,
      'purchase_request'
    );

    return {};
  };

  const convertPrToPurchaseOrder = (input: CreatePoInput): { po: PurchaseOrder; error?: string } => {
    const sourcePr = purchaseRequests.find((p) => p.id === input.purchaseRequestId);
    if (sourcePr) {
      const check = canConvertPrToPo(sourcePr);
      if (!check.allowed) return { po: null as any, error: check.reason };
    }

    const targetSupplier = suppliers.find((s) => s.id === input.supplierId);
    if (!targetSupplier) return { po: null as any, error: 'Vendor supplier tidak ditemukan.' };

    const nextPoNumber = generateDocumentNumber('PO', purchaseOrders.length + 1);
    const totals = calculateOrderTotals(input.items);
    const now = new Date().toISOString();
    const poId = `po-${Date.now()}`;

    const newPo: PurchaseOrder = {
      id: poId,
      organizationId: organization.id,
      poNumber: nextPoNumber,
      purchaseRequestId: sourcePr?.id,
      purchaseRequestNumber: sourcePr?.requestNumber,
      supplierId: targetSupplier.id,
      supplierName: targetSupplier.name,
      supplierEmail: targetSupplier.email,
      supplierAddress: targetSupplier.address,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      orderDate: now.split('T')[0],
      expectedDeliveryDate: input.expectedDeliveryDate,
      paymentTerms: input.paymentTerms,
      currency: 'IDR',
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      notes: input.notes,
      status: 'issued',
      issuedAt: now,
      items: input.items.map((item, idx) => ({
        id: `poi-${Date.now()}-${idx + 1}`,
        purchaseOrderId: poId,
        catalogItemId: item.catalogItemId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal: Math.round(item.quantity * item.unitPrice),
      })),
    };

    // Auto-stamp e-Meterai if eligible (>= Rp 5M)
    if (isEligibleForEMeterai(totals.grandTotal)) {
      newPo.meterai = generateEMeteraiStamp(
        newPo,
        currentUser.name,
        currentUser.jobTitle || 'Procurement Specialist',
        'Peruri'
      );
    }

    setPurchaseOrders((prev) => [newPo, ...prev]);

    // Update PR if converted
    if (sourcePr) {
      setPurchaseRequests((prev) =>
        prev.map((pr) =>
          pr.id === sourcePr.id
            ? {
                ...pr,
                status: 'converted_to_po',
                generatedPoId: newPo.id,
                updatedAt: now,
              }
            : pr
        )
      );
    }

    logAudit(
      'PO_ISSUED',
      'purchase_order',
      newPo.id,
      newPo.poNumber,
      `Menerbitkan Purchase Order resmi ${newPo.poNumber} kepada ${targetSupplier.name} senilai Rp ${totals.grandTotal.toLocaleString(
        'id-ID'
      )}.`
    );

    // Scan for anomalies
    setTimeout(() => {
      refreshAnomalies();
    }, 100);

    return { po: newPo };
  };

  const updatePoStatus = (poId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          const updated = { ...po, status };
          logAudit(
            'PO_STATUS_CHANGED',
            'purchase_order',
            po.id,
            po.poNumber,
            `Memperbarui status PO ${po.poNumber} menjadi: ${status}.`
          );
          return updated;
        }
        return po;
      })
    );
  };

  // 1. E-Meterai Action
  const stampPoWithMeterai = (
    poId: string,
    signerName?: string,
    signerRole?: string,
    provider: 'Peruri' | 'PrivyID' | 'VIDA' = 'Peruri'
  ): { success: boolean; meterai?: EMeteraiStamp; error?: string } => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return { success: false, error: 'Purchase Order tidak ditemukan.' };
    if (!isEligibleForEMeterai(po.grandTotal)) {
      return {
        success: false,
        error:
          'Nominal PO di bawah Rp 5.000.000 (tidak wajib bea meterai sesuai UU Bea Meterai No. 10/2020).',
      };
    }

    const stamp = generateEMeteraiStamp(
      po,
      signerName || currentUser.name,
      signerRole || currentUser.jobTitle || 'Procurement Specialist',
      provider
    );

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, meterai: stamp } : p))
    );

    logAudit(
      'METERAI_STAMPED',
      'meterai',
      po.id,
      po.poNumber,
      `Membubuhkan e-Meterai resmi (${provider}) No. Seri: ${stamp.serialNumber} pada PO ${po.poNumber}.`
    );

    return { success: true, meterai: stamp };
  };

  // 2. 3-Way RFQ Actions
  const createRfq = (input: CreateRfqInput): RFQ => {
    const nextRfqNumber = generateDocumentNumber('RFQ', rfqs.length + 1);
    const newRfqId = `rfq-${Date.now()}`;
    const dept = departments.find((d) => d.id === input.departmentId);

    const newRfq: RFQ = {
      id: newRfqId,
      organizationId: organization.id,
      rfqNumber: nextRfqNumber,
      title: input.title,
      departmentId: input.departmentId,
      departmentName: dept?.name || 'Departemen Terkait',
      status: 'open_bidding',
      targetBudget: input.targetBudget,
      createdAt: new Date().toISOString(),
      dueDate: input.dueDate,
      items: input.items.map((it, idx) => ({
        id: `rfqi-${Date.now()}-${idx + 1}`,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        targetPrice: it.targetPrice,
      })),
      bids: [],
    };

    setRfqs((prev) => [newRfq, ...prev]);
    logAudit(
      'RFQ_CREATED',
      'rfq',
      newRfq.id,
      newRfq.rfqNumber,
      `Membuka tender penawaran harga vendor (3-Way RFQ): ${newRfq.rfqNumber} - ${newRfq.title}.`
    );
    return newRfq;
  };

  const submitRfqBid = (
    rfqId: string,
    bidInput: Omit<RFQSupplierBid, 'overallScore' | 'status'>
  ) => {
    setRfqs((prev) =>
      prev.map((rfq) => {
        if (rfq.id === rfqId) {
          const existingBids = rfq.bids.filter((b) => b.supplierId !== bidInput.supplierId);
          const rawBids: RFQSupplierBid[] = [
            ...existingBids,
            { ...bidInput, overallScore: 0, status: 'alternative' },
          ];
          const rankedBids = evaluateRfqBids(rawBids);

          logAudit(
            'RFQ_BID_SUBMITTED',
            'rfq',
            rfq.id,
            rfq.rfqNumber,
            `Menerima penawaran harga dari ${bidInput.supplierName} senilai Rp ${bidInput.totalPrice.toLocaleString(
              'id-ID'
            )}.`
          );

          return {
            ...rfq,
            status: 'evaluation',
            bids: rankedBids,
          };
        }
        return rfq;
      })
    );
  };

  const awardRfq = (rfqId: string, supplierId: string, reason: string) => {
    setRfqs((prev) =>
      prev.map((rfq) => {
        if (rfq.id === rfqId) {
          const sup = suppliers.find((s) => s.id === supplierId);
          logAudit(
            'RFQ_AWARDED',
            'rfq',
            rfq.id,
            rfq.rfqNumber,
            `Menetapkan pemenang tender ${rfq.rfqNumber}: ${sup?.name || supplierId}. Catatan: ${reason}`
          );
          return {
            ...rfq,
            status: 'awarded',
            awardedSupplierId: supplierId,
            awardedReason: reason,
          };
        }
        return rfq;
      })
    );
  };

  // 3. 3-Way Matching Actions
  const createGoodsReceipt = (
    input: Omit<GoodsReceiptNote, 'id' | 'organizationId' | 'grnNumber'>
  ): GoodsReceiptNote => {
    const nextGrnNumber = generateDocumentNumber('GRN', goodsReceiptNotes.length + 1);
    const grnId = `grn-${Date.now()}`;

    const newGrn: GoodsReceiptNote = {
      ...input,
      id: grnId,
      organizationId: organization.id,
      grnNumber: nextGrnNumber,
    };

    setGoodsReceiptNotes((prev) => [newGrn, ...prev]);
    logAudit(
      'GRN_CREATED',
      'goods_receipt',
      newGrn.id,
      newGrn.grnNumber,
      `Penerimaan barang fisik (Surat Jalan: ${newGrn.deliveryNoteNumber}) untuk ${newGrn.poNumber} oleh ${newGrn.receivedBy}.`
    );
    return newGrn;
  };

  const createVendorInvoice = (
    input: Omit<VendorInvoice, 'id' | 'organizationId' | 'status'>
  ): VendorInvoice => {
    const invId = `inv-${Date.now()}`;
    const newInv: VendorInvoice = {
      ...input,
      id: invId,
      organizationId: organization.id,
      status: 'pending_verification',
    };

    setVendorInvoices((prev) => [newInv, ...prev]);
    logAudit(
      'VENDOR_INVOICE_RECORDED',
      'vendor_invoice',
      newInv.id,
      newInv.invoiceNumber,
      `Pencatatan tagihan faktur vendor ${newInv.invoiceNumber} (e-Faktur: ${newInv.fakturPajakNumber}) senilai Rp ${newInv.totalAmount.toLocaleString(
        'id-ID'
      )}.`
    );
    return newInv;
  };

  const approveInvoiceForPayment = (invoiceId: string) => {
    setVendorInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const updated: VendorInvoice = {
            ...inv,
            status: 'approved_for_payment',
            verifiedAt: new Date().toISOString(),
            verifiedBy: `${currentUser.name} (${currentUser.jobTitle})`,
          };
          logAudit(
            'INVOICE_APPROVED_PAYMENT',
            'vendor_invoice',
            inv.id,
            inv.invoiceNumber,
            `Persetujuan pembayaran tagihan ${inv.invoiceNumber} dirilis oleh ${currentUser.name}.`
          );
          return updated;
        }
        return inv;
      })
    );
  };

  const getThreeWayMatchForPo = (poId: string): ThreeWayMatchResult => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) {
      return {
        poId,
        poNumber: 'UNKNOWN',
        matchStatus: 'grn_missing',
        quantityMatch: false,
        priceMatch: false,
        discrepancies: ['Purchase Order tidak ditemukan di sistem.'],
        readyForPayment: false,
      };
    }
    const grn = goodsReceiptNotes.find((g) => g.poId === poId);
    const invoice = vendorInvoices.find((i) => i.poId === poId);
    return evaluateThreeWayMatch(po, grn, invoice);
  };

  // 4. Fraud & Anomaly Radar Actions
  const dismissAnomaly = (anomalyId: string, reason: string) => {
    setAnomalies((prev) =>
      prev.map((a) => {
        if (a.id === anomalyId) {
          logAudit(
            'FRAUD_ANOMALY_DISMISSED',
            'fraud_alert',
            a.id,
            a.entityNumber,
            `Peringatan risiko "${a.title}" diselesaikan/ditandai aman oleh ${currentUser.name}. Alasan: ${reason}`
          );
          return {
            ...a,
            dismissed: true,
            dismissedBy: currentUser.name,
            dismissedReason: reason,
          };
        }
        return a;
      })
    );
  };

  const refreshAnomalies = () => {
    const detected = detectProcurementAnomalies(purchaseRequests, purchaseOrders, suppliers);
    setAnomalies((prev) => {
      // Preserve dismissed ones
      const dismissedIds = new Set(prev.filter((p) => p.dismissed).map((p) => p.id));
      const newlyFound = detected.filter((d) => !dismissedIds.has(d.id));
      const previouslyDismissed = prev.filter((p) => p.dismissed);
      return [...newlyFound, ...previouslyDismissed];
    });
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // System Reset
  const resetToDefaultData = () => {
    localStorage.clear();
    setOrganization(INITIAL_ORGANIZATION);
    setCurrentUserId('usr-andi');
    setSuppliers(
      INITIAL_SUPPLIERS.map((s) => ({
        ...s,
        ...(INITIAL_SUPPLIER_LEGAL_DOCS[s.id] || {
          verificationStatus: 'verified',
          bankName: 'Bank Central Asia',
          bankAccountNumber: '001-234-5678',
          bankAccountHolder: s.name,
          legalDocs: [],
        }),
      }))
    );
    setCatalogItems(INITIAL_CATALOG);
    setWorkflows(INITIAL_WORKFLOWS);
    setBudgets(INITIAL_BUDGETS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setPurchaseOrders(
      INITIAL_PURCHASE_ORDERS.map((po) => {
        if (po.poNumber === 'PO-2026-0001') {
          return {
            ...po,
            meterai: generateEMeteraiStamp(
              po,
              'Dewi Kartika',
              'Senior Procurement Specialist',
              'Peruri'
            ),
          };
        }
        return po;
      })
    );
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRfqs(INITIAL_RFQS);
    setGoodsReceiptNotes(INITIAL_GOODS_RECEIPTS);
    setVendorInvoices(INITIAL_VENDOR_INVOICES);
    setAnomalies(INITIAL_ANOMALIES);
    setPortalSupplierId(null);
  };

  return (
    <ProcurementContext.Provider
      value={{
        organization,
        currentUser,
        users,
        setCurrentUserById,
        updateOrganization,
        departments,
        costCenters,
        suppliers,
        catalogItems,
        workflows,
        budgets,
        addSupplier,
        updateSupplier,
        verifySupplierComplianceDoc,
        addCatalogItem,
        updateCatalogItem,
        updateWorkflow,
        purchaseRequests,
        purchaseOrders,
        auditLogs,
        notifications,
        createPurchaseRequest,
        updatePurchaseRequestDraft,
        submitPurchaseRequest,
        cancelPurchaseRequest,
        decideApproval,
        convertPrToPurchaseOrder,
        updatePoStatus,
        stampPoWithMeterai,
        rfqs,
        createRfq,
        submitRfqBid,
        awardRfq,
        goodsReceiptNotes,
        vendorInvoices,
        createGoodsReceipt,
        createVendorInvoice,
        approveInvoiceForPayment,
        getThreeWayMatchForPo,
        anomalies,
        dismissAnomaly,
        refreshAnomalies,
        portalSupplierId,
        setPortalSupplierId,
        markNotificationRead,
        clearAllNotifications,
        resetToDefaultData,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};
