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
  const isEn = currentLang === 'en';

  return (
    <footer className="public-footer luxe-footer">
      <div className="luxe-footer-inner">
        <div className="luxe-footer-grid">
          <div className="luxe-footer-col-brand">
            <div className="luxe-footer-brand">
              <span className="luxe-brand-mark">
                <ModernBrandLogoIcon size={20} />
              </span>
              <div>
                <span className="luxe-brand-text">PHARMA</span>
                <span className="luxe-brand-subtitle">CONNECT</span>
              </div>
            </div>
            <p className="luxe-footer-desc">
              {isEn
                ? 'Verified pharmacies, transparent live stock and direct patient care in one refined digital platform.'
                : 'Votre réseau de pharmacies agréées, produits vérifiés et accompagnement officinal en temps réel.'}
            </p>
          </div>

          <div className="luxe-footer-col">
            <h5>{isEn ? 'Navigation' : 'Navigation'}</h5>
            <ul className="luxe-footer-links">
              <li><button type="button" onClick={() => go('Accueil')}>{t.home}</button></li>
              <li><button type="button" onClick={() => go('Pharmacies')}>{t.pharmacies}</button></li>
              <li><button type="button" onClick={() => go('Produits')}>{t.products}</button></li>
              <li><button type="button" onClick={() => go('Tarifs')}>{t.pricing}</button></li>
            </ul>
          </div>

          <div className="luxe-footer-col">
            <h5>{isEn ? 'Services' : 'Services'}</h5>
            <ul className="luxe-footer-links">
              <li><button type="button" onClick={() => go('Rubrique Santé')}>{isEn ? 'Health Section' : 'Rubrique Santé'}</button></li>
              <li><button type="button" onClick={() => go('Inscription pharmacie')}>{isEn ? 'Register Pharmacy' : 'Inscrire une pharmacie'}</button></li>
              <li><button type="button" onClick={() => go('À propos')}>{t.about}</button></li>
              <li><button type="button" onClick={() => go('Contact')}>{t.contact}</button></li>
            </ul>
          </div>

          <div className="luxe-footer-col">
            <h5>{isEn ? 'Commitments' : 'Engagements'}</h5>
            <ul className="luxe-footer-links">
              <li><button type="button" onClick={() => go('Confidentialité')}>{isEn ? 'Privacy Policy' : 'Confidentialité'}</button></li>
              <li><button type="button" onClick={() => go('Pharmacies')}>{isEn ? '24/7 Duty Care' : 'Pharmacies de garde'}</button></li>
              <li><button type="button" onClick={() => go('Produits')}>{isEn ? 'Live Inventory' : 'Stocks en direct'}</button></li>
            </ul>
          </div>
        </div>

        <hr className="luxe-footer-divider" />

        <div className="luxe-footer-bottom">
          <p className="luxe-footer-copyright">
            © {new Date().getFullYear()} PharmaConnect · KAYRA Innovation.{' '}
            {isEn ? 'All rights reserved.' : 'Tous droits réservés.'}
          </p>
          <ul className="luxe-footer-legal">
            <li><button type="button" onClick={() => go('Confidentialité')}>{isEn ? 'Privacy' : 'Confidentialité'}</button></li>
            <li><button type="button" onClick={() => go('À propos')}>{t.about}</button></li>
            <li><button type="button" onClick={() => go('Contact')}>{t.contact}</button></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
