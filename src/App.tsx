/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProcurementProvider } from './context/ProcurementContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/public/LandingPage';
import { FeaturesPage } from './components/public/FeaturesPage';
import { PricingPage } from './components/public/PricingPage';
import { AuthModal } from './components/public/AuthModal';

// App Views
import { DashboardView } from './components/dashboard/DashboardView';
import { PurchaseRequestsView } from './components/requests/PurchaseRequestsView';
import { ApprovalsInboxView } from './components/approvals/ApprovalsInboxView';
import { PurchaseOrdersView } from './components/orders/PurchaseOrdersView';
import { ThreeWayMatchingView } from './components/matching/ThreeWayMatchingView';
import { RfqView } from './components/rfq/RfqView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { VendorPortalView } from './components/vendor-portal/VendorPortalView';
import { CatalogView } from './components/catalog/CatalogView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { FraudDetectionView } from './components/fraud/FraudDetectionView';
import { WorkflowsView } from './components/workflows/WorkflowsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { OrganizationView } from './components/organization/OrganizationView';

// Modals
import { CreatePurchaseRequestModal } from './components/requests/CreatePurchaseRequestModal';
import { CreatePurchaseOrderModal } from './components/orders/CreatePurchaseOrderModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'features' | 'pricing' | 'app'>('app');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // App Global Modals
  const [isCreatePrOpen, setIsCreatePrOpen] = useState(false);
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleEnterApp = () => {
    setCurrentPage('app');
    setIsAuthModalOpen(false);
  };

  return (
    <ProcurementProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {currentPage === 'landing' ? (
          <LandingPage
            onEnterApp={() => setCurrentPage('app')}
            onOpenPricing={() => setCurrentPage('pricing')}
            onOpenFeatures={() => setCurrentPage('features')}
            onOpenAuth={handleOpenAuth}
          />
        ) : currentPage === 'features' ? (
          <FeaturesPage
            onBack={() => setCurrentPage('landing')}
            onOpenApp={() => setCurrentPage('app')}
            onOpenPricing={() => setCurrentPage('pricing')}
          />
        ) : currentPage === 'pricing' ? (
          <PricingPage
            onBack={() => setCurrentPage('landing')}
            onOpenApp={() => setCurrentPage('app')}
          />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onOpenPublicSite={() => setCurrentPage('landing')}
            />

            {/* Main Application Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Navbar
                onOpenCreatePr={() => setIsCreatePrOpen(true)}
                onOpenCreatePo={() => setIsCreatePoOpen(true)}
              />

              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {currentTab === 'dashboard' && (
                  <DashboardView
                    onNavigate={setCurrentTab}
                    onOpenCreatePr={() => setIsCreatePrOpen(true)}
                  />
                )}

                {currentTab === 'requests' && (
                  <PurchaseRequestsView onOpenCreatePr={() => setIsCreatePrOpen(true)} />
                )}

                {currentTab === 'approvals' && <ApprovalsInboxView />}

                {currentTab === 'orders' && (
                  <PurchaseOrdersView onOpenCreatePo={() => setIsCreatePoOpen(true)} />
                )}

                {currentTab === 'matching' && <ThreeWayMatchingView />}

                {currentTab === 'rfq' && <RfqView />}

                {currentTab === 'suppliers' && <SuppliersView />}

                {currentTab === 'vendor-portal' && <VendorPortalView />}

                {currentTab === 'catalog' && <CatalogView />}

                {currentTab === 'budgets' && <BudgetsView />}

                {currentTab === 'fraud' && <FraudDetectionView />}

                {currentTab === 'workflows' && <WorkflowsView />}

                {currentTab === 'audit' && <AuditLogsView />}

                {currentTab === 'organization' && <OrganizationView />}
              </main>
            </div>
          </div>
        )}

        {/* Global Modals */}
        <CreatePurchaseRequestModal
          isOpen={isCreatePrOpen}
          onClose={() => setIsCreatePrOpen(false)}
        />

        <CreatePurchaseOrderModal
          isOpen={isCreatePoOpen}
          onClose={() => setIsCreatePoOpen(false)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          mode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleEnterApp}
        />
      </div>
    </ProcurementProvider>
  );
}
