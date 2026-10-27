/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isEligibleForEMeterai,
  generateEMeteraiStamp,
  evaluateThreeWayMatch,
  evaluateRfqBids,
  detectProcurementAnomalies,
} from './workflow';
import {
  GoodsReceiptNote,
  PurchaseOrder,
  PurchaseRequest,
  RFQSupplierBid,
  Supplier,
  VendorInvoice,
} from '../types/procurement';

test('isEligibleForEMeterai correctly enforces UU No. 10/2020 Rp 5.000.000 threshold', () => {
  assert.equal(isEligibleForEMeterai(4999999), false);
  assert.equal(isEligibleForEMeterai(5000000), true);
  assert.equal(isEligibleForEMeterai(25000000), true);
});

test('generateEMeteraiStamp creates valid stamp certificate with hash and serial', () => {
  const dummyPo: PurchaseOrder = {
    id: 'po-101',
    organizationId: 'org-inka-001',
    poNumber: 'PO-2026-0001',
    supplierId: 'sup-1',
    supplierName: 'PT Mitra Solusi Mandiri',
    supplierEmail: 'sales@mitrasolusi.co.id',
    supplierAddress: 'Jakarta',
    createdBy: 'user-proc',
    createdByName: 'Dewi Kartika',
    orderDate: '2026-10-27',
    expectedDeliveryDate: '2026-11-10',
    paymentTerms: 'Net 30 Days',
    currency: 'IDR',
    subtotal: 58500000,
    taxTotal: 6435000,
    grandTotal: 64935000,
    status: 'issued',
    items: [],
  };

  const stamp = generateEMeteraiStamp(dummyPo, 'Dewi Kartika', 'Procurement Specialist', 'Peruri');
  assert.equal(stamp.stamped, true);
  assert.equal(stamp.psreProvider, 'Peruri');
  assert.match(stamp.serialNumber, /^MTR-2026-JKT-\d{7}$/);
  assert.ok(stamp.documentHash.length >= 16);
  assert.ok(stamp.qrVerificationUrl.includes(stamp.serialNumber));
  assert.equal(stamp.nominalThresholdEligible, true);
});

test('evaluateThreeWayMatch validates full match and reports discrepancies', () => {
  const po: PurchaseOrder = {
    id: 'po-match-1',
    organizationId: 'org-inka-001',
    poNumber: 'PO-2026-0010',
    supplierId: 'sup-1',
    supplierName: 'PT Teknologi Maju',
    supplierEmail: 'info@tekno.co.id',
    supplierAddress: 'Jakarta',
    createdBy: 'user-1',
    createdByName: 'Dewi',
    orderDate: '2026-10-20',
    expectedDeliveryDate: '2026-10-25',
    paymentTerms: 'Net 30',
    currency: 'IDR',
    subtotal: 20000000,
    taxTotal: 2200000,
    grandTotal: 22200000,
    status: 'issued',
    items: [
      {
        id: 'item-1',
        purchaseOrderId: 'po-match-1',
        description: 'Dell Latitude 5440',
        quantity: 2,
        unit: 'Unit',
        unitPrice: 10000000,
        lineTotal: 20000000,
      },
    ],
  };

  // Case 1: Missing GRN
  const res1 = evaluateThreeWayMatch(po);
  assert.equal(res1.matchStatus, 'grn_missing');
  assert.equal(res1.readyForPayment, false);

  // Case 2: GRN present, missing Invoice
  const grnGood: GoodsReceiptNote = {
    id: 'grn-1',
    organizationId: 'org-inka-001',
    grnNumber: 'GRN-2026-0001',
    poId: 'po-match-1',
    poNumber: 'PO-2026-0010',
    supplierId: 'sup-1',
    supplierName: 'PT Teknologi Maju',
    deliveryNoteNumber: 'SJ-VENDOR-991',
    receivedDate: '2026-10-24',
    receivedBy: 'Gudang Head',
    warehouseLocation: 'Warehouse Jakarta Barat',
    items: [
      {
        poItemId: 'item-1',
        description: 'Dell Latitude 5440',
        orderedQty: 2,
        receivedQty: 2,
        rejectedQty: 0,
        condition: 'good',
      },
    ],
  };
  const res2 = evaluateThreeWayMatch(po, grnGood);
  assert.equal(res2.matchStatus, 'invoice_missing');
  assert.equal(res2.readyForPayment, false);

  // Case 3: Fully matched!
  const invoiceGood: VendorInvoice = {
    id: 'inv-1',
    organizationId: 'org-inka-001',
    invoiceNumber: 'INV-2026-888',
    fakturPajakNumber: '010.001-26.88771122',
    poId: 'po-match-1',
    poNumber: 'PO-2026-0010',
    supplierId: 'sup-1',
    supplierName: 'PT Teknologi Maju',
    invoiceDate: '2026-10-25',
    dueDate: '2026-11-25',
    subtotal: 20000000,
    taxAmount: 2200000,
    totalAmount: 22200000, // matches grandTotal
    status: 'pending_verification',
  };
  const res3 = evaluateThreeWayMatch(po, grnGood, invoiceGood);
  assert.equal(res3.matchStatus, 'fully_matched');
  assert.equal(res3.quantityMatch, true);
  assert.equal(res3.priceMatch, true);
  assert.equal(res3.readyForPayment, true);
  assert.equal(res3.discrepancies.length, 0);

  // Case 4: Quantity Discrepancy (Ordered 2, received 1)
  const grnPartial: GoodsReceiptNote = {
    ...grnGood,
    items: [
      {
        poItemId: 'item-1',
        description: 'Dell Latitude 5440',
        orderedQty: 2,
        receivedQty: 1, // Only 1 received!
        rejectedQty: 0,
        condition: 'good',
      },
    ],
  };
  const res4 = evaluateThreeWayMatch(po, grnPartial, invoiceGood);
  assert.equal(res4.matchStatus, 'quantity_mismatch');
  assert.equal(res4.readyForPayment, false);

  // Case 5: Price Variance (Vendor billed 25,000,000 instead of 22,200,000)
  const invoiceHigh: VendorInvoice = {
    ...invoiceGood,
    totalAmount: 25000000,
  };
  const res5 = evaluateThreeWayMatch(po, grnGood, invoiceHigh);
  assert.equal(res5.matchStatus, 'price_variance');
  assert.equal(res5.readyForPayment, false);
});

test('evaluateRfqBids accurately ranks and recommends the best value vendor quote', () => {
  const bids: RFQSupplierBid[] = [
    {
      supplierId: 'sup-expensive',
      supplierName: 'Vendor Premium Corp',
      unitPrice: 20000000,
      totalPrice: 60000000,
      deliveryDays: 14,
      paymentTerms: 'Net 30',
      warrantyMonths: 12,
      complianceScore: 90,
      overallScore: 0,
      status: 'alternative',
      quotationDocRef: 'QUOTE-A.pdf',
    },
    {
      supplierId: 'sup-best',
      supplierName: 'Vendor Optimal Tech',
      unitPrice: 16000000,
      totalPrice: 48000000,
      deliveryDays: 5,
      paymentTerms: 'Net 45',
      warrantyMonths: 24,
      complianceScore: 95,
      overallScore: 0,
      status: 'alternative',
      quotationDocRef: 'QUOTE-B.pdf',
    },
    {
      supplierId: 'sup-slow',
      supplierName: 'Vendor Budget Lama',
      unitPrice: 17000000,
      totalPrice: 51000000,
      deliveryDays: 30,
      paymentTerms: 'Cash',
      warrantyMonths: 6,
      complianceScore: 70,
      overallScore: 0,
      status: 'alternative',
      quotationDocRef: 'QUOTE-C.pdf',
    },
  ];

  const ranked = evaluateRfqBids(bids);
  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].supplierId, 'sup-best');
  assert.equal(ranked[0].status, 'recommended');
  assert.ok(ranked[0].overallScore > ranked[1].overallScore);
});

test('detectProcurementAnomalies detects split PRs and unverified vendors', () => {
  const prA: PurchaseRequest = {
    id: 'pr-split-1',
    organizationId: 'org-1',
    requestNumber: 'PR-2026-0081',
    requesterId: 'user-1',
    requesterName: 'Budi',
    departmentId: 'dept-it',
    costCenterId: 'cc-1',
    purpose: 'Laptop Dev Batch 1',
    neededBy: '2026-11-01',
    deliveryLocation: 'JKT',
    currency: 'IDR',
    estimatedTotal: 40000000,
    taxTotal: 4400000,
    grandTotal: 44400000, // Under Rp 50M
    status: 'pending_approval',
    createdAt: '2026-10-25T08:00:00Z',
    updatedAt: '2026-10-25T08:00:00Z',
    items: [],
    approvalInstances: [],
    currentStepOrder: 1,
  };

  const prB: PurchaseRequest = {
    id: 'pr-split-2',
    organizationId: 'org-1',
    requestNumber: 'PR-2026-0082',
    requesterId: 'user-1',
    requesterName: 'Budi',
    departmentId: 'dept-it', // Same department
    costCenterId: 'cc-1',
    purpose: 'Laptop Dev Batch 2',
    neededBy: '2026-11-01',
    deliveryLocation: 'JKT',
    currency: 'IDR',
    estimatedTotal: 30000000,
    taxTotal: 3300000,
    grandTotal: 33300000, // Under Rp 50M, submitted 4 hours later!
    status: 'pending_approval',
    createdAt: '2026-10-25T12:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z',
    items: [],
    approvalInstances: [],
    currentStepOrder: 1,
  };

  const suppliers: Supplier[] = [
    {
      id: 'sup-unverified-1',
      organizationId: 'org-1',
      code: 'SUP-999',
      name: 'CV Usaha Baru Abadi',
      email: 'sales@usahabaru.test',
      phone: '08123456789',
      address: 'Bandung',
      category: 'General',
      taxId: '00.000.000.0-000.000',
      paymentTerms: 'Net 14',
      status: 'active',
      verificationStatus: 'action_required', // Unverified!
      bankName: 'BCA',
      bankAccountNumber: '1234567890',
      bankAccountHolder: 'CV Usaha Baru Abadi',
      legalDocs: [],
    },
  ];

  const orderToUnverified: PurchaseOrder = {
    id: 'po-unverified-1',
    organizationId: 'org-1',
    poNumber: 'PO-2026-0099',
    supplierId: 'sup-unverified-1',
    supplierName: 'CV Usaha Baru Abadi',
    supplierEmail: 'sales@usahabaru.test',
    supplierAddress: 'Bandung',
    createdBy: 'user-proc',
    createdByName: 'Dewi',
    orderDate: '2026-10-26',
    expectedDeliveryDate: '2026-11-05',
    paymentTerms: 'Net 14',
    currency: 'IDR',
    subtotal: 10000000,
    taxTotal: 1100000,
    grandTotal: 11100000,
    status: 'issued',
    items: [],
  };

  const anomalies = detectProcurementAnomalies([prA, prB], [orderToUnverified], suppliers);
  assert.ok(anomalies.some((a) => a.type === 'split_pr'));
  assert.ok(anomalies.some((a) => a.type === 'unverified_vendor'));
});
