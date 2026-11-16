'use client';

import React from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { Product, SectionTitle, ProductTable } from '@/lib/shared';
import {
  ModernPackageBoxIcon,
  ModernSearchMedicineIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

interface ProductsManagePageProps {
  myProducts: Product[];
  categories: string[];
  adminTab: string;
  setAdminTab: (t: string) => void;
  query: string;
  setQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  resetProductForm: (p?: Product) => void;
  onQuickStock?: (p: Product) => void;
  onDuplicate?: (p: Product) => void;
  removeProduct: (id: number) => void;
  productStatus: (id: number, s: any) => void;
}

export function ProductsManagePage({
  myProducts,
  categories,
  adminTab,
  setAdminTab,
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
  const filteredRows = myProducts.filter(
    p =>
      (adminTab === 'Tous' || p.status === adminTab) &&
      (categoryFilter === 'Toutes les catégories' || p.category === categoryFilter) &&
      (!query || `${p.name} ${p.brand} ${p.code}`.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <SectionTitle
        eyebrow="CATALOGUE"
        title="Mes produits"
        desc="Ajoutez et mettez à jour les fiches produits de votre pharmacie."
        icon={<ModernPackageBoxIcon size={24} />}
        action={<button className="primary-btn" onClick={() => resetProductForm()}><Plus size={15} /> Ajouter un produit</button>}
      />
      <div className="toolbar">
        <label className="search-box">
          <ModernSearchMedicineIcon size={17} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un produit, marque ou code-barres…" />
        </label>
        <select value={adminTab} onChange={e => setAdminTab(e.target.value)}>
          <option>Tous</option>
          {['Publié', 'En attente', 'À corriger', 'Brouillon', 'Masqué', 'Suspendu', 'Refusé', 'Archivé'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="category-chips">
        <button className={categoryFilter === 'Toutes les catégories' ? 'active' : ''} onClick={() => setCategoryFilter('Toutes les catégories')}>Toutes les catégories</button>
        {categories.map(c => (
          <button key={c} className={categoryFilter === c ? 'active' : ''} onClick={() => setCategoryFilter(c)}>{c}</button>
        ))}
      </div>
      <section className="panel cg-modern-panel">
        <div className="panel-heading">
          <div>
            <h3>Catalogue produits</h3>
            <p>{filteredRows.length} produit(s)</p>
          </div>
          <button className="outline-btn" onClick={() => { setQuery(''); setAdminTab('Tous'); setCategoryFilter('Toutes les catégories'); }}>
            <SlidersHorizontal size={15} /> Réinitialiser
          </button>
        </div>
        <ProductTable
          rows={filteredRows}
          onEdit={resetProductForm}
          onQuickStock={onQuickStock}
          onDuplicate={onDuplicate}
          onDelete={removeProduct}
          onStatus={productStatus}
        />
      </section>
      <div className="info-note">
        <ModernVerifiedShieldIcon size={17} />
        <span><b>Validation obligatoire avant publication.</b> Les produits soumis à l’administration restent invisibles au public jusqu’à leur approbation. Le dispositif de soumission et de suivi avancé est associé à la formule Premium.</span>
      </div>
    </>
  );
}
