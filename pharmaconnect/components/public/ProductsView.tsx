'use client';

import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  AppData,
  Product,
  isPharmacyActiveAndValid,
  money,
  officialCategories,
  Empty,
} from '@/lib/shared';
import { getProductImage } from '@/lib/media';
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
  onContactProduct?: (pharmacyId: number, productId: number | null) => void;
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
  onContactProduct,
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
    <div className="pc-luxe-subpage animate-fade-in">
      {/* En-tête éditorial Luxe Studio */}
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/hero-cinema-medicines.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'PUBLIC CATALOG' : 'CATALOGUE OFFICIEL'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Products & Medications' : 'Produits Disponibles'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Browse verified products, indicative prices and live stocks declared by registered pharmacies.'
              : 'Consultez les références validées, leurs prix indicatifs et les disponibilités déclarées par nos pharmacies partenaires.'}
          </p>
          <span className="luxe-inner-count-pill">
            <ModernPackageBoxIcon size={15} />
            {filteredPublicProducts.length} {isEn ? 'reference(s)' : 'référence(s) en ligne'}
          </span>
        </div>
      </section>

      {/* Filtres sur fond crème #f5f1e8 */}
      <section className="luxe-filter-band">
        <div className="luxe-container">
          <div className="cg-category-pill-bar luxe-pill-bar">
            <button
              type="button"
              className={`luxe-filter-btn ${categoryFilter === 'Toutes les catégories' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('Toutes les catégories')}
            >
              <ModernPackageBoxIcon size={14} /> {isEn ? 'All categories' : 'Toutes les catégories'}
            </button>
            {catalogCategories.map(c => (
              <button
                type="button"
                key={c}
                className={`luxe-filter-btn ${categoryFilter === c ? 'active' : ''}`}
                onClick={() => setCategoryFilter(c)}
              >
                <CategoryGlyph name={c} /> {c}
              </button>
            ))}
          </div>

          <div className="luxe-filter-card">
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
                  <option key={c} value={c}>
                    {c === 'Toutes les villes' && isEn ? 'All cities' : c}
                  </option>
                ))}
              </select>
              <select value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
                <option value="Toutes">{isEn ? 'All stock' : 'Tous les stocks'}</option>
                <option value="Disponible">{isEn ? 'In stock only' : 'En stock uniquement'}</option>
                <option value="Indisponible">{isEn ? 'Out of stock' : 'Indisponibles'}</option>
              </select>
              {setMinPrice && (
                <input
                  type="number"
                  min="0"
                  className="pc-price-input"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder={isEn ? 'Min price (FCFA)' : 'Prix min (FCFA)'}
                />
              )}
              {setMaxPrice && (
                <input
                  type="number"
                  min="0"
                  className="pc-price-input"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder={isEn ? 'Max price (FCFA)' : 'Prix max (FCFA)'}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grille des produits */}
      <section className="luxe-section">
        <div className="luxe-container">
          <div className="cg-results-summary" style={{ marginBottom: 20 }}>
            <b>{filteredPublicProducts.length} {isEn ? 'product(s) listed' : 'produit(s) référencé(s)'}</b>
            <span>{isEn ? 'Information declared by each pharmacy' : 'Informations déclarées par chaque pharmacie'}</span>
          </div>

          <div className="mc-product-grid">
            {displayedProducts.map(p => {
              const ph = data.pharmacies.find(x => x.id === p.pharmacyId);
              return (
                <article className="mc-product-card pc-animated-card luxe-product-card" key={p.id}>
                  <div className="mc-product-media">
                    <img src={getProductImage(p)} alt={p.name} className="pc-zoom-media" />
                    <span className={p.stock > 0 ? 'mc-stock-badge in' : 'mc-stock-badge out'}>
                      {p.stock > 0
                        ? (isEn ? `${p.stock} in stock` : `${p.stock} en stock`)
                        : (isEn ? 'Out of stock' : 'Rupture')}
                    </span>
                  </div>
                  <div className="mc-product-body">
                    <span className="mc-product-cat">{p.category}</span>
                    <h3>{p.name}</h3>
                    <small className="mc-product-brand">
                      {p.brand ? `${p.brand} · ` : ''}{ph?.name || (isEn ? 'Verified pharmacy' : 'Officine vérifiée')}
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
                        <MapPin size={12} /> {ph?.area || ph?.city || (isEn ? 'Pharmacy' : 'Officine')}
                      </button>
                    </div>
                    <div className="mc-card-actions">
                      <button
                        type="button"
                        className="mc-outline-pill-btn"
                        onClick={() => {
                          if (onContactProduct) {
                            onContactProduct(p.pharmacyId, p.id);
                          } else {
                            setSelectedPharmacy(p.pharmacyId);
                            setSelectedProduct(p.id);
                            setModal('message');
                          }
                        }}
                      >
                        {isEn ? 'Ask pharmacy' : 'Contacter'}
                      </button>
                      {ph?.phone && (
                        <a
                          className="product-whatsapp-btn"
                          href={buildWhatsAppUrl(ph.phone, `Bonjour ${ph.name}, le produit "${p.name}" (${money(p.price)}) est-il disponible ?`)}
                          target="_blank"
                          rel="noreferrer"
                          title={isEn ? 'Contact on WhatsApp' : 'Contacter cette pharmacie sur WhatsApp'}
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
            <Empty
              title={isEn ? 'No products found' : 'Aucun produit trouvé'}
              detail={isEn ? 'No published product matches your search criteria.' : 'Aucun produit publié ne correspond à vos critères de recherche.'}
            />
          )}

          {filteredPublicProducts.length > 12 && !hasActiveFilters && (
            <div className="mc-center-btn-row">
              <button
                type="button"
                className="luxe-btn luxe-btn-primary"
                onClick={() => setShowAllProducts(true)}
              >
                {isEn ? `Show all (${filteredPublicProducts.length})` : `Afficher tout (${filteredPublicProducts.length})`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
