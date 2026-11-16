'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Archive, Check, CheckCircle2, ChevronRight, Download, Eye, EyeOff, Globe2, LogOut, Menu,
  Pencil, Play, Plus, RefreshCw, Trash2, Users, X,
} from 'lucide-react';
import {
  AppData, Badge, Pharmacy, PharmacyStatus, Product, ProductStatus,
  seed, money, BadgeGlyph, Status, Empty,
  SectionTitle, Metric, Modal, ProductTable, PharmacyTable,
  PaymentsTable, RuleRow,
} from '@/lib/shared';
import { ActionMenu } from '@/components/shared/ActionMenu';
import {
  ModernAlertWarningIcon,
  ModernBellAlertIcon,
  ModernBrandLogoIcon,
  ModernChatEncryptedIcon,
  ModernClipboardStockIcon,
  ModernCreditCardPlanIcon,
  ModernDashboardIcon,
  ModernDigitalStoreIcon,
  ModernDocumentCheckIcon,
  ModernEmergency24Icon,
  ModernMetricAwardIcon,
  ModernPackageBoxIcon,
  ModernSearchMedicineIcon,
  ModernSettingsGearIcon,
  ModernSparkleCrownIcon,
  ModernTagCategoryIcon,
  ModernUploadCloudIcon,
  ModernVerifiedShieldIcon,
} from '@/components/shared/ModernIcons';
import {
  AdminContactItem, AdminUserItem, apiAdminAddCategory, apiAdminAuditLogs,
  apiAdminContacts, apiAdminCreatePharmacy, apiAdminCreateProduct, apiAdminCreateUser,
  apiAdminDashboard, apiAdminDeleteBadge, apiAdminDeleteContact, apiAdminDeletePharmacy,
  apiAdminDeleteReport, apiAdminDeleteUser, apiAdminDownloadDocument,
  apiAdminGetHealthSection, apiAdminGetSettings, apiAdminListPharmacies,
  apiAdminRemoveCategory, apiAdminRemoveProduct, apiAdminRenameCategory, apiAdminSaveBadge,
  apiAdminSaveHealthSection, apiAdminSetPharmacyBadge, apiAdminUpdateContact,
  apiAdminUpdatePaymentStatus, apiAdminUpdatePharmacy, apiAdminUpdatePharmacyStatus, apiAdminUpdatePlan,
  apiAdminUpdateProduct, apiAdminUpdateProductStatus, apiAdminUpdateReportStatus, apiAdminUpdateSettings,
  apiAdminUpdateUser, apiAdminUpdateUserStatus, apiAdminUsers, apiLogin, apiMe, clearAuthToken, getAuthToken, reloadOnAuthChange,
  fetchBackendState,
} from '@/lib/api';
import {
  HealthSectionPayload,
} from '@/lib/health-section';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { AdminHealthSectionPanel } from '@/components/admin/AdminHealthSectionPanel';
import { AdminPharmacyDossierModal } from '@/components/admin/AdminPharmacyDossierModal';
import { AdminLoginScreen } from '@/components/admin/AdminLoginScreen';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { PageTransitionStage } from '@/components/shared/MotionStage';

interface PoleTabItem {
  id: string;
  label: string;
  count?: number;
}

function PoleSubNav({
  tabs,
  activePage,
  onSelect,
}: {
  tabs: PoleTabItem[];
  activePage: string;
  onSelect: (page: string) => void;
}) {
  return (
    <nav className="pc-adm-pole-tabs" aria-label="Navigation contextuelle du pôle">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          className={`pc-adm-pole-tab ${activePage === t.id ? 'active' : ''}`}
          onClick={() => onSelect(t.id)}
        >
          <span>{t.label}</span>
          {typeof t.count === 'number' && (
            <em className={t.count > 0 ? 'has-items' : ''}>{t.count}</em>
          )}
        </button>
      ))}
    </nav>
  );
}

const PAGE_POLE_MAP: Record<string, string> = {
  'Tableau de bord': 'Pilotage',
  'Demandes pharmacies': 'Réseau & Catalogue',
  'Pharmacies': 'Réseau & Catalogue',
  'Validation produits': 'Réseau & Catalogue',
  'Comptes utilisateurs': 'Communauté & Santé',
  'Rubrique Santé': 'Communauté & Santé',
  'Abonnements': 'Offre & Référentiel',
  'Formules': 'Offre & Référentiel',
  'Catégories plateforme': 'Offre & Référentiel',
  'Badges': 'Offre & Référentiel',
  'Signalements': 'Vigilance & Système',
  'Messages contact': 'Vigilance & Système',
  'Journal d’activité': 'Vigilance & Système',
  'Paramètres plateforme': 'Vigilance & Système',
};

const emptyAdminData: AppData = {
  ...seed, products: [], pharmacies: [], messages: [], badges: [], payments: [],
  plans: [], notices: [], reports: [], auditLogs: [], preferences: {},
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminIdentity, setAdminIdentity] = useState<{ name: string; email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [data, setData] = useState<AppData>(emptyAdminData);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const space: 'admin' = 'admin';
  const [page, setPage] = useState('Tableau de bord');
  const [query, setQuery] = useState('');
  const [badgePharmacyQuery, setBadgePharmacyQuery] = useState('');
  const [adminTab, setAdminTab] = useState('Tous');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('Tous');
  const [auditActorFilter, setAuditActorFilter] = useState('Tous');
  const [auditQuery, setAuditQuery] = useState('');
  const [freshness, setFreshness] = useState('7');
  const [platformBanner, setPlatformBanner] = useState('');
  const [supportPhone, setSupportPhone] = useState('+235 66 00 00 00');
  const [supportEmail, setSupportEmail] = useState('contact@pharmaconnect.org');
  const [newPlatformCategory, setNewPlatformCategory] = useState('');
  const [notice, setNotice] = useState('');

  const [modal, setModal] = useState<'badge' | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const isVerifiedSystem = editingBadge?.system === true;
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', color: 'mint', icon: 'shield', expiryDays: '', visible: true });
  const [contacts, setContacts] = useState<AdminContactItem[]>([]);
  const [contactNotes, setContactNotes] = useState<Record<number, string>>({});
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<Record<string, number> | null>(null);
  const [serverAuditLogs, setServerAuditLogs] = useState<AppData['auditLogs']>([]);
  const [healthSection, setHealthSection] = useState<HealthSectionPayload>({
    alerts: [],
    news: [],
    emergencyNumbers: [],
  });
  const [healthSaving, setHealthSaving] = useState(false);

  const [inspectedPharmacy, setInspectedPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacyDecision, setPharmacyDecision] = useState<{ pharmacy: Pharmacy; status: PharmacyStatus; note: string } | null>(null);
  const [moderationTarget, setModerationTarget] = useState<{ product: AppData['products'][number]; status: ProductStatus; note: string } | null>(null);
  const [paymentConfirmation, setPaymentConfirmation] = useState<{ id: number; reference: string } | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [planDrafts, setPlanDrafts] = useState<Record<string, { monthly: string; quarterly: string; yearly: string; description: string; features: string }>>({});
  const [pharmacyModal, setPharmacyModal] = useState<{
    mode: 'create' | 'edit';
    pharmacyId?: number;
    name: string;
    city: string;
    area: string;
    address: string;
    phone: string;
    email: string;
    license: string;
    responsible: string;
    subscription: string;
    lat: string;
    lng: string;
  } | null>(null);
  const [productModal, setProductModal] = useState<{
    mode: 'create' | 'edit';
    productId?: number;
    pharmacyId: number;
    name: string;
    category: string;
    brand: string;
    code: string;
    price: string;
    stock: string;
    description: string;
    status: ProductStatus;
  } | null>(null);
  const [renamingCategory, setRenamingCategory] = useState<{ oldName: string; nextName: string } | null>(null);

  useEffect(() => {
    const drafts: Record<string, { monthly: string; quarterly: string; yearly: string; description: string; features: string }> = {};
    for (const p of data.plans) {
      drafts[p.name] = {
        monthly: String(p.monthly),
        quarterly: String(p.quarterly),
        yearly: String(p.yearly),
        description: p.description,
        features: p.features.join('\n'),
      };
    }
    setPlanDrafts(drafts);
  }, [data.plans]);

  const mergeRemoteWithAdmin = (rest: Partial<AppData>, adminPharmacies: any[] = []): AppData => {
    const docsByPharmacy = new Map<number, any[]>();
    for (const ap of adminPharmacies) {
      if (Array.isArray(ap?.uploadedDocuments)) {
        docsByPharmacy.set(ap.id, ap.uploadedDocuments);
      }
    }
    const pharmacies = (rest.pharmacies ?? []).map(ph => ({
      ...ph, uploadedDocuments: docsByPharmacy.get(ph.id) ?? ph.uploadedDocuments,
    }));
    return { ...emptyAdminData, ...rest, pharmacies };
  };

  const loadAllAdminData = async (): Promise<AppData | null> => {
    const token = getAuthToken();
    if (!token) return null;
    const [remote, adminPharmacies, contactList, userList, dash, settingsData, healthCfg, auditList] = await Promise.all([
      fetchBackendState(token),
      apiAdminListPharmacies(),
      apiAdminContacts(),
      apiAdminUsers(),
      apiAdminDashboard(),
      apiAdminGetSettings(),
      apiAdminGetHealthSection(),
      apiAdminAuditLogs({ limit: 300 }),
    ]);
    if (token !== getAuthToken() || !dash) return null;
    setContacts(contactList);
    setUsers(userList);
    if (dash) setDashboardStats(dash);
    if (auditList.length > 0) setServerAuditLogs(auditList);
    if (settingsData) {
      setFreshness(String(settingsData.freshnessDays || 7));
      setPlatformBanner(settingsData.platformBanner || '');
      setSupportPhone(settingsData.supportPhone || '+235 66 00 00 00');
      setSupportEmail(settingsData.supportEmail || 'contact@pharmaconnect.org');
    }
    if (healthCfg) {
      setHealthSection({
        alerts: Array.isArray(healthCfg.alerts) ? healthCfg.alerts : [],
        news: Array.isArray(healthCfg.news) ? healthCfg.news : [],
        emergencyNumbers: Array.isArray(healthCfg.emergencyNumbers) ? healthCfg.emergencyNumbers : [],
        updatedAt: healthCfg.updatedAt,
        updatedBy: healthCfg.updatedBy,
      });
    }
    if (!remote || !dash) return null;
    const { customCategories: _c, ...rest } = remote;
    const merged = mergeRemoteWithAdmin(rest, adminPharmacies);
    setData(merged);
    if (!settingsData) setFreshness(String(merged.freshnessDays || 7));
    return merged;
  };

  const refreshAdminState = async (showSpinner = false): Promise<AppData | null> => {
    if (showSpinner) setRefreshing(true);
    const merged = await loadAllAdminData();
    if (showSpinner) setRefreshing(false);
    if (!merged) {
      say('Impossible de joindre le serveur.');
      return null;
    }
    return merged;
  };

  useEffect(() => {
    let active = true;
    const stopWatchingAuth = reloadOnAuthChange();

    localStorage.removeItem('pharmaconnect-data-v2');

    apiMe().then(async me => {
      if (!active) return;
      if (me?.role === 'ADMIN') {
        sessionStorage.setItem('pharmaconnect-admin-auth', 'true');
        setAdminIdentity({ name: me.name || 'Administrateur', email: me.email });
        setIsAuthenticated(true);
        const merged = await loadAllAdminData();
        if (active && !merged) {
          setNotice('Impossible de charger les données serveur.');
        }
      } else {
        sessionStorage.removeItem('pharmaconnect-admin-auth');
        setIsAuthenticated(false);
      }
      if (active) setReady(true);
    });

    return () => { active = false; stopWatchingAuth(); };
  }, []);

  const say = (s: string) => { setNotice(s); window.setTimeout(() => setNotice(''), 4500); };
  const go = (s: string) => {
    setPage(s);
    setQuery('');
    setAdminTab(s === 'Demandes pharmacies' ? 'Toutes' : 'Tous');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiResult = await apiLogin(loginEmail, loginPassword, 'ADMIN');
    if (apiResult.ok) {
      sessionStorage.setItem('pharmaconnect-admin-auth', 'true');
      setAdminIdentity({
        name: apiResult.data.user.name || 'Administrateur',
        email: apiResult.data.user.email,
      });
      setIsAuthenticated(true);
      setLoginError('');
      const merged = await loadAllAdminData();
      if (!merged) {
        say('Connecté, mais impossible de charger les données serveur.');
      } else {
        say('Connexion administration réussie.');
      }
    } else {
      setLoginError(apiResult.error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pharmaconnect-admin-auth');
    try {
      localStorage.removeItem('pharmaconnect-data-v2');
    } catch { }
    clearAuthToken();
    setData(emptyAdminData);
    setContacts([]);
    setUsers([]);
    setDashboardStats(null);
    setServerAuditLogs([]);
    setAdminIdentity(null);
    setIsAuthenticated(false);
    setLoginPassword('');
  };

  async function executePharmacyStatus(id: number, status: PharmacyStatus, note?: string) {
    const original = data.pharmacies.find(p => p.id === id);
    if (!original) return;
    const res = await apiAdminUpdatePharmacyStatus(id, status, note);
    if (!res.ok) {
      say(res.error);
      return;
    }

    const returnedStatus = res.data.status;
    const startsTrial = Boolean(res.data.trialEndsAt && !original.trialEndsAt && !original.subscriptionEndsAt);
    await refreshAdminState();

    if (returnedStatus === 'Abonnement expiré' && status === 'Validée') {
      say('Réactivation refusée : l’abonnement ou l’essai est expiré.');
    } else if (status === 'Validée' && startsTrial) {
      say('Établissement validé. Votre essai gratuit de 14 jours commence maintenant.');
    } else {
      say(`Établissement ${String(returnedStatus).toLowerCase()}.`);
    }
  }

  function requestPharmacyStatusChange(id: number, status: PharmacyStatus) {
    const target = data.pharmacies.find(p => p.id === id);
    if (target && (status === 'Refusée' || status === 'Suspendue')) {
      setPharmacyDecision({ pharmacy: target, status, note: '' });
      return;
    }
    void executePharmacyStatus(id, status);
  }

  async function productStatus(id: number, status: ProductStatus, note?: string) {
    const expectedModifiedAt = status === 'Publié' ? data.products.find(product => product.id === id)?.modifiedAt : undefined;
    const res = await apiAdminUpdateProductStatus(id, status, note, expectedModifiedAt);
    if (!res.ok) {
      if (status === 'Publié') await refreshAdminState();
      say(res.error);
      return;
    }
    await refreshAdminState();
    say(`Statut du produit mis à jour : ${status}.`);
  }

  async function updateContactStatus(id: number, status: AdminContactItem['status']) {
    const adminNote = contactNotes[id];
    const res = await apiAdminUpdateContact(id, status, adminNote);
    if (!res.ok) {
      say(res.error);
      return;
    }
    setContacts(prev => prev.map(c => (c.id === id ? res.contact : c)));
    say(`Demande de contact marquée « ${status} ».`);
  }

  async function removeProduct(id: number) {
    if (!window.confirm('Supprimer définitivement ce produit ?')) return;
    const res = await apiAdminRemoveProduct(id);
    if (!res.ok) {
      say(res.error);
      return;
    }
    await refreshAdminState();
    say('Produit supprimé.');
  }

  function openCreatePharmacyModal() {
    setPharmacyModal({
      mode: 'create',
      name: '',
      city: '',
      area: '',
      address: '',
      phone: '',
      email: '',
      license: '',
      responsible: '',
      subscription: 'Basic',
      lat: '',
      lng: '',
    });
  }

  function openEditPharmacyModal(p: Pharmacy) {
    setPharmacyModal({
      mode: 'edit',
      pharmacyId: p.id,
      name: p.name,
      city: p.city,
      area: p.area,
      address: p.address,
      phone: p.phone,
      email: p.email,
      license: p.license,
      responsible: p.responsible,
      subscription: p.subscription || 'Basic',
      lat: p.lat === undefined ? '' : String(p.lat),
      lng: p.lng === undefined ? '' : String(p.lng),
    });
  }

  async function handleDeletePharmacy(p: Pharmacy) {
    if (!window.confirm(`Supprimer définitivement l’établissement « ${p.name} » et toutes ses données associées ?`)) return;
    const res = await apiAdminDeletePharmacy(p.id);
    if (!res.ok) {
      say(res.error);
      return;
    }
    await refreshAdminState();
    say('Établissement supprimé.');
  }

  function openCreateProductModal() {
    const firstPharmacyId = data.pharmacies[0]?.id ?? 0;
    if (!firstPharmacyId) {
      say('Créez ou validez d’abord au moins une pharmacie.');
      return;
    }
    setProductModal({
      mode: 'create',
      pharmacyId: firstPharmacyId,
      name: '',
      category: data.platformCategories[0] || officialCategoriesDefault(),
      brand: '',
      code: '',
      price: '0',
      stock: '0',
      description: '',
      status: 'Publié',
    });
  }

  function officialCategoriesDefault() {
    return seed.platformCategories[0] || 'Médicaments';
  }

  function openEditProductModal(p: Product) {
    setProductModal({
      mode: 'edit',
      productId: p.id,
      pharmacyId: p.pharmacyId,
      name: p.name,
      category: p.category,
      brand: p.brand,
      code: p.code,
      price: String(p.price),
      stock: String(p.stock),
      description: p.description,
      status: p.status,
    });
  }

  function paymentStatus(id: number, status: 'Confirmé' | 'Échoué') {
    if (status === 'Confirmé') setPaymentConfirmation({ id, reference: '' });
    else void submitPaymentStatus(id, status);
  }

  async function submitPaymentStatus(id: number, status: 'Confirmé' | 'Échoué', externalRef?: string) {
    const res = await apiAdminUpdatePaymentStatus(id, status, externalRef);
    if (!res.ok) {
      say(res.error);
      return false;
    }
    await refreshAdminState();
    say(status === 'Confirmé' ? 'Paiement confirmé et abonnement prolongé.' : 'Paiement marqué en échec.');
    return true;
  }

  async function saveBadge(e: React.FormEvent) {
    e.preventDefault();
    const parsedExpiry = badgeForm.expiryDays ? Number(badgeForm.expiryDays) : null;
    if (parsedExpiry !== null && (!Number.isFinite(parsedExpiry) || parsedExpiry < 1)) {
      say('La durée d’expiration du badge doit être supérieure ou égale à 1 jour.');
      return;
    }
    const res = await apiAdminSaveBadge(editingBadge?.id || null, {
      name: badgeForm.name.trim(),
      description: badgeForm.description.trim(),
      color: badgeForm.color,
      icon: badgeForm.icon,
      visible: isVerifiedSystem ? true : badgeForm.visible,
      expiryDays: isVerifiedSystem ? null : parsedExpiry,
    });
    if (!res.ok) {
      say(res.error);
      return;
    }
    setModal(null);
    setEditingBadge(null);
    await refreshAdminState();
    say('Badge enregistré.');
  }

  async function setPharmacyBadge(pharmacy: number, badge: number, checked: boolean) {
    const target = data.pharmacies.find(p => p.id === pharmacy);
    if (!checked && badge === 1 && target?.status === 'Validée') {
      say('Le badge « Pharmacie vérifiée » est obligatoire pour tout établissement validé.');
      return;
    }
    const res = await apiAdminSetPharmacyBadge(pharmacy, badge, checked);
    if (!res.ok) {
      say(res.error);
      return;
    }
    await refreshAdminState();
    say(checked ? 'Badge attribué.' : 'Badge retiré.');
  }

  const pendingPharmacies = useMemo(() => data.pharmacies.filter(p => ['En attente', 'En vérification'].includes(p.status)), [data]);
  const pendingProducts = useMemo(() => data.products.filter(p => p.status === 'En attente'), [data]);
  const pendingPaymentsList = useMemo(() => data.payments.filter(p => p.status === 'En attente'), [data]);
  const openReportsList = useMemo(() => data.reports.filter(r => ['À traiter', 'En cours'].includes(r.status)), [data]);
  const openContactsCount = useMemo(() => contacts.filter(c => ['Nouveau', 'En cours'].includes(c.status)).length, [contacts]);
  const confirmedRevenue = useMemo(
    () =>
      dashboardStats?.confirmedRevenue ??
      data.payments.filter(p => p.status === 'Confirmé').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [dashboardStats, data.payments],
  );

  const combinedAuditLogs = useMemo(() => {
    const base = serverAuditLogs.length > 0 ? serverAuditLogs : data.auditLogs || [];
    const q = auditQuery.trim().toLowerCase();
    return base.filter(l => {
      if (auditActorFilter !== 'Tous' && l.actor !== auditActorFilter) return false;
      if (!q) return true;
      return `${l.actor} ${l.action} ${l.entity} ${l.entityId ?? ''} ${l.date}`.toLowerCase().includes(q);
    });
  }, [serverAuditLogs, data.auditLogs, auditActorFilter, auditQuery]);

  const navGroups: Array<{ label: string; items: Array<[string, any, number?]> }> = [
    {
      label: 'PILOTAGE',
      items: [
        ['Tableau de bord', ModernDashboardIcon],
      ],
    },
    {
      label: 'RÉSEAU & CATALOGUE',
      items: [
        ['Demandes pharmacies', ModernDocumentCheckIcon, pendingPharmacies.length],
        ['Pharmacies', ModernDigitalStoreIcon],
        ['Validation produits', ModernPackageBoxIcon, pendingProducts.length],
      ],
    },
    {
      label: 'COMMUNAUTÉ & SANTÉ',
      items: [
        ['Comptes utilisateurs', Users],
        ['Rubrique Santé', ModernBellAlertIcon],
      ],
    },
    {
      label: 'OFFRE & RÉFÉRENTIEL',
      items: [
        ['Abonnements', ModernCreditCardPlanIcon, pendingPaymentsList.length],
        ['Formules', ModernSparkleCrownIcon],
        ['Catégories plateforme', ModernTagCategoryIcon],
        ['Badges', ModernMetricAwardIcon],
      ],
    },
    {
      label: 'VIGILANCE & SYSTÈME',
      items: [
        ['Signalements', ModernAlertWarningIcon, openReportsList.length],
        ['Messages contact', ModernChatEncryptedIcon, openContactsCount],
        ['Journal d’activité', ModernClipboardStockIcon],
        ['Paramètres plateforme', ModernSettingsGearIcon],
      ],
    },
  ];

  function navButton(label: string, Icon: any, badgeCount?: number) {
    return (
      <button key={label} className={`side-link ${page === label ? 'active' : ''}`} onClick={() => { go(label); document.body.classList.remove('nav-open'); }}>
        <Icon size={17} />
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <span className="side-badge">{badgeCount}</span>
        )}
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginScreen
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        loginError={loginError}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const urgentItemsTotal =
    pendingPharmacies.length + pendingProducts.length + pendingPaymentsList.length + openReportsList.length + openContactsCount;
  const activePole = PAGE_POLE_MAP[page] || 'Gouvernance';
  const adminInitials = (adminIdentity?.name || 'AD')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || 'AD';

  const filteredBadgePharmacies = data.pharmacies.filter(p => {
    const q = badgePharmacyQuery.trim().toLowerCase();
    if (!q) return true;
    return `${p.name} ${p.city} ${p.area} ${p.status}`.toLowerCase().includes(q);
  });

  return (
    <div className="site-root pc-admin-shell" data-space={space === 'admin' ? 'admin' : 'public'}>
      <div className="workspace">
        <aside className="workspace-sidebar">
          <div className="workspace-side-top">
            <div className="side-brand-icon"><ModernBrandLogoIcon size={21} /></div>
            <div>
              <b>PHARMA<span>CONNECT</span></b>
              <small>Administration Centrale</small>
            </div>
            <button
              type="button"
              className="mobile-close"
              onClick={() => document.body.classList.remove('nav-open')}
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="workspace-switch">
            <a href="/" className="pc-adm-public-link">
              <Globe2 size={15} />
              <span>Voir le site public</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </a>
          </div>

          <div className="pc-adm-nav-scroll">
            {navGroups.map(group => (
              <div className="nav-group" key={group.label}>
                <div className="nav-group-label">{group.label}</div>
                {group.items.map(([label, Icon, count]) => navButton(label, Icon, count))}
              </div>
            ))}
          </div>

          <div className="sidebar-bottom">
            <div className="pc-adm-side-status">
              <div>
                <span className="cg-pulse-dot" />
                <b>{urgentItemsTotal} action(s) en attente</b>
              </div>
              <small>Agréments, produits, vigilance</small>
            </div>
            <div className="account-mini">
              <div className="avatar" style={{ background: '#2b826f', color: '#fff' }}>{adminInitials}</div>
              <div>
                <b>{adminIdentity?.name || 'Administrateur'}</b>
                <small>{adminIdentity?.email || 'Gouvernance plateforme'}</small>
              </div>
              <button type="button" onClick={handleLogout} title="Déconnexion de l'administration">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        <div className="workspace-main">
          <header className="workspace-topbar">
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => document.body.classList.toggle('nav-open')}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>

            <div className="breadcrumbs">
              <span>Administration</span>
              <ChevronRight size={14} />
              <span>{activePole}</span>
              <ChevronRight size={14} />
              <strong>{page}</strong>
            </div>

            <div className="topbar-tools">
              <div className="pc-adm-topbar-alerts">
                {pendingPharmacies.length > 0 && (
                  <button type="button" className="pc-adm-top-pill warn" onClick={() => go('Demandes pharmacies')}>
                    {pendingPharmacies.length} agrément(s)
                  </button>
                )}
                {pendingProducts.length > 0 && (
                  <button type="button" className="pc-adm-top-pill warn" onClick={() => go('Validation produits')}>
                    {pendingProducts.length} produit(s)
                  </button>
                )}
                {openReportsList.length > 0 && (
                  <button type="button" className="pc-adm-top-pill danger" onClick={() => go('Signalements')}>
                    {openReportsList.length} signalement(s)
                  </button>
                )}
              </div>

              <button
                type="button"
                className="icon-action pc-adm-icon-btn"
                onClick={() => refreshAdminState(true)}
                title="Actualiser depuis le serveur"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                className="icon-action pc-adm-icon-btn"
                onClick={() => go('Paramètres plateforme')}
                title="Paramètres généraux"
              >
                <ModernSettingsGearIcon size={17} />
              </button>
              <div className="account-chip" style={{ cursor: 'default' }}>
                <span className="avatar" style={{ background: '#2b826f', color: '#fff' }}>{adminInitials}</span>
                <span>
                  <b>{adminIdentity?.name || 'Administrateur'}</b>
                  <small>Gouvernance centrale</small>
                </span>
              </div>
              <button
                type="button"
                className="outline-btn pc-adm-quit-btn"
                onClick={handleLogout}
                title="Déconnexion"
              >
                <LogOut size={14} /> Quitter
              </button>
            </div>
          </header>

          <main className="workspace-content">
            {notice && (
              <div className="toast">
                <CheckCircle2 size={17} />{notice}
                <button type="button" onClick={() => setNotice('')}><X size={15} /></button>
              </div>
            )}

            <PageTransitionStage routeKey={`adm-${page}`}>
            {page === 'Tableau de bord' && (
              <AdminDashboardView
                data={data}
                pendingPharmacies={pendingPharmacies}
                pendingProducts={pendingProducts}
                pendingPaymentsCount={pendingPaymentsList.length}
                openReportsCount={openReportsList.length}
                openContactsCount={openContactsCount}
                confirmedRevenue={confirmedRevenue}
                usersCount={users.length || dashboardStats?.usersCount || 0}
                auditLogs={combinedAuditLogs}
                healthSection={healthSection}
                onNavigate={go}
                onInspectPharmacy={setInspectedPharmacy}
                onApprovePharmacy={id => void executePharmacyStatus(id, 'Validée')}
                onApproveProduct={(id, status) => void productStatus(id, status)}
              />
            )}

            {page === 'Demandes pharmacies' && (
              <>
                <SectionTitle
                  eyebrow="RÉSEAU & CATALOGUE · AGRÉMENTS"
                  title="Demandes d’agrément pharmacies"
                  desc="Vérifiez les justificatifs officiels, examinez chaque dossier complet et motivez les décisions."
                  icon={<ModernDocumentCheckIcon size={24} />}
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Demandes pharmacies', label: 'Agréments & validation', count: pendingPharmacies.length },
                    { id: 'Pharmacies', label: 'Annuaire complet', count: data.pharmacies.length },
                    { id: 'Validation produits', label: 'Modération produits', count: pendingProducts.length },
                  ]}
                />
                <div className="admin-filter-row">
                  {['Toutes', 'En attente', 'En vérification', 'Validée', 'Refusée'].map(s => (
                    <button key={s} type="button" className={adminTab === s ? 'active' : ''} onClick={() => setAdminTab(s)}>
                      {s} ({s === 'Toutes' ? data.pharmacies.length : data.pharmacies.filter(p => p.status === s).length})
                    </button>
                  ))}
                </div>
                <section className="panel cg-modern-panel">
                  <PharmacyTable
                    rows={data.pharmacies.filter(p => adminTab === 'Toutes' || p.status === adminTab)}
                    onStatus={requestPharmacyStatusChange}
                    onInspect={setInspectedPharmacy}
                    onEdit={openEditPharmacyModal}
                    onDelete={handleDeletePharmacy}
                    showDocuments
                    onDownloadDocument={async (docId, fileName) => {
                      const res = await apiAdminDownloadDocument(docId, fileName);
                      if (!res.ok) say(res.error);
                    }}
                  />
                </section>
              </>
            )}

            {page === 'Pharmacies' && (
              <>
                <SectionTitle
                  eyebrow="RÉSEAU & CATALOGUE · ANNUAIRE"
                  title="Gestion des pharmacies"
                  desc="Consultez l’ensemble des officines, inspectez leurs dossiers et gérez leur état d’exploitation."
                  icon={<ModernDigitalStoreIcon size={24} />}
                  action={
                    <button type="button" className="primary-btn" onClick={openCreatePharmacyModal}>
                      <Plus size={15} /> Ajouter une pharmacie
                    </button>
                  }
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Demandes pharmacies', label: 'Agréments & validation', count: pendingPharmacies.length },
                    { id: 'Pharmacies', label: 'Annuaire complet', count: data.pharmacies.length },
                    { id: 'Validation produits', label: 'Modération produits', count: pendingProducts.length },
                  ]}
                />
                <div className="toolbar">
                  <label className="search-box">
                    <ModernSearchMedicineIcon size={17} />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une pharmacie par nom, ville ou quartier…" />
                  </label>
                  <select value={adminTab} onChange={e => setAdminTab(e.target.value)}>
                    <option>Tous</option>
                    {['Validée', 'En attente', 'En vérification', 'Suspendue', 'Abonnement expiré', 'Refusée'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <section className="panel cg-modern-panel">
                  <PharmacyTable
                    rows={data.pharmacies.filter(p => (adminTab === 'Tous' || p.status === adminTab) && (!query || `${p.name} ${p.city} ${p.area}`.toLowerCase().includes(query.toLowerCase())))}
                    onStatus={requestPharmacyStatusChange}
                    onInspect={setInspectedPharmacy}
                    onEdit={openEditPharmacyModal}
                    onDelete={handleDeletePharmacy}
                    showDocuments
                    onDownloadDocument={async (docId, fileName) => {
                      const res = await apiAdminDownloadDocument(docId, fileName);
                      if (!res.ok) say(res.error);
                    }}
                  />
                </section>
              </>
            )}

            {page === 'Validation produits' && (
              <>
                <SectionTitle
                  eyebrow="RÉSEAU & CATALOGUE · MODÉRATION"
                  title="Validation des produits"
                  desc="Approuvez, demandez une correction ou refusez les fiches produits avant publication publique."
                  icon={<ModernPackageBoxIcon size={24} />}
                  action={
                    <button type="button" className="primary-btn" onClick={openCreateProductModal}>
                      <Plus size={15} /> Ajouter un produit
                    </button>
                  }
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Demandes pharmacies', label: 'Agréments & validation', count: pendingPharmacies.length },
                    { id: 'Pharmacies', label: 'Annuaire complet', count: data.pharmacies.length },
                    { id: 'Validation produits', label: 'Modération produits', count: pendingProducts.length },
                  ]}
                />
                <div className="toolbar">
                  <label className="search-box">
                    <ModernSearchMedicineIcon size={17} />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un produit, marque ou pharmacie…" />
                  </label>
                </div>
                <div className="admin-filter-row">
                  {['Tous', 'En attente', 'À corriger', 'Publié', 'Refusé', 'Masqué', 'Suspendu', 'Archivé'].map(s => (
                    <button key={s} type="button" className={adminTab === s ? 'active' : ''} onClick={() => setAdminTab(s)}>
                      {s} ({s === 'Tous' ? data.products.length : data.products.filter(p => p.status === s).length})
                    </button>
                  ))}
                </div>
                <section className="panel cg-modern-panel">
                  <ProductTable
                    rows={data.products.filter(p => (adminTab === 'Tous' || p.status === adminTab) && (!query || `${p.name} ${p.brand} ${p.code} ${data.pharmacies.find(ph => ph.id === p.pharmacyId)?.name || ''}`.toLowerCase().includes(query.toLowerCase())))}
                    onEdit={openEditProductModal}
                    onStatus={productStatus}
                    onRequestModerationNote={(product, status) => setModerationTarget({ product, status, note: product.note || '' })}
                    onDelete={removeProduct}
                    admin
                    pharmacies={data.pharmacies}
                  />
                </section>
              </>
            )}

            {page === 'Comptes utilisateurs' && (
              <AdminUsersPanel
                users={users}
                loading={usersLoading}
                onRefresh={async () => {
                  setUsersLoading(true);
                  const list = await apiAdminUsers();
                  setUsers(list);
                  setUsersLoading(false);
                  say('Liste des comptes actualisée.');
                }}
                onToggleStatus={async (userId, active, reason) => {
                  const res = await apiAdminUpdateUserStatus(userId, active, reason);
                  if (!res.ok) {
                    say(res.error);
                    return;
                  }
                  setUsers(prev => prev.map(u => (u.id === userId ? res.data : u)));
                  await refreshAdminState();
                  say(active ? 'Compte utilisateur réactivé.' : 'Compte suspendu et sessions révoquées.');
                }}
                onCreateUser={async (payload) => {
                  const res = await apiAdminCreateUser(payload);
                  if (!res.ok) {
                    say(res.error);
                    return false;
                  }
                  setUsers(prev => [...prev, res.data]);
                  await refreshAdminState();
                  say('Compte utilisateur créé.');
                  return true;
                }}
                onUpdateUser={async (userId, payload) => {
                  const res = await apiAdminUpdateUser(userId, payload);
                  if (!res.ok) {
                    say(res.error);
                    return false;
                  }
                  setUsers(prev => prev.map(u => (u.id === userId ? res.data : u)));
                  await refreshAdminState();
                  say('Compte utilisateur mis à jour.');
                  return true;
                }}
                onDeleteUser={async (userId) => {
                  const res = await apiAdminDeleteUser(userId);
                  if (!res.ok) {
                    say(res.error);
                    return;
                  }
                  setUsers(prev => prev.filter(u => u.id !== userId));
                  await refreshAdminState();
                  say('Compte utilisateur supprimé.');
                }}
              />
            )}

            {page === 'Catégories plateforme' && (
              <>
                <SectionTitle
                  eyebrow="OFFRE & RÉFÉRENTIEL · TAXONOMIE"
                  title="Catégories de la plateforme"
                  desc="Gérez le référentiel officiel partagé dans le catalogue public et les espaces officines."
                  icon={<ModernTagCategoryIcon size={24} />}
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Catégories plateforme', label: 'Catégories officielles', count: data.platformCategories.length },
                    { id: 'Badges', label: 'Badges & Distinctions', count: data.badges.length },
                  ]}
                />
                <div className="pc-adm-split-grid">
                  <section className="panel cg-modern-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Ajouter une catégorie officielle</h3>
                        <p>Disponible immédiatement pour toutes les pharmacies du réseau.</p>
                      </div>
                    </div>
                    <form className="inline-create" onSubmit={async e => {
                      e.preventDefault();
                      const value = newPlatformCategory.trim();
                      if (!value) return;
                      if (data.platformCategories.some(c => c.toLowerCase() === value.toLowerCase())) {
                        say('Cette catégorie existe déjà.');
                        return;
                      }
                      const res = await apiAdminAddCategory(value);
                      if (!res.ok) {
                        say(res.error);
                        return;
                      }
                      setNewPlatformCategory('');
                      await refreshAdminState();
                      say('Catégorie officielle créée.');
                    }}>
                      <input value={newPlatformCategory} onChange={e => setNewPlatformCategory(e.target.value)} placeholder="Nom de la catégorie officielle" />
                      <button type="submit" className="primary-btn"><Plus size={14} /> Ajouter</button>
                    </form>
                    <div className="info-note" style={{ marginTop: 14 }}>
                      <ModernVerifiedShieldIcon size={17} /> Les catégories personnalisées ajoutées par une pharmacie restent privées à son espace et n’altèrent pas le référentiel officiel.
                    </div>
                  </section>

                  <section className="panel cg-modern-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Référentiel actif ({data.platformCategories.length})</h3>
                        <p>Nombre de produits rattachés à chaque catégorie.</p>
                      </div>
                    </div>
                    <div className="pc-adm-cat-list">
                      {data.platformCategories.map(c => {
                        const usageCount = data.products.filter(p => p.category === c).length;
                        return (
                          <div className="pc-adm-cat-row" key={c}>
                            <span className="pc-adm-cat-icon"><ModernTagCategoryIcon size={17} /></span>
                            <div className="pc-adm-cat-meta">
                              <b>{c}</b>
                              <small>{usageCount} produit(s) associés</small>
                            </div>
                            <span className="pc-role-chip">Officielle</span>
                            <ActionMenu
                              label={`Actions pour ${c}`}
                              items={[
                                {
                                  key: 'rename',
                                  label: 'Renommer',
                                  icon: <Pencil size={14} />,
                                  onClick: () => setRenamingCategory({ oldName: c, nextName: c }),
                                },
                                {
                                  key: 'delete',
                                  label: 'Supprimer',
                                  icon: <Trash2 size={14} />,
                                  variant: 'danger',
                                  dividerBefore: true,
                                  onClick: async () => {
                                    if (data.platformCategories.length <= 1) {
                                      say('Au moins une catégorie officielle doit être conservée.');
                                      return;
                                    }
                                    if (window.confirm(`Retirer la catégorie ${c} du référentiel ?`)) {
                                      const res = await apiAdminRemoveCategory(c);
                                      if (!res.ok) {
                                        say(res.error);
                                        return;
                                      }
                                      await refreshAdminState();
                                      say('Catégorie retirée du référentiel.');
                                    }
                                  },
                                },
                              ]}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </>
            )}

            {page === 'Badges' && (
              <>
                <SectionTitle
                  eyebrow="OFFRE & RÉFÉRENTIEL · DISTINCTIONS"
                  title="Badges & distinctions"
                  desc="Créez, configurez et attribuez des badges officiels aux fiches pharmacies vérifiées."
                  icon={<ModernMetricAwardIcon size={24} />}
                  action={
                    <button type="button" className="primary-btn" onClick={() => {
                      setEditingBadge(null);
                      setBadgeForm({ name: '', description: '', color: 'mint', icon: 'shield', expiryDays: '', visible: true });
                      setModal('badge');
                    }}><Plus size={15} /> Créer un badge</button>
                  }
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Catégories plateforme', label: 'Catégories officielles', count: data.platformCategories.length },
                    { id: 'Badges', label: 'Badges & Distinctions', count: data.badges.length },
                  ]}
                />
                <div className="badge-admin-grid">
                  {data.badges.map(b => (
                    <div className="panel cg-modern-panel badge-admin-card pc-adm-badge-card" key={b.id}>
                      <div className="pc-adm-badge-top">
                        <span className={`badge-emblem ${b.color}`}><BadgeGlyph icon={b.icon} size={23} /></span>
                        <Status>{b.visible ? 'Publié' : 'Masqué'}</Status>
                      </div>
                      <b>{b.name}</b>
                      <p>{b.description || 'Badge distinctif officiel PharmaConnect.'}</p>
                      <small>{b.expiryDays ? `Durée indicative : ${b.expiryDays} jours` : 'Permanent / Sans expiration'}</small>
                      <div className="pc-adm-badge-actions">
                        <ActionMenu
                          label={`Actions pour ${b.name}`}
                          items={[
                            {
                              key: 'edit',
                              label: 'Modifier le badge',
                              icon: <Pencil size={14} />,
                              onClick: () => {
                                setEditingBadge(b);
                                setBadgeForm({ name: b.name, description: b.description, color: b.color, icon: b.icon, expiryDays: b.expiryDays ? String(b.expiryDays) : '', visible: b.visible });
                                setModal('badge');
                              },
                            },
                            ...(!b.system ? [{
                              key: 'toggle-visibility',
                              label: b.visible ? 'Masquer sur les fiches' : 'Afficher sur les fiches',
                              icon: b.visible ? <EyeOff size={14} /> : <Eye size={14} />,
                              onClick: async () => {
                                const res = await apiAdminSaveBadge(b.id, {
                                  name: b.name,
                                  description: b.description,
                                  color: b.color,
                                  icon: b.icon,
                                  visible: !b.visible,
                                  expiryDays: b.expiryDays ?? null,
                                });
                                if (!res.ok) { say(res.error); return; }
                                await refreshAdminState();
                                say(b.visible ? 'Badge masqué.' : 'Badge affiché.');
                              },
                            }] : []),
                            {
                              key: 'delete',
                              label: 'Supprimer',
                              icon: <Trash2 size={14} />,
                              variant: 'danger',
                              dividerBefore: true,
                              onClick: async () => {
                                if (b.system) {
                                  say('Le badge de vérification est obligatoire et ne peut pas être supprimé.');
                                  return;
                                }
                                if (window.confirm('Supprimer ce badge ?')) {
                                  const res = await apiAdminDeleteBadge(b.id);
                                  if (!res.ok) {
                                    say(res.error);
                                    return;
                                  }
                                  await refreshAdminState();
                                  say('Badge supprimé.');
                                }
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <section className="panel cg-modern-panel" style={{ marginTop: 18 }}>
                  <div className="panel-heading">
                    <div>
                      <h3>Attribution des badges par officine</h3>
                      <p>La vérification administrative reste indépendante de la formule d’abonnement.</p>
                    </div>
                    <label className="search-box" style={{ maxWidth: 300, minWidth: 200 }}>
                      <ModernSearchMedicineIcon size={16} />
                      <input
                        value={badgePharmacyQuery}
                        onChange={e => setBadgePharmacyQuery(e.target.value)}
                        placeholder="Filtrer une pharmacie…"
                      />
                    </label>
                  </div>
                  {filteredBadgePharmacies.map(p => (
                    <div className="assign-badges-row" key={p.id}>
                      <div><b>{p.name}</b><small>{p.city} · {p.status}</small></div>
                      <div className="assign-options">
                        {data.badges.map(b => (
                          <label key={b.id}>
                            <input type="checkbox" checked={p.badgeIds.includes(b.id)} onChange={e => setPharmacyBadge(p.id, b.id, e.target.checked)} />
                            {b.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredBadgePharmacies.length === 0 && (
                    <Empty title="Aucune pharmacie trouvée" detail="Ajustez votre recherche d’établissement." />
                  )}
                </section>
              </>
            )}

            {page === 'Rubrique Santé' && (
              <AdminHealthSectionPanel
                section={healthSection}
                saving={healthSaving}
                onSave={async (nextSection) => {
                  setHealthSaving(true);
                  const res = await apiAdminSaveHealthSection(nextSection);
                  setHealthSaving(false);
                  if (!res.ok) {
                    say(res.error);
                    return;
                  }
                  setHealthSection(res.data as HealthSectionPayload);
                  await refreshAdminState();
                  say('Rubrique Santé enregistrée et publiée sur le site public.');
                }}
              />
            )}

            {page === 'Abonnements' && (
              <>
                <SectionTitle
                  eyebrow="OFFRE & RÉFÉRENTIEL · FINANCES"
                  title="Abonnements & paiements"
                  desc="Suivez les formules actives, les revenus confirmés, les paiements en attente et les essais gratuits."
                  icon={<ModernCreditCardPlanIcon size={24} />}
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Abonnements', label: 'Paiements & Abonnements', count: pendingPaymentsList.length },
                    { id: 'Formules', label: 'Grille tarifaire (Formules)', count: data.plans.length },
                  ]}
                />
                <div className="metric-grid">
                  <Metric title="Revenu confirmé" value={money(confirmedRevenue)} detail="Transactions validées" icon={ModernCreditCardPlanIcon} />
                  <Metric title="Paiements à confirmer" value={String(pendingPaymentsList.length)} detail="Vérification prestataire requise" icon={ModernEmergency24Icon} />
                  <Metric title="Pharmacies Premium" value={String(data.pharmacies.filter(p => p.subscription === 'Premium').length)} detail="Formule enregistrée" icon={ModernSparkleCrownIcon} />
                  <Metric title="Essais gratuits actifs" value={String(data.pharmacies.filter(p => p.status === 'Validée' && !p.subscriptionEndsAt && p.trialEndsAt && new Date(p.trialEndsAt).getTime() > Date.now()).length)} detail="Période de 14 jours" icon={ModernVerifiedShieldIcon} />
                </div>
                <div className="admin-filter-row">
                  {['Tous', 'En attente', 'Confirmé', 'Échoué'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={paymentStatusFilter === st ? 'active' : ''}
                      onClick={() => setPaymentStatusFilter(st)}
                    >
                      {st} ({st === 'Tous' ? data.payments.length : data.payments.filter(p => p.status === st).length})
                    </button>
                  ))}
                </div>
                <section className="panel cg-modern-panel">
                  <PaymentsTable
                    payments={data.payments.filter(p => paymentStatusFilter === 'Tous' || p.status === paymentStatusFilter)}
                    admin
                    onStatus={paymentStatus}
                    pharmacies={data.pharmacies}
                  />
                </section>
                <div className="info-note">
                  <ModernVerifiedShieldIcon size={17} /> La confirmation automatique provient du webhook signé de la passerelle Mobile Money. La validation manuelle est enregistrée dans le journal d’audit.
                </div>
              </>
            )}

            {page === 'Formules' && (
              <>
                <SectionTitle
                  eyebrow="OFFRE & RÉFÉRENTIEL · TARIFICATION"
                  title="Gestion des formules"
                  desc="Définissez les tarifs officiels (FCFA) appliqués lors de chaque demande de paiement."
                  icon={<ModernSparkleCrownIcon size={24} />}
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Abonnements', label: 'Paiements & Abonnements', count: pendingPaymentsList.length },
                    { id: 'Formules', label: 'Grille tarifaire (Formules)', count: data.plans.length },
                  ]}
                />
                <div className="pricing-grid">
                  {data.plans.map(p => {
                    const draft = planDrafts[p.name] || {
                      monthly: String(p.monthly),
                      quarterly: String(p.quarterly),
                      yearly: String(p.yearly),
                      description: p.description,
                      features: p.features.join('\n'),
                    };
                    const updateDraft = (patch: Partial<typeof draft>) => {
                      setPlanDrafts(prev => ({ ...prev, [p.name]: { ...draft, ...patch } }));
                    };
                    return (
                      <div className="price-card cg-price-card-modern pc-adm-plan-card" key={p.name}>
                        <div className="pc-adm-plan-head">
                          <div>
                            <div className="eyebrow">FORMULE</div>
                            <h2>{p.name}</h2>
                          </div>
                          <span className="pc-role-chip">{money(Number(draft.monthly) || 0)}/mois</span>
                        </div>
                        <label>Mensuel (FCFA)<input type="number" min="0" value={draft.monthly} onChange={e => updateDraft({ monthly: e.target.value })} /></label>
                        <label>Trimestriel (FCFA)<input type="number" min="0" value={draft.quarterly} onChange={e => updateDraft({ quarterly: e.target.value })} /></label>
                        <label>Annuel (FCFA)<input type="number" min="0" value={draft.yearly} onChange={e => updateDraft({ yearly: e.target.value })} /></label>
                        <label>Description<textarea value={draft.description} onChange={e => updateDraft({ description: e.target.value })} /></label>
                        <label>Fonctionnalités (une par ligne)<textarea rows={5} value={draft.features} onChange={e => updateDraft({ features: e.target.value })} /></label>
                        <button
                          type="button"
                          className="primary-btn"
                          style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                          onClick={async () => {
                            const monthly = Number(draft.monthly);
                            const quarterly = Number(draft.quarterly);
                            const yearly = Number(draft.yearly);
                            if (!Number.isFinite(monthly) || monthly < 0 || !Number.isFinite(quarterly) || quarterly < 0 || !Number.isFinite(yearly) || yearly < 0) {
                              say('Les tarifs doivent être des montants valides (>= 0).');
                              return;
                            }
                            const res = await apiAdminUpdatePlan(p.name, {
                              monthly,
                              quarterly,
                              yearly,
                              description: draft.description.trim(),
                              features: draft.features.split('\n').map(v => v.trim()).filter(Boolean),
                            });
                            if (!res.ok) {
                              say(res.error);
                              return;
                            }
                            await refreshAdminState();
                            say(`Formule ${p.name} enregistrée.`);
                          }}
                        >
                          Enregistrer {p.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {page === 'Signalements' && (
              <>
                <SectionTitle
                  eyebrow="VIGILANCE & SYSTÈME · QUALITÉ"
                  title="Signalements"
                  desc="Traitez les signalements portant sur un établissement ou des informations publiées."
                  icon={<ModernAlertWarningIcon size={24} />}
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Signalements', label: 'Signalements publics', count: openReportsList.length },
                    { id: 'Messages contact', label: 'Messages de contact', count: openContactsCount },
                  ]}
                />
                <div className="admin-filter-row">
                  {['Tous', 'À traiter', 'En cours', 'Résolu', 'Rejeté'].map(s => (
                    <button key={s} type="button" className={adminTab === s ? 'active' : ''} onClick={() => setAdminTab(s)}>
                      {s} ({s === 'Tous' ? data.reports.length : data.reports.filter(r => r.status === s).length})
                    </button>
                  ))}
                </div>
                <section className="panel cg-modern-panel">
                  <div className="pc-adm-card-stack">
                    {data.reports.filter(r => adminTab === 'Tous' || r.status === adminTab).map(r => (
                      <div className="pc-adm-ticket-card" key={r.id}>
                        <div className="pc-adm-ticket-main">
                          <div className="pc-adm-ticket-head">
                            <b>{r.target}</b>
                            <Status>{r.status}</Status>
                          </div>
                          <small className="pc-adm-ticket-meta">{r.reason} · {r.date}</small>
                          <p>{r.details || 'Aucun détail supplémentaire.'}</p>
                        </div>
                        <div className="table-actions">
                          <ActionMenu
                            label={`Actions signalement ${r.id}`}
                            items={[
                              {
                                key: 'in-progress',
                                label: 'Prendre en charge',
                                icon: <Play size={14} />,
                                onClick: async () => {
                                  const res = await apiAdminUpdateReportStatus(r.id, 'En cours');
                                  if (!res.ok) { say(res.error); return; }
                                  await refreshAdminState();
                                  say('Signalement pris en charge.');
                                },
                              },
                              {
                                key: 'resolve',
                                label: 'Marquer résolu',
                                icon: <Check size={14} />,
                                variant: 'success',
                                onClick: async () => {
                                  const res = await apiAdminUpdateReportStatus(r.id, 'Résolu');
                                  if (!res.ok) { say(res.error); return; }
                                  await refreshAdminState();
                                  say('Signalement marqué résolu.');
                                },
                              },
                              {
                                key: 'reject',
                                label: 'Rejeter',
                                icon: <X size={14} />,
                                variant: 'danger',
                                onClick: async () => {
                                  const res = await apiAdminUpdateReportStatus(r.id, 'Rejeté');
                                  if (!res.ok) { say(res.error); return; }
                                  await refreshAdminState();
                                  say('Signalement rejeté.');
                                },
                              },
                              {
                                key: 'delete',
                                label: 'Supprimer',
                                icon: <Trash2 size={14} />,
                                variant: 'danger',
                                dividerBefore: true,
                                onClick: async () => {
                                  if (!window.confirm('Supprimer définitivement ce signalement ?')) return;
                                  const res = await apiAdminDeleteReport(r.id);
                                  if (!res.ok) { say(res.error); return; }
                                  await refreshAdminState();
                                  say('Signalement supprimé.');
                                },
                              },
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                    {data.reports.filter(r => adminTab === 'Tous' || r.status === adminTab).length === 0 && (
                      <Empty title="Aucun signalement dans cette catégorie" detail="Les visiteurs peuvent signaler une information depuis les fiches publiques." />
                    )}
                  </div>
                </section>
              </>
            )}

            {page === 'Messages contact' && (
              <>
                <SectionTitle
                  eyebrow="VIGILANCE & SYSTÈME · SUPPORT"
                  title="Messages de contact"
                  desc="Consultez et traitez les demandes envoyées depuis la page Contact publique."
                  icon={<ModernChatEncryptedIcon size={24} />}
                  action={
                    <button type="button" className="outline-btn" onClick={async () => {
                      const list = await apiAdminContacts();
                      setContacts(list);
                      say('Messages de contact actualisés.');
                    }}><RefreshCw size={15} /> Actualiser</button>
                  }
                />
                <PoleSubNav
                  activePage={page}
                  onSelect={go}
                  tabs={[
                    { id: 'Signalements', label: 'Signalements publics', count: openReportsList.length },
                    { id: 'Messages contact', label: 'Messages de contact', count: openContactsCount },
                  ]}
                />
                <div className="admin-filter-row">
                  {['Tous', 'Nouveau', 'En cours', 'Traité', 'Archivé'].map(s => (
                    <button key={s} type="button" className={adminTab === s ? 'active' : ''} onClick={() => setAdminTab(s)}>
                      {s} ({s === 'Tous' ? contacts.length : contacts.filter(c => c.status === s).length})
                    </button>
                  ))}
                </div>
                <section className="panel cg-modern-panel">
                  <div className="pc-adm-card-stack">
                    {contacts
                      .filter(c => adminTab === 'Tous' || c.status === adminTab)
                      .map(c => (
                        <div className="pc-adm-ticket-card" key={c.id}>
                          <div className="pc-adm-ticket-main">
                            <div className="pc-adm-ticket-head">
                              <b>{c.topic}</b>
                              <Status>{c.status}</Status>
                            </div>
                            <small className="pc-adm-ticket-meta">
                              {c.name} · {c.email} · {new Date(c.date).toLocaleString('fr-FR')}
                            </small>
                            <p>{c.message}</p>
                            <input
                              type="text"
                              className="pc-adm-note-input"
                              value={contactNotes[c.id] ?? c.adminNote ?? ''}
                              onChange={e => setContactNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                              placeholder="Ajouter une note interne de suivi…"
                            />
                          </div>
                          <div className="table-actions">
                            <ActionMenu
                              label={`Actions message ${c.id}`}
                              items={[
                                {
                                  key: 'in-progress',
                                  label: 'En cours',
                                  icon: <Play size={14} />,
                                  onClick: () => updateContactStatus(c.id, 'En cours'),
                                },
                                {
                                  key: 'done',
                                  label: 'Marquer traité',
                                  icon: <Check size={14} />,
                                  variant: 'success',
                                  onClick: () => updateContactStatus(c.id, 'Traité'),
                                },
                                {
                                  key: 'archive',
                                  label: 'Archiver',
                                  icon: <Archive size={14} />,
                                  onClick: () => updateContactStatus(c.id, 'Archivé'),
                                },
                                {
                                  key: 'delete',
                                  label: 'Supprimer',
                                  icon: <Trash2 size={14} />,
                                  variant: 'danger',
                                  dividerBefore: true,
                                  onClick: async () => {
                                    if (!window.confirm('Supprimer définitivement ce message de contact ?')) return;
                                    const res = await apiAdminDeleteContact(c.id);
                                    if (!res.ok) { say(res.error); return; }
                                    setContacts(prev => prev.filter(item => item.id !== c.id));
                                    say('Message de contact supprimé.');
                                  },
                                },
                              ]}
                            />
                          </div>
                        </div>
                      ))}
                    {contacts.filter(c => adminTab === 'Tous' || c.status === adminTab).length === 0 && (
                      <Empty title="Aucun message de contact" detail="Les messages soumis depuis la page Contact publique apparaîtront ici." />
                    )}
                  </div>
                </section>
              </>
            )}

            {page === 'Journal d’activité' && (
              <>
                <SectionTitle
                  eyebrow="VIGILANCE & SYSTÈME · TRAÇABILITÉ"
                  title="Journal d’activité"
                  desc="Historique des opérations administratives, officines, utilisateurs et paiements sur la plateforme."
                  icon={<ModernClipboardStockIcon size={24} />}
                  action={
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="outline-btn"
                        onClick={() => {
                          const header = 'date,actor,action,entity,entityId';
                          const rows = combinedAuditLogs.map(l =>
                            [l.date, l.actor, l.action, l.entity, l.entityId ?? '']
                              .map(v => `"${String(v).replace(/"/g, '""')}"`)
                              .join(','),
                          );
                          const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'pharmaconnect-audit-logs.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download size={15} /> Exporter CSV
                      </button>
                      <button
                        type="button"
                        className="outline-btn"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(combinedAuditLogs, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'pharmaconnect-audit-logs.json';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <ModernUploadCloudIcon size={16} /> Exporter JSON
                      </button>
                    </div>
                  }
                />
                <div className="toolbar">
                  <label className="search-box">
                    <ModernSearchMedicineIcon size={17} />
                    <input value={auditQuery} onChange={e => setAuditQuery(e.target.value)} placeholder="Filtrer le journal par action, entité ou ID…" />
                  </label>
                  <select value={auditActorFilter} onChange={e => setAuditActorFilter(e.target.value)}>
                    <option value="Tous">Tous les acteurs</option>
                    <option value="Administration">Administration</option>
                    <option value="Pharmacie">Pharmacie</option>
                    <option value="Passerelle Paiement">Passerelle Paiement</option>
                    <option value="Système">Système</option>
                    <option value="Visiteur">Visiteur</option>
                  </select>
                </div>
                <section className="panel cg-modern-panel">
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr><th>DATE</th><th>AUTEUR</th><th>ACTION</th><th>ÉLÉMENT</th><th>IDENTIFIANT</th></tr>
                      </thead>
                      <tbody>
                        {combinedAuditLogs.map(l => (
                          <tr key={l.id}>
                            <td>{new Date(l.date).toString() === 'Invalid Date' ? l.date : new Date(l.date).toLocaleString('fr-FR')}</td>
                            <td><b>{l.actor}</b></td>
                            <td>{l.action}</td>
                            <td>{l.entity}</td>
                            <td>{l.entityId || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {combinedAuditLogs.length === 0 && <Empty title="Aucune opération tracée" detail="Les actions d’administration et des pharmacies alimentent ce journal." />}
                  </div>
                </section>
              </>
            )}

            {page === 'Paramètres plateforme' && (
              <>
                <SectionTitle
                  eyebrow="VIGILANCE & SYSTÈME · CONFIGURATION"
                  title="Paramètres généraux"
                  desc="Réglages transversaux de publication, annonce officielle et support de la plateforme PharmaConnect."
                  icon={<ModernSettingsGearIcon size={24} />}
                />
                <div className="pc-adm-split-grid">
                  <section className="panel cg-modern-panel">
                    <h3>Fraîcheur, annonce & contacts support</h3>
                    <p className="muted" style={{ marginBottom: 14 }}>
                      Délai maximal après lequel un prix ou stock non actualisé est masqué du catalogue public, et coordonnées officielles.
                    </p>
                    <label className="form-field">
                      Seuil de fraîcheur des stocks (jours)
                      <input type="number" min="1" max="365" value={freshness} onChange={e => setFreshness(e.target.value)} />
                    </label>
                    <label className="form-field">
                      Message d’information plateforme (optionnel)
                      <input type="text" maxLength={280} value={platformBanner} onChange={e => setPlatformBanner(e.target.value)} placeholder="Ex. Permanence sanitaire de week-end activée." />
                    </label>
                    {platformBanner.trim() && (
                      <div className="pc-adm-banner-preview">
                        <ModernBellAlertIcon size={16} />
                        <div>
                          <small>Aperçu bannière publique</small>
                          <b>{platformBanner.trim()}</b>
                        </div>
                      </div>
                    )}
                    <div className="form-grid" style={{ marginTop: 10 }}>
                      <label>
                        Téléphone support
                        <input type="text" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} />
                      </label>
                      <label>
                        E-mail officiel
                        <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ marginTop: 14 }}
                      onClick={async () => {
                        const days = Math.min(Math.max(Math.trunc(Number(freshness) || 7), 1), 365);
                        setFreshness(String(days));
                        const res = await apiAdminUpdateSettings({
                          freshnessDays: days,
                          platformBanner: platformBanner.trim(),
                          supportPhone: supportPhone.trim(),
                          supportEmail: supportEmail.trim(),
                        });
                        if (!res.ok) {
                          say(res.error);
                          return;
                        }
                        await refreshAdminState();
                        say('Paramètres plateforme enregistrés.');
                      }}
                    >
                      Enregistrer la configuration
                    </button>
                    <div className="info-note" style={{ marginTop: 12 }}>
                      <ModernAlertWarningIcon size={16} /> Seuil de fraîcheur actif : {data.freshnessDays} jours.
                    </div>
                  </section>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <section className="panel cg-modern-panel">
                      <h3>Règles de publication actives</h3>
                      <RuleRow title="Validation obligatoire des pharmacies" detail="Un établissement non validé n’apparaît pas dans l’annuaire public." />
                      <RuleRow title="Validation obligatoire des produits" detail="Un produit non approuvé reste invisible au public." />
                      <RuleRow title="Masquer les pharmacies à abonnement expiré" detail="La vitrine publique est désactivée jusqu’au renouvellement." />
                      <RuleRow title="Comptes visiteurs facultatifs" detail="La consultation publique et la prise de contact restent accessibles sans compte." />
                      <RuleRow title="Zéro transaction en ligne" detail="Les réservations, paiements ou livraisons de médicaments restent hors plateforme." />
                    </section>

                    <section className="panel cg-modern-panel">
                      <h3>Synchronisation serveur</h3>
                      <p className="muted" style={{ marginBottom: 12 }}>
                        Recharge l’état officiel, les comptes, les messages et le journal directement depuis la base de données du backend.
                      </p>
                      <button type="button" className="outline-btn" onClick={async () => {
                        const remote = await refreshAdminState(true);
                        if (remote) say('Données synchronisées depuis le serveur.');
                      }}>
                        <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Actualiser depuis le serveur
                      </button>
                    </section>
                  </div>
                </div>
              </>
            )}
            </PageTransitionStage>
          </main>
        </div>
      </div>

      <AdminPharmacyDossierModal
        pharmacy={inspectedPharmacy}
        badges={data.badges}
        onClose={() => setInspectedPharmacy(null)}
        onStatus={requestPharmacyStatusChange}
        onDownloadDocument={async (docId, fileName) => {
          const res = await apiAdminDownloadDocument(docId, fileName);
          if (!res.ok) say(res.error);
        }}
      />

      {pharmacyDecision && (
        <Modal
          title={`${pharmacyDecision.status === 'Refusée' ? 'Refuser' : 'Suspendre'} · ${pharmacyDecision.pharmacy.name}`}
          icon={<ModernDocumentCheckIcon size={20} />}
          onClose={() => setPharmacyDecision(null)}
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              const target = pharmacyDecision;
              setPharmacyDecision(null);
              await executePharmacyStatus(target.pharmacy.id, target.status, target.note.trim() || undefined);
            }}
          >
            <p className="muted" style={{ marginBottom: 12 }}>
              Indiquez le motif transmis directement dans la notification officielle de l’officine et consigné au journal d’audit.
            </p>
            <label className="form-field">
              Motif administratif *
              <textarea
                rows={3}
                required
                value={pharmacyDecision.note}
                onChange={e => setPharmacyDecision(prev => (prev ? { ...prev, note: e.target.value } : null))}
                placeholder="Ex. Agrément ministériel illisible, numéro de licence expiré ou non-conformité des déclarations."
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setPharmacyDecision(null)}>Annuler</button>
              <button type="submit" className="primary-btn">Confirmer ({pharmacyDecision.status})</button>
            </div>
          </form>
        </Modal>
      )}

      {paymentConfirmation && (
        <Modal title="Confirmer le règlement" onClose={() => { if (!confirmingPayment) setPaymentConfirmation(null); }}>
          <form className="cg-modal-form" onSubmit={async event => {
            event.preventDefault();
            if (confirmingPayment || paymentConfirmation.reference.trim().length < 4) return;
            setConfirmingPayment(true);
            try {
              if (await submitPaymentStatus(paymentConfirmation.id, 'Confirmé', paymentConfirmation.reference.trim())) {
                setPaymentConfirmation(null);
              }
            } finally {
              setConfirmingPayment(false);
            }
          }}>
            <label className="form-field">
              Référence figurant sur le reçu du règlement
              <input
                required minLength={4} maxLength={160} disabled={confirmingPayment}
                value={paymentConfirmation.reference}
                onChange={event => setPaymentConfirmation({ ...paymentConfirmation, reference: event.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={confirmingPayment} onClick={() => setPaymentConfirmation(null)}>Annuler</button>
              <button type="submit" className="primary-btn" disabled={confirmingPayment}>Confirmer le règlement</button>
            </div>
          </form>
        </Modal>
      )}

      {moderationTarget && (
        <Modal
          title={`Modération : ${moderationTarget.status}`}
          icon={<ModernPackageBoxIcon size={20} />}
          onClose={() => setModerationTarget(null)}
        >
          <form onSubmit={async e => {
            e.preventDefault();
            const target = moderationTarget;
            setModerationTarget(null);
            await productStatus(target.product.id, target.status, target.note.trim() || undefined);
          }}>
            <p className="muted" style={{ marginBottom: 12 }}>
              Produit concerné : <b>{moderationTarget.product.name}</b>
            </p>
            <label className="form-field">
              Motif ou consigne envoyée à l’officine
              <textarea
                rows={3}
                required={moderationTarget.status === 'À corriger' || moderationTarget.status === 'Refusé'}
                value={moderationTarget.note}
                onChange={e => setModerationTarget(prev => prev ? { ...prev, note: e.target.value } : null)}
                placeholder="Ex. Précisez le dosage, corrigez la catégorie ou joignez un visuel conforme."
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setModerationTarget(null)}>Annuler</button>
              <button type="submit" className="primary-btn">Confirmer ({moderationTarget.status})</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'badge' && (
        <Modal
          title={editingBadge ? 'Modifier le badge' : 'Créer un badge'}
          icon={<ModernMetricAwardIcon size={20} />}
          onClose={() => setModal(null)}
        >
          <form onSubmit={saveBadge}>
            <label className="form-field">
              Nom du badge *
              <input required disabled={isVerifiedSystem} value={badgeForm.name} onChange={e => setBadgeForm({ ...badgeForm, name: e.target.value })} />
            </label>
            <label className="form-field">
              Description
              <input value={badgeForm.description} onChange={e => setBadgeForm({ ...badgeForm, description: e.target.value })} />
            </label>
            <div className="form-grid">
              <label>
                Couleur
                <select value={badgeForm.color} onChange={e => setBadgeForm({ ...badgeForm, color: e.target.value })}>
                  <option value="mint">Vert menthe</option>
                  <option value="blue">Bleu</option>
                  <option value="gold">Or</option>
                  <option value="slate">Gris</option>
                </select>
              </label>
              <label>
                Icône
                <select value={badgeForm.icon} onChange={e => setBadgeForm({ ...badgeForm, icon: e.target.value })}>
                  <option value="shield">Bouclier</option>
                  <option value="star">Étoile</option>
                  <option value="award">Distinction</option>
                  <option value="verified">Validation</option>
                </select>
              </label>
              <label>
                Expiration (jours)
                <input
                  type="number"
                  min="1"
                  disabled={isVerifiedSystem}
                  value={isVerifiedSystem ? '' : badgeForm.expiryDays}
                  onChange={e => setBadgeForm({ ...badgeForm, expiryDays: e.target.value })}
                  placeholder={isVerifiedSystem ? 'Permanent (système)' : 'Sans expiration'}
                />
              </label>
            </div>
            <label className="check-field">
              <input
                type="checkbox"
                disabled={isVerifiedSystem}
                checked={isVerifiedSystem ? true : badgeForm.visible}
                onChange={e => setBadgeForm({ ...badgeForm, visible: e.target.checked })}
              />
              Afficher ce badge sur les fiches publiques
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setModal(null)}>Annuler</button>
              <button type="submit" className="primary-btn">Enregistrer le badge</button>
            </div>
          </form>
        </Modal>
      )}

      {pharmacyModal && (
        <Modal
          title={pharmacyModal.mode === 'create' ? 'Ajouter une pharmacie' : `Modifier · ${pharmacyModal.name}`}
          icon={<ModernDigitalStoreIcon size={20} />}
          onClose={() => setPharmacyModal(null)}
          wide
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              const lat = pharmacyModal.lat.trim() ? Number(pharmacyModal.lat) : undefined;
              const lng = pharmacyModal.lng.trim() ? Number(pharmacyModal.lng) : undefined;
              if (pharmacyModal.mode === 'create') {
                const res = await apiAdminCreatePharmacy({
                  name: pharmacyModal.name.trim(),
                  city: pharmacyModal.city.trim(),
                  area: pharmacyModal.area.trim(),
                  address: pharmacyModal.address.trim(),
                  phone: pharmacyModal.phone.trim(),
                  email: pharmacyModal.email.trim(),
                  license: pharmacyModal.license.trim(),
                  responsible: pharmacyModal.responsible.trim(),
                  subscription: pharmacyModal.subscription,
                  ...(lat !== undefined && Number.isFinite(lat) ? { lat } : {}),
                  ...(lng !== undefined && Number.isFinite(lng) ? { lng } : {}),
                });
                if (!res.ok) { say(res.error); return; }
                setPharmacyModal(null);
                await refreshAdminState();
                say('Établissement créé.');
              } else if (pharmacyModal.pharmacyId) {
                const res = await apiAdminUpdatePharmacy(pharmacyModal.pharmacyId, {
                  name: pharmacyModal.name.trim(),
                  city: pharmacyModal.city.trim(),
                  area: pharmacyModal.area.trim(),
                  address: pharmacyModal.address.trim(),
                  phone: pharmacyModal.phone.trim(),
                  email: pharmacyModal.email.trim() || null,
                  responsible: pharmacyModal.responsible.trim(),
                  lat: lat !== undefined && Number.isFinite(lat) ? lat : null,
                  lng: lng !== undefined && Number.isFinite(lng) ? lng : null,
                });
                if (!res.ok) { say(res.error); return; }
                setPharmacyModal(null);
                await refreshAdminState();
                say('Fiche établissement mise à jour.');
              }
            }}
          >
            <div className="form-grid">
              <label>Nom de la pharmacie *<input required minLength={2} value={pharmacyModal.name} onChange={e => setPharmacyModal({ ...pharmacyModal, name: e.target.value })} /></label>
              <label>Pharmacien responsable *<input required minLength={2} value={pharmacyModal.responsible} onChange={e => setPharmacyModal({ ...pharmacyModal, responsible: e.target.value })} /></label>
              <label>Ville *<input required minLength={2} value={pharmacyModal.city} onChange={e => setPharmacyModal({ ...pharmacyModal, city: e.target.value })} /></label>
              <label>Quartier / Zone *<input required minLength={2} value={pharmacyModal.area} onChange={e => setPharmacyModal({ ...pharmacyModal, area: e.target.value })} /></label>
              <label>Adresse *<input required minLength={3} value={pharmacyModal.address} onChange={e => setPharmacyModal({ ...pharmacyModal, address: e.target.value })} /></label>
              <label>Téléphone *<input required minLength={6} value={pharmacyModal.phone} onChange={e => setPharmacyModal({ ...pharmacyModal, phone: e.target.value })} /></label>
              <label>E-mail *<input type="email" required value={pharmacyModal.email} onChange={e => setPharmacyModal({ ...pharmacyModal, email: e.target.value })} /></label>
              {pharmacyModal.mode === 'create' && (
                <>
                  <label>N° licence / agrément *<input required minLength={3} value={pharmacyModal.license} onChange={e => setPharmacyModal({ ...pharmacyModal, license: e.target.value })} /></label>
                  <label>
                    Formule
                    <select value={pharmacyModal.subscription} onChange={e => setPharmacyModal({ ...pharmacyModal, subscription: e.target.value })}>
                      <option value="Basic">Basic</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </label>
                </>
              )}
              <label>Latitude<input type="number" step="any" value={pharmacyModal.lat} onChange={e => setPharmacyModal({ ...pharmacyModal, lat: e.target.value })} placeholder="Ex. 12.1131" /></label>
              <label>Longitude<input type="number" step="any" value={pharmacyModal.lng} onChange={e => setPharmacyModal({ ...pharmacyModal, lng: e.target.value })} placeholder="Ex. 15.0492" /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setPharmacyModal(null)}>Annuler</button>
              <button type="submit" className="primary-btn">{pharmacyModal.mode === 'create' ? 'Créer la pharmacie' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {productModal && (
        <Modal
          title={productModal.mode === 'create' ? 'Ajouter un produit' : `Modifier · ${productModal.name}`}
          icon={<ModernPackageBoxIcon size={20} />}
          onClose={() => setProductModal(null)}
          wide
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              const price = Number(productModal.price);
              const stock = Number(productModal.stock);
              if (productModal.name.trim().length < 2 || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
                say('Indiquez un nom, un prix valide (>= 0) et un stock entier (>= 0).');
                return;
              }
              if (productModal.mode === 'create') {
                const res = await apiAdminCreateProduct(productModal.pharmacyId, {
                  name: productModal.name.trim(),
                  category: productModal.category,
                  brand: productModal.brand.trim(),
                  code: productModal.code.trim(),
                  price,
                  stock,
                  description: productModal.description.trim(),
                  status: productModal.status,
                });
                if (!res.ok) { say(res.error); return; }
                setProductModal(null);
                await refreshAdminState();
                say('Produit créé.');
              } else if (productModal.productId) {
                const res = await apiAdminUpdateProduct(productModal.productId, {
                  name: productModal.name.trim(),
                  category: productModal.category,
                  brand: productModal.brand.trim(),
                  code: productModal.code.trim(),
                  price,
                  stock,
                  description: productModal.description.trim(),
                  status: productModal.status,
                });
                if (!res.ok) { say(res.error); return; }
                setProductModal(null);
                await refreshAdminState();
                say('Fiche produit mise à jour.');
              }
            }}
          >
            <div className="form-grid">
              {productModal.mode === 'create' && (
                <label>
                  Établissement *
                  <select value={productModal.pharmacyId} onChange={e => setProductModal({ ...productModal, pharmacyId: Number(e.target.value) })}>
                    {data.pharmacies.map(ph => (
                      <option key={ph.id} value={ph.id}>{ph.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>Nom du produit *<input required minLength={2} value={productModal.name} onChange={e => setProductModal({ ...productModal, name: e.target.value })} /></label>
              <label>
                Catégorie *
                <select value={productModal.category} onChange={e => setProductModal({ ...productModal, category: e.target.value })}>
                  {Array.from(new Set([...data.platformCategories, productModal.category].filter(Boolean))).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>Marque / laboratoire<input value={productModal.brand} onChange={e => setProductModal({ ...productModal, brand: e.target.value })} /></label>
              <label>Code-barres<input value={productModal.code} onChange={e => setProductModal({ ...productModal, code: e.target.value })} /></label>
              <label>Prix (FCFA) *<input type="number" min="0" step="0.01" required value={productModal.price} onChange={e => setProductModal({ ...productModal, price: e.target.value })} /></label>
              <label>Stock déclaré *<input type="number" min="0" step="1" required value={productModal.stock} onChange={e => setProductModal({ ...productModal, stock: e.target.value })} /></label>
              <label>
                Statut
                <select value={productModal.status} onChange={e => setProductModal({ ...productModal, status: e.target.value as ProductStatus })}>
                  {(productModal.mode === 'create'
                    ? ['Publié', 'En attente', 'Brouillon']
                    : ['Publié', 'En attente', 'À corriger', 'Brouillon', 'Masqué', 'Suspendu', 'Refusé', 'Archivé']
                  ).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="form-field">
              Description
              <textarea value={productModal.description} onChange={e => setProductModal({ ...productModal, description: e.target.value })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setProductModal(null)}>Annuler</button>
              <button type="submit" className="primary-btn">{productModal.mode === 'create' ? 'Créer le produit' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {renamingCategory && (
        <Modal
          title="Renommer la catégorie officielle"
          icon={<ModernTagCategoryIcon size={20} />}
          onClose={() => setRenamingCategory(null)}
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              const next = renamingCategory.nextName.trim();
              if (next.length < 2) {
                say('Indiquez un nom valide (2 caractères min.).');
                return;
              }
              const res = await apiAdminRenameCategory(renamingCategory.oldName, next);
              if (!res.ok) {
                say(res.error);
                return;
              }
              setRenamingCategory(null);
              await refreshAdminState();
              say('Catégorie officielle renommée.');
            }}
          >
            <label className="form-field">
              Nouveau nom *
              <input
                required
                minLength={2}
                maxLength={80}
                value={renamingCategory.nextName}
                onChange={e => setRenamingCategory({ ...renamingCategory, nextName: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setRenamingCategory(null)}>Annuler</button>
              <button type="submit" className="primary-btn">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
