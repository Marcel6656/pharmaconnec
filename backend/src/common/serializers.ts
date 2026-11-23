import type { Badge, Pharmacy, PharmacyBadge, Plan, Product, StockSnapshot } from '@prisma/client';
import { DAY_MS } from './constants';

type PharmacyWithBadges = Pharmacy & { badges?: (PharmacyBadge & { badge: Badge })[] };

export function isBadgeActive(badge: Badge, assignedAt: Date): boolean {
  if (!badge.expiryDays) return true;
  return Date.now() <= assignedAt.getTime() + badge.expiryDays * DAY_MS;
}

/** Date d'échéance effective : abonnement payé, sinon fin d'essai. */
export function expiryOf(p: Pick<Pharmacy, 'subscriptionEndsAt' | 'trialEndsAt'>): Date | null {
  return p.subscriptionEndsAt ?? p.trialEndsAt ?? null;
}

export function isPubliclyVisible(p: Pharmacy): boolean {
  if (p.status !== 'Validée') return false;
  const exp = expiryOf(p);
  return Boolean(exp && exp.getTime() > Date.now());
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Format compatible avec le type `Pharmacy` du frontend (badgeIds, badgeAssignedAt, documents…). */
export function serializePharmacy(p: PharmacyWithBadges, opts: { includePrivate?: boolean; includeHiddenBadges?: boolean; productsCount?: number } = {}) {
  const links = p.badges ?? [];
  const activeLinks = links.filter(l => l.badge.visible && isBadgeActive(l.badge, l.assignedAt));
  const exposedLinks = opts.includeHiddenBadges ? links : activeLinks;
  const base = {
    id: p.id,
    name: p.name,
    city: p.city,
    area: p.area,
    address: p.address,
    phone: p.phone,
    email: p.email,
    responsible: p.responsible,
    lat: p.lat ?? undefined,
    lng: p.lng ?? undefined,
    openingHours: p.openingHours ?? undefined,
    status: p.status,
    coverImage: p.coverImage ?? undefined,
    badgeIds: exposedLinks.map(l => l.badgeId),
    badges: activeLinks.map(l => serializeBadge(l.badge)),
    badgeAssignedAt: Object.fromEntries(exposedLinks.map(l => [String(l.badgeId), l.assignedAt.toISOString()])),
    products: opts.productsCount ?? 0,
    updated: p.updatedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  };
  if (!opts.includePrivate) return base;
  return {
    ...base,
    ownerId: p.ownerId ?? undefined,
    subscription: p.subscription,
    metadata: p.metadata ?? undefined,
    openingHoursJson: p.openingHoursJson ?? undefined,
    license: p.license,
    documents: p.documentsNote ?? undefined,
    trialEndsAt: p.trialEndsAt?.toISOString(),
    subscriptionEndsAt: p.subscriptionEndsAt?.toISOString(),
  };
}

export function serializeBadge(b: Badge) {
  return {
    id: b.id,
    key: b.key ?? undefined,
    name: b.name,
    description: b.description,
    color: b.color,
    icon: b.icon,
    visible: b.visible,
    expiryDays: b.expiryDays,
    system: b.system,
  };
}

/** Format compatible avec le type `Product` du frontend (imageDataUrl, updated, stockHistory…). */
export function serializeProduct(p: Product & { stockHistory?: StockSnapshot[] }) {
  return {
    id: p.id,
    pharmacyId: p.pharmacyId,
    name: p.name,
    category: p.category,
    brand: p.brand,
    code: p.code,
    price: p.price,
    stock: p.stock,
    available: p.stock > 0,
    status: p.status,
    note: p.note ?? undefined,
    description: p.description,
    attributes: p.attributes ?? undefined,
    imageDataUrl: p.imageUrl ?? undefined,
    updated: p.stockUpdatedAt.toISOString(),
    modifiedAt: p.updatedAt.toISOString(),
    stockHistory: p.stockHistory?.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).map(s => ({ price: s.price, stock: s.stock, date: s.createdAt.toISOString() })),
  };
}

export function serializePublicProduct(product: Product) {
  const { note: _note, attributes: _attributes, stockHistory: _stockHistory, ...published } = serializeProduct(product);
  return published;
}

export function parsePlanFeatures(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return raw ? [raw] : [];
  }
}

export function serializePlan(plan: Plan) {
  return {
    name: plan.name as 'Basic' | 'Standard' | 'Premium',
    monthly: plan.monthly,
    quarterly: plan.quarterly,
    yearly: plan.yearly,
    description: plan.description,
    features: parsePlanFeatures(plan.features),
  };
}

/** Formate une date en libellé lisible compatible avec `isProductFresh` du frontend (`Aujourd’hui`, `Hier`, `12 nov. 2026`). */
export function formatFrDate(d: Date): string {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startToday - startTarget) / DAY_MS);
  if (diffDays === 0) return 'Aujourd’hui';
  if (diffDays === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
