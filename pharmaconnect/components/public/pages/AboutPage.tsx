'use client';

import React from 'react';
import { ArrowRight, Play, ShieldCheck, Users, Star, Clock } from 'lucide-react';
import { SectionTitle } from '@/lib/shared';
import { Language } from '@/lib/translations';
import {
  ModernBrandLogoIcon,
  ModernChatEncryptedIcon,
  ModernDigitalStoreIcon,
  ModernDocumentCheckIcon,
  ModernEmergency24Icon,
  ModernFamilyCareIcon,
  ModernHeartVitalityIcon,
  ModernLivePulseIcon,
  ModernMetricAwardIcon,
  ModernPillCapsuleIcon,
  ModernRadarPinIcon,
  ModernSearchMedicineIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

interface AboutPageProps {
  setExistingAccountRegistration: (v: boolean) => void;
  setModal: (m: any) => void;
  go: (p: string) => void;
  currentLang?: Language;
  pharmaciesCount?: number;
  productsCount?: number;
}

export function AboutPage({
  setExistingAccountRegistration,
  setModal,
  go,
  currentLang = 'fr',
  pharmaciesCount,
  productsCount,
}: AboutPageProps) {
  const specialties = [
    {
      title: 'Médicaments & Soins',
      desc: 'Accès rapide aux traitements essentiels et disponibilité en direct.',
      tone: 'mint',
      icon: <ModernPillCapsuleIcon size={40} />,
      onClick: () => go('Produits')
    },
    {
      title: 'Prévention & Vitalité',
      desc: 'Vitamines, suivi tensionnel et conseils personnalisés en officine.',
      tone: 'sky',
      icon: <ModernHeartVitalityIcon size={40} />,
      onClick: () => go('Produits')
    },
    {
      title: 'Pédiatrie & Famille',
      desc: 'Produits de maternité, puériculture et accompagnement familial.',
      tone: 'sage',
      icon: <ModernFamilyCareIcon size={40} />,
      onClick: () => go('Produits')
    },
    {
      title: 'Officines & Garde 24/7',
      desc: 'Pharmacies agréées géolocalisées ouvertes de jour comme de nuit.',
      tone: 'sand',
      icon: <ModernEmergency24Icon size={40} />,
      onClick: () => go('Pharmacies')
    }
  ];

  const processSteps = [
    {
      num: '01',
      img: '/images/prod-paracetamol.jpg',
      title: currentLang === 'en' ? 'Search your treatment' : 'Recherchez votre produit',
      desc: currentLang === 'en'
        ? 'Type any medication, vitamin, or parapharmacy item and see verified local stocks in one second.'
        : 'Saisissez le nom d’un médicament, d’un soin ou d’un équipement médical et visualisez la disponibilité réelle.',
      tag: currentLang === 'en' ? 'Instant Lookup' : 'Recherche instantanée'
    },
    {
      num: '02',
      img: '/images/pharmacy-1.jpg',
      title: currentLang === 'en' ? 'Locate open & 24/7 pharmacies' : 'Localisez l’officine ouverte',
      desc: currentLang === 'en'
        ? 'Identify the closest certified pharmacy with GPS distance, active night guard badge, and hours.'
        : 'Repérez l’officine agréée la plus proche avec distance GPS, badge de garde 24h/7j et numéro direct.',
      tag: currentLang === 'en' ? 'GPS & 24/7 Duty' : 'GPS & Garde 24h/7j'
    },
    {
      num: '03',
      img: '/images/hero-pharmacist.jpg',
      title: currentLang === 'en' ? 'Contact discreetly & pick up' : 'Contactez et retirez serein',
      desc: currentLang === 'en'
        ? 'Ask the pharmacist privately via encrypted thread to confirm availability before you travel.'
        : 'Posez vos questions par messagerie confidentielle ou WhatsApp avant de vous déplacer en pharmacie.',
      tag: currentLang === 'en' ? 'Private Chat' : 'Échange confidentiel'
    }
  ];

  const whyPillars = [
    {
      title: 'Officines Agréées',
      desc: 'Contrôle réglementaire strict avant chaque publication.',
      tone: 'sand',
      icon: <ModernVerifiedShieldIcon size={22} />
    },
    {
      title: 'Technologie Moderne',
      desc: 'Stocks actualisés en temps réel et géolocalisation GPS.',
      tone: 'mint',
      icon: <ModernLivePulseIcon size={22} />
    },
    {
      title: 'Accompagnement Proche',
      desc: 'Messagerie confidentielle et appel direct sur WhatsApp.',
      tone: 'sky',
      icon: <ModernChatEncryptedIcon size={22} />
    },
    {
      title: 'Support & Garde 24/7',
      desc: 'Repérez immédiatement la pharmacie de garde ouverte.',
      tone: 'sage',
      icon: <ModernEmergency24Icon size={22} />
    }
  ];

  return (
    <div className="cg-page-container animate-fade-in">
      <SectionTitle
        eyebrow="QUI SOMMES-NOUS · KAYRA INNOVATION"
        badge="Réseau Officinal Vérifié"
        title="À propos de PharmaConnect"
        desc="La plateforme qui connecte pharmacies et patients en toute simplicité."
        icon={<ModernBrandLogoIcon size={24} />}
      />

      {/* ============================================================ */}
      {/* 1. HERO SECTION — MODÈLE HELIX (PALETTE PINE / MENTHE)       */}
      {/* ============================================================ */}
      <section className="hx-hero">
        <div className="hx-hero-left">
          <div className="hx-kicker-pill">
            <ModernLivePulseIcon size={15} />
            <span>Meilleure Santé, Meilleur Avenir</span>
          </div>

          <h1 className="hx-hero-title">
            Des Soins Avancés<br />
            pour une Santé<br />
            <span className="hx-highlight">Plus Proche</span>
          </h1>

          <p className="hx-hero-desc">
            Développée par KAYRA Innovation, PharmaConnect associe technologie de pointe et expertise officinale pour vous guider vers les médicaments et pharmacies disponibles autour de vous.
          </p>

          <div className="hx-hero-actions">
            <button type="button" className="cg-btn-pine" onClick={() => go('Pharmacies')}>
              Explorer l’annuaire <ArrowRight size={15} />
            </button>
            <a href="#hx-journey-section" className="hx-video-link">
              <span className="hx-play-circle"><Play size={12} fill="currentColor" /></span>
              <span>Comment ça marche</span>
            </a>
          </div>
        </div>

        <div className="hx-hero-right">
          <div className="hx-hero-backdrop-blob" aria-hidden="true" />
          <img
            src="/images/hero-pharmacist.jpg"
            alt="Professionnel de santé partenaire PharmaConnect"
            className="hx-hero-doctor-img"
          />

          <div className="hx-float-card hx-float-top-right">
            <span className="hx-float-icon mint"><Users size={18} /></span>
            <div>
              <b>{pharmaciesCount !== undefined ? `${pharmaciesCount} Officine(s)` : 'Officines Agréées'}</b>
              <small>Réseau vérifié</small>
            </div>
          </div>

          <div className="hx-float-card hx-float-bottom-left">
            <span className="hx-float-icon dark"><ShieldCheck size={18} /></span>
            <div>
              <b>14 Jours</b>
              <small>Essai Pro offert</small>
            </div>
          </div>

          <div className="hx-side-visual-card" aria-hidden="true">
            <img src="/images/pharmacy-interior.jpg" alt="" />
            <span className="hx-side-orb">+</span>
          </div>

          <span className="hx-handwriting">Votre Santé,<br />Notre Priorité</span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. 4 CARTES SPÉCIALITÉS AVEC FLÈCHE EN HAUT À DROITE         */}
      {/* ============================================================ */}
      <section className="hx-section">
        <div className="hx-specialties-grid">
          {specialties.map((item) => (
            <button
              type="button"
              key={item.title}
              className={`hx-spec-card tone-${item.tone}`}
              onClick={item.onClick}
            >
              <div className="hx-spec-top">
                <div className="hx-spec-icon-box">{item.icon}</div>
                <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SPLIT "UN RÉSEAU MODERNE POUR UN AVENIR PLUS SAIN"         */}
      {/* ============================================================ */}
      <section className="hx-modern-split">
        <div className="hx-modern-media">
          <img src="/images/pharmacy-1.jpg" alt="Officine moderne PharmaConnect" className="hx-modern-building" />
          <div className="hx-modern-float-badge">
            <span className="hx-modern-float-ico"><ModernDigitalStoreIcon size={20} /></span>
            <span>Officines Modernes &amp;<br />Géolocalisation GPS</span>
          </div>
        </div>

        <div className="hx-modern-copy">
          <span className="hx-soft-pill">À propos de PharmaConnect</span>
          <h2>
            Un Réseau Officinal Moderne pour un <span className="hx-highlight">Avenir Plus Sain</span>
          </h2>
          <p>
            PharmaConnect est portée par KAYRA Innovation avec une conviction simple : permettre à chaque patient de trouver immédiatement son traitement auprès d’une officine agréée, sans déplacements inutiles.
          </p>
          <div className="hx-hero-actions">
            <button type="button" className="cg-btn-pine" onClick={() => go('Produits')}>
              Voir le catalogue <ArrowRight size={15} />
            </button>
            <button type="button" className="hx-story-btn" onClick={() => go('Contact')}>
              <span className="hx-play-circle"><Play size={12} fill="currentColor" /></span>
              <span>
                <b>Notre Mission</b>
                <small>Échanger avec nous</small>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. BARRE 4 STATISTIQUES SUR FOND VERT MENTHE DOUX (HELIX)    */}
      {/* ============================================================ */}
      <section className="hx-stats-bar">
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><ModernDigitalStoreIcon size={24} /></span>
          <div>
            <b>{pharmaciesCount !== undefined ? pharmaciesCount : '100%'}</b>
            <small>{pharmaciesCount !== undefined ? 'Officines actives' : 'Officines vérifiées'}</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><Users size={24} /></span>
          <div>
            <b>{productsCount !== undefined ? productsCount : 'Temps réel'}</b>
            <small>{productsCount !== undefined ? 'Références en ligne' : 'Stocks actualisés'}</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><Star size={24} /></span>
          <div>
            <b>Direct</b>
            <small>Messagerie & WhatsApp</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><Clock size={24} /></span>
          <div>
            <b>24h/7j</b>
            <small>Pharmacies de Garde</small>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. "POURQUOI CHOISIR PHARMACONNECT" — 4 PILIERS VERTICAUX     */}
      {/* ============================================================ */}
      <section className="hx-why-section">
        <div className="hx-why-left">
          <span className="hx-soft-pill">Pourquoi PharmaConnect</span>
          <h2>Soins de Confiance, Bien-être Durable</h2>
          <p>
            Nous privilégions la transparence, la sécurité des données et la proximité entre officines et familles.
          </p>
        </div>

        <div className="hx-why-pillars">
          {whyPillars.map((pillar) => (
            <div className="hx-why-col" key={pillar.title}>
              <span className={`hx-why-badge tone-${pillar.tone}`}>
                {pillar.icon}
              </span>
              <h4>{pillar.title}</h4>
              <p>{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. PARCOURS PATIENT EN 3 ÉTAPES & VALEURS KAYRA INNOVATION   */}
      {/* ============================================================ */}
      <section className="cg-steps-section" id="hx-journey-section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="cg-section-header-center">
          <div className="cg-eyebrow">
            {currentLang === 'en' ? 'SIMPLE PATIENT JOURNEY' : 'PARCOURS PATIENT SIMPLIFIÉ'}
          </div>
          <h2>
            {currentLang === 'en' ? 'How PharmaConnect Works in 3 Steps' : 'Comment ça marche en 3 étapes simples'}
          </h2>
          <p>
            {currentLang === 'en'
              ? 'Save precious time during emergencies with a clear illustrated step-by-step experience.'
              : 'Gagnez un temps précieux lors de vos recherches de traitements grâce à un parcours visuel fluide.'}
          </p>
        </div>

        <div className="cg-steps-grid">
          {processSteps.map((step, i) => (
            <article className="cg-process-card sp-process-blended" key={step.num}>
              <div className="cg-process-visual sp-process-visual-fade">
                <img src={step.img} alt={step.title} className="cg-process-thumb" />
                <span className="cg-process-num-pill">{step.num}</span>
                <div className="cg-process-svg-badge" aria-hidden="true">
                  {i === 0 && <ModernSearchMedicineIcon size={25} />}
                  {i === 1 && <ModernRadarPinIcon size={25} />}
                  {i === 2 && <ModernChatEncryptedIcon size={25} />}
                </div>
              </div>
              <div className="cg-process-body">
                <span className="cg-process-tag">{step.tag}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="about-content cg-static-wide" style={{ marginTop: 22 }}>
        <div className="two-panels">
          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><ModernVerifiedShieldIcon size={20} /></span>
              <h3>Nos valeurs</h3>
            </div>
            <ul className="about-list cg-about-list-clean">
              <li><ModernVerifiedShieldIcon size={15} /> <span><b>Transparence</b> — Informations et stocks vérifiés</span></li>
              <li><ModernVerifiedShieldIcon size={15} /> <span><b>Proximité</b> — Accès facilité aux officines de quartier</span></li>
              <li><ModernVerifiedShieldIcon size={15} /> <span><b>Confidentialité</b> — Protection stricte de vos données de santé</span></li>
              <li><ModernVerifiedShieldIcon size={15} /> <span><b>Innovation</b> — Outils modernes adaptés au terrain</span></li>
            </ul>
          </section>
          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><ModernMetricAwardIcon size={20} /></span>
              <h3>Fonctionnement en 4 étapes</h3>
            </div>
            <ul className="about-list cg-about-list-clean">
              <li><ModernDocumentCheckIcon size={15} /> <span>1. Inscription de la pharmacie et dépôt des pièces</span></li>
              <li><ModernVerifiedShieldIcon size={15} /> <span>2. Contrôle et validation administrative</span></li>
              <li><ModernDigitalStoreIcon size={15} /> <span>3. Publication des disponibilités et stocks en direct</span></li>
              <li><ModernRadarPinIcon size={15} /> <span>4. Recherche rapide et contact direct pour les patients</span></li>
            </ul>
          </section>
        </div>

        {/* ============================================================ */}
        {/* 7. BANNIÈRE CTA FINALE HELIX VERT PIN PROFOND                */}
        {/* ============================================================ */}
        <section className="hx-cta-banner">
          <div className="hx-cta-left">
            <span className="hx-cta-leaf-badge">
              <ModernBrandLogoIcon size={28} />
            </span>
            <div>
              <strong>Votre Santé,<br />Notre Mission</strong>
            </div>
          </div>

          <div className="hx-cta-divider" />

          <p className="hx-cta-center-text">
            Faites le premier pas vers une pharmacie connectée.<br />
            Profitez de 14 jours d’essai gratuit après validation.
          </p>

          <button
            type="button"
            className="hx-cta-white-pill"
            onClick={() => {
              setExistingAccountRegistration(false);
              setModal('register');
            }}
          >
            Inscrire ma pharmacie <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
