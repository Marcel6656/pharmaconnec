'use client';

import React, { useEffect, useState } from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { AppData, PASSWORD_POLICY_ERROR, PharmacyPreferences, SectionTitle, ToggleRow, isStrongPassword, seed } from '@/lib/shared';
import { apiChangePassword, apiDeleteMe, apiLogoutAllSessions } from '@/lib/api';
import { ModernLockSecurityIcon, ModernSettingsGearIcon } from '@/components/shared/ModernIcons';

interface SettingsPageProps {
  data: AppData;
  pharmacyId: number;
  canOperatePharmacy?: boolean;
  updatePreferences: (patch: Partial<PharmacyPreferences>) => void;
  say: (s: string) => void;
  onLogout?: (customNotice?: string) => void;
}

export function SettingsPage({
  data,
  pharmacyId,
  canOperatePharmacy = true,
  updatePreferences,
  say,
  onLogout
}: SettingsPageProps) {
  const prefs = data.preferences[pharmacyId] || seed.preferences[1];
  const savedThreshold = prefs.lowStockThreshold ?? 5;

  const [thresholdInput, setThresholdInput] = useState(String(savedThreshold));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busyPwd, setBusyPwd] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);

  useEffect(() => {
    setThresholdInput(String(savedThreshold));
  }, [savedThreshold, pharmacyId]);

  const prefsDisabled = !canOperatePharmacy || pharmacyId <= 0;

  return (
    <>
      <SectionTitle
        eyebrow="CONFIGURATION"
        title="Paramètres"
        desc="Préférences de votre espace professionnel et sécurité du compte."
        icon={<ModernSettingsGearIcon size={24} />}
      />
      <div className="two-panels">
        <section className="panel cg-modern-panel">
          <h3>Préférences de notification</h3>
          <ToggleRow
            title="Messages reçus"
            detail="Afficher une notification lorsqu’un visiteur contacte la pharmacie."
            disabled={prefsDisabled}
            checked={prefs.notificationMessages}
            onChange={v => updatePreferences({ notificationMessages: v })}
          />
          <ToggleRow
            title="Rappels d’abonnement"
            detail="Recevoir les notifications d’échéance d’abonnement."
            disabled={prefsDisabled}
            checked={prefs.subscriptionReminders}
            onChange={v => updatePreferences({ subscriptionReminders: v })}
          />
          <ToggleRow
            title="Alertes de stock"
            detail="Signaler les produits dont le stock déclaré devient faible."
            disabled={prefsDisabled}
            checked={prefs.lowStockAlerts}
            onChange={v => updatePreferences({ lowStockAlerts: v })}
          />

          <form
            className="pc-threshold-form"
            onSubmit={e => {
              e.preventDefault();
              if (prefsDisabled) return;
              const parsed = Number(thresholdInput);
              if (!Number.isInteger(parsed) || parsed < 1 || parsed > 500) {
                say('Indiquez un seuil entier compris entre 1 et 500 unités.');
                return;
              }
              updatePreferences({ lowStockThreshold: parsed });
            }}
          >
            <div className="pc-threshold-copy">
              <b>Seuil d’alerte de stock faible</b>
              <small>Déclenche une alerte et classe le produit en stock faible en dessous ou égal à ce seuil (1 à 500).</small>
            </div>
            <div className="pc-threshold-controls">
              <input
                type="number"
                min={1}
                max={500}
                step={1}
                required
                aria-label="Seuil de stock faible"
                disabled={prefsDisabled}
                value={thresholdInput}
                onChange={e => setThresholdInput(e.target.value)}
              />
              <button
                type="submit"
                className="outline-btn"
                disabled={prefsDisabled || Number(thresholdInput) === savedThreshold}
              >
                Enregistrer
              </button>
            </div>
          </form>
        </section>

        <section className="panel cg-modern-panel">
          <h3>Sécurité du compte</h3>
          <p className="muted">Modifiez votre mot de passe professionnel ou révoquez toutes vos sessions actives.</p>
          <form
            className="pc-password-form"
            onSubmit={async e => {
              e.preventDefault();
              if (!isStrongPassword(newPassword)) {
                say(PASSWORD_POLICY_ERROR);
                return;
              }
              setBusyPwd(true);
              const res = await apiChangePassword(currentPassword, newPassword);
              setBusyPwd(false);
              if (!res.ok) {
                say(res.error);
                return;
              }
              setCurrentPassword('');
              setNewPassword('');
              say('Mot de passe modifié. Les anciennes sessions ont été révoquées.');
            }}
          >
            <label className="form-field">
              Mot de passe actuel
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <label className="form-field">
              Nouveau mot de passe (8 car. min.)
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <button type="submit" className="primary-btn full-btn" disabled={busyPwd}>
              <ModernLockSecurityIcon size={15} /> {busyPwd ? 'Mise à jour…' : 'Changer le mot de passe'}
            </button>
          </form>
          <button
            type="button"
            className="outline-btn full-btn pc-logout-all-btn"
            onClick={async () => {
              const ok = await apiLogoutAllSessions();
              if (!ok) {
                say('Impossible de révoquer les sessions sur le serveur.');
                return;
              }
              onLogout?.('Toutes les sessions actives ont été déconnectées.');
            }}
          >
            <LogOut size={15} /> Déconnecter toutes mes sessions
          </button>
          <div className="info-note">Les préférences et paramètres de sécurité sont synchronisés avec votre compte serveur.</div>

          <div className="pc-danger-zone">
            <strong>Suppression du compte &amp; des données (RGPD)</strong>
            <small>
              Vous pouvez demander l’effacement immédiat de votre compte utilisateur. Vos fiches pharmacies seront suspendues et retirées de l’annuaire public.
            </small>
            <button
              type="button"
              className="pc-danger-btn"
              disabled={busyDelete}
              onClick={async () => {
                if (!window.confirm('Confirmer la suppression définitive de votre compte et de vos accès personnels ?')) {
                  return;
                }
                setBusyDelete(true);
                const res = await apiDeleteMe();
                setBusyDelete(false);
                if (!res.ok) {
                  say(res.error);
                  return;
                }
                onLogout?.('Votre compte et vos données personnelles ont été supprimés.');
              }}
            >
              <Trash2 size={14} /> {busyDelete ? 'Suppression…' : 'Supprimer mon compte et mes données'}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
