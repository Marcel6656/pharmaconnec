'use client';

import React from 'react';
import { AppData, SectionTitle, Empty } from '@/lib/shared';
import { ModernChatEncryptedIcon, ModernSendPlaneIcon } from '@/components/shared/ModernIcons';

interface MessagesPageProps {
  data: AppData;
  pharmacyId: number;
  canOperatePharmacy?: boolean;
  currentMessage: number | null;
  reply: string;
  setReply: (r: string) => void;
  setMessageRead: (id: number) => void;
  sendReply: (threadId: number) => void;
}

export function MessagesPage({
  data,
  pharmacyId,
  canOperatePharmacy = true,
  currentMessage,
  reply,
  setReply,
  setMessageRead,
  sendReply
}: MessagesPageProps) {
  const threads = data.messages.filter(m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.threadId);

  return (
    <>
      <SectionTitle
        eyebrow="RELATION PATIENTS"
        title="Messagerie"
        desc="Échangez directement avec les visiteurs intéressés par vos produits ou votre établissement."
        icon={<ModernChatEncryptedIcon size={24} />}
      />
      <div className="message-layout">
        <section className="panel cg-modern-panel message-list">
          <div className="panel-heading">
            <div><h3>Conversations</h3><p>{threads.length} demandes reçues</p></div>
          </div>
          {threads.map(m => (
            <button className={`message-preview ${currentMessage === m.id ? 'active' : ''}`} key={m.id} onClick={() => setMessageRead(m.id)}>
              <span className="avatar">{m.sender.slice(0, 1)}</span>
              <span><b>{m.sender}</b><small>{m.subject}</small><em>{m.date}</em></span>
              {(!m.read || data.messages.some(x => x.threadId === m.id && x.direction === 'visitor' && !x.read)) && <i />}
            </button>
          ))}
          {threads.length === 0 && (
            <Empty title="Aucun message" detail="Les demandes des visiteurs apparaîtront ici." />
          )}
        </section>
        <section className="panel cg-modern-panel message-thread">
          {currentMessage && data.messages.find(m => m.id === currentMessage && m.pharmacyId === pharmacyId) ? (() => {
            const m = data.messages.find(x => x.id === currentMessage && x.pharmacyId === pharmacyId)!;
            return (
              <>
                <div className="thread-heading">
                  <div className="avatar">{m.sender.slice(0, 1)}</div>
                  <div><b>{m.sender}</b><small>{m.phone} · {m.subject}</small></div>
                </div>
                <div className="thread-body">
                  <div className="message-bubble incoming"><small>{m.date}</small><p>{m.body}</p></div>
                  {data.messages.filter(x => x.pharmacyId === pharmacyId && x.threadId === m.id).sort((a, b) => a.id - b.id).map(x => (
                    <div className={`message-bubble ${x.direction === 'pharmacy' ? 'outgoing' : 'incoming'}`} key={x.id}>
                      <small>{x.sender} · {x.date}</small>
                      <p>{x.body}</p>
                    </div>
                  ))}
                </div>
                <form className="reply-box" onSubmit={e => { e.preventDefault(); if (canOperatePharmacy) sendReply(m.id); }}>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder={canOperatePharmacy ? 'Écrire une réponse…' : 'Réponses désactivées : établissement inactif ou expiré.'}
                    disabled={!canOperatePharmacy}
                  />
                  <button className="primary-btn" disabled={!canOperatePharmacy || !reply.trim()}>
                    <ModernSendPlaneIcon size={15} /> Envoyer
                  </button>
                </form>
              </>
            );
          })() : (
            <Empty title="Sélectionnez une conversation" detail="Choisissez un message à gauche pour consulter et répondre." />
          )}
        </section>
      </div>
    </>
  );
}
