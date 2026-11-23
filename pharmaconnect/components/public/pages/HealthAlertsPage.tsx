'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Newspaper,
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { Empty } from '@/lib/shared';
import { PageTransitionStage } from '@/components/shared/MotionStage';
import { Language } from '@/lib/translations';
import {
  AlertSeverity,
  DEFAULT_EMERGENCY_NUMBERS,
  DEFAULT_HEALTH_ALERTS,
  DEFAULT_HEALTH_NEWS,
  EmergencyCategory,
  EmergencyNumberItem,
  HealthAlertItem,
  HealthNewsItem,
} from '@/lib/health-section';
import {
  ModernAlertWarningIcon,
  ModernBellAlertIcon,
  ModernClipboardStockIcon,
  ModernEmergency24Icon,
  ModernLivePulseIcon,
  ModernPhoneCallIcon,
  ModernVerifiedShieldIcon,
} from '@/components/shared/ModernIcons';

export type HealthSubPage = 'alerts' | 'news' | 'emergency';

interface HealthAlertsPageProps {
  go: (p: string) => void;
  say: (s: string) => void;
  currentLang?: Language;
  onSelectCategory?: (category: string) => void;
  activeSubPage?: HealthSubPage;
  onSubPageChange?: (sub: HealthSubPage) => void;
}

export function HealthAlertsPage({
  go,
  say,
  currentLang = 'fr',
  onSelectCategory,
  activeSubPage,
  onSubPageChange,
}: HealthAlertsPageProps) {
  const isEn = currentLang === 'en';
  const [internalSubPage, setInternalSubPage] = useState<HealthSubPage>('alerts');
  const currentSubPage = activeSubPage ?? internalSubPage;

  const selectSubPage = (sub: HealthSubPage) => {
    setInternalSubPage(sub);
    onSubPageChange?.(sub);
  };

  const [alertsList, setAlertsList] = useState<HealthAlertItem[]>(() =>
    DEFAULT_HEALTH_ALERTS.filter(a => a.active !== false),
  );
  const [newsList, setNewsList] = useState<HealthNewsItem[]>(() =>
    DEFAULT_HEALTH_NEWS.filter(n => n.active !== false).map(n =>
      n.targetCategory === 'Vitamines & bien-être' ? { ...n, targetCategory: 'Vitamines' } : n,
    ),
  );
  const [numbersList, setNumbersList] = useState<EmergencyNumberItem[]>(() =>
    DEFAULT_EMERGENCY_NUMBERS.filter(e => e.active !== false),
  );

  const [emergencyCat, setEmergencyCat] = useState<EmergencyCategory>('all');
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(DEFAULT_HEALTH_NEWS[0]?.id ?? null);

  useEffect(() => {
    let active = true;
    fetch('/api/public/health-section', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload) return;
        if (Array.isArray(payload.alerts)) {
          const activeAlerts = payload.alerts.filter((a: HealthAlertItem) => a.active !== false);
          if (activeAlerts.length > 0) setAlertsList(activeAlerts);
        }
        if (Array.isArray(payload.news)) {
          const visibleNews = payload.news.filter((n: HealthNewsItem) => n.active !== false);
          if (visibleNews.length > 0) {
            setNewsList(visibleNews);
            if (visibleNews[0]?.id) {
              setExpandedNewsId(prev => (visibleNews.some((n: HealthNewsItem) => n.id === prev) ? prev : visibleNews[0].id));
            }
          }
        }
        if (Array.isArray(payload.emergencyNumbers)) {
          const activeNumbers = payload.emergencyNumbers.filter((e: EmergencyNumberItem) => e.active !== false);
          if (activeNumbers.length > 0) setNumbersList(activeNumbers);
        }
      })
      .catch(() => { /* Garde le contenu santé par défaut. */ });
    return () => { active = false; };
  }, []);

  const normalizedQuery = searchTerm.trim().toLowerCase();

  const filteredNumbers = useMemo(() => {
    return numbersList.filter(item => {
      if (emergencyCat !== 'all' && item.category !== emergencyCat) return false;
      if (!normalizedQuery) return true;
      const hay = `${item.number} ${item.secondaryNumber || ''} ${item.titleFr} ${item.titleEn} ${item.serviceFr} ${item.serviceEn} ${item.descFr} ${item.descEn}`.toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [numbersList, emergencyCat, normalizedQuery]);

  const filteredAlerts = useMemo(() => {
    return alertsList.filter(item => {
      if (alertSeverity !== 'all' && item.severity !== alertSeverity) return false;
      if (!normalizedQuery) return true;
      const hay = `${item.titleFr} ${item.titleEn} ${item.summaryFr} ${item.summaryEn} ${item.adviceFr} ${item.adviceEn} ${item.scopeFr} ${item.scopeEn}`.toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [alertsList, alertSeverity, normalizedQuery]);

  const filteredNews = useMemo(() => {
    if (!normalizedQuery) return newsList;
    return newsList.filter(item => {
      const hay = `${item.titleFr} ${item.titleEn} ${item.excerptFr} ${item.excerptEn} ${item.tagFr} ${item.tagEn}`.toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [newsList, normalizedQuery]);

  const nestedPages: Array<{
    key: HealthSubPage;
    labelFr: string;
    labelEn: string;
    subFr: string;
    subEn: string;
    badge: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'alerts',
      labelFr: 'Alertes sanitaires',
      labelEn: 'Health Alerts',
      subFr: 'Vigilance & rappels',
      subEn: 'Safety bulletins',
      badge: String(alertsList.length),
      icon: <ShieldAlert size={18} />,
    },
    {
      key: 'news',
      labelFr: 'Actualités de santé',
      labelEn: 'Health News',
      subFr: 'Dossiers & prévention',
      subEn: 'Guides & updates',
      badge: String(newsList.length),
      icon: <Newspaper size={18} />,
    },
    {
      key: 'emergency',
      labelFr: 'Numéros d’urgence « Numéro Vert »',
      labelEn: 'Emergency & Toll-Free Numbers',
      subFr: 'Répertoire des services d’urgence',
      subEn: 'Emergency services directory',
      badge: String(numbersList.length),
      icon: <ModernPhoneCallIcon size={18} />,
    },
  ];

  const activeMeta = nestedPages.find(item => item.key === currentSubPage) || nestedPages[0];

  const copyPhone = async (id: string, value: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopiedId(id);
      say(isEn ? `Number copied: ${value}` : `Numéro copié : ${value}`);
      setTimeout(() => {
        setCopiedId(prev => (prev === id ? null : prev));
      }, 2200);
    } catch {
      say(isEn ? `Reference number: ${value}` : `Numéro à composer : ${value}`);
    }
  };

  const openCategoryCatalog = (category?: string, fallbackPage = 'Produits') => {
    if (category && onSelectCategory) {
      onSelectCategory(category);
      return;
    }
    go(fallbackPage);
  };

  return (
    <div className="pc-luxe-subpage animate-fade-in">
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/hero-cinema-care.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <div className="pc-nested-breadcrumb luxe-hero-breadcrumb" aria-label={isEn ? 'Breadcrumb' : 'Fil d’Ariane'}>
            <button type="button" onClick={() => go('Accueil')}>
              {isEn ? 'Home' : 'Accueil'}
            </button>
            <ChevronRight size={14} />
            <button type="button" onClick={() => selectSubPage('alerts')}>
              {isEn ? 'Health Section' : 'Rubrique Santé'}
            </button>
            <ChevronRight size={14} />
            <span>{isEn ? activeMeta.labelEn : activeMeta.labelFr}</span>
          </div>

          <span className="luxe-section-subtitle">
            {isEn ? 'HEALTH WATCH, NEWS & HOTLINES' : 'VEILLE SANITAIRE, INFORMATION & SECOURS'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Health Section' : 'Rubrique Santé'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Browse active health alerts, practical health news, and verified emergency toll-free numbers.'
              : 'Naviguez entre les alertes sanitaires en cours, actualités de prévention et numéros d’urgence « Numéro Vert ».'}
          </p>
          <span className="luxe-inner-count-pill">
            <ModernBellAlertIcon size={15} />
            {alertsList.length + newsList.length + numbersList.length} {isEn ? 'published resources' : 'ressources publiées'}
          </span>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 24 }}>

      {/* Barre de navigation des 3 sous-pages imbriquées */}
      <nav className="pc-nested-subnav" aria-label={isEn ? 'Health Section Sub-Pages' : 'Sous-pages de la Rubrique Santé'}>
        {nestedPages.map(item => (
          <button
            key={item.key}
            type="button"
            className={`pc-nested-tab ${currentSubPage === item.key ? 'is-active' : ''}`}
            aria-current={currentSubPage === item.key ? 'page' : undefined}
            onClick={() => selectSubPage(item.key)}
          >
            <span className="pc-nested-tab-icon">{item.icon}</span>
            <span className="pc-nested-tab-text">
              <strong>{isEn ? item.labelEn : item.labelFr}</strong>
              <small>{isEn ? item.subEn : item.subFr}</small>
            </span>
            <span className={`pc-nested-tab-badge ${item.key === 'emergency' ? 'is-green' : ''}`}>
              {item.badge}
            </span>
          </button>
        ))}
      </nav>

      {/* Barre de recherche dans la sous-page active */}
      <div className="pc-alerts-search-strip">
        <div className="pc-alerts-search-box">
          <Search size={17} />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              currentSubPage === 'emergency'
                ? (isEn ? 'Filter emergency numbers…' : 'Filtrer les numéros d’urgence…')
                : currentSubPage === 'news'
                  ? (isEn ? 'Filter health news and guides...' : 'Filtrer les actualités et dossiers santé...')
                  : (isEn ? 'Filter health alerts and vigilance bulletins...' : 'Filtrer les alertes et rappels de vigilance...')
            }
          />
          {searchTerm && (
            <button type="button" className="pc-alerts-clear-btn" onClick={() => setSearchTerm('')}>
              {isEn ? 'Clear' : 'Effacer'}
            </button>
          )}
        </div>
      </div>

      {/* SOUS-PAGE IMBRIQUÉE ACTIVE */}
      <PageTransitionStage routeKey={`health-${currentSubPage}`}>
      {currentSubPage === 'alerts' && (
        <section className="pc-alerts-section">
          <div className="pc-alerts-section-head">
            <div>
              <span className="cg-eyebrow">{isEn ? 'NESTED PAGE · PUBLIC HEALTH BULLETINS' : 'PAGE IMBRIQUÉE · VIGILANCE & SÉCURITÉ DES SOINS'}</span>
              <h2>{isEn ? 'Active Health Alerts & Safety Notices' : 'Alertes Sanitaires & Rappels de Vigilance'}</h2>
            </div>

            <div className="pc-alerts-tabs" role="tablist" aria-label={isEn ? 'Filter health alerts' : 'Filtrer les alertes'}>
              {[
                { key: 'all' as const, label: isEn ? 'All' : 'Toutes' },
                { key: 'urgent' as const, label: isEn ? 'High Priority' : 'Urgent' },
                { key: 'vigilance' as const, label: isEn ? 'Vigilance' : 'Vigilance' },
                { key: 'prevention' as const, label: isEn ? 'Prevention' : 'Prévention' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={alertSeverity === tab.key}
                  className={`pc-alerts-tab ${alertSeverity === tab.key ? 'is-active' : ''}`}
                  onClick={() => setAlertSeverity(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredAlerts.length === 0 ? (
            <Empty
              title={isEn ? 'No matching health alerts' : 'Aucune alerte correspondante'}
              detail={isEn ? 'Try clearing the filter or search term.' : 'Réinitialisez le filtre ou la recherche pour revoir toutes les alertes.'}
            />
          ) : (
            <div className="pc-vigilance-grid">
              {filteredAlerts.map(alert => (
                <article key={alert.id} className={`pc-vigilance-card is-${alert.severity}`}>
                  <div className="pc-alert-media">
                    <img
                      src={alert.image || '/images/hero-cinema-medicines.jpg'}
                      alt={isEn ? (alert.imageAltEn || alert.titleEn) : (alert.imageAltFr || alert.titleFr)}
                      loading="lazy"
                    />
                    <div className="pc-alert-media-overlay">
                      <span className={`pc-severity-pill is-${alert.severity}`}>
                        <ShieldAlert size={13} />
                        {alert.severity === 'urgent'
                          ? (isEn ? 'URGENT VIGILANCE' : 'VIGILANCE PRIORITAIRE')
                          : alert.severity === 'vigilance'
                            ? (isEn ? 'MEDICAL WATCH' : 'VEILLE SANITAIRE')
                            : (isEn ? 'PREVENTION' : 'PRÉVENTION')}
                      </span>
                    </div>
                  </div>

                  <div className="pc-vigilance-body">
                    <div className="pc-vigilance-meta">
                      <span className="pc-vigilance-scope">{isEn ? alert.scopeEn : alert.scopeFr}</span>
                      <span className="pc-vigilance-date">{isEn ? alert.dateEn : alert.dateFr}</span>
                    </div>

                    <h3>{isEn ? alert.titleEn : alert.titleFr}</h3>
                    <p className="pc-vigilance-summary">{isEn ? alert.summaryEn : alert.summaryFr}</p>

                    <div className="pc-vigilance-advice">
                      <ModernClipboardStockIcon size={15} />
                      <span>{isEn ? alert.adviceEn : alert.adviceFr}</span>
                    </div>

                    <div className="pc-vigilance-footer">
                      <button
                        type="button"
                        className="pc-vigilance-link"
                        onClick={() => openCategoryCatalog(alert.targetCategory, alert.targetPage)}
                      >
                        <span>{isEn ? alert.actionLabelEn : alert.actionLabelFr}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SOUS-PAGE IMBRIQUÉE 2 : ACTUALITÉS DE SANTÉ */}
      {currentSubPage === 'news' && (
        <section className="pc-alerts-section animate-fade-in">
          <div className="pc-alerts-section-head">
            <div>
              <span className="cg-eyebrow">{isEn ? 'NESTED PAGE · HEALTH NEWS & GUIDES' : 'PAGE IMBRIQUÉE · ACTUALITÉS & PRÉVENTION'}</span>
              <h2>{isEn ? 'Health News & Practical Briefings' : 'Actualités de Santé & Dossiers Pratiques'}</h2>
            </div>

            <button type="button" className="cg-btn-outline" onClick={() => go('Produits')}>
              <Sparkles size={15} />
              <span>{isEn ? 'Explore Available Products' : 'Voir le catalogue public'}</span>
            </button>
          </div>

          {filteredNews.length === 0 ? (
            <Empty
              title={isEn ? 'No matching articles' : 'Aucun dossier trouvé'}
              detail={isEn ? 'Clear your search query to view all health news.' : 'Effacez votre recherche pour consulter toutes les actualités santé.'}
            />
          ) : (
            <div className="pc-news-grid">
              {filteredNews.map(news => {
                const isOpen = expandedNewsId === news.id;
                const points = isEn ? news.keyPointsEn : news.keyPointsFr;
                return (
                  <article key={news.id} className={`pc-news-card ${isOpen ? 'is-expanded' : ''}`}>
                    <div className="pc-news-media">
                      <img
                        src={news.image || '/images/hero-smile.jpg'}
                        alt={isEn ? (news.imageAltEn || news.titleEn) : (news.imageAltFr || news.titleFr)}
                        loading="lazy"
                      />
                      <div className="pc-news-media-overlay">
                        <span className="pc-news-tag">
                          <Newspaper size={13} />
                          {isEn ? news.tagEn : news.tagFr}
                        </span>
                      </div>
                    </div>

                    <div className="pc-news-body">
                      <div className="pc-news-top">
                        <span className="pc-news-meta">
                          {isEn ? news.dateEn : news.dateFr} · {news.readTime}
                        </span>
                      </div>

                      <h3>{isEn ? news.titleEn : news.titleFr}</h3>
                      <p className="pc-news-excerpt">{isEn ? news.excerptEn : news.excerptFr}</p>

                      {isOpen && points.length > 0 && (
                        <ul className="pc-news-points">
                          {points.map((pt, idx) => (
                            <li key={idx}>
                              <Check size={14} />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="pc-news-actions">
                        <button
                          type="button"
                          className="pc-news-toggle"
                          aria-expanded={isOpen}
                          onClick={() => setExpandedNewsId(isOpen ? null : news.id)}
                        >
                          <span>
                            {isOpen
                              ? (isEn ? 'Hide key guidance' : 'Réduire les conseils')
                              : (isEn ? 'Read key recommendations' : 'Lire les recommandations')}
                          </span>
                          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>

                        {news.targetCategory && (
                          <button
                            type="button"
                            className="pc-news-cat-btn"
                            onClick={() => openCategoryCatalog(news.targetCategory, 'Produits')}
                          >
                            <span>{news.targetCategory}</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* SOUS-PAGE IMBRIQUÉE 3 : NUMÉROS D'URGENCE & NUMÉRO VERT */}
      {currentSubPage === 'emergency' && (
        <div className="animate-fade-in">
          <section className="pc-alerts-section">
            <div className="pc-alerts-section-head">
              <div>
                <span className="cg-eyebrow">{isEn ? 'NESTED PAGE · TOLL-FREE & DIRECT LINES' : 'PAGE IMBRIQUÉE · ASSISTANCE IMMÉDIATE'}</span>
                <h2>{isEn ? 'Emergency & Toll-Free Numbers ("Numéros Verts")' : 'Numéros d’Urgence & Numéros Verts'}</h2>
              </div>

              <div className="pc-alerts-tabs" role="tablist" aria-label={isEn ? 'Filter emergency numbers' : 'Filtrer les numéros'}>
                {[
                  { key: 'all' as const, label: isEn ? 'All' : 'Tous' },
                  { key: 'green' as const, label: isEn ? 'Toll-Free / Green' : 'Numéros verts' },
                  { key: 'hospital' as const, label: isEn ? 'Hospitals & Blood' : 'Hôpitaux & Sang' },
                  { key: 'rescue' as const, label: isEn ? 'Fire & Police' : 'Secours & Police' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={emergencyCat === tab.key}
                    className={`pc-alerts-tab ${emergencyCat === tab.key ? 'is-active' : ''}`}
                    onClick={() => setEmergencyCat(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredNumbers.length === 0 && (
              <Empty
                title={isEn ? 'No matching services' : 'Aucun numéro correspondant'}
                detail={
                  numbersList.length
                    ? (isEn ? 'Try another filter or search term.' : 'Aucun service ne correspond à votre recherche.')
                    : (isEn ? 'No emergency numbers have been published.' : 'Aucun numéro d’urgence publié.')
                }
              />
            )}
            <div className="pc-emergency-grid">
              {filteredNumbers.map(item => (
                <article
                  key={item.id}
                  className={`pc-emergency-card ${item.isTollFree ? 'is-toll-free' : ''}`}
                >
                  <div className="pc-emergency-top">
                    <span className={`pc-emergency-badge ${item.isTollFree ? 'is-green' : ''}`}>
                      {item.isTollFree ? <ModernVerifiedShieldIcon size={13} /> : <ModernAlertWarningIcon size={13} />}
                      {isEn ? item.badgeEn : item.badgeFr}
                    </span>
                    <span className="pc-emergency-hours">{isEn ? item.hoursEn : item.hoursFr}</span>
                  </div>

                  <div className="pc-emergency-number-row">
                    <strong className="pc-emergency-number">{item.number}</strong>
                    {item.secondaryNumber && (
                      <span className="pc-emergency-alt">
                        {isEn ? 'Alt:' : 'Ligne alt. :'} {item.secondaryNumber}
                      </span>
                    )}
                  </div>

                  <h3>{isEn ? item.titleEn : item.titleFr}</h3>
                  <p className="pc-emergency-service">{isEn ? item.serviceEn : item.serviceFr}</p>
                  <p className="pc-emergency-desc">{isEn ? item.descEn : item.descFr}</p>

                  <div className="pc-emergency-actions">
                    {item.telHref && /^tel:\+?\d{2,15}$/.test(item.telHref) ? (
                      <a href={item.telHref} className="pc-emergency-call-btn">
                        <Phone size={14} />
                        <span>{isEn ? 'Call' : 'Appeler'}</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="pc-emergency-call-btn"
                        onClick={() => go('Pharmacies')}
                      >
                        {item.id === 'green-pharmacy-watch' ? <ModernEmergency24Icon size={14} /> : <Stethoscope size={14} />}
                        <span>{item.id === 'green-pharmacy-watch' ? (isEn ? 'Open Directory' : 'Voir les officines') : (isEn ? 'Nearby Pharmacies' : 'Officines proches')}</span>
                      </button>
                    )}

                    {item.telHref && (
                      <button
                        type="button"
                        className="pc-emergency-copy-btn"
                        onClick={() => copyPhone(item.id, item.number)}
                      >
                        {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedId === item.id ? (isEn ? 'Copied' : 'Copié') : (isEn ? 'Copy' : 'Copier')}</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

          </section>
        </div>
      )}
      </PageTransitionStage>
      </div>
    </div>
  );
}
