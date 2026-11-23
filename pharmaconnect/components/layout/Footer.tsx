'use client';

import React from 'react';
import { Language, translations } from '@/lib/translations';
import { ModernBrandLogoIcon, ModernWhatsAppIcon } from '@/components/shared/ModernIcons';

interface FooterProps {
  go: (p: string) => void;
  currentLang?: Language;
  onOpenCookieSettings?: () => void;
}

export function Footer({ go, currentLang = 'fr', onOpenCookieSettings }: FooterProps) {
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
            <div className="luxe-footer-contact">
              <a href="tel:+23560709192">+235 60 70 91 92</a>
              <span aria-hidden="true">·</span>
              <a href="mailto:tginnovation7@gmail.com">tginnovation7@gmail.com</a>
            </div>
            <div className="luxe-footer-socials" aria-label={isEn ? 'Social networks' : 'Réseaux sociaux'}>
              <a
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/pharmaconnect'}
                target="_blank"
                rel="noopener noreferrer"
                className="luxe-social-link"
                aria-label="Facebook PharmaConnect"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.7v3h2.6v8h3.2z" />
                </svg>
                <span>Facebook</span>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/23560709192?text=Bonjour%20PharmaConnect'}
                target="_blank"
                rel="noopener noreferrer"
                className="luxe-social-link"
                aria-label="WhatsApp PharmaConnect"
              >
                <ModernWhatsAppIcon size={15} />
                <span>WhatsApp</span>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_TIKTOK_URL || 'https://www.tiktok.com/@pharmaconnect'}
                target="_blank"
                rel="noopener noreferrer"
                className="luxe-social-link"
                aria-label="TikTok PharmaConnect"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.3 6.7a4.9 4.9 0 0 1-3.1-4.1V2h-3.2v13.2a2.9 2.9 0 1 1-2-2.7V9.2a6.1 6.1 0 1 0 5.2 6V8.6a8 8 0 0 0 4.6 1.5V6.9c-.5 0-1-.1-1.5-.2z" />
                </svg>
                <span>TikTok</span>
              </a>
            </div>
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
            <h5>{isEn ? 'Legal & Compliance' : 'Informations légales'}</h5>
            <ul className="luxe-footer-links">
              <li><button type="button" onClick={() => go('Mentions légales')}>{isEn ? 'Legal Notice' : 'Mentions légales'}</button></li>
              <li><button type="button" onClick={() => go('Conditions générales')}>{isEn ? 'Terms & Refund Policy' : 'CGU, CGV & Rétractation'}</button></li>
              <li><button type="button" onClick={() => go('Confidentialité')}>{isEn ? 'Privacy Policy' : 'Confidentialité'}</button></li>
              <li><button type="button" onClick={() => go('Politique cookies')}>{isEn ? 'Cookie Policy' : 'Politique cookies'}</button></li>
              {onOpenCookieSettings && (
                <li><button type="button" onClick={onOpenCookieSettings}>{isEn ? 'Cookie Settings' : 'Gérer mes cookies'}</button></li>
              )}
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
            <li><button type="button" onClick={() => go('Mentions légales')}>{isEn ? 'Legal' : 'Mentions légales'}</button></li>
            <li><button type="button" onClick={() => go('Conditions générales')}>{isEn ? 'Terms' : 'CGU / CGV'}</button></li>
            <li><button type="button" onClick={() => go('Confidentialité')}>{isEn ? 'Privacy' : 'Confidentialité'}</button></li>
            <li><button type="button" onClick={() => go('Politique cookies')}>{isEn ? 'Cookies' : 'Cookies'}</button></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
