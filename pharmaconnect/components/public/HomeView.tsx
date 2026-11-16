'use client';

import React, { useState } from 'react';
import {
  ArrowRight, HeartPulse, Lock,
  Play, Search, X
} from 'lucide-react';
import { AppData, isPharmacyActiveAndValid, Product } from '@/lib/shared';
import { PharmacyCard } from '@/components/shared/PharmacyCard';
import { HealthCinemaHero } from '@/components/public/HealthCinemaHero';
import { Language, translations } from '@/lib/translations';
import {
  ModernBabyCareIcon,
  ModernBrandLogoIcon,
  ModernCalendarBookingIcon,
  ModernDermaDropIcon,
  ModernDigitalStoreIcon,
  ModernEmergency24Icon,
  ModernFamilyCareIcon,
  ModernHeartVitalityIcon,
  ModernLivePulseIcon,
  ModernMedicalDeviceIcon,
  ModernPackageBoxIcon,
  ModernPillCapsuleIcon,
  ModernRadarPinIcon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon
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
  setSelectedProduct: _setSelectedProduct,
  setModal,
  setExistingAccountRegistration,
  currentLang = 'fr'
}: HomeViewProps) {
  const [activeHeroImg, setActiveHeroImg] = useState(0);
  const t = translations[currentLang] || translations.fr;

  const heroVisuals = [
    {
      src: '/images/hero-smile.jpg',
      alt: currentLang === 'en' ? 'Patient receiving warm pharmacy care' : 'Patient accueilli avec le sourire dans une pharmacie partenaire',
      label: currentLang === 'en' ? 'Patient Care' : 'Accueil Patient'
    },
    {
      src: '/images/hero-pharmacist.jpg',
      alt: currentLang === 'en' ? 'Lead Pharmacist at PharmaConnect Partner Pharmacy' : 'Pharmacien conseil PharmaConnect',
      label: currentLang === 'en' ? 'Pharmacist' : 'Pharmacien'
    },
    {
      src: '/images/pharmacy-interior.jpg',
      alt: currentLang === 'en' ? 'Modern Certified Pharmacy Interior' : 'Officine moderne partenaire',
      label: currentLang === 'en' ? 'Modern Pharmacy' : 'Officine'
    }
  ];

  const activeVisual = heroVisuals[activeHeroImg] || heroVisuals[0];
  const verifiedPharmacies = data.pharmacies.filter(isPharmacyActiveAndValid);
  const [finderQuery, setFinderQuery] = useState('');
  const [finderCategory, setFinderCategory] = useState('');

  const goToCategory = (cat: string) => {
    setQuery('');
    setCategoryFilter?.(cat);
    go('Produits', true);
  };

  const cleargrinServices = [
    {
      title: t.services.items[0]?.title || 'Soins Généraux',
      desc: t.services.items[0]?.desc || 'Médicaments essentiels, conseils & délivrance sécurisée.',
      icon: <ModernPillCapsuleIcon size={25} />,
      onClick: () => goToCategory('Médicaments')
    },
    {
      title: t.services.items[1]?.title || 'Spécialités & Vitalité',
      desc: t.services.items[1]?.desc || 'Suivi tensionnel, glycémie & vitamines énergétiques.',
      icon: <ModernHeartVitalityIcon size={25} />,
      onClick: () => goToCategory('Vitamines')
    },
    {
      title: t.services.items[2]?.title || 'Matériel Médical',
      desc: t.services.items[2]?.desc || 'Tensiomètres, thermomètres & matériel de maintien.',
      icon: <ModernMedicalDeviceIcon size={25} />,
      onClick: () => goToCategory('Matériel médical')
    },
    {
      title: t.services.items[3]?.title || 'Dermatologie & Soins',
      desc: t.services.items[3]?.desc || 'Parapharmacie, hygiène & dermo-cosmétique ciblée.',
      icon: <ModernDermaDropIcon size={25} />,
      onClick: () => goToCategory('Parapharmacie')
    },
    {
      title: t.services.items[4]?.title || 'Bébé & Maternité',
      desc: t.services.items[4]?.desc || 'Nutrition infantile, soins douceur & périnatalité.',
      icon: <ModernBabyCareIcon size={25} />,
      onClick: () => goToCategory('Bébé & maternité')
    },
    {
      title: t.services.items[5]?.title || 'Urgences & Gardes',
      desc: t.services.items[5]?.desc || 'Permanence des soins et officines ouvertes 24h/7j.',
      icon: <ModernEmergency24Icon size={25} />,
      onClick: () => go('Pharmacies')
    }
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* 0A. BARRE DE RECHERCHE RAPIDE EN HAUT DE LA PAGE D'ACCUEIL   */}
      {/* ============================================================ */}
      <div id="cg-top-quick-search" className="pc-top-search-dock">
        <div className="cg-quick-tags-container cg-quick-bar-wide pc-top-search-inner">
          <form
            className="cg-inline-quick-search pc-animated-search"
            onSubmit={(e) => {
              e.preventDefault();
              go('Produits', true);
            }}
          >
            <Search size={16} />
            <input
              id="cg-top-quick-search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label={currentLang === 'en' ? 'Quick search medicine or pharmacy' : 'Recherche rapide médicament ou pharmacie'}
              placeholder={currentLang === 'en' ? 'Quick search: medicine, brand, pharmacy...' : 'Recherche rapide : médicament, marque, pharmacie…'}
            />
            {query.trim().length > 0 && (
              <button
                type="button"
                className="pc-search-clear-btn"
                onClick={() => setQuery('')}
                aria-label={currentLang === 'en' ? 'Clear search' : 'Effacer la recherche'}
              >
                <X size={14} />
              </button>
            )}
            <button type="submit" className="pc-btn-shine">
              <span>{currentLang === 'en' ? 'Find' : 'Trouver'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
          <div className="cg-quick-tags-pills">
            <span className="cg-tags-label">{t.common.quickTags}</span>
            {['Paracétamol', 'Vitamine C', 'Gel désinfectant', 'Thermomètre', 'Masques'].map(tag => (
              <button
                key={tag}
                type="button"
                className="cg-tag-btn"
                onClick={() => {
                  setQuery(tag);
                  go('Produits', true);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 0B. VITRINE ANIMÉE SANTÉ — CRISTAL 3D, NÉBULEUSE & ORBITE    */}
      {/* ============================================================ */}
      <HealthCinemaHero
        pharmaciesCount={verifiedPharmacies.length}
        productsCount={publicProducts.length}
        onExplorePharmacies={() => go('Pharmacies')}
        onExploreProducts={() => go('Produits')}
        onScrollToFinder={() => {
          document.getElementById('cg-finder-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        currentLang={currentLang}
      />

      {/* ============================================================ */}
      {/* 1. SECTION PORTRAIT & RECHERCHE RAPIDE                       */}
      {/* ============================================================ */}
      <section id="cg-finder-anchor" className="cg-hero cg-hero-cleargrin animate-fade-in">
        <div className="cg-hero-content cg-hero-content-cleargrin">
          {/* Colonne Gauche : Portrait, confiance & actions directes */}
          <div className="cg-hero-center-cleargrin cg-hero-visual-panel animate-fade-in">
            <div className="cg-hero-kicker">
              <span className="cg-pulse-dot" />
              {t.hero.kicker}
            </div>

            <div className="cg-cleargrin-portrait-stage">
              <div className="cg-cleargrin-portrait-halo" aria-hidden="true" />
              <img
                src={activeVisual.src}
                alt={activeVisual.alt}
                className="cg-cleargrin-portrait-img"
              />
            </div>

            <div className="cg-hero-thumb-switcher cg-thumb-switcher-subtle" role="tablist" aria-label="Choisir le visuel principal">
              {heroVisuals.map((item, idx) => (
                <button
                  key={item.src}
                  type="button"
                  role="tab"
                  aria-selected={activeHeroImg === idx}
                  className={`cg-hero-thumb-btn ${activeHeroImg === idx ? 'active' : ''}`}
                  onClick={() => setActiveHeroImg(idx)}
                >
                  <img src={item.src} alt={item.label} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="cg-hero-actions cg-hero-actions-centered">
              <button className="cg-btn-pine" onClick={() => go('Pharmacies')}>
                {t.hero.bookAppointment} <ArrowRight size={15} />
              </button>
              <button className="cg-btn-outline" onClick={() => go('Produits')}>
                <Play size={14} fill="currentColor" /> {t.hero.watchVideo}
              </button>
            </div>

            <div className="cg-trust-row">
              <div className="cg-trust-item">
                <span className="cg-trust-icon"><ModernVerifiedShieldIcon size={18} /></span>
                <div>
                  <b>{t.hero.trustCare}</b>
                  <small>{t.hero.trustCareSub}</small>
                </div>
              </div>
              <div className="cg-trust-item">
                <span className="cg-trust-icon"><ModernFamilyCareIcon size={18} /></span>
                <div>
                  <b>{t.hero.allAges}</b>
                  <small>{t.hero.allAgesSub}</small>
                </div>
              </div>
              <div className="cg-trust-item">
                <span className="cg-trust-icon"><ModernLivePulseIcon size={18} /></span>
                <div>
                  <b>{t.hero.modernTech}</b>
                  <small>{t.hero.modernTechSub}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Carte Flottante Cleargrin "Prendre rendez-vous / Recherche" */}
          <div className="cg-hero-right animate-fade-in-up">
            <div className="cg-booking-card cg-booking-card-cleargrin">
              <div className="cg-booking-header">
                <div className="cg-booking-icon">
                  <ModernCalendarBookingIcon size={23} />
                </div>
                <div>
                  <h3>{t.hero.bookingTitle}</h3>
                  <p>{t.hero.bookingDesc}</p>
                </div>
              </div>

              <form
                className="cg-booking-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const qTerm = finderQuery.trim();
                  if (finderCategory === 'emergency') {
                    setQuery(qTerm);
                    go('Pharmacies', Boolean(qTerm));
                    return;
                  }
                  if (finderCategory) setCategoryFilter?.(finderCategory);
                  else setCategoryFilter?.('Toutes les catégories');
                  setQuery(qTerm);
                  go(qTerm || finderCategory ? 'Produits' : 'Pharmacies', Boolean(qTerm || finderCategory));
                }}
              >
                <div className="cg-input-wrap">
                  <Search size={16} />
                  <input
                    value={finderQuery}
                    onChange={e => setFinderQuery(e.target.value)}
                    placeholder={t.hero.fullName}
                    aria-label={t.hero.fullName}
                  />
                </div>
                <div className="cg-input-wrap">
                  <HeartPulse size={16} />
                  <select
                    value={finderCategory}
                    onChange={e => setFinderCategory(e.target.value)}
                    aria-label={t.hero.selectService}
                  >
                    <option value="">{t.hero.selectService}</option>
                    <option value="Médicaments">{t.hero.services.general}</option>
                    <option value="Vitamines">{t.hero.services.orthodontics}</option>
                    <option value="Bébé & maternité">{t.hero.services.pediatric}</option>
                    <option value="emergency">{t.hero.services.emergency}</option>
                  </select>
                </div>
                <button type="submit" className="cg-btn-pine cg-btn-block" style={{ marginTop: 4 }}>
                  {t.hero.bookNow} <ArrowRight size={15} />
                </button>
                <div className="cg-secure-badge">
                  <Lock size={13} />
                  <span>{t.hero.secureInfo}</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. NOS SERVICES — 6 CARTES VERTICALES ÉPURÉES MODÈLE 1       */}
      {/* ============================================================ */}
      <section className="cg-section">
        <div className="cg-section-head">
          <div>
            <div className="cg-eyebrow">{t.services.eyebrow}</div>
            <h2>{t.services.title}</h2>
            <p>{t.services.desc}</p>
          </div>
          <button className="cg-link-btn" onClick={() => go('Produits')}>
            {t.services.viewAll} <ArrowRight size={15} />
          </button>
        </div>

        <div className="cg-cleargrin-services-grid">
          {cleargrinServices.map((srv) => (
            <button
              type="button"
              key={srv.title}
              className="cg-cleargrin-service-card"
              onClick={srv.onClick}
            >
              <span className="cg-cleargrin-service-icon">
                {srv.icon}
              </span>
              <h3>{srv.title}</h3>
              <p>{srv.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. APPROCHE MODERNE (SPLIT PHOTO) + MESSAGE PRINCIPAL        */}
      {/* ============================================================ */}
      <section className="cg-section cg-approach-section">
        <div className="cg-cleargrin-approach-grid">
          <div className="cg-cleargrin-split-banner">
            <div className="cg-cleargrin-split-copy">
              <div className="cg-eyebrow">{t.approach.kicker}</div>
              <h2>{t.approach.title1}<br />{t.approach.title2}</h2>
              <p>{t.approach.desc}</p>
              <button className="cg-btn-pine" onClick={() => go('À propos')}>
                {t.approach.learnMore} <ArrowRight size={15} />
              </button>
            </div>
            <div className="cg-cleargrin-split-photo">
              <img
                src="/images/clinic-reception.jpg"
                alt={currentLang === 'en' ? 'Modern Pharmacy Reception Space' : 'Espace accueil moderne d’une officine partenaire'}
              />
              <div className="cg-clinic-badge sp-clinic-badge-glass">
                <ModernVerifiedShieldIcon size={17} />
                <span>{t.approach.badge}</span>
              </div>
            </div>
          </div>

          <div className="cg-hero-statement-slot animate-fade-in-up">
            <h2 className="cg-hero-title cg-hero-title-stacked">
              {currentLang === 'fr' ? (
                <>
                  <span className="cg-title-dark">Des Soins Proches</span>
                  <span className="cg-title-row-smile">
                    <span className="cg-title-dark">
                      Sourires & Santé
                      <svg className="cg-title-curve" viewBox="0 0 140 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 18C45 4 95 4 136 18" stroke="#4fa88d" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="cg-handwriting">{t.hero.handwriting}</span>
                  </span>
                  <span className="cg-title-mint-line">Une Vie Plus Saine</span>
                </>
              ) : (
                <>
                  <span className="cg-title-dark">Verified Stock</span>
                  <span className="cg-title-row-smile">
                    <span className="cg-title-dark">
                      Trusted Care
                      <svg className="cg-title-curve" viewBox="0 0 140 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 18C45 4 95 4 136 18" stroke="#4fa88d" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="cg-handwriting">{t.hero.handwriting}</span>
                  </span>
                  <span className="cg-title-mint-line">Happier Lives</span>
                </>
              )}
            </h2>

            <p className="cg-hero-desc">{t.hero.desc}</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. APERÇU OFFICINES & PORTAILS VERS LES PAGES SÉPARÉES       */}
      {/* ============================================================ */}
      <section className="cg-section">
        <div className="cg-section-head">
          <div>
            <div className="cg-eyebrow">{currentLang === 'en' ? 'LOCAL HEALTH NETWORK' : 'RÉSEAU DE PROXIMITÉ'}</div>
            <h2>{t.common.verifiedPharmacies}</h2>
            <p>{t.common.verifiedPharmaciesDesc}</p>
          </div>
          <button className="cg-link-btn" onClick={() => go('Pharmacies')}>
            {t.common.allPharmacies} <ArrowRight size={15} />
          </button>
        </div>

        <div className="pharmacy-cards">
          {verifiedPharmacies.slice(0, 3).map(p => (
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

        <div className="sp-pages-directory-grid">
          <button type="button" className="sp-page-portal-card" onClick={() => go('Pharmacies')}>
            <span className="sp-portal-ico"><ModernRadarPinIcon size={21} /></span>
            <div>
              <strong>{currentLang === 'en' ? 'Pharmacy Directory & GPS' : 'Annuaire & Gardes 24h/7j'}</strong>
              <small>{verifiedPharmacies.length} {currentLang === 'en' ? 'verified pharmacies on map' : 'officines vérifiées géolocalisées'}</small>
            </div>
            <ArrowRight size={16} className="sp-portal-arrow" />
          </button>

          <button type="button" className="sp-page-portal-card" onClick={() => go('Produits')}>
            <span className="sp-portal-ico"><ModernPackageBoxIcon size={21} /></span>
            <div>
              <strong>{currentLang === 'en' ? 'Simulator & Live Catalog' : 'Simulateur & Catalogue Produits'}</strong>
              <small>{publicProducts.length} {currentLang === 'en' ? 'verified references in stock' : 'références vérifiées en stock'}</small>
            </div>
            <ArrowRight size={16} className="sp-portal-arrow" />
          </button>

          <button type="button" className="sp-page-portal-card" onClick={() => go('À propos')}>
            <span className="sp-portal-ico"><ModernBrandLogoIcon size={21} /></span>
            <div>
              <strong>{currentLang === 'en' ? 'How It Works & Ecosystem' : 'Comment ça marche & Écosystème'}</strong>
              <small>{currentLang === 'en' ? '3-step guide & KAYRA Innovation' : 'Parcours en 3 étapes & mission'}</small>
            </div>
            <ArrowRight size={16} className="sp-portal-arrow" />
          </button>

          <div
            role="button"
            tabIndex={0}
            className="sp-page-portal-card"
            onClick={() => go('Tarifs')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('Tarifs'); } }}
          >
            <span className="sp-portal-ico"><ModernSparkleCrownIcon size={21} /></span>
            <div>
              <strong>{currentLang === 'en' ? 'Pricing, FAQ & Pro Onboarding' : 'Tarifs, FAQ & Espace Officine'}</strong>
              <small>{currentLang === 'en' ? '14-day free trial for pharmacies' : '14 jours gratuits & réponses clés'}</small>
            </div>
            <button
              type="button"
              className="sp-portal-subpill"
              onClick={(e) => {
                e.stopPropagation();
                setExistingAccountRegistration(false);
                setModal('register');
              }}
            >
              <ModernDigitalStoreIcon size={12} /> {currentLang === 'en' ? 'Join' : 'Inscrire'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
