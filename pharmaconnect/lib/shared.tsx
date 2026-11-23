import { AuthenticatedImage } from '@/components/shared/AuthenticatedImage';
import { ActionMenu, ActionMenuItem } from '@/components/shared/ActionMenu';
import React, { useState } from 'react';
import {
  Check, Clock3, Copy, DollarSign, Eye, EyeOff,
  Pencil, RotateCcw, Trash2, Ban, FileCheck2, X
} from 'lucide-react';
import {
  ModernMetricAwardIcon,
  ModernMetricStarIcon,
  ModernPackageBoxIcon,
  ModernSearchMedicineIcon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

export type ProductStatus = 'Publié' | 'En attente' | 'À corriger' | 'Refusé' | 'Masqué' | 'Suspendu' | 'Brouillon' | 'Archivé';
export type PharmacyStatus = 'En attente' | 'En vérification' | 'Validée' | 'Refusée' | 'Suspendue' | 'Abonnement expiré';
export type StockSnapshot = { price: number; stock: number; date: string };
export type Product = { id: number; pharmacyId: number; name: string; category: string; brand: string; code: string; price: number; stock: number; status: ProductStatus; updated: string; stockUpdatedAt?: string; modifiedAt?: string; note?: string; description: string; imageDataUrl?: string; stockHistory?: StockSnapshot[] };
export type PharmacyDocumentMeta = { id: number; fileName: string; mimeType: string; size: number };
export type Pharmacy = { id: number; ownerId?: number; documents?: string; uploadedDocuments?: PharmacyDocumentMeta[]; badgeAssignedAt?: Record<string, string>; name: string; city: string; area: string; address: string; phone: string; email: string; license: string; responsible: string; lat?: number; lng?: number; openingHours?: string; status: PharmacyStatus; badgeIds: number[]; subscription?: 'Basic' | 'Standard' | 'Premium'; publiclyVisible?: boolean; products: number; updated: string; activeUntil?: string; trialEndsAt?: string; subscriptionEndsAt?: string; coverImage?: string };
export type Message = { id: number; pharmacyId: number; threadId?: number; visitorId?: string; sender: string; phone: string; subject: string; body: string; date: string; read: boolean; direction: 'visitor' | 'pharmacy' };
export type Badge = { id: number; name: string; description: string; color: string; icon: string; visible: boolean; expiryDays: number | null; system?: boolean };
export type Payment = { id: number; pharmacyId: number; plan: string; amount: number; period: string; date: string; status: 'En attente' | 'Confirmé' | 'Échoué'; method?: 'Mobile Money' | 'Carte bancaire'; provider?: string; payerPhone?: string; invoiceRef?: string; externalRef?: string };
export type Plan = { name: 'Basic' | 'Standard' | 'Premium'; monthly: number; quarterly: number; yearly: number; description: string; features: string[] };
export type Notice = { id: number; pharmacyId?: number; title: string; body: string; date: string; read: boolean; kind: 'info' | 'success' | 'warning' };
export type Report = { id: number; pharmacyId: number; productId?: number; target: string; reason: string; details: string; date: string; status: 'À traiter' | 'En cours' | 'Résolu' | 'Rejeté' };
export type AuditLog = { id: number; actor: 'Administration' | 'Pharmacie' | 'Visiteur'; action: string; entity: string; entityId?: number; date: string };

export type PharmacyPreferences = { notificationMessages: boolean; subscriptionReminders: boolean; lowStockAlerts: boolean; lowStockThreshold?: number };
export type AppData = { products: Product[]; pharmacies: Pharmacy[]; messages: Message[]; badges: Badge[]; payments: Payment[]; plans: Plan[]; notices: Notice[]; reports: Report[]; auditLogs: AuditLog[]; platformCategories: string[]; freshnessDays: number; preferences: Record<number, PharmacyPreferences> };

export const officialCategories = ['Médicaments', 'Vitamines', 'Hygiène', 'Matériel médical', 'Parapharmacie', 'Bébé & maternité'];

export const seed: AppData = {
  products: [
    { id: 1, pharmacyId: 1, name: 'Paracétamol 500 mg', category: 'Médicaments', brand: 'Sanofi', code: '3400930000012', price: 1500, stock: 42, status: 'Publié', updated: 'Aujourd’hui', description: 'Comprimés — boîte de 16.', imageDataUrl: '/images/prod-paracetamol.jpg', stockHistory: [{ price: 1500, stock: 42, date: 'Aujourd’hui' }] },
    { id: 2, pharmacyId: 1, name: 'Vitamine C 1000 mg', category: 'Vitamines', brand: 'UPSA', code: '3400930000029', price: 3200, stock: 18, status: 'Publié', updated: 'Hier', description: 'Complément vitaminé effervescent.', imageDataUrl: '/images/prod-vitaminc.jpg', stockHistory: [{ price: 3200, stock: 18, date: 'Hier' }] },
    { id: 3, pharmacyId: 1, name: 'Gel hydroalcoolique 100 ml', category: 'Hygiène', brand: 'PharmaCare', code: '', price: 1200, stock: 6, status: 'En attente', updated: 'À l’instant', description: 'Gel désinfectant pour les mains.', imageDataUrl: '/images/prod-gel.jpg', stockHistory: [{ price: 1200, stock: 6, date: 'À l’instant' }] },
    { id: 4, pharmacyId: 1, name: 'Thermomètre digital', category: 'Matériel médical', brand: 'Omron', code: '', price: 4500, stock: 0, status: 'À corriger', updated: '12 nov. 2026', note: 'Merci de confirmer la catégorie et la disponibilité.', description: 'Thermomètre électronique précis.', imageDataUrl: '/images/prod-thermometer.jpg', stockHistory: [{ price: 4500, stock: 0, date: '12 nov. 2026' }] },
    { id: 5, pharmacyId: 1, name: 'Sérum physiologique', category: 'Hygiène', brand: 'Gifrer', code: '', price: 900, stock: 31, status: 'Publié', updated: '10 nov. 2026', description: 'Solution saline stérile en unidoses.', imageDataUrl: '/images/prod-serum.jpg', stockHistory: [{ price: 900, stock: 31, date: '10 nov. 2026' }] },
    { id: 6, pharmacyId: 2, name: 'Crème hydratante', category: 'Parapharmacie', brand: 'Topicrem', code: '', price: 5200, stock: 12, status: 'Publié', updated: 'Aujourd’hui', description: 'Soin dermatologique hydratant.', imageDataUrl: '/images/prod-creme.jpg', stockHistory: [{ price: 5200, stock: 12, date: 'Aujourd’hui' }] },
    { id: 7, pharmacyId: 3, name: 'Masques chirurgicaux', category: 'Matériel médical', brand: 'SafeMed', code: '', price: 2500, stock: 30, status: 'Brouillon', updated: 'Hier', description: 'Boîte de 50 masques haute filtration.', imageDataUrl: '/images/prod-masques.jpg', stockHistory: [{ price: 2500, stock: 30, date: 'Hier' }] },
  ],
  pharmacies: [
    { id: 1, ownerId: 100, name: 'Pharmacie Centrale', city: 'N’Djamena', area: 'Avenue Charles de Gaulle', address: 'Avenue Charles de Gaulle, face Place de la Nation', phone: '+235 66 20 10 01', email: 'contact@centrale.example', license: 'AUT-001-2026', responsible: 'Pharmacien responsable', lat: 12.1131, lng: 15.0492, status: 'Validée', badgeIds: [1, 2], subscription: 'Premium', products: 248, updated: 'Aujourd’hui', coverImage: '/images/pharmacy-1.jpg' },
    { id: 2, ownerId: 200, name: 'Pharmacie du Grand Marché', city: 'N’Djamena', area: 'Quartier Bololo · Grand Marché', address: 'Avenue Mobutu, près de la Grande Mosquée', phone: '+235 66 20 10 02', email: 'grandmarche@example.com', license: 'AUT-002-2026', responsible: 'Pharmacien titulaire', lat: 12.1098, lng: 15.0554, status: 'Validée', badgeIds: [1], subscription: 'Standard', products: 174, updated: 'Hier', coverImage: '/images/pharmacy-2.jpg' },
    { id: 3, ownerId: 300, name: 'Pharmacie Espérance', city: 'N’Djamena', area: 'Quartier Moursal', address: 'Avenue Maldom Bada Abbas, Carrefour Moursal', phone: '+235 66 20 10 03', email: 'esperance@example.com', license: 'AUT-003-2026', responsible: 'Pharmacien responsable', lat: 12.0954, lng: 15.0681, status: 'En vérification', badgeIds: [], subscription: 'Basic', products: 0, updated: '12 nov. 2026', coverImage: '/images/pharmacy-3.jpg' },
  ],
  messages: [
    { id: 1, pharmacyId: 1, sender: 'Ama K.', phone: '+235 66 45 11 22', subject: 'Disponibilité du Paracétamol', body: 'Bonjour, le Paracétamol 500 mg est-il disponible actuellement ?', date: 'Aujourd’hui, 09:42', read: false, direction: 'visitor' },
    { id: 2, pharmacyId: 1, sender: 'Kossi D.', phone: '+235 99 30 44 55', subject: 'Horaire de fermeture', body: 'Bonsoir, à quelle heure fermez-vous ce soir ?', date: 'Hier, 18:10', read: true, direction: 'visitor' },
  ],
  badges: [
    { id: 1, name: 'Pharmacie vérifiée', description: 'Documents administratifs vérifiés par PharmaConnect.', color: 'mint', icon: 'shield', visible: true, expiryDays: null },
    { id: 2, name: 'Partenaire Premium', description: 'Établissement disposant du forfait Premium.', color: 'blue', icon: 'star', visible: true, expiryDays: null },
    { id: 3, name: 'Recommandée', description: 'Badge attribué par l’administration.', color: 'gold', icon: 'award', visible: true, expiryDays: 365 },
  ],
  payments: [],
  reports: [],
  auditLogs: [],
  platformCategories: officialCategories,
  plans: [
    { name: 'Basic', monthly: 5000, quarterly: 13500, yearly: 48000, description: 'Pour démarrer une présence numérique.', features: ['Fiche pharmacie publique', 'Catalogue de produits', 'Mise à jour des prix et stocks', 'Contact direct par téléphone et messagerie'] },
    { name: 'Standard', monthly: 10000, quarterly: 27000, yearly: 96000, description: 'Pour développer votre visibilité.', features: ['Tous les avantages Basic', 'Statistiques de visibilité', 'Notifications et suivi du catalogue', 'Outils de gestion avancés'] },
    { name: 'Premium', monthly: 20000, quarterly: 54000, yearly: 192000, description: 'Pour une gestion complète et prioritaire.', features: ['Tous les avantages Standard', 'Fonctionnalités avancées de soumission et suivi de validation produits', 'Badge Premium personnalisable', 'Accompagnement prioritaire'] },
  ],
  notices: [
    { id: 1, pharmacyId: 1, title: 'Bienvenue sur PharmaConnect', body: 'Votre espace officine est prêt. Complétez votre profil et maintenez vos disponibilités à jour.', date: 'Aujourd’hui', read: false, kind: 'info' },
    { id: 2, pharmacyId: 1, title: 'Produit à corriger', body: 'Le thermomètre digital nécessite une information complémentaire.', date: '12 nov. 2026', read: false, kind: 'warning' },
  ],
  freshnessDays: 7,
  preferences: { 1: { notificationMessages: true, subscriptionReminders: true, lowStockAlerts: false } },
};

export const money = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';
export const dateLabel = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (n: number) => n * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function isProductFresh(value: string, days: number, now = Date.now()) {
  if (value === 'À l’instant' || value === 'Aujourd’hui') return true;
  if (value === 'Hier') return days >= 1;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const age = now - parsed.getTime();
      return age >= 0 && age <= days * 86_400_000;
    }
  }
  const m = value.match(/(\d{1,2})\s+(janv?\.?|févr?\.?|mars|avr?\.?|mai|juin|juil?\.?|août|sept?\.?|oct?\.?|nov?\.?|déc?\.?)\s+(\d{4})/i);
  if (!m) return false;
  const months = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
  const norm = m[2].toLowerCase().replace('.', '');
  const month = months.findIndex(x => norm.startsWith(x));
  if (month < 0) return false;
  const d = new Date(Number(m[3]), month, Number(m[1]));
  const age = Math.floor((new Date(new Date().toDateString()).getTime() - d.getTime()) / 86400000);
  return age >= 0 && age <= days;
}

export const makeId = () => Date.now() + Math.floor(Math.random() * 1000);

export const statusClass = (s: string) => ({
  Publié: 'green', 'En attente': 'amber', 'En vérification': 'amber', 'À corriger': 'red',
  Refusé: 'red', Masqué: 'gray', Suspendu: 'red', Brouillon: 'gray', Archivé: 'gray',
  Validée: 'green', Refusée: 'red', 'Abonnement expiré': 'red', Confirmé: 'green', Échoué: 'red'
} as Record<string, string>)[s] || 'gray';

export function isBadgeActive(pharmacy: Pharmacy, badge: Badge) {
  if (!badge.expiryDays) return true;
  const start = pharmacy.badgeAssignedAt?.[String(badge.id)];
  if (!start) return true;
  return Date.now() <= new Date(start).getTime() + badge.expiryDays * 86400000;
}

export function activeBadges(pharmacy: Pharmacy, badges: Badge[]) {
  return badges.filter(b => b.visible && pharmacy.badgeIds.includes(b.id) && isBadgeActive(pharmacy, b));
}

export function BadgeGlyph({ icon, size = 14 }: { icon: string; size?: number }) {
  if (icon === 'star') return <ModernMetricStarIcon size={size} />;
  if (icon === 'award') return <ModernMetricAwardIcon size={size} />;
  return <ModernVerifiedShieldIcon size={size} />;
}

export function Status({ children }: { children: string }) {
  return <span className={`status-pill ${statusClass(children)}`}>{children}</span>;
}

export function Empty({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon cg-empty-icon-modern">
        <ModernSearchMedicineIcon size={24} />
      </div>
      <b>{title}</b>
      <p>{detail}</p>
      {action}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
  action,
  icon,
  badge
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="cg-page-header animate-fade-in-up">
      <div className="cg-page-header-left">
        <div className="cg-page-header-icon">
          {icon || <ModernSparkleCrownIcon size={24} />}
        </div>
        <div className="cg-page-header-text">
          {(eyebrow || badge) && (
            <div className="cg-page-eyebrow-row">
              {eyebrow && <div className="cg-eyebrow"><span className="cg-pulse-dot" /> {eyebrow}</div>}
              {badge && <span className="cg-header-pill-badge">{badge}</span>}
            </div>
          )}
          <h1 className="cg-page-title">{title}</h1>
          {desc && <p className="cg-page-desc">{desc}</p>}
        </div>
      </div>
      {action && <div className="cg-page-header-action">{action}</div>}
    </div>
  );
}

export function IconButton({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return <button className="icon-action" onClick={onClick} aria-label={label} title={label}>{children}</button>;
}

export function Metric({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: any }) {
  return (
    <div className="metric-card cg-metric-card-modern">
      <div className="cg-metric-card-top">
        <span>{title}</span>
        <span className="cg-metric-icon-modern"><Icon size={19} /></span>
      </div>
      <b>{value}</b>
      <small>{detail}</small>
    </div>
  );
}

export function Modal({ title, children, onClose, wide = false, icon }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean; icon?: React.ReactNode }) {
  const windowRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = windowRef.current;
    const focusables = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      : [];
    if (focusables[0]) {
      focusables[0].focus();
    } else {
      panel?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && panel) {
        const items = Array.from(
          panel.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        ).filter(el => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={windowRef}
        className={`modal-window ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-header">
          <div className="cg-modal-head-left">
            {icon && <div className="cg-modal-icon-badge">{icon}</div>}
            <div>
              <div className="eyebrow">PHARMACONNECT</div>
              <h2 id={titleId}>{title}</h2>
            </div>
          </div>
          <button type="button" className="icon-action" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function isPharmacyActiveAndValid(p: Pharmacy) {
  const expiry = p.activeUntil ?? p.subscriptionEndsAt ?? p.trialEndsAt;
  return p.status === 'Validée' && (p.publiclyVisible === true || Boolean(expiry && new Date(expiry).getTime() > Date.now()));
}

export function isActiveTrial(pharmacy: Pharmacy) {
  return isPharmacyActiveAndValid(pharmacy) && Boolean(pharmacy.trialEndsAt && !pharmacy.subscriptionEndsAt);
}

export function ProductTable({
  rows,
  onEdit,
  onQuickStock,
  onDuplicate,
  onDelete,
  onStatus,
  onRequestModerationNote,
  admin = false,
  pharmacies = [],
}: {
  rows: Product[];
  onEdit?: (p: Product) => void;
  onQuickStock?: (p: Product) => void;
  onDuplicate?: (p: Product) => void;
  onDelete?: (id: number) => void;
  onStatus?: (id: number, s: ProductStatus, note?: string) => void;
  onRequestModerationNote?: (p: Product, s: ProductStatus) => void;
  admin?: boolean;
  pharmacies?: Pharmacy[];
}) {
  const triggerModeration = (p: Product, s: ProductStatus, fallbackNote?: string) => {
    if (onRequestModerationNote) onRequestModerationNote(p, s);
    else onStatus?.(p.id, s, fallbackNote);
  };

  const buildItems = (p: Product): ActionMenuItem[] => {
    const items: ActionMenuItem[] = [];
    if (admin) {
      if (p.status === 'En attente') {
        items.push({ key: 'approve', label: 'Approuver et publier', icon: <Check size={14} />, variant: 'success', onClick: () => onStatus?.(p.id, 'Publié') });
        items.push({ key: 'fix', label: 'Demander correction', icon: <Pencil size={14} />, onClick: () => triggerModeration(p, 'À corriger', 'Correction demandée par l’administration.') });
        items.push({ key: 'refuse', label: 'Refuser', icon: <Ban size={14} />, variant: 'danger', onClick: () => triggerModeration(p, 'Refusé') });
      }
      if (onEdit) {
        items.push({ key: 'edit', label: 'Modifier la fiche', icon: <Pencil size={14} />, onClick: () => onEdit(p) });
      }
      if (p.status === 'Publié') {
        items.push({ key: 'fix-pub', label: 'Demander correction', icon: <Pencil size={14} />, onClick: () => triggerModeration(p, 'À corriger', 'Correction demandée par l’administration.') });
        items.push({ key: 'hide', label: 'Masquer', icon: <EyeOff size={14} />, onClick: () => onStatus?.(p.id, 'Masqué') });
        items.push({ key: 'suspend', label: 'Suspendre', icon: <Ban size={14} />, variant: 'danger', onClick: () => triggerModeration(p, 'Suspendu') });
      }
      if (p.status === 'Masqué' || p.status === 'Suspendu') {
        items.push({ key: 'reactivate', label: 'Réactiver (Publier)', icon: <Eye size={14} />, variant: 'success', onClick: () => onStatus?.(p.id, 'Publié') });
      }
      if (p.status !== 'Archivé') {
        items.push({ key: 'archive', label: 'Archiver', icon: <FileCheck2 size={14} />, onClick: () => onStatus?.(p.id, 'Archivé') });
      }
      if (onDelete) {
        items.push({ key: 'delete', label: 'Supprimer', icon: <Trash2 size={14} />, variant: 'danger', dividerBefore: true, onClick: () => onDelete(p.id) });
      }
    } else {
      if (onEdit && p.status !== 'Refusé' && p.status !== 'Suspendu') {
        items.push({ key: 'edit', label: 'Modifier la fiche', icon: <Pencil size={14} />, onClick: () => onEdit(p) });
      }
      if (onQuickStock && p.status !== 'Refusé' && p.status !== 'Suspendu' && p.status !== 'Archivé') {
        items.push({ key: 'stock', label: 'Mettre à jour stock & prix', icon: <DollarSign size={14} />, onClick: () => onQuickStock(p) });
      }
      if (onDuplicate) {
        items.push({ key: 'duplicate', label: 'Dupliquer en brouillon', icon: <Copy size={14} />, onClick: () => onDuplicate(p) });
      }
      if (onStatus && (p.status === 'Brouillon' || p.status === 'À corriger' || p.status === 'Masqué')) {
        items.push({ key: 'submit', label: 'Soumettre à validation', icon: <Check size={14} />, variant: 'success', onClick: () => onStatus(p.id, 'En attente') });
      }
      if (onStatus && p.status === 'Publié') {
        items.push({ key: 'hide', label: 'Masquer', icon: <EyeOff size={14} />, onClick: () => onStatus(p.id, 'Masqué') });
      }
      if (onStatus && p.status === 'Archivé') {
        items.push({ key: 'restore', label: 'Restaurer en brouillon', icon: <RotateCcw size={14} />, onClick: () => onStatus(p.id, 'Brouillon') });
      }
      if (onStatus && p.status !== 'Archivé') {
        items.push({ key: 'archive', label: 'Archiver', icon: <FileCheck2 size={14} />, onClick: () => onStatus(p.id, 'Archivé') });
      }
      if (onDelete) {
        items.push({ key: 'delete', label: 'Supprimer', icon: <Trash2 size={14} />, variant: 'danger', dividerBefore: true, onClick: () => onDelete(p.id) });
      }
    }
    return items;
  };

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>PRODUIT</th>
            {admin && <th>PHARMACIE</th>}
            <th>CATÉGORIE</th>
            <th>PRIX</th>
            <th>STOCK</th>
            <th>STATUT</th>
            <th>MISE À JOUR</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.id}>
              <td>
                <div className="table-product">
                  <span className="product-thumb">
                    {p.imageDataUrl ? <AuthenticatedImage src={p.imageDataUrl} alt="" /> : <ModernPackageBoxIcon size={17} />}
                  </span>
                  <div>
                    <b>{p.name}</b>
                    <small>{p.brand || 'Marque non renseignée'}{p.note ? ` · ${p.note}` : ''}</small>
                  </div>
                </div>
              </td>
              {admin && <td>{pharmacies.find(x => x.id === p.pharmacyId)?.name || 'Pharmacie Centrale'}</td>}
              <td>{p.category}</td>
              <td>{money(p.price)}</td>
              <td><span className={p.stock > 10 ? 'stock-good' : p.stock > 0 ? 'stock-low' : 'stock-empty'}>{p.stock}</span></td>
              <td><Status>{p.status}</Status></td>
              <td>{p.updated}</td>
              <td>
                <div className="table-actions">
                  <ActionMenu label={`Actions pour ${p.name}`} items={buildItems(p)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty title="Aucun produit" detail="Aucune ligne ne correspond aux filtres sélectionnés." />}
    </div>
  );
}

export function PharmacyTable({
  rows,
  onStatus,
  showDocuments = false,
  onDownloadDocument,
  onInspect,
  onEdit,
  onDelete,
}: {
  rows: Pharmacy[];
  onStatus: (id: number, s: PharmacyStatus) => void;
  showDocuments?: boolean;
  onDownloadDocument?: (docId: number, fileName: string) => void;
  onInspect?: (p: Pharmacy) => void;
  onEdit?: (p: Pharmacy) => void;
  onDelete?: (p: Pharmacy) => void;
}) {
  const buildItems = (p: Pharmacy): ActionMenuItem[] => {
    const items: ActionMenuItem[] = [];
    if (onInspect) {
      items.push({ key: 'inspect', label: 'Voir le dossier', icon: <Eye size={14} />, onClick: () => onInspect(p) });
    }
    if (onEdit) {
      items.push({ key: 'edit', label: 'Modifier l’établissement', icon: <Pencil size={14} />, onClick: () => onEdit(p) });
    }
    if (p.status === 'En attente' || p.status === 'En vérification') {
      items.push({ key: 'validate', label: 'Valider l’agrément', icon: <Check size={14} />, variant: 'success', onClick: () => onStatus(p.id, 'Validée') });
      if (p.status === 'En attente') {
        items.push({ key: 'verify', label: 'Mettre en vérification', icon: <Eye size={14} />, onClick: () => onStatus(p.id, 'En vérification') });
      }
      items.push({ key: 'refuse', label: 'Refuser avec motif', icon: <X size={14} />, variant: 'danger', onClick: () => onStatus(p.id, 'Refusée') });
    }
    if (p.status === 'Validée') {
      items.push({ key: 'suspend', label: 'Suspendre', icon: <Ban size={14} />, variant: 'danger', onClick: () => onStatus(p.id, 'Suspendue') });
      if (p.activeUntil && !isPharmacyActiveAndValid(p)) {
        items.push({ key: 'expire', label: 'Constater l’expiration', icon: <Clock3 size={14} />, onClick: () => onStatus(p.id, 'Abonnement expiré') });
      }
    }
    if (p.status === 'Suspendue') {
      items.push({ key: 'reactivate', label: 'Réactiver', icon: <Check size={14} />, variant: 'success', onClick: () => onStatus(p.id, 'Validée') });
    }
    if (p.status === 'Refusée') {
      items.push({ key: 'reexamine', label: 'Réexaminer', icon: <RotateCcw size={14} />, onClick: () => onStatus(p.id, 'En vérification') });
    }
    if (p.status === 'Abonnement expiré' && !p.subscriptionEndsAt && !p.trialEndsAt) {
      items.push({ key: 'validate-exp', label: 'Valider le dossier', icon: <Check size={14} />, variant: 'success', onClick: () => onStatus(p.id, 'Validée') });
    }
    if (onDelete) {
      items.push({ key: 'delete', label: 'Supprimer l’officine', icon: <Trash2 size={14} />, variant: 'danger', dividerBefore: true, onClick: () => onDelete(p) });
    }
    return items;
  };

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr><th>ÉTABLISSEMENT</th><th>LOCALISATION</th><th>CONTACT</th><th>STATUT</th><th>FORMULE</th><th>ACTIONS</th></tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.id}>
              <td>
                <b>{p.name}</b>
                <small className="table-sub">{p.license} · {p.responsible}</small>
                {p.documents && <small className="table-sub">Pièces choisies : {p.documents}</small>}
                {showDocuments && p.uploadedDocuments && p.uploadedDocuments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {p.uploadedDocuments.map(doc => (
                      <button key={doc.id} type="button" className="mini-action" onClick={() => onDownloadDocument?.(doc.id, doc.fileName)}>
                        {doc.fileName}
                      </button>
                    ))}
                  </div>
                )}
                <small className="table-sub">
                  {p.trialEndsAt
                    ? `Essai jusqu’au ${new Date(p.trialEndsAt).toLocaleDateString('fr-FR')}`
                    : p.subscriptionEndsAt
                      ? `Échéance ${new Date(p.subscriptionEndsAt).toLocaleDateString('fr-FR')}`
                      : 'Échéance à définir'}
                </small>
              </td>
              <td>{p.area}, {p.city}</td>
              <td>{p.phone}<small className="table-sub">{p.email}</small></td>
              <td><Status>{p.status}</Status></td>
              <td>{p.subscription}</td>
              <td>
                <div className="table-actions">
                  <ActionMenu label={`Actions pour ${p.name}`} items={buildItems(p)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty title="Aucune pharmacie" detail="Aucun établissement ne correspond au filtre." />}
    </div>
  );
}

export function PaymentsTable({ payments, admin = false, onStatus, pharmacies = [] }: { payments: Payment[]; admin?: boolean; onStatus?: (id: number, status: 'Confirmé' | 'Échoué') => void; pharmacies?: Pharmacy[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr><th>DATE</th><th>ÉTABLISSEMENT</th><th>FORMULE</th><th>PÉRIODE</th><th>MONTANT</th><th>MOYEN / RÉFÉRENCE</th><th>STATUT</th>{admin && <th>ACTION</th>}</tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td>{p.date}</td>
              <td>{pharmacies.find(x => x.id === p.pharmacyId)?.name || `Pharmacie #${p.pharmacyId}`}</td>
              <td>{p.plan}</td>
              <td>{p.period}</td>
              <td>{money(p.amount)}</td>
              <td>
                {p.method || '—'}{p.provider ? ` · ${p.provider}` : ''}
                {p.invoiceRef && <small className="table-sub">Facture {p.invoiceRef}</small>}
                {p.externalRef && <small className="table-sub">Règlement {p.externalRef}</small>}
              </td>
              <td><Status>{p.status}</Status></td>
              {admin && (
                <td>
                  <div className="table-actions">
                    <ActionMenu
                      label={`Actions paiement ${p.invoiceRef || p.id}`}
                      items={
                        p.status === 'En attente'
                          ? [
                              { key: 'confirm', label: 'Confirmer le paiement', icon: <Check size={14} />, variant: 'success', onClick: () => onStatus?.(p.id, 'Confirmé') },
                              { key: 'fail', label: 'Marquer en échec', icon: <X size={14} />, variant: 'danger', dividerBefore: true, onClick: () => onStatus?.(p.id, 'Échoué') },
                            ]
                          : []
                      }
                    />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && <Empty title="Aucun paiement" detail="Les transactions associées à cet établissement apparaîtront ici." />}
    </div>
  );
}

export function ToggleRow({ title, detail, checked = false, onChange, disabled = false }: { title: string; detail: string; checked?: boolean; onChange?: (value: boolean) => void; disabled?: boolean }) {
  return <div className="toggle-row"><div><b>{title}</b><small>{detail}</small></div><button type="button" className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange?.(!checked)} aria-label={`${checked ? 'Désactiver' : 'Activer'} ${title}`} aria-pressed={checked} disabled={disabled || !onChange}><i /></button></div>;
}

export function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(password);
}

export const PASSWORD_POLICY_ERROR = 'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre.';

export function RuleRow({ title, detail }: { title: string; detail: string }) {
  return <div className="toggle-row"><div><b>{title}</b><small>{detail}</small></div><span className="rule-fixed">Actif</span></div>;
}
