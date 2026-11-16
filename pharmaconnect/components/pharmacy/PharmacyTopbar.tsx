'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { isActiveTrial, Pharmacy } from '@/lib/shared';
import { ModernBellAlertIcon, ModernSparkleCrownIcon } from '@/components/shared/ModernIcons';

interface PharmacyTopbarProps {
  page: string;
  unread: number;
  activePharmacy?: Pharmacy;
  go: (p: string) => void;
  setProfileForm: (f: any) => void;
  setModal: (m: any) => void;
}

export function PharmacyTopbar({
  page,
  unread,
  activePharmacy,
  go,
  setProfileForm,
  setModal
}: PharmacyTopbarProps) {
  return (
    <header className="workspace-topbar">
      <button className="mobile-nav-toggle" onClick={() => document.body.classList.toggle('nav-open')}>
        <Menu size={19} />
      </button>
      <div className="breadcrumbs">Espace pharmacie <ChevronRight size={14} /> {page}</div>
      <div className="topbar-tools">
        <button className="icon-action cg-topbar-badge-btn" onClick={() => go('Abonnement')} title="Formule & Essai">
          <ModernSparkleCrownIcon size={16} />
          <span>{activePharmacy && isActiveTrial(activePharmacy) ? 'Essai Premium' : activePharmacy?.subscription || 'Basic'}</span>
        </button>
        <button className="icon-action" onClick={() => go('Notifications')} title="Notifications">
          <ModernBellAlertIcon size={18} />
          {unread > 0 && <i className="notification-dot" />}
        </button>
        <button
          className="account-chip"
          disabled={!activePharmacy}
          onClick={() => {
            if (!activePharmacy) return;
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
          <span className="avatar">PC</span>
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
