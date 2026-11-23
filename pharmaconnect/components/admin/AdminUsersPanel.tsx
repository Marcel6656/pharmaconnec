'use client';

import React, { useMemo, useState } from 'react';
import {
  Eye, EyeOff, KeyRound, Pencil, Plus, RefreshCw, ShieldCheck,
  Sparkles, Trash2, UserCheck, UserX,
} from 'lucide-react';
import { AdminUserItem } from '@/lib/api';
import { ActionMenu, ActionMenuItem } from '@/components/shared/ActionMenu';
import { Empty, isStrongPassword, Metric, Modal, PASSWORD_POLICY_ERROR, SectionTitle, Status } from '@/lib/shared';
import {
  ModernDigitalStoreIcon,
  ModernLockSecurityIcon,
  ModernSearchMedicineIcon,
  ModernVerifiedShieldIcon,
} from '@/components/shared/ModernIcons';
import { ConfirmDangerModal } from '@/components/admin/ConfirmDangerModal';

interface AdminUsersPanelProps {
  users: AdminUserItem[];
  loading: boolean;
  currentAdminId?: number | null;
  subNav?: React.ReactNode;
  onRefresh: () => void;
  onToggleStatus: (userId: number, active: boolean, reason?: string) => Promise<void>;
  onCreateUser: (payload: {
    name: string;
    email: string;
    role: AdminUserItem['role'];
    phone?: string;
    password: string;
    active?: boolean;
  }) => Promise<boolean | { ok: boolean; error?: string }>;
  onUpdateUser: (
    userId: number,
    payload: {
      name?: string;
      email?: string;
      role?: AdminUserItem['role'];
      phone?: string;
      active?: boolean;
      password?: string;
    },
  ) => Promise<boolean | { ok: boolean; error?: string }>;
  onDeleteUser: (userId: number) => Promise<void>;
}

const ROLE_LABELS: Record<AdminUserItem['role'], string> = {
  ADMIN: 'Administrateur',
  PHARMACIST: 'Pharmacien',
  VISITOR: 'Visiteur / Patient',
};

function generateStrongPassword(length = 14): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*?';
  const all = upper + lower + digits + symbols;
  const pick = (pool: string) => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return pool[buf[0] % pool.length];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = typeof crypto !== 'undefined' && crypto.getRandomValues
      ? (() => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % (i + 1); })()
      : Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function AdminUsersPanel({
  users,
  loading,
  currentAdminId = null,
  subNav,
  onRefresh,
  onToggleStatus,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}: AdminUsersPanelProps) {
  const [roleFilter, setRoleFilter] = useState<'Tous' | AdminUserItem['role']>('Tous');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Actif' | 'Suspendu'>('Tous');
  const [query, setQuery] = useState('');
  const [suspendTarget, setSuspendTarget] = useState<AdminUserItem | null>(null);
  const [reason, setReason] = useState('');
  const [suspending, setSuspending] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUserItem | null>(null);

  const [resetTarget, setResetTarget] = useState<AdminUserItem | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [savingReset, setSavingReset] = useState(false);

  const [userModal, setUserModal] = useState<{
    mode: 'create' | 'edit';
    userId?: number;
    name: string;
    email: string;
    role: AdminUserItem['role'];
    phone: string;
    password: string;
    active: boolean;
  } | null>(null);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userFormError, setUserFormError] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      if (roleFilter !== 'Tous' && u.role !== roleFilter) return false;
      if (statusFilter === 'Actif' && !u.active) return false;
      if (statusFilter === 'Suspendu' && u.active) return false;
      if (!q) return true;
      return `${u.name} ${u.email} ${u.phone} ${u.role}`.toLowerCase().includes(q);
    });
  }, [users, roleFilter, statusFilter, query]);

  const counts = useMemo(() => {
    let active = 0;
    let ADMIN = 0;
    let PHARMACIST = 0;
    let VISITOR = 0;
    for (const u of users) {
      if (u.active) active += 1;
      if (u.role === 'ADMIN') ADMIN += 1;
      else if (u.role === 'PHARMACIST') PHARMACIST += 1;
      else if (u.role === 'VISITOR') VISITOR += 1;
    }
    return {
      Tous: users.length,
      ADMIN,
      PHARMACIST,
      VISITOR,
      active,
    };
  }, [users]);

  const buildUserActions = (u: AdminUserItem): ActionMenuItem[] => {
    const isSelf = currentAdminId !== null && u.id === currentAdminId;
    const items: ActionMenuItem[] = [
      {
        key: 'edit',
        label: 'Modifier le compte',
        icon: <Pencil size={14} />,
        onClick: () => {
          setUserFormError('');
          setShowUserPassword(false);
          setUserModal({
            mode: 'edit',
            userId: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone || '',
            password: '',
            active: u.active,
          });
        },
      },
      {
        key: 'reset-password',
        label: 'Réinitialiser le mot de passe',
        icon: <KeyRound size={14} />,
        onClick: () => {
          setResetError('');
          setResetPassword('');
          setShowResetPassword(false);
          setResetTarget(u);
        },
      },
    ];

    if (!isSelf) {
      items.push(
        u.active
          ? {
              key: 'suspend',
              label: 'Suspendre le compte',
              icon: <UserX size={14} />,
              variant: 'danger',
              onClick: () => {
                setSuspendTarget(u);
                setReason('');
              },
            }
          : {
              key: 'reactivate',
              label: 'Réactiver le compte',
              icon: <UserCheck size={14} />,
              variant: 'success',
              onClick: () => void onToggleStatus(u.id, true),
            },
      );
      items.push({
        key: 'delete',
        label: 'Supprimer le compte',
        icon: <Trash2 size={14} />,
        variant: 'danger',
        dividerBefore: true,
        onClick: () => setDeleteTarget(u),
      });
    }

    return items;
  };

  return (
    <>
      <SectionTitle
        eyebrow="GOUVERNANCE & SÉCURITÉ"
        title="Comptes utilisateurs & accès"
        desc="Supervisez les comptes administrateurs, pharmaciens et patients. La suspension révoque immédiatement les sessions actives."
        icon={<ModernLockSecurityIcon size={24} />}
        action={
          <div className="action-pair">
            <button type="button" className="outline-btn" onClick={onRefresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualiser
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setUserFormError('');
                setShowUserPassword(false);
                setUserModal({
                  mode: 'create',
                  name: '',
                  email: '',
                  role: 'PHARMACIST',
                  phone: '',
                  password: '',
                  active: true,
                });
              }}
            >
              <Plus size={15} /> Nouvel utilisateur
            </button>
          </div>
        }
      />

      {subNav}

      <div className="metric-grid">
        <Metric
          title="Comptes actifs"
          value={`${counts.active} / ${users.length}`}
          detail="Accès autorisés"
          icon={ModernVerifiedShieldIcon}
        />
        <Metric
          title="Comptes officines"
          value={String(counts.PHARMACIST)}
          detail="Gestionnaires pharmaciens"
          icon={ModernDigitalStoreIcon}
        />
        <Metric
          title="Comptes patients"
          value={String(counts.VISITOR)}
          detail="Inscriptions publiques"
          icon={ModernVerifiedShieldIcon}
        />
        <Metric
          title="Comptes suspendus"
          value={String(users.length - counts.active)}
          detail="Sessions révoquées"
          icon={ModernLockSecurityIcon}
        />
      </div>

      <div className="toolbar">
        <label className="search-box">
          <ModernSearchMedicineIcon size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher par nom, e-mail ou téléphone…"
          />
        </label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'Tous' | 'Actif' | 'Suspendu')}>
          <option value="Tous">Tous les statuts</option>
          <option value="Actif">Actifs uniquement</option>
          <option value="Suspendu">Suspendus uniquement</option>
        </select>
      </div>

      <div className="admin-filter-row">
        {(['Tous', 'ADMIN', 'PHARMACIST', 'VISITOR'] as const).map(r => (
          <button
            key={r}
            type="button"
            className={roleFilter === r ? 'active' : ''}
            onClick={() => setRoleFilter(r)}
          >
            {r === 'Tous' ? 'Tous' : ROLE_LABELS[r]} ({counts[r]})
          </button>
        ))}
      </div>

      <section className="panel cg-modern-panel">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>UTILISATEUR</th>
                <th>RÔLE</th>
                <th>MÉTHODE</th>
                <th>ÉTABLISSEMENTS</th>
                <th>ACTIVITÉ &amp; CRÉATION</th>
                <th>STATUT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isSelf = currentAdminId !== null && u.id === currentAdminId;
                return (
                  <tr key={u.id}>
                    <td className="wrap-cell">
                      <b>
                        {u.name}
                        {isSelf && <span className="pc-self-chip">Votre session</span>}
                      </b>
                      <small className="table-sub">
                        {u.email}
                        {u.phone ? ` · ${u.phone}` : ''}
                      </small>
                    </td>
                    <td>
                      <span className="pc-role-chip">
                        <ShieldCheck size={13} /> {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td>{u.provider === 'google' ? 'Google OAuth' : 'E-mail / Mot de passe'}</td>
                    <td>{u.pharmaciesCount > 0 ? `${u.pharmaciesCount} officine(s)` : '—'}</td>
                    <td className="wrap-cell">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('fr-FR') : 'Jamais connecté'}
                      <small className="table-sub">
                        Créé le {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </small>
                    </td>
                    <td>
                      <Status>{u.active ? 'Actif' : 'Suspendu'}</Status>
                    </td>
                    <td>
                      <div className="table-actions">
                        <ActionMenu
                          label={`Actions pour ${u.name}`}
                          items={buildUserActions(u)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <Empty
              title="Aucun compte correspondant"
              detail="Ajustez les filtres de rôle ou votre recherche."
            />
          )}
        </div>
      </section>

      {suspendTarget && (
        <Modal
          title="Suspendre un compte utilisateur"
          icon={<ModernLockSecurityIcon size={20} />}
          onClose={() => { if (!suspending) setSuspendTarget(null); }}
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (suspending) return;
              const target = suspendTarget;
              const motif = reason.trim();
              setSuspending(true);
              try {
                await onToggleStatus(target.id, false, motif || undefined);
                setSuspendTarget(null);
              } finally {
                setSuspending(false);
              }
            }}
          >
            <p className="muted" style={{ marginBottom: 12 }}>
              Compte concerné : <b>{suspendTarget.name}</b> ({suspendTarget.email}). Toutes ses sessions JWT actives seront immédiatement révoquées.
            </p>
            <label className="form-field">
              Motif de suspension (journalisé dans l’audit) *
              <textarea
                rows={3}
                required
                disabled={suspending}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ex. Activité non conforme, doublon de compte ou demande de sécurité."
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={suspending} onClick={() => setSuspendTarget(null)}>
                Annuler
              </button>
              <button type="submit" className="pc-danger-btn" disabled={suspending}>
                {suspending ? 'Suspension…' : 'Confirmer la suspension'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {resetTarget && (
        <Modal
          title="Réinitialiser le mot de passe"
          icon={<KeyRound size={20} />}
          onClose={() => { if (!savingReset) setResetTarget(null); }}
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (savingReset) return;
              setResetError('');
              if (!isStrongPassword(resetPassword)) {
                setResetError(PASSWORD_POLICY_ERROR);
                return;
              }
              setSavingReset(true);
              try {
                const ok = await onUpdateUser(resetTarget.id, { password: resetPassword });
                if (ok) {
                  setResetTarget(null);
                  setResetPassword('');
                } else {
                  setResetError('La réinitialisation a échoué. Vérifiez les permissions ou la politique de mot de passe.');
                }
              } finally {
                setSavingReset(false);
              }
            }}
          >
            <p className="muted" style={{ marginBottom: 12 }}>
              Définissez un nouveau mot de passe pour <b>{resetTarget.name}</b> ({resetTarget.email}).
            </p>
            {resetError && (
              <div className="gm-error-alert" role="alert" style={{ marginBottom: 12 }}>
                {resetError}
              </div>
            )}
            <label className="form-field">
              Nouveau mot de passe *
              <div className="pc-adm-pass-wrap">
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  disabled={savingReset}
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  placeholder="8+ car., majuscule, minuscule, chiffre"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(v => !v)}
                  aria-label={showResetPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="outline-btn"
                disabled={savingReset}
                onClick={() => {
                  setResetPassword(generateStrongPassword());
                  setShowResetPassword(true);
                  setResetError('');
                }}
              >
                <Sparkles size={14} /> Générer un mot de passe fort
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={savingReset} onClick={() => setResetTarget(null)}>
                Annuler
              </button>
              <button type="submit" className="primary-btn" disabled={savingReset}>
                {savingReset ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {userModal && (
        <Modal
          title={userModal.mode === 'create' ? 'Créer un compte utilisateur' : 'Modifier le compte utilisateur'}
          icon={<ModernLockSecurityIcon size={20} />}
          onClose={() => {
            if (!savingUser) setUserModal(null);
          }}
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (savingUser) return;
              setUserFormError('');
              const name = userModal.name.trim();
              const email = userModal.email.trim().toLowerCase();
              const password = userModal.password;
              if (name.length < 2) {
                setUserFormError('Le nom doit contenir au moins 2 caractères.');
                return;
              }
              if (userModal.mode === 'create' && !isStrongPassword(password)) {
                setUserFormError(PASSWORD_POLICY_ERROR);
                return;
              }
              if (userModal.mode === 'edit' && password && !isStrongPassword(password)) {
                setUserFormError(PASSWORD_POLICY_ERROR);
                return;
              }
              setSavingUser(true);
              try {
                const res =
                  userModal.mode === 'create'
                    ? await onCreateUser({
                        name,
                        email,
                        role: userModal.role,
                        phone: userModal.phone.trim() || undefined,
                        password,
                        active: userModal.active,
                      })
                    : await onUpdateUser(userModal.userId!, {
                        name,
                        email,
                        role: userModal.role,
                        phone: userModal.phone.trim(),
                        active: userModal.active,
                        ...(password ? { password } : {}),
                      });
                const succeeded = typeof res === 'boolean' ? res : res.ok;
                if (succeeded) {
                  setUserModal(null);
                } else {
                  setUserFormError(
                    (typeof res === 'object' && res.error) || 'Impossible d’enregistrer le compte utilisateur.',
                  );
                }
              } finally {
                setSavingUser(false);
              }
            }}
          >
            {userFormError && (
              <div className="gm-error-alert" role="alert" style={{ marginBottom: 12 }}>
                {userFormError}
              </div>
            )}
            <div className="form-grid">
              <label>
                Nom complet *
                <input
                  required
                  minLength={2}
                  value={userModal.name}
                  onChange={e => setUserModal({ ...userModal, name: e.target.value })}
                />
              </label>
              <label>
                E-mail *
                <input
                  type="email"
                  required
                  value={userModal.email}
                  onChange={e => setUserModal({ ...userModal, email: e.target.value })}
                />
              </label>
              <label>
                Rôle *
                <select
                  value={userModal.role}
                  disabled={userModal.mode === 'edit' && currentAdminId !== null && userModal.userId === currentAdminId}
                  onChange={e => setUserModal({ ...userModal, role: e.target.value as AdminUserItem['role'] })}
                >
                  <option value="PHARMACIST">Pharmacien</option>
                  <option value="VISITOR">Visiteur / Patient</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </label>
              <label>
                Téléphone
                <input
                  value={userModal.phone}
                  onChange={e => setUserModal({ ...userModal, phone: e.target.value })}
                  placeholder="+235 66 00 00 00"
                />
              </label>
            </div>
            <label className="form-field">
              {userModal.mode === 'create' ? 'Mot de passe *' : 'Nouveau mot de passe (optionnel)'}
              <div className="pc-adm-pass-wrap">
                <input
                  type={showUserPassword ? 'text' : 'password'}
                  required={userModal.mode === 'create'}
                  value={userModal.password}
                  onChange={e => setUserModal({ ...userModal, password: e.target.value })}
                  placeholder="8+ car., majuscule, minuscule, chiffre"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword(v => !v)}
                  aria-label={showUserPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <div style={{ marginTop: 6, marginBottom: 8 }}>
              <button
                type="button"
                className="outline-btn"
                onClick={() => {
                  setUserModal({ ...userModal, password: generateStrongPassword() });
                  setShowUserPassword(true);
                }}
              >
                <Sparkles size={14} /> Générer un mot de passe fort
              </button>
            </div>
            <label className="check-field">
              <input
                type="checkbox"
                disabled={userModal.mode === 'edit' && currentAdminId !== null && userModal.userId === currentAdminId}
                checked={userModal.active}
                onChange={e => setUserModal({ ...userModal, active: e.target.checked })}
              />
              Compte actif
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={savingUser} onClick={() => setUserModal(null)}>
                Annuler
              </button>
              <button type="submit" className="primary-btn" disabled={savingUser}>
                {savingUser ? 'Enregistrement…' : userModal.mode === 'create' ? 'Créer le compte' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDangerModal
        open={Boolean(deleteTarget)}
        title="Supprimer le compte utilisateur"
        message={deleteTarget ? `Supprimer définitivement le compte « ${deleteTarget.name} » (${deleteTarget.email}) ? Cette action est irréversible.` : ''}
        confirmLabel="Supprimer définitivement"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await onDeleteUser(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
