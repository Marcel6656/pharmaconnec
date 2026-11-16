'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { SectionTitle } from '@/lib/shared';
import { RegistrationForm } from '@/components/shared/RegistrationForm';
import {
  ModernDigitalStoreIcon,
  ModernLivePulseIcon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl
} from '@/components/shared/ModernIcons';

interface RegisterPharmacyPageProps {
  pharmacyForm: any;
  setPharmacyForm: (f: any) => void;
  registerPharmacy: (e: React.FormEvent) => void;
  existingAccount?: boolean;
  onFilesChange?: (files: File[]) => void;
}

export function RegisterPharmacyPage({
  pharmacyForm,
  setPharmacyForm,
  registerPharmacy,
  existingAccount = false,
  onFilesChange,
}: RegisterPharmacyPageProps) {
  const onboardingWhatsApp = buildWhatsAppUrl(
    '+23566000000',
    'Bonjour équipe PharmaConnect, je souhaite inscrire mon officine et obtenir une assistance.'
  );

  return (
    <div className="cg-page-container animate-fade-in">
      <SectionTitle
        eyebrow="ESPACE PROFESSIONNEL"
        badge="Validation sous 24h"
        title="Inscrire une pharmacie"
        desc="Créez d’abord un compte professionnel, puis transmettez les informations de l’établissement pour vérification."
        icon={<ModernDigitalStoreIcon size={24} />}
      />

      {/* Hero professionnel harmonisé Helix / Cleargrin — Palette Pine / Menthe */}
      <section className="hx-hero">
        <div className="hx-hero-left">
          <div className="hx-kicker-pill">
            <ModernLivePulseIcon size={15} />
            <span>ESPACE PROFESSIONNEL · KAYRA INNOVATION</span>
          </div>

          <h1 className="hx-hero-title">
            Digitalisez Votre{' '}
            <span className="hx-highlight">Officine</span> en 3 Étapes
          </h1>

          <p className="hx-hero-desc">
            Rejoignez le réseau PharmaConnect, valorisez vos stocks disponibles en temps réel et permettez aux patients de vous contacter par messagerie chiffrée ou WhatsApp.
          </p>

          <div className="hx-hero-actions">
            <a href="#wizard-registration-section" className="cg-btn-pine" style={{ textDecoration: 'none' }}>
              Commencer l’inscription <ArrowRight size={15} />
            </a>
            <a
              href={onboardingWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="cg-whatsapp-chip"
              style={{ padding: '11px 20px', minHeight: 44, fontSize: 13.5 }}
            >
              <ModernWhatsAppIcon size={16} /> Assistance WhatsApp
            </a>
          </div>
        </div>

        <div className="hx-hero-right">
          <div className="hx-hero-backdrop-blob" aria-hidden="true" />
          <img
            src="/images/cta-pharmacist.jpg"
            alt="Pharmacien partenaire PharmaConnect"
            className="hx-hero-doctor-img"
          />

          <div className="hx-float-card hx-float-top-right">
            <span className="hx-float-icon mint"><ModernSparkleCrownIcon size={18} /></span>
            <div>
              <b>14 Jours</b>
              <small>Essai gratuit complet</small>
            </div>
          </div>

          <div className="hx-float-card hx-float-bottom-left">
            <span className="hx-float-icon dark"><ShieldCheck size={18} /></span>
            <div>
              <b>Validation 24h</b>
              <small>Badge officiel vérifié</small>
            </div>
          </div>

          <div className="hx-side-visual-card" aria-hidden="true">
            <img src="/images/pharmacy-1.jpg" alt="" />
            <span className="hx-side-orb">+</span>
          </div>

          <span className="hx-handwriting">Votre Officine,<br />En Ligne</span>
        </div>
      </section>

      {/* 4 Piliers / Statistiques d'accompagnement (Modèle Helix) */}
      <section className="hx-stats-bar">
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><ModernSparkleCrownIcon size={24} /></span>
          <div>
            <b>14 Jours</b>
            <small>Essai gratuit offert</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><Clock size={24} /></span>
          <div>
            <b>24h</b>
            <small>Délai de vérification</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><CheckCircle2 size={24} /></span>
          <div>
            <b>100%</b>
            <small>Contrôle administratif</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><ModernVerifiedShieldIcon size={24} /></span>
          <div>
            <b>WhatsApp</b>
            <small>&amp; messagerie directe</small>
          </div>
        </div>
      </section>

      <div id="wizard-registration-section">
        <RegistrationForm
          form={pharmacyForm}
          setForm={setPharmacyForm}
          onSubmit={registerPharmacy}
          existingAccount={existingAccount}
          onFilesChange={onFilesChange}
        />
      </div>
    </div>
  );
}
