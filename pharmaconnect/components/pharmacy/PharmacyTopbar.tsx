'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Menu, Plus } from 'lucide-react';
import { isActiveTrial, Pharmacy, Product, Status } from '@/lib/shared';
import { ModernBellAlertIcon, ModernSparkleCrownIcon } from '@/components/shared/ModernIcons';
import { getPharmacyInitials, getPharmacyNavGroupLabel } from '@/components/pharmacy/PharmacySidebar';

interface PharmacyTopbarProps {
  page: string;
  unreadNotices: number;
  activePharmacy?: Pharmacy;
  canOperatePharmacy: boolean;
  go: (p: string) => void;
  resetProductForm: (p?: Product) => void;
  setProfileForm: (f: any) => void;
  setModal: (m: any) => void;
}

export function PharmacyTopbar({
  page,
  unreadNotices,
  activePharmacy,
  canOperatePharmacy,
  go,
  resetProductForm,
  setProfileForm,
  setModal
}: PharmacyTopbarProps) {
  const groupLabel = getPharmacyNavGroupLabel(page);
  const initials = getPharmacyInitials(activePharmacy?.name);

  return (
    <header className="workspace-topbar">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label="Ouvrir le menu de navigation"
        onClick={() => document.body.classList.toggle('nav-open')}
      >
        <Menu size={19} />
      </button>

      <div className="breadcrumbs">
        <span>Espace pharmacie</span>
        <ChevronRight size={14} />
        <span className="pc-breadcrumb-group">{groupLabel}</span>
        <ChevronRight size={14} />
        <strong className="pc-breadcrumb-current">{page}</strong>
      </div>

      <div className="topbar-tools">
        {activePharmacy && (
          <div className="pc-topbar-status">
            <Status>{activePharmacy.status}</Status>
          </div>
        )}

        <button
          type="button"
          className="primary-btn pc-topbar-add-btn"
          disabled={!canOperatePharmacy}
          title={canOperatePharmacy ? 'Ajouter un nouveau produit' : 'Disponible pour un dossier actif'}
          onClick={() => resetProductForm()}
        >
          <Plus size={15} />
          <span>Produit</span>
        </button>

        <button
          type="button"
          className="icon-action cg-topbar-badge-btn"
          onClick={() => go('Abonnement')}
          title="Formule & Essai"
        >
          <ModernSparkleCrownIcon size={16} />
          <span>{activePharmacy && isActiveTrial(activePharmacy) ? 'Essai Premium' : activePharmacy?.subscription || 'Basic'}</span>
        </button>

        <button
          type="button"
          className="icon-action pc-topbar-bell-btn"
          onClick={() => go('Notifications')}
          title="Notifications"
          aria-label={`Notifications (${unreadNotices} non lues)`}
        >
          <ModernBellAlertIcon size={18} />
          {unreadNotices > 0 && (
            <span className="pc-topbar-bell-count">{unreadNotices > 99 ? '99+' : unreadNotices}</span>
          )}
        </button>

        <button
          type="button"
          className="account-chip"
          disabled={!activePharmacy}
          onClick={() => {
            if (!activePharmacy) return;
            if (!canOperatePharmacy) {
              go('Mon établissement');
              return;
            }
            setProfileForm({
              name: activePharmacy.name,
              city: activePharmacy.city,
              area: activePharmacy.area,
              address: activePharmacy.address,
              phone: activePharmacy.phone,
              email: activePharmacy.email,
              responsible: activePharmacy.responsible,
              lat: activePharmacy.lat === undefined ? '' : String(activePharmacy.lat),
              lng: activePharmacy.lng === undefined ? '' : String(activePharmacy.lng)
            });
            setModal('profile');
          }}
        >
          <span className="avatar">{initials}</span>
          <span>
            <b>{activePharmacy?.name || 'Aucun établissement'}</b>
            <small>{activePharmacy ? (activePharmacy.status === 'Validée' ? 'Établissement vérifié' : activePharmacy.status) : 'À rattacher'}</small>
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
