'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Language } from '@/lib/translations';
import {
  ModernDocumentCheckIcon,
  ModernLockSecurityIcon,
  ModernMailEnvelopeIcon,
  ModernUserBadgeIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';
import { SanteProcheShieldWaveScene } from '@/components/shared/SanteProcheIllustrations';

export function PrivacyPage({
  currentLang = 'fr',
  go,
}: {
  currentLang?: Language;
  go?: (p: string) => void;
}) {
  const isEn = currentLang === 'en';
  return (
    <div className="pc-luxe-subpage animate-fade-in">
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/pharmacy-interior.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'DATA PROTECTION · GDPR ART. 13' : 'PROTECTION DES DONNÉES · RGPD ART. 13'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Privacy Policy' : 'Politique de confidentialité'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'How PharmaConnect processes, secures and protects your personal data under EU/French GDPR principles.'
              : 'Comment PharmaConnect collecte, protège et conserve vos données personnelles conformément au RGPD et aux recommandations de la CNIL.'}
          </p>
          <div className="luxe-hero-buttons">
            <a href="#privacy-details" className="luxe-btn luxe-btn-primary" style={{ textDecoration: 'none' }}>
              {isEn ? 'Our commitments' : 'Consulter nos engagements'} <ArrowRight size={15} />
            </a>
            <a href="#privacy-dpo" className="luxe-btn luxe-btn-outline" style={{ textDecoration: 'none' }}>
              {isEn ? 'Contact our DPO' : 'Contacter notre DPO'}
            </a>
          </div>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 28 }}>
        <section className="hx-section">
          <div className="hx-specialties-grid">
            <div className="hx-spec-card tone-mint">
              <div className="hx-spec-top">
                <div className="hx-spec-icon-box"><ModernLockSecurityIcon size={38} /></div>
                <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
              </div>
              <h3>Chiffrement en transit (HTTPS/TLS)</h3>
              <p>Les échanges web et API circulent sous HTTPS/TLS avec authentification JWT et contrôle d’accès par rôle.</p>
            </div>

            <div className="hx-spec-card tone-sky">
              <div className="hx-spec-top">
                <div className="hx-spec-icon-box"><ModernVerifiedShieldIcon size={38} /></div>
                <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
              </div>
              <h3>Contrôle des officines</h3>
              <p>Chaque pharmacie fournit ses justificatifs d’agrément avant publication dans l’annuaire public.</p>
            </div>

            <div className="hx-spec-card tone-sage">
              <div className="hx-spec-top">
                <div className="hx-spec-icon-box"><ModernUserBadgeIcon size={38} /></div>
                <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
              </div>
              <h3>Compte visiteur facultatif</h3>
              <p>Consultez l’annuaire et les disponibilités librement sans création de compte ni traceur publicitaire.</p>
            </div>

            <div className="hx-spec-card tone-sand">
              <div className="hx-spec-top">
                <div className="hx-spec-icon-box"><ModernDocumentCheckIcon size={38} /></div>
                <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
              </div>
              <h3>Droits RGPD &amp; effacement</h3>
              <p>Accès, rectification, portabilité et suppression autonome de votre compte à tout moment.</p>
            </div>
          </div>
        </section>

        <div className="privacy-content cg-static-wide" id="privacy-details">
          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><ModernVerifiedShieldIcon size={20} /></span>
              <h3>1. Responsable du traitement &amp; Données de santé (art. 9 RGPD)</h3>
            </div>
            <p>
              Le responsable du traitement est <b>KAYRA Innovation — PharmaConnect</b> (contact DPO : <b>tginnovation7@gmail.com</b> · Tél/WhatsApp : <b>+235 60 70 91 92</b>).
              Lorsque vous adressez un message à une pharmacie concernant un médicament ou un besoin de soin, ce message peut révéler une donnée de santé au sens de l’article 9 du RGPD : il n’est transmis qu’à la pharmacie destinataire choisie et n’est jamais exploité à des fins publicitaires. Nous vous invitons à ne saisir que le strict nécessaire.
            </p>
          </section>

          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><ModernDocumentCheckIcon size={20} /></span>
              <h3>2. Finalités, bases légales &amp; durées de conservation</h3>
            </div>
            <div className="pc-legal-table-wrap">
              <table className="pc-legal-table">
                <thead>
                  <tr>
                    <th>Traitement</th>
                    <th>Base légale (art. 6 / 9 RGPD)</th>
                    <th>Durée de conservation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Consultation publique de l’annuaire &amp; géolocalisation navigateur</td>
                    <td>Intérêt légitime (coordonnées traitées localement pour trier par distance)</td>
                    <td>Non conservée côté serveur</td>
                  </tr>
                  <tr>
                    <td>Messagerie patient ↔ pharmacie</td>
                    <td>Consentement explicite (art. 6.1.a &amp; 9.2.a) et mesures précontractuelles</td>
                    <td>3 ans après le dernier échange, ou anonymisation immédiate à la suppression du compte</td>
                  </tr>
                  <tr>
                    <td>Compte utilisateur Visiteur / Pharmacien</td>
                    <td>Exécution du service / contrat (art. 6.1.b)</td>
                    <td>Pendant la durée du compte, puis suppression sur demande ou après 3 ans d’inactivité</td>
                  </tr>
                  <tr>
                    <td>Dossier d’agrément &amp; justificatifs d’officine</td>
                    <td>Exécution du contrat &amp; obligation de vérification</td>
                    <td>Durée d’inscription + 5 ans en archivage intermédiaire (contentieux/preuve)</td>
                  </tr>
                  <tr>
                    <td>Abonnements, factures &amp; paiements Mobile Money</td>
                    <td>Exécution du contrat &amp; obligations comptables légales (art. 6.1.c)</td>
                    <td>10 ans pour les pièces comptables (Code de commerce)</td>
                  </tr>
                  <tr>
                    <td>Journaux techniques de sécurité</td>
                    <td>Intérêt légitime (sécurité et prévention des abus)</td>
                    <td>6 à 12 mois glissants</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="two-panels">
            <section className="panel cg-modern-panel">
              <div className="cg-panel-title-badge">
                <span className="cg-info-icon-pill"><ModernLockSecurityIcon size={20} /></span>
                <h3>3. Sous-traitants &amp; transferts hors UE</h3>
              </div>
              <p>
                Les données sont hébergées chez <b>Vercel Inc.</b> (hébergement web/API) et <b>Neon Inc.</b> (base PostgreSQL), et les notifications e-mail transitent le cas échéant par <b>Resend</b>. Lorsque des transferts interviennent vers les États-Unis, ils sont encadrés par des Clauses Contractuelles Types (CCT) ou le Data Privacy Framework (DPF). En cas d’utilisation volontaire de la connexion Google OAuth, Google LLC reçoit les données d’authentification après votre consentement.
              </p>
            </section>
            <section className="panel cg-modern-panel">
              <div className="cg-panel-title-badge">
                <span className="cg-info-icon-pill"><ModernUserBadgeIcon size={20} /></span>
                <h3>4. Mineurs, droits &amp; réclamation CNIL</h3>
              </div>
              <p>
                <b>Mineurs :</b> conformément à l’article 8 du RGPD et à l’article 45 de la loi Informatique et Libertés, la création d’un compte est réservée aux personnes d’au moins <b>15 ans</b> en France (ou avec accord du représentant légal).
                <br /><br />
                <b>Vos droits :</b> accès, rectification, effacement autonome (bouton <i>Supprimer mon compte et mes données</i> dans votre profil), limitation, portabilité et opposition. Vous pouvez également introduire une réclamation auprès de la <b>CNIL</b> (<code>cnil.fr</code>).
              </p>
            </section>
          </div>

          <SanteProcheShieldWaveScene
            title="Protection transparente de vos données"
            subtitle="Chiffrement en transit (HTTPS/TLS), accès restreints par rôle et contrôle rigoureux des officines partenaires."
          />

          <section className="hx-cta-banner" id="privacy-dpo">
            <div className="hx-cta-left">
              <span className="hx-cta-leaf-badge">
                <ModernLockSecurityIcon size={28} />
              </span>
              <div>
                <strong>Contact<br />DPO / RGPD</strong>
              </div>
            </div>

            <div className="hx-cta-divider" />

            <p className="hx-cta-center-text">
              Pour exercer vos droits RGPD ou contacter notre délégué à la protection des données, écrivez à{' '}
              <b>tginnovation7@gmail.com</b> ou appelez le <b>+235 60 70 91 92</b>.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href="mailto:tginnovation7@gmail.com"
                className="hx-cta-white-pill"
                style={{ textDecoration: 'none' }}
              >
                <ModernMailEnvelopeIcon size={16} /> Écrire au DPO <ArrowRight size={15} />
              </a>
              {go && (
                <button
                  type="button"
                  className="hx-cta-white-pill"
                  onClick={() => go('Politique cookies')}
                >
                  Politique cookies
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
