'use client';

import React from 'react';
import { Language, translations } from '@/lib/translations';
import { ModernBrandLogoIcon } from '@/components/shared/ModernIcons';

interface FooterProps {
  go: (p: string) => void;
  currentLang?: Language;
}

export function Footer({ go, currentLang = 'fr' }: FooterProps) {
  const t = translations[currentLang]?.nav || translations.fr.nav;

  return (
    <footer className="public-footer">
      <div className="cg-footer-inner">
        <div className="footer-brand">
          <span className="logo-symbol"><ModernBrandLogoIcon size={21} /></span>
          <b>PHARMA<span>CONNECT</span></b>
        </div>
        <div className="cg-footer-nav">
          <button onClick={() => go('Accueil')}>{t.home}</button>
          <button onClick={() => go('Pharmacies')}>{t.pharmacies}</button>
          <button onClick={() => go('Produits')}>{t.products}</button>
          <button onClick={() => go('Tarifs')}>{t.pricing}</button>
          <button onClick={() => go('Rubrique Santé')}>{currentLang === 'en' ? 'Health Section' : 'Rubrique Santé'}</button>
          <button onClick={() => go('À propos')}>{t.about}</button>
          <button onClick={() => go('Confidentialité')}>{currentLang === 'en' ? 'Privacy' : 'Confidentialité'}</button>
          <button onClick={() => go('Contact')}>{t.contact}</button>
        </div>
        <div className="cg-footer-tagline">
          <span>{currentLang === 'en' ? 'HEALTHCARE ACCESSIBLE TO EVERYONE.' : 'POUR UNE SANTÉ ACCESSIBLE À TOUS.'}</span>
          <small>© {new Date().getFullYear()} PharmaConnect · KAYRA Innovation</small>
        </div>
      </div>
    </footer>
  );
}
