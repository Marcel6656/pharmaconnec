'use client';

import React, { useEffect, useState } from 'react';
import { Cookie, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { Language } from '@/lib/translations';

export const COOKIE_CONSENT_KEY = 'pharmaconnect-cookie-consent';

export interface CookieConsentState {
  version: number;
  essential: true;
  thirdPartyAuth: boolean;
  updatedAt: string;
}

export function getCookieConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (typeof parsed.thirdPartyAuth !== 'boolean') return null;
    return {
      version: Number(parsed.version) || 1,
      essential: true,
      thirdPartyAuth: parsed.thirdPartyAuth,
      updatedAt: String(parsed.updatedAt || ''),
    };
  } catch {
    return null;
  }
}

export function hasThirdPartyConsent(): boolean {
  return Boolean(getCookieConsent()?.thirdPartyAuth);
}

export function saveCookieConsent(thirdPartyAuth: boolean): CookieConsentState {
  const next: CookieConsentState = {
    version: 1,
    essential: true,
    thirdPartyAuth,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('pc-cookie-consent-changed', { detail: next }));
    } catch { }
  }
  return next;
}

interface CookieBannerProps {
  forceOpen?: boolean;
  onCloseForce?: () => void;
  onOpenPolicy: () => void;
  currentLang?: Language;
}

export function CookieBanner({
  forceOpen = false,
  onCloseForce,
  onOpenPolicy,
  currentLang = 'fr',
}: CookieBannerProps) {
  const isEn = currentLang === 'en';
  const [visible, setVisible] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [thirdPartyAuth, setThirdPartyAuth] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (!existing) {
      setVisible(true);
      setThirdPartyAuth(false);
    } else {
      setThirdPartyAuth(existing.thirdPartyAuth);
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      const existing = getCookieConsent();
      setThirdPartyAuth(Boolean(existing?.thirdPartyAuth));
      setVisible(true);
      setCustomOpen(true);
    }
  }, [forceOpen]);

  if (!visible) return null;

  const commitChoice = (allowThirdParty: boolean) => {
    saveCookieConsent(allowThirdParty);
    setThirdPartyAuth(allowThirdParty);
    setVisible(false);
    setCustomOpen(false);
    onCloseForce?.();
  };

  return (
    <aside
      className="pc-cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-label={isEn ? 'Cookie preferences' : 'Gestion des cookies et traceurs'}
    >
      <div className="pc-cookie-card">
        <div className="pc-cookie-head">
          <div className="pc-cookie-title">
            <Cookie size={18} aria-hidden="true" />
            <strong>{isEn ? 'Privacy & Cookie Preferences' : 'Confidentialité & gestion des traceurs'}</strong>
          </div>
          {getCookieConsent() && (
            <button
              type="button"
              className="icon-action"
              aria-label={isEn ? 'Close' : 'Fermer'}
              onClick={() => {
                setVisible(false);
                setCustomOpen(false);
                onCloseForce?.();
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="pc-cookie-desc">
          {isEn
            ? 'PharmaConnect uses strictly necessary technical storage (authentication, language, favorites). Optional third-party Google Sign-In scripts are blocked until you choose to enable them.'
            : 'PharmaConnect utilise uniquement des stockages techniques strictement nécessaires (session, langue, favoris). Les scripts tiers facultatifs (connexion Google OAuth) restent bloqués tant que vous ne donnez pas votre accord.'}{' '}
          <button
            type="button"
            className="pc-inline-text-link"
            onClick={() => {
              setVisible(false);
              onCloseForce?.();
              onOpenPolicy();
            }}
          >
            {isEn ? 'Cookie Policy' : 'Politique cookies'}
          </button>
        </p>

        {customOpen && (
          <div className="pc-cookie-custom-list">
            <div className="pc-cookie-option">
              <div>
                <b><ShieldCheck size={14} aria-hidden="true" /> {isEn ? 'Strictly necessary storage' : 'Stockage strictement nécessaire'}</b>
                <small>{isEn ? 'Session token, language & consent choice (exempt under CNIL).' : 'Jeton de session, préférence de langue et choix cookies (exempté CNIL).'}</small>
              </div>
              <span className="pc-cookie-always-on">{isEn ? 'Always active' : 'Toujours actif'}</span>
            </div>

            <label className="pc-cookie-option is-toggle">
              <div>
                <b>{isEn ? 'Google Sign-In (third-party)' : 'Connexion Google (service tiers)'}</b>
                <small>{isEn ? 'Loads Google Identity script when signing in.' : 'Charge Google Identity Services dans la fenêtre de connexion (transfert hors UE vers Google).'}</small>
              </div>
              <input
                type="checkbox"
                checked={thirdPartyAuth}
                onChange={e => setThirdPartyAuth(e.target.checked)}
              />
            </label>
          </div>
        )}

        <div className="pc-cookie-actions">
          <button
            type="button"
            className="pc-cookie-btn pc-cookie-btn-equal"
            onClick={() => commitChoice(false)}
          >
            {isEn ? 'Refuse all' : 'Tout refuser'}
          </button>
          <button
            type="button"
            className="pc-cookie-btn pc-cookie-btn-secondary"
            onClick={() => {
              if (customOpen) commitChoice(thirdPartyAuth);
              else setCustomOpen(true);
            }}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            {customOpen
              ? (isEn ? 'Save choices' : 'Enregistrer mes choix')
              : (isEn ? 'Customize' : 'Personnaliser')}
          </button>
          <button
            type="button"
            className="pc-cookie-btn pc-cookie-btn-equal"
            onClick={() => commitChoice(true)}
          >
            {isEn ? 'Accept all' : 'Tout accepter'}
          </button>
        </div>
      </div>
    </aside>
  );
}
