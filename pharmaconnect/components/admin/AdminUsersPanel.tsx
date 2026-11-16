'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react';
import { AdminUserItem } from '@/lib/api';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { Empty, isStrongPassword, Metric, Modal, PASSWORD_POLICY_ERROR, SectionTitle, Status } from '@/lib/shared';
import {
  ModernDigitalStoreIcon,
  ModernLockSecurityIcon,
  ModernSearchMedicineIcon,
  ModernVerifiedShieldIcon,
} from '@/components/shared/ModernIcons';

interface AdminUsersPanelProps {
  users: AdminUserItem[];
  loading: boolean;
  onRefresh: () => void;
  onToggleStatus: (userId: number, active: boolean, reason?: string) => Promise<void>;
  onCreateUser: (payload: {
    name: string;
    email: string;
    role: AdminUserItem['role'];
    phone?: string;
    password: string;
    active?: boolean;
  }) => Promise<boolean>;
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
  ) => Promise<boolean>;
  onDeleteUser: (userId: number) => Promise<void>;
}

const ROLE_LABELS: Record<AdminUserItem['role'], string> = {
  ADMIN: 'Administrateur',
  PHARMACIST: 'Pharmacien',
  VISITOR: 'Visiteur / Patient',
};

export function AdminUsersPanel({
  users,
  loading,
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

  const activeCount = users.filter(u => u.active).length;
  const pharmacistCount = users.filter(u => u.role === 'PHARMACIST').length;
  const visitorCount = users.filter(u => u.role === 'VISITOR').length;

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

      <div className="metric-grid">
        <Metric
          title="Comptes actifs"
          value={`${activeCount} / ${users.length}`}
          detail="Accès autorisés"
          icon={ModernVerifiedShieldIcon}
        />
        <Metric
          title="Comptes officines"
          value={String(pharmacistCount)}
          detail="Gestionnaires pharmaciens"
          icon={ModernDigitalStoreIcon}
        />
        <Metric
          title="Comptes patients"
          value={String(visitorCount)}
          detail="Inscriptions publiques"
          icon={ModernVerifiedShieldIcon}
        />
        <Metric
          title="Comptes suspendus"
          value={String(users.length - activeCount)}
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
            {r === 'Tous' ? 'Tous les rôles' : ROLE_LABELS[r]}
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
                <th>DERNIÈRE CONNEXION</th>
                <th>STATUT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <b>{u.name}</b>
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
                  <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('fr-FR') : 'Jamais connecté'}</td>
                  <td>
                    <Status>{u.active ? 'Validée' : 'Suspendue'}</Status>
                  </td>
                  <td>
                    <div className="table-actions">
                      <ActionMenu
                        label={`Actions pour ${u.name}`}
                        items={[
                          {
                            key: 'edit',
                            label: 'Modifier le compte',
                            icon: <Pencil size={14} />,
                            onClick: () => {
                              setUserFormError('');
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
                          {
                            key: 'delete',
                            label: 'Supprimer le compte',
                            icon: <Trash2 size={14} />,
                            variant: 'danger',
                            dividerBefore: true,
                            onClick: () => {
                              if (!window.confirm(`Supprimer définitivement le compte « ${u.name} » (${u.email}) ?`)) return;
                              void onDeleteUser(u.id);
                            },
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
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
          onClose={() => setSuspendTarget(null)}
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              const target = suspendTarget;
              const motif = reason.trim();
              setSuspendTarget(null);
              await onToggleStatus(target.id, false, motif || undefined);
            }}
          >
            <p className="muted" style={{ marginBottom: 12 }}>
              Compte concerné : <b>{suspendTarget.name}</b> ({suspendTarget.email}). Toutes ses sessions JWT actives seront immédiatement révoquées.
            </p>
            <label className="form-field">
              Motif de suspension (journalisé dans l’audit)
              <textarea
                rows={3}
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ex. Activité non conforme, doublon de compte ou demande de sécurité."
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setSuspendTarget(null)}>
                Annuler
              </button>
              <button type="submit" className="primary-btn">
                Confirmer la suspension
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
                const ok =
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
                if (ok) setUserModal(null);
              } finally {
                setSavingUser(false);
              }
            }}
          >
            {userFormError && (
              <div className="info-note" style={{ marginBottom: 12, color: '#992222' }}>
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
              <input
                type="password"
                required={userModal.mode === 'create'}
                value={userModal.password}
                onChange={e => setUserModal({ ...userModal, password: e.target.value })}
                placeholder="8+ car., majuscule, minuscule, chiffre"
              />
            </label>
            <label className="check-field">
              <input
                type="checkbox"
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
    </>
  );
}
