'use client';

import React, { useState } from 'react';
import { activeBadges, AppData, Pharmacy, distanceKm, isPharmacyActiveAndValid, Empty } from '@/lib/shared';
import { Language } from '@/lib/translations';
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
  currentLang?: Language;
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
  go,
  currentLang = 'fr',
}: PharmaciesViewProps) {
  const [dutyOnly, setDutyOnly] = useState(false);
  const isEn = currentLang === 'en';
  const displayedPharmacies = dutyOnly
    ? publicPharmacies.filter(p => {
      const hasDutyBadge = activeBadges(p, data.badges).some(
        b => b.name.toLowerCase().includes('garde') || b.name.toLowerCase().includes('24'),
      );
      const hoursLower = (p.openingHours || '').toLowerCase();
      return hasDutyBadge || hoursLower.includes('24h') || hoursLower.includes('garde');
    })
    : publicPharmacies;

  return (
    <div className="pc-luxe-subpage animate-fade-in">
      {/* En-tête éditorial avec barre de recherche sur l'image */}
      <section className="luxe-inner-hero luxe-inner-hero-has-search">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/pharmacy-interior.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'OFFICIAL DIRECTORY' : 'ANNUAIRE OFFICIEL'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Registered Pharmacies' : 'Pharmacies Enregistrées'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Locate a certified pharmacy, check 24/7 duty hours and contact the pharmacist team directly.'
              : 'Localisez une pharmacie agréée, vérifiez les officines de garde et contactez directement l’équipe officinale.'}
          </p>
          <span className="luxe-inner-count-pill">
            <ModernDigitalStoreIcon size={15} />
            {displayedPharmacies.length} {isEn ? 'active pharmacy(ies)' : 'officine(s) active(s)'}
          </span>

          <div className="luxe-hero-search-dock">
            <div className="luxe-filter-card">
              <div className="directory-tools pc-pharmacies-tools">
                <div className="search-control">
                  <ModernSearchMedicineIcon size={18} />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={isEn ? 'Pharmacy name, district or city...' : 'Nom de pharmacie, quartier ou ville…'}
                  />
                </div>
                <select value={city} onChange={e => setCity(e.target.value)}>
                  {['Toutes les villes', ...Array.from(new Set(data.pharmacies.filter(isPharmacyActiveAndValid).map(p => p.city)))].map(c => (
                    <option key={c} value={c}>
                      {c === 'Toutes les villes' && isEn ? 'All cities' : c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`outline-btn ${dutyOnly ? 'pc-filter-active' : ''}`}
                  onClick={() => setDutyOnly(!dutyOnly)}
                >
                  <ModernEmergency24Icon size={15} /> {isEn ? '24/7 Duty Care' : 'Garde 24h/7j'}
                </button>
                <button type="button" className="outline-btn" onClick={startGeo}>
                  <ModernRadarPinIcon size={16} /> {isEn ? 'Near Me' : 'Autour de moi'}
                </button>
              </div>
            </div>

            {geo && (
              <div className="geo-pill" style={{ marginTop: 12 }}>
                <ModernRadarPinIcon size={15} />{' '}
                {isEn
                  ? `Active location (${geo}) · Sorted by distance`
                  : `Position active (${geo}) · Pharmacies classées par proximité`}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grille des pharmacies */}
      <section className="luxe-section">
        <div className="luxe-container">
          <div className="cg-results-summary" style={{ marginBottom: 20 }}>
            <b>{displayedPharmacies.length} {isEn ? 'pharmacy(ies) available' : 'pharmacie(s) disponible(s)'}</b>
            <span>{isEn ? 'Establishments verified by PharmaConnect' : 'Établissements contrôlés par PharmaConnect'}</span>
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
          </div>
          {displayedPharmacies.length === 0 && (
            <Empty
              title={isEn ? 'No pharmacy found' : 'Aucune pharmacie trouvée'}
              detail={isEn ? 'Try another name, district, or disable the 24/7 duty filter.' : 'Essayez un autre nom, quartier ou désactivez le filtre Garde 24h/7j.'}
            />
          )}
        </div>
      </section>
    </div>
  );
}
