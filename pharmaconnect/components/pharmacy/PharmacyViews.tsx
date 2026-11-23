'use client';

import React, { useState } from 'react';
import { AppData, Empty, Modal, Pharmacy, PharmacyPreferences, Product } from '@/lib/shared';
import { ModernClipboardStockIcon } from '@/components/shared/ModernIcons';
import { CategoriesPage } from '@/components/pharmacy/pages/CategoriesPage';
import { EstablishmentPage } from '@/components/pharmacy/pages/EstablishmentPage';
import { MessagesPage } from '@/components/pharmacy/pages/MessagesPage';
import { NotificationsPage } from '@/components/pharmacy/pages/NotificationsPage';
import { OverviewPage } from '@/components/pharmacy/pages/OverviewPage';
import { ProductsManagePage } from '@/components/pharmacy/pages/ProductsManagePage';
import { SettingsPage } from '@/components/pharmacy/pages/SettingsPage';
import { StatisticsPage } from '@/components/pharmacy/pages/StatisticsPage';
import { StocksPricesPage } from '@/components/pharmacy/pages/StocksPricesPage';
import { SubscriptionPage } from '@/components/pharmacy/pages/SubscriptionPage';

interface PharmacyViewsProps {
  page: string;
  data: AppData;
  pharmacyId: number;
  activePharmacy?: Pharmacy;
  canOperatePharmacy?: boolean;
  onLogout?: () => void;
  onRequestCancellation?: () => void;
  myProducts: Product[];
  categories: string[];
  customCategories: () => string[];
  adminTab: string;
  setAdminTab: (t: string) => void;
  query: string;
  setQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  customCategory: string;
  setCustomCategory: (c: string) => void;
  currentMessage: number | null;
  setCurrentMessage: (id: number | null) => void;
  reply: string;
  setReply: (r: string) => void;
  planPeriod: string;
  setPlanPeriod: (p: string) => void;
  go: (p: string) => void;
  say: (s: string) => void;
  onDocumentsUploaded: () => Promise<unknown>;
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => Promise<boolean> | void;
  removeCategory: (name: string) => void;
  markAllNotices: () => void;
  deleteNotice: (id: number) => void;
  updatePreferences: (patch: Partial<PharmacyPreferences>) => void;
  resetProductForm: (p?: Product) => void;
  duplicateProduct: (p: Product) => void;
  removeProduct: (id: number) => void;
  productStatus: (id: number, s: any) => void;
  updateStock: (id: number, price: number, stock: number) => Promise<boolean> | void;
  setMessageRead: (id: number) => void;
  sendReply: (threadId: number) => void;
  markNotice: (id: number) => void;
  changePlan: (plan: any) => void;
  setExistingAccountRegistration: (v: boolean) => void;
  setPharmacyForm: (f: any) => void;
  setProfileForm: (f: any) => void;
  setModal: (m: any) => void;
}

export function PharmacyViews({
  page,
  data,
  pharmacyId,
  activePharmacy,
  canOperatePharmacy = true,
  onLogout,
  onRequestCancellation,
  myProducts,
  categories,
  customCategories,
  adminTab,
  setAdminTab,
  query,
  setQuery,
  categoryFilter,
  setCategoryFilter,
  customCategory,
  setCustomCategory,
  currentMessage,
  reply,
  setReply,
  planPeriod,
  setPlanPeriod,
  go,
  say,
  onDocumentsUploaded,
  addCategory,
  renameCategory,
  removeCategory,
  markAllNotices,
  deleteNotice,
  updatePreferences,
  resetProductForm,
  duplicateProduct,
  removeProduct,
  productStatus,
  updateStock,
  setMessageRead,
  sendReply,
  markNotice,
  changePlan,
  setExistingAccountRegistration,
  setPharmacyForm,
  setProfileForm,
  setModal
}: PharmacyViewsProps) {
  const [quickStockTarget, setQuickStockTarget] = useState<{ product: Product; price: string; stock: string } | null>(null);

  const openQuickStock = (p: Product) => {
    setQuickStockTarget({ product: p, price: String(p.price), stock: String(p.stock) });
  };

  const quickStockModal = quickStockTarget ? (
    <Modal
      title={`Stock & prix · ${quickStockTarget.product.name}`}
      icon={<ModernClipboardStockIcon size={20} />}
      onClose={() => setQuickStockTarget(null)}
    >
      <form
        onSubmit={async e => {
          e.preventDefault();
          const price = Number(quickStockTarget.price);
          const stock = Number(quickStockTarget.stock);
          if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
            say('Indiquez un prix positif ou nul et un stock en unités entières.');
            return;
          }
          const ok = await updateStock(quickStockTarget.product.id, price, stock);
          if (ok !== false) setQuickStockTarget(null);
        }}
      >
        <div className="form-grid">
          <label>
            Prix (FCFA) *
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={quickStockTarget.price}
              onChange={e => setQuickStockTarget({ ...quickStockTarget, price: e.target.value })}
            />
          </label>
          <label>
            Stock déclaré *
            <input
              type="number"
              min="0"
              step="1"
              required
              value={quickStockTarget.stock}
              onChange={e => setQuickStockTarget({ ...quickStockTarget, stock: e.target.value })}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="outline-btn" onClick={() => setQuickStockTarget(null)}>Annuler</button>
          <button type="submit" className="primary-btn">Enregistrer</button>
        </div>
      </form>
    </Modal>
  ) : null;
  if (!activePharmacy && page !== 'Paramètres') {
    return (
      <section className="panel cg-modern-panel" style={{ padding: 28 }}>
        <Empty
          title="Aucun établissement rattaché à votre compte"
          detail="Inscrivez votre pharmacie ou ajoutez un établissement pour accéder au tableau de bord, au catalogue et à la messagerie."
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setExistingAccountRegistration(true);
              setModal('register');
            }}
          >
            Rattacher une pharmacie
          </button>
        </div>
      </section>
    );
  }

  if (page === 'Vue d’ensemble' && activePharmacy) {
    return (
      <>
        <OverviewPage
          data={data}
          pharmacyId={pharmacyId}
          activePharmacy={activePharmacy}
          myProducts={myProducts}
          go={go}
          resetProductForm={resetProductForm}
          onQuickStock={openQuickStock}
          onDuplicate={duplicateProduct}
          removeProduct={removeProduct}
          productStatus={productStatus}
        />
        {quickStockModal}
      </>
    );
  }

  if (page === 'Mes produits') {
    return (
      <>
        <ProductsManagePage
          myProducts={myProducts}
          categories={categories}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          query={query}
          setQuery={setQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          resetProductForm={resetProductForm}
          onQuickStock={openQuickStock}
          onDuplicate={duplicateProduct}
          removeProduct={removeProduct}
          productStatus={productStatus}
        />
        {quickStockModal}
      </>
    );
  }

  if (page === 'Stocks & prix') {
    return <StocksPricesPage myProducts={myProducts} updateStock={updateStock} />;
  }

  if (page === 'Catégories') {
    return (
      <CategoriesPage
        data={data}
        pharmacyId={pharmacyId}
        canOperatePharmacy={canOperatePharmacy}
        categories={categories}
        customCategories={customCategories}
        customCategory={customCategory}
        setCustomCategory={setCustomCategory}
        addCategory={addCategory}
        renameCategory={renameCategory}
        removeCategory={removeCategory}
        say={say}
      />
    );
  }

  if (page === 'Messagerie') {
    return (
      <MessagesPage
        data={data}
        pharmacyId={pharmacyId}
        canOperatePharmacy={canOperatePharmacy}
        currentMessage={currentMessage}
        reply={reply}
        setReply={setReply}
        setMessageRead={setMessageRead}
        sendReply={sendReply}
      />
    );
  }

  if (page === 'Notifications') {
    return (
      <NotificationsPage
        data={data}
        pharmacyId={pharmacyId}
        markAllNotices={markAllNotices}
        markNotice={markNotice}
        deleteNotice={deleteNotice}
      />
    );
  }

  if (page === 'Mon établissement' && activePharmacy) {
    return (
      <EstablishmentPage
        key={activePharmacy.id}
        activePharmacy={activePharmacy}
        onDocumentsUploaded={onDocumentsUploaded}
        setExistingAccountRegistration={setExistingAccountRegistration}
        setPharmacyForm={setPharmacyForm}
        setProfileForm={setProfileForm}
        setModal={setModal}
        say={say}
      />
    );
  }

  if (page === 'Abonnement' && activePharmacy) {
    return (
      <SubscriptionPage
        data={data}
        pharmacyId={pharmacyId}
        activePharmacy={activePharmacy}
        planPeriod={planPeriod}
        setPlanPeriod={setPlanPeriod}
        changePlan={changePlan}
        onRequestCancellation={onRequestCancellation}
      />
    );
  }

  if (page === 'Statistiques') {
    return <StatisticsPage data={data} pharmacyId={pharmacyId} myProducts={myProducts} />;
  }

  if (page === 'Paramètres') {
    return <SettingsPage data={data} pharmacyId={pharmacyId} canOperatePharmacy={canOperatePharmacy} updatePreferences={updatePreferences} say={say} onLogout={onLogout} />;
  }

  return null;
}
