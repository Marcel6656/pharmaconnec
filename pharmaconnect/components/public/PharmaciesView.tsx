'use client';

import React, { useState } from 'react';
import { activeBadges, AppData, Pharmacy, distanceKm, isPharmacyActiveAndValid, SectionTitle, Empty } from '@/lib/shared';
import { PharmacyCard } from '@/components/shared/PharmacyCard';
import {
  ModernDigitalStoreIcon,
  ModernEmergency24Icon,
  ModernRadarPinIcon,
  ModernSearchMedicineIcon,
} from '@/components/shared/ModernIcons';

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

  return (
    <div className="cg-page-container animate-fade-in">
      <SectionTitle
        eyebrow="ANNUAIRE OFFICIEL"
        badge={`${displayedPharmacies.length} officine(s) active(s)`}
        title="Pharmacies enregistrées"
        desc="Localisez une pharmacie agréée, consultez ses produits et contactez l’officine."
        icon={<ModernDigitalStoreIcon size={24} />}
      />

      <div className="cg-filter-card">
        <div className="directory-tools pc-pharmacies-tools">
          <div className="search-control">
            <ModernSearchMedicineIcon size={18} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Nom de pharmacie, quartier ou ville…"
            />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)}>
            {['Toutes les villes', ...Array.from(new Set(data.pharmacies.filter(isPharmacyActiveAndValid).map(p => p.city)))].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            className={`outline-btn ${dutyOnly ? 'pc-filter-active' : ''}`}
            onClick={() => setDutyOnly(!dutyOnly)}
          >
            <ModernEmergency24Icon size={15} /> Garde 24h/7j
          </button>
          <button type="button" className="outline-btn" onClick={startGeo}>
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
