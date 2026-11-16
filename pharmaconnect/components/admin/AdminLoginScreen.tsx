'use client';

import { useState } from 'react';
import { Eye, EyeOff, Globe2, LockKeyhole, ShieldCheck } from 'lucide-react';
import {
  ModernAlertWarningIcon,
  ModernBrandLogoIcon,
  ModernClipboardStockIcon,
  ModernLockSecurityIcon,
  ModernVerifiedShieldIcon,
} from '@/components/shared/ModernIcons';

interface AdminLoginScreenProps {
  loginEmail: string;
  loginPassword: string;
  loginError: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminLoginScreen({
  loginEmail,
  loginPassword,
  loginError,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="pc-adm-login-page">
      <div className="pc-adm-login-card animate-fade-in-up">
        <aside className="pc-adm-login-brand">
          <div>
            <div className="pc-adm-login-logo">
              <span className="pc-adm-login-emblem">
                <ModernBrandLogoIcon size={24} />
              </span>
              <div>
                <small>PHARMACONNECT</small>
                <strong>Console Administration</strong>
              </div>
            </div>

            <h1>Gouvernance centrale du réseau officinal</h1>
            <p>
              Supervisez les agréments des pharmacies, la modération du catalogue public, les comptes utilisateurs et la Rubrique Santé nationale depuis un portail isolé.
            </p>
          </div>

          <div className="pc-adm-login-pillars">
            <div className="pc-adm-login-pillar">
              <span><ModernVerifiedShieldIcon size={17} /></span>
              <div>
                <b>Accès restreint RBAC</b>
                <small>Réservé exclusivement aux comptes administrateurs vérifiés.</small>
              </div>
            </div>
            <div className="pc-adm-login-pillar">
              <span><ModernClipboardStockIcon size={17} /></span>
              <div>
                <b>Audit & traçabilité</b>
                <small>Chaque décision d’agrément ou de modération est horodatée.</small>
              </div>
            </div>
            <div className="pc-adm-login-pillar">
              <span><ShieldCheck size={17} /></span>
              <div>
                <b>Portail isolé</b>
                <small>Aucun lien d’accès depuis la vitrine publique PharmaConnect.</small>
              </div>
            </div>
          </div>
        </aside>

        <div className="pc-adm-login-form-wrap">
          <div className="pc-adm-login-badge">
            <LockKeyhole size={13} /> CONNEXION SÉCURISÉE
          </div>
          <h2>Ouvrir une session administrateur</h2>
          <p className="pc-adm-login-sub">
            Identifiez-vous avec votre compte d’administration pour accéder au tableau de pilotage.
          </p>

          {loginError && (
            <div className="pc-adm-login-error" role="alert">
              <ModernAlertWarningIcon size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="pc-adm-login-form">
            <label className="pc-adm-field">
              <span>Identifiant administrateur</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={loginEmail}
                onChange={e => onEmailChange(e.target.value)}
                placeholder="admin@pharmaconnect.org"
              />
            </label>

            <label className="pc-adm-field">
              <span>Mot de passe</span>
              <div className="pc-adm-pass-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={e => onPasswordChange(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button type="submit" className="primary-btn pc-adm-login-submit">
              <ModernLockSecurityIcon size={15} /> Se connecter à l’administration
            </button>
          </form>

          <div className="pc-adm-login-footer">
            <a href="/">
              <Globe2 size={14} /> Retourner au site public PharmaConnect
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
