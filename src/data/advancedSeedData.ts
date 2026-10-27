/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GoodsReceiptNote,
  ProcurementAnomaly,
  RFQ,
  VendorComplianceDoc,
  VendorInvoice,
} from '../types/procurement';

export const INITIAL_SUPPLIER_LEGAL_DOCS: Record<
  string,
  {
    verificationStatus: 'verified' | 'pending_verification' | 'action_required';
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    portalAccessEmail: string;
    legalDocs: VendorComplianceDoc[];
  }
> = {
  'sup-mitra-komputindo': {
    verificationStatus: 'verified',
    bankName: 'Bank Mandiri (Persero) Tbk',
    bankAccountNumber: '122-00-9988776-5',
    bankAccountHolder: 'PT Mitra Solusi Komputindo',
    portalAccessEmail: 'portal@mitrakomputindo.co.id',
    legalDocs: [
      {
        type: 'NPWP',
        docNumber: '01.234.567.8-012.000',
        verified: true,
        verifiedAt: '2026-01-15T09:00:00Z',
        fileReference: 'NPWP_Mitra_Komputindo_2026.pdf',
      },
      {
        type: 'NIB',
        docNumber: '9120001234567',
        verified: true,
        verifiedAt: '2026-01-15T09:30:00Z',
        fileReference: 'NIB_OSS_RBA_MitraKomputindo.pdf',
      },
      {
        type: 'SPPKP',
        docNumber: 'S-144/PKP/WPJ.06/KP.0103/2024',
        verified: true,
        verifiedAt: '2026-01-15T10:00:00Z',
        fileReference: 'SPPKP_Pengukuhan_PKP.pdf',
      },
      {
        type: 'Rekening_Koran',
        docNumber: 'MDR-2026-VAL-881',
        verified: true,
        verifiedAt: '2026-01-16T11:00:00Z',
        fileReference: 'Rekening_Koran_Mandiri_Terverifikasi.pdf',
      },
    ],
  },
  'sup-cloud-nusa': {
    verificationStatus: 'verified',
    bankName: 'PT Bank Central Asia Tbk (BCA)',
    bankAccountNumber: '542-019-8812',
    bankAccountHolder: 'PT Cloud Nusa Data Center',
    portalAccessEmail: 'vendor.finance@cloudnusa.id',
    legalDocs: [
      {
        type: 'NPWP',
        docNumber: '02.456.789.1-013.000',
        verified: true,
        verifiedAt: '2026-02-10T14:00:00Z',
        fileReference: 'NPWP_CloudNusa.pdf',
      },
      {
        type: 'NIB',
        docNumber: '8120009876543',
        verified: true,
        verifiedAt: '2026-02-10T14:15:00Z',
        fileReference: 'NIB_CloudNusa_OSS.pdf',
      },
      {
        type: 'SPPKP',
        docNumber: 'S-882/PKP/WPJ.07/KP.0203/2024',
        verified: true,
        verifiedAt: '2026-02-10T14:30:00Z',
        fileReference: 'SPPKP_CloudNusa.pdf',
      },
    ],
  },
  'sup-ergonika': {
    verificationStatus: 'verified',
    bankName: 'Bank Negara Indonesia (BNI)',
    bankAccountNumber: '088-776-5544',
    bankAccountHolder: 'PT Ergonika Furnitur Dinamis',
    portalAccessEmail: 'sales@ergonika.co.id',
    legalDocs: [
      {
        type: 'NPWP',
        docNumber: '03.678.901.2-014.000',
        verified: true,
        verifiedAt: '2026-03-01T10:00:00Z',
        fileReference: 'NPWP_Ergonika.pdf',
      },
      {
        type: 'NIB',
        docNumber: '7120005544332',
        verified: true,
        verifiedAt: '2026-03-01T10:20:00Z',
        fileReference: 'NIB_Ergonika.pdf',
      },
    ],
  },
  'sup-delta-kertas': {
    verificationStatus: 'action_required', // Vendor with pending compliance for testing fraud radar
    bankName: 'Bank Danamon Indonesia',
    bankAccountNumber: '003-554-1122',
    bankAccountHolder: 'CV Delta Niaga Mandiri',
    portalAccessEmail: 'admin@deltaniaga.id',
    legalDocs: [
      {
        type: 'NPWP',
        docNumber: '04.890.123.3-015.000',
        verified: false,
        expiryDate: '2026-01-01', // Expired!
        fileReference: 'NPWP_Delta_Expired.pdf',
      },
    ],
  },
};

export const INITIAL_RFQS: RFQ[] = [
  {
    id: 'rfq-2026-001',
    organizationId: 'org-inka-01',
    rfqNumber: 'RFQ-2026-0001',
    title: 'Pengadaan 10 Unit Laptop Engineer Senior (Ryzen 7 / 32GB RAM)',
    departmentId: 'dept-it',
    departmentName: 'Teknologi Informasi & Rekayasa',
    status: 'evaluation',
    targetBudget: 220000000,
    createdAt: '2026-10-18T09:00:00Z',
    dueDate: '2026-10-28T17:00:00Z',
    items: [
      {
        id: 'rfq-item-1',
        description: 'ThinkPad T14s Gen 4 AMD Ryzen 7 PRO 32GB 1TB NVMe Windows 11 Pro',
        quantity: 10,
        unit: 'Unit',
        targetPrice: 20000000,
      },
    ],
    bids: [
      {
        supplierId: 'sup-mitra-komputindo',
        supplierName: 'PT Mitra Solusi Komputindo',
        unitPrice: 19500000,
        totalPrice: 195000000,
        deliveryDays: 5,
        paymentTerms: 'Net 30 Days',
        warrantyMonths: 36,
        complianceScore: 98,
        overallScore: 95,
        status: 'recommended',
        quotationDocRef: 'PENAWARAN-MSK-2026-10-99.pdf',
        notes: 'Resmi Lenovo Premier Support On-Site 3 Tahun, garansi replacement 14 hari kerja.',
      },
      {
        supplierId: 'sup-citra-hardware',
        supplierName: 'PT Citra Graha Hardware',
        unitPrice: 20500000,
        totalPrice: 205000000,
        deliveryDays: 14,
        paymentTerms: 'Net 14 Days',
        warrantyMonths: 24,
        complianceScore: 88,
        overallScore: 82,
        status: 'alternative',
        quotationDocRef: 'QUOTATION-CGH-1029.pdf',
        notes: 'Distributor resmi, free backpack dan wireless mouse original Lenovo.',
      },
      {
        supplierId: 'sup-prima-jaya',
        supplierName: 'CV Prima Multi Elektronik',
        unitPrice: 21800000,
        totalPrice: 218000000,
        deliveryDays: 21,
        paymentTerms: 'CBD (Cash Before Delivery)',
        warrantyMonths: 12,
        complianceScore: 72,
        overallScore: 68,
        status: 'rejected',
        quotationDocRef: 'PENAWARAN-PRIMA-88.pdf',
        notes: 'Stok terbatas, termin pembayaran meminta tunai sebelum pengiriman.',
      },
    ],
  },
  {
    id: 'rfq-2026-002',
    organizationId: 'org-inka-01',
    rfqNumber: 'RFQ-2026-0002',
    title: 'Pengadaan Kursi Ergonomis Mesh Standar Herman Miller / Steelcase (25 Unit)',
    departmentId: 'dept-ops',
    departmentName: 'Operasional & Fasilitas Kantor',
    status: 'open_bidding',
    targetBudget: 175000000,
    createdAt: '2026-10-24T10:00:00Z',
    dueDate: '2026-11-04T17:00:00Z',
    items: [
      {
        id: 'rfq-item-2',
        description: 'Kursi Kerja Ergonomis Jaring Lumbar Support 4D Armrest',
        quantity: 25,
        unit: 'Unit',
        targetPrice: 7000000,
      },
    ],
    bids: [
      {
        supplierId: 'sup-ergonika',
        supplierName: 'PT Ergonika Furnitur Dinamis',
        unitPrice: 6500000,
        totalPrice: 162500000,
        deliveryDays: 7,
        paymentTerms: 'Net 30 Days',
        warrantyMonths: 60,
        complianceScore: 96,
        overallScore: 94,
        status: 'recommended',
        quotationDocRef: 'PENAWARAN-ERGONIKA-FURN-26.pdf',
        notes: 'Garansi gaslift dan rangka 5 tahun, perakitan gratis di kantor Jakarta.',
      },
      {
        supplierId: 'sup-living-seating',
        supplierName: 'PT Surya Cipta Ergonomi',
        unitPrice: 6850000,
        totalPrice: 171250000,
        deliveryDays: 12,
        paymentTerms: 'Net 30 Days',
        warrantyMonths: 36,
        complianceScore: 89,
        overallScore: 85,
        status: 'alternative',
        quotationDocRef: 'SURYA-QUOT-0991.pdf',
        notes: 'Desain modern, sertifikasi BIFMA Level 3.',
      },
    ],
  },
];

export const INITIAL_GOODS_RECEIPTS: GoodsReceiptNote[] = [
  {
    id: 'grn-2026-0001',
    organizationId: 'org-inka-01',
    grnNumber: 'GRN/2026/10/0001',
    poId: 'po-2026-0001',
    poNumber: 'PO-2026-0001',
    supplierId: 'sup-cloud-nusa',
    supplierName: 'PT Cloud Nusa Data Center',
    deliveryNoteNumber: 'SJ-CN-2026/X/8812',
    receivedDate: '2026-10-18T10:30:00Z',
    receivedBy: 'Rudi Hermawan (Procurement)',
    warehouseLocation: 'Tier-IV Data Center Cyber 2, Jakarta',
    items: [
      {
        poItemId: 'poi-2026-0001-1',
        description: 'Langganan Dedicated Bare-Metal Server 64-Core 256GB RAM 10Gbps (12 Bulan)',
        orderedQty: 1,
        receivedQty: 1,
        rejectedQty: 0,
        condition: 'good',
      },
    ],
    notes: 'Kredensial dan berita acara serah terima (BAST) infrastruktur cloud telah diverifikasi 100% aktif.',
  },
];

export const INITIAL_VENDOR_INVOICES: VendorInvoice[] = [
  {
    id: 'inv-2026-0001',
    organizationId: 'org-inka-01',
    invoiceNumber: 'INV/CN-DC/2026/10/0045',
    fakturPajakNumber: '010.001-26.99441122',
    poId: 'po-2026-0001',
    poNumber: 'PO-2026-0001',
    supplierId: 'sup-cloud-nusa',
    supplierName: 'PT Cloud Nusa Data Center',
    invoiceDate: '2026-10-19T08:00:00Z',
    dueDate: '2026-11-02T23:59:59Z',
    subtotal: 72000000,
    taxAmount: 7920000,
    totalAmount: 79920000, // Matches PO-2026-0001 exactly!
    status: 'approved_for_payment',
    verifiedAt: '2026-10-20T10:00:00Z',
    verifiedBy: 'Dewi Lestari, SE, Ak. (Finance)',
  },
];

export const INITIAL_ANOMALIES: ProcurementAnomaly[] = [
  {
    id: 'anom-split-pr-demo',
    organizationId: 'org-inka-01',
    type: 'split_pr',
    severity: 'high',
    title: 'Indikasi Pemecahan Pengajuan (Split Purchase Request)',
    description:
      'Terdeteksi 2 pengajuan PR (PR-2026-0003 & PR-2026-0004) dari Departemen IT dalam kurun waktu 36 jam dengan nominal masing-masing Rp 48.500.000 (Total Rp 97.000.000). Terindikasi pola menghindari kewenangan Approval Direktur (Pagu Rp 50 Jt).',
    flaggedEntity: 'purchase_request',
    entityId: 'pr-2026-0003',
    entityNumber: 'PR-2026-0003 & PR-2026-0004',
    detectedAt: '2026-10-22T08:30:00Z',
    dismissed: false,
  },
  {
    id: 'anom-unverified-vendor',
    organizationId: 'org-inka-01',
    type: 'unverified_vendor',
    severity: 'medium',
    title: 'Dokumen Kepatuhan Vendor Kadaluarsa / Butuh Tindakan',
    description:
      'CV Delta Niaga Mandiri memiliki dokumen NPWP & rekening bank yang belum diverifikasi ulang atau mendekati masa perpanjangan legalitas.',
    flaggedEntity: 'supplier',
    entityId: 'sup-delta-kertas',
    entityNumber: 'CV Delta Niaga Mandiri',
    detectedAt: '2026-10-24T14:15:00Z',
    dismissed: false,
  },
];
