'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, ExternalLink, Share2 } from 'lucide-react';
import {
  AppData, money, isPharmacyActiveAndValid, isProductFresh,
  Status, activeBadges, BadgeGlyph, Empty
} from '@/lib/shared';
import {
  ModernAlertWarningIcon,
  ModernChatEncryptedIcon,
  ModernEmergency24Icon,
  ModernMetricStarIcon,
  ModernPackageBoxIcon,
  ModernPhoneCallIcon,
  ModernRadarPinIcon,
  ModernVerifiedShieldIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl
} from '@/components/shared/ModernIcons';
import {
  SanteProcheMapRouteIllustration,
  SanteProcheWaveRibbon
} from '@/components/shared/SanteProcheIllustrations';

interface PharmacyDetailViewProps {
  data: AppData;
  selectedPharmacy: number;
  setSelectedProduct: (id: number | null) => void;
  setSelectedPharmacy: (id: number) => void;
  setModal: (m: any) => void;
  setMessageForm: React.Dispatch<React.SetStateAction<any>>;
  go: (p: string) => void;
  favoritePharmacyIds?: number[];
  toggleFavoritePharmacy?: (id: number) => void;
}

export function PharmacyDetailView({
  data,
  selectedPharmacy,
  setSelectedProduct,
  setSelectedPharmacy,
  setModal,
  setMessageForm,
  go,
  favoritePharmacyIds = [],
  toggleFavoritePharmacy,
}: PharmacyDetailViewProps) {
  const [localFav, setLocalFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const p = data.pharmacies.find(x => x.id === selectedPharmacy && isPharmacyActiveAndValid(x));
  if (!p) return <Empty title="Établissement introuvable" detail="Cette fiche n’est pas disponible au public actuellement." />;
  const favorite = toggleFavoritePharmacy ? favoritePharmacyIds.includes(p.id) : localFav;

  const items = data.products.filter(
    x => x.pharmacyId === p.id && x.status === 'Publié' && isProductFresh(x.stockUpdatedAt ?? x.updated, data.freshnessDays)
  );
  const mapsUrl =
    p.lat !== undefined && p.lng !== undefined
      ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address + ' ' + p.city)}`;

  return (
    <div className="cg-page-container animate-fade-in">
      {/* Modèle SanteProche Écran 4 : Couverture pleine largeur + feuille arrondie chevauchante */}
      <div className="pharmacy-profile sp-establishment-profile">
        <div className="sp-establishment-hero">
          <div className="sp-establishment-cover">
            <img
              src={p.coverImage || '/images/pharmacy-1.jpg'}
              alt={p.name}
              className="sp-establishment-cover-img"
            />
            <div className="sp-establishment-cover-gradient" />
            <SanteProcheWaveRibbon variant="light" className="sp-establishment-wave" />

            {/* Barre de navigation flottante verre dépoli */}
            <div className="sp-establishment-topbar">
              <button className="sp-glass-top-btn" onClick={() => go('Pharmacies')}>
                <ArrowLeft size={15} /> Retour à l’annuaire
              </button>
              <div className="sp-establishment-top-right">
                <button
                  type="button"
                  className="sp-glass-circle-btn"
                  title="Partager la fiche"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href).catch(() => { });
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                >
                  <Share2 size={16} />
                </button>
                <button
                  type="button"
                  className={`sp-glass-circle-btn ${favorite ? 'is-fav' : ''}`}
                  title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  onClick={() => (toggleFavoritePharmacy ? toggleFavoritePharmacy(p.id) : setLocalFav(!localFav))}
                >
                  <Bookmark size={16} fill={favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            {copied && <span className="sp-copied-badge">Lien copié !</span>}
          </div>

          <div className="sp-establishment-sheet">
            <div className="sp-sheet-top-row">
              <div className="sp-sheet-identity">
                <div className="sp-sheet-avatar">
                  <img src={p.coverImage || '/images/pharmacy-interior.jpg'} alt={p.name} />
                </div>
                <div>
                  <div className="sp-sheet-title-line">
                    <h1>{p.name}</h1>
                    {p.status === 'Validée' && (
                      <span className="sp-verified-check" title="Établissement vérifié">
                        <ModernVerifiedShieldIcon size={20} />
                      </span>
                    )}
                  </div>
                  <div className="sp-rating-line">
                    <ModernMetricStarIcon size={15} />
                    <b>{items.length} produit{items.length > 1 ? 's' : ''}</b>
                    <span>au catalogue · {p.area}, {p.city}</span>
                  </div>
                  <div className="sp-sheet-chips">
                    {p.openingHours && <span className="sp-chip neutral">{p.openingHours}</span>}
                    <Status>{p.status}</Status>
                    {activeBadges(p, data.badges).map(b => (
                      <span className={`badge-label ${b.color}`} key={b.id}>
                        <BadgeGlyph icon={b.icon} size={13} />{b.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="cg-btn-pine"
                onClick={() => {
                  setSelectedProduct(null);
                  setModal('message');
                  setMessageForm({ sender: '', phone: '', subject: 'Demande d’information', body: '' });
                }}
              >
                <ModernChatEncryptedIcon size={16} /> Contacter l’officine <ArrowRight size={14} />
              </button>
            </div>

            {/* Barre des 5 actions rapides circulaires incluant Appel WhatsApp */}
            <div className="sp-action-grid-4 sp-action-grid-5">
              <a className="sp-quick-action-btn" href={`tel:${p.phone.replaceAll(' ', '')}`}>
                <span className="sp-action-orb mint"><ModernPhoneCallIcon size={19} /></span>
                <b>Appeler</b>
                <small>{p.phone}</small>
              </a>
              <a
                className="sp-quick-action-btn"
                href={buildWhatsAppUrl(p.phone, `Bonjour ${p.name}, je souhaite appeler ou obtenir un renseignement via PharmaConnect.`)}
                target="_blank"
                rel="noreferrer"
              >
                <span className="sp-action-orb whatsapp"><ModernWhatsAppIcon size={19} /></span>
                <b>WhatsApp</b>
                <small>Appel & Chat</small>
              </a>
              <a className="sp-quick-action-btn" target="_blank" rel="noreferrer" href={mapsUrl}>
                <span className="sp-action-orb blue"><ModernRadarPinIcon size={19} /></span>
                <b>Itinéraire</b>
                <small>GPS · Maps</small>
              </a>
              <button
                type="button"
                className="sp-quick-action-btn"
                onClick={() => {
                  setSelectedProduct(null);
                  setModal('message');
                  setMessageForm({ sender: '', phone: '', subject: 'Disponibilité produit', body: '' });
                }}
              >
                <span className="sp-action-orb teal"><ModernChatEncryptedIcon size={19} /></span>
                <b>Message</b>
                <small>Réponse directe</small>
              </button>
              <button
                type="button"
                className="sp-quick-action-btn"
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedPharmacy(p.id);
                  setModal('report');
                }}
              >
                <span className="sp-action-orb amber"><ModernAlertWarningIcon size={19} /></span>
                <b>Signaler</b>
                <small>Info inexacte</small>
              </button>
            </div>
          </div>
        </div>

        <div className="profile-columns">
          <section className="panel cg-modern-panel">
            <h3>À propos & Informations</h3>
            <p className="muted" style={{ marginTop: 4 }}>
              Établissement officinal agréé du réseau PharmaConnect avec une équipe qualifiée pour votre santé et la délivrance sécurisée de vos traitements.
            </p>
            <div className="cg-detail-info-list">
              <div className="cg-detail-info-row">
                <span className="cg-info-icon-pill"><ModernRadarPinIcon size={17} /></span>
                <div>
                  <small>Adresse</small>
                  <b>{p.address}, {p.area} · {p.city}</b>
                </div>
              </div>
              <div className="cg-detail-info-row">
                <span className="cg-info-icon-pill"><ModernPhoneCallIcon size={17} /></span>
                <div style={{ flex: 1 }}>
                  <small>Téléphone direct & WhatsApp</small>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <b>{p.phone}</b>
                    <a
                      href={buildWhatsAppUrl(p.phone, `Bonjour ${p.name}, je souhaite appeler ou vérifier une disponibilité.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="cg-whatsapp-chip"
                    >
                      <ModernWhatsAppIcon size={14} /> Appeler sur WhatsApp
                    </a>
                  </div>
                </div>
              </div>
              <div className="cg-detail-info-row">
                <span className="cg-info-icon-pill"><ModernEmergency24Icon size={17} /></span>
                <div>
                  <small>Horaires & gardes</small>
                  <b>{p.openingHours?.trim() || 'Horaires non renseignés — contactez directement l’établissement.'}</b>
                </div>
              </div>
            </div>

            {/* Carte Localisation intégrée façon bas de l'Écran 4 */}
            <div className="sp-localisation-card">
              <div className="sp-localisation-head">
                <b>Localisation</b>
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  Ouvrir GPS <ExternalLink size={12} />
                </a>
              </div>
              <SanteProcheMapRouteIllustration
                compact
                distanceLabel={p.lat !== undefined && p.lng !== undefined ? 'GPS actif' : 'Adresse vérifiée'}
                timeLabel="Itinéraire Maps"
                targetLabel={`${p.address}, ${p.city}`}
              />
            </div>
          </section>

          <section className="panel cg-modern-panel">
            <div className="panel-headline">
              <div>
                <h3>Produits & Disponibilités</h3>
                <small>Stocks et prix déclarés en temps réel</small>
              </div>
              <span className="count-chip">{items.length} références</span>
            </div>
            <div className="mini-product-list">
              {items.map(x => (
                <div key={x.id} className="cg-mini-item">
                  <span className="mini-product-icon">
                    {x.imageDataUrl ? (
                      <img src={x.imageDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <ModernPackageBoxIcon size={18} />
                    )}
                  </span>
                  <div>
                    <b>{x.name}</b>
                    <small>{x.brand} · {x.stock > 0 ? `Disponible (stock: ${x.stock})` : 'Indisponible'} · actualisé {x.updated}</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <strong className="cg-mini-price">{money(x.price)}</strong>
                    <a
                      href={buildWhatsAppUrl(p.phone, `Bonjour ${p.name}, le produit "${x.name}" est-il disponible ?`)}
                      target="_blank"
                      rel="noreferrer"
                      className="cg-whatsapp-mini-btn"
                      title="Appeler ou demander ce produit par WhatsApp"
                    >
                      <ModernWhatsAppIcon size={15} />
                    </a>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <Empty title="Aucun produit publié" detail="Cet établissement n’a pas de produit public pour le moment." />
              )}
            </div>
            <p className="data-disclaimer">Les stocks et prix sont déclarés par l’établissement. Contactez la pharmacie pour confirmer la disponibilité avant déplacement.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
