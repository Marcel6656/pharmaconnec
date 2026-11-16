'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play, Search } from 'lucide-react';
import { Language } from '@/lib/translations';
import {
  ModernDigitalStoreIcon,
  ModernEmergency24Icon,
  ModernHeartVitalityIcon,
  ModernPillCapsuleIcon,
} from '@/components/shared/ModernIcons';

interface HealthCinemaHeroProps {
  pharmaciesCount: number;
  productsCount: number;
  onExplorePharmacies: () => void;
  onExploreProducts: () => void;
  onScrollToFinder?: () => void;
  currentLang?: Language;
}

type ActIndex = 0 | 1 | 2;

const ACT_DURATION_MS = 6500;

interface CalloutItem {
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
}

interface HeroProductScene {
  src: string;
  fallbackSrc: string;
  altFr: string;
  altEn: string;
  tagFr: string;
  tagEn: string;
  badgeFr: string;
  badgeEn: string;
  leftSpecs: CalloutItem[];
  rightSpecs: CalloutItem[];
}

const HERO_PRODUCT_SCENES: HeroProductScene[] = [
  {
    src: '/images/hero-cinema-medicines.jpg',
    fallbackSrc: '/images/prod-paracetamol.jpg',
    altFr: 'Gélules médicales, flacons stériles et plaquettes pharmaceutiques en studio sombre',
    altEn: 'Medical capsules, sterile vials and blister packs in dark studio lighting',
    tagFr: 'MÉDICAMENTS & GALÉNIQUE CERTIFIÉE',
    tagEn: 'CERTIFIED MEDICINES & VIALS',
    badgeFr: '100% VÉRIFIÉ',
    badgeEn: '100% VERIFIED',
    leftSpecs: [
      {
        titleFr: 'Traçabilité & Lots',
        titleEn: 'Batch Traceability',
        descFr: 'Références contrôlées avant mise en ligne',
        descEn: 'References audited before publication',
      },
      {
        titleFr: 'Stock Officinal Live',
        titleEn: 'Live Pharmacy Stock',
        descFr: 'Disponibilité actualisée en continu',
        descEn: 'Availability updated continuously',
      },
    ],
    rightSpecs: [
      {
        titleFr: 'Délivrance Officinale',
        titleEn: 'Certified Dispensing',
        descFr: 'Retrait en pharmacie agréée près de vous',
        descEn: 'In-person pickup at verified pharmacies',
      },
      {
        titleFr: 'Tarifs Transparents',
        titleEn: 'Clear Pricing',
        descFr: 'Comparaison directe sans frais cachés',
        descEn: 'Direct price lookup with zero hidden fees',
      },
    ],
  },
  {
    src: '/images/hero-cinema-vitamins.jpg',
    fallbackSrc: '/images/prod-vitaminc.jpg',
    altFr: 'Flacons compte-gouttes de sérum et vitamines en brume clinique émeraude',
    altEn: 'Vitamin C serum dropper bottles illuminated in emerald clinical mist',
    tagFr: 'VITAMINES, SÉRUMS & IMMUNITÉ',
    tagEn: 'VITAMINS, SERUMS & IMMUNITY',
    badgeFr: 'ACTIF EN DIRECT',
    badgeEn: 'LIVE NETWORK',
    leftSpecs: [
      {
        titleFr: 'Formules & Immunité',
        titleEn: 'Vitamins & Care',
        descFr: 'Parapharmacie, dermo-soins et micronutrition',
        descEn: 'Derma care, vitamins and daily essentials',
      },
      {
        titleFr: 'Fiches Détaillées',
        titleEn: 'Detailed Sheets',
        descFr: 'Conditionnement, catégorie et statut en stock',
        descEn: 'Packaging, category and real-time status',
      },
    ],
    rightSpecs: [
      {
        titleFr: 'Conseil Pharmacien',
        titleEn: 'Direct Messaging',
        descFr: 'Échange en fil de discussion avec l’officine',
        descEn: 'Ask a licensed pharmacist before visiting',
      },
      {
        titleFr: 'Proximité Immédiate',
        titleEn: 'Instant Distance',
        descFr: 'Tri par distance GPS et disponibilité exacte',
        descEn: 'Sorted by GPS distance and live stock',
      },
    ],
  },
  {
    src: '/images/hero-cinema-care.jpg',
    fallbackSrc: '/images/prod-thermometer.jpg',
    altFr: 'Stéthoscope chromé, thermomètre digital et ampoule stérile sur verre noir',
    altEn: 'Brushed chrome stethoscope, digital thermometer and sterile ampoule',
    tagFr: 'DISPOSITIFS & SOINS DE PRÉCISION',
    tagEn: 'DIAGNOSTIC & PRECISION CARE',
    badgeFr: 'GARDE 24/7',
    badgeEn: '24/7 CARE',
    leftSpecs: [
      {
        titleFr: 'Dispositifs Médicaux',
        titleEn: 'Medical Equipment',
        descFr: 'Matériel de diagnostic et suivi quotidien',
        descEn: 'Precision diagnostic and monitoring tools',
      },
      {
        titleFr: 'Officines de Garde',
        titleEn: 'Duty Pharmacies',
        descFr: 'Repérage rapide pour vos besoins urgents',
        descEn: 'Fast discovery for urgent care needs',
      },
    ],
    rightSpecs: [
      {
        titleFr: 'Identité Certifiée',
        titleEn: 'Verified Network',
        descFr: 'Chaque établissement est validé manuellement',
        descEn: 'Every partner pharmacy is verified',
      },
      {
        titleFr: 'Expérience Patient',
        titleEn: 'Patient-First Flow',
        descFr: 'Recherche intuitive en moins de 3 secondes',
        descEn: 'Find the right care in seconds',
      },
    ],
  },
];

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  hue: 'mint' | 'cyan' | 'white';
}

export function HealthCinemaHero({
  pharmaciesCount,
  productsCount,
  onExplorePharmacies,
  onExploreProducts,
  onScrollToFinder,
  currentLang = 'fr',
}: HealthCinemaHeroProps) {
  const isEn = currentLang === 'en';
  const [act, setAct] = useState<ActIndex>(0);
  const [paused, setPaused] = useState(false);
  const [actProgress, setActProgress] = useState(0);
  const [counterTick, setCounterTick] = useState(0);
  const [fallbackActive, setFallbackActive] = useState<Record<number, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const actRef = useRef<ActIndex>(0);
  const actStartedAtRef = useRef<number>(Date.now());
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    actRef.current = act;
    actStartedAtRef.current = Date.now();
    setActProgress(0);
  }, [act]);

  // Compteur odomètre animé en Acte 2 (+N officines & références actives)
  const targetMetric = useMemo(() => Math.max(12, productsCount + pharmaciesCount), [productsCount, pharmaciesCount]);
  const initialMetric = useMemo(() => Math.max(1, targetMetric - 9), [targetMetric]);

  useEffect(() => {
    if (act !== 1) return;
    setCounterTick(initialMetric);
    let current = initialMetric;
    const timer = window.setInterval(() => {
      current += 1;
      if (current >= targetMetric) {
        setCounterTick(targetMetric);
        window.clearInterval(timer);
      } else {
        setCounterTick(current);
      }
    }, 220);
    return () => window.clearInterval(timer);
  }, [act, initialMetric, targetMetric]);

  const displayedMetric = act === 1 ? Math.max(counterTick, initialMetric) : targetMetric;

  // Rotation automatique fluide entre les 3 actes
  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const tick = window.setInterval(() => {
      const elapsed = Date.now() - actStartedAtRef.current;
      const ratio = Math.min(1, elapsed / ACT_DURATION_MS);
      setActProgress(ratio);
      if (elapsed >= ACT_DURATION_MS) {
        setAct(prev => (((prev + 1) % 3) as ActIndex));
      }
    }, 50);

    return () => window.clearInterval(tick);
  }, [paused]);

  // Atmosphère Canvas temps réel par-dessus la photographie produit :
  // - Particules lumineuses flottantes (profondeur)
  // - Halo volumétrique dynamique suivant le curseur
  // - Onde vitale ECG & scan clinique subtil selon l'acte actif
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (particlesRef.current.length === 0) {
      const hues: Array<'mint' | 'cyan' | 'white'> = ['mint', 'cyan', 'white'];
      particlesRef.current = Array.from({ length: 56 }, (_, idx) => ({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random() * 1.4 + 0.25,
        vx: (Math.random() - 0.5) * 0.001,
        vy: -0.0004 - Math.random() * 0.0011,
        r: 0.85 + Math.random() * 1.9,
        alpha: 0.22 + Math.random() * 0.55,
        hue: hues[idx % hues.length],
      }));
    }

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width);
      height = Math.max(360, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const drawParticles = (time: number, cx: number, cy: number, px: number, py: number, accent: ActIndex) => {
      for (const p of particlesRef.current) {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -1.15) p.y = 1.15;
          if (p.x < -1.15) p.x = 1.15;
          if (p.x > 1.15) p.x = -1.15;
        }
        const screenX = cx + p.x * width * 0.54 + px * (22 / p.z);
        const screenY = cy + p.y * height * 0.54 + py * (16 / p.z);
        const twinkle = 0.65 + 0.35 * Math.sin(time * 2.1 + p.x * 10);
        const a = p.alpha * twinkle * (accent === 1 ? 0.85 : 0.65);

        ctx.beginPath();
        ctx.arc(screenX, screenY, p.r * (1.2 / p.z), 0, Math.PI * 2);
        if (p.hue === 'mint') ctx.fillStyle = `rgba(37, 111, 91, ${a * 0.42})`;
        else if (p.hue === 'cyan') ctx.fillStyle = `rgba(122, 172, 194, ${a * 0.48})`;
        else ctx.fillStyle = `rgba(27, 61, 54, ${a * 0.25})`;
        ctx.fill();
      }
    };

    const drawAtmosphericOverlay = (time: number, _cx: number, _cy: number, _px: number, py: number, currentAct: ActIndex) => {
      // Filaments ondulatoires ECG subtils dans la palette vert pin / menthe du site
      const layerCount = currentAct === 1 ? 2 : 1;
      for (let layer = 0; layer < layerCount; layer++) {
        ctx.beginPath();
        const amp = height * (currentAct === 1 ? 0.028 + layer * 0.01 : 0.018);
        const yBase = height * 0.78 + (layer === 0 ? 0 : 18) + py * 6;
        for (let x = 0; x <= width; x += 8) {
          const norm = x / width;
          const ecgBeat = Math.exp(-Math.pow((norm - ((time * 0.18 + layer * 0.45) % 1.2 - 0.1)) * 22, 2)) * -amp * 1.45;
          const wave = Math.sin(norm * Math.PI * 4 + time * (1.2 + layer * 0.4)) * (amp * 0.28);
          const y = yBase + wave + ecgBeat;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const alpha = currentAct === 1 ? (layer === 0 ? 0.24 : 0.16) : 0.14;
        ctx.strokeStyle = layer === 0 ? `rgba(37, 111, 91, ${alpha})` : `rgba(79, 168, 141, ${alpha})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }
    };

    const render = (nowMs: number) => {
      const time = reducedMotion ? 1.2 : nowMs * 0.001;
      pointerRef.current.x += (pointerRef.current.tx - pointerRef.current.x) * 0.07;
      pointerRef.current.y += (pointerRef.current.ty - pointerRef.current.y) * 0.07;

      const px = pointerRef.current.x;
      const py = pointerRef.current.y;

      // Piloter l'inclinaison 3D CSS & le parallaxe sans re-render React
      const stageEl = stageRef.current;
      if (stageEl && !reducedMotion) {
        stageEl.style.setProperty('--pc-tilt-x', `${(-py * 4.5).toFixed(2)}deg`);
        stageEl.style.setProperty('--pc-tilt-y', `${(px * 6.5).toFixed(2)}deg`);
        stageEl.style.setProperty('--pc-pan-x', `${(-px * 18).toFixed(2)}px`);
        stageEl.style.setProperty('--pc-pan-y', `${(-py * 12).toFixed(2)}px`);
        stageEl.style.setProperty('--pc-spot-x', `${(50 + px * 22).toFixed(1)}%`);
        stageEl.style.setProperty('--pc-spot-y', `${(48 + py * 18).toFixed(1)}%`);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const currentAct = actRef.current;

      drawAtmosphericOverlay(time, cx, cy, px, py, currentAct);
      drawParticles(time, cx, cy, px, py, currentAct);

      ctx.restore();
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerRef.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const handlePointerLeave = () => {
    pointerRef.current.tx = 0;
    pointerRef.current.ty = 0;
  };

  const actLabels = isEn
    ? ['01 · CERTIFIED MEDICINES', '02 · VITAMINS & SERUMS', '03 · PRECISION CARE']
    : ['01 · MÉDICAMENTS', '02 · VITAMINES & SÉRUMS', '03 · SOINS DE PRÉCISION'];

  const activeScene = HERO_PRODUCT_SCENES[act];

  const renderCallouts = (items: CalloutItem[], side: 'left' | 'right') => (
    <div className={`pc-cinema-callout-col is-${side}`}>
      {items.map(spec => {
        const line = (
          <span className="pc-cinema-callout-line" aria-hidden="true">
            <i />
          </span>
        );
        const text = (
          <div className="pc-cinema-callout-text">
            <strong>{isEn ? spec.titleEn : spec.titleFr}</strong>
            <span>{isEn ? spec.descEn : spec.descFr}</span>
          </div>
        );
        return (
          <div key={spec.titleFr} className="pc-cinema-callout-item">
            {side === 'left' ? (
              <>
                {text}
                {line}
              </>
            ) : (
              <>
                {line}
                {text}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const specStage = (
    <div className="pc-cinema-spec-stage">
      {renderCallouts(activeScene.leftSpecs, 'left')}
      <div className="pc-cinema-focal-gap" aria-hidden="true">
        <span className="pc-cinema-quality-stamp">{isEn ? activeScene.badgeEn : activeScene.badgeFr}</span>
      </div>
      {renderCallouts(activeScene.rightSpecs, 'right')}
    </div>
  );

  return (
    <section
      ref={stageRef}
      className={`pc-cinema-stage pc-cinema-act-${act}`}
      aria-label={isEn ? 'PharmaConnect Interactive Health Showcase' : 'Vitrine animée santé PharmaConnect'}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Calque photographique studio centré haute netteté (parallaxe 3D + Ken Burns sans voile) */}
      <div className="pc-cinema-photo-stage" aria-hidden="true">
        <div className="pc-cinema-spotlight" />
        <div className="pc-cinema-photo-tilt">
          {HERO_PRODUCT_SCENES.map((scene, idx) => {
            const isActive = act === idx;
            const resolvedSrc = fallbackActive[idx] ? scene.fallbackSrc : scene.src;
            return (
              <div key={scene.src} className={`pc-cinema-photo-slide ${isActive ? 'is-active' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvedSrc}
                  alt=""
                  className="pc-cinema-photo-img"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  onError={() => {
                    if (!fallbackActive[idx]) {
                      setFallbackActive(prev => ({ ...prev, [idx]: true }));
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="pc-cinema-scrim" />
      </div>

      {/* Calque particules & onde ECG atmosphérique par-dessus */}
      <canvas ref={canvasRef} className="pc-cinema-canvas" aria-hidden="true" />

      {/* Barre supérieure éditoriale façon studio */}
      <div className="pc-cinema-topbar">
        <div className="pc-cinema-acts-nav" role="tablist" aria-label={isEn ? 'Animation scenes' : 'Séquences animées'}>
          {actLabels.map((label, idx) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={act === idx}
              className={`pc-cinema-tab ${act === idx ? 'active' : ''}`}
              onClick={() => setAct(idx as ActIndex)}
            >
              <span>{label}</span>
              {act === idx && (
                <i
                  className="pc-cinema-tab-bar"
                  style={{ transform: `scaleX(${Math.max(0.08, actProgress)})` }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="pc-cinema-top-actions">
          <button
            type="button"
            className="pc-cinema-icon-pill"
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? (isEn ? 'Play animation' : 'Reprendre l’animation') : (isEn ? 'Pause animation' : 'Mettre en pause')}
            title={paused ? (isEn ? 'Play' : 'Lire') : (isEn ? 'Pause' : 'Pause')}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
          <button type="button" className="pc-cinema-top-cta" onClick={onExplorePharmacies}>
            <span>{isEn ? 'FIND A PHARMACY IN REAL TIME' : 'TROUVER UNE OFFICINE EN DIRECT'}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Corps éditorial structuré façon vitrine produit studio (titre haut -> scène centrale nette + repères -> barre d'action basse) */}
      <div className="pc-cinema-body">
        {act === 0 && (
          <div className="pc-cinema-scene pc-scene-fade" key="act-0">
            <header className="pc-cinema-studio-head">
              <span className="pc-cinema-kicker-pill">
                {isEn ? 'CERTIFIED PHARMACY NETWORK' : 'RÉSEAU PHARMACEUTIQUE CERTIFIÉ'}
              </span>
              <h1 className="pc-cinema-display-title">
                {isEn ? 'BORN FOR ' : 'AU CŒUR DE '}
                <span className="pc-cinema-serif-accent">{isEn ? 'HEALTH' : 'LA SANTÉ'}</span>
              </h1>
              <p className="pc-cinema-studio-sub">
                {isEn
                  ? 'Verified medicines, real-time pharmacy inventory and trusted care in one clear place.'
                  : 'Allier la rigueur pharmaceutique à la disponibilité en direct pour orienter chaque patient sans attente.'}
              </p>
            </header>

            {specStage}

            <div className="pc-cinema-bottom-corners">
              <div className="pc-cinema-corner-left">
                <b>{isEn ? 'WE CONNECT' : 'NOUS RELIONS'}</b>
                <span>{isEn ? 'CARE & PROXIMITY' : 'SOINS & PROXIMITÉ'}</span>
                <div className="pc-cinema-micro-actions">
                  <button
                    type="button"
                    className="pc-cinema-micro-link"
                    onClick={() => {
                      const el = document.getElementById('cg-top-quick-search-input') as HTMLInputElement | null;
                      el?.focus();
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    <Search size={11} /> {isEn ? 'EXPRESS SEARCH' : 'RECHERCHE EXPRESS'}
                  </button>
                  <button
                    type="button"
                    className="pc-cinema-micro-link pc-cinema-micro-muted"
                    onClick={onScrollToFinder}
                  >
                    {isEn ? 'FILTERS BELOW' : 'FILTRES PAR BESOIN'} <ArrowDown size={11} />
                  </button>
                </div>
              </div>
              <span className="pc-cinema-scene-caption">
                {isEn ? activeScene.tagEn : activeScene.tagFr}
              </span>
            </div>
          </div>
        )}

        {act === 1 && (
          <div className="pc-cinema-scene pc-cinema-scene-center pc-scene-fade" key="act-1">
            <header className="pc-cinema-studio-head">
              <span className="pc-cinema-kicker-pill">
                {isEn ? 'VITAMINS, SERUMS & IMMUNITY' : 'VITAMINES, SÉRUMS & IMMUNITÉ'}
              </span>
              <h2 className="pc-cinema-display-title pc-cinema-display-compact">
                {isEn ? 'PHARMACONNECT ' : 'SANTÉ EN '}
                <span className="pc-cinema-serif-accent">{isEn ? 'LIVE CARE' : 'TEMPS RÉEL'}</span>
              </h2>
              <div className="pc-cinema-head-inline">
                <p className="pc-cinema-studio-sub">
                  {isEn
                    ? 'Trusted pharmacies visible in real time at the intersection of care and precision.'
                    : 'Un écosystème santé à la croisée du soin et de la précision, guidé par la proximité humaine.'}
                </p>
                <button
                  type="button"
                  className="pc-cinema-pulse-anchor"
                  onClick={onExploreProducts}
                  aria-label={isEn ? 'Browse verified products' : 'Parcourir le catalogue vérifié'}
                >
                  <ModernHeartVitalityIcon size={18} />
                </button>
              </div>
            </header>

            {specStage}

            <div className="pc-cinema-act2-footer">
              <div className="pc-cinema-odometer" aria-live="polite">
                <span className="pc-odo-plus">+</span>
                <span key={displayedMetric} className="pc-odo-digits">
                  {displayedMetric}
                </span>
                <small>{isEn ? 'VERIFIED CARE NODES' : 'RÉFÉRENCES & OFFICINES'}</small>
              </div>

              <div className="pc-cinema-orb-buttons">
                <button
                  type="button"
                  className="pc-cinema-orb-btn"
                  onClick={onExplorePharmacies}
                  title={isEn ? 'Pharmacies directory' : 'Annuaire des pharmacies'}
                  aria-label={isEn ? 'Pharmacies directory' : 'Annuaire des pharmacies'}
                >
                  <ModernDigitalStoreIcon size={17} />
                </button>
                <button
                  type="button"
                  className="pc-cinema-orb-btn"
                  onClick={onExploreProducts}
                  title={isEn ? 'Verified medicines catalog' : 'Catalogue produits vérifiés'}
                  aria-label={isEn ? 'Verified medicines catalog' : 'Catalogue produits vérifiés'}
                >
                  <ModernPillCapsuleIcon size={17} />
                </button>
                <button
                  type="button"
                  className="pc-cinema-orb-btn"
                  onClick={onScrollToFinder}
                  title={isEn ? 'Filter by health need' : 'Filtrer par besoin santé'}
                  aria-label={isEn ? 'Filter by health need' : 'Filtrer par besoin santé'}
                >
                  <ModernEmergency24Icon size={17} />
                </button>
              </div>

              <div className="pc-cinema-corner-tag">
                {isEn ? 'Interactive Healthcare' : 'Santé Interactive'}
              </div>
            </div>
          </div>
        )}

        {act === 2 && (
          <div className="pc-cinema-scene pc-scene-fade" key="act-2">
            <header className="pc-cinema-studio-head">
              <span className="pc-cinema-kicker-pill">
                <span className="pc-cinema-copy-mark">©</span> PHARMACONNECT · {isEn ? 'PRECISION CARE' : 'SOINS DE PRÉCISION'}
              </span>
              <h2 className="pc-cinema-display-title">
                {isEn ? 'CARE OF ' : 'SOINS '}
                <span className="pc-cinema-serif-accent">{isEn ? 'TOMORROW' : 'DU FUTUR'}</span>
              </h2>
              <p className="pc-cinema-studio-sub">
                {isEn
                  ? 'Medical equipment, 24/7 duty coverage and direct pharmacist guidance across your city.'
                  : 'Dispositifs médicaux, pharmacies de garde et accompagnement officinal certifié près de chez vous.'}
              </p>
            </header>

            {specStage}

            <div className="pc-cinema-finale-footer">
              <div className="pc-cinema-seal" aria-hidden="true">
                <svg viewBox="0 0 100 100" className="pc-cinema-seal-ring">
                  <defs>
                    <path id="pcSealPath" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
                  </defs>
                  <text fill="rgba(27, 61, 54, 0.88)" fontSize="9.2" letterSpacing="2.6" fontWeight="700">
                    <textPath href="#pcSealPath">
                      {isEn ? 'TRUSTED CARE • PHARMACONNECT • ' : 'SOINS CERTIFIÉS • PHARMACONNECT • '}
                    </textPath>
                  </text>
                </svg>
                <span className="pc-cinema-seal-core">
                  <ModernHeartVitalityIcon size={18} />
                </span>
              </div>

              <div className="pc-cinema-finale-actions">
                <button type="button" className="pc-cinema-glass-cta" onClick={onExplorePharmacies}>
                  <span>{isEn ? 'EXPLORE PHARMACIES' : 'EXPLORER LES OFFICINES'}</span>
                  <ArrowUpRight size={15} />
                </button>
                <button type="button" className="pc-cinema-ghost-cta" onClick={onExploreProducts}>
                  <span>{isEn ? 'LIVE MEDICINES' : 'CATALOGUE EN DIRECT'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
