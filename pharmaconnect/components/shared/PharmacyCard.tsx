'use client';

import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { Badge, Pharmacy, Status, activeBadges, BadgeGlyph } from '@/lib/shared';
import {
  ModernDigitalStoreIcon,
  ModernRadarPinIcon,
  ModernVerifiedShieldIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl
} from '@/components/shared/ModernIcons';
import { SanteProcheWaveRibbon } from '@/components/shared/SanteProcheIllustrations';
import { getPharmacyCoverImage } from '@/lib/media';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  badges: Badge[];
  onOpen: () => void;
  distance?: number;
}

export function PharmacyCard({ pharmacy, badges, onOpen, distance }: PharmacyCardProps) {
  const allBadges = activeBadges(pharmacy, badges);
  const is24h = allBadges.some(b => b.name.toLowerCase().includes('garde') || b.name.toLowerCase().includes('24'));
  const coverSrc = getPharmacyCoverImage(pharmacy);

  return (
    <article className="pharmacy-card cg-modern-card pc-animated-card" onClick={onOpen}>
      <div className="pharmacy-card-cover-wrap sp-pharmacy-cover-blended">
        <img src={coverSrc} alt={pharmacy.name} className="pharmacy-cover-img sp-mask-fade-bottom pc-zoom-media" />
        <SanteProcheWaveRibbon variant="light" className="sp-card-wave" />
        <div className="pharmacy-card-badge-overlay">
          <Status>{pharmacy.status}</Status>
          {is24h && (
            <span className="cg-badge-guard">
              <span className="cg-pulse-dot-guard" /> Garde 24h/7j
            </span>
          )}
        </div>
      </div>

      <div className="pharmacy-card-content">
        <div className="pharmacy-card-header">
          <h3 className="pharmacy-card-title">{pharmacy.name}</h3>
          {pharmacy.status === 'Validée' && (
            <span className="cg-verified-check" title="Officine agréée et certifiée">
              <ModernVerifiedShieldIcon size={18} />
            </span>
          )}
        </div>

        <p className="pharmacy-card-location">
          <ModernRadarPinIcon size={15} className="cg-loc-icon" />
          <span>{pharmacy.area}, {pharmacy.city}</span>
          {distance !== undefined && (
            <span className="cg-distance-pill">
              {distance.toFixed(1)} km
            </span>
          )}
        </p>

        {allBadges.length > 0 && (
          <div className="badge-row">
            {allBadges.slice(0, 2).map(b => (
              <span className={`badge-label ${b.color}`} key={b.id}>
                <BadgeGlyph icon={b.icon} size={11} />
                {b.name}
              </span>
            ))}
          </div>
        )}

        <div className="pharmacy-card-foot">
          <div className="cg-card-contact-pills">
            <a
              href={`tel:${pharmacy.phone}`}
              className="cg-phone-chip"
              onClick={e => e.stopPropagation()}
              title={`Appeler ${pharmacy.phone}`}
            >
              <Phone size={14} />
              <span>{pharmacy.phone}</span>
            </a>

            <a
              href={buildWhatsAppUrl(pharmacy.phone, `Bonjour ${pharmacy.name}, je vous contacte depuis PharmaConnect pour un renseignement.`)}
              target="_blank"
              rel="noreferrer"
              className="cg-whatsapp-chip"
              onClick={e => e.stopPropagation()}
              title="Contacter sur WhatsApp"
              aria-label="Contacter sur WhatsApp"
            >
              <ModernWhatsAppIcon size={15} />
            </a>
          </div>

          <button
            type="button"
            className="cg-card-action-btn"
            onClick={e => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <span>Voir fiche</span>
            <ArrowRight size={14} className="cg-arrow-hover" />
          </button>
        </div>
      </div>
    </article>
  );
}
