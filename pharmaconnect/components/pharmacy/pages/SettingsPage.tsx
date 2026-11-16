'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { AppData, PharmacyPreferences, seed, SectionTitle, ToggleRow } from '@/lib/shared';
import { apiChangePassword, apiLogoutAllSessions } from '@/lib/api';
import { ModernLockSecurityIcon, ModernSettingsGearIcon } from '@/components/shared/ModernIcons';

interface SettingsPageProps {
  data: AppData;
  pharmacyId: number;
  canOperatePharmacy?: boolean;
  updatePreferences: (patch: Partial<PharmacyPreferences>) => void;
  say: (s: string) => void;
  onLogout?: () => void;
}

export function SettingsPage({ data, pharmacyId, canOperatePharmacy = true, updatePreferences, say, onLogout }: SettingsPageProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busyPwd, setBusyPwd] = useState(false);

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
            disabled={!canOperatePharmacy || pharmacyId <= 0}
            checked={(data.preferences[pharmacyId] || seed.preferences[1]).notificationMessages}
            onChange={v => updatePreferences({ notificationMessages: v })}
          />
          <ToggleRow
            title="Rappels d’abonnement"
            detail="Recevoir les notifications d’échéance d’abonnement."
            disabled={!canOperatePharmacy || pharmacyId <= 0}
            checked={(data.preferences[pharmacyId] || seed.preferences[1]).subscriptionReminders}
            onChange={v => updatePreferences({ subscriptionReminders: v })}
          />
          <ToggleRow
            title="Alertes de stock"
            detail="Signaler les produits dont le stock déclaré devient faible."
            disabled={!canOperatePharmacy || pharmacyId <= 0}
            checked={(data.preferences[pharmacyId] || seed.preferences[1]).lowStockAlerts}
            onChange={v => updatePreferences({ lowStockAlerts: v })}
          />
        </section>
        <section className="panel cg-modern-panel">
          <h3>Sécurité du compte</h3>
          <p className="muted">Modifiez votre mot de passe professionnel ou révoquez toutes vos sessions actives.</p>
          <form
            style={{ display: 'grid', gap: 10, marginTop: 12 }}
            onSubmit={async e => {
              e.preventDefault();
              if (newPassword.length < 8) {
                say('Le nouveau mot de passe doit contenir au moins 8 caractères.');
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
            className="outline-btn full-btn"
            style={{ marginTop: 10 }}
            onClick={async () => {
              const ok = await apiLogoutAllSessions();
              if (!ok) {
                say('Impossible de révoquer les sessions sur le serveur.');
                return;
              }
              say('Toutes les sessions actives ont été déconnectées.');
              onLogout?.();
            }}
          >
            <LogOut size={15} /> Déconnecter toutes mes sessions
          </button>
          <div className="info-note">Les préférences et paramètres de sécurité sont synchronisés avec votre compte serveur.</div>
        </section>
      </div>
    </>
  );
}
