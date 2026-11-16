'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, X } from 'lucide-react';
import { AppData, isPharmacyActiveAndValid, money, officialCategories, Product } from '@/lib/shared';
import { getCategoryImage, getProductImage } from '@/lib/media';
import { PharmacyCard } from '@/components/shared/PharmacyCard';
import { Language, translations } from '@/lib/translations';
import {
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
  const [productFilter, setProductFilter] = useState('Tout');
  const t = translations[currentLang] || translations.fr;
  const isEn = currentLang === 'en';

  const verifiedPharmacies = data.pharmacies.filter(isPharmacyActiveAndValid);
  const categories = data.platformCategories?.length ? data.platformCategories : officialCategories;
  const featuredPharmacies = verifiedPharmacies.slice(0, 6);

  const filteredHomeProducts = useMemo(() => {
    if (productFilter === 'Tout') return publicProducts.slice(0, 8);
    if (productFilter === 'En stock') return publicProducts.filter(p => p.stock > 0).slice(0, 8);
    return publicProducts.filter(p => p.category === productFilter).slice(0, 8);
  }, [publicProducts, productFilter]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFilter?.(selectedCat);
    go('Produits', true);
  };

  const scrollToSection = (id: string) => {
    if (typeof document === 'undefined') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const serviceDescriptionsFr: Record<string, string> = {
    'Médicaments': 'Traitements courants et spécialités pharmaceutiques publiés par des officines vérifiées.',
    'Vitamines': 'Compléments nutritionnels, micronutrition et formules immunité pour toute la famille.',
    'Parapharmacie': 'Dermo-cosmétique, soins quotidiens et produits d’accompagnement officinal.',
    'Hygiène': 'Solutions antiseptiques, protection et hygiène médicale certifiée.',
    'Bébé & Maternité': 'Soins pédiatriques, laits infantiles et produits de maternité contrôlés.',
    'Matériel médical': 'Dispositifs de diagnostic, thermomètres, tensiomètres et suivi à domicile.',
  };

  const serviceDescriptionsEn: Record<string, string> = {
    'Médicaments': 'Essential treatments and certified pharmaceutical references from trusted pharmacies.',
    'Vitamines': 'Vitamins, immunity boosters and daily nutritional supplements.',
    'Parapharmacie': 'Dermatological skincare and everyday pharmacy wellness essentials.',
    'Hygiène': 'Certified antiseptics, masks and daily hygiene protection.',
    'Bébé & Maternité': 'Pediatric care, infant formulas and maternity essentials.',
    'Matériel médical': 'Precision diagnostic tools, thermometers and home monitoring devices.',
  };

  return (
    <div className="pc-home-luxe">
      {/* 1. HERO PLEIN ÉCRAN (CLONE EXACT LUXE STUDIO) */}
      <section id="home" className="luxe-hero">
        <div
          className="luxe-hero-bg"
          style={{ backgroundImage: "url('/images/pharmacy-interior.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />

        <div className="luxe-container luxe-hero-container">
          <div className="luxe-hero-content">
            <span className="luxe-hero-eyebrow">
              {isEn ? 'CERTIFIED PHARMACY NETWORK' : 'RÉSEAU PHARMACEUTIQUE AGRÉÉ'}
            </span>
            <h1 className="luxe-hero-title">
              {isEn ? 'Trusted Healthcare ' : 'La Santé d’Excellence '}
              <span className="luxe-accent-text">{isEn ? 'Near You' : 'Près de Vous'}</span>
            </h1>
            <p className="luxe-hero-subtitle">
              {isEn
                ? 'Where pharmaceutical rigor meets real-time availability to guide every patient to verified medicines and nearby pharmacies.'
                : 'Allier la rigueur officinale à la disponibilité en direct pour localiser vos médicaments et pharmacies agréées sans attente.'}
            </p>

            {/* Barre de recherche intégrée au hero */}
            <form className="luxe-hero-search" onSubmit={handleHeroSearch}>
              <div className="luxe-hero-search-input">
                <Search size={18} />
                <input
                  id="cg-top-quick-search-input"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  aria-label={isEn ? 'Search medicine or pharmacy' : 'Rechercher un médicament ou une pharmacie'}
                  placeholder={isEn ? 'Medicine, brand, pharmacy...' : 'Nom du médicament, marque ou pharmacie…'}
                />
                {query.trim().length > 0 && (
                  <button
                    type="button"
                    className="luxe-search-clear"
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
              <button type="submit" className="luxe-btn luxe-btn-primary luxe-search-btn">
                {isEn ? 'Search' : 'Rechercher'}
              </button>
            </form>

            <div className="luxe-hero-buttons">
              <button type="button" className="luxe-btn luxe-btn-primary" onClick={() => go('Produits')}>
                {isEn ? 'Browse Products' : 'Voir les produits'}
              </button>
              <button type="button" className="luxe-btn luxe-btn-outline" onClick={() => go('Pharmacies')}>
                {isEn ? 'Find a Pharmacy' : 'Trouver une pharmacie'}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="luxe-scroll-indicator"
          onClick={() => scrollToSection('about')}
          aria-label={isEn ? 'Scroll down' : 'Descendre'}
        >
          <span className="luxe-scroll-arrow" />
        </button>
      </section>

      {/* 2. À PROPOS & CHIFFRES CLÉS */}
      <section id="about" className="luxe-section">
        <div className="luxe-container">
          <div className="luxe-about-grid">
            <div className="luxe-about-image">
              <img src="/images/hero-pharmacist.jpg" alt="Pharmacien partenaire PharmaConnect" />
            </div>
            <div className="luxe-about-copy">
              <div className="luxe-section-header luxe-align-left">
                <span className="luxe-section-subtitle">{isEn ? 'ABOUT US' : 'À PROPOS'}</span>
                <h2 className="luxe-section-title">
                  {isEn ? (
                    <>Pharmaceutical Rigor<br />Modern Proximity</>
                  ) : (
                    <>Rigueur Officinale<br />Proximité Moderne</>
                  )}
                </h2>
              </div>
              <p className="luxe-lead">
                {isEn
                  ? 'PharmaConnect connects patients with accredited pharmacies and real-time verified medication inventories.'
                  : 'PharmaConnect relie chaque patient aux officines agréées grâce à un suivi transparent des disponibilités et des prix indicatifs.'}
              </p>
              <p className="luxe-body-copy">
                {isEn
                  ? 'Every listed pharmacy is verified administratively before publishing its catalog, duty hours and direct WhatsApp or phone lines.'
                  : 'Chaque établissement est vérifié avant publication : vous consultez les stocks déclarés, repérez les pharmacies de garde et échangez directement avec le pharmacien.'}
              </p>
              <div className="luxe-stats-row">
                <div className="luxe-stat-item">
                  <h3>{verifiedPharmacies.length}+</h3>
                  <p>{isEn ? 'Verified Pharmacies' : 'Pharmacies vérifiées'}</p>
                </div>
                <div className="luxe-stat-item">
                  <h3>{publicProducts.length}+</h3>
                  <p>{isEn ? 'Live Products' : 'Produits publiés'}</p>
                </div>
                <div className="luxe-stat-item">
                  <h3>24/7</h3>
                  <p>{isEn ? 'Duty Coverage' : 'Garde & urgence'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATÉGORIES & UNIVERS SANTÉ (FOND CRÈME #f5f1e8) */}
      <section id="services" className="luxe-section luxe-bg-cream">
        <div className="luxe-container">
          <div className="luxe-section-header luxe-text-center">
            <span className="luxe-section-subtitle">{isEn ? 'CATEGORIES' : 'UNIVERS SANTÉ'}</span>
            <h2 className="luxe-section-title">{isEn ? 'Comprehensive Health Catalog' : 'Nos Gammes Pharmaceutiques'}</h2>
            <p className="luxe-section-description">
              {isEn
                ? 'Explore verified health categories published directly by registered pharmacies.'
                : 'Parcourez l’ensemble des références santé publiées et actualisées par les pharmacies partenaires.'}
            </p>
          </div>

          <div className="luxe-services-grid">
            {categories.slice(0, 6).map(cat => (
              <article className="luxe-service-card" key={cat}>
                <div className="luxe-service-icon">
                  <img src={getCategoryImage(cat)} alt={cat} />
                </div>
                <h3>{cat}</h3>
                <p>
                  {(isEn ? serviceDescriptionsEn[cat] : serviceDescriptionsFr[cat]) ||
                    (isEn ? 'Verified references declared by partner pharmacies.' : 'Références contrôlées et publiées par les officines agréées.')}
                </p>
                <button
                  type="button"
                  className="luxe-inline-link"
                  onClick={() => {
                    setCategoryFilter?.(cat);
                    go('Produits');
                  }}
                >
                  {isEn ? 'Explore Category' : 'Voir la gamme'} <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUITS DISPONIBLES & PHARMACIES ENREGISTRÉES */}
      <section id="portfolio" className="luxe-section">
        <div className="luxe-container">
          <div className="luxe-section-header luxe-text-center">
            <span className="luxe-section-subtitle">{isEn ? 'LIVE INVENTORY' : 'CATALOGUE EN DIRECT'}</span>
            <h2 className="luxe-section-title">{isEn ? 'Available Products' : 'Produits Disponibles'}</h2>
            <p className="luxe-section-description">
              {isEn
                ? 'Check indicative pricing and live availability declared by verified partner pharmacies.'
                : 'Consultez les prix indicatifs et la disponibilité en temps réel publiés par nos officines partenaires.'}
            </p>
          </div>

          <div className="luxe-filter-bar">
            {['Tout', 'En stock', ...categories.slice(0, 4)].map(tab => (
              <button
                key={tab}
                type="button"
                className={`luxe-filter-btn ${productFilter === tab ? 'active' : ''}`}
                onClick={() => setProductFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredHomeProducts.length > 0 ? (
            <div className="mc-product-grid">
              {filteredHomeProducts.map(p => {
                const ph = data.pharmacies.find(x => x.id === p.pharmacyId);
                return (
                  <article className="mc-product-card pc-animated-card luxe-product-card" key={p.id}>
                    <div className="mc-product-media">
                      <img src={getProductImage(p)} alt={p.name} className="pc-zoom-media" />
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
            <div className="pc-visual-empty-showcase">
              <div className="pc-visual-empty-media">
                <img src="/images/hero-cinema-medicines.jpg" alt="Catalogue pharmaceutique" className="pc-banner-drift-img" />
              </div>
              <div className="pc-visual-empty-body">
                <span className="luxe-section-subtitle" style={{ marginBottom: 4 }}>
                  {isEn ? 'CATALOG' : 'CATALOGUE EN COURS'}
                </span>
                <b>{isEn ? 'No products published yet' : 'Aucun produit publié pour le moment'}</b>
                <p>
                  {isEn
                    ? 'Registered pharmacies can add and submit their medicines and health products from their workspace.'
                    : 'Dès qu’une pharmacie agréée publie ses références, elles apparaissent ici avec photo, prix et stock en direct.'}
                </p>
                <button type="button" className="luxe-btn luxe-btn-primary" onClick={() => go('Produits')}>
                  {isEn ? 'Open Catalog' : 'Explorer la page Produits'}
                </button>
              </div>
            </div>
          )}

          {/* Pharmacies enregistrées juste en dessous */}
          <div className="luxe-subsection-divider">
            <div className="cg-section-head">
              <div>
                <span className="luxe-section-subtitle" style={{ marginBottom: 6 }}>
                  {isEn ? 'OFFICIAL DIRECTORY' : 'ANNUAIRE OFFICIEL'}
                </span>
                <h2 className="luxe-section-title" style={{ marginBottom: 6 }}>{t.common.verifiedPharmacies}</h2>
                <p style={{ margin: 0, color: 'var(--text-light)' }}>{t.common.verifiedPharmaciesDesc}</p>
              </div>
              <button type="button" className="luxe-inline-link" onClick={() => go('Pharmacies')}>
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
              <div className="pc-visual-empty-showcase">
                <div className="pc-visual-empty-media">
                  <img src="/images/pharmacy-1.jpg" alt="Officine PharmaConnect" className="pc-banner-drift-img" />
                </div>
                <div className="pc-visual-empty-body">
                  <span className="luxe-section-subtitle" style={{ marginBottom: 4 }}>
                    {isEn ? 'NETWORK' : 'RÉSEAU OFFICINAL'}
                  </span>
                  <b>{isEn ? 'No active pharmacies registered yet' : 'Aucune pharmacie active enregistrée pour le moment'}</b>
                  <p>
                    {isEn
                      ? 'Register your pharmacy to appear in the verified directory.'
                      : 'Inscrivez votre pharmacie pour apparaître dans l’annuaire officiel après validation.'}
                  </p>
                  <button
                    type="button"
                    className="luxe-btn luxe-btn-primary"
                    onClick={() => {
                      setExistingAccountRegistration(false);
                      setModal('register');
                    }}
                  >
                    {isEn ? 'Register a pharmacy' : 'Inscrire une pharmacie'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. PARCOURS EN 4 ÉTAPES (FOND SOMBRE #2c2c2c) */}
      <section id="process" className="luxe-section luxe-bg-dark">
        <div className="luxe-container">
          <div className="luxe-section-header luxe-text-center">
            <span className="luxe-section-subtitle">{isEn ? 'PROCESS' : 'PARCOURS PATIENT'}</span>
            <h2 className="luxe-section-title luxe-text-white">
              {isEn ? 'Your Care Journey in 4 Steps' : 'Trouver Votre Traitement en 4 Étapes'}
            </h2>
            <p className="luxe-section-description luxe-text-muted-light">
              {isEn
                ? 'A simple, verified path from online stock lookup to in-person dispensing at your local pharmacy.'
                : 'Une démarche simple, rapide et sécurisée de la recherche en ligne jusqu’au retrait à l’officine.'}
            </p>
          </div>

          <div className="luxe-process-grid">
            <div className="luxe-process-step">
              <div className="luxe-step-number">01</div>
              <h4>{isEn ? 'Search' : 'Recherchez'}</h4>
              <p>{isEn ? 'Enter the medication name, category or neighborhood to view available references.' : 'Saisissez le médicament, la catégorie ou le quartier pour afficher les références.'}</p>
            </div>
            <div className="luxe-process-step">
              <div className="luxe-step-number">02</div>
              <h4>{isEn ? 'Verify Stock' : 'Vérifiez'}</h4>
              <p>{isEn ? 'Check indicative pricing, live stock status and 24/7 duty indicators.' : 'Consultez le prix indicatif, le stock déclaré et les officines de garde 24h/7j.'}</p>
            </div>
            <div className="luxe-process-step">
              <div className="luxe-step-number">03</div>
              <h4>{isEn ? 'Contact' : 'Contactez'}</h4>
              <p>{isEn ? 'Message the pharmacy directly or reach out via WhatsApp or phone.' : 'Échangez en un clic par messagerie interne, téléphone ou WhatsApp.'}</p>
            </div>
            <div className="luxe-process-step">
              <div className="luxe-step-number">04</div>
              <h4>{isEn ? 'Pick Up' : 'Retirez'}</h4>
              <p>{isEn ? 'Visit the verified pharmacy with pharmacist guidance and zero wasted trips.' : 'Rendez-vous directement à l’officine avec le conseil de votre pharmacien.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TÉMOIGNAGES */}
      <section id="testimonials" className="luxe-section">
        <div className="luxe-container">
          <div className="luxe-section-header luxe-text-center">
            <span className="luxe-section-subtitle">{isEn ? 'TESTIMONIALS' : 'TÉMOIGNAGES'}</span>
            <h2 className="luxe-section-title">{isEn ? 'Patients & Pharmacists' : 'Avis Patients & Officines'}</h2>
          </div>

          <div className="luxe-testimonials-grid">
            <article className="luxe-testimonial-card">
              <div className="luxe-testimonial-content">
                <p>
                  {isEn
                    ? '"Finding an on-duty pharmacy with the exact pediatric treatment took less than two minutes. Truly reassuring."'
                    : '« Trouver une pharmacie de garde disposant du traitement pédiatrique m’a pris moins de deux minutes. Un vrai soulagement. »'}
                </p>
              </div>
              <div className="luxe-testimonial-author">
                <img src="/images/hero-patient-smile.jpg" alt="Claire M." />
                <div>
                  <h5>Claire M.</h5>
                  <span>{isEn ? 'Patient' : 'Patiente'}</span>
                </div>
              </div>
            </article>

            <article className="luxe-testimonial-card">
              <div className="luxe-testimonial-content">
                <p>
                  {isEn
                    ? '"Our pharmacy receives qualified local inquiries every day while keeping full control over our stock updates."'
                    : '« Notre officine reçoit des demandes locales qualifiées chaque jour tout en gardant la maîtrise complète de nos stocks. »'}
                </p>
              </div>
              <div className="luxe-testimonial-author">
                <img src="/images/cta-pharmacist.jpg" alt="Dr. Jean-Luc K." />
                <div>
                  <h5>Dr. Jean-Luc K.</h5>
                  <span>{isEn ? 'Pharmacist Owner' : 'Pharmacien titulaire'}</span>
                </div>
              </div>
            </article>

            <article className="luxe-testimonial-card">
              <div className="luxe-testimonial-content">
                <p>
                  {isEn
                    ? '"Clear prices, verified pharmacies, and direct WhatsApp contact without useless back-and-forth across the city."'
                    : '« Des prix clairs, des pharmacies certifiées et un contact direct sans déplacements inutiles à travers la ville. »'}
                </p>
              </div>
              <div className="luxe-testimonial-author">
                <img src="/images/hero-smile.jpg" alt="Amina D." />
                <div>
                  <h5>Amina D.</h5>
                  <span>{isEn ? 'Family Caregiver' : 'Aidante familiale'}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 7. RUBRIQUE SANTÉ & ACTUALITÉS (FOND CRÈME #f5f1e8) */}
      <section id="blog" className="luxe-section luxe-bg-cream">
        <div className="luxe-container">
          <div className="luxe-section-header luxe-text-center">
            <span className="luxe-section-subtitle">{isEn ? 'HEALTH INSIGHTS' : 'RUBRIQUE SANTÉ'}</span>
            <h2 className="luxe-section-title">{isEn ? 'Prevention & Vigilance' : 'Conseils & Vigilance Santé'}</h2>
            <p className="luxe-section-description">
              {isEn
                ? 'Stay informed with official alerts, seasonal prevention tips and pharmacy news.'
                : 'Restez informé des alertes sanitaires, conseils saisonniers et actualités officinales.'}
            </p>
          </div>

          <div className="luxe-blog-grid">
            <article className="luxe-blog-card">
              <div className="luxe-blog-image">
                <img src="/images/hero-cinema-medicines.jpg" alt="Bon usage des médicaments" />
              </div>
              <div className="luxe-blog-content">
                <div className="luxe-blog-meta">
                  <span>{isEn ? 'Prevention' : 'Prévention'}</span>
                  <span className="luxe-blog-cat">{isEn ? 'Medications' : 'Médicaments'}</span>
                </div>
                <h3>{isEn ? 'Safe Medication Use & Dosage' : 'Bon usage et posologie sécurisée'}</h3>
                <p>
                  {isEn
                    ? 'Why checking active ingredients and pharmacist guidance prevents interactions.'
                    : 'Pourquoi vérifier la composition et demander conseil au pharmacien évite les interactions.'}
                </p>
                <button type="button" className="luxe-inline-link" onClick={() => go('Rubrique Santé')}>
                  {isEn ? 'Read More' : 'Lire la rubrique'} <ArrowRight size={14} />
                </button>
              </div>
            </article>

            <article className="luxe-blog-card">
              <div className="luxe-blog-image">
                <img src="/images/hero-cinema-vitamins.jpg" alt="Vitamines et immunité" />
              </div>
              <div className="luxe-blog-content">
                <div className="luxe-blog-meta">
                  <span>{isEn ? 'Wellness' : 'Bien-être'}</span>
                  <span className="luxe-blog-cat">{isEn ? 'Vitamins' : 'Vitamines'}</span>
                </div>
                <h3>{isEn ? 'Seasonal Immunity Essentials' : 'Soutenir l’immunité au quotidien'}</h3>
                <p>
                  {isEn
                    ? 'Key vitamins, hydration and preventive habits recommended by community pharmacists.'
                    : 'Les apports essentiels et réflexes de prévention recommandés par nos pharmaciens.'}
                </p>
                <button type="button" className="luxe-inline-link" onClick={() => go('Rubrique Santé')}>
                  {isEn ? 'Read More' : 'Lire la rubrique'} <ArrowRight size={14} />
                </button>
              </div>
            </article>

            <article className="luxe-blog-card">
              <div className="luxe-blog-image">
                <img src="/images/hero-cinema-care.jpg" alt="Pharmacies de garde et urgences" />
              </div>
              <div className="luxe-blog-content">
                <div className="luxe-blog-meta">
                  <span>24/7</span>
                  <span className="luxe-blog-cat">{isEn ? 'Duty Care' : 'Urgences'}</span>
                </div>
                <h3>{isEn ? 'Locating 24/7 Duty Pharmacies' : 'Repérer les officines de garde 24h/7j'}</h3>
                <p>
                  {isEn
                    ? 'Use geolocation and duty badges to reach an open pharmacy at night or on weekends.'
                    : 'Utilisez la géolocalisation et les badges de garde pour joindre une officine ouverte.'}
                </p>
                <button type="button" className="luxe-inline-link" onClick={() => go('Pharmacies')}>
                  {isEn ? 'View Directory' : 'Voir l’annuaire'} <ArrowRight size={14} />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 8. REJOINDRE OU CONTACTER PHARMACONNECT */}
      <section id="contact" className="luxe-section">
        <div className="luxe-container">
          <div className="luxe-contact-grid">
            <div className="luxe-contact-cta-box">
              <span className="luxe-section-subtitle">{isEn ? 'PHARMACISTS' : 'ESPACE OFFICINES'}</span>
              <h2 className="luxe-section-title">
                {isEn ? 'Register Your Pharmacy' : 'Rejoindre le Réseau PharmaConnect'}
              </h2>
              <p className="luxe-body-copy">
                {isEn
                  ? 'Publish your catalog, activate your verified badge, and enjoy a 14-day free trial after administrative validation.'
                  : 'Publiez votre catalogue, obtenez votre badge de vérification officiel et profitez de 14 jours d’essai gratuit après validation.'}
              </p>
              <div className="luxe-hero-buttons" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="luxe-btn luxe-btn-primary"
                  onClick={() => {
                    setExistingAccountRegistration(false);
                    setModal('register');
                  }}
                >
                  {isEn ? 'Register Pharmacy' : 'Inscrire une pharmacie'}
                </button>
                <button type="button" className="luxe-btn luxe-btn-dark-outline" onClick={() => go('Contact')}>
                  {isEn ? 'Contact Team' : 'Nous contacter'}
                </button>
              </div>
            </div>

            <div className="luxe-contact-info-card">
              <div className="luxe-contact-item">
                <h5>{isEn ? 'Verification & Support' : 'Vérification & Support'}</h5>
                <p>
                  {isEn
                    ? 'Dedicated onboarding for accredited pharmacies and continuous catalog monitoring.'
                    : 'Accompagnement dédié pour chaque officine et contrôle qualité permanent.'}
                </p>
              </div>
              <div className="luxe-contact-item">
                <h5>{isEn ? 'Platform Access' : 'Accès Plateforme'}</h5>
                <p>
                  {isEn
                    ? 'Public directory accessible 24/7 on desktop, tablet and mobile.'
                    : 'Annuaire et catalogue accessibles 24h/24 sur ordinateur, tablette et mobile.'}
                </p>
              </div>
              <div className="luxe-contact-item">
                <h5>{isEn ? 'Direct Communication' : 'Lien Direct Patient–Officine'}</h5>
                <p>
                  {isEn
                    ? 'In-app messaging, phone and WhatsApp directly with the pharmacy.'
                    : 'Messagerie en fil de discussion, appel direct et WhatsApp avec l’officine.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
