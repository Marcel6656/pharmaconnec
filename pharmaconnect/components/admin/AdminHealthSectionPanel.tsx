'use client';

import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Newspaper, Pencil, Phone, Plus, Save, ShieldAlert, Trash2 } from 'lucide-react';
import {
  EmergencyNumberItem,
  HealthAlertItem,
  HealthNewsItem,
  HealthSectionPayload,
} from '@/lib/health-section';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { Empty, Modal, SectionTitle, Status } from '@/lib/shared';
import { ModernBellAlertIcon, ModernPhoneCallIcon, ModernSearchMedicineIcon } from '@/components/shared/ModernIcons';
import { ConfirmDangerModal } from '@/components/admin/ConfirmDangerModal';

const VERIFIED_IMAGE_OPTIONS = [
  { label: 'Médicaments & flacons stériles (Studio)', value: '/images/hero-cinema-medicines.jpg' },
  { label: 'Flacons chaîne du froid (Studio)', value: '/images/hero-cinema-vitamins.jpg' },
  { label: 'Suivi clinique & thermomètre (Studio)', value: '/images/hero-cinema-care.jpg' },
  { label: 'Pharmacienne sur smartphone', value: '/images/hero-smile.jpg' },
  { label: 'Thermomètre, masque & comprimés', value: '/images/prod-paracetamol.jpg' },
  { label: 'Gélules & ordonnance médicale', value: '/images/pharmacy-1.jpg' },
  { label: 'Plaquettes médicaments essentiels', value: '/images/cat-medicaments.jpg' },
  { label: 'Prévention & hygiène clinique', value: '/images/cat-hygiene.jpg' },
];

interface AdminHealthSectionPanelProps {
  section: HealthSectionPayload;
  saving: boolean;
  onSave: (next: HealthSectionPayload) => Promise<boolean>;
  subNav?: React.ReactNode;
}

export function AdminHealthSectionPanel({
  section,
  saving,
  onSave,
  subNav,
}: AdminHealthSectionPanelProps) {
  const [tab, setTab] = useState<'alerts' | 'news' | 'emergency'>('alerts');
  const [query, setQuery] = useState('');
  const [editingAlert, setEditingAlert] = useState<HealthAlertItem | null>(null);
  const [editingNews, setEditingNews] = useState<HealthNewsItem | null>(null);
  const [editingEmergency, setEditingEmergency] = useState<EmergencyNumberItem | null>(null);
  const [modalError, setModalError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message: string;
    patch: Partial<HealthSectionPayload>;
  } | null>(null);

  const commit = async (patch: Partial<HealthSectionPayload>): Promise<boolean> => {
    return onSave({
      alerts: patch.alerts ?? section.alerts,
      news: patch.news ?? section.news,
      emergencyNumbers: patch.emergencyNumbers ?? section.emergencyNumbers,
    });
  };

  const filteredAlerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return section.alerts;
    return section.alerts.filter(a =>
      `${a.titleFr} ${a.summaryFr} ${a.scopeFr} ${a.severity} ${a.dateFr}`.toLowerCase().includes(q),
    );
  }, [section.alerts, query]);

  const filteredNews = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return section.news;
    return section.news.filter(n =>
      `${n.titleFr} ${n.excerptFr} ${n.tagFr} ${n.dateFr}`.toLowerCase().includes(q),
    );
  }, [section.news, query]);

  const filteredEmergency = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return section.emergencyNumbers;
    return section.emergencyNumbers.filter(e =>
      `${e.number} ${e.titleFr} ${e.serviceFr} ${e.descFr} ${e.badgeFr}`.toLowerCase().includes(q),
    );
  }, [section.emergencyNumbers, query]);

  return (
    <>
      <SectionTitle
        eyebrow="ÉDITION SANTÉ PUBLIQUE"
        title="Pilotage Rubrique Santé"
        desc="Publiez, illustrez ou masquez les alertes sanitaires, dossiers d’actualités et numéros d’urgence affichés sur le site public."
        icon={<ModernBellAlertIcon size={24} />}
      />

      {subNav}

      <div className="toolbar">
        <label className="search-box">
          <ModernSearchMedicineIcon size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filtrer les alertes, actualités ou numéros d’urgence…"
          />
        </label>
      </div>

      <div className="admin-filter-row">
        <button type="button" className={tab === 'alerts' ? 'active' : ''} onClick={() => setTab('alerts')}>
          <ShieldAlert size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
          Alertes sanitaires ({section.alerts.length})
        </button>
        <button type="button" className={tab === 'news' ? 'active' : ''} onClick={() => setTab('news')}>
          <Newspaper size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
          Actualités de santé ({section.news.length})
        </button>
        <button type="button" className={tab === 'emergency' ? 'active' : ''} onClick={() => setTab('emergency')}>
          <Phone size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
          Numéros d’urgence ({section.emergencyNumbers.length})
        </button>
      </div>

      {section.updatedAt && (
        <div className="info-note" style={{ marginBottom: 14 }}>
          <ModernBellAlertIcon size={16} /> Dernière publication : {new Date(section.updatedAt).toLocaleString('fr-FR')}
          {section.updatedBy ? ` par ${section.updatedBy}` : ''}.
        </div>
      )}

      {tab === 'alerts' && (
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Bulletins &amp; alertes sanitaires</h3>
              <p>Chaque alerte est illustrée d’un visuel et classée par niveau de vigilance.</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setModalError('');
                setEditingAlert({
                  id: `alert-${Date.now()}`,
                  severity: 'vigilance',
                  active: true,
                  dateFr: 'Bulletin actif · Nov. 2026',
                  dateEn: 'Active Bulletin · Nov 2026',
                  scopeFr: 'Vigilance Sanitaire',
                  scopeEn: 'Health Watch',
                  image: '/images/hero-cinema-medicines.jpg',
                  imageAltFr: 'Illustration sanitaire PharmaConnect',
                  imageAltEn: 'PharmaConnect health alert illustration',
                  titleFr: '',
                  titleEn: '',
                  summaryFr: '',
                  summaryEn: '',
                  adviceFr: '',
                  adviceEn: '',
                  actionLabelFr: 'Voir les officines vérifiées',
                  actionLabelEn: 'View verified pharmacies',
                  targetPage: 'Pharmacies',
                });
              }}
            >
              <Plus size={14} /> Nouvelle alerte
            </button>
          </div>

          <div className="pc-admin-editorial-list">
            {filteredAlerts.map(item => (
              <div key={item.id} className="pc-admin-editorial-row">
                <img src={item.image || '/images/hero-cinema-medicines.jpg'} alt="" className="pc-admin-editorial-thumb" />
                <div className="pc-admin-editorial-info">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Status>{item.active !== false ? 'Publié' : 'Masqué'}</Status>
                    <span className="pc-role-chip">{item.severity.toUpperCase()}</span>
                    <small className="muted">{item.scopeFr} · {item.dateFr}</small>
                  </div>
                  <b>{item.titleFr}</b>
                  <p>{item.summaryFr}</p>
                </div>
                <div className="table-actions">
                  <ActionMenu
                    label={`Actions pour ${item.titleFr}`}
                    items={[
                      {
                        key: 'toggle',
                        label: item.active !== false ? 'Masquer' : 'Publier',
                        icon: item.active !== false ? <EyeOff size={14} /> : <Eye size={14} />,
                        onClick: () =>
                          void commit({
                            alerts: section.alerts.map(a => (a.id === item.id ? { ...a, active: a.active === false } : a)),
                          }),
                      },
                      {
                        key: 'edit',
                        label: 'Modifier',
                        icon: <Pencil size={14} />,
                        onClick: () => {
                          setModalError('');
                          setEditingAlert({ ...item });
                        },
                      },
                      {
                        key: 'delete',
                        label: 'Supprimer',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        dividerBefore: true,
                        onClick: () =>
                          setDeleteConfirm({
                            title: 'Supprimer l’alerte sanitaire',
                            message: `Supprimer l’alerte « ${item.titleFr} » de la Rubrique Santé publique ?`,
                            patch: { alerts: section.alerts.filter(a => a.id !== item.id) },
                          }),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
            {filteredAlerts.length === 0 && (
              <Empty
                title="Aucune alerte sanitaire"
                detail={query.trim() ? 'Aucune alerte ne correspond à votre recherche.' : 'Créez un premier bulletin sanitaire pour informer le public.'}
              />
            )}
          </div>
        </section>
      )}

      {tab === 'news' && (
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Actualités de santé &amp; dossiers pratiques</h3>
              <p>Articles illustrés avec points clés dépliables et lien vers le catalogue.</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setModalError('');
                setEditingNews({
                  id: `news-${Date.now()}`,
                  tagFr: 'Prévention',
                  tagEn: 'Prevention',
                  active: true,
                  dateFr: 'Novembre 2026',
                  dateEn: 'November 2026',
                  readTime: '2 min',
                  image: '/images/hero-smile.jpg',
                  imageAltFr: 'Actualité santé PharmaConnect',
                  imageAltEn: 'PharmaConnect health news image',
                  titleFr: '',
                  titleEn: '',
                  excerptFr: '',
                  excerptEn: '',
                  keyPointsFr: [],
                  keyPointsEn: [],
                  targetCategory: 'Médicaments',
                });
              }}
            >
              <Plus size={14} /> Nouvel article
            </button>
          </div>

          <div className="pc-admin-editorial-list">
            {filteredNews.map(item => (
              <div key={item.id} className="pc-admin-editorial-row">
                <img src={item.image || '/images/hero-smile.jpg'} alt="" className="pc-admin-editorial-thumb" />
                <div className="pc-admin-editorial-info">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Status>{item.active !== false ? 'Publié' : 'Masqué'}</Status>
                    <span className="pc-role-chip">{item.tagFr}</span>
                    <small className="muted">{item.dateFr} · {item.readTime}</small>
                  </div>
                  <b>{item.titleFr}</b>
                  <p>{item.excerptFr}</p>
                </div>
                <div className="table-actions">
                  <ActionMenu
                    label={`Actions pour ${item.titleFr}`}
                    items={[
                      {
                        key: 'toggle',
                        label: item.active !== false ? 'Masquer' : 'Publier',
                        icon: item.active !== false ? <EyeOff size={14} /> : <Eye size={14} />,
                        onClick: () =>
                          void commit({
                            news: section.news.map(n => (n.id === item.id ? { ...n, active: n.active === false } : n)),
                          }),
                      },
                      {
                        key: 'edit',
                        label: 'Modifier',
                        icon: <Pencil size={14} />,
                        onClick: () => {
                          setModalError('');
                          setEditingNews({ ...item });
                        },
                      },
                      {
                        key: 'delete',
                        label: 'Supprimer',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        dividerBefore: true,
                        onClick: () =>
                          setDeleteConfirm({
                            title: 'Supprimer l’article de santé',
                            message: `Supprimer l’article « ${item.titleFr} » de la Rubrique Santé publique ?`,
                            patch: { news: section.news.filter(n => n.id !== item.id) },
                          }),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
            {filteredNews.length === 0 && (
              <Empty
                title="Aucune actualité de santé"
                detail={query.trim() ? 'Aucun article ne correspond à votre recherche.' : 'Ajoutez un premier dossier pratique pour les visiteurs.'}
              />
            )}
          </div>
        </section>
      )}

      {tab === 'emergency' && (
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Numéros d’urgence &amp; « Numéros Verts »</h3>
              <p>Lignes officielles gratuites et numéros hospitaliers affichés au public.</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                setModalError('');
                setEditingEmergency({
                  id: `emergency-${Date.now()}`,
                  number: '',
                  telHref: '',
                  badgeFr: 'Numéro Vert Gratuit',
                  badgeEn: 'Toll-Free Line',
                  category: 'green',
                  isTollFree: true,
                  active: true,
                  titleFr: '',
                  titleEn: '',
                  serviceFr: '',
                  serviceEn: '',
                  descFr: '',
                  descEn: '',
                  hoursFr: 'Ouvert 24h/24 · 7j/7',
                  hoursEn: 'Open 24/7',
                });
              }}
            >
              <Plus size={14} /> Nouveau numéro
            </button>
          </div>

          <div className="pc-admin-editorial-list">
            {filteredEmergency.map(item => (
              <div key={item.id} className="pc-admin-editorial-row">
                <div className="pc-admin-num-badge">
                  <ModernPhoneCallIcon size={18} />
                  <b>{item.number}</b>
                </div>
                <div className="pc-admin-editorial-info">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Status>{item.active !== false ? 'Publié' : 'Masqué'}</Status>
                    <span className="pc-role-chip">{item.badgeFr}</span>
                    <small className="muted">{item.hoursFr}</small>
                  </div>
                  <b>{item.titleFr}</b>
                  <p>{item.serviceFr} — {item.descFr}</p>
                </div>
                <div className="table-actions">
                  <ActionMenu
                    label={`Actions pour ${item.number}`}
                    items={[
                      {
                        key: 'toggle',
                        label: item.active !== false ? 'Masquer' : 'Publier',
                        icon: item.active !== false ? <EyeOff size={14} /> : <Eye size={14} />,
                        onClick: () =>
                          void commit({
                            emergencyNumbers: section.emergencyNumbers.map(n =>
                              n.id === item.id ? { ...n, active: n.active === false } : n,
                            ),
                          }),
                      },
                      {
                        key: 'edit',
                        label: 'Modifier',
                        icon: <Pencil size={14} />,
                        onClick: () => {
                          setModalError('');
                          setEditingEmergency({ ...item });
                        },
                      },
                      {
                        key: 'delete',
                        label: 'Supprimer',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        dividerBefore: true,
                        onClick: () =>
                          setDeleteConfirm({
                            title: 'Supprimer le numéro d’urgence',
                            message: `Supprimer le numéro « ${item.number} — ${item.titleFr} » de la Rubrique Santé publique ?`,
                            patch: { emergencyNumbers: section.emergencyNumbers.filter(n => n.id !== item.id) },
                          }),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
            {filteredEmergency.length === 0 && (
              <Empty
                title="Aucun numéro d’urgence"
                detail={query.trim() ? 'Aucun numéro ne correspond à votre recherche.' : 'Ajoutez un numéro vert ou une ligne d’urgence officielle.'}
              />
            )}
          </div>
        </section>
      )}

      {editingAlert && (
        <Modal
          title="Éditer l’alerte sanitaire"
          icon={<ShieldAlert size={20} />}
          onClose={() => { if (!saving) setEditingAlert(null); }}
          wide
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (saving) return;
              setModalError('');
              const nextItem: HealthAlertItem = {
                ...editingAlert,
                titleEn: editingAlert.titleEn || editingAlert.titleFr,
                summaryEn: editingAlert.summaryEn || editingAlert.summaryFr,
                adviceEn: editingAlert.adviceEn || editingAlert.adviceFr,
                scopeEn: editingAlert.scopeEn || editingAlert.scopeFr,
                dateEn: editingAlert.dateEn || editingAlert.dateFr,
                imageAltFr: editingAlert.imageAltFr || editingAlert.titleFr,
                imageAltEn: editingAlert.imageAltEn || editingAlert.titleEn || editingAlert.titleFr,
              };
              const exists = section.alerts.some(a => a.id === nextItem.id);
              const alerts = exists
                ? section.alerts.map(a => (a.id === nextItem.id ? nextItem : a))
                : [nextItem, ...section.alerts];
              const ok = await commit({ alerts });
              if (ok) setEditingAlert(null);
              else setModalError('Impossible d’enregistrer l’alerte sanitaire. Veuillez réessayer.');
            }}
          >
            {modalError && <div className="gm-error-alert" role="alert" style={{ marginBottom: 12 }}>{modalError}</div>}
            <div className="form-grid">
              <label>
                Gravité
                <select
                  disabled={saving}
                  value={editingAlert.severity}
                  onChange={e => setEditingAlert({ ...editingAlert, severity: e.target.value as HealthAlertItem['severity'] })}
                >
                  <option value="urgent">Urgent (Prioritaire)</option>
                  <option value="vigilance">Veille sanitaire</option>
                  <option value="prevention">Prévention</option>
                </select>
              </label>
              <label>
                Thématique *
                <input required disabled={saving} value={editingAlert.scopeFr} onChange={e => setEditingAlert({ ...editingAlert, scopeFr: e.target.value })} />
              </label>
              <label>
                Libellé date
                <input disabled={saving} value={editingAlert.dateFr} onChange={e => setEditingAlert({ ...editingAlert, dateFr: e.target.value })} />
              </label>
            </div>
            <label className="form-field">
              Visuel de l’alerte
              <select disabled={saving} value={editingAlert.image} onChange={e => setEditingAlert({ ...editingAlert, image: e.target.value })}>
                {VERIFIED_IMAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Titre de l’alerte *
              <input required disabled={saving} value={editingAlert.titleFr} onChange={e => setEditingAlert({ ...editingAlert, titleFr: e.target.value })} />
            </label>
            <label className="form-field">
              Résumé sanitaire *
              <textarea rows={2} required disabled={saving} value={editingAlert.summaryFr} onChange={e => setEditingAlert({ ...editingAlert, summaryFr: e.target.value })} />
            </label>
            <label className="form-field">
              Conduite à tenir / Conseil *
              <textarea rows={2} required disabled={saving} value={editingAlert.adviceFr} onChange={e => setEditingAlert({ ...editingAlert, adviceFr: e.target.value })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={saving} onClick={() => setEditingAlert(null)}>Annuler</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer et publier'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingNews && (
        <Modal
          title="Éditer l’actualité de santé"
          icon={<Newspaper size={20} />}
          onClose={() => { if (!saving) setEditingNews(null); }}
          wide
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (saving) return;
              setModalError('');
              const nextItem: HealthNewsItem = {
                ...editingNews,
                titleEn: editingNews.titleEn || editingNews.titleFr,
                excerptEn: editingNews.excerptEn || editingNews.excerptFr,
                tagEn: editingNews.tagEn || editingNews.tagFr,
                dateEn: editingNews.dateEn || editingNews.dateFr,
                keyPointsEn: editingNews.keyPointsEn.length ? editingNews.keyPointsEn : editingNews.keyPointsFr,
                imageAltFr: editingNews.imageAltFr || editingNews.titleFr,
                imageAltEn: editingNews.imageAltEn || editingNews.titleEn || editingNews.titleFr,
              };
              const exists = section.news.some(n => n.id === nextItem.id);
              const news = exists
                ? section.news.map(n => (n.id === nextItem.id ? nextItem : n))
                : [nextItem, ...section.news];
              const ok = await commit({ news });
              if (ok) setEditingNews(null);
              else setModalError('Impossible d’enregistrer l’actualité. Veuillez réessayer.');
            }}
          >
            {modalError && <div className="gm-error-alert" role="alert" style={{ marginBottom: 12 }}>{modalError}</div>}
            <div className="form-grid">
              <label>
                Étiquette *
                <input required disabled={saving} value={editingNews.tagFr} onChange={e => setEditingNews({ ...editingNews, tagFr: e.target.value })} />
              </label>
              <label>
                Date
                <input disabled={saving} value={editingNews.dateFr} onChange={e => setEditingNews({ ...editingNews, dateFr: e.target.value })} />
              </label>
              <label>
                Durée de lecture
                <input disabled={saving} value={editingNews.readTime} onChange={e => setEditingNews({ ...editingNews, readTime: e.target.value })} />
              </label>
            </div>
            <label className="form-field">
              Image éditoriale
              <select disabled={saving} value={editingNews.image} onChange={e => setEditingNews({ ...editingNews, image: e.target.value })}>
                {VERIFIED_IMAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Titre de l’actualité *
              <input required disabled={saving} value={editingNews.titleFr} onChange={e => setEditingNews({ ...editingNews, titleFr: e.target.value })} />
            </label>
            <label className="form-field">
              Chapô / Extrait *
              <textarea rows={2} required disabled={saving} value={editingNews.excerptFr} onChange={e => setEditingNews({ ...editingNews, excerptFr: e.target.value })} />
            </label>
            <label className="form-field">
              Recommandations clés (une par ligne)
              <textarea
                rows={3}
                disabled={saving}
                value={editingNews.keyPointsFr.join('\n')}
                onChange={e => setEditingNews({ ...editingNews, keyPointsFr: e.target.value.split('\n').map(v => v.trim()).filter(Boolean) })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={saving} onClick={() => setEditingNews(null)}>Annuler</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer et publier'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingEmergency && (
        <Modal
          title="Éditer le numéro d’urgence"
          icon={<ModernPhoneCallIcon size={20} />}
          onClose={() => { if (!saving) setEditingEmergency(null); }}
          wide
        >
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (saving) return;
              setModalError('');
              const rawNumber = editingEmergency.number.trim();
              const isPhoneLike = /^[+\d\s()-]{2,20}$/.test(rawNumber);
              const cleanTel = isPhoneLike ? rawNumber.replace(/[^+\d]/g, '') : '';
              const nextItem: EmergencyNumberItem = {
                ...editingEmergency,
                telHref: cleanTel ? `tel:${cleanTel}` : undefined,
                badgeEn: editingEmergency.badgeEn || editingEmergency.badgeFr,
                titleEn: editingEmergency.titleEn || editingEmergency.titleFr,
                serviceEn: editingEmergency.serviceEn || editingEmergency.serviceFr,
                descEn: editingEmergency.descEn || editingEmergency.descFr,
                hoursEn: editingEmergency.hoursEn || editingEmergency.hoursFr,
              };
              const exists = section.emergencyNumbers.some(n => n.id === nextItem.id);
              const emergencyNumbers = exists
                ? section.emergencyNumbers.map(n => (n.id === nextItem.id ? nextItem : n))
                : [nextItem, ...section.emergencyNumbers];
              const ok = await commit({ emergencyNumbers });
              if (ok) setEditingEmergency(null);
              else setModalError('Impossible d’enregistrer le numéro d’urgence. Veuillez réessayer.');
            }}
          >
            {modalError && <div className="gm-error-alert" role="alert" style={{ marginBottom: 12 }}>{modalError}</div>}
            <div className="form-grid">
              <label>
                Numéro principal *
                <input required disabled={saving} value={editingEmergency.number} onChange={e => setEditingEmergency({ ...editingEmergency, number: e.target.value })} placeholder="Ex. 1313" />
              </label>
              <label>
                Ligne alternative
                <input disabled={saving} value={editingEmergency.secondaryNumber || ''} onChange={e => setEditingEmergency({ ...editingEmergency, secondaryNumber: e.target.value })} />
              </label>
              <label>
                Badge d’affichage
                <input disabled={saving} value={editingEmergency.badgeFr} onChange={e => setEditingEmergency({ ...editingEmergency, badgeFr: e.target.value })} placeholder="Ex. Numéro Vert Gratuit / Hôpital 24h/7j" />
              </label>
              <label>
                Catégorie
                <select
                  disabled={saving}
                  value={editingEmergency.category}
                  onChange={e => setEditingEmergency({ ...editingEmergency, category: e.target.value as EmergencyNumberItem['category'] })}
                >
                  <option value="green">Numéro Vert / Gratuit</option>
                  <option value="hospital">Hôpitaux &amp; Sang</option>
                  <option value="rescue">Secours &amp; Police</option>
                </select>
              </label>
            </div>
            <label className="form-field">
              Intitulé du service *
              <input required disabled={saving} value={editingEmergency.titleFr} onChange={e => setEditingEmergency({ ...editingEmergency, titleFr: e.target.value })} />
            </label>
            <label className="form-field">
              Organisme / Structure *
              <input required disabled={saving} value={editingEmergency.serviceFr} onChange={e => setEditingEmergency({ ...editingEmergency, serviceFr: e.target.value })} />
            </label>
            <label className="form-field">
              Description &amp; couverture *
              <textarea rows={2} required disabled={saving} value={editingEmergency.descFr} onChange={e => setEditingEmergency({ ...editingEmergency, descFr: e.target.value })} />
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                disabled={saving}
                checked={Boolean(editingEmergency.isTollFree)}
                onChange={e => setEditingEmergency({ ...editingEmergency, isTollFree: e.target.checked })}
              />
              Mettre en avant comme Numéro Vert gratuit
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" disabled={saving} onClick={() => setEditingEmergency(null)}>Annuler</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer et publier'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDangerModal
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title || 'Confirmer la suppression'}
        message={deleteConfirm?.message || ''}
        confirmLabel="Supprimer"
        busy={saving}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (!deleteConfirm) return;
          const ok = await commit(deleteConfirm.patch);
          if (ok) setDeleteConfirm(null);
        }}
      />
    </>
  );
}
