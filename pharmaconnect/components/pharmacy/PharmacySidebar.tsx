'use client';

import React from 'react';
import { Globe2, HelpCircle, LogOut, Plus, X } from 'lucide-react';
import { Pharmacy } from '@/lib/shared';
import {
  ModernBellAlertIcon,
  ModernBrandLogoIcon,
  ModernChatEncryptedIcon,
  ModernClipboardStockIcon,
  ModernCreditCardPlanIcon,
  ModernDashboardIcon,
  ModernDigitalStoreIcon,
  ModernLivePulseIcon,
  ModernPackageBoxIcon,
  ModernSettingsGearIcon,
  ModernTagCategoryIcon
} from '@/components/shared/ModernIcons';

export const PHARMACY_NAV_GROUPS = [
  {
    label: 'PILOTAGE',
    title: 'Pilotage',
    items: [
      { label: 'Vue d’ensemble', Icon: ModernDashboardIcon },
      { label: 'Statistiques', Icon: ModernLivePulseIcon },
    ],
  },
  {
    label: 'CATALOGUE',
    title: 'Catalogue',
    items: [
      { label: 'Mes produits', Icon: ModernPackageBoxIcon },
      { label: 'Stocks & prix', Icon: ModernClipboardStockIcon },
      { label: 'Catégories', Icon: ModernTagCategoryIcon },
    ],
  },
  {
    label: 'RELATION PATIENTS',
    title: 'Relation patients',
    items: [
      { label: 'Messagerie', Icon: ModernChatEncryptedIcon },
      { label: 'Notifications', Icon: ModernBellAlertIcon },
    ],
  },
  {
    label: 'MON OFFICINE',
    title: 'Mon officine',
    items: [
      { label: 'Mon établissement', Icon: ModernDigitalStoreIcon },
      { label: 'Abonnement', Icon: ModernCreditCardPlanIcon },
      { label: 'Paramètres', Icon: ModernSettingsGearIcon },
    ],
  },
] as const;

export function getPharmacyNavGroupLabel(page: string): string {
  const group = PHARMACY_NAV_GROUPS.find(g => g.items.some(item => item.label === page));
  return group ? group.title : 'Pilotage';
}

export function getPharmacyInitials(name?: string): string {
  if (!name || !name.trim()) return 'PC';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

interface PharmacySidebarProps {
  page: string;
  unreadMessages: number;
  unreadNotices: number;
  pharmacyId: number;
  setSelectedPharmacyId: (id: number) => void;
  ownedPharmacies: Pharmacy[];
  activePharmacy?: Pharmacy;
  openSpace: (s: 'public' | 'pharmacy') => void;
  go: (p: string) => void;
  setExistingAccountRegistration: (v: boolean) => void;
  setPharmacyForm: (f: any) => void;
  setModal: (m: any) => void;
  setCurrentMessage: (id: number | null) => void;
  setReply: (s: string) => void;
  onLogout: () => void;
  onOpenSupport?: () => void;
}

export function PharmacySidebar({
  page,
  unreadMessages,
  unreadNotices,
  pharmacyId,
  setSelectedPharmacyId,
  ownedPharmacies,
  activePharmacy,
  openSpace,
  go,
  setExistingAccountRegistration,
  setPharmacyForm,
  setModal,
  setCurrentMessage,
  setReply,
  onLogout,
  onOpenSupport,
}: PharmacySidebarProps) {
  const closeMobileDrawer = () => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('nav-open');
    }
  };

  const initials = getPharmacyInitials(activePharmacy?.name);

  return (
    <aside className="workspace-sidebar">
      <div className="workspace-side-top">
        <div className="side-brand-icon"><ModernBrandLogoIcon size={21} /></div>
        <div><b>PHARMA<span>CONNECT</span></b><small>Espace pharmacie</small></div>
        <button
          type="button"
          className="sidebar-close"
          aria-label="Fermer le menu"
          onClick={closeMobileDrawer}
        >
          <X size={17} />
        </button>
      </div>

      <div className="workspace-switch">
        <button
          type="button"
          onClick={() => {
            closeMobileDrawer();
            openSpace('public');
          }}
        >
          <Globe2 size={14} /> Site public
        </button>
      </div>

      <div className="establishment-switch">
        <label htmlFor="pc-active-establishment">ÉTABLISSEMENT ACTIF</label>
        <select
          id="pc-active-establishment"
          value={pharmacyId}
          disabled={ownedPharmacies.length === 0}
          onChange={e => {
            setSelectedPharmacyId(Number(e.target.value));
            setCurrentMessage(null);
            setReply('');
            closeMobileDrawer();
          }}
        >
          {ownedPharmacies.length === 0 && <option value={-1}>Aucun établissement</option>}
          {ownedPharmacies.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          type="button"
          className="add-establishment-btn"
          onClick={() => {
            closeMobileDrawer();
            setExistingAccountRegistration(true);
            setPharmacyForm({
              name: '', city: '', area: '', address: '', phone: '',
              email: activePharmacy?.email || '', license: '', responsible: '',
              lat: '', lng: '', password: '', documents: ''
            });
            setModal('register');
          }}
        >
          <Plus size={13} /> Ajouter un établissement
        </button>
      </div>

      {PHARMACY_NAV_GROUPS.map(group => (
        <div className="nav-group" key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map(({ label, Icon }) => {
            const badgeCount =
              label === 'Messagerie' ? unreadMessages :
              label === 'Notifications' ? unreadNotices : 0;
            return (
              <button
                key={label}
                type="button"
                className={`side-link ${page === label ? 'active' : ''}`}
                onClick={() => {
                  go(label);
                  closeMobileDrawer();
                }}
              >
                <Icon size={17} />
                <span>{label}</span>
                {badgeCount > 0 && <i className="nav-count">{badgeCount}</i>}
              </button>
            );
          })}
        </div>
      ))}

      <div className="sidebar-bottom">
        <div className="support-card">
          <HelpCircle size={18} />
          <b>Besoin d’aide ?</b>
          <small>Notre équipe vous accompagne.</small>
          <button
            type="button"
            onClick={() => {
              closeMobileDrawer();
              if (onOpenSupport) onOpenSupport();
              else openSpace('public');
            }}
          >
            Contacter le support
          </button>
        </div>
        <div className="account-mini">
          <div className="avatar">{initials}</div>
          <div><b>{activePharmacy?.name || 'Espace pharmacien'}</b><small>Compte professionnel</small></div>
          <button
            type="button"
            onClick={() => {
              closeMobileDrawer();
              onLogout();
            }}
            title="Déconnexion de l’espace pharmacie"
            aria-label="Déconnexion de l’espace pharmacie"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
