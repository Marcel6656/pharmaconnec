'use client';

import { AuthenticatedImage } from '@/components/shared/AuthenticatedImage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Check,
  Heart,
  KeyRound,
  LogOut,
  MapPin,
  MessageSquarePlus,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AppData, Pharmacy, Product, money, Modal, Empty, isProductFresh, isStrongPassword, PASSWORD_POLICY_ERROR } from '@/lib/shared';
import { getProductImage } from '@/lib/media';
import { hasThirdPartyConsent } from '@/components/shared/CookieBanner';
import { RegistrationForm } from '@/components/shared/RegistrationForm';
import {
  ModernAlertWarningIcon,
  ModernChatEncryptedIcon,
  ModernCreditCardPlanIcon,
  ModernDigitalStoreIcon,
  ModernGoogleLogoIcon,
  ModernLockSecurityIcon,
  ModernMailEnvelopeIcon,
  ModernPackageBoxIcon,
  ModernPhoneCallIcon,
  ModernSendPlaneIcon,
  ModernUploadCloudIcon,
  ModernUserBadgeIcon,
  ModernVerifiedShieldIcon,
  ModernWhatsAppIcon,
  buildWhatsAppUrl
} from '@/components/shared/ModernIcons';
import {
  apiChangePassword,
  apiDeleteMe,
  apiGoogleAuth,
  apiLogin,
  apiLogoutAllSessions,
  apiRegisterVisitor,
  apiSendPublicMessage,
  apiUpdateMe,
  AuthSpace,
  AuthUserPayload,
  clearAuthToken,
  fetchGoogleAuthConfig,
  GoogleAuthConfig,
  GoogleAuthPayload,
} from '@/lib/api';

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential?: string }) => void;
          auto_select?: boolean;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            theme?: string;
            size?: string;
            shape?: string;
            width?: number;
            text?: string;
            locale?: string;
          },
        ) => void;
        disableAutoSelect?: () => void;
      };
      oauth2?: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
        }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
      };
    };
  };
};

interface AppModalsProps {
  modal: 'product' | 'message' | 'register' | 'profile' | 'account' | 'visitorInbox' | 'report' | 'payment' | 'pharmacyLogin' | null;
  setModal: (m: any) => void;
  editingProduct: Product | null;
  productForm: any;
  setProductForm: React.Dispatch<React.SetStateAction<any>>;
  categories: string[];
  handleProductImage: (file?: File) => void;
  saveProductDraft: () => void;
  submitProduct: (e: React.FormEvent) => void;
  messageForm: any;
  setMessageForm: React.Dispatch<React.SetStateAction<any>>;
  selectedPharmacy?: number;
  selectedProduct?: number | null;
  visitorAccount: { name: string; email: string; phone?: string; password?: string; provider?: 'email' | 'Google' };
  setVisitorAccount: React.Dispatch<React.SetStateAction<any>>;
  visitorLoggedIn?: boolean;
  setVisitorLoggedIn?: (v: boolean) => void;
  sendPublicMessage: (e: React.FormEvent) => void;
  pharmacyForm: any;
  setPharmacyForm: (f: any) => void;
  registerPharmacy: (e: React.FormEvent) => void;
  existingAccountRegistration: boolean;
  paymentDraft: { requestId: string; plan: string; amount: number; period: string; provider: string; phone: string };
  paymentOperators: string[];
  paymentMode: string;
  paymentBusy: boolean;
  setPaymentDraft: (p: any) => void;
  createPaymentRequest: (e: React.FormEvent) => void | Promise<void>;
  reportForm: any;
  setReportForm: (r: any) => void;
  submitReport: (e: React.FormEvent) => void;
  profileForm: any;
  setProfileForm: (p: any) => void;
  updateProfile: (e: React.FormEvent) => void;
  data: AppData;
  activeVisitorThread: number | null;
  setActiveVisitorThread: (id: number | null) => void;
  visitorReply: string;
  setVisitorReply: (r: string) => void;
  sendVisitorReply: (threadId: number) => void;
  pharmacyLoginForm: any;
  setPharmacyLoginForm: (f: any) => void;
  pharmacyLoginError: string;
  setPharmacyLoginError: (e: string) => void;
  pharmacyLoggedIn?: boolean;
  setPharmacyLoggedIn: (v: boolean) => void;
  setAccountOwnerId: (id: number) => void;
  setSelectedPharmacyId: (id: number) => void;
  refreshStateFromBackend: (targetOwnerId?: number) => Promise<AppData | null>;
  openSpace: (s: 'public' | 'pharmacy', forceAuth?: boolean) => void;
  go: (p: string) => void;
  say: (s: string) => void;
  setExistingAccountRegistration: (v: boolean) => void;
  pendingPharmacyPage?: string;
  setPendingPharmacyPage?: (p: string) => void;
  publicPharmacies?: Pharmacy[];
  favoritePharmacyIds?: number[];
  toggleFavoritePharmacy?: (pharmacyId: number) => void;
  onOpenPharmacyDetail?: (pharmacyId: number) => void;
  onTriggerGeo?: () => void;
  onRegistrationFilesChange?: (files: File[]) => void;
  onLogoutVisitor?: () => void;
  onOpenCookieSettings?: () => void;
}

export function AppModals({
  modal,
  setModal,
  editingProduct,
  productForm,
  setProductForm,
  categories,
  handleProductImage,
  saveProductDraft,
  submitProduct,
  messageForm,
  setMessageForm,
  selectedPharmacy,
  selectedProduct,
  visitorAccount,
  setVisitorAccount,
  visitorLoggedIn = false,
  setVisitorLoggedIn,
  sendPublicMessage,
  pharmacyForm,
  setPharmacyForm,
  registerPharmacy,
  existingAccountRegistration,
  paymentDraft,
  paymentOperators,
  paymentMode,
  paymentBusy,
  setPaymentDraft,
  createPaymentRequest,
  reportForm,
  setReportForm,
  submitReport,
  profileForm,
  setProfileForm,
  updateProfile,
  data,
  activeVisitorThread,
  setActiveVisitorThread,
  visitorReply,
  setVisitorReply,
  sendVisitorReply,
  pharmacyLoginForm,
  setPharmacyLoginForm,
  pharmacyLoginError,
  setPharmacyLoginError,
  pharmacyLoggedIn = false,
  setPharmacyLoggedIn,
  setAccountOwnerId,
  setSelectedPharmacyId,
  refreshStateFromBackend,
  openSpace,
  go,
  say,
  setExistingAccountRegistration,
  pendingPharmacyPage = 'Vue d’ensemble',
  setPendingPharmacyPage,
  publicPharmacies = [],
  favoritePharmacyIds = [],
  toggleFavoritePharmacy,
  onOpenPharmacyDetail,
  onTriggerGeo,
  onRegistrationFilesChange,
  onLogoutVisitor,
  onOpenCookieSettings,
}: AppModalsProps) {
  const [googleConfig, setGoogleConfig] = useState<GoogleAuthConfig | null>(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [messageConsent, setMessageConsent] = useState(false);
  const [paymentLegalAccepted, setPaymentLegalAccepted] = useState(false);
  const [visitorRegisterAccepted, setVisitorRegisterAccepted] = useState(false);
  const [visitorDeleting, setVisitorDeleting] = useState(false);
  const [visitorAuthMode, setVisitorAuthMode] = useState<'login' | 'register'>('login');
  const [visitorForm, setVisitorForm] = useState({ name: '', email: '', password: '' });
  const [visitorAuthError, setVisitorAuthError] = useState('');
  const [visitorAuthLoading, setVisitorAuthLoading] = useState(false);
  const [visitorSpaceTab, setVisitorSpaceTab] = useState<'overview' | 'messages' | 'favorites' | 'profile'>('overview');
  const [visitorComposeOpen, setVisitorComposeOpen] = useState(false);
  const [visitorComposeForm, setVisitorComposeForm] = useState({
    pharmacyId: '',
    productId: '',
    phone: '',
    subject: '',
    body: '',
  });
  const [visitorComposeLoading, setVisitorComposeLoading] = useState(false);
  const [visitorProfileForm, setVisitorProfileForm] = useState({ name: '', phone: '' });
  const [visitorProfileSaving, setVisitorProfileSaving] = useState(false);
  const [visitorPasswordForm, setVisitorPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [visitorPasswordSaving, setVisitorPasswordSaving] = useState(false);
  const [visitorSecurityError, setVisitorSecurityError] = useState('');
  const [favoritePickerId, setFavoritePickerId] = useState('');
  const gsiButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setThirdPartyConsent(hasThirdPartyConsent());
    const onConsentChange = () => setThirdPartyConsent(hasThirdPartyConsent());
    window.addEventListener('pc-cookie-consent-changed', onConsentChange);
    return () => window.removeEventListener('pc-cookie-consent-changed', onConsentChange);
  }, []);

  useEffect(() => {
    if (modal !== 'account' && modal !== 'pharmacyLogin') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal, setModal]);

  useEffect(() => {
    if (modal === 'message') setMessageConsent(false);
    if (modal === 'payment') setPaymentLegalAccepted(false);
    if (modal === 'account' || modal === 'pharmacyLogin') {
      setVisitorAuthMode('login');
      setVisitorAuthError('');
      setPharmacyLoginError('');
      setVisitorRegisterAccepted(false);
      setVisitorForm({
        name: visitorAccount.name || '',
        email: visitorAccount.email || '',
        password: '',
      });
    }
    if (modal === 'visitorInbox') {
      if (!visitorLoggedIn || !visitorAccount.email) {
        setModal('account');
        return;
      }
      setVisitorSpaceTab('overview');
      setVisitorSecurityError('');
      setVisitorProfileForm({
        name: visitorAccount.name || '',
        phone: visitorAccount.phone || '',
      });
      setVisitorComposeForm(prev => ({
        ...prev,
        pharmacyId: prev.pharmacyId || (publicPharmacies[0] ? String(publicPharmacies[0].id) : ''),
        phone: prev.phone || visitorAccount.phone || '',
      }));
      setFavoritePickerId(prev => prev || (publicPharmacies.find(p => !favoritePharmacyIds.includes(p.id))?.id ? String(publicPharmacies.find(p => !favoritePharmacyIds.includes(p.id))?.id) : ''));
    }
  }, [modal, visitorLoggedIn, visitorAccount.email, visitorAccount.name, visitorAccount.phone]);

  const applyAuthenticatedSession = async (
    session: {
      user: AuthUserPayload;
      space?: AuthSpace;
      redirectTo?: string;
      defaultPage?: string;
      primaryPharmacyId?: number | null;
    },
    welcomeMessage?: string,
  ) => {
    const resolvedSpace: AuthSpace =
      session.space ||
      (session.user.role === 'ADMIN'
        ? 'admin'
        : session.user.role === 'PHARMACIST'
          ? 'pharmacy'
          : 'visitor');

    if (resolvedSpace === 'admin') {
      try { sessionStorage.setItem('pharmaconnect-admin-auth', 'true'); } catch { }
      setVisitorLoggedIn?.(false);
      setPharmacyLoggedIn(false);
      setModal(null);
      say('Connexion administrateur réussie. Redirection vers l’espace d’administration…');
      if (typeof window !== 'undefined') {
        window.location.assign(session.redirectTo || '/admin');
      }
      return;
    }

    if (resolvedSpace === 'pharmacy') {
      const resolvedOwnerId = session.user.id;
      setPharmacyLoginForm({ email: '', password: '' });
      setAccountOwnerId(resolvedOwnerId);
      setVisitorLoggedIn?.(false);
      setVisitorAccount({ name: '', email: '' });
      setPharmacyLoggedIn(true);
      const refreshed = await refreshStateFromBackend(resolvedOwnerId);
      const targetPharmacyId =
        session.primaryPharmacyId ||
        refreshed?.pharmacies.find(p => p.ownerId === resolvedOwnerId)?.id;
      if (targetPharmacyId) setSelectedPharmacyId(targetPharmacyId);
      setModal(null);
      const targetPage = pendingPharmacyPage || session.defaultPage || 'Vue d’ensemble';
      openSpace('pharmacy', true);
      go(targetPage);
      setPendingPharmacyPage?.('Vue d’ensemble');
      say(welcomeMessage || `Connexion réussie. Bienvenue ${session.user.name || ''} dans votre espace pharmacie.`);
      return;
    }

    const cleanEmail = session.user.email.trim().toLowerCase();
    const cleanName = session.user.name?.trim() || cleanEmail.split('@')[0];
    setVisitorForm({ name: '', email: '', password: '' });
    setVisitorAccount({
      name: cleanName,
      email: cleanEmail,
      phone: session.user.phone || '',
      password: '',
      provider: session.user.provider === 'google' ? 'Google' : 'email',
    });
    setPharmacyLoggedIn(false);
    setVisitorLoggedIn?.(true);
    await refreshStateFromBackend();
    setModal('visitorInbox');
    say(welcomeMessage || `Connexion réussie. Bienvenue ${cleanName} !`);
  };

  const completeGoogleAuth = async (payload: GoogleAuthPayload) => {
    setGoogleLoading(true);
    setGoogleError('');
    setVisitorAuthError('');
    const currentPassword = visitorForm.password;
    const res = await apiGoogleAuth({ ...payload, currentPassword: currentPassword || undefined });
    setGoogleLoading(false);

    if (!res.ok) {
      setGoogleError(res.error);
      return;
    }

    await applyAuthenticatedSession(res, `Bienvenue ${res.user.name} ! Connexion via Google réussie.`);
  };

  const completeGoogleAuthRef = useRef(completeGoogleAuth);
  completeGoogleAuthRef.current = completeGoogleAuth;

  const ensureGoogleGsiReady = (timeoutMs = 5000): Promise<boolean> => {
    if (typeof window === 'undefined') return Promise.resolve(false);
    const hasGsi = () => {
      const acc = (window as GoogleWindow).google?.accounts;
      return Boolean(acc?.oauth2 || acc?.id);
    };
    if (hasGsi()) return Promise.resolve(true);

    return new Promise(resolve => {
      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearInterval(poll);
        clearTimeout(timer);
        if (script) {
          script.removeEventListener('load', onLoad);
          script.removeEventListener('error', onError);
        }
        resolve(ok);
      };

      const checkReady = () => {
        if (hasGsi()) done(true);
      };
      const onLoad = () => {
        if (script) script.dataset.gsiState = 'loaded';
        checkReady();
      };
      const onError = () => {
        if (script) script.dataset.gsiState = 'error';
        done(false);
      };

      let script = document.querySelector('script[src^="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
      if (script && script.dataset.gsiState === 'error') {
        script.remove();
        script = null;
      }
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.gsiState = 'loading';
        document.head.appendChild(script);
      }

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
      const poll = window.setInterval(checkReady, 100);
      const timer = window.setTimeout(() => done(hasGsi()), timeoutMs);
      checkReady();
    });
  };

  useEffect(() => {
    if (modal !== 'account' && modal !== 'pharmacyLogin') return;
    setGoogleError('');
    let active = true;

    fetchGoogleAuthConfig().then(async cfg => {
      if (!active) return;
      setGoogleConfig(cfg);
      if (!cfg.clientId || typeof window === 'undefined' || !hasThirdPartyConsent()) return;

      const ready = await ensureGoogleGsiReady(6000);
      if (!active) return;
      if (ready) {
        setGsiLoaded(true);
      } else {
        setGoogleError('Impossible de charger le service Google Identity (vérifiez votre connexion ou désactivez un bloqueur de script).');
      }
    });

    return () => {
      active = false;
    };
  }, [modal, thirdPartyConsent]);

  useEffect(() => {
    if ((modal !== 'account' && modal !== 'pharmacyLogin') || !googleConfig?.clientId || !gsiLoaded || typeof window === 'undefined') {
      return;
    }
    const gAccounts = (window as GoogleWindow).google?.accounts;
    if (!gAccounts?.id) return;

    gAccounts.id.initialize({
      client_id: googleConfig.clientId,
      callback: response => {
        if (response.credential) {
          void completeGoogleAuthRef.current({ idToken: response.credential });
        }
      },
    });

    const targetEl = gsiButtonRef.current;
    if (targetEl) {
      targetEl.innerHTML = '';
      gAccounts.id.renderButton(targetEl, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: 'continue_with',
        locale: 'fr',
      });
    }
  }, [modal, gsiLoaded, googleConfig?.clientId]);

  if (!modal) return null;

  const targetPharmacy = data.pharmacies.find(x => x.id === selectedPharmacy) || data.pharmacies[0];
  const targetProduct = selectedProduct ? data.products.find(x => x.id === selectedProduct) : null;

  const handleGoogleButtonClick = async () => {
    setGoogleError('');
    setVisitorAuthError('');

    if (!hasThirdPartyConsent()) {
      const msg = 'L’authentification Google requiert l’activation des services tiers dans vos préférences cookies.';
      setGoogleError(msg);
      return;
    }

    const cfg = googleConfig?.clientId ? googleConfig : await fetchGoogleAuthConfig();
    if (!googleConfig?.clientId) setGoogleConfig(cfg);

    if (!cfg.clientId) {
      setGoogleError('Connexion Google non configurée (renseignez GOOGLE_CLIENT_ID dans backend/.env).');
      return;
    }

    setGoogleLoading(true);
    const ready = await ensureGoogleGsiReady(5000);
    setGoogleLoading(false);
    if (ready) setGsiLoaded(true);

    const oauth2 = (window as GoogleWindow).google?.accounts?.oauth2;
    if (!oauth2) {
      setGoogleError('Le service Google Identity est bloqué ou inaccessible sur ce navigateur (vérifiez votre connexion Internet ou désactivez votre bloqueur de contenu pour localhost).');
      return;
    }

    const client = oauth2.initTokenClient({
      client_id: cfg.clientId,
      scope: 'openid email profile',
      callback: response => {
        if (response.error || !response.access_token) {
          setGoogleError(response.error_description || 'Connexion Google annulée ou refusée.');
          return;
        }
        void completeGoogleAuth({ accessToken: response.access_token });
      },
    });
    client.requestAccessToken({ prompt: 'select_account' });
  };

  return (
    <>
      {modal === 'product' && (
        <Modal
          title={editingProduct ? 'Modifier un produit' : 'Ajouter un produit'}
          icon={<ModernPackageBoxIcon size={20} />}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submitProduct}>
            <div className="form-grid">
              <label>Nom du produit *<input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Ex. Paracétamol 500 mg" /></label>
              <label>Catégorie *<select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
              <label>Marque / laboratoire<input value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} placeholder="Marque" /></label>
              <label>Code-barres<input value={productForm.code} onChange={e => setProductForm({ ...productForm, code: e.target.value })} placeholder="EAN / code-barres" /></label>
              <label>Prix (FCFA) *<input type="number" min="0" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></label>
              <label>Stock déclaré *<input type="number" min="0" required value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} /></label>
            </div>
            <label className="form-field">Description<textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Informations complémentaires…" /></label>
            <label className="upload-field">
              {productForm.imageDataUrl ? <AuthenticatedImage className="product-image-preview" src={productForm.imageDataUrl} alt="Aperçu du produit" /> : <ModernUploadCloudIcon size={20} />}
              <span><b>{productForm.imageDataUrl ? 'Image sélectionnée' : 'Ajouter une image du produit'}</b><small>Image compressée et enregistrée avec votre fiche produit.</small></span>
              <input type="file" accept="image/*" onChange={e => handleProductImage(e.target.files?.[0])} />
            </label>
            {productForm.imageDataUrl && <button type="button" className="subtle-link" onClick={() => setProductForm((f: any) => ({ ...f, imageDataUrl: '' }))}>Retirer l’image</button>}
            <div className="modal-info"><ModernVerifiedShieldIcon size={17} /> Toute modification d’un produit publié repasse en validation avant sa prochaine publication.</div>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setModal(null)}>Annuler</button>
              <button type="button" className="outline-btn" onClick={saveProductDraft}>Enregistrer en brouillon</button>
              <button className="primary-btn"><Check size={15} /> Soumettre pour validation</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'message' && (
        <Modal
          title="Contacter la pharmacie"
          icon={<ModernChatEncryptedIcon size={20} />}
          onClose={() => setModal(null)}
        >
          <form onSubmit={sendPublicMessage}>
            <div className="modal-info"><ModernChatEncryptedIcon size={17} /> Aucun compte visiteur n’est requis pour envoyer une demande. {visitorLoggedIn ? 'Cette conversation sera associée à votre compte.' : 'Connectez-vous avant l’envoi pour retrouver cette conversation dans votre espace.'} Évitez d’indiquer des données médicales sensibles inutiles dans votre message.</div>
            {targetProduct && (
              <div className="cg-whatsapp-modal-banner" style={{ background: '#f2fbf7', borderColor: 'rgba(13, 122, 95, 0.28)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={getProductImage(targetProduct)}
                    alt={targetProduct.name}
                    style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <b>{targetProduct.name}</b>
                    <small style={{ color: '#45665c' }}>{money(targetProduct.price)} · {targetProduct.category}</small>
                  </div>
                </div>
              </div>
            )}
            {targetPharmacy && (
              <div className="cg-whatsapp-modal-banner">
                <div>
                  <b>{targetPharmacy.name}</b>
                  <small>{targetPharmacy.phone} · Réponse directe</small>
                </div>
                <a
                  href={buildWhatsAppUrl(
                    targetPharmacy.phone,
                    targetProduct
                      ? `Bonjour ${targetPharmacy.name}, je souhaite vérifier la disponibilité de « ${targetProduct.name} » (${money(targetProduct.price)}).`
                      : `Bonjour ${targetPharmacy.name}, je souhaite appeler ou vous demander un renseignement via PharmaConnect.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="cg-whatsapp-chip"
                >
                  <ModernWhatsAppIcon size={15} /> Appeler sur WhatsApp
                </a>
              </div>
            )}
            <label className="form-field">Votre nom<input value={messageForm.sender} onChange={e => setMessageForm({ ...messageForm, sender: e.target.value })} placeholder="Nom ou prénom" /></label>
            <label className="form-field">Téléphone pour réponse {visitorLoggedIn ? '(facultatif)' : '*'}<input required={!visitorLoggedIn} value={messageForm.phone} onChange={e => setMessageForm({ ...messageForm, phone: e.target.value })} placeholder="Numéro de téléphone" /></label>
            <label className="form-field">Objet<input value={messageForm.subject} onChange={e => setMessageForm({ ...messageForm, subject: e.target.value })} placeholder="Objet du message" /></label>
            <label className="form-field">Votre message<textarea required value={messageForm.body} onChange={e => setMessageForm({ ...messageForm, body: e.target.value })} placeholder="Écrivez votre demande…" /></label>
            <label className="pc-consent-checkbox">
              <input
                type="checkbox"
                required
                checked={messageConsent}
                onChange={e => setMessageConsent(e.target.checked)}
              />
              <span>
                J’accepte que mes informations soient transmises à la pharmacie destinataire pour traiter ma demande, conformément à la{' '}
                <button type="button" className="pc-inline-text-link" onClick={() => { setModal(null); go('Confidentialité'); }}>
                  Politique de confidentialité
                </button>.
              </span>
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setModal(null)}>Annuler</button>
              <button className="primary-btn"><ModernSendPlaneIcon size={15} /> Envoyer</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'register' && (
        <Modal
          title="Inscrire une pharmacie"
          icon={<ModernDigitalStoreIcon size={20} />}
          onClose={() => setModal(null)}
          wide
        >
          <RegistrationForm form={pharmacyForm} setForm={setPharmacyForm} onSubmit={registerPharmacy} existingAccount={existingAccountRegistration} onFilesChange={onRegistrationFilesChange} go={(target) => { setModal(null); go(target); }} />
        </Modal>
      )}

      {modal === 'payment' && (
        <Modal
          title="Moyens de paiement & Abonnement"
          icon={<ModernCreditCardPlanIcon size={20} />}
          onClose={() => setModal(null)}
        >
          <form onSubmit={createPaymentRequest} className="cg-modal-form">
            <div className="subscription-current cg-sub-highlight">
              <div>
                <small>FORMULE SÉLECTIONNÉE</small>
                <h2>{paymentDraft.plan}</h2>
                <p>{paymentDraft.period} · {money(paymentDraft.amount)}</p>
              </div>
              <ModernCreditCardPlanIcon size={28} />
            </div>

            <div className="modal-info">
              <ModernPhoneCallIcon size={17} />
              <span>
                {pharmacyLoggedIn
                  ? paymentMode === 'live'
                    ? 'Demande Mobile Money transmise à votre opérateur.'
                    : 'Demande Mobile Money soumise au service de rapprochement pour vérification.'
                  : 'Choisissez votre moyen de paiement Mobile Money ci-dessous, puis connectez-vous à votre espace pharmacie ou inscrivez votre officine pour valider.'}{' '}
                Tarif ferme affiché ci-dessus (hors éventuels frais facturés directement par l’opérateur Mobile Money) · Sans reconduction tacite sans accord.
              </span>
            </div>

            <div className="form-field">
              <span>Choisir un moyen de paiement Mobile Money *</span>
              <div className="pc-payment-methods-grid" role="radiogroup" aria-label="Moyens de paiement Mobile Money">
                {paymentOperators.map(provider => {
                  const selected = paymentDraft.provider === provider;
                  return (
                    <button
                      key={provider}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={paymentBusy}
                      className={`pc-payment-method-card ${selected ? 'is-selected' : ''}`}
                      onClick={() => setPaymentDraft({ ...paymentDraft, provider })}
                    >
                      <span className="pc-payment-method-dot" aria-hidden="true" />
                      <div>
                        <b>{provider}</b>
                        <small>Mobile Money · FCFA</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="form-field">
              <span>Numéro Mobile Money *</span>
              <input required={pharmacyLoggedIn} type="tel" disabled={paymentBusy} value={paymentDraft.phone}
                onChange={e => setPaymentDraft({ ...paymentDraft, phone: e.target.value })}
                placeholder="Ex. +235 66 00 00 00" />
            </label>

            {pharmacyLoggedIn && (
              <label className="pc-consent-checkbox">
                <input
                  type="checkbox"
                  required
                  disabled={paymentBusy}
                  checked={paymentLegalAccepted}
                  onChange={e => setPaymentLegalAccepted(e.target.checked)}
                />
                <span>
                  J’accepte les{' '}
                  <button type="button" className="pc-inline-text-link" onClick={() => { setModal(null); go('Conditions générales'); }}>
                    Conditions Générales de Vente et modalités de rétractation (14 jours)
                  </button>.
                </span>
              </label>
            )}

            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={paymentBusy} onClick={() => setModal(null)}>Annuler</button>
              {pharmacyLoggedIn ? (
                <button className="primary-btn" disabled={paymentBusy}>
                  <ModernCreditCardPlanIcon size={15} />
                  {paymentBusy ? 'Envoi en cours…' : 'Envoyer la demande de paiement'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => {
                      setExistingAccountRegistration(false);
                      setModal('register');
                    }}
                  >
                    Inscrire ma pharmacie
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => {
                      setPendingPharmacyPage?.('Abonnement');
                      setPharmacyLoginError('');
                      setPharmacyLoginForm({ email: '', password: '' });
                      setModal('account');
                    }}
                  >
                    <ModernCreditCardPlanIcon size={15} /> Se connecter pour payer
                  </button>
                </>
              )}
            </div>
          </form>
        </Modal>
      )}

      {modal === 'report' && (() => {
        const targetPh = data.pharmacies.find(p => p.id === selectedPharmacy);
        const targetProd = selectedProduct ? data.products.find(p => p.id === selectedProduct) : null;
        const targetLabel = targetProd ? `${targetProd.name} (${targetPh?.name || 'Pharmacie'})` : (targetPh?.name || 'Établissement');
        return (
          <Modal
            title={`Signaler : ${targetLabel}`}
            icon={<ModernAlertWarningIcon size={20} />}
            onClose={() => setModal(null)}
          >
            <form onSubmit={submitReport}>
              <div className="modal-info"><ModernVerifiedShieldIcon size={17} /> Signalement concernant <b>{targetLabel}</b>. Utilisez ce formulaire pour signaler une information inexacte ou obsolète.</div>
              <label className="form-field">Motif<select value={reportForm.reason} onChange={e => setReportForm({ ...reportForm, reason: e.target.value })}>{['Information incorrecte', 'Pharmacie fermée', 'Coordonnées incorrectes', 'Produit ou prix inexact', 'Autre'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="form-field">Détails<textarea value={reportForm.details} onChange={e => setReportForm({ ...reportForm, details: e.target.value })} placeholder="Décrivez le problème…" /></label>
              <div className="modal-actions">
                <button type="button" className="outline-btn" onClick={() => setModal(null)}>Annuler</button>
                <button className="primary-btn"><ModernSendPlaneIcon size={15} /> Envoyer le signalement</button>
              </div>
            </form>
          </Modal>
        );
      })()}

      {modal === 'profile' && (
        <Modal
          title="Modifier l’établissement"
          icon={<ModernDigitalStoreIcon size={20} />}
          onClose={() => setModal(null)}
        >
          <form onSubmit={updateProfile}>
            {Object.entries(profileForm).map(([k, v]) => (
              <label className="form-field" key={k}>
                {({ name: 'Nom de la pharmacie', city: 'Ville', area: 'Quartier', address: 'Adresse', phone: 'Téléphone public', email: 'E-mail', responsible: 'Pharmacien responsable', lat: 'Latitude (facultatif)', lng: 'Longitude (facultatif)' } as Record<string, string>)[k]}
                <input required={!['lat', 'lng'].includes(k)} type={['lat', 'lng'].includes(k) ? 'number' : 'text'} step={['lat', 'lng'].includes(k) ? 'any' : undefined} value={v as string} onChange={e => setProfileForm({ ...profileForm, [k]: e.target.value })} />
              </label>
            ))}
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setModal(null)}>Annuler</button>
              <button className="primary-btn">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}

      {(modal === 'account' || modal === 'pharmacyLogin') && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Connexion à votre compte PharmaConnect"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setModal(null);
            }
          }}
        >
          <div className="modal-window gm-auth-window">
            <div className="gm-auth-card">
              {/* Moitié gauche : Visuel officine & présentation portail unique */}
              <div className="gm-auth-left">
                <img
                  src="/images/hero-pharmacist.jpg"
                  alt=""
                  className="gm-auth-bg-img"
                />
                <div className="gm-auth-left-overlay" />
                <div className="gm-auth-left-inner">
                  <div className="gm-brand-wordmark">
                    <span>PHARMA</span>
                    <strong>CONNECT</strong>
                  </div>

                  <div className="gm-left-center">
                    <h3>UN SEUL ACCÈS POUR CHAQUE PROFIL…</h3>
                    <p>
                      Connectez-vous avec vos identifiants : le serveur identifie votre compte et vous dirige automatiquement vers votre espace Patient, Pharmacie ou Administration.
                    </p>
                    <button
                      type="button"
                      className="gm-register-pill-btn"
                      onClick={() => {
                        setModal(null);
                        setExistingAccountRegistration(false);
                        setModal('register');
                      }}
                    >
                      INSCRIRE MON OFFICINE
                    </button>
                  </div>

                  <div className="gm-carousel-dots" aria-hidden="true">
                    <span className="gm-dot active" />
                    <span className="gm-dot" />
                  </div>
                </div>
              </div>

              {/* Moitié droite : Formulaire unique (Connexion / Inscription patient) */}
              <div className="gm-auth-right">
                <button
                  type="button"
                  className="gm-close-btn"
                  aria-label="Fermer"
                  onClick={() => {
                    setModal(null);
                  }}
                >
                  <X size={18} />
                </button>

                <form
                  className="gm-form-stack"
                  onSubmit={async e => {
                    e.preventDefault();
                    setVisitorAuthError('');
                    const emailLower = visitorForm.email.trim().toLowerCase();
                    const pass = visitorForm.password;
                    const cleanName = visitorForm.name.trim();

                    if (!emailLower || !emailLower.includes('@')) {
                      setVisitorAuthError('Saisissez une adresse e-mail valide.');
                      return;
                    }

                    if (visitorAuthMode === 'login') {
                      if (!pass) {
                        setVisitorAuthError('Saisissez votre mot de passe.');
                        return;
                      }
                      setVisitorAuthLoading(true);
                      const apiRes = await apiLogin(emailLower, pass);
                      setVisitorAuthLoading(false);

                      if (!apiRes.ok) {
                        setVisitorAuthError(apiRes.error);
                        return;
                      }

                      await applyAuthenticatedSession(apiRes.data);
                      return;
                    }

                    if (cleanName.length < 2) {
                      setVisitorAuthError('Saisissez votre nom complet (2 caractères minimum).');
                      return;
                    }
                    if (!isStrongPassword(pass)) {
                      setVisitorAuthError(PASSWORD_POLICY_ERROR);
                      return;
                    }
                    if (!visitorRegisterAccepted) {
                      setVisitorAuthError('Veuillez confirmer avoir au moins 15 ans (ou accord parental) et accepter les CGU et la Politique de confidentialité.');
                      return;
                    }

                    setVisitorAuthLoading(true);
                    const apiRes = await apiRegisterVisitor(cleanName, emailLower, pass);
                    setVisitorAuthLoading(false);

                    if (!apiRes) {
                      setVisitorAuthError('Impossible de créer ce compte (e-mail déjà utilisé ou serveur indisponible).');
                      return;
                    }

                    await applyAuthenticatedSession(apiRes, `Compte créé. Bienvenue ${apiRes.user.name?.trim() || cleanName} !`);
                  }}
                >
                  <h2>{visitorAuthMode === 'login' ? 'Connexion à votre espace' : 'Créer un compte patient'}</h2>
                  <p className="gm-form-sub">
                    {visitorAuthMode === 'login'
                      ? 'Patient, pharmacie ou administration : vous êtes orienté automatiquement selon votre compte.'
                      : 'Créez votre compte patient/visiteur pour suivre vos échanges et favoris.'}
                  </p>

                  <div className="gm-mode-tabs" role="tablist" aria-label="Mode d’authentification">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={visitorAuthMode === 'login'}
                      className={`gm-mode-btn ${visitorAuthMode === 'login' ? 'active' : ''}`}
                      onClick={() => { setVisitorAuthMode('login'); setVisitorAuthError(''); }}
                    >
                      Connexion
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={visitorAuthMode === 'register'}
                      className={`gm-mode-btn ${visitorAuthMode === 'register' ? 'active' : ''}`}
                      onClick={() => { setVisitorAuthMode('register'); setVisitorAuthError(''); }}
                    >
                      Inscription
                    </button>
                  </div>

                  {visitorAuthError && (
                    <div className="gm-error-alert">
                      <ModernAlertWarningIcon size={15} />
                      <span>{visitorAuthError}</span>
                    </div>
                  )}

                  {googleConfig?.clientId && (
                    <>
                      {/* Option d'inscription / connexion rapide via Google */}
                      <div className="gm-google-wrap">
                        {googleError && (
                          <div className="gm-error-alert" style={{ marginBottom: 8 }}>
                            <ModernAlertWarningIcon size={15} />
                            <div>
                              <span>{googleError}</span>
                              {!thirdPartyConsent && onOpenCookieSettings && (
                                <button
                                  type="button"
                                  className="gm-cookie-inline-btn"
                                  onClick={onOpenCookieSettings}
                                >
                                  Gérer les préférences cookies
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {!gsiLoaded && (
                          <button
                            type="button"
                            className="gm-google-pill-btn"
                            disabled={googleLoading}
                            onClick={() => handleGoogleButtonClick()}
                          >
                            <ModernGoogleLogoIcon size={18} />
                            <span>{googleLoading ? 'Connexion Google en cours…' : 'Continuer avec Google'}</span>
                          </button>
                        )}

                        {gsiLoaded && (
                          <div ref={gsiButtonRef} className="gm-gsi-official-slot" />
                        )}
                      </div>

                      <div className="gm-divider-line">
                        <span>ou avec votre e-mail</span>
                      </div>
                    </>
                  )}

                  {visitorAuthMode === 'register' && (
                    <div className="gm-pill-input-wrap">
                      <ModernUserBadgeIcon size={15} />
                      <input
                        required
                        value={visitorForm.name}
                        onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })}
                        placeholder="Nom & Prénom *"
                      />
                    </div>
                  )}

                  <div className="gm-pill-input-wrap">
                    <ModernMailEnvelopeIcon size={15} />
                    <input
                      type="email"
                      required
                      value={visitorForm.email}
                      onChange={e => setVisitorForm({ ...visitorForm, email: e.target.value })}
                      placeholder="Adresse E-mail *"
                    />
                  </div>

                  <div className="gm-pill-input-wrap">
                    <ModernLockSecurityIcon size={15} />
                    <input
                      type="password"
                      minLength={visitorAuthMode === 'register' ? 8 : 1}
                      required
                      value={visitorForm.password}
                      onChange={e => setVisitorForm({ ...visitorForm, password: e.target.value })}
                      placeholder={visitorAuthMode === 'register' ? 'Mot de passe (8 car. min, Maj, min, chiffre) *' : 'Mot de passe *'}
                    />
                  </div>

                  {visitorAuthMode === 'register' && (
                    <label className="pc-consent-checkbox pc-consent-on-dark">
                      <input
                        type="checkbox"
                        required
                        checked={visitorRegisterAccepted}
                        onChange={e => setVisitorRegisterAccepted(e.target.checked)}
                      />
                      <span>
                        Je confirme avoir au moins 15 ans (ou l’autorisation de mon représentant légal) et j’accepte les{' '}
                        <button type="button" className="pc-inline-text-link-light" onClick={() => { setModal(null); go('Conditions générales'); }}>
                          CGU
                        </button>{' '}
                        et la{' '}
                        <button type="button" className="pc-inline-text-link-light" onClick={() => { setModal(null); go('Confidentialité'); }}>
                          Politique de confidentialité
                        </button>.
                      </span>
                    </label>
                  )}

                  <button type="submit" className="gm-white-submit-btn" disabled={visitorAuthLoading}>
                    {visitorAuthLoading
                      ? 'VÉRIFICATION…'
                      : visitorAuthMode === 'login'
                        ? 'SE CONNECTER'
                        : 'CRÉER ET OUVRIR MON COMPTE'}
                  </button>

                  <div className="gm-security-caption">
                    <ModernVerifiedShieldIcon size={14} />
                    <span>Identification sécurisée · Redirection automatique selon votre compte</span>
                  </div>
                </form>

                <div className="gm-auth-copyright">
                  © 2026 PharmaConnect · KAYRA Innovation
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === 'visitorInbox' && visitorLoggedIn && visitorAccount.email && (() => {
        const visitorEmailLower = visitorAccount.email.trim().toLowerCase();
        const visitorThreads = data.messages
          .filter(m => m.direction === 'visitor' && !m.threadId && (m.visitorId || '').trim().toLowerCase() === visitorEmailLower)
          .sort((a, b) => b.id - a.id);
        const totalReplies = visitorThreads.reduce(
          (acc, thread) => acc + data.messages.filter(x => x.threadId === thread.id && x.direction === 'pharmacy').length,
          0,
        );
        const favoritePharmacies = publicPharmacies.filter(p => favoritePharmacyIds.includes(p.id));
        const selectedComposePharmacyId = Number(visitorComposeForm.pharmacyId) || publicPharmacies[0]?.id || 0;
        const composePharmacyProducts = data.products.filter(
          p => p.pharmacyId === selectedComposePharmacyId && p.status === 'Publié' && isProductFresh(p.stockUpdatedAt ?? p.updated, data.freshnessDays),
        );

        const openNewInquiryForPharmacy = (phId?: number) => {
          setVisitorComposeForm(prev => ({
            ...prev,
            pharmacyId: phId ? String(phId) : (prev.pharmacyId || (publicPharmacies[0] ? String(publicPharmacies[0].id) : '')),
            productId: '',
            phone: prev.phone || visitorAccount.phone || '',
          }));
          setVisitorComposeOpen(true);
          setVisitorSpaceTab('messages');
        };

        const submitVisitorInquiry = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!selectedComposePharmacyId) {
            say('Sélectionnez une pharmacie active.');
            return;
          }
          if (!visitorComposeForm.phone.trim() || !visitorComposeForm.body.trim()) {
            say('Téléphone et message obligatoires.');
            return;
          }
          setVisitorComposeLoading(true);
          const res = await apiSendPublicMessage({
            pharmacyId: selectedComposePharmacyId,
            productId: visitorComposeForm.productId ? Number(visitorComposeForm.productId) : undefined,
            sender: visitorAccount.name || 'Visiteur',
            phone: visitorComposeForm.phone.trim(),
            subject: visitorComposeForm.subject.trim() || 'Demande de disponibilité',
            body: visitorComposeForm.body.trim(),
            visitorEmail: visitorAccount.email,
          });
          setVisitorComposeLoading(false);
          if (!res.ok) {
            say(res.error);
            return;
          }
          setVisitorComposeForm(prev => ({ ...prev, productId: '', subject: '', body: '' }));
          setVisitorComposeOpen(false);
          await refreshStateFromBackend();
          say('Demande envoyée à la pharmacie.');
        };

        const saveVisitorProfile = async (e: React.FormEvent) => {
          e.preventDefault();
          if (visitorProfileForm.name.trim().length < 2) {
            say('Le nom complet doit contenir au moins 2 caractères.');
            return;
          }
          setVisitorProfileSaving(true);
          const res = await apiUpdateMe({
            name: visitorProfileForm.name.trim(),
            phone: visitorProfileForm.phone.trim(),
          });
          setVisitorProfileSaving(false);
          if (!res.ok) {
            say(res.error);
            return;
          }
          setVisitorAccount((prev: any) => ({
            ...prev,
            name: res.user.name,
            phone: res.user.phone || '',
          }));
          setVisitorComposeForm(prev => ({ ...prev, phone: res.user.phone || prev.phone }));
          say('Profil visiteur enregistré.');
        };

        const submitVisitorPasswordChange = async (e: React.FormEvent) => {
          e.preventDefault();
          setVisitorSecurityError('');
          if (!isStrongPassword(visitorPasswordForm.newPassword)) {
            setVisitorSecurityError(PASSWORD_POLICY_ERROR);
            return;
          }
          if (visitorPasswordForm.newPassword !== visitorPasswordForm.confirmPassword) {
            setVisitorSecurityError('La confirmation du mot de passe ne correspond pas.');
            return;
          }
          setVisitorPasswordSaving(true);
          const res = await apiChangePassword(visitorPasswordForm.currentPassword, visitorPasswordForm.newPassword);
          setVisitorPasswordSaving(false);
          if (!res.ok) {
            setVisitorSecurityError(res.error);
            return;
          }
          setVisitorPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          say('Mot de passe mis à jour. Les autres sessions ont été révoquées.');
        };

        const logoutAllDevices = async () => {
          const ok = await apiLogoutAllSessions();
          clearAuthToken();
          try {
            localStorage.removeItem('pharmaconnect-visitor-demo');
            (window as GoogleWindow).google?.accounts?.id?.disableAutoSelect?.();
          } catch { }
          setVisitorLoggedIn?.(false);
          setVisitorAccount({ name: '', email: '', phone: '', password: '' });
          setModal(null);
          await refreshStateFromBackend();
          say(ok ? 'Toutes vos sessions ont été déconnectées.' : 'Session locale déconnectée.');
        };

        return (
          <Modal
            title="Mon espace visiteur"
            icon={<ModernChatEncryptedIcon size={20} />}
            onClose={() => setModal(null)}
            wide
          >
            <div className="modal-info visitor-header-banner">
              <div className="visitor-header-identity">
                {visitorAccount.provider === 'Google' ? (
                  <span className="cg-google-connected-pill">
                    <ModernGoogleLogoIcon size={14} /> Compte Google vérifié
                  </span>
                ) : (
                  <span className="cg-google-connected-pill">
                    <ShieldCheck size={14} /> Compte patient
                  </span>
                )}
                <span>
                  <b>{visitorAccount.name || visitorAccount.email}</b> · {visitorAccount.email}
                  {visitorAccount.phone ? ` · ${visitorAccount.phone}` : ''}
                </span>
              </div>
              <button
                type="button"
                className="primary-btn visitor-quick-msg-btn"
                onClick={() => openNewInquiryForPharmacy()}
              >
                <MessageSquarePlus size={15} /> Nouvelle demande
              </button>
            </div>

            <div className="modal-tabs visitor-space-tabs" role="tablist" aria-label="Sections de l’espace visiteur">
              <button
                type="button"
                role="tab"
                aria-selected={visitorSpaceTab === 'overview'}
                className={visitorSpaceTab === 'overview' ? 'active' : ''}
                onClick={() => setVisitorSpaceTab('overview')}
              >
                Aperçu
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={visitorSpaceTab === 'messages'}
                className={visitorSpaceTab === 'messages' ? 'active' : ''}
                onClick={() => setVisitorSpaceTab('messages')}
              >
                Messagerie ({visitorThreads.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={visitorSpaceTab === 'favorites'}
                className={visitorSpaceTab === 'favorites' ? 'active' : ''}
                onClick={() => setVisitorSpaceTab('favorites')}
              >
                Favoris ({favoritePharmacies.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={visitorSpaceTab === 'profile'}
                className={visitorSpaceTab === 'profile' ? 'active' : ''}
                onClick={() => setVisitorSpaceTab('profile')}
              >
                Profil & Sécurité
              </button>
            </div>

            {visitorSpaceTab === 'overview' && (
              <div className="visitor-overview-pane">
                <div className="visitor-kpi-grid">
                  <div className="visitor-kpi-card">
                    <small>Conversations</small>
                    <strong>{visitorThreads.length}</strong>
                    <span>{totalReplies} réponse{totalReplies > 1 ? 's' : ''} d’officines</span>
                  </div>
                  <div className="visitor-kpi-card">
                    <small>Officines favorites</small>
                    <strong>{favoritePharmacies.length}</strong>
                    <span>Accès rapide 1 clic</span>
                  </div>
                  <div className="visitor-kpi-card">
                    <small>Réseau actif</small>
                    <strong>{publicPharmacies.length}</strong>
                    <span>Pharmacies vérifiées</span>
                  </div>
                </div>

                {!visitorAccount.phone && (
                  <div className="visitor-tip-banner">
                    <span>Ajoutez votre numéro de téléphone dans <b>Profil & Sécurité</b> pour pré-remplir vos demandes aux pharmacies.</span>
                    <button type="button" className="outline-btn" onClick={() => setVisitorSpaceTab('profile')}>
                      Compléter mon profil
                    </button>
                  </div>
                )}

                <div className="visitor-actions-grid">
                  <button type="button" className="visitor-action-card" onClick={() => openNewInquiryForPharmacy()}>
                    <MessageSquarePlus size={20} />
                    <div>
                      <b>Contacter une pharmacie</b>
                      <small>Vérifier la disponibilité d’un produit ou poser une question directement.</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="visitor-action-card"
                    onClick={() => {
                      setModal(null);
                      go('Produits');
                    }}
                  >
                    <Search size={20} />
                    <div>
                      <b>Rechercher un médicament</b>
                      <small>Parcourir le catalogue public et comparer les disponibilités en direct.</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="visitor-action-card"
                    onClick={() => {
                      if (onTriggerGeo) {
                        onTriggerGeo();
                      } else {
                        setModal(null);
                        go('Pharmacies');
                      }
                    }}
                  >
                    <MapPin size={20} />
                    <div>
                      <b>Pharmacies à proximité</b>
                      <small>Trouver les officines ouvertes ou de garde autour de votre position.</small>
                    </div>
                  </button>
                  <button type="button" className="visitor-action-card" onClick={() => setVisitorSpaceTab('favorites')}>
                    <Heart size={20} />
                    <div>
                      <b>Gérer mes officines favorites</b>
                      <small>Enregistrer vos pharmacies habituelles pour les joindre plus vite.</small>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {visitorSpaceTab === 'messages' && (
              <div className="visitor-messages-pane">
                <div className="visitor-pane-toolbar">
                  <span>{visitorThreads.length} discussion{visitorThreads.length > 1 ? 's' : ''} enregistrée{visitorThreads.length > 1 ? 's' : ''}</span>
                  <button
                    type="button"
                    className={visitorComposeOpen ? 'outline-btn' : 'primary-btn'}
                    onClick={() => setVisitorComposeOpen(v => !v)}
                  >
                    <MessageSquarePlus size={15} /> {visitorComposeOpen ? 'Masquer le formulaire' : 'Écrire à une pharmacie'}
                  </button>
                </div>

                {visitorComposeOpen && (
                  <form className="visitor-compose-card" onSubmit={submitVisitorInquiry}>
                    <div className="form-grid-2">
                      <label className="form-field">
                        Pharmacie destinataire *
                        <select
                          required
                          value={selectedComposePharmacyId || ''}
                          onChange={e => setVisitorComposeForm(prev => ({ ...prev, pharmacyId: e.target.value, productId: '' }))}
                        >
                          {publicPharmacies.length === 0 && <option value="">Aucune pharmacie active</option>}
                          {publicPharmacies.map(ph => (
                            <option key={ph.id} value={ph.id}>
                              {ph.name} ({ph.city} · {ph.area})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="form-field">
                        Produit concerné (facultatif)
                        <select
                          value={visitorComposeForm.productId}
                          onChange={e => {
                            const pid = e.target.value;
                            const chosen = composePharmacyProducts.find(pr => String(pr.id) === pid);
                            setVisitorComposeForm(prev => ({
                              ...prev,
                              productId: pid,
                              subject: prev.subject || (chosen ? `Disponibilité : ${chosen.name}` : ''),
                            }));
                          }}
                        >
                          <option value="">Demande générale</option>
                          {composePharmacyProducts.map(pr => (
                            <option key={pr.id} value={pr.id}>
                              {pr.name} — {money(pr.price)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="form-grid-2">
                      <label className="form-field">
                        Téléphone pour rappel *
                        <input
                          required
                          value={visitorComposeForm.phone}
                          onChange={e => setVisitorComposeForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+235 ..."
                        />
                      </label>
                      <label className="form-field">
                        Objet
                        <input
                          value={visitorComposeForm.subject}
                          onChange={e => setVisitorComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Ex. Disponibilité paracétamol"
                        />
                      </label>
                    </div>
                    <label className="form-field">
                      Votre message *
                      <textarea
                        required
                        rows={3}
                        value={visitorComposeForm.body}
                        onChange={e => setVisitorComposeForm(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="Précisez votre demande ou le produit recherché…"
                      />
                    </label>
                    <div className="modal-actions">
                      <button type="button" className="outline-btn" onClick={() => setVisitorComposeOpen(false)}>
                        Annuler
                      </button>
                      <button type="submit" className="primary-btn" disabled={visitorComposeLoading || publicPharmacies.length === 0}>
                        <ModernSendPlaneIcon size={15} /> {visitorComposeLoading ? 'Envoi…' : 'Envoyer la demande'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="visitor-inbox">
                  {visitorThreads.map(m => (
                    <section className="visitor-thread-card" key={m.id}>
                      <div className="visitor-thread-heading">
                        <b>{m.subject}</b>
                        <small>{data.pharmacies.find(p => p.id === m.pharmacyId)?.name || 'Pharmacie'} · {m.date}</small>
                      </div>
                      <div className="message-bubble incoming"><small>Vous</small><p>{m.body}</p></div>
                      {data.messages.filter(x => x.threadId === m.id).sort((a, b) => a.id - b.id).map(x => (
                        <div className={`message-bubble ${x.direction === 'pharmacy' ? 'outgoing' : 'incoming'}`} key={x.id}>
                          <small>{x.sender} · {x.date}</small>
                          <p>{x.body}</p>
                        </div>
                      ))}
                      <form className="reply-box visitor-reply" onSubmit={e => { e.preventDefault(); sendVisitorReply(m.id); }}>
                        <textarea value={activeVisitorThread === m.id ? visitorReply : ''} onFocus={() => { if (activeVisitorThread !== m.id) { setActiveVisitorThread(m.id); setVisitorReply(''); } }} onChange={e => { setActiveVisitorThread(m.id); setVisitorReply(e.target.value); }} placeholder="Répondre à la pharmacie…" />
                        <button className="primary-btn"><ModernSendPlaneIcon size={15} /> Envoyer</button>
                      </form>
                    </section>
                  ))}
                  {visitorThreads.length === 0 && (
                    <Empty
                      title="Aucune conversation pour le moment"
                      detail="Cliquez sur « Écrire à une pharmacie » ci-dessus pour envoyer votre première demande."
                    />
                  )}
                </div>
              </div>
            )}

            {visitorSpaceTab === 'favorites' && (
              <div className="visitor-favorites-pane">
                <div className="visitor-favorite-picker">
                  <select
                    value={favoritePickerId}
                    onChange={e => setFavoritePickerId(e.target.value)}
                    aria-label="Choisir une pharmacie à ajouter aux favoris"
                  >
                    <option value="">Ajouter une officine aux favoris…</option>
                    {publicPharmacies
                      .filter(p => !favoritePharmacyIds.includes(p.id))
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.city} ({p.area})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={!favoritePickerId}
                    onClick={() => {
                      const id = Number(favoritePickerId);
                      if (!id) return;
                      toggleFavoritePharmacy?.(id);
                      setFavoritePickerId('');
                    }}
                  >
                    <Heart size={15} /> Ajouter
                  </button>
                </div>

                {favoritePharmacies.length === 0 ? (
                  <Empty
                    title="Aucune pharmacie favorite"
                    detail="Ajoutez vos officines habituelles ci-dessus pour accéder à leur fiche et les contacter en 1 clic."
                  />
                ) : (
                  <div className="visitor-favorites-list">
                    {favoritePharmacies.map(ph => (
                      <div className="visitor-favorite-card" key={ph.id}>
                        <div>
                          <b>{ph.name}</b>
                          <small>{ph.city} · {ph.area} · {ph.phone}</small>
                          {ph.openingHours && <small>{ph.openingHours}</small>}
                        </div>
                        <div className="visitor-favorite-actions">
                          {onOpenPharmacyDetail && (
                            <button type="button" className="outline-btn" onClick={() => onOpenPharmacyDetail(ph.id)}>
                              <Building2 size={14} /> Voir la fiche
                            </button>
                          )}
                          <button type="button" className="primary-btn" onClick={() => openNewInquiryForPharmacy(ph.id)}>
                            <MessageSquarePlus size={14} /> Contacter
                          </button>
                          <button
                            type="button"
                            className="outline-btn"
                            onClick={() => toggleFavoritePharmacy?.(ph.id)}
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {visitorSpaceTab === 'profile' && (
              <div className="visitor-profile-grid">
                <form className="visitor-profile-card" onSubmit={saveVisitorProfile}>
                  <h3><ModernUserBadgeIcon size={17} /> Mes informations</h3>
                  <label className="form-field">
                    Nom complet
                    <input
                      required
                      minLength={2}
                      value={visitorProfileForm.name}
                      onChange={e => setVisitorProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </label>
                  <label className="form-field">
                    Adresse e-mail
                    <input disabled value={visitorAccount.email} />
                  </label>
                  <label className="form-field">
                    Téléphone de contact
                    <input
                      value={visitorProfileForm.phone}
                      onChange={e => setVisitorProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+235 66 ..."
                    />
                  </label>
                  <button type="submit" className="primary-btn" disabled={visitorProfileSaving}>
                    {visitorProfileSaving ? 'Enregistrement…' : 'Enregistrer mon profil'}
                  </button>
                </form>

                <div className="visitor-profile-card">
                  <h3><KeyRound size={17} /> Sécurité du compte</h3>
                  {visitorAccount.provider === 'Google' ? (
                    <div className="modal-info">
                      <ModernGoogleLogoIcon size={16} />
                      <span>Votre connexion est protégée par Google OAuth. Gérez votre mot de passe directement depuis votre compte Google.</span>
                    </div>
                  ) : (
                    <form onSubmit={submitVisitorPasswordChange} className="visitor-password-form">
                      {visitorSecurityError && (
                        <div className="gm-error-alert">
                          <ModernAlertWarningIcon size={15} />
                          <span>{visitorSecurityError}</span>
                        </div>
                      )}
                      <label className="form-field">
                        Mot de passe actuel
                        <input
                          type="password"
                          required
                          value={visitorPasswordForm.currentPassword}
                          onChange={e => setVisitorPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                      </label>
                      <label className="form-field">
                        Nouveau mot de passe (8 car. min)
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={visitorPasswordForm.newPassword}
                          onChange={e => setVisitorPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </label>
                      <label className="form-field">
                        Confirmer le nouveau mot de passe
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={visitorPasswordForm.confirmPassword}
                          onChange={e => setVisitorPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </label>
                      <button type="submit" className="primary-btn" disabled={visitorPasswordSaving}>
                        {visitorPasswordSaving ? 'Mise à jour…' : 'Changer mon mot de passe'}
                      </button>
                    </form>
                  )}

                  <div className="visitor-session-box">
                    <small>Vous pouvez révoquer tous vos jetons de session actifs sur d’autres appareils.</small>
                    <button type="button" className="outline-btn" onClick={logoutAllDevices}>
                      <LogOut size={14} /> Déconnecter tous mes appareils
                    </button>
                  </div>

                  <div className="pc-danger-zone">
                    <strong>Suppression définitive du compte (RGPD art. 17)</strong>
                    <small>Supprime votre compte visiteur et anonymise vos données personnelles sans délai.</small>
                    <button
                      type="button"
                      className="pc-danger-btn"
                      disabled={visitorDeleting}
                      onClick={async () => {
                        if (!window.confirm('Confirmer la suppression définitive de votre compte et l’anonymisation de vos données personnelles ? Cette action est irréversible.')) {
                          return;
                        }
                        setVisitorDeleting(true);
                        const res = await apiDeleteMe();
                        setVisitorDeleting(false);
                        if (!res.ok) {
                          setVisitorSecurityError(res.error);
                          return;
                        }
                        try {
                          localStorage.removeItem('pharmaconnect-visitor-demo');
                          localStorage.removeItem('pharmaconnect-visitor-accounts');
                          localStorage.removeItem('pharmaconnect-visitor-favorites-v2');
                        } catch { }
                        setVisitorLoggedIn?.(false);
                        setVisitorAccount({ name: '', email: '', phone: '' });
                        setModal(null);
                        await refreshStateFromBackend();
                        say('Votre compte visiteur a été supprimé.');
                      }}
                    >
                      {visitorDeleting ? 'Suppression en cours…' : 'Supprimer mon compte et mes données'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="outline-btn"
                onClick={() => {
                  try {
                    (window as GoogleWindow).google?.accounts?.id?.disableAutoSelect?.();
                  } catch { }
                  if (onLogoutVisitor) {
                    void onLogoutVisitor();
                    return;
                  }
                  clearAuthToken();
                  try {
                    localStorage.removeItem('pharmaconnect-visitor-demo');
                  } catch { }
                  setVisitorLoggedIn?.(false);
                  setVisitorAccount({ name: '', email: '', phone: '', password: '' });
                  setModal(null);
                  void refreshStateFromBackend();
                  say('Compte visiteur déconnecté.');
                }}
              >
                Déconnexion
              </button>
              <button type="button" className="primary-btn" onClick={() => setModal(null)}>Fermer</button>
            </div>
          </Modal>
        );
      })()}
    </>
  );
}
