'use client';

import {
  Activity, ArrowRight, Check, CheckCircle2, Eye, Layers, PhoneCall,
  Settings, ShieldAlert, Users,
} from 'lucide-react';
import { ActionMenu } from '@/components/shared/ActionMenu';
import { AppData, Pharmacy, ProductStatus, Status, money } from '@/lib/shared';
import {
  ModernAlertWarningIcon,
  ModernBellAlertIcon,
  ModernChatEncryptedIcon,
  ModernClipboardStockIcon,
  ModernCreditCardPlanIcon,
  ModernDigitalStoreIcon,
  ModernDocumentCheckIcon,
  ModernPackageBoxIcon,
  ModernVerifiedShieldIcon,
} from '@/components/shared/ModernIcons';
import { HealthSectionPayload } from '@/lib/health-section';

interface AdminDashboardViewProps {
  data: AppData;
  pendingPharmacies: Pharmacy[];
  pendingProducts: AppData['products'];
  pendingPaymentsCount: number;
  openReportsCount: number;
  openContactsCount: number;
  confirmedRevenue: number;
  usersCount: number;
  auditLogs: AppData['auditLogs'];
  healthSection: HealthSectionPayload;
  onNavigate: (page: string) => void;
  onInspectPharmacy: (p: Pharmacy) => void;
  onApprovePharmacy: (id: number) => void;
  onApproveProduct: (id: number, status: ProductStatus) => void;
}

export function AdminDashboardView({
  data,
  pendingPharmacies,
  pendingProducts,
  pendingPaymentsCount,
  openReportsCount,
  openContactsCount,
  confirmedRevenue,
  usersCount,
  auditLogs,
  healthSection,
  onNavigate,
  onInspectPharmacy,
  onApprovePharmacy,
  onApproveProduct,
}: AdminDashboardViewProps) {
  const totalPharmacies = data.pharmacies.length || 1;
  const validatedPharmacies = data.pharmacies.filter(p => p.status === 'Validée').length;
  const suspendedOrExpired = data.pharmacies.filter(p => ['Suspendue', 'Abonnement expiré'].includes(p.status)).length;
  const refusedPharmacies = data.pharmacies.filter(p => p.status === 'Refusée').length;

  const totalProducts = data.products.length || 1;
  const publishedProducts = data.products.filter(p => p.status === 'Publié').length;
  const correctionProducts = data.products.filter(p => p.status === 'À corriger').length;
  const hiddenOrRefusedProducts = data.products.filter(p => ['Masqué', 'Suspendu', 'Refusé', 'Archivé'].includes(p.status)).length;

  const urgentTotal = pendingPharmacies.length + pendingProducts.length + pendingPaymentsCount + openReportsCount + openContactsCount;

  const activeAlerts = healthSection.alerts.filter(a => a.active !== false).length;
  const activeNews = healthSection.news.filter(n => n.active !== false).length;
  const activeEmergency = healthSection.emergencyNumbers.filter(e => e.active !== false).length;

  return (
    <div className="pc-adm-dash">
      {/* Executive Command Hero */}
      <section className="pc-adm-hero-banner">
        <div className="pc-adm-hero-copy">
          <div className="pc-adm-hero-pill">
            <span className="cg-pulse-dot" />
            {urgentTotal > 0
              ? `${urgentTotal} dossier(s) ou élément(s) en attente de traitement`
              : 'Toutes les files de modération sont à jour'}
          </div>
          <h1>Centre de gouvernance PharmaConnect</h1>
          <p>
            Pilotez les agréments officinaux, le catalogue vérifié, les comptes, la Rubrique Santé et la conformité en temps réel.
          </p>
        </div>
        <div className="pc-adm-hero-actions">
          <button type="button" className="primary-btn" onClick={() => onNavigate('Demandes pharmacies')}>
            <ModernDocumentCheckIcon size={15} />
            Examiner les agréments ({pendingPharmacies.length})
          </button>
          <button type="button" className="outline-btn" onClick={() => onNavigate('Validation produits')}>
            <ModernPackageBoxIcon size={15} />
            Modérer produits ({pendingProducts.length})
          </button>
          <button type="button" className="outline-btn" onClick={() => onNavigate('Rubrique Santé')}>
            <ModernBellAlertIcon size={15} />
            Rubrique Santé
          </button>
        </div>
      </section>

      {/* Primary KPI Grid (clickable) */}
      <div className="pc-adm-kpi-grid">
        <button type="button" className="pc-adm-kpi-card" onClick={() => onNavigate('Pharmacies')}>
          <div className="pc-adm-kpi-head">
            <span>Réseau officinal actif</span>
            <span className="pc-adm-kpi-icon mint"><ModernDigitalStoreIcon size={19} /></span>
          </div>
          <strong>{validatedPharmacies} <small>/ {data.pharmacies.length}</small></strong>
          <div className="pc-adm-kpi-foot">
            <span className={pendingPharmacies.length > 0 ? 'warn' : 'ok'}>
              {pendingPharmacies.length} demande(s) en attente
            </span>
            <ArrowRight size={14} />
          </div>
        </button>

        <button type="button" className="pc-adm-kpi-card" onClick={() => onNavigate('Validation produits')}>
          <div className="pc-adm-kpi-head">
            <span>Catalogue & modération</span>
            <span className="pc-adm-kpi-icon blue"><ModernPackageBoxIcon size={19} /></span>
          </div>
          <strong>{publishedProducts} <small>publiés</small></strong>
          <div className="pc-adm-kpi-foot">
            <span className={pendingProducts.length > 0 ? 'warn' : 'ok'}>
              {pendingProducts.length} en attente de contrôle
            </span>
            <ArrowRight size={14} />
          </div>
        </button>

        <button type="button" className="pc-adm-kpi-card" onClick={() => onNavigate('Abonnements')}>
          <div className="pc-adm-kpi-head">
            <span>Revenus abonnements</span>
            <span className="pc-adm-kpi-icon gold"><ModernCreditCardPlanIcon size={19} /></span>
          </div>
          <strong>{money(confirmedRevenue)}</strong>
          <div className="pc-adm-kpi-foot">
            <span className={pendingPaymentsCount > 0 ? 'warn' : 'ok'}>
              {pendingPaymentsCount} paiement(s) à confirmer
            </span>
            <ArrowRight size={14} />
          </div>
        </button>

        <button type="button" className="pc-adm-kpi-card" onClick={() => onNavigate(openReportsCount > 0 ? 'Signalements' : 'Messages contact')}>
          <div className="pc-adm-kpi-head">
            <span>Vigilance & support</span>
            <span className="pc-adm-kpi-icon coral"><ShieldAlert size={19} /></span>
          </div>
          <strong>{openReportsCount + openContactsCount}</strong>
          <div className="pc-adm-kpi-foot">
            <span>{openReportsCount} signalement(s) · {openContactsCount} message(s)</span>
            <ArrowRight size={14} />
          </div>
        </button>
      </div>

      {/* Telemetry Distribution Row */}
      <div className="pc-adm-split-grid">
        <section className="panel cg-modern-panel pc-adm-telemetry">
          <div className="panel-heading">
            <div>
              <h3>Santé du réseau officinal</h3>
              <p>Répartition des {data.pharmacies.length} établissements enregistrés</p>
            </div>
            <button type="button" className="subtle-link" onClick={() => onNavigate('Pharmacies')}>
              Annuaire <ArrowRight size={14} />
            </button>
          </div>
          <div className="pc-adm-segbar" aria-label="Répartition pharmacies">
            <span className="seg-green" style={{ width: `${(validatedPharmacies / totalPharmacies) * 100}%` }} />
            <span className="seg-amber" style={{ width: `${(pendingPharmacies.length / totalPharmacies) * 100}%` }} />
            <span className="seg-slate" style={{ width: `${(suspendedOrExpired / totalPharmacies) * 100}%` }} />
            <span className="seg-red" style={{ width: `${(refusedPharmacies / totalPharmacies) * 100}%` }} />
          </div>
          <div className="pc-adm-legend-grid">
            <div><i className="dot green" /> Validées <b>{validatedPharmacies}</b></div>
            <div><i className="dot amber" /> En attente <b>{pendingPharmacies.length}</b></div>
            <div><i className="dot slate" /> Suspendues / Expirées <b>{suspendedOrExpired}</b></div>
            <div><i className="dot red" /> Refusées <b>{refusedPharmacies}</b></div>
          </div>
        </section>

        <section className="panel cg-modern-panel pc-adm-telemetry">
          <div className="panel-heading">
            <div>
              <h3>Catalogue & Rubrique Santé</h3>
              <p>État des {data.products.length} fiches produits et contenus publiés</p>
            </div>
            <button type="button" className="subtle-link" onClick={() => onNavigate('Rubrique Santé')}>
              Éditer Santé <ArrowRight size={14} />
            </button>
          </div>
          <div className="pc-adm-segbar" aria-label="Répartition produits">
            <span className="seg-green" style={{ width: `${(publishedProducts / totalProducts) * 100}%` }} />
            <span className="seg-amber" style={{ width: `${((pendingProducts.length + correctionProducts) / totalProducts) * 100}%` }} />
            <span className="seg-slate" style={{ width: `${(hiddenOrRefusedProducts / totalProducts) * 100}%` }} />
          </div>
          <div className="pc-adm-legend-grid">
            <div><i className="dot green" /> Produits publiés <b>{publishedProducts}</b></div>
            <div><i className="dot amber" /> À valider / corriger <b>{pendingProducts.length + correctionProducts}</b></div>
            <div><i className="dot blue" /> Alertes & Actus <b>{activeAlerts + activeNews}</b></div>
            <div><i className="dot mint" /> Numéros d’urgence <b>{activeEmergency}</b></div>
          </div>
        </section>
      </div>

      {/* Action Queues Row */}
      <div className="pc-adm-split-grid">
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Agréments pharmacies en attente</h3>
              <p>Inspectez le dossier complet ou validez directement.</p>
            </div>
            <button type="button" className="subtle-link" onClick={() => onNavigate('Demandes pharmacies')}>
              Tout voir <ArrowRight size={14} />
            </button>
          </div>
          <div className="pc-adm-queue-list">
            {pendingPharmacies.slice(0, 4).map(p => (
              <div className="pc-adm-queue-item" key={p.id}>
                <span className="pc-adm-queue-icon"><ModernDigitalStoreIcon size={17} /></span>
                <div className="pc-adm-queue-info">
                  <b>{p.name}</b>
                  <small>{p.city} · {p.license || 'Licence à vérifier'}</small>
                </div>
                <Status>{p.status}</Status>
                <div className="table-actions">
                  <ActionMenu
                    label={`Actions pour ${p.name}`}
                    items={[
                      { key: 'dossier', label: 'Voir le dossier', icon: <Eye size={14} />, onClick: () => onInspectPharmacy(p) },
                      { key: 'approve', label: 'Valider l’agrément', icon: <Check size={14} />, variant: 'success', onClick: () => onApprovePharmacy(p.id) },
                    ]}
                  />
                </div>
              </div>
            ))}
            {pendingPharmacies.length === 0 && (
              <div className="pc-adm-empty-inline">
                <CheckCircle2 size={18} />
                <span>Aucune demande d’agrément en attente.</span>
              </div>
            )}
          </div>
        </section>

        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>File de modération catalogue</h3>
              <p>Nouveaux produits soumis par les officines.</p>
            </div>
            <button type="button" className="subtle-link" onClick={() => onNavigate('Validation produits')}>
              File complète <ArrowRight size={14} />
            </button>
          </div>
          <div className="pc-adm-queue-list">
            {pendingProducts.slice(0, 4).map(p => (
              <div className="pc-adm-queue-item" key={p.id}>
                <span className="pc-adm-queue-icon"><ModernPackageBoxIcon size={17} /></span>
                <div className="pc-adm-queue-info">
                  <b>{p.name}</b>
                  <small>
                    {data.pharmacies.find(x => x.id === p.pharmacyId)?.name || 'Établissement'} · {p.category} · {money(p.price)}
                  </small>
                </div>
                <div className="table-actions">
                  <ActionMenu
                    label={`Actions pour ${p.name}`}
                    items={[
                      { key: 'approve', label: 'Approuver et publier', icon: <Check size={14} />, variant: 'success', onClick: () => onApproveProduct(p.id, 'Publié') },
                      { key: 'review', label: 'Examiner dans le catalogue', icon: <Eye size={14} />, onClick: () => onNavigate('Validation produits') },
                    ]}
                  />
                </div>
              </div>
            ))}
            {pendingProducts.length === 0 && (
              <div className="pc-adm-empty-inline">
                <CheckCircle2 size={18} />
                <span>Aucun produit en attente de validation.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Governance Shortcuts & Live Audit Feed */}
      <div className="pc-adm-split-grid">
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Pôles & accès rapides</h3>
              <p>Raccourcis directs vers chaque module de gestion.</p>
            </div>
          </div>
          <div className="pc-adm-shortcut-grid">
            <button type="button" className="pc-adm-shortcut-tile" onClick={() => onNavigate('Comptes utilisateurs')}>
              <Users size={17} />
              <div>
                <b>Comptes utilisateurs</b>
                <small>{usersCount} compte(s) enregistrés</small>
              </div>
            </button>
            <button type="button" className="pc-adm-shortcut-tile" onClick={() => onNavigate('Rubrique Santé')}>
              <PhoneCall size={17} />
              <div>
                <b>Rubrique Santé</b>
                <small>{activeAlerts} alertes · {activeEmergency} numéros</small>
              </div>
            </button>
            <button type="button" className="pc-adm-shortcut-tile" onClick={() => onNavigate('Catégories plateforme')}>
              <Layers size={17} />
              <div>
                <b>Référentiel & Badges</b>
                <small>{data.platformCategories.length} catégories · {data.badges.length} badges</small>
              </div>
            </button>
            <button type="button" className="pc-adm-shortcut-tile" onClick={() => onNavigate('Messages contact')}>
              <ModernChatEncryptedIcon size={17} />
              <div>
                <b>Messages contact</b>
                <small>{openContactsCount} message(s) ouverts</small>
              </div>
            </button>
            <button type="button" className="pc-adm-shortcut-tile" onClick={() => onNavigate('Signalements')}>
              <ModernAlertWarningIcon size={17} />
              <div>
                <b>Signalements</b>
                <small>{openReportsCount} à traiter</small>
              </div>
            </button>
            <button type="button" className="pc-adm-shortcut-tile" onClick={() => onNavigate('Paramètres plateforme')}>
              <Settings size={17} />
              <div>
                <b>Paramètres généraux</b>
                <small>Fraîcheur : {data.freshnessDays} jours</small>
              </div>
            </button>
          </div>
        </section>

        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div>
              <h3>Journal d’audit récent</h3>
              <p>Dernières actions administratives et réseau tracées.</p>
            </div>
            <button type="button" className="subtle-link" onClick={() => onNavigate('Journal d’activité')}>
              Tout l’audit <ArrowRight size={14} />
            </button>
          </div>
          <div className="pc-adm-timeline">
            {auditLogs.slice(0, 5).map(l => (
              <div className="pc-adm-timeline-item" key={l.id}>
                <span className="pc-adm-timeline-dot"><Activity size={14} /></span>
                <div className="pc-adm-timeline-body">
                  <b>{l.action}</b>
                  <small>{l.actor} · {l.entity}{l.entityId ? ` #${l.entityId}` : ''}</small>
                </div>
                <time>{new Date(l.date).toString() === 'Invalid Date' ? l.date : new Date(l.date).toLocaleDateString('fr-FR')}</time>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="pc-adm-empty-inline">
                <ModernClipboardStockIcon size={18} />
                <span>Aucune activité tracée pour le moment.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
