'use client';

import React, { useMemo, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { AppData, Empty, SectionTitle, Status } from '@/lib/shared';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { ModernBellAlertIcon } from '@/components/shared/ModernIcons';
import { SanteProcheShieldWaveScene } from '@/components/shared/SanteProcheIllustrations';

type NoticeFilter = 'Toutes' | 'Non lues' | 'Alertes' | 'Infos';
const NOTICE_FILTER_PILLS: NoticeFilter[] = ['Toutes', 'Non lues', 'Alertes', 'Infos'];

interface NotificationsPageProps {
  data: AppData;
  pharmacyId: number;
  markAllNotices: () => void;
  markNotice: (id: number) => void;
  deleteNotice?: (id: number) => void;
}

export function NotificationsPage({
  data,
  pharmacyId,
  markAllNotices,
  markNotice,
  deleteNotice
}: NotificationsPageProps) {
  const [filter, setFilter] = useState<NoticeFilter>('Toutes');

  const { myNotices, unreadCount, filteredNotices } = useMemo(() => {
    const mine = data.notices.filter(n => n.pharmacyId === pharmacyId);
    const unread = mine.filter(n => !n.read).length;
    const filtered = mine.filter(n => {
      if (filter === 'Non lues') return !n.read;
      if (filter === 'Alertes') return n.kind === 'warning';
      if (filter === 'Infos') return n.kind === 'info' || n.kind === 'success';
      return true;
    });
    return { myNotices: mine, unreadCount: unread, filteredNotices: filtered };
  }, [data.notices, pharmacyId, filter]);

  return (
    <>
      <SectionTitle
        eyebrow="ALERTES & SUIVI"
        title="Notifications"
        desc="Retrouvez les informations liées à votre établissement et à vos produits."
        icon={<ModernBellAlertIcon size={24} />}
        action={
          <button
            type="button"
            className="outline-btn"
            disabled={unreadCount === 0}
            onClick={markAllNotices}
          >
            Tout marquer comme lu
          </button>
        }
      />

      <div className="pc-status-filter-bar" role="tablist" aria-label="Filtrer les notifications">
        {NOTICE_FILTER_PILLS.map(pill => {
          const count =
            pill === 'Toutes'
              ? myNotices.length
              : pill === 'Non lues'
                ? unreadCount
                : pill === 'Alertes'
                  ? myNotices.filter(n => n.kind === 'warning').length
                  : myNotices.filter(n => n.kind !== 'warning').length;
          return (
            <button
              key={pill}
              type="button"
              role="tab"
              aria-selected={filter === pill}
              className={`pc-status-pill ${filter === pill ? 'active' : ''}`}
              onClick={() => setFilter(pill)}
            >
              <span>{pill}</span>
              <span className="pc-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      <section className="panel cg-modern-panel">
        {filteredNotices.map(n => (
          <div className={`notification-row ${!n.read ? 'is-unread' : ''}`} key={n.id}>
            <span className={`notification-icon ${n.kind}`}><ModernBellAlertIcon size={17} /></span>
            <div className="pc-notification-content">
              <div className="pc-notification-head">
                <b>{n.title}</b>
                {!n.read && <Status>Nouveau</Status>}
              </div>
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
        {filteredNotices.length === 0 && (
          <Empty
            title="Aucune notification"
            detail={
              myNotices.length === 0
                ? 'Vous êtes à jour.'
                : 'Aucune notification ne correspond à ce filtre.'
            }
          />
        )}
      </section>

      <SanteProcheShieldWaveScene
        title="Ensemble pour une meilleure santé"
        subtitle="Surveillez les validations produits, alertes de stock et messages prioritaires de vos patients."
      />
    </>
  );
}
