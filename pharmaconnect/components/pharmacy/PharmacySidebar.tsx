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

interface PharmacySidebarProps {
  page: string;
  unread: number;
  unreadNotices?: number;
  pharmacyId: number;
  setSelectedPharmacyId: (id: number) => void;
  ownedPharmacies: Pharmacy[];
  activePharmacy?: Pharmacy;
  openSpace: (s: 'public' | 'pharmacy') => void;
  go: (p: string) => void;
  say: (s: string) => void;
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
  unread,
  unreadNotices = 0,
  pharmacyId,
  setSelectedPharmacyId,
  ownedPharmacies,
  activePharmacy,
  openSpace,
  go,
  say: _say,
  setExistingAccountRegistration,
  setPharmacyForm,
  setModal,
  setCurrentMessage,
  setReply,
  onLogout,
  onOpenSupport,
}: PharmacySidebarProps) {
  const navGroups = [
    {
      label: 'PRINCIPAL',
      items: [
        ['Vue d’ensemble', ModernDashboardIcon],
        ['Mes produits', ModernPackageBoxIcon],
        ['Stocks & prix', ModernClipboardStockIcon],
        ['Catégories', ModernTagCategoryIcon],
        ['Messagerie', ModernChatEncryptedIcon],
        ['Notifications', ModernBellAlertIcon]
      ]
    },
    {
      label: 'ÉTABLISSEMENT',
      items: [
        ['Mon établissement', ModernDigitalStoreIcon],
        ['Abonnement', ModernCreditCardPlanIcon],
        ['Statistiques', ModernLivePulseIcon],
        ['Paramètres', ModernSettingsGearIcon]
      ]
    }
  ];

  function navButton(label: string, Icon: any) {
    return (
      <button
        key={label}
        className={`side-link ${page === label ? 'active' : ''}`}
        onClick={() => {
          go(label);
          document.body.classList.remove('nav-open');
        }}
      >
        <Icon size={17} />
        <span>{label}</span>
        {label === 'Messagerie' && unread > 0 ? <i className="nav-count">{unread}</i> : null}
        {label === 'Notifications' && unreadNotices > 0 ? <i className="nav-count">{unreadNotices}</i> : null}
      </button>
    );
  }

  return (
    <aside className="workspace-sidebar">
      <div className="workspace-side-top">
        <div className="side-brand-icon"><ModernBrandLogoIcon size={21} /></div>
        <div><b>PHARMA<span>CONNECT</span></b><small>Espace pharmacie</small></div>
        <button className="sidebar-close" onClick={() => openSpace('public')}><X size={17} /></button>
      </div>

      <div className="workspace-switch">
        <button onClick={() => openSpace('public')}><Globe2 size={14} /> Site public</button>
      </div>

      <div className="establishment-switch">
        <label>ÉTABLISSEMENT ACTIF</label>
        <select
          value={pharmacyId}
          disabled={ownedPharmacies.length === 0}
          onChange={e => {
            setSelectedPharmacyId(Number(e.target.value));
            setCurrentMessage(null);
            setReply('');
          }}
        >
          {ownedPharmacies.length === 0 && <option value={-1}>Aucun établissement</option>}
          {ownedPharmacies.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={() => {
          setExistingAccountRegistration(true);
          setPharmacyForm({
            name: '', city: '', area: '', address: '', phone: '',
            email: activePharmacy?.email || '', license: '', responsible: '',
            lat: '', lng: '', password: '', documents: ''
          });
          setModal('register');
        }}>
          <Plus size={13} /> Ajouter un établissement
        </button>
      </div>

      {navGroups.map(group => (
        <div className="nav-group" key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map(([label, Icon]) => navButton(label as string, Icon))}
        </div>
      ))}

      <div className="sidebar-bottom">
        <div className="support-card">
          <HelpCircle size={18} />
          <b>Besoin d’aide ?</b>
          <p>Notre équipe vous accompagne.</p>
          <button onClick={() => (onOpenSupport ? onOpenSupport() : openSpace('public'))}>Contacter le support</button>
        </div>
        <div className="account-mini">
          <div className="avatar">PC</div>
          <div><b>{activePharmacy?.name || 'Espace pharmacien'}</b><small>Compte professionnel</small></div>
          <button onClick={onLogout} title="Déconnexion de l’espace pharmacie"><LogOut size={15} /></button>
        </div>
      </div>
    </aside>
  );
}
