/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'platform_admin'
  | 'organization_owner'
  | 'organization_admin'
  | 'requester'
  | 'approver'
  | 'procurement_officer'
  | 'finance'
  | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatarUrl?: string;
  jobTitle: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial';
  timezone: string;
  currency: string;
  address: string;
  taxNumber: string;
  phone: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  managerUserId: string;
  status: 'active' | 'inactive';
}

export interface CostCenter {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface Supplier {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  taxId: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
}

export interface CatalogItem {
  id: string;
  organizationId: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  defaultPrice: number;
  currency: string;
  status: 'active' | 'inactive';
}

export type PRStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'converted_to_po'
  | 'cancelled';

export interface PurchaseRequestItem {
  id: string;
  purchaseRequestId: string;
  catalogItemId?: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  lineTotal: number;
}

export interface ApprovalStepRule {
  id: string;
  stepOrder: number;
  stepName: string;
  approverRole: UserRole;
  approverUserId?: string; // Optional specific user assignment
  minimumAmount: number;
  maximumAmount?: number;
  isRequired: boolean;
  departmentCondition?: string; // e.g. applies only to specific department or all
}

export interface ApprovalWorkflow {
  id: string;
  organizationId: string;
  name: string;
  documentType: 'purchase_request' | 'purchase_order';
  status: 'active' | 'inactive';
  version: number;
  steps: ApprovalStepRule[];
}

export interface ApprovalInstance {
  id: string;
  organizationId: string;
  documentType: 'purchase_request' | 'purchase_order';
  documentId: string;
  stepOrder: number;
  stepName: string;
  requiredRole: UserRole;
  assignedUserId?: string;
  assignedUserName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decisionAt?: string;
  decisionByUserId?: string;
  decisionByUserName?: string;
  decisionReason?: string;
}

export interface PurchaseRequest {
  id: string;
  organizationId: string;
  requestNumber: string;
  requesterId: string;
  requesterName: string;
  departmentId: string;
  costCenterId: string;
  purpose: string;
  neededBy: string;
  deliveryLocation: string;
  currency: string;
  estimatedTotal: number;
  taxTotal: number;
  grandTotal: number;
  status: PRStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseRequestItem[];
  approvalInstances: ApprovalInstance[];
  currentStepOrder: number;
  rejectionReason?: string;
  generatedPoId?: string;
}

export type POStatus =
  | 'draft'
  | 'issued'
  | 'sent_to_supplier'
  | 'partially_received'
  | 'completed'
  | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  catalogItemId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  poNumber: string;
  purchaseRequestId?: string;
  purchaseRequestNumber?: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierAddress: string;
  createdBy: string;
  createdByName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  currency: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  status: POStatus;
  issuedAt?: string;
  items: PurchaseOrderItem[];
  meterai?: EMeteraiStamp;
}

export interface EMeteraiStamp {
  stamped: boolean;
  serialNumber: string; // e.g. MTR-2026-JKT-8894129
  stampedAt: string;
  signerName: string;
  signerRole: string;
  psreProvider: 'Peruri' | 'PrivyID' | 'VIDA';
  documentHash: string; // SHA-256 hash representation
  qrVerificationUrl: string;
  nominalThresholdEligible: boolean; // >= Rp 5.000.000 (UU Bea Meterai No. 10/2020)
}

// ========================
// 3-WAY RFQ (REQUEST FOR QUOTATION)
// ========================
export interface RFQItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
}

export interface RFQSupplierBid {
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  warrantyMonths: number;
  complianceScore: number; // 0-100
  overallScore: number; // 0-100 calculated
  status: 'recommended' | 'alternative' | 'rejected';
  quotationDocRef: string;
  notes?: string;
}

export interface RFQ {
  id: string;
  organizationId: string;
  rfqNumber: string;
  title: string;
  departmentId: string;
  departmentName: string;
  status: 'draft' | 'open_bidding' | 'evaluation' | 'awarded' | 'cancelled';
  items: RFQItem[];
  bids: RFQSupplierBid[];
  awardedSupplierId?: string;
  awardedReason?: string;
  targetBudget: number;
  createdAt: string;
  dueDate: string;
  linkedPrId?: string;
}

// ========================
// 3-WAY MATCHING (PO VS GRN VS INVOICE)
// ========================
export interface GoodsReceiptItem {
  poItemId: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  condition: 'good' | 'damaged' | 'incomplete';
}

export interface GoodsReceiptNote {
  id: string;
  organizationId: string;
  grnNumber: string; // e.g. GRN/2026/10/004
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  deliveryNoteNumber: string; // Nomor Surat Jalan Vendor
  receivedDate: string;
  receivedBy: string;
  warehouseLocation: string;
  items: GoodsReceiptItem[];
  notes?: string;
}

export interface VendorInvoice {
  id: string;
  organizationId: string;
  invoiceNumber: string; // Nomor Tagihan Vendor
  fakturPajakNumber: string; // 010.xxx e-Faktur Pajak
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'pending_verification' | 'matched' | 'discrepancy' | 'approved_for_payment' | 'paid';
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ThreeWayMatchResult {
  poId: string;
  poNumber: string;
  grnId?: string;
  grnNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  matchStatus: 'fully_matched' | 'quantity_mismatch' | 'price_variance' | 'grn_missing' | 'invoice_missing';
  quantityMatch: boolean;
  priceMatch: boolean;
  discrepancies: string[];
  readyForPayment: boolean;
}

// ========================
// FRAUD & ANOMALY DETECTION
// ========================
export type AnomalyType =
  | 'split_pr'
  | 'price_spike'
  | 'supplier_concentration'
  | 'unverified_vendor'
  | 'budget_exhaustion';

export interface ProcurementAnomaly {
  id: string;
  organizationId: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  flaggedEntity: 'purchase_request' | 'purchase_order' | 'supplier';
  entityId: string;
  entityNumber: string;
  detectedAt: string;
  dismissed: boolean;
  dismissedBy?: string;
  dismissedReason?: string;
}

export interface Budget {
  id: string;
  organizationId: string;
  name: string;
  departmentId: string;
  costCenterId?: string;
  fiscalYear: number;
  periodStart: string;
  periodEnd: string;
  allocatedAmount: number;
  committedAmount: number; // In active PRs / POs
  spentAmount: number; // In completed POs
  currency: string;
  status: 'active' | 'closed';
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType:
    | 'purchase_request'
    | 'purchase_order'
    | 'supplier'
    | 'budget'
    | 'workflow'
    | 'organization'
    | 'rfq'
    | 'goods_receipt'
    | 'vendor_invoice'
    | 'fraud_alert'
    | 'meterai';
  entityId: string;
  entityReference: string;
  details: string;
  beforeJson?: string;
  afterJson?: string;
  ipAddress: string;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  organizationId: string;
  userId: string;
  type: 'approval_request' | 'approval_granted' | 'approval_rejected' | 'po_issued' | 'budget_alert';
  title: string;
  message: string;
  documentId?: string;
  documentType?: 'purchase_request' | 'purchase_order';
  read: boolean;
  createdAt: string;
}
