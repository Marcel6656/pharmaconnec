import React from 'react';

export interface ModernIconProps {
  size?: number;
  className?: string;
}

/** Brand logo: modern rounded pharmacy cross with live ECG heartbeat wave */
export function ModernBrandLogoIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-brand-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <path
        d="M9 3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V9h5.5A1.5 1.5 0 0 1 22 10.5v3A1.5 1.5 0 0 1 20.5 15H15v5.5A1.5 1.5 0 0 1 13.5 22h-3A1.5 1.5 0 0 1 9 20.5V15H3.5A1.5 1.5 0 0 1 2 13.5v-3A1.5 1.5 0 0 1 3.5 9H9V3.5Z"
        fill="#4fa88d"
        fillOpacity="0.2"
        stroke="url(#pc-brand-grad)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 12h2.6l1.4-2.8 2.5 5.6 1.6-2.8h2.9"
        stroke="#1b3d36"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Category 1: General Healthcare & Medicine — Bicolor duotone pill capsule + sparkle */
export function ModernPillCapsuleIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-pill-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <path
        d="M10.5 20.5 3.5 13.5a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7Z"
        fill="#4fa88d"
        fillOpacity="0.16"
        stroke="url(#pc-pill-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 10l3.5-3.5a4.95 4.95 0 0 1 0 7L14 17"
        fill="#4fa88d"
        fillOpacity="0.34"
      />
      <path d="M8.5 8.5l7 7" stroke="#1b3d36" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M18.5 3.5v3M17 5h3" stroke="#32856e" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Category 2: Specialty & Vitality — Duotone heart with crisp ECG vitality trace */
export function ModernHeartVitalityIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-heart-grad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <path
        d="M19.5 12.6 12 20l-7.5-7.4A5.1 5.1 0 0 1 12 5.7a5.1 5.1 0 0 1 7.5 6.9Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="url(#pc-heart-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 12h3.2l1.6-3 2.4 5.2 1.7-2.2h4.1"
        stroke="#1b3d36"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Category 3: Medical Equipment — Modern duotone stethoscope & sensor */
export function ModernMedicalDeviceIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-dev-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <path
        d="M4.5 3.5v5.8a4.8 4.8 0 0 0 9.6 0V3.5"
        stroke="url(#pc-dev-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M4.5 3.5h2M12.1 3.5h2" stroke="#1b3d36" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M9.3 14.1v1.4a4.8 4.8 0 0 0 9.6 0v-2.2"
        stroke="url(#pc-dev-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="18.9"
        cy="10.8"
        r="2.6"
        fill="#4fa88d"
        fillOpacity="0.28"
        stroke="#1b3d36"
        strokeWidth="1.75"
      />
      <circle cx="18.9" cy="10.8" r="0.8" fill="#1b3d36" />
    </svg>
  );
}

/** Category 4: Dermocosmetics & Care — Duotone radiant serum droplet */
export function ModernDermaDropIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-drop-grad" x1="5" y1="2" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.8S6 9.6 6 14.2a6 6 0 0 0 12 0C18 9.6 12 2.8 12 2.8Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="url(#pc-drop-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 14.8a2.7 2.7 0 0 0 2.7 2.6"
        stroke="#1b3d36"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M18.5 5v3M17 6.5h3" stroke="#32856e" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Category 5: Baby & Maternity — Duotone nurturing cradle & heart */
export function ModernBabyCareIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-baby-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <circle
        cx="9"
        cy="7"
        r="3"
        fill="#4fa88d"
        fillOpacity="0.24"
        stroke="url(#pc-baby-grad)"
        strokeWidth="1.75"
      />
      <circle
        cx="16.5"
        cy="9"
        r="2.3"
        fill="#7aacc2"
        fillOpacity="0.28"
        stroke="#32856e"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 19.5c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5"
        fill="#4fa88d"
        fillOpacity="0.16"
        stroke="url(#pc-baby-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.5 19.5c0-2.3 1.7-4 4-4 1 0 1.9.4 2.5 1"
        stroke="#32856e"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Category 6: Emergency & 24/7 Duty — Pharmacy cross inside 24h orbital clock */
export function ModernEmergency24Icon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-guard-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="9.2"
        fill="#4fa88d"
        fillOpacity="0.18"
        stroke="url(#pc-guard-grad)"
        strokeWidth="1.8"
      />
      <path
        d="M12 7.5v9M7.5 12h9"
        stroke="#1b3d36"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="19" cy="5.5" r="2.2" fill="#4fa88d" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
}

/** Trust & Verification: Accredited Shield duotone with clean check */
export function ModernVerifiedShieldIcon({ size = 18, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-shield-grad" x1="4" y1="2" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5 4.5 5.6v5.7c0 4.9 3.2 9.2 7.5 10.6 4.3-1.4 7.5-5.7 7.5-10.6V5.6L12 2.5Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="url(#pc-shield-grad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.1 2.2 2.2 4.4-4.6"
        stroke="#1b3d36"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Trust: Whole Family Care duotone */
export function ModernFamilyCareIcon({ size = 18, className = '' }: ModernIconProps) {
  return <ModernBabyCareIcon size={size} className={className} />;
}

/** Trust: Live Real-Time Stock telemetry wave */
export function ModernLivePulseIcon({ size = 18, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#4fa88d" fillOpacity="0.14" stroke="#4fa88d" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="5" fill="#4fa88d" fillOpacity="0.26" stroke="#32856e" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.2" fill="#1b3d36" />
    </svg>
  );
}

/** Hero Booking Card Header: Calendar with medical badge */
export function ModernCalendarBookingIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-cal-grad" x1="3" y1="4" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="3.5"
        fill="#4fa88d"
        fillOpacity="0.18"
        stroke="url(#pc-cal-grad)"
        strokeWidth="1.8"
      />
      <path d="M3.5 9.8h17" stroke="#1b3d36" strokeWidth="1.75" />
      <path d="M8 3.2v3.2M16 3.2v3.2" stroke="#1b3d36" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 13v4M10 15h4" stroke="#1b3d36" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Step 01: Search Medicine duotone */
export function ModernSearchMedicineIcon({ size = 24, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle
        cx="10.8"
        cy="10.8"
        r="7"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="#1b3d36"
        strokeWidth="1.9"
      />
      <path d="M16 16l4.8 4.8" stroke="#1b3d36" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M10.8 8v5.6M8 10.8h5.6" stroke="#32856e" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Step 02 & Bento 1: Radar Location Pin duotone */
export function ModernRadarPinIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-pin-grad" x1="5" y1="2" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fa88d" />
          <stop offset="100%" stopColor="#1b3d36" />
        </linearGradient>
      </defs>
      <path
        d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z"
        fill="#4fa88d"
        fillOpacity="0.24"
        stroke="url(#pc-pin-grad)"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" fill="#1b3d36" />
    </svg>
  );
}

/** Header & Bento 2: Digital Pharmacy Storefront duotone */
export function ModernDigitalStoreIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 9.5h16v9.8a1.7 1.7 0 0 1-1.7 1.7H5.7A1.7 1.7 0 0 1 4 19.3V9.5Z"
        fill="#4fa88d"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M3.2 9.5 4.8 4.2A1.2 1.2 0 0 1 6 3.3h12a1.2 1.2 0 0 1 1.2.9l1.6 5.3a2.4 2.4 0 0 1-2.3 3 2.4 2.4 0 0 1-2.2-1.4 2.4 2.4 0 0 1-4.3 0 2.4 2.4 0 0 1-4.3 0A2.4 2.4 0 0 1 5.5 12.5a2.4 2.4 0 0 1-2.3-3Z"
        fill="#4fa88d"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 14.5v3.6M10.2 16.3h3.6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** Step 03 & Bento 3: Encrypted Confidential Messaging duotone */
export function ModernChatEncryptedIcon({ size = 22, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 6.5A3 3 0 0 1 7.5 3.5h9a3 3 0 0 1 3 3v7.2a3 3 0 0 1-3 3H10l-4.5 3.6v-3.6h-.5a.5.5 0 0 1-.5-.5V6.5Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="#1b3d36"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 10.1 1.8 1.9 3.8-4"
        stroke="#32856e"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Metrics 1: Happy Patients duotone */
export function ModernMetricPatientsIcon({ size = 24, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="#4fa88d" fillOpacity="0.22" stroke="#1b3d36" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.2" fill="#1b3d36" />
      <circle cx="15" cy="10" r="1.2" fill="#1b3d36" />
      <path d="M8.3 14.3a4.6 4.6 0 0 0 7.4 0" stroke="#32856e" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** Metrics 2 & Badge Star: Gold/Mint Faceted Star duotone */
export function ModernMetricStarIcon({ size = 24, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pc-star-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d9b56f" />
          <stop offset="100%" stopColor="#b0873d" />
        </linearGradient>
      </defs>
      <path
        d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.36L12 17.36l-5.7 3.01 1.09-6.36-4.62-4.5 6.38-.93L12 2.8Z"
        fill="#c7a463"
        fillOpacity="0.28"
        stroke="url(#pc-star-grad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Metrics 3 & Badge Award: Laurel / Quality Award Ribbon duotone */
export function ModernMetricAwardIcon({ size = 24, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="9.2" r="5.8" fill="#4fa88d" fillOpacity="0.24" stroke="#1b3d36" strokeWidth="1.8" />
      <path
        d="M8.5 14.2 7.2 21l4.8-2.3 4.8 2.3-1.3-6.8"
        fill="#4fa88d"
        fillOpacity="0.16"
        stroke="#32856e"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.2" r="2.1" fill="#32856e" />
    </svg>
  );
}

/** Metrics 4: Double Wellness Heart duotone */
export function ModernMetricHeartIcon({ size = 24, className = '' }: ModernIconProps) {
  return <ModernHeartVitalityIcon size={size} className={className} />;
}

/** Dashboard / Overview: Duotone 4-tile bento layout */
export function ModernDashboardIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="#4fa88d" fillOpacity="0.28" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="3" width="8" height="5.5" rx="2" fill="#4fa88d" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.75" />
      <rect x="13" y="10.5" width="8" height="10.5" rx="2.5" fill="#4fa88d" fillOpacity="0.28" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="#4fa88d" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

/** Package Box / Product Catalog: Duotone isometric box with medical cross badge */
export function ModernPackageBoxIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.8 4 7.2v9.6l8 4.4 8-4.4V7.2L12 2.8Z"
        fill="#4fa88d"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="m4 7.2 8 4.4 8-4.4M12 11.6v9.6" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M8 5l8 4.4" stroke="#32856e" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Stocks & Pricing / Audit Log: Duotone clipboard with verified check */
export function ModernClipboardStockIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="4.5" width="14" height="16.5" rx="2.8" fill="#4fa88d" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 3.5h6a1.5 1.5 0 0 1 1.5 1.5v1H7.5V5A1.5 1.5 0 0 1 9 3.5Z" fill="#4fa88d" fillOpacity="0.32" stroke="currentColor" strokeWidth="1.6" />
      <path d="m9.2 13 2 2 4-4.2" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Categories / Tags: Duotone faceted price/category tag */
export function ModernTagCategoryIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 11.8V5.5a2 2 0 0 1 2-2h6.3a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-6.3 6.3a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Notifications / Alerts: Duotone resonance bell with badge dot */
export function ModernBellAlertIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.2 10.2a5.8 5.8 0 0 1 11.6 0c0 4.5 1.8 5.8 1.8 5.8H4.4s1.8-1.3 1.8-5.8Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9.8 18.8a2.4 2.4 0 0 0 4.4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="17.5" cy="5.5" r="2.2" fill="#4fa88d" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
}

/** Subscription & Mobile Money Payments: Duotone smart card */
export function ModernCreditCardPlanIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.8" y="4.8" width="18.4" height="14.4" rx="3" fill="#4fa88d" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2.8 9.2h18.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="6" y="13" width="5" height="2.6" rx="1" fill="#4fa88d" fillOpacity="0.45" />
    </svg>
  );
}

/** Settings Gear: Duotone precision control dial */
export function ModernSettingsGearIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="#4fa88d"
        fillOpacity="0.34"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Lock & Security: Duotone encrypted padlock */
export function ModernLockSecurityIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="3" fill="#4fa88d" fillOpacity="0.24" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Mail Envelope / Contact: Duotone clean envelope with green accent */
export function ModernMailEnvelopeIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5.2" width="18" height="13.6" rx="3" fill="#4fa88d" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
      <path d="m4.2 7 7.1 5.2a1.2 1.2 0 0 0 1.4 0L19.8 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Phone Call: Duotone receiver with signal rings */
export function ModernPhoneCallIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5.6 3.5h3.2l1.4 3.8-2 1.5a11.5 11.5 0 0 0 7 7l1.5-2 3.8 1.4v3.2a1.8 1.8 0 0 1-1.9 1.8A15.4 15.4 0 0 1 3.8 5.4 1.8 1.8 0 0 1 5.6 3.5Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14.5 5.5a4 4 0 0 1 4 4M14.5 2.8a6.8 6.8 0 0 1 6.7 6.7" stroke="#32856e" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

/** User & Pharmacist Badge: Duotone profile emblem */
export function ModernUserBadgeIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="#4fa88d" fillOpacity="0.26" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4.5 20.2c0-3.7 3.4-6.2 7.5-6.2s7.5 2.5 7.5 6.2"
        fill="#4fa88d"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Document & Accreditation Check: Duotone official sheet with verification seal */
export function ModernDocumentCheckIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 3.2h8.2L19 8v12.8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.8V4.7A1.5 1.5 0 0 1 6 3.2Z"
        fill="#4fa88d"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 3.2V8h4.8" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
      <path d="m8.8 14.5 2.1 2.1 4.3-4.4" stroke="#32856e" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sparkle & Premium Tier Crown: Duotone radiant star-sparkle */
export function ModernSparkleCrownIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m12 2.5 2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2L12 2.5Z"
        fill="#4fa88d"
        fillOpacity="0.28"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M19 4v2.6M17.7 5.3h2.6" stroke="#32856e" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Upload Cloud / Export: Duotone cloud transfer */
export function ModernUploadCloudIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7.5 18.5h9.2a4.3 4.3 0 0 0 .8-8.5A5.5 5.5 0 0 0 6.8 9.2 3.8 3.8 0 0 0 7.5 18.5Z"
        fill="#4fa88d"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 16V10.5M9.5 12.8 12 10.2l2.5 2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Alert Warning / Report: Duotone rounded triangle badge */
export function ModernAlertWarningIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10.4 4.2 3.3 17a1.8 1.8 0 0 0 1.6 2.7h14.2a1.8 1.8 0 0 0 1.6-2.7L13.6 4.2a1.8 1.8 0 0 0-3.2 0Z"
        fill="#c7a463"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1" fill="currentColor" />
    </svg>
  );
}

/** Send Paper Plane: Duotone swift dispatch */
export function ModernSendPlaneIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 3.5 10.5 14M21 3.5l-6.5 17.5-4-7-7-4L21 3.5Z"
        fill="#4fa88d"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** WhatsApp Call & Chat Icon */
export function ModernWhatsAppIcon({ size = 20, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.8a9.1 9.1 0 0 0-7.8 13.8L3 21.2l4.7-1.2A9.1 9.1 0 1 0 12 2.8Z"
        fill="#25D366"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.1 8.6c.2-.4.4-.4.7-.4h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.1.6l-.5.6c-.1.1-.1.3 0 .5.4.7 1.1 1.4 1.9 1.8.2.1.4.1.5 0l.7-.6c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.6 0 .8-.5 1.5-1.3 1.8-.6.2-1.4.2-2.7-.4-1.7-.7-3.4-2.4-4.2-4.1-.5-1.1-.5-2-.1-2.8l.8-.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Official Multi-Color Google Logo Icon */
export function ModernGoogleLogoIcon({ size = 18, className = '' }: ModernIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

/** Format a phone number into a wa.me deep link for WhatsApp call/chat */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digits = (phone || '').replace(/[^\d]/g, '');
  if (!digits) return '#';
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${encoded}`;
}
