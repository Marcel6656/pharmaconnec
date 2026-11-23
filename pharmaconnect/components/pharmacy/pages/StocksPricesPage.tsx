'use client';

import React, { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { AppData, Empty, Metric, Product, SectionTitle, isProductFresh } from '@/lib/shared';
import { StockRow } from '@/components/shared/StockRow';
import {
  ModernAlertWarningIcon,
  ModernClipboardStockIcon,
  ModernEmergency24Icon,
  ModernPackageBoxIcon,
  ModernSearchMedicineIcon
} from '@/components/shared/ModernIcons';

type StockLevelFilter = 'Tous' | 'Rupture' | 'Faible' | 'En stock';
const STOCK_FILTER_PILLS: StockLevelFilter[] = ['Tous', 'Rupture', 'Faible', 'En stock'];

interface StocksPricesPageProps {
  data: AppData;
  pharmacyId: number;
  myProducts: Product[];
  categories: string[];
  canOperatePharmacy?: boolean;
  updateStock: (id: number, price: number, stock: number) => Promise<boolean> | void;
}

export function StocksPricesPage({
  data,
  pharmacyId,
  myProducts,
  categories,
  canOperatePharmacy = true,
  updateStock
}: StocksPricesPageProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes les catégories');
  const [stockFilter, setStockFilter] = useState<StockLevelFilter>('Tous');

  const threshold = data.preferences[pharmacyId]?.lowStockThreshold ?? 5;
  const freshnessDays = data.freshnessDays || 7;

  const kpis = useMemo(() => {
    const active = myProducts.filter(p => p.status !== 'Archivé');
    let outOfStock = 0;
    let lowStock = 0;
    let staleCount = 0;
    for (const p of active) {
      if (p.stock === 0) outOfStock += 1;
      else if (p.stock <= threshold) lowStock += 1;
      if (!isProductFresh(p.stockUpdatedAt ?? p.updated, freshnessDays)) staleCount += 1;
    }
    return {
      total: myProducts.length,
      activeCount: active.length,
      outOfStock,
      lowStock,
      staleCount,
    };
  }, [myProducts, threshold, freshnessDays]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myProducts.filter(p => {
      if (category !== 'Toutes les catégories' && p.category !== category) return false;
      if (q && !`${p.name} ${p.brand} ${p.code} ${p.category}`.toLowerCase().includes(q)) return false;
      if (stockFilter === 'Rupture') return p.stock === 0;
      if (stockFilter === 'Faible') return p.stock > 0 && p.stock <= threshold;
      if (stockFilter === 'En stock') return p.stock > threshold;
      return true;
    });
  }, [myProducts, category, search, stockFilter, threshold]);

  const resetFilters = () => {
    setSearch('');
    setCategory('Toutes les catégories');
    setStockFilter('Tous');
  };

  return (
    <>
      <SectionTitle
        eyebrow="MISE À JOUR EN DIRECT"
        title="Stocks & prix"
        desc="Actualisez les informations déclarées par votre pharmacie. La dernière date de mise à jour est visible au public."
        icon={<ModernClipboardStockIcon size={24} />}
      />

      <div className="metric-grid">
        <Metric title="Références" value={String(kpis.total)} detail={`${kpis.activeCount} non archivées`} icon={ModernPackageBoxIcon} />
        <Metric title="En rupture (0)" value={String(kpis.outOfStock)} detail="Stock déclaré nul" icon={ModernAlertWarningIcon} />
        <Metric title={`Stock faible (≤ ${threshold})`} value={String(kpis.lowStock)} detail="Réassort conseillé" icon={ModernEmergency24Icon} />
        <Metric title={`À actualiser (> ${freshnessDays} j)`} value={String(kpis.staleCount)} detail="Masqués du catalogue public si périmés" icon={ModernClipboardStockIcon} />
      </div>

      <div className="info-note">
        <ModernAlertWarningIcon size={17} />
        <span>
          Le stock affiché est une déclaration de l’établissement et ne constitue pas une garantie de disponibilité instantanée.
          {!canOperatePharmacy ? ' Mode lecture seule : l’édition est verrouillée pour le statut actuel de votre établissement.' : ''}
        </span>
      </div>

      <div className="toolbar">
        <label className="search-box">
          <ModernSearchMedicineIcon size={17} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit, marque ou code…"
          />
        </label>
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filtrer par catégorie">
          <option value="Toutes les catégories">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="button" className="outline-btn" onClick={resetFilters}>
          <SlidersHorizontal size={15} /> Réinitialiser
        </button>
      </div>

      <div className="pc-status-filter-bar" role="tablist" aria-label="Filtrer par niveau de stock">
        {STOCK_FILTER_PILLS.map(level => (
          <button
            key={level}
            type="button"
            role="tab"
            aria-selected={stockFilter === level}
            className={`pc-status-pill ${stockFilter === level ? 'active' : ''}`}
            onClick={() => setStockFilter(level)}
          >
            <span>{level}</span>
          </button>
        ))}
      </div>

      <section className="panel cg-modern-panel">
        <div className="panel-heading">
          <div>
            <h3>Actualisation rapide</h3>
            <p>{filteredProducts.length} référence(s) affichée(s) · Les fiches refusées, suspendues ou archivées sont verrouillées.</p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Empty
            title="Aucun produit correspondant"
            detail="Ajustez votre recherche ou vos filtres de stock pour afficher des références."
            action={
              myProducts.length > 0 ? (
                <button type="button" className="outline-btn" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table pc-stock-table">
              <thead>
                <tr>
                  <th>PRODUIT</th>
                  <th>CATÉGORIE</th>
                  <th>STATUT</th>
                  <th>STOCK ACTUEL</th>
                  <th>PRIX (FCFA)</th>
                  <th>NOUVEAU STOCK</th>
                  <th>MISE À JOUR</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <StockRow
                    key={p.id}
                    product={p}
                    lowStockThreshold={threshold}
                    canOperate={canOperatePharmacy}
                    onSave={(price, stock) => updateStock(p.id, price, stock)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
