/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateItemLineTotal,
  calculateOrderTotals,
  evaluateWorkflowSteps,
  canUserApprove,
  processApprovalDecision,
  validateBudgetAvailability,
  canConvertPrToPo,
  generateDocumentNumber,
} from './workflow';
import {
  ApprovalWorkflow,
  Budget,
  PurchaseRequest,
  User,
} from '../types/procurement';

test('calculateItemLineTotal computes accurate line totals', () => {
  assert.equal(calculateItemLineTotal(5, 200000), 1000000);
  assert.equal(calculateItemLineTotal(0, 50000), 0);
  assert.equal(calculateItemLineTotal(-2, 50000), 0); // safe boundary check
});

test('calculateOrderTotals computes subtotal, 11% PPN tax, and grand total', () => {
  const items = [
    { quantity: 2, estimatedUnitPrice: 10000000 }, // 20,000,000
    { quantity: 1, estimatedUnitPrice: 5000000 },  // 5,000,000
  ];
  const { subtotal, taxTotal, grandTotal } = calculateOrderTotals(items, 0.11);
  assert.equal(subtotal, 25000000);
  assert.equal(taxTotal, 2750000); // 11% of 25m
  assert.equal(grandTotal, 27750000);
});

test('evaluateWorkflowSteps dynamically filters steps based on amount threshold', () => {
  const workflow: ApprovalWorkflow = {
    id: 'wf-1',
    organizationId: 'org-1',
    name: 'Standard Procurement Workflow',
    documentType: 'purchase_request',
    status: 'active',
    version: 1,
    steps: [
      {
        id: 's1',
        stepOrder: 1,
        stepName: 'Approval Kepala Departemen',
        approverRole: 'approver',
        minimumAmount: 0,
        isRequired: true,
      },
      {
        id: 's2',
        stepOrder: 2,
        stepName: 'Verifikasi Manajer Keuangan',
        approverRole: 'finance',
        minimumAmount: 10000000,
        isRequired: true,
      },
      {
        id: 's3',
        stepOrder: 3,
        stepName: 'Persetujuan Direktur / VP Operasional',
        approverRole: 'organization_admin',
        minimumAmount: 50000000,
        isRequired: true,
      },
    ],
  };

  // Case A: Amount 5,000,000 -> Only Step 1 applies
  const stepsA = evaluateWorkflowSteps(workflow, 5000000);
  assert.equal(stepsA.length, 1);
  assert.equal(stepsA[0].stepName, 'Approval Kepala Departemen');

  // Case B: Amount 25,000,000 -> Steps 1 and 2 apply
  const stepsB = evaluateWorkflowSteps(workflow, 25000000);
  assert.equal(stepsB.length, 2);
  assert.equal(stepsB[1].stepName, 'Verifikasi Manajer Keuangan');

  // Case C: Amount 75,000,000 -> All 3 steps apply
  const stepsC = evaluateWorkflowSteps(workflow, 75000000);
  assert.equal(stepsC.length, 3);
});

test('canUserApprove strictly rejects self-approval by requester', () => {
  const requester: User = {
    id: 'user-requester-1',
    name: 'Andi Requester',
    email: 'andi@inka.test',
    role: 'approver', // even if requester happens to have an approver role
    jobTitle: 'Lead Engineer',
  };

  const samplePr: PurchaseRequest = {
    id: 'pr-1',
    organizationId: 'org-1',
    requestNumber: 'PR-2026-0001',
    requesterId: 'user-requester-1', // same user!
    requesterName: 'Andi Requester',
    departmentId: 'dept-it',
    costCenterId: 'cc-it-01',
    purpose: 'Beli Server',
    neededBy: '2026-11-01',
    deliveryLocation: 'Kantor Pusat',
    currency: 'IDR',
    estimatedTotal: 10000000,
    taxTotal: 1100000,
    grandTotal: 11100000,
    status: 'pending_approval',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
    approvalInstances: [
      {
        id: 'step-1',
        organizationId: 'org-1',
        documentType: 'purchase_request',
        documentId: 'pr-1',
        stepOrder: 1,
        stepName: 'Head of IT Approval',
        requiredRole: 'approver',
        status: 'pending',
      },
    ],
    currentStepOrder: 1,
  };

  const check = canUserApprove(samplePr, requester);
  assert.equal(check.allowed, false);
  assert.match(check.reason || '', /Konflik Kepentingan/);
});

test('canUserApprove enforces role match and sequential progression', () => {
  const approver1: User = {
    id: 'user-head-dept',
    name: 'Budi Dept Head',
    email: 'budi@inka.test',
    role: 'approver',
    jobTitle: 'Head of IT',
  };

  const financeUser: User = {
    id: 'user-finance',
    name: 'Dewi Finance',
    email: 'dewi@inka.test',
    role: 'finance',
    jobTitle: 'Finance Manager',
  };

  const samplePr: PurchaseRequest = {
    id: 'pr-2',
    organizationId: 'org-1',
    requestNumber: 'PR-2026-0002',
    requesterId: 'user-other',
    requesterName: 'Other Person',
    departmentId: 'dept-it',
    costCenterId: 'cc-it-01',
    purpose: 'Lisensi Software',
    neededBy: '2026-11-01',
    deliveryLocation: 'Kantor Pusat',
    currency: 'IDR',
    estimatedTotal: 20000000,
    taxTotal: 2200000,
    grandTotal: 22200000,
    status: 'pending_approval',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
    approvalInstances: [
      {
        id: 'step-1',
        organizationId: 'org-1',
        documentType: 'purchase_request',
        documentId: 'pr-2',
        stepOrder: 1,
        stepName: 'Dept Head Review',
        requiredRole: 'approver',
        status: 'pending',
      },
      {
        id: 'step-2',
        organizationId: 'org-1',
        documentType: 'purchase_request',
        documentId: 'pr-2',
        stepOrder: 2,
        stepName: 'Finance Verification',
        requiredRole: 'finance',
        status: 'pending',
      },
    ],
    currentStepOrder: 1,
  };

  // Step 1: Approver 1 should be allowed
  const check1 = canUserApprove(samplePr, approver1);
  assert.equal(check1.allowed, true);

  // Step 1: Finance user is not allowed for Step 1 because role required is 'approver'
  const checkFinanceOnStep1 = canUserApprove(samplePr, financeUser);
  assert.equal(checkFinanceOnStep1.allowed, false);

  // Approve step 1
  const decision1 = processApprovalDecision(samplePr, approver1, 'approved', 'Disetujui untuk produktivitas tim');
  assert.ok(!decision1.error);
  assert.equal(decision1.updatedRequest.status, 'pending_approval');
  assert.equal(decision1.updatedRequest.currentStepOrder, 2);

  // Now on Step 2: Finance user should be allowed
  const checkFinanceOnStep2 = canUserApprove(decision1.updatedRequest, financeUser);
  assert.equal(checkFinanceOnStep2.allowed, true);

  // Approve step 2 (final step) -> Status transitions to 'approved'
  const decision2 = processApprovalDecision(decision1.updatedRequest, financeUser, 'approved', 'Anggaran terverifikasi');
  assert.ok(!decision2.error);
  assert.equal(decision2.updatedRequest.status, 'approved');
});

test('processApprovalDecision rejection terminates PR workflow with reason', () => {
  const approver: User = {
    id: 'user-head-dept',
    name: 'Budi Dept Head',
    email: 'budi@inka.test',
    role: 'approver',
    jobTitle: 'Head of IT',
  };

  const samplePr: PurchaseRequest = {
    id: 'pr-3',
    organizationId: 'org-1',
    requestNumber: 'PR-2026-0003',
    requesterId: 'user-other',
    requesterName: 'Other Person',
    departmentId: 'dept-it',
    costCenterId: 'cc-it-01',
    purpose: 'Item Non-prioritas',
    neededBy: '2026-11-01',
    deliveryLocation: 'Kantor',
    currency: 'IDR',
    estimatedTotal: 5000000,
    taxTotal: 550000,
    grandTotal: 5550000,
    status: 'pending_approval',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
    approvalInstances: [
      {
        id: 'step-1',
        organizationId: 'org-1',
        documentType: 'purchase_request',
        documentId: 'pr-3',
        stepOrder: 1,
        stepName: 'Dept Head Review',
        requiredRole: 'approver',
        status: 'pending',
      },
    ],
    currentStepOrder: 1,
  };

  const result = processApprovalDecision(
    samplePr,
    approver,
    'rejected',
    'Spesifikasi barang tidak sesuai standar operasional kantor.'
  );

  assert.ok(!result.error);
  assert.equal(result.updatedRequest.status, 'rejected');
  assert.equal(result.updatedRequest.rejectionReason, 'Spesifikasi barang tidak sesuai standar operasional kantor.');
});

test('validateBudgetAvailability detects budget exhaustion', () => {
  const budget: Budget = {
    id: 'b-1',
    organizationId: 'org-1',
    name: 'IT Infrastructure 2026',
    departmentId: 'dept-it',
    fiscalYear: 2026,
    periodStart: '2026-01-01',
    periodEnd: '2026-12-31',
    allocatedAmount: 100000000, // 100m
    committedAmount: 30000000,  // 30m
    spentAmount: 50000000,      // 50m
    currency: 'IDR',
    status: 'active',
  };

  // Available = 100m - (30m + 50m) = 20m
  const checkOk = validateBudgetAvailability(budget, 15000000); // 15m requested
  assert.equal(checkOk.isSufficient, true);
  assert.equal(checkOk.available, 20000000);
  assert.equal(checkOk.remainingAfterRequest, 5000000);

  const checkOver = validateBudgetAvailability(budget, 25000000); // 25m requested
  assert.equal(checkOver.isSufficient, false);
  assert.equal(checkOver.remainingAfterRequest, -5000000);
});

test('canConvertPrToPo permits only approved requests', () => {
  const draftPr = {
    id: 'pr-draft',
    status: 'draft',
    items: [{ id: '1', purchaseRequestId: 'pr-draft', description: 'Item 1', quantity: 1, unit: 'Pcs', estimatedUnitPrice: 100, lineTotal: 100 }],
  } as PurchaseRequest;
  assert.equal(canConvertPrToPo(draftPr).allowed, false);

  const approvedPr = {
    id: 'pr-appr',
    status: 'approved',
    items: [{ id: '1', purchaseRequestId: 'pr-appr', description: 'Item 1', quantity: 1, unit: 'Pcs', estimatedUnitPrice: 100, lineTotal: 100 }],
  } as PurchaseRequest;
  assert.equal(canConvertPrToPo(approvedPr).allowed, true);
});

test('generateDocumentNumber generates formatted alphanumeric identifiers', () => {
  assert.equal(generateDocumentNumber('PR', 1, 2026), 'PR-2026-0001');
  assert.equal(generateDocumentNumber('PO', 42, 2026), 'PO-2026-0042');
});
