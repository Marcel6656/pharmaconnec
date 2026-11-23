'use client';

import React, { useMemo } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { Metric, Pharmacy, Product, ProductTable, SectionTitle, isPharmacyActiveAndValid } from '@/lib/shared';
import {
  ModernAlertWarningIcon,
  ModernEmergency24Icon,
  ModernPackageBoxIcon,
  ModernSearchMedicineIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

const PRODUCT_STATUS_PILLS = [
  'Tous',
  'Publié',
  'En attente',
  'À corriger',
  'Brouillon',
  'Masqué',
  'Refusé',
  'Suspendu',
  'Archivé',
] as const;

interface ProductsManagePageProps {
  myProducts: Product[];
  pharmacies: Pharmacy[];
  activePharmacy?: Pharmacy;
  canOperatePharmacy?: boolean;
  categories: string[];
  productStatusFilter: string;
  setProductStatusFilter: (t: string) => void;
  query: string;
  setQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  resetProductForm: (p?: Product) => void;
  onQuickStock?: (p: Product) => void;
  onDuplicate?: (p: Product) => void;
  removeProduct: (id: number) => void;
  productStatus: (id: number, s: 'Brouillon' | 'En attente' | 'Masqué' | 'Archivé') => void;
}

export function ProductsManagePage({
  myProducts,
  pharmacies,
  activePharmacy,
  canOperatePharmacy = true,
  categories,
  productStatusFilter,
  setProductStatusFilter,
  query,
  setQuery,
  categoryFilter,
  setCategoryFilter,
  resetProductForm,
  onQuickStock,
  onDuplicate,
  removeProduct,
  productStatus
}: ProductsManagePageProps) {
  const { statusCounts, publishedCount, reviewCount, outOfStockCount } = useMemo(() => {
    const counts: Record<string, number> = { Tous: myProducts.length };
    let outOfStock = 0;
    for (const p of myProducts) {
      counts[p.status] = (counts[p.status] || 0) + 1;
      if (p.stock === 0 && p.status !== 'Archivé') outOfStock += 1;
    }
    return {
      statusCounts: counts,
      publishedCount: counts['Publié'] || 0,
      reviewCount: (counts['En attente'] || 0) + (counts['À corriger'] || 0),
      outOfStockCount: outOfStock,
    };
  }, [myProducts]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myProducts.filter(
      p =>
        (productStatusFilter === 'Tous' || p.status === productStatusFilter) &&
        (categoryFilter === 'Toutes les catégories' || p.category === categoryFilter) &&
        (!q || `${p.name} ${p.brand} ${p.code} ${p.category}`.toLowerCase().includes(q))
    );
  }, [myProducts, productStatusFilter, categoryFilter, query]);

  return (
    <>
      <SectionTitle
        eyebrow="CATALOGUE"
        title="Mes produits"
        desc="Ajoutez, modifiez et suivez la validation de vos fiches produits."
        icon={<ModernPackageBoxIcon size={24} />}
        action={
          <button
            type="button"
            className="primary-btn"
            disabled={!canOperatePharmacy}
            title={canOperatePharmacy ? 'Ajouter un nouveau produit' : 'Action indisponible pour le statut actuel de l’établissement'}
            onClick={() => resetProductForm()}
          >
            <Plus size={15} /> Ajouter un produit
          </button>
        }
      />

      <div className="metric-grid">
        <Metric title="Catalogue" value={String(myProducts.length)} detail="Références enregistrées" icon={ModernPackageBoxIcon} />
        <Metric title="Publiés" value={String(publishedCount)} detail="Visibles au public" icon={ModernVerifiedShieldIcon} />
        <Metric title="En attente / À corriger" value={String(reviewCount)} detail="En cours de modération" icon={ModernEmergency24Icon} />
        <Metric title="Rupture de stock" value={String(outOfStockCount)} detail="Stock déclaré à 0" icon={ModernAlertWarningIcon} />
      </div>

      <div className="toolbar">
        <label className="search-box">
          <ModernSearchMedicineIcon size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un produit, marque ou code-barres…"
          />
        </label>
        <button
          type="button"
          className="outline-btn"
          onClick={() => {
            setQuery('');
            setProductStatusFilter('Tous');
            setCategoryFilter('Toutes les catégories');
          }}
        >
          <SlidersHorizontal size={15} /> Réinitialiser
        </button>
      </div>

      <div className="pc-status-filter-bar" role="tablist" aria-label="Filtrer par statut produit">
        {PRODUCT_STATUS_PILLS.map(status => {
          const count = statusCounts[status] || 0;
          const active = productStatusFilter === status;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={active}
              className={`pc-status-pill ${active ? 'active' : ''}`}
              onClick={() => setProductStatusFilter(status)}
            >
              <span>{status}</span>
              <span className="pc-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="category-chips">
        <button
          type="button"
          className={categoryFilter === 'Toutes les catégories' ? 'active' : ''}
          onClick={() => setCategoryFilter('Toutes les catégories')}
        >
          Toutes les catégories
        </button>
        {categories.map(c => (
          <button
            type="button"
            key={c}
            className={categoryFilter === c ? 'active' : ''}
            onClick={() => setCategoryFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="panel cg-modern-panel">
        <div className="panel-heading">
          <div>
            <h3>Catalogue produits</h3>
            <p>{filteredRows.length} produit(s) affiché(s)</p>
          </div>
        </div>
        <ProductTable
          products={filteredRows}
          pharmacies={pharmacies}
          admin={false}
          canOperate={canOperatePharmacy}
          allowArchiveWhenExpired={
            activePharmacy?.status === 'Abonnement expiré' ||
            (activePharmacy?.status === 'Validée' && !isPharmacyActiveAndValid(activePharmacy))
          }
          onEdit={resetProductForm}
          onStock={onQuickStock}
          onDuplicate={onDuplicate}
          onDelete={removeProduct}
          onStatus={(id, s) => {
            if (s === 'Brouillon' || s === 'En attente' || s === 'Masqué' || s === 'Archivé') {
              productStatus(id, s);
            }
          }}
        />
      </section>

      <div className="info-note">
        <ModernVerifiedShieldIcon size={17} />
        <span>
          <b>Validation obligatoire avant publication.</b> Les produits soumis à l’administration restent invisibles au public jusqu’à leur approbation, quelle que soit votre formule d’abonnement.
        </span>
      </div>
    </>
  );
}
