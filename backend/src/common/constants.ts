export const ROLES = ['ADMIN', 'PHARMACIST', 'VISITOR'] as const;
export type Role = (typeof ROLES)[number];

export const PHARMACY_STATUSES = ['En attente', 'En vérification', 'Validée', 'Refusée', 'Suspendue', 'Abonnement expiré'] as const;
export type PharmacyStatus = (typeof PHARMACY_STATUSES)[number];

export const PRODUCT_STATUSES = ['Publié', 'En attente', 'À corriger', 'Refusé', 'Masqué', 'Suspendu', 'Brouillon', 'Archivé'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** Statuts qu'une pharmacie peut appliquer elle-même à ses produits. */
export const PHARMACY_PRODUCT_STATUSES: ProductStatus[] = ['Brouillon', 'En attente', 'Masqué', 'Archivé'];

export const PAYMENT_STATUSES = ['En attente', 'Confirmé', 'Échoué'] as const;
export const REPORT_STATUSES = ['À traiter', 'En cours', 'Résolu', 'Rejeté'] as const;
export const CONTACT_STATUSES = ['Nouveau', 'En cours', 'Traité', 'Archivé'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];
export const PLAN_NAMES = ['Basic', 'Standard', 'Premium'] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

/** Quota maximal de produits actifs (non archivés) par formule. */
export const PLAN_PRODUCT_LIMITS: Record<PlanName, number> = {
  Basic: 50,
  Standard: 300,
  Premium: Infinity,
};

export const PERIODS = { Mensuel: 1, Trimestriel: 3, Annuel: 12 } as const;
export type Period = keyof typeof PERIODS;
export const PERIOD_TO_PLAN_FIELD: Record<Period, 'monthly' | 'quarterly' | 'yearly'> = {
  Mensuel: 'monthly',
  Trimestriel: 'quarterly',
  Annuel: 'yearly',
};

export const MOBILE_MONEY_PROVIDERS = ['Airtel Money', 'Moov Money', 'Orange Money', 'Wave'] as const;

export const NOTICE_KINDS = ['info', 'success', 'warning'] as const;
export type NoticeKind = (typeof NOTICE_KINDS)[number];

export const VERIFIED_BADGE_KEY = 'verified';
export const VERIFIED_BADGE_NAME = 'Pharmacie vérifiée';
export const PAYMENT_CURRENCY = 'XAF';
export const TRIAL_DAYS = 14;
export const DEFAULT_FRESHNESS_DAYS = 7;
export const DAY_MS = 86_400_000;

export const OFFICIAL_CATEGORIES = ['Médicaments', 'Vitamines', 'Hygiène', 'Matériel médical', 'Parapharmacie', 'Bébé & maternité'];
