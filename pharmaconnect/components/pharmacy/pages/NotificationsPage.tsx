'use client';

import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { AppData, SectionTitle, Empty } from '@/lib/shared';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { ModernBellAlertIcon } from '@/components/shared/ModernIcons';
import { SanteProcheShieldWaveScene } from '@/components/shared/SanteProcheIllustrations';

interface NotificationsPageProps {
  data: AppData;
  pharmacyId: number;
  markAllNotices: () => void;
  markNotice: (id: number) => void;
  deleteNotice?: (id: number) => void;
}

export function NotificationsPage({ data, pharmacyId, markAllNotices, markNotice, deleteNotice }: NotificationsPageProps) {
  const myNotices = data.notices.filter(n => n.pharmacyId === pharmacyId);

  return (
    <>
      <SectionTitle
        eyebrow="ALERTES & SUIVI"
        title="Notifications"
        desc="Retrouvez les informations liées à votre établissement et à vos produits."
        icon={<ModernBellAlertIcon size={24} />}
        action={
          <button
            className="outline-btn"
            onClick={markAllNotices}
          >
            Tout marquer comme lu
          </button>
        }
      />
      <section className="panel cg-modern-panel">
        {myNotices.map(n => (
          <div className="notification-row" key={n.id}>
            <span className={`notification-icon ${n.kind}`}><ModernBellAlertIcon size={17} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>{n.title}</b>
              <p>{n.body}</p>
              <small>{n.date}</small>
            </div>
            <ActionMenu
              label={`Actions pour ${n.title}`}
              items={[
                ...(!n.read ? [{
                  key: 'read',
                  label: 'Marquer comme lu',
                  icon: <Check size={14} />,
                  variant: 'success' as const,
                  onClick: () => markNotice(n.id),
                }] : []),
                ...(deleteNotice ? [{
                  key: 'delete',
                  label: 'Supprimer',
                  icon: <Trash2 size={14} />,
                  variant: 'danger' as const,
                  dividerBefore: !n.read,
                  onClick: () => deleteNotice(n.id),
                }] : []),
              ]}
            />
          </div>
        ))}
        {myNotices.length === 0 && <Empty title="Aucune notification" detail="Vous êtes à jour." />}
      </section>
      <SanteProcheShieldWaveScene
        title="Ensemble pour une meilleure santé"
        subtitle="Surveillez les validations produits, alertes de stock et messages prioritaires de vos patients."
      />
    </>
  );
}
