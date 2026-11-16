'use client';

import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { SectionTitle } from '@/lib/shared';
import {
  ModernDocumentCheckIcon,
  ModernLivePulseIcon,
  ModernLockSecurityIcon,
  ModernMailEnvelopeIcon,
  ModernUserBadgeIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';
import { SanteProcheShieldWaveScene } from '@/components/shared/SanteProcheIllustrations';

export function PrivacyPage() {
  return (
    <div className="cg-page-container animate-fade-in">
      <SectionTitle
        eyebrow="PROTECTION DES DONNÉES"
        badge="Chiffrement & Confiance"
        title="Politique de confidentialité"
        desc="Comment PharmaConnect protège vos données personnelles et les informations des officines."
        icon={<ModernLockSecurityIcon size={24} />}
      />

      {/* Hero harmonisé Helix / Cleargrin — Palette Pine / Menthe */}
      <section className="hx-hero">
        <div className="hx-hero-left">
          <div className="hx-kicker-pill">
            <ModernLivePulseIcon size={15} />
            <span>CONFIDENTIALITÉ &amp; SÉCURITÉ DES DONNÉES</span>
          </div>

          <h1 className="hx-hero-title">
            Vos Données de Santé{' '}
            <span className="hx-highlight">Protégées</span>
          </h1>

          <p className="hx-hero-desc">
            PharmaConnect applique des principes stricts de minimisation des données, de vérification officielle des officines et de transparence sur leur traitement.
          </p>

          <div className="hx-hero-actions">
            <a href="#privacy-details" className="cg-btn-pine" style={{ textDecoration: 'none' }}>
              Consulter nos engagements <ArrowRight size={15} />
            </a>
            <a href="#privacy-dpo" className="hx-video-link" style={{ textDecoration: 'none' }}>
              <span className="hx-play-circle"><ModernMailEnvelopeIcon size={16} /></span>
              <span>Contacter notre DPO</span>
            </a>
          </div>
        </div>

        <div className="hx-hero-right">
          <div className="hx-hero-backdrop-blob" aria-hidden="true" />
          <img
            src="/images/pharmacy-interior.jpg"
            alt="Protection et confidentialité PharmaConnect"
            className="hx-hero-doctor-img"
          />

          <div className="hx-float-card hx-float-top-right">
            <span className="hx-float-icon mint"><ShieldCheck size={18} /></span>
            <div>
              <b>Chiffrement</b>
              <small>Bout en bout en prod</small>
            </div>
          </div>

          <div className="hx-float-card hx-float-bottom-left">
            <span className="hx-float-icon dark"><ModernUserBadgeIcon size={18} /></span>
            <div>
              <b>Zéro obligation</b>
              <small>Compte visiteur facultatif</small>
            </div>
          </div>

          <span className="hx-handwriting">Confiance &amp;<br />Transparence</span>
        </div>
      </section>

      {/* 4 Piliers de Confidentialité (Modèle Helix) */}
      <section className="hx-section">
        <div className="hx-specialties-grid">
          <div className="hx-spec-card tone-mint">
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernLockSecurityIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Chiffrement de bout en bout</h3>
            <p>Les flux de production et échanges patients-pharmacies sont sécurisés par protocole chiffré.</p>
          </div>

          <div className="hx-spec-card tone-sky">
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernVerifiedShieldIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Contrôle des officines</h3>
            <p>Chaque pharmacie fournit ses justificatifs d’agrément avant publication sur l’annuaire.</p>
          </div>

          <div className="hx-spec-card tone-sage">
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernUserBadgeIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Compte visiteur facultatif</h3>
            <p>Recherchez librement médicaments et pharmacies de garde sans obligation de créer un compte.</p>
          </div>

          <div className="hx-spec-card tone-sand">
            <div className="hx-spec-top">
              <div className="hx-spec-icon-box"><ModernDocumentCheckIcon size={38} /></div>
              <span className="hx-spec-arrow"><ArrowRight size={16} /></span>
            </div>
            <h3>Droits RGPD &amp; accès</h3>
            <p>Accès, rectification et suppression immédiate de vos informations à tout moment sur simple demande.</p>
          </div>
        </div>
      </section>

      <div className="privacy-content cg-static-wide" id="privacy-details">
        <section className="panel cg-modern-panel">
          <div className="cg-panel-title-badge">
            <span className="cg-info-icon-pill"><ModernVerifiedShieldIcon size={20} /></span>
            <h3>Engagement de protection</h3>
          </div>
          <p>PharmaConnect s’engage à garantir la confidentialité et la sécurité de toutes les informations confiées par les utilisateurs et les établissements partenaires.</p>
        </section>

        <section className="panel cg-modern-panel">
          <div className="cg-panel-title-badge">
            <span className="cg-info-icon-pill"><ModernDocumentCheckIcon size={20} /></span>
            <h3>Données collectées</h3>
          </div>
          <ul className="about-list cg-about-list-clean">
            <li><ModernVerifiedShieldIcon size={15} /> <span><b>Pharmacies</b> — Raison sociale, adresse, numéro d&apos;autorisation d&apos;ouverture, coordonnées professionnelles.</span></li>
            <li><ModernVerifiedShieldIcon size={15} /> <span><b>Visiteurs</b> — Nom ou prénom, numéro de contact lors de demandes spécifiques (compte facultatif).</span></li>
            <li><ModernVerifiedShieldIcon size={15} /> <span><b>Catalogue</b> — Prix et stocks déclarés par les établissements sous leur responsabilité.</span></li>
          </ul>
        </section>

        <div className="two-panels">
          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><ModernLockSecurityIcon size={20} /></span>
              <h3>Sécurité &amp; Stockage</h3>
            </div>
            <p>Les données et échanges sont stockés sur nos serveurs sécurisés avec authentification JWT et chiffrement des flux.</p>
          </section>
          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><ModernUserBadgeIcon size={20} /></span>
              <h3>Vos droits</h3>
            </div>
            <p>Vous disposez à tout moment d’un droit d’accès, de rectification et de suppression de vos données.</p>
          </section>
        </div>

        <SanteProcheShieldWaveScene
          title="Ensemble pour la sécurité de vos données de santé"
          subtitle="Chiffrement de bout en bout en production et contrôle rigoureux de chaque établissement partenaire."
        />

        {/* Bannière DPO CTA finale Helix vert pin profond */}
        <section className="hx-cta-banner" id="privacy-dpo">
          <div className="hx-cta-left">
            <span className="hx-cta-leaf-badge">
              <ModernLockSecurityIcon size={28} />
            </span>
            <div>
              <strong>Contact<br />DPO Dédié</strong>
            </div>
          </div>

          <div className="hx-cta-divider" />

          <p className="hx-cta-center-text">
            Pour toute question relative à la confidentialité ou à l’exercice de vos droits, écrivez à{' '}
            <b>privacy@pharmaconnect.example</b>.
          </p>

          <a
            href="mailto:privacy@pharmaconnect.example"
            className="hx-cta-white-pill"
            style={{ textDecoration: 'none' }}
          >
            <ModernMailEnvelopeIcon size={16} /> Écrire au DPO <ArrowRight size={15} />
          </a>
        </section>
      </div>
    </div>
  );
}
