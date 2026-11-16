'use client';

import { useState } from 'react';
import { Eye, EyeOff, Newspaper, Pencil, Phone, Plus, Save, ShieldAlert, Trash2 } from 'lucide-react';
import {
  EmergencyNumberItem,
  HealthAlertItem,
  HealthNewsItem,
  HealthSectionPayload,
} from '@/lib/health-section';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { Modal, SectionTitle, Status } from '@/lib/shared';
import { ModernBellAlertIcon, ModernPhoneCallIcon } from '@/components/shared/ModernIcons';

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
  onSave: (next: HealthSectionPayload) => Promise<void>;
}

export function AdminHealthSectionPanel({
  section,
  saving,
  onSave,
}: AdminHealthSectionPanelProps) {
  const [tab, setTab] = useState<'alerts' | 'news' | 'emergency'>('alerts');
  const [editingAlert, setEditingAlert] = useState<HealthAlertItem | null>(null);
  const [editingNews, setEditingNews] = useState<HealthNewsItem | null>(null);
  const [editingEmergency, setEditingEmergency] = useState<EmergencyNumberItem | null>(null);

  const commit = async (patch: Partial<HealthSectionPayload>) => {
    await onSave({
      alerts: patch.alerts ?? section.alerts,
      news: patch.news ?? section.news,
      emergencyNumbers: patch.emergencyNumbers ?? section.emergencyNumbers,
    });
  };

  return (
    <>
      <SectionTitle
        eyebrow="ÉDITION SANTÉ PUBLIQUE"
        title="Pilotage Rubrique Santé"
        desc="Publiez, illustrez ou masquez les alertes sanitaires, dossiers d’actualités et numéros d’urgence affichés sur le site public."
        icon={<ModernBellAlertIcon size={24} />}
      />

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
              <h3>Bulletins & alertes sanitaires</h3>
              <p>Chaque alerte est illustrée d’un visuel et classée par niveau de vigilance.</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={() =>
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
                })
              }
            >
              <Plus size={14} /> Nouvelle alerte
            </button>
          </div>

          <div className="pc-admin-editorial-list">
            {section.alerts.map(item => (
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
                          commit({
                            alerts: section.alerts.map(a => (a.id === item.id ? { ...a, active: a.active === false } : a)),
                          }),
                      },
                      {
                        key: 'edit',
                        label: 'Modifier',
                        icon: <Pencil size={14} />,
                        onClick: () => setEditingAlert({ ...item }),
                      },
                      {
                        key: 'delete',
                        label: 'Supprimer',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        dividerBefore: true,
                        onClick: () => {
                          if (!window.confirm(`Supprimer l’alerte « ${item.titleFr} » ?`)) return;
                          commit({ alerts: section.alerts.filter(a => a.id !== item.id) });
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'news' && (
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Actualités de santé & dossiers pratiques</h3>
              <p>Articles illustrés avec points clés dépliables et lien vers le catalogue.</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={() =>
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
                })
              }
            >
              <Plus size={14} /> Nouvel article
            </button>
          </div>

          <div className="pc-admin-editorial-list">
            {section.news.map(item => (
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
                          commit({
                            news: section.news.map(n => (n.id === item.id ? { ...n, active: n.active === false } : n)),
                          }),
                      },
                      {
                        key: 'edit',
                        label: 'Modifier',
                        icon: <Pencil size={14} />,
                        onClick: () => setEditingNews({ ...item }),
                      },
                      {
                        key: 'delete',
                        label: 'Supprimer',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        dividerBefore: true,
                        onClick: () => {
                          if (!window.confirm(`Supprimer l’article « ${item.titleFr} » ?`)) return;
                          commit({ news: section.news.filter(n => n.id !== item.id) });
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'emergency' && (
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Numéros d’urgence & « Numéros Verts »</h3>
              <p>Lignes officielles gratuites et numéros hospitaliers affichés au public.</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={() =>
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
                })
              }
            >
              <Plus size={14} /> Nouveau numéro
            </button>
          </div>

          <div className="pc-admin-editorial-list">
            {section.emergencyNumbers.map(item => (
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
                          commit({
                            emergencyNumbers: section.emergencyNumbers.map(n =>
                              n.id === item.id ? { ...n, active: n.active === false } : n,
                            ),
                          }),
                      },
                      {
                        key: 'edit',
                        label: 'Modifier',
                        icon: <Pencil size={14} />,
                        onClick: () => setEditingEmergency({ ...item }),
                      },
                      {
                        key: 'delete',
                        label: 'Supprimer',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        dividerBefore: true,
                        onClick: () => {
                          if (!window.confirm(`Supprimer le numéro « ${item.number} — ${item.titleFr} » ?`)) return;
                          commit({ emergencyNumbers: section.emergencyNumbers.filter(n => n.id !== item.id) });
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {editingAlert && (
        <Modal title="Éditer l’alerte sanitaire" icon={<ShieldAlert size={20} />} onClose={() => setEditingAlert(null)} wide>
          <form
            onSubmit={async e => {
              e.preventDefault();
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
              setEditingAlert(null);
              await commit({ alerts });
            }}
          >
            <div className="form-grid">
              <label>
                Gravité
                <select
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
                <input required value={editingAlert.scopeFr} onChange={e => setEditingAlert({ ...editingAlert, scopeFr: e.target.value })} />
              </label>
              <label>
                Libellé date
                <input value={editingAlert.dateFr} onChange={e => setEditingAlert({ ...editingAlert, dateFr: e.target.value })} />
              </label>
            </div>
            <label className="form-field">
              Visuel de l’alerte
              <select value={editingAlert.image} onChange={e => setEditingAlert({ ...editingAlert, image: e.target.value })}>
                {VERIFIED_IMAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Titre de l’alerte *
              <input required value={editingAlert.titleFr} onChange={e => setEditingAlert({ ...editingAlert, titleFr: e.target.value })} />
            </label>
            <label className="form-field">
              Résumé sanitaire *
              <textarea rows={2} required value={editingAlert.summaryFr} onChange={e => setEditingAlert({ ...editingAlert, summaryFr: e.target.value })} />
            </label>
            <label className="form-field">
              Conduite à tenir / Conseil *
              <textarea rows={2} required value={editingAlert.adviceFr} onChange={e => setEditingAlert({ ...editingAlert, adviceFr: e.target.value })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setEditingAlert(null)}>Annuler</button>
              <button type="submit" className="primary-btn" disabled={saving}><Save size={14} /> Enregistrer et publier</button>
            </div>
          </form>
        </Modal>
      )}

      {editingNews && (
        <Modal title="Éditer l’actualité de santé" icon={<Newspaper size={20} />} onClose={() => setEditingNews(null)} wide>
          <form
            onSubmit={async e => {
              e.preventDefault();
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
              setEditingNews(null);
              await commit({ news });
            }}
          >
            <div className="form-grid">
              <label>
                Étiquette *
                <input required value={editingNews.tagFr} onChange={e => setEditingNews({ ...editingNews, tagFr: e.target.value })} />
              </label>
              <label>
                Date
                <input value={editingNews.dateFr} onChange={e => setEditingNews({ ...editingNews, dateFr: e.target.value })} />
              </label>
              <label>
                Durée de lecture
                <input value={editingNews.readTime} onChange={e => setEditingNews({ ...editingNews, readTime: e.target.value })} />
              </label>
            </div>
            <label className="form-field">
              Image éditoriale
              <select value={editingNews.image} onChange={e => setEditingNews({ ...editingNews, image: e.target.value })}>
                {VERIFIED_IMAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Titre de l’actualité *
              <input required value={editingNews.titleFr} onChange={e => setEditingNews({ ...editingNews, titleFr: e.target.value })} />
            </label>
            <label className="form-field">
              Chapô / Extrait *
              <textarea rows={2} required value={editingNews.excerptFr} onChange={e => setEditingNews({ ...editingNews, excerptFr: e.target.value })} />
            </label>
            <label className="form-field">
              Recommandations clés (une par ligne)
              <textarea
                rows={3}
                value={editingNews.keyPointsFr.join('\n')}
                onChange={e => setEditingNews({ ...editingNews, keyPointsFr: e.target.value.split('\n').map(v => v.trim()).filter(Boolean) })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setEditingNews(null)}>Annuler</button>
              <button type="submit" className="primary-btn" disabled={saving}><Save size={14} /> Enregistrer et publier</button>
            </div>
          </form>
        </Modal>
      )}

      {editingEmergency && (
        <Modal title="Éditer le numéro d’urgence" icon={<ModernPhoneCallIcon size={20} />} onClose={() => setEditingEmergency(null)} wide>
          <form
            onSubmit={async e => {
              e.preventDefault();
              const cleanTel = editingEmergency.number.replace(/[^+\d]/g, '');
              const nextItem: EmergencyNumberItem = {
                ...editingEmergency,
                telHref: cleanTel ? `tel:${cleanTel}` : editingEmergency.telHref,
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
              setEditingEmergency(null);
              await commit({ emergencyNumbers });
            }}
          >
            <div className="form-grid">
              <label>
                Numéro principal *
                <input required value={editingEmergency.number} onChange={e => setEditingEmergency({ ...editingEmergency, number: e.target.value })} placeholder="Ex. 1313" />
              </label>
              <label>
                Ligne alternative
                <input value={editingEmergency.secondaryNumber || ''} onChange={e => setEditingEmergency({ ...editingEmergency, secondaryNumber: e.target.value })} />
              </label>
              <label>
                Catégorie
                <select
                  value={editingEmergency.category}
                  onChange={e => setEditingEmergency({ ...editingEmergency, category: e.target.value as EmergencyNumberItem['category'] })}
                >
                  <option value="green">Numéro Vert / Gratuit</option>
                  <option value="hospital">Hôpitaux & Sang</option>
                  <option value="rescue">Secours & Police</option>
                </select>
              </label>
            </div>
            <label className="form-field">
              Intitulé du service *
              <input required value={editingEmergency.titleFr} onChange={e => setEditingEmergency({ ...editingEmergency, titleFr: e.target.value })} />
            </label>
            <label className="form-field">
              Organisme / Structure *
              <input required value={editingEmergency.serviceFr} onChange={e => setEditingEmergency({ ...editingEmergency, serviceFr: e.target.value })} />
            </label>
            <label className="form-field">
              Description & couverture *
              <textarea rows={2} required value={editingEmergency.descFr} onChange={e => setEditingEmergency({ ...editingEmergency, descFr: e.target.value })} />
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={Boolean(editingEmergency.isTollFree)}
                onChange={e => setEditingEmergency({ ...editingEmergency, isTollFree: e.target.checked })}
              />
              Mettre en avant comme Numéro Vert gratuit
            </label>
            <div className="modal-actions">
              <button type="button" className="outline-btn" onClick={() => setEditingEmergency(null)}>Annuler</button>
              <button type="submit" className="primary-btn" disabled={saving}><Save size={14} /> Enregistrer et publier</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
