'use client';

import React from 'react';
import { Language } from '@/lib/translations';
import { AboutPage } from '@/components/public/pages/AboutPage';
import { ContactPage } from '@/components/public/pages/ContactPage';
import { PrivacyPage } from '@/components/public/pages/PrivacyPage';
import { RegisterPharmacyPage } from '@/components/public/pages/RegisterPharmacyPage';
import { HealthAlertsPage, HealthSubPage } from '@/components/public/pages/HealthAlertsPage';
import { CookiesPage, LegalNoticePage, TermsPage } from '@/components/public/pages/LegalPages';

interface StaticPagesProps {
  page: string;
  pharmacyForm: any;
  setPharmacyForm: (f: any) => void;
  registerPharmacy: (e: React.FormEvent) => void;
  existingAccountRegistration?: boolean;
  onRegistrationFilesChange?: (files: File[]) => void;
  setExistingAccountRegistration: (v: boolean) => void;
  setModal: (m: any) => void;
  say: (s: string) => void;
  go?: (p: string) => void;
  onSelectCategory?: (category: string) => void;
  healthSubPage?: HealthSubPage;
  onHealthSubPageChange?: (sub: HealthSubPage) => void;
  currentLang?: Language;
  pharmaciesCount?: number;
  productsCount?: number;
  onOpenCookieSettings?: () => void;
}

export function StaticPagesView({
  page,
  pharmacyForm,
  setPharmacyForm,
  registerPharmacy,
  existingAccountRegistration = false,
  onRegistrationFilesChange,
  setExistingAccountRegistration,
  setModal,
  say,
  go = () => { },
  onSelectCategory,
  healthSubPage = 'alerts',
  onHealthSubPageChange,
  currentLang = 'fr',
  pharmaciesCount,
  productsCount,
  onOpenCookieSettings,
}: StaticPagesProps) {
  if (page === 'Inscription pharmacie') {
    return (
      <RegisterPharmacyPage
        pharmacyForm={pharmacyForm}
        setPharmacyForm={setPharmacyForm}
        registerPharmacy={registerPharmacy}
        existingAccount={existingAccountRegistration}
        onFilesChange={onRegistrationFilesChange}
        currentLang={currentLang}
      />
    );
  }

  if (page === 'À propos') {
    return (
      <AboutPage
        setExistingAccountRegistration={setExistingAccountRegistration}
        setModal={setModal}
        go={go}
        currentLang={currentLang}
        pharmaciesCount={pharmaciesCount}
        productsCount={productsCount}
      />
    );
  }

  if (page === 'Confidentialité') {
    return <PrivacyPage currentLang={currentLang} go={go} />;
  }

  if (page === 'Mentions légales') {
    return <LegalNoticePage go={go} currentLang={currentLang} />;
  }

  if (page === 'Conditions générales') {
    return <TermsPage go={go} currentLang={currentLang} />;
  }

  if (page === 'Politique cookies') {
    return <CookiesPage go={go} currentLang={currentLang} onOpenCookieSettings={onOpenCookieSettings} />;
  }

  if (page === 'Contact') {
    return <ContactPage say={say} currentLang={currentLang} go={go} />;
  }

  if (page === 'Rubrique Santé' || page === 'Alertes & Urgences') {
    return (
      <HealthAlertsPage
        go={go}
        say={say}
        currentLang={currentLang}
        onSelectCategory={onSelectCategory}
        activeSubPage={healthSubPage}
        onSubPageChange={onHealthSubPageChange}
      />
    );
  }

  return null;
}
