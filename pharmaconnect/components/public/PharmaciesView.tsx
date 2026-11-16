'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { activeBadges, AppData, Pharmacy, distanceKm, isPharmacyActiveAndValid, SectionTitle, Empty } from '@/lib/shared';
import { PharmacyCard } from '@/components/shared/PharmacyCard';
import {
  ModernDigitalStoreIcon,
  ModernEmergency24Icon,
  ModernMetricStarIcon,
  ModernRadarPinIcon,
  ModernSearchMedicineIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';
import {
  SanteProcheMapRouteIllustration,
  SanteProcheWaveRibbon
} from '@/components/shared/SanteProcheIllustrations';

interface PharmaciesViewProps {
  data: AppData;
  query: string;
  setQuery: (q: string) => void;
  city: string;
  setCity: (c: string) => void;
  geo: string;
  geoCoords: { lat: number; lng: number } | null;
  startGeo: () => void;
  publicPharmacies: Pharmacy[];
  setSelectedPharmacy: (id: number) => void;
  go: (p: string) => void;
}

export function PharmaciesView({
  data,
  query,
  setQuery,
  city,
  setCity,
  geo,
  geoCoords,
  startGeo,
  publicPharmacies,
  setSelectedPharmacy,
  go
}: PharmaciesViewProps) {
  const [dutyOnly, setDutyOnly] = useState(false);
  const displayedPharmacies = dutyOnly
    ? publicPharmacies.filter(p =>
      activeBadges(p, data.badges).some(
        b => b.name.toLowerCase().includes('garde') || b.name.toLowerCase().includes('24'),
      ),
    )
    : publicPharmacies;
  const featured = displayedPharmacies[0] || publicPharmacies[0];

  return (
    <div className="cg-page-container animate-fade-in">
      <SectionTitle
        eyebrow="ANNUAIRE OFFICIEL"
        badge={`${displayedPharmacies.length} officine(s) active(s)`}
        title="Pharmacies agréées"
        desc="Localisez une officine de garde ou de proximité, vérifiez ses coordonnées et consultez ses disponibilités."
        icon={<ModernDigitalStoreIcon size={24} />}
      />

      {/* Modèle SanteProche Écrans 2 & 3 : Carte GPS 3D & façade fondue sans cadre dur */}
      <div className="sp-map-directory-banner">
        <div className="sp-map-directory-bg">
          <img src="/images/pharmacy-interior.jpg" alt="Officine partenaire PharmaConnect" className="sp-blended-photo-right" />
          <SanteProcheWaveRibbon variant="emerald" className="sp-banner-wave" />
        </div>

        <div className="sp-map-directory-grid">
          <div className="sp-map-directory-left">
            <div className="cg-inner-trust-row" style={{ marginBottom: 12 }}>
              <span className="sp-glass-chip"><ModernVerifiedShieldIcon size={15} /> Officines Vérifiées</span>
              <span className="sp-glass-chip"><ModernEmergency24Icon size={15} /> Garde 24h/7j</span>
              <span className="sp-glass-chip"><ModernRadarPinIcon size={15} /> Itinéraire GPS</span>
            </div>
            <h3>Réseau de proximité contrôlé et géolocalisé</h3>
            <p>Visualisez les officines ouvertes autour de vous, calculez le trajet exact et accédez aux fiches vérifiées.</p>

            {/* Quick services filter pills façon Écran 2 */}
            <div className="sp-directory-quick-pills">
              <button
                type="button"
                className={`sp-quick-chip ${!dutyOnly && city === 'Toutes les villes' ? 'active' : ''}`}
                onClick={() => { setDutyOnly(false); setCity('Toutes les villes'); }}
              >
                Toutes les officines
              </button>
              <button
                type="button"
                className={`sp-quick-chip ${dutyOnly ? 'active' : ''}`}
                onClick={() => setDutyOnly(!dutyOnly)}
              >
                <ModernEmergency24Icon size={14} /> De garde 24h/7j
              </button>
              <button type="button" className="sp-quick-chip" onClick={startGeo}>
                <ModernRadarPinIcon size={14} /> À proximité
              </button>
            </div>
          </div>

          <div className="sp-map-directory-right">
            <SanteProcheMapRouteIllustration
              distanceLabel={
                featured && geoCoords && featured.lat !== undefined && featured.lng !== undefined
                  ? `${distanceKm(geoCoords, { lat: featured.lat, lng: featured.lng }).toFixed(1)} km`
                  : '1.2 km'
              }
              timeLabel="≈ 5 min"
              targetLabel={featured ? featured.area : 'À proximité'}
            />
            {featured && (
              <div className="sp-map-floating-card">
                <div className="sp-map-card-thumb">
                  <img src={featured.coverImage || '/images/pharmacy-1.jpg'} alt={featured.name} />
                </div>
                <div className="sp-map-card-meta">
                  <b>{featured.name} {featured.status === 'Validée' && <ModernVerifiedShieldIcon size={14} />}</b>
                  <small>
                    <ModernMetricStarIcon size={12} /> Officine vérifiée{featured.openingHours ? ` · ${featured.openingHours}` : ''} · {featured.area}
                  </small>
                </div>
                <div className="sp-map-card-actions">
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => {
                      setSelectedPharmacy(featured.id);
                      go('Fiche pharmacie');
                    }}
                  >
                    Voir détails
                  </button>
                  <a
                    className="primary-btn"
                    target="_blank"
                    rel="noreferrer"
                    href={
                      featured.lat !== undefined && featured.lng !== undefined
                        ? `https://www.google.com/maps/dir/?api=1&destination=${featured.lat},${featured.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(featured.address + ' ' + featured.city)}`
                    }
                  >
                    Itinéraire <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cg-filter-card">
        <div className="directory-tools">
          <div className="search-control">
            <ModernSearchMedicineIcon size={18} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher par nom de pharmacie, quartier ou rue…"
            />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)}>
            {['Toutes les villes', ...Array.from(new Set(data.pharmacies.filter(isPharmacyActiveAndValid).map(p => p.city)))].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button className="outline-btn" onClick={startGeo}>
            <ModernRadarPinIcon size={16} /> Autour de moi
          </button>
        </div>
      </div>

      {geo && (
        <div className="geo-pill">
          <ModernRadarPinIcon size={15} /> Position active ({geo}) · Pharmacies classées par proximité
        </div>
      )}

      <div className="cg-results-summary">
        <b>{displayedPharmacies.length} pharmacie(s) disponible(s)</b>
        <span>Établissements contrôlés par PharmaConnect</span>
      </div>

      <div className="pharmacy-cards directory-cards">
        {displayedPharmacies.map(p => (
          <PharmacyCard
            key={p.id}
            pharmacy={p}
            badges={data.badges}
            distance={
              geoCoords && p.lat !== undefined && p.lng !== undefined
                ? distanceKm(geoCoords, { lat: p.lat, lng: p.lng })
                : undefined
            }
            onOpen={() => {
              setSelectedPharmacy(p.id);
              go('Fiche pharmacie');
            }}
          />
        ))}
        {displayedPharmacies.length === 0 && (
          <Empty title="Aucune pharmacie trouvée" detail="Essayez un autre nom, quartier ou ville." />
        )}
      </div>
    </div>
  );
}
