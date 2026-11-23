'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { apiSubmitContact } from '@/lib/api';
import { Language } from '@/lib/translations';
import {
  ModernBrandLogoIcon,
  ModernChatEncryptedIcon,
  ModernDigitalStoreIcon,
  ModernLivePulseIcon,
  ModernMailEnvelopeIcon,
  ModernPhoneCallIcon,
  ModernRadarPinIcon,
  ModernSendPlaneIcon,
  ModernUserBadgeIcon,
  ModernVerifiedShieldIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl
} from '@/components/shared/ModernIcons';
import {
  SanteProcheCalendarScene,
  SanteProcheWaveRibbon
} from '@/components/shared/SanteProcheIllustrations';

interface ContactPageProps {
  say: (s: string) => void;
  currentLang?: Language;
  go?: (p: string) => void;
}

export function ContactPage({ say, currentLang = 'fr', go }: ContactPageProps) {
  const isEn = currentLang === 'en';
  const [topic, setTopic] = useState("Demande d'information générale");
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactBody, setContactBody] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [sending, setSending] = useState(false);

  const focusContactForm = (selectedTopic: string) => {
    setTopic(selectedTopic);
    if (typeof document !== 'undefined') {
      document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pc-luxe-subpage animate-fade-in">
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/clinic-reception.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'SUPPORT & PARTNERSHIPS' : 'NOUS ÉCRIRE'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Contact Our Team' : 'Contactez-nous'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Questions, pharmacy onboarding or technical assistance? Reach out by message or directly on WhatsApp.'
              : 'Une question, un partenariat officinal ou une demande d’assistance ? Notre équipe vous répond sous 24 à 48h.'}
          </p>
          <div className="luxe-hero-buttons">
            <a href="#contact-form-section" className="luxe-btn luxe-btn-primary" style={{ textDecoration: 'none' }}>
              {isEn ? 'Send a message' : 'Écrire un message'} <ArrowRight size={15} />
            </a>
            <a
              href="mailto:contact@pharmaconnect.td"
              className="luxe-btn luxe-btn-outline"
              style={{ textDecoration: 'none' }}
            >
              contact@pharmaconnect.td
            </a>
          </div>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 28 }}>

      {/* Grille 4 cartes de contact rapide (Modèle Helix) */}
      <section className="hx-section">
        <div className="hx-specialties-grid">
          <a
            href="#contact-form-section"
            className="hx-spec-card tone-mint"
            style={{ textDecoration: 'none' }}
          >
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernMailEnvelopeIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Formulaire direct</h3>
            <p>Échangez avec notre équipe support pour toute question patient ou demande officinale.</p>
          </a>

          <button
            type="button"
            className="hx-spec-card tone-sky"
            onClick={() => focusContactForm('Inscription ou partenariat pharmacie')}
          >
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernDigitalStoreIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Support Officines</h3>
            <p>Accompagnement à l’inscription, vérification de licence et gestion de catalogue.</p>
          </button>

          <button
            type="button"
            className="hx-spec-card tone-sage"
            onClick={() => focusContactForm("Demande d'information générale")}
          >
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernUserBadgeIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Service Patients</h3>
            <p>Aide à la recherche de produits, fiches vérifiées et pharmacies de garde 24h/7j.</p>
          </button>

          <button
            type="button"
            className="hx-spec-card tone-sand"
            onClick={() => focusContactForm('Support technique')}
          >
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernRadarPinIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Siège &amp; Partenariats</h3>
            <p>KAYRA Innovation — Pôle Santé Numérique, déploiement et partenariats santé.</p>
          </button>
        </div>
      </section>

      <div className="contact-content cg-static-wide" id="contact-form-section">
        <div className="two-panels">
          <section className="panel cg-modern-panel contact-form-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><ModernMailEnvelopeIcon size={20} /></span>
              <h3>Formulaire de contact</h3>
            </div>
            <form onSubmit={async e => {
              e.preventDefault();
              if (!consentChecked) {
                say('Veuillez accepter le traitement de votre demande pour envoyer ce message.');
                return;
              }
              setSending(true);
              const res = await apiSubmitContact({
                name: contactName.trim(),
                email: contactEmail.trim(),
                topic,
                message: contactBody.trim(),
              });
              setSending(false);
              if (!res.ok) {
                say(res.error);
                return;
              }
              setContactName('');
              setContactEmail('');
              setContactBody('');
              setConsentChecked(false);
              say(res.message);
            }}>
              <label className="form-field">Votre nom complet *<input required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Ex. Paul Koffi" /></label>
              <label className="form-field">Votre e-mail *<input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="paul@exemple.com" /></label>
              <label className="form-field">Objet de la demande *
                <select value={topic} onChange={e => setTopic(e.target.value)}>
                  <option>Demande d&apos;information générale</option>
                  <option>Inscription ou partenariat pharmacie</option>
                  <option>Rétractation ou résiliation d&apos;abonnement</option>
                  <option>Support technique</option>
                  <option>Autre demande</option>
                </select>
              </label>
              <label className="form-field">Message *<textarea required rows={5} value={contactBody} onChange={e => setContactBody(e.target.value)} placeholder="Précisez votre demande sans mentionner de données médicales sensibles…" /></label>
              <label className="pc-consent-checkbox">
                <input
                  type="checkbox"
                  required
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                />
                <span>
                  J’accepte que mes données soient utilisées pour répondre à ma demande conformément à la{' '}
                  {go ? (
                    <button type="button" className="pc-inline-text-link" onClick={() => go('Confidentialité')}>
                      Politique de confidentialité
                    </button>
                  ) : 'Politique de confidentialité'}
                  .
                </span>
              </label>
              <button className="cg-btn-pine" style={{ marginTop: 8 }} disabled={sending}><ModernSendPlaneIcon size={15} /> {sending ? 'Envoi en cours…' : 'Envoyer le message'}</button>
            </form>
          </section>

          <div className="cg-contact-cards-col">
            <div className="sp-contact-blended-card">
              <img src="/images/clinic-reception.jpg" alt="Accueil et assistance PharmaConnect" className="sp-contact-blended-img" />
              <SanteProcheWaveRibbon variant="dark" className="sp-banner-wave" />
              <div className="cg-contact-visual-caption" style={{ zIndex: 2 }}>
                <b>Support dédié officines &amp; patients</b>
                <span>Accompagnement technique et suivi des demandes d’agrément</span>
              </div>
            </div>

            <SanteProcheCalendarScene
              title="Traitement rapide de vos demandes"
              subtitle="Notre équipe étudie vos messages du lundi au vendredi (8h00 – 18h30) sous 24 à 48 heures ouvrées."
            />

            <section className="panel cg-modern-panel">
              <div className="cg-detail-info-row">
                <span className="cg-info-icon-pill"><ModernRadarPinIcon size={18} /></span>
                <div>
                  <b>Siège &amp; Bureaux</b>
                  <small>KAYRA Innovation — Pôle Santé Numérique</small>
                  <small>Avenue Charles de Gaulle, N’Djamena, Tchad.</small>
                </div>
              </div>
            </section>

            <section className="panel cg-modern-panel">
              <div className="cg-detail-info-row">
                <span className="cg-info-icon-pill"><ModernPhoneCallIcon size={18} /></span>
                <div style={{ flex: 1 }}>
                  <b>Horaires du support</b>
                  <small>Du lundi au vendredi de 8h00 à 18h30 via le formulaire ou par e-mail.</small>
                </div>
              </div>
            </section>

            <section className="panel cg-modern-panel">
              <div className="cg-detail-info-row">
                <span className="cg-info-icon-pill"><ModernChatEncryptedIcon size={18} /></span>
                <div>
                  <b>E-mail officiel &amp; DPO</b>
                  <small>Support : contact@pharmaconnect.td · RGPD : dpo@pharmaconnect.td</small>
                  <small>Traitement sous 24 à 48 heures ouvrées.</small>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bannière CTA finale vert / bleu */}
        <section className="hx-cta-banner">
          <div className="hx-cta-left">
            <span className="hx-cta-leaf-badge">
              <ModernBrandLogoIcon size={28} />
            </span>
            <div>
              <strong>Support<br />Ouvré Lun–Ven</strong>
            </div>
          </div>

          <div className="hx-cta-divider" />

          <p className="hx-cta-center-text">
            Besoin d’un renseignement sur votre dossier pharmacie, un abonnement ou vos droits RGPD ?<br />
            <ModernVerifiedShieldIcon size={14} /> Écrivez directement à notre équipe à contact@pharmaconnect.td.
          </p>

          <a
            href="mailto:contact@pharmaconnect.td"
            className="hx-cta-white-pill"
            style={{ textDecoration: 'none' }}
          >
            <ModernMailEnvelopeIcon size={16} /> Envoyer un e-mail <ArrowRight size={15} />
          </a>
        </section>
      </div>
      </div>
    </div>
  );
}
