'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppData, Empty, Metric, Pharmacy, SectionTitle, Status } from '@/lib/shared';
import {
  ModernChatEncryptedIcon,
  ModernEmergency24Icon,
  ModernSearchMedicineIcon,
  ModernSendPlaneIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

type MessageFilter = 'Tous' | 'Non lus' | 'Sans réponse';
const MESSAGE_FILTER_PILLS: MessageFilter[] = ['Tous', 'Non lus', 'Sans réponse'];

interface MessagesPageProps {
  data: AppData;
  pharmacyId: number;
  activePharmacy?: Pharmacy;
  canOperatePharmacy?: boolean;
  currentMessage: number | null;
  setCurrentMessage?: (id: number | null) => void;
  reply: string;
  setReply: (r: string) => void;
  setMessageRead: (id: number) => void;
  sendReply: (threadId: number) => void;
}

export function MessagesPage({
  data,
  pharmacyId,
  activePharmacy,
  canOperatePharmacy = true,
  currentMessage,
  setCurrentMessage,
  reply,
  setReply,
  setMessageRead,
  sendReply
}: MessagesPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MessageFilter>('Tous');

  // Correspond à assertPharmacyOperational(pharmacy, true) côté backend
  const canReply = activePharmacy
    ? activePharmacy.status === 'Validée' && canOperatePharmacy
    : canOperatePharmacy;

  const { enrichedThreads, unreadCount, repliedCount } = useMemo(() => {
    const roots = data.messages.filter(
      m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.threadId
    );
    let unread = 0;
    let replied = 0;
    const enriched = roots.map(m => {
      const threadMsgs = data.messages.filter(x => x.pharmacyId === pharmacyId && x.threadId === m.id);
      const hasUnread = !m.read || threadMsgs.some(x => x.direction === 'visitor' && !x.read);
      const hasReply = threadMsgs.some(x => x.direction === 'pharmacy');
      if (hasUnread) unread += 1;
      if (hasReply) replied += 1;
      const statusLabel = hasUnread ? 'Non lu' : hasReply ? 'Répondu' : 'En attente';
      return { message: m, hasUnread, hasReply, statusLabel };
    });
    return { enrichedThreads: enriched, unreadCount: unread, repliedCount: replied };
  }, [data.messages, pharmacyId]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedThreads.filter(item => {
      if (filter === 'Non lus' && !item.hasUnread) return false;
      if (filter === 'Sans réponse' && item.hasReply) return false;
      if (q) {
        const hay = `${item.message.sender} ${item.message.subject} ${item.message.body} ${item.message.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enrichedThreads, filter, search]);

  const activeThread = useMemo(
    () =>
      currentMessage
        ? data.messages.find(m => m.id === currentMessage && m.pharmacyId === pharmacyId) || null
        : null,
    [currentMessage, data.messages, pharmacyId]
  );

  const activeReplies = useMemo(
    () =>
      activeThread
        ? data.messages
            .filter(x => x.pharmacyId === pharmacyId && x.threadId === activeThread.id)
            .sort((a, b) => a.id - b.id)
        : [],
    [activeThread, data.messages, pharmacyId]
  );

  return (
    <>
      <SectionTitle
        eyebrow="RELATION PATIENTS"
        title="Messagerie"
        desc="Échangez directement avec les visiteurs intéressés par vos produits ou votre établissement."
        icon={<ModernChatEncryptedIcon size={24} />}
      />

      <div className="metric-grid">
        <Metric
          title="Conversations"
          value={String(enrichedThreads.length)}
          detail="Demandes patients reçues"
          icon={ModernChatEncryptedIcon}
        />
        <Metric
          title="Non lues"
          value={String(unreadCount)}
          detail="À consulter rapidement"
          icon={ModernEmergency24Icon}
        />
        <Metric
          title="Répondues"
          value={String(repliedCount)}
          detail="Échanges pris en charge"
          icon={ModernVerifiedShieldIcon}
        />
      </div>

      <div className="toolbar">
        <label className="search-box">
          <ModernSearchMedicineIcon size={17} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un patient, objet ou numéro…"
          />
        </label>
        <div className="pc-status-filter-bar" role="tablist" aria-label="Filtrer les conversations">
          {MESSAGE_FILTER_PILLS.map(pill => (
            <button
              key={pill}
              type="button"
              role="tab"
              aria-selected={filter === pill}
              className={`pc-status-pill ${filter === pill ? 'active' : ''}`}
              onClick={() => setFilter(pill)}
            >
              <span>{pill}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`message-layout ${activeThread ? 'has-thread' : ''}`}>
        <section className="panel cg-modern-panel message-list">
          <div className="panel-heading">
            <div><h3>Conversations</h3><p>{filteredThreads.length} demande(s)</p></div>
          </div>
          {filteredThreads.map(({ message: m, hasUnread, statusLabel }) => (
            <button
              type="button"
              className={`message-preview ${currentMessage === m.id ? 'active' : ''} ${hasUnread ? 'is-unread' : ''}`}
              key={m.id}
              onClick={() => setMessageRead(m.id)}
            >
              <span className="avatar">{m.sender.slice(0, 1).toUpperCase()}</span>
              <span className="pc-message-preview-body">
                <b>{m.sender}</b>
                <small>{m.subject}</small>
                <em>{m.date}</em>
              </span>
              <Status>{statusLabel}</Status>
            </button>
          ))}
          {filteredThreads.length === 0 && (
            <Empty
              title="Aucun message"
              detail={
                enrichedThreads.length === 0
                  ? 'Les demandes des visiteurs apparaîtront ici.'
                  : 'Aucune conversation ne correspond aux filtres sélectionnés.'
              }
            />
          )}
        </section>

        <section className="panel cg-modern-panel message-thread">
          {activeThread ? (
            <>
              <div className="thread-heading">
                <button
                  type="button"
                  className="pc-mobile-back-btn"
                  onClick={() => setCurrentMessage?.(null)}
                  aria-label="Retour à la liste des conversations"
                >
                  <ArrowLeft size={16} /> Retour
                </button>
                <div className="avatar">{activeThread.sender.slice(0, 1).toUpperCase()}</div>
                <div>
                  <b>{activeThread.sender}</b>
                  <small>{activeThread.phone} · {activeThread.subject}</small>
                </div>
              </div>
              <div className="thread-body">
                <div className="message-bubble incoming">
                  <small>{activeThread.date}</small>
                  <p>{activeThread.body}</p>
                </div>
                {activeReplies.map(x => (
                  <div className={`message-bubble ${x.direction === 'pharmacy' ? 'outgoing' : 'incoming'}`} key={x.id}>
                    <small>{x.sender} · {x.date}</small>
                    <p>{x.body}</p>
                  </div>
                ))}
              </div>
              <form
                className="reply-box"
                onSubmit={e => {
                  e.preventDefault();
                  if (canReply) sendReply(activeThread.id);
                }}
              >
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder={
                    canReply
                      ? 'Écrire une réponse…'
                      : 'Réponses réservées aux établissements validés et actifs.'
                  }
                  disabled={!canReply}
                />
                <button type="submit" className="primary-btn" disabled={!canReply || !reply.trim()}>
                  <ModernSendPlaneIcon size={15} /> Envoyer
                </button>
              </form>
            </>
          ) : (
            <Empty
              title="Sélectionnez une conversation"
              detail="Choisissez un message à gauche pour consulter l’échange et répondre."
            />
          )}
        </section>
      </div>
    </>
  );
}
