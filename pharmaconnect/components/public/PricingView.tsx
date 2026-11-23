'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AppData, money } from '@/lib/shared';
import { Language } from '@/lib/translations';
import {
  ModernDigitalStoreIcon,
  ModernLivePulseIcon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';
import {
  SanteProcheCalendarScene,
  SanteProcheHeartCrossEmblem,
  SanteProcheWaveRibbon
} from '@/components/shared/SanteProcheIllustrations';

interface PricingViewProps {
  data: AppData;
  planPeriod: string;
  setPlanPeriod: (p: string) => void;
  setExistingAccountRegistration: (v: boolean) => void;
  setNewPharmacyPlan: (p: 'Basic' | 'Standard' | 'Premium') => void;
  setModal: (m: any) => void;
  say: (s: string) => void;
  currentLang?: Language;
  onSelectPlan?: (plan: AppData['plans'][number]) => void;
}

export function PricingView({
  data,
  planPeriod,
  setPlanPeriod,
  setExistingAccountRegistration,
  setNewPharmacyPlan,
  setModal,
  say,
  currentLang = 'fr',
  onSelectPlan,
}: PricingViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const tierIcon = (name: string) => {
    if (name === 'Premium') return <ModernSparkleCrownIcon size={24} />;
    if (name === 'Standard') return <ModernLivePulseIcon size={24} />;
    return <ModernDigitalStoreIcon size={24} />;
  };

  const faqs = [
    {
      q: currentLang === 'en' ? 'How do I check medicine availability without traveling?' : 'Comment vérifier la disponibilité d’un médicament sans me déplacer ?',
      a: currentLang === 'en'
        ? 'Simply search for the medication name in our catalog or simulator. Verified partner pharmacies declare real-time stock levels, allowing you to instantly locate which pharmacy has it in stock.'
        : 'Recherchez simplement le nom de votre produit ou médicament dans notre page Produits ou notre simulateur en direct. Les pharmacies partenaires agréées mettent à jour leurs disponibilités déclarées, vous évitant tout déplacement inutile.'
    },
    {
      q: currentLang === 'en' ? 'How do on-duty pharmacies (24/7) work?' : 'Comment trouver une pharmacie de garde la nuit ou le week-end ?',
      a: currentLang === 'en'
        ? 'Our directory highlights pharmacies currently on emergency or night duty with a green 24/7 indicator badge, their real-time contact number, and distance from your location.'
        : "Notre page Pharmacies identifie les officines ouvertes avec un badge vert distinctif, leurs horaires de permanence, leur numéro direct et le calcul de distance depuis votre position GPS."
    },
    {
      q: currentLang === 'en' ? 'How can pharmacy owners digitalize their establishment?' : 'Je suis pharmacien titulaire, comment digitaliser mon officine ?',
      a: currentLang === 'en'
        ? 'Click on "Register my pharmacy". Complete our 3-step accreditation form and enjoy a 14-day free trial to publish your catalog, receive patient inquiries, and boost your local visibility.'
        : "Cliquez sur « Rejoindre PharmaConnect ». Remplissez notre formulaire avec votre numéro d'autorisation d’ouverture. Dès validation administrative, profitez de 14 jours d'essai gratuit pour publier vos stocks et recevoir les demandes des patients."
    },
    {
      q: currentLang === 'en' ? 'Is there any commitment required for the 14-day trial?' : 'Y a-t-il un engagement pour l’essai gratuit de 14 jours ?',
      a: currentLang === 'en'
        ? 'None at all! Zero credit card or payment required upfront. You test all advanced features freely for two weeks before deciding to choose a plan.'
        : 'Absolument aucun. Aucun paiement n’est requis au démarrage. Vous testez l’ensemble des fonctionnalités professionnelles pendant deux semaines complètes avant de choisir librement votre formule.'
    }
  ];

  const isEn = currentLang === 'en';

  return (
    <div className="pc-luxe-subpage animate-fade-in">
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/cta-pharmacist.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'FOR PHARMACY PROFESSIONALS' : 'POUR LES PROFESSIONNELS'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Plans Tailored to Your Pharmacy' : 'Des formules adaptées à votre pharmacie'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Choose a plan to manage your public catalog, verified badge and patient visibility on PharmaConnect.'
              : 'Choisissez une formule pour gérer votre vitrine et votre présence sur PharmaConnect.'}
          </p>
          <span className="luxe-inner-count-pill">
            <ModernSparkleCrownIcon size={15} />
            {isEn ? '14-day free trial included' : '14 jours d’essai gratuit'}
          </span>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 28 }}>

      <div className="trial-banner cg-trial-banner-pro">
        <span className="cg-info-icon-pill"><ModernSparkleCrownIcon size={20} /></span>
        <span><b>14 jours d’essai gratuit</b> après validation administrative de votre établissement, avec accès aux fonctionnalités Premium.</span>
      </div>

      <div className="period-switch">
        <button className={planPeriod === 'monthly' ? 'active' : ''} onClick={() => setPlanPeriod('monthly')}>Mensuel</button>
        <button className={planPeriod === 'quarterly' ? 'active' : ''} onClick={() => setPlanPeriod('quarterly')}>Trimestriel <small>-10 %</small></button>
        <button className={planPeriod === 'yearly' ? 'active' : ''} onClick={() => setPlanPeriod('yearly')}>Annuel <small>-20 %</small></button>
      </div>

      <div className="pricing-grid">
        {data.plans.map((plan, i) => (
          <div className={`price-card cg-price-card-modern ${i === 2 ? 'featured' : ''}`} key={plan.name}>
            {i === 2 && <span className="popular">COMPLET</span>}
            <div className="cg-price-card-head">
              <div className="cg-price-tier-icon">{tierIcon(plan.name)}</div>
              <div>
                <div className="eyebrow">FORMULE {plan.name.toUpperCase()}</div>
                <h2>{plan.name}</h2>
              </div>
            </div>
            <p>{plan.description}</p>
            <div className="price-value">
              {money(plan[planPeriod as 'monthly' | 'quarterly' | 'yearly'])}
              <small> / {planPeriod === 'monthly' ? 'mois' : planPeriod === 'quarterly' ? 'trimestre' : 'an'}</small>
            </div>
            <div className="price-divider" />
            {plan.features.map(f => (
              <div className="price-feature" key={f}>
                <ModernVerifiedShieldIcon size={16} />
                <span>{f}</span>
              </div>
            ))}
            <button
              className={i === 2 ? 'primary-btn full-btn' : 'outline-btn full-btn'}
              onClick={() => {
                setNewPharmacyPlan(plan.name);
                if (onSelectPlan) {
                  onSelectPlan(plan);
                } else {
                  setExistingAccountRegistration(false);
                  setModal('register');
                  say(`Formule ${plan.name} sélectionnée. Complétez votre demande d’inscription.`);
                }
              }}
            >
              {isEn ? 'Choose this plan' : 'Choisir cette formule'} <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footnote">Tarifs indicatifs en FCFA. Abonnements payables par Mobile Money auprès des opérateurs disponibles.</div>

      {/* Modèle SanteProche Écran 8 & Écran 6 intégrés sans cadre dur */}
      <div className="sp-pricing-showcase-grid">
        <div className="sp-pro-showcase-card sp-pro-compact">
          <div className="sp-pro-left">
            <div className="sp-pro-brand-top">
              <SanteProcheHeartCrossEmblem size={46} />
              <div>
                <span className="sp-pro-brand-label">Professionnels de santé</span>
                <span className="cg-eyebrow" style={{ color: '#86efac', display: 'block' }}>MISE EN LIGNE RAPIDE</span>
              </div>
            </div>
            <h3>Comment fonctionne l’inscription ?</h3>
            <ul className="sp-pro-checklist">
              <li><span className="sp-check-orb">✓</span><span><b>01 · Compte professionnel</b> — Soumettez vos justificatifs</span></li>
              <li><span className="sp-check-orb">✓</span><span><b>02 · Vérification</b> — Contrôle et badge officiel PharmaConnect</span></li>
              <li><span className="sp-check-orb">✓</span><span><b>03 · Essai 14 jours</b> — Publication complète sans engagement</span></li>
            </ul>
            <button
              className="sp-pro-green-pill-btn"
              onClick={() => {
                setExistingAccountRegistration(false);
                setModal('register');
              }}
            >
              Rejoindre PharmaConnect <ArrowRight size={15} />
            </button>
          </div>
          <div className="sp-pro-right-visual">
            <img src="/images/cta-pharmacist.jpg" alt="Pharmacien partenaire" className="sp-pro-blended-portrait" />
          </div>
          <SanteProcheWaveRibbon variant="dark" className="sp-pro-bottom-wave" />
        </div>

        <SanteProcheCalendarScene
          title="14 jours d’essai gratuit dès validation !"
          subtitle="Activez votre fiche, synchronisez votre catalogue et testez la messagerie patients sans aucun engagement initial."
        />
      </div>

      {/* FAQ Interactive dédiée (séparée sur la page Tarifs) */}
      <section className="cg-section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="cg-section-header-center">
          <div className="cg-eyebrow">
            {currentLang === 'en' ? 'FREQUENTLY ASKED QUESTIONS' : 'QUESTIONS FRÉQUENTES'}
          </div>
          <h2>
            {currentLang === 'en' ? 'Everything You Need to Know' : 'Tout ce que vous devez savoir sur les formules et services'}
          </h2>
          <p>
            {currentLang === 'en'
              ? 'Got questions about patient search, guard duty, or pharmacist onboarding? Find answers below.'
              : 'Des interrogations sur la recherche de médicaments, les pharmacies de garde ou l’abonnement professionnel ?'}
          </p>
        </div>

        <div className="cg-faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`cg-faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
              <button
                type="button"
                className="cg-faq-question"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <span style={{ color: 'var(--mint-dark)', fontSize: '20px', fontWeight: 700 }}>
                  {openFaqIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openFaqIndex === idx && (
                <div className="cg-faq-answer animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
