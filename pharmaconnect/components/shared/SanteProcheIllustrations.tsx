'use client';

import React, { useId } from 'react';

interface EmblemProps {
  size?: number;
  className?: string;
}

/**
 * Emblème 3D Cœur-Croix lumineux inspiré des écrans SanteProche (Écrans 1, 2, 8)
 */
export function SanteProcheHeartCrossEmblem({ size = 76, className = '' }: EmblemProps) {
  const uid = useId().replaceAll(':', '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`heart-green-${uid}`} x1="16" y1="20" x2="72" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={`heart-blue-${uid}`} x1="56" y1="18" x2="108" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="55%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0f4c81" />
        </linearGradient>
        <radialGradient id={`sphere-${uid}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="42%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0b2e59" />
        </radialGradient>
      </defs>

      {/* Halo lumineux */}
      <circle cx="60" cy="60" r="56" fill={`url(#halo-${uid})`} />

      {/* Aile gauche du ruban cœur (vert émeraude) */}
      <path
        d="M58 98C31 81 14 63 14 43C14 27 27 16 42 16C51 16 58 21 62 28C51 35 41 53 45 73C48 84 53 92 58 98Z"
        fill={`url(#heart-green-${uid})`}
      />

      {/* Aile droite du ruban cœur (bleu azur) */}
      <path
        d="M58 98C86 81 106 62 106 42C106 26 93 16 78 16C68 16 61 21 57 29C69 36 78 52 72 72C69 83 63 91 58 98Z"
        fill={`url(#heart-blue-${uid})`}
      />

      {/* Arc brillant inférieur */}
      <path
        d="M44 74C58 84 82 78 96 58"
        stroke="#4ade80"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Sphère centrale 3D */}
      <circle cx="60" cy="54" r="24" fill={`url(#sphere-${uid})`} stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" />
      <ellipse cx="52" cy="42" rx="10" ry="5" transform="rotate(-24 52 42)" fill="rgba(255,255,255,0.38)" />

      {/* Croix médicale blanche */}
      <rect x="55.5" y="42" width="9" height="24" rx="2.5" fill="#ffffff" />
      <rect x="48" y="49.5" width="24" height="9" rx="2.5" fill="#ffffff" />
    </svg>
  );
}

interface WaveRibbonProps {
  variant?: 'emerald' | 'light' | 'dark';
  className?: string;
}

/**
 * Ruban d'ondes fluides multicouches pour fondre le bas des bannières et cartes illustrées
 */
export function SanteProcheWaveRibbon({ variant = 'emerald', className = '' }: WaveRibbonProps) {
  const uid = useId().replaceAll(':', '');
  const backWave =
    variant === 'dark' ? 'rgba(16, 185, 129, 0.22)' : variant === 'light' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(13, 148, 136, 0.18)';
  const midWave =
    variant === 'dark' ? 'rgba(56, 189, 248, 0.18)' : variant === 'light' ? 'rgba(45, 212, 191, 0.16)' : 'rgba(16, 185, 129, 0.22)';
  const frontWave =
    variant === 'dark' ? 'rgba(20, 184, 166, 0.16)' : variant === 'light' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(20, 184, 166, 0.15)';

  return (
    <svg
      viewBox="0 0 1200 180"
      preserveAspectRatio="none"
      className={`sp-wave-svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`wave-g-${uid}`} x1="0" y1="0" x2="1200" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={backWave} />
          <stop offset="55%" stopColor={midWave} />
          <stop offset="100%" stopColor={frontWave} />
        </linearGradient>
      </defs>
      <path
        d="M0,96 C220,165 440,28 720,94 C940,145 1090,68 1200,52 L1200,180 L0,180 Z"
        fill={`url(#wave-g-${uid})`}
      />
      <path
        d="M0,126 C260,54 510,168 820,104 C1010,64 1120,110 1200,98 L1200,180 L0,180 Z"
        fill={frontWave}
      />
    </svg>
  );
}

interface MapRouteProps {
  distanceLabel?: string;
  timeLabel?: string;
  targetLabel?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Carte GPS 3D isométrique avec tracé lumineux néon vert et marqueurs d'officines (Écrans 2 & 3)
 */
export function SanteProcheMapRouteIllustration({
  distanceLabel = '1.2 km',
  timeLabel = '≈ 5 min',
  targetLabel = 'À proximité',
  compact = false,
  className = ''
}: MapRouteProps) {
  const uid = useId().replaceAll(':', '');
  return (
    <div className={`sp-map-scene ${compact ? 'is-compact' : ''} ${className}`}>
      <svg
        viewBox="0 0 640 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="sp-map-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`map-bg-${uid}`} x1="0" y1="0" x2="640" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f3d56" />
            <stop offset="52%" stopColor="#14586c" />
            <stop offset="100%" stopColor="#197876" />
          </linearGradient>
          <linearGradient id={`park-${uid}`} x1="80" y1="70" x2="290" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.16" />
          </linearGradient>
          <filter id={`neon-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`pin-halo-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fond de carte bleu-émeraude profond */}
        <rect width="640" height="340" fill={`url(#map-bg-${uid})`} />

        {/* Grille urbaine en perspective */}
        <g opacity="0.28" stroke="#7dd3fc" strokeWidth="1.2">
          <path d="M-20 75 L660 225" />
          <path d="M-20 145 L660 295" />
          <path d="M-20 225 L540 350" />
          <path d="M40 15 L680 150" />
          <path d="M120 -10 L-30 330" />
          <path d="M260 -10 L90 350" />
          <path d="M410 -10 L230 350" />
          <path d="M560 -10 L380 350" />
        </g>

        {/* Parcs et îlots 3D translucides */}
        <polygon points="110,140 225,115 260,175 145,205" fill={`url(#park-${uid})`} stroke="rgba(110,231,183,0.35)" />
        <polygon points="340,70 460,52 495,112 375,134" fill="rgba(56,189,248,0.16)" stroke="rgba(125,211,252,0.28)" />
        <polygon points="295,210 430,185 470,255 330,285" fill={`url(#park-${uid})`} stroke="rgba(110,231,183,0.3)" />
        <polygon points="480,150 580,132 615,195 510,215" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" />

        {/* Halo sous le tracé */}
        <path
          d="M128 265 C155 210 218 225 256 184 C295 142 356 172 396 128 C425 96 456 88 492 78"
          stroke="#4ade80"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.28"
          filter={`url(#neon-glow-${uid})`}
        />

        {/* Route lumineuse pointillée animée */}
        <path
          d="M128 265 C155 210 218 225 256 184 C295 142 356 172 396 128 C425 96 456 88 492 78"
          stroke="#86efac"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="12 10"
          filter={`url(#neon-glow-${uid})`}
        />

        {/* Point de départ utilisateur (bleu pulsant) */}
        <circle cx="128" cy="265" r="24" fill="rgba(56,189,248,0.24)" />
        <circle cx="128" cy="265" r="11" fill="#38bdf8" stroke="#ffffff" strokeWidth="3.5" />

        {/* Marqueur secondaire pharmacie gauche */}
        <g transform="translate(88, 66)">
          <circle cx="20" cy="44" r="14" fill="rgba(56,189,248,0.22)" />
          <path d="M20 0C9 0 0 9 0 20C0 33 20 46 20 46C20 46 40 33 40 20C40 9 31 0 20 0Z" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
          <rect x="17.5" y="11" width="5" height="16" rx="1.5" fill="#fff" />
          <rect x="12" y="16.5" width="16" height="5" rx="1.5" fill="#fff" />
        </g>

        {/* Marqueur secondaire pharmacie centre */}
        <g transform="translate(212, 92)">
          <circle cx="18" cy="40" r="12" fill="rgba(56,189,248,0.2)" />
          <path d="M18 0C8 0 0 8 0 18C0 30 18 42 18 42C18 42 36 30 36 18C36 8 28 0 18 0Z" fill="#0369a1" stroke="#e0f2fe" strokeWidth="1.5" />
          <rect x="15.8" y="10" width="4.4" height="14" rx="1.4" fill="#fff" />
          <rect x="11" y="14.8" width="14" height="4.4" rx="1.4" fill="#fff" />
        </g>

        {/* Marqueur principal pharmacie cible (vert émeraude lumineux) */}
        <circle cx="494" cy="94" r="38" fill={`url(#pin-halo-${uid})`} />
        <g transform="translate(468, 28)">
          <path
            d="M26 0C11.6 0 0 11.6 0 26C0 44 26 65 26 65C26 65 52 44 52 26C52 11.6 40.4 0 26 0Z"
            fill="#10b981"
            stroke="#dcfce7"
            strokeWidth="2.2"
          />
          <circle cx="26" cy="25" r="17" fill="#059669" />
          <rect x="22.5" y="14" width="7" height="22" rx="2" fill="#ffffff" />
          <rect x="15" y="21.5" width="22" height="7" rx="2" fill="#ffffff" />
        </g>
      </svg>

      {/* Badges glassmorphiques flottants identiques aux écrans 2 & 3 */}
      <div className="sp-map-pill-top">
        <span className="cg-pulse-dot-guard" />
        <span>{targetLabel}</span>
      </div>

      <div className="sp-map-pill-route">
        <span className="sp-route-dot" />
        <div>
          <b>{distanceLabel}</b>
          <small>{timeLabel}</small>
        </div>
      </div>
    </div>
  );
}

interface VignetteProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Scène 3D Calendrier + Coche Verte + Skyline & Vague (Écran 6 : "Prenez soin de votre santé, à tout moment !")
 */
export function SanteProcheCalendarScene({
  title = 'Prenez soin de votre santé, à tout moment !',
  subtitle = 'Suivi continu, rappels intelligents et disponibilités officielles en temps réel.',
  className = ''
}: VignetteProps) {
  const uid = useId().replaceAll(':', '');
  return (
    <div className={`sp-scene-card sp-calendar-scene ${className}`}>
      <div className="sp-scene-art">
        <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id={`cal-top-${uid}`} x1="40" y1="26" x2="170" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id={`chk-ball-${uid}`} x1="125" y1="74" x2="185" y2="134" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Silhouette urbaine douce en fond */}
          <g fill="#cfe8f3" opacity="0.55">
            <rect x="18" y="66" width="24" height="72" rx="4" />
            <rect x="48" y="46" width="28" height="92" rx="4" />
            <rect x="166" y="54" width="24" height="84" rx="4" />
            <rect x="195" y="72" width="26" height="66" rx="4" />
          </g>

          {/* Calendrier 3D incliné */}
          <g transform="rotate(-7 104 82)">
            <rect x="42" y="34" width="114" height="96" rx="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M42 52C42 42 50 34 60 34H138C148 34 156 42 156 52V64H42V52Z" fill={`url(#cal-top-${uid})`} />
            {/* Anneaux */}
            <rect x="64" y="25" width="9" height="20" rx="4.5" fill="#93c5fd" />
            <rect x="95" y="25" width="9" height="20" rx="4.5" fill="#93c5fd" />
            <rect x="126" y="25" width="9" height="20" rx="4.5" fill="#93c5fd" />
            {/* Cases calendrier */}
            {[0, 1, 2, 3].map(c => (
              <rect key={`r1-${c}`} x={56 + c * 23} y="76" width="16" height="13" rx="4" fill="#e2e8f0" />
            ))}
            {[0, 1, 2].map(c => (
              <rect key={`r2-${c}`} x={56 + c * 23} y="96" width="16" height="13" rx="4" fill="#e2e8f0" />
            ))}
          </g>

          {/* Sphère 3D verte avec coche blanche */}
          <circle cx="158" cy="105" r="28" fill={`url(#chk-ball-${uid})`} stroke="#ffffff" strokeWidth="3.5" />
          <path d="M146 105L154 113L171 96" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="sp-scene-copy">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      <SanteProcheWaveRibbon variant="emerald" />
    </div>
  );
}

/**
 * Scène 3D Bouclier Lumineux + Ondes (Écran 7 : "Ensemble pour une meilleure santé")
 */
export function SanteProcheShieldWaveScene({
  title = 'Ensemble pour une meilleure santé',
  subtitle = 'Des officines vérifiées, des stocks fiables et une messagerie protégée au service des familles.',
  className = ''
}: VignetteProps) {
  const uid = useId().replaceAll(':', '');
  return (
    <div className={`sp-scene-card sp-shield-scene ${className}`}>
      <div className="sp-scene-art">
        <svg viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id={`sh-glow-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`sh-body-${uid}`} x1="66" y1="22" x2="154" y2="128" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="48%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f4c81" />
            </linearGradient>
          </defs>

          {/* Halo et particules lumineuses */}
          <circle cx="110" cy="76" r="68" fill={`url(#sh-glow-${uid})`} />
          <circle cx="48" cy="48" r="3" fill="#86efac" opacity="0.85" />
          <circle cx="174" cy="42" r="2.5" fill="#bae6fd" opacity="0.9" />
          <circle cx="164" cy="108" r="3.5" fill="#6ee7b7" opacity="0.8" />
          <circle cx="56" cy="104" r="2.5" fill="#7dd3fc" opacity="0.75" />

          {/* Bouclier 3D */}
          <path
            d="M110 18L154 34V69C154 98 135 121 110 132C85 121 66 98 66 69V34L110 18Z"
            fill={`url(#sh-body-${uid})`}
            stroke="#bae6fd"
            strokeWidth="3.5"
          />
          <path
            d="M110 27L144 40V68C144 92 129 111 110 121C91 111 76 92 76 68V40L110 27Z"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1.5"
          />

          {/* Croix médicale blanche lumineuse */}
          <rect x="103" y="50" width="14" height="44" rx="4" fill="#ffffff" />
          <rect x="88" y="65" width="44" height="14" rx="4" fill="#ffffff" />
        </svg>
      </div>
      <div className="sp-scene-copy">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      <SanteProcheWaveRibbon variant="dark" />
    </div>
  );
}
