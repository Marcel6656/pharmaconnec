import type { AppData } from './shared';

const TOKEN_STORAGE_KEY = 'pharmaconnect-jwt-token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch { }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch { }
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function reloadOnAuthChange() {
  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea === window.localStorage && (event.key === TOKEN_STORAGE_KEY || event.key === null)) {
      window.location.reload();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

export async function fetchBackendState(token = getAuthToken()): Promise<(Partial<AppData> & { customCategories?: Record<number, string[]> }) | null> {
  try {
    const res = await fetch('/api/state', {
      method: 'GET',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

type LoginSession = {
  accessToken: string;
  user: { id: number; email: string; name: string; role: string; phone?: string };
};

export async function apiLogin(email: string, password: string, role: 'ADMIN' | 'PHARMACIST' | 'VISITOR') {
  const result = await apiRequest<LoginSession>('/api/auth/login', 'POST', {
    email: email.trim().toLowerCase(), password, role,
  }, 'Connexion indisponible.');
  if (result.ok) {
    if (!result.data?.accessToken || result.data.user?.role !== role) {
      return { ok: false as const, error: 'Le serveur n’a pas renvoyé une session valide.' };
    }
    setAuthToken(result.data.accessToken);
  }
  return result;
}

export async function apiRegisterVisitor(
  name: string,
  email: string,
  password: string,
): Promise<{ accessToken: string; user: { id: number; email: string; name: string; role: string; phone?: string } } | null> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.accessToken) setAuthToken(data.accessToken);
    return data;
  } catch {
    return null;
  }
}

export interface GoogleAuthConfig {
  enabled: boolean;
  clientId: string | null;
  demoMode: boolean;
}

export interface GoogleAuthPayload {
  idToken?: string;
  accessToken?: string;
  currentPassword?: string;
  email?: string;
  name?: string;
  role?: 'VISITOR' | 'PHARMACIST';
}

export type GoogleAuthResult =
  | {
    ok: true;
    accessToken: string;
    user: { id: number; email: string; name: string; role: string; provider?: string; phone?: string };
  }
  | {
    ok: false;
    error: string;
  };

export async function fetchGoogleAuthConfig(): Promise<GoogleAuthConfig> {
  const publicClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || null;
  try {
    const res = await fetch('/api/auth/google/config', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return { enabled: Boolean(publicClientId), clientId: publicClientId, demoMode: false };
    }
    const remote = (await res.json()) as Partial<GoogleAuthConfig>;
    const clientId = (remote.clientId && String(remote.clientId).trim()) || publicClientId;
    return {
      enabled: Boolean(clientId),
      clientId,
      demoMode: false,
    };
  } catch {
    return { enabled: Boolean(publicClientId), clientId: publicClientId, demoMode: false };
  }
}

export async function apiGoogleAuth(
  payloadOrEmail: GoogleAuthPayload | string,
  name?: string,
  idToken?: string,
): Promise<GoogleAuthResult> {
  const payload: GoogleAuthPayload =
    typeof payloadOrEmail === 'string'
      ? { email: payloadOrEmail, name, idToken }
      : payloadOrEmail;
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Échec de l’authentification Google.' };
    }
    if (data?.accessToken) setAuthToken(data.accessToken);
    return { ok: true, accessToken: data.accessToken, user: data.user };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur d’authentification.' };
  }
}

export async function apiCreatePayment(
  pharmacyId: number,
  payload: {
    plan: string;
    period: string;
    provider: string;
    payerPhone: string;
    requestId: string;
  },
): Promise<{ ok: true; payment: any } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/pharmacies/${pharmacyId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible d’enregistrer le paiement.' };
    }
    return { ok: true, payment: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter la passerelle Mobile Money.' };
  }
}

export async function apiMe(): Promise<{
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'PHARMACIST' | 'VISITOR';
  provider?: string;
  phone?: string;
  pharmacies?: Array<{ id: number; name: string; status: string }>;
} | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: { Accept: 'application/json', ...authHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRegisterPharmacy(payload: {
  accountEmail?: string;
  password?: string;
  accountName?: string;
  name: string;
  city: string;
  area?: string;
  address?: string;
  phone: string;
  email?: string;
  license: string;
  responsible?: string;
  lat?: number;
  lng?: number;
  plan?: string;
  documents?: string;
}): Promise<{ ok: true; pharmacy: any; accessToken?: string; user?: any } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/pharmacies/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible d’enregistrer l’établissement.' };
    }
    if (data?.accessToken) setAuthToken(data.accessToken);
    return { ok: true, pharmacy: data.pharmacy, accessToken: data.accessToken, user: data.user };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiSendPublicMessage(payload: {
  pharmacyId: number;
  productId?: number;
  sender?: string;
  phone: string;
  subject?: string;
  body: string;
  visitorEmail?: string;
}): Promise<{ ok: true; message: any } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible d’envoyer le message.' };
    }
    return { ok: true, message: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiSendVisitorReply(
  threadId: number,
  body: string,
): Promise<{ ok: true; message: any } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/messages/${threadId}/visitor-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ body }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible d’envoyer la réponse.' };
    }
    return { ok: true, message: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiSubmitReport(payload: {
  pharmacyId: number;
  productId?: number;
  reason: string;
  details: string;
  target?: string;
}): Promise<{ ok: true; report: any } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible d’envoyer le signalement.' };
    }
    return { ok: true, report: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiSubmitContact(payload: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible d’envoyer votre message.' };
    }
    return { ok: true, message: data?.message || 'Message envoyé avec succès.' };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiAdminUpdatePaymentStatus(
  paymentId: number,
  status: 'Confirmé' | 'Échoué',
  externalRef?: string,
): Promise<{ ok: true; payment: any } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/admin/payments/${paymentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status, externalRef }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible de mettre à jour le paiement.' };
    }
    return { ok: true, payment: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export interface AdminContactItem {
  id: number;
  userId?: number | null;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'Nouveau' | 'En cours' | 'Traité' | 'Archivé';
  adminNote?: string;
  date: string;
}

export async function apiAdminContacts(): Promise<AdminContactItem[]> {
  try {
    const res = await fetch('/api/admin/contacts', {
      method: 'GET',
      headers: { Accept: 'application/json', ...authHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function apiAdminUpdateContact(
  id: number,
  status: 'Nouveau' | 'En cours' | 'Traité' | 'Archivé',
  adminNote?: string,
): Promise<{ ok: true; contact: AdminContactItem } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status, ...(adminNote !== undefined ? { adminNote } : {}) }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible de mettre à jour la demande.' };
    }
    return { ok: true, contact: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiAdminUpdateProductStatus(
  productId: number,
  status: string,
  note?: string,
  expectedModifiedAt?: string,
): Promise<{ ok: true; product: any } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status, note, expectedModifiedAt }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible de modifier le statut du produit.' };
    }
    return { ok: true, product: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible de modifier le mot de passe.' };
    }
    if (data?.accessToken) setAuthToken(data.accessToken);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiUpdateMe(payload: {
  name?: string;
  phone?: string;
}): Promise<{ ok: true; user: { id: number; email: string; name: string; role: string; provider?: string; phone?: string } } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible de mettre à jour votre profil.' };
    }
    return { ok: true, user: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiLogoutAllSessions(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/logout-all', {
      method: 'POST',
      headers: { ...authHeaders() },
    });
    if (res.ok) clearAuthToken();
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiUploadPharmacyDocuments(
  pharmacyId: number,
  files: File[],
): Promise<{ ok: true; documents: any[] } | { ok: false; error: string }> {
  if (!files.length) return { ok: true, documents: [] };
  try {
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    const res = await fetch(`/api/pharmacies/${pharmacyId}/documents`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: fd,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Échec de l’envoi des justificatifs.' };
    }
    return { ok: true, documents: Array.isArray(data) ? data : [] };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur pour envoyer les justificatifs.' };
  }
}

export async function apiRequest<T = any>(
  url: string,
  method: string,
  body?: unknown,
  fallbackErr = 'Opération impossible.',
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...authHeaders(),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || fallbackErr };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export async function apiAdminListPharmacies(): Promise<any[]> {
  const res = await apiRequest<any[]>('/api/admin/pharmacies', 'GET', undefined);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiAdminDownloadDocument(docId: number, fileName: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/admin/documents/${docId}/download`, {
      method: 'GET',
      headers: { ...authHeaders() },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible de télécharger le justificatif.' };
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `justificatif-${docId}`;
    a.click();
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export const apiAdminUpdatePharmacyStatus = (pharmacyId: number, status: string, note?: string) =>
  apiRequest(
    `/api/admin/pharmacies/${pharmacyId}/status`,
    'PATCH',
    { status, ...(note ? { note } : {}) },
    'Statut établissement non modifié.',
  );

export const apiAdminRemoveProduct = (productId: number) =>
  apiRequest(`/api/admin/products/${productId}`, 'DELETE', undefined, 'Impossible de supprimer le produit.');

export const apiAdminAddCategory = (name: string) =>
  apiRequest('/api/admin/categories', 'POST', { name }, 'Impossible d’ajouter la catégorie.');

export const apiAdminRemoveCategory = (name: string) =>
  apiRequest(`/api/admin/categories/${encodeURIComponent(name)}`, 'DELETE', undefined, 'Impossible de retirer la catégorie.');

export const apiAdminSaveBadge = (
  id: number | null,
  payload: { name: string; description: string; color: string; icon: string; visible: boolean; expiryDays: number | null },
) =>
  apiRequest(
    id ? `/api/admin/badges/${id}` : '/api/admin/badges',
    id ? 'PATCH' : 'POST',
    payload,
    'Impossible d’enregistrer le badge.',
  );

export const apiAdminDeleteBadge = (id: number) =>
  apiRequest(`/api/admin/badges/${id}`, 'DELETE', undefined, 'Impossible de supprimer le badge.');

export const apiAdminSetPharmacyBadge = (pharmacyId: number, badgeId: number, checked: boolean) =>
  apiRequest(
    `/api/admin/pharmacies/${pharmacyId}/badges/${badgeId}`,
    'PUT',
    { checked },
    'Impossible de mettre à jour le badge.',
  );

export const apiAdminUpdatePlan = (
  name: string,
  payload: { monthly: number; quarterly: number; yearly: number; description: string; features: string[] },
) => apiRequest(`/api/admin/plans/${encodeURIComponent(name)}`, 'PATCH', payload, 'Impossible de mettre à jour la formule.');

export const apiAdminUpdateReportStatus = (reportId: number, status: string) =>
  apiRequest(`/api/admin/reports/${reportId}/status`, 'PATCH', { status }, 'Impossible de mettre à jour le signalement.');

export interface AdminUserItem {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'PHARMACIST' | 'VISITOR';
  provider: string;
  phone: string;
  active: boolean;
  pharmaciesCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminSettingsPayload {
  freshnessDays: number;
  platformBanner?: string;
  supportPhone?: string;
  supportEmail?: string;
}

export async function apiAdminDashboard(): Promise<Record<string, number> | null> {
  const res = await apiRequest<Record<string, number>>('/api/admin/dashboard', 'GET');
  return res.ok ? res.data : null;
}

export async function apiAdminUsers(): Promise<AdminUserItem[]> {
  const res = await apiRequest<AdminUserItem[]>('/api/admin/users', 'GET');
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export const apiAdminUpdateUserStatus = (userId: number, active: boolean, reason?: string) =>
  apiRequest<AdminUserItem>(
    `/api/admin/users/${userId}/status`,
    'PATCH',
    { active, ...(reason ? { reason } : {}) },
    'Impossible de mettre à jour ce compte utilisateur.',
  );

export async function apiAdminGetHealthSection(): Promise<{
  alerts?: any[];
  news?: any[];
  emergencyNumbers?: any[];
  updatedAt?: string;
  updatedBy?: string;
} | null> {
  const res = await apiRequest<any>('/api/admin/health-section', 'GET');
  return res.ok ? res.data : null;
}

export const apiAdminSaveHealthSection = (payload: {
  alerts: any[];
  news: any[];
  emergencyNumbers: any[];
}) =>
  apiRequest(
    '/api/admin/health-section',
    'PUT',
    payload,
    'Impossible d’enregistrer la Rubrique Santé.',
  );

export async function apiAdminGetSettings(): Promise<AdminSettingsPayload | null> {
  const res = await apiRequest<AdminSettingsPayload>('/api/admin/settings', 'GET');
  return res.ok ? res.data : null;
}

export const apiAdminUpdateSettings = (
  freshnessDaysOrPayload: number | AdminSettingsPayload,
) => {
  const payload =
    typeof freshnessDaysOrPayload === 'number'
      ? { freshnessDays: freshnessDaysOrPayload }
      : freshnessDaysOrPayload;
  return apiRequest<AdminSettingsPayload>(
    '/api/admin/settings',
    'PATCH',
    payload,
    'Impossible de mettre à jour les paramètres.',
  );
};

export async function apiAdminAuditLogs(params?: { limit?: number; actor?: string; q?: string }): Promise<any[]> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.actor && params.actor !== 'Tous') qs.set('actor', params.actor);
  if (params?.q?.trim()) qs.set('q', params.q.trim());
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await apiRequest<any[]>(`/api/admin/audit-logs${suffix}`, 'GET');
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

// --- CRUD complémentaires (Pharmacie & Admin) ---
export const apiRenameCustomCategory = (pharmacyId: number, oldName: string, newName: string) =>
  apiRequest(
    `/api/pharmacies/${pharmacyId}/categories/${encodeURIComponent(oldName)}`,
    'PATCH',
    { name: newName },
    'Impossible de renommer la catégorie.',
  );

export interface PharmacyDocumentItem {
  id: number;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export async function apiListPharmacyDocuments(pharmacyId: number): Promise<PharmacyDocumentItem[]> {
  const res = await apiRequest<PharmacyDocumentItem[]>(`/api/pharmacies/${pharmacyId}/documents`, 'GET');
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export const apiDeletePharmacyDocument = (pharmacyId: number, docId: number) =>
  apiRequest(`/api/pharmacies/${pharmacyId}/documents/${docId}`, 'DELETE', undefined, 'Impossible de supprimer le justificatif.');

export async function apiUploadPharmacyCover(
  pharmacyId: number,
  file: File,
): Promise<{ ok: true; pharmacy: any } | { ok: false; error: string }> {
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/pharmacies/${pharmacyId}/cover`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: fd,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return { ok: false, error: msg || 'Impossible de mettre à jour la photo de couverture.' };
    }
    return { ok: true, pharmacy: data };
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur.' };
  }
}

export const apiDeleteNotice = (noticeId: number) =>
  apiRequest(`/api/notices/${noticeId}`, 'DELETE', undefined, 'Impossible de supprimer la notification.');

export const apiAdminCreatePharmacy = (payload: {
  name: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  license: string;
  responsible: string;
  subscription?: string;
  ownerId?: number;
  lat?: number;
  lng?: number;
  documents?: string;
}) => apiRequest('/api/admin/pharmacies', 'POST', payload, 'Impossible de créer l’établissement.');

export const apiAdminUpdatePharmacy = (
  pharmacyId: number,
  payload: {
    name?: string;
    city?: string;
    area?: string;
    address?: string;
    phone?: string;
    email?: string | null;
    responsible?: string;
    lat?: number | null;
    lng?: number | null;
  },
) => apiRequest(`/api/pharmacies/${pharmacyId}`, 'PATCH', payload, 'Impossible de modifier l’établissement.');

export const apiAdminDeletePharmacy = (pharmacyId: number) =>
  apiRequest(`/api/admin/pharmacies/${pharmacyId}`, 'DELETE', undefined, 'Impossible de supprimer l’établissement.');

export const apiAdminCreateProduct = (
  pharmacyId: number,
  payload: {
    name: string;
    category: string;
    brand?: string;
    code?: string;
    price: number;
    stock: number;
    description?: string;
    status?: string;
  },
) => apiRequest(`/api/pharmacies/${pharmacyId}/products`, 'POST', payload, 'Impossible de créer le produit.');

export const apiAdminUpdateProduct = (
  productId: number,
  payload: {
    name?: string;
    category?: string;
    brand?: string;
    code?: string;
    price?: number;
    stock?: number;
    description?: string;
    status?: string;
  },
) => apiRequest(`/api/products/${productId}`, 'PATCH', payload, 'Impossible de modifier le produit.');

export const apiAdminRenameCategory = (oldName: string, newName: string) =>
  apiRequest(`/api/admin/categories/${encodeURIComponent(oldName)}`, 'PATCH', { name: newName }, 'Impossible de renommer la catégorie.');

export const apiAdminCreateUser = (payload: {
  name: string;
  email: string;
  role: 'ADMIN' | 'PHARMACIST' | 'VISITOR';
  phone?: string;
  password: string;
  active?: boolean;
}) => apiRequest<AdminUserItem>('/api/admin/users', 'POST', payload, 'Impossible de créer le compte utilisateur.');

export const apiAdminUpdateUser = (
  userId: number,
  payload: {
    name?: string;
    email?: string;
    role?: 'ADMIN' | 'PHARMACIST' | 'VISITOR';
    phone?: string;
    active?: boolean;
    password?: string;
  },
) => apiRequest<AdminUserItem>(`/api/admin/users/${userId}`, 'PATCH', payload, 'Impossible de modifier ce compte utilisateur.');

export const apiAdminDeleteUser = (userId: number) =>
  apiRequest(`/api/admin/users/${userId}`, 'DELETE', undefined, 'Impossible de supprimer ce compte utilisateur.');

export const apiAdminDeleteReport = (reportId: number) =>
  apiRequest(`/api/admin/reports/${reportId}`, 'DELETE', undefined, 'Impossible de supprimer le signalement.');

export const apiAdminDeleteContact = (contactId: number) =>
  apiRequest(`/api/admin/contacts/${contactId}`, 'DELETE', undefined, 'Impossible de supprimer le message de contact.');
