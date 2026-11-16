'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  AppData, PharmacyPreferences, Pharmacy,
  Product, ProductStatus, distanceKm, isPharmacyActiveAndValid, isProductFresh, isStrongPassword,
  officialCategories, PASSWORD_POLICY_ERROR, seed
} from '@/lib/shared';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeView } from '@/components/public/HomeView';
import { PharmaciesView } from '@/components/public/PharmaciesView';
import { ProductsView } from '@/components/public/ProductsView';
import { PharmacyDetailView } from '@/components/public/PharmacyDetailView';
import { PricingView } from '@/components/public/PricingView';
import { StaticPagesView } from '@/components/public/StaticPagesView';
import type { HealthSubPage } from '@/components/public/pages/HealthAlertsPage';
import { PharmacySidebar } from '@/components/pharmacy/PharmacySidebar';
import { PharmacyTopbar } from '@/components/pharmacy/PharmacyTopbar';
import { PharmacyViews } from '@/components/pharmacy/PharmacyViews';
import { AppModals } from '@/components/modals/AppModals';
import { PageTransitionStage } from '@/components/shared/MotionStage';
import { Language } from '@/lib/translations';
import {
  apiCreatePayment,
  apiMe,
  apiRegisterPharmacy,
  apiSendPublicMessage,
  apiSendVisitorReply,
  apiSubmitReport,
  apiUploadPharmacyDocuments,
  clearAuthToken,
  fetchBackendState,
  getAuthToken,
  reloadOnAuthChange,
  apiRequest
} from '@/lib/api';

const initialData: AppData = {
  ...seed, products: [], pharmacies: [], messages: [], badges: [], payments: [],
  plans: [], notices: [], reports: [], auditLogs: [], preferences: {},
};

export default function Home() {
  const [publicData, setPublicData] = useState<AppData>(initialData);
  const [privateSnapshot, setPrivateSnapshot] = useState<{
    token: string;
    data: AppData;
    customCategories: Record<number, string[]>;
  } | null>(null);
  const currentSnapshot = privateSnapshot?.token === getAuthToken() ? privateSnapshot : null;
  const data = currentSnapshot?.data ?? initialData;
  const runningMutations = useRef(new Set<string>());
  const stateRequest = useRef(0);
  const [clock, setClock] = useState(0);
  const [space, setSpace] = useState<'public' | 'pharmacy'>('public');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(-1);
  const [registrationFiles, setRegistrationFiles] = useState<File[]>([]);
  const [existingAccountRegistration, setExistingAccountRegistration] = useState(false);
  const [newPharmacyPlan, setNewPharmacyPlan] = useState<'Basic' | 'Standard' | 'Premium'>('Basic');
  const [page, setPage] = useState('Accueil');
  const [healthSubPage, setHealthSubPage] = useState<HealthSubPage>('alerts');
  const [selectedPharmacy, setSelectedPharmacy] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Toutes les villes');
  const [categoryFilter, setCategoryFilter] = useState('Toutes les catégories');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('Toutes');
  const [reportForm, setReportForm] = useState({ reason: 'Information incorrecte', details: '' });
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<'product' | 'message' | 'register' | 'profile' | 'account' | 'visitorInbox' | 'report' | 'payment' | 'pharmacyLogin' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentMessage, setCurrentMessage] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: data.platformCategories[0] || officialCategories[0],
    brand: '',
    code: '',
    price: '',
    stock: '',
    description: '',
    imageDataUrl: ''
  });
  const [customCategory, setCustomCategory] = useState('');
  const [pharmacyForm, setPharmacyForm] = useState({
    name: '', city: '', area: '', address: '', phone: '', email: '',
    license: '', responsible: '', lat: '', lng: '', password: '', documents: ''
  });
  const [messageForm, setMessageForm] = useState({ sender: '', phone: '', subject: '', body: '' });
  const [reply, setReply] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: 'Pharmacie Centrale', city: 'N’Djamena', area: 'Avenue Charles de Gaulle',
    address: 'Avenue Charles de Gaulle, face Place de la Nation', phone: '+235 66 20 10 01', email: 'contact@centrale.example',
    responsible: 'Pharmacien responsable', lat: '12.1131', lng: '15.0492'
  });
  const [planPeriod, setPlanPeriod] = useState('monthly');
  const [paymentDraft, setPaymentDraft] = useState({
    requestId: '', plan: 'Basic', amount: 0, period: 'Mensuel', provider: '', phone: '',
  });
  const [paymentOperators, setPaymentOperators] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [geo, setGeo] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [adminTab, setAdminTab] = useState('Tous');
  const [visitorAccount, setVisitorAccount] = useState<{ name: string; email: string; phone?: string; password?: string; provider?: 'email' | 'Google' }>({ name: '', email: '', phone: '', password: '' });
  const [visitorLoggedIn, setVisitorLoggedIn] = useState(false);
  const [favoritePharmacyIds, setFavoritePharmacyIds] = useState<number[]>([]);
  const [activeVisitorThread, setActiveVisitorThread] = useState<number | null>(null);
  const [visitorReply, setVisitorReply] = useState('');
  const [pharmacyLoggedIn, setPharmacyLoggedIn] = useState(false);
  const [pendingPharmacyPage, setPendingPharmacyPage] = useState('Vue d’ensemble');
  const [accountOwnerId, setAccountOwnerId] = useState<number>(-1);
  const [pharmacyLoginForm, setPharmacyLoginForm] = useState({ email: '', password: '' });
  const [pharmacyLoginError, setPharmacyLoginError] = useState('');
  const [lang, setLang] = useState<Language>('fr');

  const ownedPharmacies = data.pharmacies.filter(p => p.ownerId === accountOwnerId);
  const currentOwned = ownedPharmacies.find(p => p.id === selectedPharmacyId) || ownedPharmacies[0];
  const pharmacyId = currentOwned?.id ?? -1;
  const activePharmacy = currentOwned;
  const canOperatePharmacy = (ph?: Pharmacy, requireValidated = false) => {
    if (!ph || pharmacyId <= 0) return false;
    if (ph.status === 'Validée') return isPharmacyActiveAndValid(ph);
    if (requireValidated) return false;
    return ['En attente', 'En vérification'].includes(ph.status);
  };
  const categories = Array.from(new Set([...data.platformCategories, ...customCategories()]));

  const refreshStateFromBackend = async (targetOwnerId?: number, isCurrent = () => true): Promise<AppData | null> => {
    const request = ++stateRequest.current;
    const token = getAuthToken();
    const [publicState, privateState] = await Promise.all([
      fetchBackendState(null),
      token ? fetchBackendState(token) : Promise.resolve(null),
    ]);
    if (request !== stateRequest.current || !isCurrent() || token !== getAuthToken()) return null;
    if (publicState) setPublicData({ ...initialData, ...publicState });
    const { customCategories: remoteCustomCats, ...rest } = privateState ?? {};
    const merged = privateState ? { ...initialData, ...rest } : initialData;
    setPrivateSnapshot(token && privateState ? { token, data: merged, customCategories: remoteCustomCats ?? {} } : null);
    if (targetOwnerId !== undefined) {
      const firstOwned = merged.pharmacies.find(p => p.ownerId === targetOwnerId);
      if (firstOwned) setSelectedPharmacyId(firstOwned.id);
    }
    return token ? (privateState ? merged : null) : (publicState ? { ...initialData, ...publicState } : null);
  };

  async function mutate(path: string, method: string, body: unknown, success?: string) {
    if (runningMutations.current.has(path)) return false;
    runningMutations.current.add(path);
    try {
      const result = await apiRequest(path, method, body);
      if (!result.ok) {
        say(result.error);
        return false;
      }
      const refreshed = await refreshStateFromBackend();
      if (success) say(refreshed ? success : 'Action enregistrée. Rechargez la page pour actualiser l’affichage.');
      return true;
    } finally {
      runningMutations.current.delete(path);
    }
  }

  const handlePharmacyLogout = async () => {
    clearAuthToken();
    setPrivateSnapshot(null);
    setModal(null);
    try {
      localStorage.removeItem('pharmaconnect-pharmacy-session');
      localStorage.removeItem('pharmaconnect-pharmacy-owner-id');
      localStorage.removeItem('pharmaconnect-pharmacy-accounts');
      localStorage.removeItem('pharmaconnect-data-v2');
    } catch { }
    setPharmacyLoggedIn(false);
    setAccountOwnerId(-1);
    setSelectedPharmacyId(-1);
    setCurrentMessage(null);
    setReply('');
    setSpace('public');
    setPage('Accueil');
    await refreshStateFromBackend();
    say('Session pharmacie déconnectée.');
  };

  const handleVisitorLogout = async () => {
    clearAuthToken();
    setPrivateSnapshot(null);
    setModal(null);
    try {
      localStorage.removeItem('pharmaconnect-visitor-demo');
      localStorage.removeItem('pharmaconnect-visitor-accounts');
      localStorage.removeItem('pharmaconnect-data-v2');
    } catch { }
    setVisitorLoggedIn(false);
    setVisitorAccount({ name: '', email: '', password: '' });
    setModal(null);
    await refreshStateFromBackend();
    say('Compte visiteur déconnecté.');
  };

  useEffect(() => {
    let active = true;
    const stopWatchingAuth = reloadOnAuthChange();

    try {
      localStorage.removeItem('pharmaconnect-visitor-demo');
      localStorage.removeItem('pharmaconnect-visitor-accounts');
      localStorage.removeItem('pharmaconnect-pharmacy-accounts');
      localStorage.removeItem('pharmaconnect-pharmacy-session');
      localStorage.removeItem('pharmaconnect-pharmacy-owner-id');
      localStorage.removeItem('pharmaconnect-data-v2');
      const savedLang = localStorage.getItem('pharmaconnect-lang') as Language;
      if (savedLang === 'fr' || savedLang === 'en') {
        setLang(savedLang);
      }
    } catch { }

    const bootstrapSessionAndState = async () => {
      const me = await apiMe();
      if (!active) return;

      let targetOwnerId: number | undefined;
      if (me?.role === 'PHARMACIST') {
        targetOwnerId = me.id;
        setAccountOwnerId(me.id);
        setPharmacyLoggedIn(true);
      } else if (me?.role === 'VISITOR') {
        setVisitorAccount({
          name: me.name || me.email.split('@')[0],
          email: me.email,
          phone: me.phone || '',
          password: '',
          provider: me.provider === 'google' ? 'Google' : 'email',
        });
        setVisitorLoggedIn(true);
      } else if (me?.role === 'ADMIN') {
        // Admin session is managed on /admin
      } else {
        clearAuthToken();
      }

      const remote = await refreshStateFromBackend(targetOwnerId, () => active);
      if (active && !remote) setNotice('Les données de PharmaConnect sont momentanément indisponibles.');
    };

    void bootstrapSessionAndState();

    return () => { active = false; stopWatchingAuth(); };
  }, []);

  const handleLanguageChange = (nextLang: Language) => {
    setLang(nextLang);
    try {
      localStorage.setItem('pharmaconnect-lang', nextLang);
    } catch { }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(Date.now());
      void refreshStateFromBackend();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const say = (s: string) => { setNotice(s); window.setTimeout(() => setNotice(''), 4500); };
  const go = (s: string, keepQuery = false) => {
    setPage(s);
    if (!keepQuery) setQuery('');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openSpace = (s: 'public' | 'pharmacy', forceAuth = false) => {
    if (s === 'pharmacy' && !pharmacyLoggedIn && !forceAuth) {
      setPendingPharmacyPage('Vue d’ensemble');
      setPharmacyLoginError('');
      setPharmacyLoginForm({ email: '', password: '' });
      setModal('pharmacyLogin');
      return;
    }
    setQuery('');
    setCategoryFilter('Toutes les catégories');
    setSpace(s);
    setPage(s === 'public' ? 'Accueil' : 'Vue d’ensemble');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (space === 'pharmacy' && !pharmacyLoggedIn) {
      setSpace('public');
      setPendingPharmacyPage('Vue d’ensemble');
      setPharmacyLoginError('');
      setPharmacyLoginForm({ email: '', password: '' });
      setModal('pharmacyLogin');
    }
  }, [space, pharmacyLoggedIn]);

  useEffect(() => {
    if (modal === 'visitorInbox' && (!visitorLoggedIn || !visitorAccount.email)) {
      setModal('account');
    }
  }, [modal, visitorLoggedIn, visitorAccount.email]);

  useEffect(() => {
    if (!visitorLoggedIn || !visitorAccount.email) {
      setFavoritePharmacyIds([]);
      return;
    }
    try {
      const raw = localStorage.getItem(`pharmaconnect-visitor-favorites:${visitorAccount.email.toLowerCase()}`);
      const parsed = raw ? JSON.parse(raw) : [];
      setFavoritePharmacyIds(Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []);
    } catch {
      setFavoritePharmacyIds([]);
    }
  }, [visitorLoggedIn, visitorAccount.email]);

  const toggleFavoritePharmacy = (targetPharmacyId: number) => {
    if (!visitorLoggedIn || !visitorAccount.email) return;
    setFavoritePharmacyIds(prev => {
      const exists = prev.includes(targetPharmacyId);
      const next = exists ? prev.filter(id => id !== targetPharmacyId) : [...prev, targetPharmacyId];
      try {
        localStorage.setItem(`pharmaconnect-visitor-favorites:${visitorAccount.email.toLowerCase()}`, JSON.stringify(next));
      } catch { }
      say(exists ? 'Pharmacie retirée de vos favoris.' : 'Pharmacie ajoutée à vos favoris.');
      return next;
    });
  };

  const publicProducts = useMemo(() => publicData.products.filter(p => p.status === 'Publié' && isProductFresh(p.stockUpdatedAt ?? p.updated, publicData.freshnessDays, clock || Date.now()) && publicData.pharmacies.some(ph => ph.id === p.pharmacyId && isPharmacyActiveAndValid(ph))), [publicData, clock]);
  const publicPharmacies = useMemo(() => {
    const list = publicData.pharmacies.filter(p => p.status === 'Validée' && isPharmacyActiveAndValid(p)).filter(p => !query || `${p.name} ${p.city} ${p.area}`.toLowerCase().includes(query.toLowerCase())).filter(p => city === 'Toutes les villes' || p.city === city);
    if (!geoCoords) return list;
    return [...list].sort((a, b) => {
      const da = a.lat === undefined || a.lng === undefined ? Number.POSITIVE_INFINITY : distanceKm(geoCoords, { lat: a.lat, lng: a.lng });
      const db = b.lat === undefined || b.lng === undefined ? Number.POSITIVE_INFINITY : distanceKm(geoCoords, { lat: b.lat, lng: b.lng });
      return da - db;
    });
  }, [publicData, query, city, geoCoords]);

  const filteredPublicProducts = useMemo(() => publicProducts.filter(p => {
    const ph = publicData.pharmacies.find(x => x.id === p.pharmacyId);
    return (!query || `${p.name} ${p.brand} ${p.category} ${p.code} ${ph?.name} ${ph?.city} ${ph?.area}`.toLowerCase().includes(query.toLowerCase())) && (categoryFilter === 'Toutes les catégories' || p.category === categoryFilter) && (!minPrice || p.price >= Number(minPrice)) && (!maxPrice || p.price <= Number(maxPrice)) && (availabilityFilter === 'Toutes' || (availabilityFilter === 'Disponible' ? p.stock > 0 : p.stock === 0)) && (city === 'Toutes les villes' || ph?.city === city);
  }), [publicProducts, query, categoryFilter, publicData.pharmacies, minPrice, maxPrice, city, availabilityFilter]);

  const myProducts = data.products.filter(p => p.pharmacyId === pharmacyId);
  const unreadMessages = data.messages.filter(m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.read).length;
  const unreadNotices = data.notices.filter(n => !n.read && n.pharmacyId === pharmacyId).length;
  const unread = unreadMessages + unreadNotices;

  function resetProductForm(p?: Product) {
    setEditingProduct(p || null);
    setProductForm(p ? {
      name: p.name, category: p.category, brand: p.brand, code: p.code,
      price: String(p.price), stock: String(p.stock), description: p.description,
      imageDataUrl: p.imageDataUrl || ''
    } : {
      name: '', category: categories[0] || officialCategories[0], brand: '',
      code: '', price: '', stock: '', description: '', imageDataUrl: ''
    });
    setModal('product');
  }

  function duplicateProduct(p: Product) {
    setEditingProduct(null);
    setProductForm({
      name: `${p.name} (copie)`,
      category: p.category,
      brand: p.brand,
      code: '',
      price: String(p.price),
      stock: String(p.stock),
      description: p.description,
      imageDataUrl: p.imageDataUrl || '',
    });
    setModal('product');
  }

  function handleProductImage(file?: File) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { say('L’image dépasse 2 Mo.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 800;
        let { width, height } = img;
        if (width > height && width > max) { height = Math.round((height * max) / width); width = max; }
        else if (height > max) { width = Math.round((width * max) / height); height = max; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setProductForm(f => ({ ...f, imageDataUrl: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function saveProduct(draft: boolean) {
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);
    if (productForm.name.trim().length < 2 || (!draft && (!productForm.price || !productForm.stock))
      || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      say('Indiquez un nom, un prix positif ou nul et un stock en unités entières.');
      return;
    }
    const path = editingProduct ? `/api/products/${editingProduct.id}` : `/api/pharmacies/${pharmacyId}/products`;
    const status = draft ? 'Brouillon' : 'En attente';
    const saved = await mutate(path, editingProduct ? 'PATCH' : 'POST',
      { ...productForm, price, stock, status }, draft ? 'Brouillon enregistré.' : 'Produit soumis à validation.');
    if (saved) setModal(null);
  }

  function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    return saveProduct(false);
  }

  function removeProduct(id: number) {
    if (!window.confirm('Supprimer définitivement ce produit ?')) return;
    return mutate(`/api/products/${id}`, 'DELETE', undefined, 'Produit supprimé.');
  }

  async function updateStock(id: number, price: number, stock: number) {
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      say('Indiquez un prix positif ou nul et un stock en unités entières.');
      return false;
    }
    return mutate(`/api/products/${id}/stock`, 'PATCH', { price, stock }, 'Stock et prix actualisés.');
  }

  function productStatus(id: number, status: ProductStatus) {
    return mutate(`/api/products/${id}/status`, 'PATCH', { status }, `Statut mis à jour : ${status}`);
  }

  async function registerPharmacy(e: React.FormEvent) {
    e.preventDefault();
    if (!existingAccountRegistration && !pharmacyLoggedIn) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pharmacyForm.email.trim());
      if (!emailOk || !pharmacyForm.password || !isStrongPassword(pharmacyForm.password)) {
        say(`Étape 1 incomplète : e-mail valide requis. ${PASSWORD_POLICY_ERROR}`);
        return;
      }
    }
    if (!pharmacyForm.name.trim() || !pharmacyForm.city.trim() || !pharmacyForm.area.trim() || !pharmacyForm.address.trim()) {
      say('Étape 2 incomplète : nom, ville, quartier et adresse sont obligatoires.');
      return;
    }
    if (!pharmacyForm.phone.trim() || !pharmacyForm.license.trim() || !pharmacyForm.responsible.trim() || !pharmacyForm.documents.trim()) {
      say('Étape 3 incomplète : téléphone, autorisation, responsable et justificatifs sont obligatoires.');
      return;
    }

    const res = await apiRegisterPharmacy({
      ...(existingAccountRegistration || pharmacyLoggedIn ? {} : {
        accountEmail: pharmacyForm.email.trim().toLowerCase(),
        password: pharmacyForm.password,
        accountName: pharmacyForm.responsible.trim() || pharmacyForm.name.trim(),
      }),
      name: pharmacyForm.name.trim(),
      city: pharmacyForm.city.trim(),
      area: pharmacyForm.area.trim(),
      address: pharmacyForm.address.trim(),
      phone: pharmacyForm.phone.trim(),
      email: pharmacyForm.email.trim() || currentOwned?.email,
      license: pharmacyForm.license.trim(),
      responsible: pharmacyForm.responsible.trim(),
      lat: pharmacyForm.lat ? Number(pharmacyForm.lat) : undefined,
      lng: pharmacyForm.lng ? Number(pharmacyForm.lng) : undefined,
      plan: newPharmacyPlan,
      documents: pharmacyForm.documents.trim(),
    });

    if (!res.ok) {
      say(res.error);
      return;
    }

    let documentsError: string | undefined;
    if (res.pharmacy?.id && registrationFiles.length > 0) {
      const upload = await apiUploadPharmacyDocuments(res.pharmacy.id, registrationFiles);
      if (!upload.ok) documentsError = upload.error;
    }
    setRegistrationFiles([]);

    const ownerId = res.user?.id ?? res.pharmacy?.ownerId ?? accountOwnerId;
    setAccountOwnerId(ownerId);
    setPharmacyLoggedIn(true);
    setVisitorLoggedIn(false);
    setModal(null);
    await refreshStateFromBackend(ownerId);
    if (res.pharmacy?.id) setSelectedPharmacyId(res.pharmacy.id);
    setSpace('pharmacy');
    go('Mon établissement');
    if (documentsError) say(`Dossier créé. Renouvelez l’envoi dans Mon établissement. ${documentsError}`);
    else say('Demande d’inscription transmise. Votre dossier est en cours d’examen.');
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentOwned) return;
    const { lat, lng, email, ...profile } = profileForm;
    const saved = await mutate(`/api/pharmacies/${currentOwned.id}`, 'PATCH', {
      ...profile, email: email.trim() || null,
      lat: lat.trim() ? Number(lat) : null, lng: lng.trim() ? Number(lng) : null,
    }, 'Fiche établissement mise à jour.');
    if (saved) setModal(null);
  }

  async function sendPublicMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageForm.phone.trim() || !messageForm.body.trim()) { say('Téléphone et message obligatoires.'); return; }
    const targetPh = publicData.pharmacies.find(p => p.id === selectedPharmacy);
    if (!targetPh || !isPharmacyActiveAndValid(targetPh)) {
      say('Cet établissement n’accepte pas de messages actuellement.'); return;
    }
    const res = await apiSendPublicMessage({
      pharmacyId: selectedPharmacy,
      productId: selectedProduct || undefined,
      sender: messageForm.sender.trim() || (visitorLoggedIn ? visitorAccount.name : '') || 'Visiteur',
      phone: messageForm.phone.trim(),
      subject: messageForm.subject.trim() || 'Demande d’information',
      body: messageForm.body.trim(),
      visitorEmail: visitorLoggedIn ? visitorAccount.email || undefined : undefined,
    });
    if (!res.ok) {
      say(res.error); return;
    }
    setModal(null);
    setMessageForm({ sender: '', phone: '', subject: '', body: '' });
    await refreshStateFromBackend();
    say('Message transmis à la pharmacie. Vous recevrez une réponse aux coordonnées fournies.');
  }

  async function sendReply(threadId: number) {
    if (!reply.trim()) return;
    if (await mutate(`/api/messages/${threadId}/reply`, 'POST', { body: reply.trim() }, 'Réponse envoyée.')) {
      setReply('');
    }
  }

  async function sendVisitorReply(threadId: number) {
    if (!visitorReply.trim()) return;
    if (!visitorLoggedIn) {
      say('Connectez-vous pour poursuivre la conversation.'); return;
    }
    const res = await apiSendVisitorReply(threadId, visitorReply.trim());
    if (!res.ok) {
      say(res.error); return;
    }
    setVisitorReply('');
    await refreshStateFromBackend();
    say('Votre message a été transmis à la pharmacie.');
  }

  function setMessageRead(id: number) {
    setCurrentMessage(id);
    if (data.messages.some(m => (m.id === id || m.threadId === id) && m.direction === 'visitor' && !m.read)) {
      void mutate(`/api/messages/${id}/read`, 'PATCH', undefined);
    }
  }

  function markNotice(id: number) {
    return mutate(`/api/notices/${id}/read`, 'PATCH', undefined);
  }

  function markAllNotices() {
    return mutate(`/api/pharmacies/${pharmacyId}/notices/read-all`, 'POST', undefined);
  }

  function deleteNotice(id: number) {
    return mutate(`/api/notices/${id}`, 'DELETE', undefined, 'Notification supprimée.');
  }

  function updatePreferences(patch: Partial<PharmacyPreferences>) {
    return mutate(`/api/pharmacies/${pharmacyId}/preferences`, 'PATCH', patch, 'Préférences enregistrées.');
  }

  async function addCategory(name: string) {
    if (await mutate(`/api/pharmacies/${pharmacyId}/categories`, 'POST', { name }, 'Catégorie ajoutée.')) {
      setCustomCategory('');
    }
  }

  function renameCategory(oldName: string, newName: string) {
    return mutate(
      `/api/pharmacies/${pharmacyId}/categories/${encodeURIComponent(oldName)}`,
      'PATCH',
      { name: newName },
      'Catégorie renommée.',
    );
  }

  function removeCategory(name: string) {
    return mutate(`/api/pharmacies/${pharmacyId}/categories/${encodeURIComponent(name)}`, 'DELETE', undefined, 'Catégorie retirée.');
  }

  async function changePlan(plan: AppData['plans'][number]) {
    const config = await apiRequest<{ mode: string; operators: string[] }>('/api/payments/config', 'GET');
    if (!config.ok || !config.data?.operators?.length) {
      say('Aucun opérateur Mobile Money disponible pour le moment.');
      return;
    }
    setPaymentOperators(config.data.operators);
    setPaymentMode(config.data.mode);
    setPaymentDraft({
      requestId: crypto.randomUUID(),
      plan: plan.name,
      amount: plan[planPeriod as 'monthly' | 'quarterly' | 'yearly'],
      period: planPeriod === 'monthly' ? 'Mensuel' : planPeriod === 'quarterly' ? 'Trimestriel' : 'Annuel',
      provider: config.data.operators.length === 1 ? config.data.operators[0] : '',
      phone: '',
    });
    setModal('payment');
  }

  async function createPaymentRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!currentOwned || pharmacyId <= 0 || runningMutations.current.has('payment')) return;
    if (!paymentOperators.includes(paymentDraft.provider) || !paymentDraft.phone.trim()) {
      say('Choisissez un opérateur et renseignez un numéro Mobile Money.');
      return;
    }
    runningMutations.current.add('payment');
    setPaymentBusy(true);
    try {
      const result = await apiCreatePayment(pharmacyId, {
        requestId: paymentDraft.requestId, plan: paymentDraft.plan, period: paymentDraft.period,
        provider: paymentDraft.provider, payerPhone: paymentDraft.phone.trim(),
      });
      if (!result.ok) {
        say(result.error);
        return;
      }
      setModal(null);
      await refreshStateFromBackend();
      const payment = result.payment;
      if (payment.status === 'Confirmé') say(`Paiement ${payment.invoiceRef} confirmé. Votre abonnement est actif.`);
      else if (payment.dispatch === 'uncertain') say(`Demande ${payment.invoiceRef} enregistrée. La transmission à l’opérateur reste à vérifier.`);
      else say(`Demande ${payment.invoiceRef} enregistrée. L’abonnement sera activé après confirmation du paiement.`);
    } finally {
      setPaymentBusy(false);
      runningMutations.current.delete('payment');
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportForm.details.trim()) { say('Veuillez préciser le motif du signalement.'); return; }
    const ph = publicData.pharmacies.find(p => p.id === selectedPharmacy);
    const prod = selectedProduct ? publicData.products.find(p => p.id === selectedProduct) : null;
    const res = await apiSubmitReport({
      pharmacyId: selectedPharmacy,
      productId: selectedProduct || undefined,
      reason: reportForm.reason,
      details: reportForm.details.trim(),
      target: prod ? `${prod.name} (${ph?.name || 'Pharmacie'})` : (ph?.name || 'Établissement'),
    });
    if (!res.ok) {
      say(res.error);
      return;
    }
    setModal(null);
    setReportForm({ reason: 'Information incorrecte', details: '' });
    await refreshStateFromBackend();
    say('Signalement transmis. Notre équipe va examiner ces informations.');
  }

  function startGeo() {
    if (!navigator.geolocation) { say('La géolocalisation n’est pas supportée par votre navigateur.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeo(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        say('Position enregistrée. Les pharmacies sont désormais classées par distance.');
      },
      () => say('Impossible d’accéder à votre position actuelle.')
    );
  }

  function customCategories(): string[] {
    return currentSnapshot?.customCategories[pharmacyId] ?? [];
  }

  return (
    <div className="site-root">
      <Header
        space={space}
        page={page}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        openSpace={openSpace}
        go={go}
        pharmacyLoggedIn={pharmacyLoggedIn}
        visitorLoggedIn={visitorLoggedIn}
        setModal={setModal}
        setPharmacyLoginError={setPharmacyLoginError}
        setPharmacyLoginForm={setPharmacyLoginForm}
        visitorAccount={visitorAccount}
        currentLang={lang}
        onLanguageChange={handleLanguageChange}
        pharmacies={publicPharmacies}
        onSelectCategory={(cat) => { setCategoryFilter(cat); setAvailabilityFilter('Toutes'); go('Produits'); }}
        onSelectAvailability={(avail) => { setCategoryFilter('Toutes les catégories'); setAvailabilityFilter(avail); go('Produits'); }}
        onSelectPharmacy={(id) => { setSelectedPharmacy(id); go('Fiche pharmacie'); }}
        onTriggerGeo={() => { startGeo(); go('Pharmacies'); }}
        onOpenHealthSubPage={(sub) => { setHealthSubPage(sub); go('Rubrique Santé'); }}
        onOpenPharmacyPage={(subPage) => {
          if (pharmacyLoggedIn) {
            setSpace('pharmacy');
            go(subPage);
            return;
          }
          setPendingPharmacyPage(subPage);
          setPharmacyLoginError('');
          setPharmacyLoginForm({ email: '', password: '' });
          setModal('pharmacyLogin');
        }}
        onLogoutPharmacy={handlePharmacyLogout}
        onLogoutVisitor={handleVisitorLogout}
      />

      {space === 'public' || !pharmacyLoggedIn ? (
        <main className="public-main">
          {notice && (
            <div className="toast">
              <CheckCircle2 size={17} />{notice}
              <button onClick={() => setNotice('')}><X size={15} /></button>
            </div>
          )}

          <PageTransitionStage routeKey={`pub-${page}`}>
            {page === 'Accueil' && (
              <HomeView
                data={publicData}
                query={query}
                setQuery={setQuery}
                setCategoryFilter={setCategoryFilter}
                go={go}
                publicProducts={publicProducts}
                setSelectedPharmacy={setSelectedPharmacy}
                setSelectedProduct={setSelectedProduct}
                setModal={setModal}
                setExistingAccountRegistration={setExistingAccountRegistration}
                currentLang={lang}
              />
            )}

            {page === 'Pharmacies' && (
              <PharmaciesView
                data={publicData}
                query={query}
                setQuery={setQuery}
                city={city}
                setCity={setCity}
                geo={geo}
                geoCoords={geoCoords}
                startGeo={startGeo}
                publicPharmacies={publicPharmacies}
                setSelectedPharmacy={setSelectedPharmacy}
                go={go}
              />
            )}

            {page === 'Produits' && (
              <ProductsView
                data={publicData}
                query={query}
                setQuery={setQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                city={city}
                setCity={setCity}
                availabilityFilter={availabilityFilter}
                setAvailabilityFilter={setAvailabilityFilter}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                filteredPublicProducts={filteredPublicProducts}
                setSelectedPharmacy={setSelectedPharmacy}
                setSelectedProduct={setSelectedProduct}
                setModal={setModal}
                go={go}
                currentLang={lang}
              />
            )}

            {page === 'Fiche pharmacie' && (
              <PharmacyDetailView
                data={publicData}
                selectedPharmacy={selectedPharmacy}
                setSelectedProduct={setSelectedProduct}
                setSelectedPharmacy={setSelectedPharmacy}
                setModal={setModal}
                setMessageForm={setMessageForm}
                go={go}
                favoritePharmacyIds={favoritePharmacyIds}
                toggleFavoritePharmacy={toggleFavoritePharmacy}
              />
            )}

            {page === 'Tarifs' && (
              <PricingView
                data={publicData}
                planPeriod={planPeriod}
                setPlanPeriod={setPlanPeriod}
                setExistingAccountRegistration={setExistingAccountRegistration}
                setNewPharmacyPlan={setNewPharmacyPlan}
                setModal={setModal}
                say={say}
                currentLang={lang}
              />
            )}

            <StaticPagesView
              page={page}
              pharmacyForm={pharmacyForm}
              setPharmacyForm={setPharmacyForm}
              registerPharmacy={registerPharmacy}
              existingAccountRegistration={existingAccountRegistration}
              onRegistrationFilesChange={setRegistrationFiles}
              setExistingAccountRegistration={setExistingAccountRegistration}
              setModal={setModal}
              say={say}
              go={go}
              onSelectCategory={(cat) => { setCategoryFilter(cat); setAvailabilityFilter('Toutes'); go('Produits'); }}
              healthSubPage={healthSubPage}
              onHealthSubPageChange={setHealthSubPage}
              currentLang={lang}
              pharmaciesCount={publicPharmacies.length}
              productsCount={publicProducts.length}
            />

            <Footer go={go} currentLang={lang} />
          </PageTransitionStage>
        </main>
      ) : (
        <div className="workspace">
          <PharmacySidebar
            page={page}
            unread={unreadMessages}
            unreadNotices={unreadNotices}
            pharmacyId={pharmacyId}
            setSelectedPharmacyId={setSelectedPharmacyId}
            ownedPharmacies={ownedPharmacies}
            activePharmacy={activePharmacy}
            openSpace={openSpace}
            go={go}
            say={say}
            setExistingAccountRegistration={setExistingAccountRegistration}
            setPharmacyForm={setPharmacyForm}
            setModal={setModal}
            setCurrentMessage={setCurrentMessage}
            setReply={setReply}
            onLogout={handlePharmacyLogout}
            onOpenSupport={() => {
              openSpace('public');
              go('Contact');
            }}
          />

          <div className="workspace-main">
            <PharmacyTopbar
              page={page}
              unread={unreadNotices}
              activePharmacy={activePharmacy}
              go={go}
              setProfileForm={setProfileForm}
              setModal={setModal}
            />

            <main className="workspace-content">
              {notice && (
                <div className="toast">
                  <CheckCircle2 size={17} />{notice}
                  <button onClick={() => setNotice('')}><X size={15} /></button>
                </div>
              )}

              <PageTransitionStage routeKey={`ph-${page}`}>
                <PharmacyViews
                  page={page}
                  data={data}
                  pharmacyId={pharmacyId}
                  activePharmacy={activePharmacy}
                  canOperatePharmacy={canOperatePharmacy(currentOwned)}
                  onLogout={handlePharmacyLogout}
                  myProducts={myProducts}
                  categories={categories}
                  customCategories={customCategories}
                  adminTab={adminTab}
                  setAdminTab={setAdminTab}
                  query={query}
                  setQuery={setQuery}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  customCategory={customCategory}
                  setCustomCategory={setCustomCategory}
                  currentMessage={currentMessage}
                  setCurrentMessage={setCurrentMessage}
                  reply={reply}
                  setReply={setReply}
                  planPeriod={planPeriod}
                  setPlanPeriod={setPlanPeriod}
                  go={go}
                  say={say}
                  onDocumentsUploaded={refreshStateFromBackend}
                  addCategory={addCategory}
                  renameCategory={renameCategory}
                  removeCategory={removeCategory}
                  markAllNotices={markAllNotices}
                  deleteNotice={deleteNotice}
                  updatePreferences={updatePreferences}
                  resetProductForm={resetProductForm}
                  duplicateProduct={duplicateProduct}
                  removeProduct={removeProduct}
                  productStatus={productStatus}
                  updateStock={updateStock}
                  setMessageRead={setMessageRead}
                  sendReply={sendReply}
                  markNotice={markNotice}
                  changePlan={changePlan}
                  setExistingAccountRegistration={setExistingAccountRegistration}
                  setPharmacyForm={setPharmacyForm}
                  setProfileForm={setProfileForm}
                  setModal={setModal}
                />
              </PageTransitionStage>
            </main>
          </div>
        </div>
      )}

      <AppModals
        modal={modal}
        setModal={setModal}
        editingProduct={editingProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        handleProductImage={handleProductImage}
        saveProductDraft={() => saveProduct(true)}
        submitProduct={submitProduct}
        messageForm={messageForm}
        setMessageForm={setMessageForm}
        selectedPharmacy={selectedPharmacy}
        selectedProduct={selectedProduct}
        visitorAccount={visitorAccount}
        setVisitorAccount={setVisitorAccount}
        visitorLoggedIn={visitorLoggedIn}
        setVisitorLoggedIn={setVisitorLoggedIn}
        sendPublicMessage={sendPublicMessage}
        pharmacyForm={pharmacyForm}
        setPharmacyForm={setPharmacyForm}
        registerPharmacy={registerPharmacy}
        existingAccountRegistration={existingAccountRegistration}
        paymentDraft={paymentDraft}
        paymentOperators={paymentOperators}
        paymentMode={paymentMode}
        paymentBusy={paymentBusy}
        setPaymentDraft={setPaymentDraft}
        createPaymentRequest={createPaymentRequest}
        reportForm={reportForm}
        setReportForm={setReportForm}
        submitReport={submitReport}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        updateProfile={updateProfile}
        data={{ ...publicData, messages: visitorLoggedIn ? data.messages : [] }}
        activeVisitorThread={activeVisitorThread}
        setActiveVisitorThread={setActiveVisitorThread}
        visitorReply={visitorReply}
        setVisitorReply={setVisitorReply}
        sendVisitorReply={sendVisitorReply}
        pharmacyLoginForm={pharmacyLoginForm}
        setPharmacyLoginForm={setPharmacyLoginForm}
        pharmacyLoginError={pharmacyLoginError}
        setPharmacyLoginError={setPharmacyLoginError}
        setPharmacyLoggedIn={setPharmacyLoggedIn}
        setAccountOwnerId={setAccountOwnerId}
        setSelectedPharmacyId={setSelectedPharmacyId}
        refreshStateFromBackend={refreshStateFromBackend}
        openSpace={openSpace}
        go={go}
        say={say}
        setExistingAccountRegistration={setExistingAccountRegistration}
        pendingPharmacyPage={pendingPharmacyPage}
        setPendingPharmacyPage={setPendingPharmacyPage}
        publicPharmacies={publicPharmacies}
        favoritePharmacyIds={favoritePharmacyIds}
        toggleFavoritePharmacy={toggleFavoritePharmacy}
        onOpenPharmacyDetail={(id) => {
          setSelectedPharmacy(id);
          setModal(null);
          go('Fiche pharmacie');
        }}
        onTriggerGeo={() => {
          setModal(null);
          startGeo();
          go('Pharmacies');
        }}
        onRegistrationFilesChange={setRegistrationFiles}
        onLogoutVisitor={handleVisitorLogout}
      />

      <div className="global-footnote">
        PharmaConnect · Pas de panier, pas de commande, pas de checkout et pas de paiement de produits par les visiteurs.
      </div>
    </div>
  );
}
