'use client';

import React, { useState } from 'react';
import { ArrowRight, MapPin, Phone, Search, X } from 'lucide-react';
import { AppData, isPharmacyActiveAndValid, money, officialCategories, Product } from '@/lib/shared';
import { PharmacyCard } from '@/components/shared/PharmacyCard';
import { Language, translations } from '@/lib/translations';
import {
  ModernDigitalStoreIcon,
  ModernPackageBoxIcon,
  ModernVerifiedShieldIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl,
} from '@/components/shared/ModernIcons';

interface HomeViewProps {
  data: AppData;
  query: string;
  setQuery: (q: string) => void;
  setCategoryFilter?: (cat: string) => void;
  go: (p: string, keepQuery?: boolean) => void;
  publicProducts: Product[];
  setSelectedPharmacy: (id: number) => void;
  setSelectedProduct: (id: number | null) => void;
  setModal: (m: any) => void;
  setExistingAccountRegistration: (v: boolean) => void;
  currentLang?: Language;
}

export function HomeView({
  data,
  query,
  setQuery,
  setCategoryFilter,
  go,
  publicProducts,
  setSelectedPharmacy,
  setSelectedProduct,
  setModal,
  setExistingAccountRegistration,
  currentLang = 'fr',
}: HomeViewProps) {
  const [selectedCat, setSelectedCat] = useState('Toutes les catégories');
  const t = translations[currentLang] || translations.fr;
  const isEn = currentLang === 'en';

  const verifiedPharmacies = data.pharmacies.filter(isPharmacyActiveAndValid);
  const categories = data.platformCategories?.length ? data.platformCategories : officialCategories;
  const featuredProducts = publicProducts.slice(0, 8);
  const featuredPharmacies = verifiedPharmacies.slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFilter?.(selectedCat);
    go('Produits', true);
  };

  return (
    <div className="pc-home-clean">
      {/* 1. HERO COMPACT & RECHERCHE DIRECTE */}
      <section className="pc-clean-hero">
        <div className="pc-clean-hero-inner">
          <div className="pc-clean-hero-badge">
            <span className="cg-pulse-dot" />
            <span>
              {verifiedPharmacies.length} {isEn ? 'verified pharmacies' : 'pharmacies vérifiées'} · {publicProducts.length}{' '}
              {isEn ? 'products' : 'produits disponibles'}
            </span>
          </div>

          <h1>
            {isEn
              ? 'Find verified medications and pharmacies near you'
              : 'Trouvez vos médicaments et pharmacies agréées près de chez vous'}
          </h1>
          <p>
            {isEn
              ? 'Check live indicative prices and stocks published by registered pharmacies, then contact them directly.'
              : 'Consultez les produits, prix indicatifs et stocks publiés par les pharmacies enregistrées et contactez l’officine directement.'}
          </p>

          <form className="pc-clean-search-bar" onSubmit={handleHeroSearch}>
            <div className="pc-clean-search-input">
              <Search size={18} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label={isEn ? 'Search medicine or pharmacy' : 'Rechercher un médicament ou une pharmacie'}
                placeholder={isEn ? 'Medicine, brand, pharmacy...' : 'Nom du médicament, marque ou pharmacie…'}
              />
              {query.trim().length > 0 && (
                <button
                  type="button"
                  className="pc-search-clear-btn"
                  onClick={() => setQuery('')}
                  aria-label={isEn ? 'Clear search' : 'Effacer la recherche'}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              aria-label={isEn ? 'Category' : 'Catégorie'}
            >
              <option value="Toutes les catégories">
                {isEn ? 'All categories' : 'Toutes les catégories'}
              </option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit" className="cg-btn-pine pc-clean-search-submit">
              {isEn ? 'Search' : 'Rechercher'} <ArrowRight size={15} />
            </button>
          </form>

          <div className="pc-clean-hero-links">
            <button type="button" className="pc-clean-pill-link" onClick={() => go('Produits')}>
              <ModernPackageBoxIcon size={15} />
              <span>{isEn ? 'Browse products' : 'Explorer les produits'}</span>
            </button>
            <button type="button" className="pc-clean-pill-link" onClick={() => go('Pharmacies')}>
              <ModernDigitalStoreIcon size={15} />
              <span>{isEn ? 'View pharmacies' : 'Voir les pharmacies'}</span>
            </button>
            <button
              type="button"
              className="pc-clean-pill-link is-subtle"
              onClick={() => {
                setExistingAccountRegistration(false);
                setModal('register');
              }}
            >
              <ModernVerifiedShieldIcon size={15} />
              <span>{isEn ? 'Register a pharmacy' : 'Inscrire une pharmacie'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRODUITS ENREGISTRÉS & DISPONIBLES */}
      <section className="cg-section pc-home-section">
        <div className="cg-section-head">
          <div>
            <div className="cg-eyebrow">{isEn ? 'LIVE CATALOG' : 'CATALOGUE EN LIGNE'}</div>
            <h2>{isEn ? 'Available Products' : 'Produits disponibles'}</h2>
            <p>
              {isEn
                ? 'Published references with live price and stock declared by pharmacies.'
                : 'Références publiées avec prix indicatif et disponibilité déclarée par les officines.'}
            </p>
          </div>
          <button type="button" className="cg-link-btn" onClick={() => go('Produits')}>
            {isEn ? `All products (${publicProducts.length})` : `Tout le catalogue (${publicProducts.length})`} <ArrowRight size={15} />
          </button>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mc-product-grid">
            {featuredProducts.map(p => {
              const ph = data.pharmacies.find(x => x.id === p.pharmacyId);
              return (
                <article className="mc-product-card" key={p.id}>
                  <div className="mc-product-media">
                    {p.imageDataUrl ? <img src={p.imageDataUrl} alt={p.name} /> : <ModernPackageBoxIcon size={34} />}
                    <span className={p.stock > 0 ? 'mc-stock-badge in' : 'mc-stock-badge out'}>
                      {p.stock > 0 ? `${p.stock} en stock` : 'Indisponible'}
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
                        <MapPin size={12} /> {ph?.area || ph?.city || 'Voir officine'}
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
                        {isEn ? 'Ask pharmacy' : 'Contacter'}
                      </button>
                      {ph?.phone && (
                        <a
                          className="product-whatsapp-btn"
                          href={buildWhatsAppUrl(ph.phone, `Bonjour ${ph.name}, le produit "${p.name}" (${money(p.price)}) est-il disponible ?`)}
                          target="_blank"
                          rel="noreferrer"
                          title="Contacter sur WhatsApp"
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
        ) : (
          <div className="pc-clean-empty-box">
            <ModernPackageBoxIcon size={28} />
            <div>
              <b>{isEn ? 'No products published yet' : 'Aucun produit publié pour le moment'}</b>
              <p>
                {isEn
                  ? 'Registered pharmacies can add and submit their products from their workspace.'
                  : 'Les pharmacies enregistrées peuvent ajouter leurs produits depuis leur espace professionnel.'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 3. PHARMACIES ENREGISTRÉES & VÉRIFIÉES */}
      <section className="cg-section pc-home-section">
        <div className="cg-section-head">
          <div>
            <div className="cg-eyebrow">{isEn ? 'REGISTERED NETWORK' : 'RÉSEAU DE PROXIMITÉ'}</div>
            <h2>{t.common.verifiedPharmacies}</h2>
            <p>{t.common.verifiedPharmaciesDesc}</p>
          </div>
          <button type="button" className="cg-link-btn" onClick={() => go('Pharmacies')}>
            {t.common.allPharmacies} <ArrowRight size={15} />
          </button>
        </div>

        {featuredPharmacies.length > 0 ? (
          <div className="pharmacy-cards">
            {featuredPharmacies.map(p => (
              <PharmacyCard
                key={p.id}
                pharmacy={p}
                badges={data.badges}
                onOpen={() => {
                  setSelectedPharmacy(p.id);
                  go('Fiche pharmacie');
                }}
              />
            ))}
          </div>
        ) : (
          <div className="pc-clean-empty-box">
            <ModernDigitalStoreIcon size={28} />
            <div>
              <b>{isEn ? 'No active pharmacies registered yet' : 'Aucune pharmacie active enregistrée pour le moment'}</b>
              <p>
                {isEn
                  ? 'Register your pharmacy to appear in the verified directory.'
                  : 'Inscrivez votre pharmacie pour apparaître dans l’annuaire officiel après vérification.'}
              </p>
            </div>
            <button
              type="button"
              className="cg-btn-pine"
              onClick={() => {
                setExistingAccountRegistration(false);
                setModal('register');
              }}
            >
              {isEn ? 'Register' : 'Inscrire une pharmacie'}
            </button>
          </div>
        )}
      </section>

      {/* 4. ACCÈS RAPIDE PAR CATÉGORIE */}
      <section className="cg-section pc-home-section">
        <div className="cg-section-head">
          <div>
            <div className="cg-eyebrow">{isEn ? 'CATEGORIES' : 'CATÉGORIES'}</div>
            <h2>{isEn ? 'Browse by category' : 'Parcourir par catégorie'}</h2>
          </div>
        </div>
        <div className="pc-clean-cat-strip">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className="pc-clean-cat-chip"
              onClick={() => {
                setQuery('');
                setCategoryFilter?.(cat);
                go('Produits', true);
              }}
            >
              <span>{cat}</span>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
