'use client';

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  AppData,
  Product,
  isPharmacyActiveAndValid,
  money,
  officialCategories,
  SectionTitle,
  Empty,
} from '@/lib/shared';
import { Language } from '@/lib/translations';
import {
  ModernBabyCareIcon,
  ModernDermaDropIcon,
  ModernEmergency24Icon,
  ModernHeartVitalityIcon,
  ModernMedicalDeviceIcon,
  ModernPackageBoxIcon,
  ModernPillCapsuleIcon,
  ModernSearchMedicineIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl,
} from '@/components/shared/ModernIcons';

interface ProductsViewProps {
  data: AppData;
  query: string;
  setQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  city: string;
  setCity: (c: string) => void;
  availabilityFilter: string;
  setAvailabilityFilter: (a: string) => void;
  minPrice?: string;
  setMinPrice?: (v: string) => void;
  maxPrice?: string;
  setMaxPrice?: (v: string) => void;
  filteredPublicProducts: Product[];
  setSelectedPharmacy: (id: number) => void;
  setSelectedProduct: (id: number | null) => void;
  setModal: (m: any) => void;
  go: (p: string) => void;
  currentLang?: Language;
}

function CategoryGlyph({ name }: { name: string }) {
  if (name === 'Médicaments') return <ModernPillCapsuleIcon size={15} />;
  if (name === 'Vitamines') return <ModernHeartVitalityIcon size={15} />;
  if (name === 'Hygiène') return <ModernEmergency24Icon size={15} />;
  if (name === 'Matériel médical') return <ModernMedicalDeviceIcon size={15} />;
  if (name === 'Parapharmacie') return <ModernDermaDropIcon size={15} />;
  return <ModernBabyCareIcon size={15} />;
}

export function ProductsView({
  data,
  query,
  setQuery,
  categoryFilter,
  setCategoryFilter,
  city,
  setCity,
  availabilityFilter,
  setAvailabilityFilter,
  minPrice = '',
  setMinPrice,
  maxPrice = '',
  setMaxPrice,
  filteredPublicProducts,
  setSelectedPharmacy,
  setSelectedProduct,
  setModal,
  go,
  currentLang = 'fr',
}: ProductsViewProps) {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const isEn = currentLang === 'en';

  const validPharmacies = data.pharmacies.filter(isPharmacyActiveAndValid);
  const catalogCategories = data.platformCategories?.length ? data.platformCategories : officialCategories;

  const hasActiveFilters =
    showAllProducts ||
    Boolean(query) ||
    categoryFilter !== 'Toutes les catégories' ||
    city !== 'Toutes les villes' ||
    availabilityFilter !== 'Toutes' ||
    Boolean(minPrice) ||
    Boolean(maxPrice);
  const displayedProducts = hasActiveFilters ? filteredPublicProducts : filteredPublicProducts.slice(0, 12);

  return (
    <div className="cg-page-container animate-fade-in">
      <SectionTitle
        eyebrow={isEn ? 'PUBLIC CATALOG' : 'CATALOGUE PUBLIC'}
        badge={`${filteredPublicProducts.length} référence(s)`}
        title={isEn ? 'Products & medications' : 'Produits disponibles'}
        desc={
          isEn
            ? 'Browse verified products, indicative prices and live stocks declared by registered pharmacies.'
            : 'Consultez les produits validés, leurs prix indicatifs et les stocks déclarés par les pharmacies enregistrées.'
        }
        icon={<ModernPackageBoxIcon size={24} />}
      />

      <div className="cg-category-pill-bar">
        <button
          type="button"
          className={`cg-cat-pill ${categoryFilter === 'Toutes les catégories' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('Toutes les catégories')}
        >
          <ModernPackageBoxIcon size={15} /> {isEn ? 'All categories' : 'Toutes les catégories'}
        </button>
        {catalogCategories.map(c => (
          <button
            type="button"
            key={c}
            className={`cg-cat-pill ${categoryFilter === c ? 'active' : ''}`}
            onClick={() => setCategoryFilter(c)}
          >
            <CategoryGlyph name={c} /> {c}
          </button>
        ))}
      </div>

      <div className="cg-filter-card">
        <div className="directory-tools pc-products-tools">
          <div className="search-control">
            <ModernSearchMedicineIcon size={18} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isEn ? 'Medicine, brand, pharmacy...' : 'Médicament, marque, pharmacie…'}
            />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)}>
            {['Toutes les villes', ...Array.from(new Set(validPharmacies.map(p => p.city)))].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
            <option value="Toutes">Tous les stocks</option>
            <option value="Disponible">En stock uniquement</option>
            <option value="Indisponible">Indisponibles</option>
          </select>
          {setMinPrice && (
            <input
              type="number"
              min="0"
              className="pc-price-input"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="Prix min (FCFA)"
            />
          )}
          {setMaxPrice && (
            <input
              type="number"
              min="0"
              className="pc-price-input"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="Prix max (FCFA)"
            />
          )}
        </div>
      </div>

      <section className="mc-section">
        <div className="cg-results-summary" style={{ marginBottom: 16 }}>
          <b>{filteredPublicProducts.length} produit(s) référencé(s)</b>
          <span>Informations déclarées par chaque pharmacie</span>
        </div>

        <div className="mc-product-grid">
          {displayedProducts.map(p => {
            const ph = data.pharmacies.find(x => x.id === p.pharmacyId);
            return (
              <article className="mc-product-card" key={p.id}>
                <div className="mc-product-media">
                  {p.imageDataUrl ? <img src={p.imageDataUrl} alt={p.name} /> : <ModernPackageBoxIcon size={34} />}
                  <span className={p.stock > 0 ? 'mc-stock-badge in' : 'mc-stock-badge out'}>
                    {p.stock > 0 ? `${p.stock} en stock` : 'Rupture'}
                  </span>
                </div>
                <div className="mc-product-body">
                  <span className="mc-product-cat">{p.category}</span>
                  <h3>{p.name}</h3>
                  <small className="mc-product-brand">
                    {p.brand ? `${p.brand} · ` : ''}{ph?.name || 'Officine vérifiée'}
                  </small>
                  <div className="mc-price-line">
                    <b>{money(p.price)}</b>
                    <button
                      type="button"
                      className="mc-pharm-mini-link"
                      onClick={() => {
                        setSelectedPharmacy(p.pharmacyId);
                        go('Fiche pharmacie');
                      }}
                    >
                      <MapPin size={12} /> {ph?.area || ph?.city || 'Officine'}
                    </button>
                  </div>
                  <div className="mc-card-actions">
                    <button
                      type="button"
                      className="mc-outline-pill-btn"
                      onClick={() => {
                        setSelectedPharmacy(p.pharmacyId);
                        setSelectedProduct(p.id);
                        setModal('message');
                      }}
                    >
                      Contacter
                    </button>
                    {ph?.phone && (
                      <a
                        className="product-whatsapp-btn"
                        href={buildWhatsAppUrl(ph.phone, `Bonjour ${ph.name}, le produit "${p.name}" (${money(p.price)}) est-il disponible ?`)}
                        target="_blank"
                        rel="noreferrer"
                        title="Contacter cette pharmacie sur WhatsApp"
                      >
                        <ModernWhatsAppIcon size={15} /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredPublicProducts.length === 0 && (
          <Empty title="Aucun produit trouvé" detail="Aucun produit publié ne correspond à vos critères de recherche." />
        )}

        {filteredPublicProducts.length > 12 && !showAllProducts && (
          <div className="mc-center-btn-row">
            <button
              type="button"
              className="cg-btn-pine"
              onClick={() => setShowAllProducts(true)}
            >
              Afficher tout ({filteredPublicProducts.length})
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
