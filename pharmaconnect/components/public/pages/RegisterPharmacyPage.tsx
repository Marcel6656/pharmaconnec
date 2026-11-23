'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { RegistrationForm } from '@/components/shared/RegistrationForm';
import { Language } from '@/lib/translations';
import {
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon,
} from '@/components/shared/ModernIcons';

interface RegisterPharmacyPageProps {
  pharmacyForm: any;
  setPharmacyForm: (f: any) => void;
  registerPharmacy: (e: React.FormEvent) => void;
  existingAccount?: boolean;
  onFilesChange?: (files: File[]) => void;
  currentLang?: Language;
  go?: (p: string) => void;
}

export function RegisterPharmacyPage({
  pharmacyForm,
  setPharmacyForm,
  registerPharmacy,
  existingAccount = false,
  onFilesChange,
  currentLang = 'fr',
  go,
}: RegisterPharmacyPageProps) {
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
            {isEn ? 'PROFESSIONAL PORTAL · KAYRA INNOVATION' : 'ESPACE PROFESSIONNEL · KAYRA INNOVATION'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Register Your Pharmacy' : 'Inscrire une pharmacie'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Create your professional account, submit pharmacy credentials and enjoy a 14-day free trial after validation.'
              : 'Créez d’abord un compte professionnel, transmettez vos justificatifs et profitez de 14 jours d’essai gratuit après validation.'}
          </p>
          <div className="luxe-hero-buttons">
            <a href="#wizard-registration-section" className="luxe-btn luxe-btn-primary" style={{ textDecoration: 'none' }}>
              {isEn ? 'Start registration' : 'Commencer l’inscription'} <ArrowRight size={15} />
            </a>
            {go && (
              <button
                type="button"
                className="luxe-btn luxe-btn-outline"
                onClick={() => go('Contact')}
              >
                {isEn ? 'Contact Support' : 'Contacter l’équipe'}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 28 }}>

      {/* 4 Piliers d'accompagnement */}
      <section className="hx-stats-bar">
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><ModernSparkleCrownIcon size={24} /></span>
          <div>
            <b>14 Jours</b>
            <small>Essai gratuit sans engagement</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><Clock size={24} /></span>
          <div>
            <b>Examen rapide</b>
            <small>Vérification de votre dossier</small>
          </div>
        </div>
        <div className="hx-stat-divider" />
        <div className="hx-stat-cell">
          <span className="hx-stat-ico"><CheckCircle2 size={24} /></span>
          <div>
            <b>Pièces contrôlées</b>
            <small>Examen administratif préalable</small>
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
          go={go}
        />
      </div>
      </div>
    </div>
  );
}
