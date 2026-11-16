'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, Search, Zap } from 'lucide-react';
import {
  AppData,
  Product,
  isPharmacyActiveAndValid,
  isProductFresh,
  money,
  officialCategories,
  SectionTitle,
  Empty,
} from '@/lib/shared';
import { Language } from '@/lib/translations';
import {
  ModernBabyCareIcon,
  ModernChatEncryptedIcon,
  ModernDermaDropIcon,
  ModernEmergency24Icon,
  ModernHeartVitalityIcon,
  ModernMedicalDeviceIcon,
  ModernPackageBoxIcon,
  ModernPillCapsuleIcon,
  ModernRadarPinIcon,
  ModernSearchMedicineIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl
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
  currentLang = 'fr'
}: ProductsViewProps) {
  const [simProduct, setSimProduct] = useState<'Paracétamol' | 'Vitamine C' | 'Sérum' | 'Thermomètre'>('Paracétamol');
  const [showAllProducts, setShowAllProducts] = useState(false);

  const validPharmacies = data.pharmacies.filter(isPharmacyActiveAndValid);
  const catalogCategories = data.platformCategories?.length ? data.platformCategories : officialCategories;
  const liveMatches = data.products
    .filter(
      p =>
        p.status === 'Publié' &&
        isProductFresh(p.stockUpdatedAt ?? p.updated, data.freshnessDays) &&
        validPharmacies.some(ph => ph.id === p.pharmacyId) &&
        `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(simProduct.toLowerCase()),
    )
    .slice(0, 2);

  const primaryPharmacy = validPharmacies[0];
  const hasActiveFilters =
    showAllProducts ||
    Boolean(query) ||
    categoryFilter !== 'Toutes les catégories' ||
    city !== 'Toutes les villes' ||
    availabilityFilter !== 'Toutes' ||
    Boolean(minPrice) ||
    Boolean(maxPrice);
  const displayedProducts = hasActiveFilters ? filteredPublicProducts : filteredPublicProducts.slice(0, 8);

  const mediclinicDeals = [
    {
      title: 'Conseil & Ordonnance',
      desc: 'Réponse directe en quelques minutes',
      tone: 'mint',
      icon: <ModernChatEncryptedIcon size={34} />,
      onClick: () => {
        if (!primaryPharmacy) {
          go('Pharmacies');
          return;
        }
        setSelectedPharmacy(primaryPharmacy.id);
        setSelectedProduct(null);
        setModal('message');
      }
    },
    {
      title: 'Officines Proches',
      desc: 'Trouvez la pharmacie ouverte à côté',
      tone: 'sage',
      icon: <ModernRadarPinIcon size={34} />,
      onClick: () => go('Pharmacies')
    },
    {
      title: 'Médicaments 24h/7j',
      desc: 'Stocks vérifiés & disponibilité réelle',
      tone: 'sky',
      icon: <ModernPillCapsuleIcon size={34} />,
      onClick: () => {
        setCategoryFilter('Médicaments');
        setAvailabilityFilter('Disponible');
      }
    },
    {
      title: 'Tests & Matériel',
      desc: 'Thermomètres, tensiomètres & suivi',
      tone: 'sand',
      icon: <ModernMedicalDeviceIcon size={34} />,
      onClick: () => setCategoryFilter('Matériel médical')
    }
  ];

  return (
    <div className="cg-page-container animate-fade-in">
      <SectionTitle
        eyebrow="CATALOGUE PUBLIC · MODÈLE OFFICINAL"
        badge={`${filteredPublicProducts.length} référence(s) vérifiée(s)`}
        title="Rechercher un produit ou soin"
        desc="Consultez les produits validés et vérifiez leur disponibilité déclarée par les pharmacies."
        icon={<ModernPackageBoxIcon size={24} />}
      />

      {/* ============================================================ */}
      {/* 1. HERO BANNER MODÈLE MEDICLINIC (PALETTE PINE / MENTHE)     */}
      {/* ============================================================ */}
      <section className="mc-hero-banner">
        <div className="mc-hero-copy">
          <h1>
            Vos Médicaments<br />
            Disponibles 24h/7j
          </h1>
          <p>
            Vérifiez les prix indicatifs et les stocks réels publiés par nos officines partenaires, puis contactez directement un pharmacien.
          </p>
          <div className="mc-hero-actions">
            <a href="#mc-catalog-section" className="cg-btn-pine">
              Explorer le catalogue <ArrowRight size={15} />
            </a>
            <button
              type="button"
              className="cg-btn-outline"
              onClick={() => {
                if (primaryPharmacy) setSelectedPharmacy(primaryPharmacy.id);
                setSelectedProduct(null);
                setModal('message');
              }}
            >
              Envoyer une demande
            </button>
          </div>
        </div>

        <div className="mc-hero-visual">
          <div className="mc-organic-shape-back" aria-hidden="true">
            <span className="mc-quote-glyph">“</span>
            <p>Ne vous déplacez plus sans vérifier le stock officinal</p>
            <ModernPackageBoxIcon size={40} />
          </div>
          <div className="mc-organic-shape-front" aria-hidden="true" />
          <img
            src="/images/hero-pharmacist.jpg"
            alt="Pharmacien conseil PharmaConnect"
            className="mc-hero-pharmacist-img"
          />
          <button
            type="button"
            className="mc-upload-prescription-pill"
            onClick={() => {
              if (primaryPharmacy) setSelectedPharmacy(primaryPharmacy.id);
              setSelectedProduct(null);
              setModal('message');
            }}
          >
            <span className="mc-pill-icon-orb"><FileText size={16} /></span>
            <span>
              <b>Demande &amp;</b>
              <small>Ordonnance</small>
            </span>
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. "SERVICES CLÉS POUR VOUS !" — 4 CARTES PASTEL MEDICLINIC  */}
      {/* ============================================================ */}
      <section className="mc-section">
        <h2 className="mc-section-title">Services &amp; Accès Rapides Pour Vous !</h2>
        <div className="mc-deals-grid">
          {mediclinicDeals.map((deal) => (
            <button
              type="button"
              key={deal.title}
              className={`mc-deal-card tone-${deal.tone}`}
              onClick={deal.onClick}
            >
              <div className="mc-deal-text">
                <h3>{deal.title}</h3>
                <p>{deal.desc}</p>
              </div>
              <div className="mc-deal-bottom">
                <span className="mc-deal-arrow">
                  <ArrowRight size={16} />
                </span>
                <span className="mc-deal-art">{deal.icon}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SIMULATEUR EN DIRECT & FILTRES                            */}
      {/* ============================================================ */}
      <section className="cg-simulator-section animate-fade-in-up" id="mc-catalog-section">
        <div className="cg-simulator-head">
          <div>
            <div className="cg-eyebrow" style={{ color: '#256f5b' }}>
              {currentLang === 'en' ? 'LIVE CATALOG LOOKUP' : 'RECHERCHE RAPIDE EN DIRECT'}
            </div>
            <h2>
              {currentLang === 'en' ? 'Check Live Medication Availability' : 'Vérifiez la disponibilité réelle d’un médicament'}
            </h2>
            <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
              {currentLang === 'en'
                ? 'Click a term below to inspect live published stock across certified pharmacies:'
                : 'Cliquez sur un produit ci-dessous pour consulter les disponibilités déclarées par nos officines :'}
            </p>
          </div>
          <button
            type="button"
            className="cg-btn-outline"
            onClick={() => {
              setCategoryFilter('Toutes les catégories');
              setQuery(simProduct);
            }}
          >
            <Search size={14} /> {currentLang === 'en' ? `Filter "${simProduct}"` : `Filtrer « ${simProduct} » dans le catalogue`}
          </button>
        </div>

        <div className="cg-sim-tag-row">
          {(['Paracétamol', 'Vitamine C', 'Sérum', 'Thermomètre'] as const).map(item => (
            <button
              key={item}
              type="button"
              className={`cg-sim-tag ${simProduct === item ? 'active' : ''}`}
              onClick={() => setSimProduct(item)}
            >
              <Zap size={13} style={{ marginRight: 4 }} />
              {item}
            </button>
          ))}
        </div>

        <div className="cg-sim-live-results">
          {liveMatches.length > 0 ? liveMatches.map(match => {
            const matchPh = validPharmacies.find(ph => ph.id === match.pharmacyId);
            return (
              <div className="cg-sim-pharm-card" key={match.id}>
                <div className="cg-sim-card-top">
                  <div>
                    <h4>{matchPh?.name || 'Officine vérifiée'}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {matchPh?.area || matchPh?.city || ''} · {match.name}
                    </span>
                  </div>
                  <span className="cg-sim-stock-pill">
                    <span className="cg-pulse-dot-guard" /> {match.stock > 0 ? `${match.stock} en stock` : 'Rupture'}
                  </span>
                </div>
                <div className="cg-sim-card-body">
                  <span>Prix affiché : <b>{money(match.price)}</b></span>
                  <button
                    type="button"
                    className="cg-card-action-btn"
                    onClick={() => {
                      setSelectedPharmacy(match.pharmacyId);
                      go('Fiche pharmacie');
                    }}
                  >
                    {currentLang === 'en' ? 'View pharmacy' : 'Voir l’officine'} <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="cg-sim-pharm-card">
              <div className="cg-sim-card-top">
                <div>
                  <h4>Aucun résultat immédiat pour « {simProduct} »</h4>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Essayez une recherche dans le catalogue complet ou contactez une officine.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="cg-category-pill-bar">
        <button
          type="button"
          className={`cg-cat-pill ${categoryFilter === 'Toutes les catégories' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('Toutes les catégories')}
        >
          <ModernPackageBoxIcon size={15} /> Toutes les catégories
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
        <div className="directory-tools">
          <div className="search-control">
            <ModernSearchMedicineIcon size={18} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Médicament, marque, code-barres, pharmacie…"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option>Toutes les catégories</option>
            {catalogCategories.map(c => <option key={c}>{c}</option>)}
          </select>
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
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="Prix min (FCFA)"
              style={{ maxWidth: 140 }}
            />
          )}
          {setMaxPrice && (
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="Prix max (FCFA)"
              style={{ maxWidth: 140 }}
            />
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. "PRODUITS DISPONIBLES POUR VOUS !" — GRILLE 4 COLONNES    */}
      {/* ============================================================ */}
      <section className="mc-section">
        <h2 className="mc-section-title">Produits Disponibles Pour Vous !</h2>
        <div className="cg-results-summary" style={{ marginBottom: 18 }}>
          <b>{filteredPublicProducts.length} produit(s) référencé(s)</b>
          <span>Informations déclarées sous la responsabilité de chaque établissement.</span>
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
                  <span className="mc-product-cat">{p.category} · {ph?.area || 'Officine'}</span>
                  <h3>{p.name}</h3>
                  <small className="mc-product-brand">{p.brand || 'Marque officinale'}</small>
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
                      {ph?.name || 'Officine'} →
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
                      + Demander
                    </button>
                    <a
                      className="product-whatsapp-btn"
                      href={buildWhatsAppUrl(ph?.phone || '', `Bonjour ${ph?.name || ''}, le produit "${p.name}" (${money(p.price)}) est-il disponible ?`)}
                      target="_blank"
                      rel="noreferrer"
                      title="Appeler ou contacter cette pharmacie sur WhatsApp"
                    >
                      <ModernWhatsAppIcon size={15} /> WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredPublicProducts.length === 0 && (
          <Empty title="Aucun produit trouvé" detail="Aucun produit publié ne correspond à vos critères de recherche." />
        )}

        {filteredPublicProducts.length > 8 && !showAllProducts && (
          <div className="mc-center-btn-row">
            <button
              type="button"
              className="cg-btn-pine"
              onClick={() => setShowAllProducts(true)}
            >
              Voir tout le catalogue ({filteredPublicProducts.length})
            </button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. BENTO PROMOTIONNELLE ASYMÉTRIQUE (1 GAUCHE + 2 DROITE)    */}
      {/* ============================================================ */}
      <section className="mc-promo-bento">
        <div className="mc-bento-tall">
          <div className="mc-bento-copy">
            <span className="mc-bento-tag-red">ESSENTIELS SANTÉ</span>
            <h3>Vitamines &amp; Compléments</h3>
            <p>Renforcez votre vitalité quotidienne avec des références certifiées en officine.</p>
            <button
              type="button"
              className="cg-btn-pine"
              onClick={() => {
                setCategoryFilter('Vitamines');
                setShowAllProducts(true);
              }}
            >
              Découvrir
            </button>
          </div>
          <img src="/images/prod-vitaminc.jpg" alt="Vitamines et compléments" className="mc-bento-product-img tall" />
        </div>

        <div className="mc-bento-stack">
          <div className="mc-bento-wide tone-sand">
            <div className="mc-bento-copy">
              <small>Dermo &amp; Soins quotidiens</small>
              <h3>Parapharmacie &amp; Hygiène</h3>
              <button
                type="button"
                className="mc-bento-warm-btn"
                onClick={() => {
                  setCategoryFilter('Parapharmacie');
                  setShowAllProducts(true);
                }}
              >
                Voir les soins
              </button>
            </div>
            <img src="/images/prod-creme.jpg" alt="Parapharmacie" className="mc-bento-product-img" />
          </div>

          <div className="mc-bento-wide tone-sky">
            <div className="mc-bento-copy">
              <small>Contrôle &amp; Équipements</small>
              <h3>Matériel Médical &amp; Bébé</h3>
              <button
                type="button"
                className="mc-bento-sky-btn"
                onClick={() => {
                  setCategoryFilter('Matériel médical');
                  setShowAllProducts(true);
                }}
              >
                Voir le matériel
              </button>
            </div>
            <img src="/images/prod-thermometer.jpg" alt="Matériel médical" className="mc-bento-product-img" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SPLIT EXPERT PHARMACIEN + AVIS CLIENTS (MODÈLE MEDICLINIC)*/}
      {/* ============================================================ */}
      <section className="mc-expert-section">
        <div className="mc-expert-media">
          <img src="/images/pharmacy-interior.jpg" alt="Équipe officinale vérifiée" className="mc-expert-photo" />
          <div className="mc-expert-floating-card">
            <span className="mc-floating-title">Réseau d’officines contrôlées par l’administration</span>
            <div className="mc-floating-person">
              <img src="/images/hero-pharmacist.jpg" alt="Pharmacien partenaire" />
              <div>
                <b>{primaryPharmacy?.responsible || 'Pharmacien titulaire'}</b>
                <small>{primaryPharmacy ? primaryPharmacy.name : 'Réseau officiel PharmaConnect'}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="mc-expert-copy">
          <span className="cg-eyebrow">À PROPOS DU CATALOGUE</span>
          <h2>Consultez un Pharmacien par Message ou WhatsApp</h2>
          <p>
            Chaque fiche produit publiée sur PharmaConnect est rattachée à une pharmacie agréée. Avant de vous déplacer, confirmez la disponibilité ou posez vos questions en direct.
          </p>
          <ul className="mc-expert-checklist">
            <li><CheckCircle2 size={17} /> Prix indicatifs transparents déclarés par l’officine</li>
            <li><CheckCircle2 size={17} /> Contact WhatsApp ou messagerie confidentielle en 1 clic</li>
            <li><CheckCircle2 size={17} /> Aucun paiement ni commande en ligne imposé</li>
          </ul>
          <button
            type="button"
            className="cg-btn-pine"
            onClick={() => {
              if (primaryPharmacy) setSelectedPharmacy(primaryPharmacy.id);
              setSelectedProduct(null);
              setModal('message');
            }}
          >
            Contacter une pharmacie
          </button>
        </div>
      </section>
    </div>
  );
}
