'use client';

import React, { useEffect, useRef } from 'react';

const REVEAL_SELECTOR = [
  '.panel',
  '.cg-modern-panel',
  '.pharmacy-card',
  '.product-card',
  '.mc-product-card',
  '.pc-home-cat-card',
  '.pc-page-visual-banner',
  '.pc-editorial-split',
  '.pc-clean-search-dock',
  '.luxe-service-card',
  '.luxe-process-step',
  '.luxe-testimonial-card',
  '.luxe-blog-card',
  '.luxe-section-header',
  '.luxe-about-grid',
  '.luxe-contact-grid',
  '.sp-page-portal-card',
  '.price-card',
  '.metric-card',
  '.pc-adm-kpi-card',
  '.pc-adm-queue-item',
  '.pc-adm-shortcut-tile',
  '.pc-adm-ticket-card',
  '.pc-adm-cat-row',
  '.pc-emergency-card',
  '.pc-vigilance-card',
  '.pc-news-card',
  '.cg-service-card',
  '.cg-approach-card',
  '.cg-onboarding-step-card',
  '.cg-price-card-modern',
  '.cg-section-head',
  '.cg-section-header-center',
  '.cg-filter-card',
  '.cg-onboarding-panel',
  '.mc-bento-tall',
  '.mc-bento-wide',
  '.badge-admin-card',
  '.pc-admin-editorial-row',
].join(', ');

interface PageTransitionStageProps {
  routeKey: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps a page or nested sub-page with a keyed entry transition and lightweight
 * IntersectionObserver scroll-reveals for below-the-fold cards.
 */
export function PageTransitionStage({
  routeKey,
  className = '',
  children,
}: PageTransitionStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;

    if (
      typeof window === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const targets = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
    const vh = window.innerHeight || 800;
    const belowFold: HTMLElement[] = [];

    targets.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (rect.top > vh * 0.96) {
        el.classList.remove('pc-scroll-in');
        el.classList.add('pc-scroll-wait');
        el.style.setProperty('--pc-stagger', `${(idx % 6) * 45}ms`);
        belowFold.push(el);
      }
    });

    if (belowFold.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.remove('pc-scroll-wait');
            el.classList.add('pc-scroll-in');
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: '0px 0px -36px 0px', threshold: 0.04 },
    );

    belowFold.forEach(el => observer.observe(el));

    // Safety fallback so dynamically resized viewports never leave elements unrevealed
    const fallbackTimer = window.setTimeout(() => {
      belowFold.forEach(el => {
        if (el.classList.contains('pc-scroll-wait')) {
          el.classList.remove('pc-scroll-wait');
          el.classList.add('pc-scroll-in');
        }
      });
    }, 2200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [routeKey]);

  return (
    <div key={routeKey} ref={stageRef} className={`pc-page-stage ${className}`.trim()}>
      {children}
    </div>
  );
}
