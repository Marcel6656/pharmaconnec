'use client';

import { AuthenticatedImage } from '@/components/shared/AuthenticatedImage';
import React, { useMemo } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import {
  AppData,
  Metric,
  Pharmacy,
  Product,
  ProductTable,
  SectionTitle,
  isActiveTrial,
  isPharmacyActiveAndValid
} from '@/lib/shared';
import {
  ModernAlertWarningIcon,
  ModernChatEncryptedIcon,
  ModernClipboardStockIcon,
  ModernCreditCardPlanIcon,
  ModernDashboardIcon,
  ModernEmergency24Icon,
  ModernPackageBoxIcon,
  ModernRadarPinIcon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';
import {
  SanteProcheHeartCrossEmblem,
  SanteProcheWaveRibbon
} from '@/components/shared/SanteProcheIllustrations';

interface OverviewPageProps {
  data: AppData;
  pharmacyId: number;
  activePharmacy: Pharmacy;
  canOperatePharmacy?: boolean;
  myProducts: Product[];
  go: (p: string) => void;
  resetProductForm: (p?: Product) => void;
  onQuickStock?: (p: Product) => void;
  onDuplicate?: (p: Product) => void;
  removeProduct: (id: number) => void;
  productStatus: (id: number, s: 'Brouillon' | 'En attente' | 'Masqué' | 'Archivé') => void;
}

const CATALOG_BREAKDOWN = [
  ['Publié', 'green'],
  ['En attente', 'amber'],
  ['À corriger', 'red'],
  ['Brouillon', 'gray'],
] as const;

export function OverviewPage({
  data,
  pharmacyId,
  activePharmacy,
  canOperatePharmacy = true,
  myProducts,
  go,
  resetProductForm,
  onQuickStock,
  onDuplicate,
  removeProduct,
  productStatus
}: OverviewPageProps) {
  const { unreadMessages, publishedCount, pendingReviewCount, statusCounts } = useMemo(() => {
    const unreadMsgs = data.messages.filter(
      m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.read
    ).length;
    const counts: Record<string, number> = {};
    for (const p of myProducts) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return {
      unreadMessages: unreadMsgs,
      publishedCount: counts['Publié'] || 0,
      pendingReviewCount: (counts['En attente'] || 0) + (counts['À corriger'] || 0),
      statusCounts: counts,
    };
  }, [data.messages, myProducts, pharmacyId]);

  const showOperationalBanner =
    !canOperatePharmacy ||
    activePharmacy.status === 'En vérification' ||
    activePharmacy.status === 'En attente';

  const bannerConfig = useMemo(() => {
    if (activePharmacy.status === 'Abonnement expiré' || (activePharmacy.status === 'Validée' && !isPharmacyActiveAndValid(activePharmacy))) {
      return {
        tone: 'danger',
        title: 'Abonnement ou essai expiré — actions limitées',
        detail: 'La création et la mise à jour des produits et des stocks sont suspendues. Renouvelez votre abonnement pour rétablir votre visibilité publique (vous pouvez archiver des fiches en attendant).',
        ctaLabel: 'Renouveler mon abonnement',
        ctaPage: 'Abonnement',
      };
    }
    if (activePharmacy.status === 'Suspendue' || activePharmacy.status === 'Refusée') {
      return {
        tone: 'danger',
        title: `Établissement ${activePharmacy.status.toLowerCase()}`,
        detail: 'Votre fiche publique est masquée et les opérations catalogue sont verrouillées. Consultez votre dossier administratif ou contactez le support.',
        ctaLabel: 'Voir mon établissement',
        ctaPage: 'Mon établissement',
      };
    }
    return {
      tone: 'warning',
      title: `Dossier ${activePharmacy.status.toLowerCase()} — validation administrative en cours`,
      detail: 'Vous pouvez préparer vos brouillons de produits et compléter vos justificatifs. La publication publique, la messagerie patients et les formules payantes seront activées dès validation.',
      ctaLabel: 'Suivre ma vérification',
      ctaPage: 'Mon établissement',
    };
  }, [activePharmacy]);

  return (
    <>
      <SectionTitle
        eyebrow="TABLEAU DE BORD"
        badge={activePharmacy.status}
        title={`Bonjour, ${activePharmacy.name}`}
        desc="Voici un aperçu de votre présence sur PharmaConnect."
        icon={<ModernDashboardIcon size={24} />}
        action={
          <button
            type="button"
            className="primary-btn"
            disabled={!canOperatePharmacy}
            title={canOperatePharmacy ? 'Ajouter un nouveau produit' : 'Action indisponible pour le statut actuel de l’établissement'}
            onClick={() => resetProductForm()}
          >
            <Plus size={15} /> Ajouter un produit
          </button>
        }
      />

      {showOperationalBanner && (
        <div className={`pc-status-banner pc-status-banner--${bannerConfig.tone}`} role="status">
          <div className="pc-status-banner-content">
            <ModernAlertWarningIcon size={19} />
            <div>
              <strong>{bannerConfig.title}</strong>
              <p>{bannerConfig.detail}</p>
            </div>
          </div>
          <button type="button" className="outline-btn pc-status-banner-cta" onClick={() => go(bannerConfig.ctaPage)}>
            {bannerConfig.ctaLabel} <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="welcome-panel sp-welcome-blended">
        <div className="cg-welcome-copy" style={{ position: 'relative', zIndex: 2 }}>
          <div className="sp-blended-emblem-inline" style={{ marginBottom: 8 }}>
            <SanteProcheHeartCrossEmblem size={42} />
            <span className="sp-glass-chip">
              <ModernVerifiedShieldIcon size={14} />{' '}
              {activePharmacy.status === 'Validée' ? 'Établissement vérifié' : activePharmacy.status}
            </span>
          </div>
          <h2>Votre vitrine est votre premier contact.</h2>
          <p>Maintenez vos produits, stocks et coordonnées à jour pour informer les visiteurs.</p>
          <button type="button" className="white-btn" onClick={() => go('Mon établissement')}>
            Gérer ma vitrine <ArrowRight size={15} />
          </button>
        </div>
        <div className="sp-welcome-blended-media">
          <AuthenticatedImage src={activePharmacy.coverImage || '/images/pharmacy-interior.jpg'} alt={activePharmacy.name} className="sp-blended-photo-right" />
        </div>
        <SanteProcheWaveRibbon variant="emerald" className="sp-banner-wave" />
      </div>

      <div className="metric-grid">
        <Metric title="Produits au catalogue" value={String(myProducts.length)} detail="Produits enregistrés" icon={ModernPackageBoxIcon} />
        <Metric title="Produits publiés" value={String(publishedCount)} detail="Visibles au public" icon={ModernVerifiedShieldIcon} />
        <Metric title="À traiter" value={String(pendingReviewCount)} detail="Validation administrative" icon={ModernEmergency24Icon} />
        <Metric title="Messages non lus" value={String(unreadMessages)} detail="Demandes visiteurs" icon={ModernChatEncryptedIcon} />
      </div>

      <div className="cg-dashboard-quick-actions pc-dashboard-quick-actions">
        <button type="button" className="outline-btn pc-quick-action-btn" onClick={() => go('Stocks & prix')}>
          <ModernClipboardStockIcon size={15} /> Mettre à jour les stocks en direct
        </button>
        <button type="button" className="outline-btn pc-quick-action-btn" onClick={() => go('Messagerie')}>
          <ModernChatEncryptedIcon size={15} /> Consulter les messages patients ({unreadMessages} non lu{unreadMessages > 1 ? 's' : ''})
        </button>
        <button type="button" className="outline-btn pc-quick-action-btn" onClick={() => go('Mon établissement')}>
          <ModernRadarPinIcon size={15} /> Coordonnées, Horaires &amp; Gardes
        </button>
      </div>

      <div className="dashboard-grid">
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div><h3>État de votre catalogue</h3><p>Répartition par statut de publication.</p></div>
            <button type="button" className="subtle-link" onClick={() => go('Mes produits')}>
              Voir les produits <ArrowRight size={14} />
            </button>
          </div>
          <div className="status-summary">
            {CATALOG_BREAKDOWN.map(([s, c]) => (
              <div key={s}>
                <span className={`summary-dot ${c}`} />
                <span>{s}</span>
                <b>{statusCounts[s] || 0}</b>
              </div>
            ))}
          </div>
          <div className="horizontal-bars">
            {CATALOG_BREAKDOWN.map(([s, c]) => (
              <div className="bar-row" key={s}>
                <span>{s}</span>
                <div>
                  <i
                    className={c}
                    style={{
                      width: `${myProducts.length ? Math.max(3, ((statusCounts[s] || 0) / myProducts.length) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div><h3>Votre abonnement</h3><p>Formule actuellement associée au compte.</p></div>
            <ModernCreditCardPlanIcon size={20} />
          </div>
          <div className="plan-current">
            <span className="plan-icon"><ModernSparkleCrownIcon size={21} /></span>
            <div>
              <small>FORMULE</small>
              <h2>{isActiveTrial(activePharmacy) ? 'Essai Premium' : activePharmacy.subscription}</h2>
              <span>
                {activePharmacy.status === 'Abonnement expiré'
                  ? 'Abonnement expiré — renouvellement requis'
                  : !isPharmacyActiveAndValid(activePharmacy)
                    ? (activePharmacy.status === 'Validée' ? 'Échéance dépassée' : activePharmacy.status)
                    : activePharmacy.subscriptionEndsAt
                      ? `Actif jusqu’au ${new Date(activePharmacy.subscriptionEndsAt).toLocaleDateString('fr-FR')}`
                      : activePharmacy.trialEndsAt
                        ? `Essai gratuit jusqu’au ${new Date(activePharmacy.trialEndsAt).toLocaleDateString('fr-FR')}`
                        : `Statut : ${activePharmacy.status}`}
              </span>
            </div>
          </div>
          <button type="button" className="outline-btn full-btn" onClick={() => go('Abonnement')}>
            Gérer mon abonnement <ArrowRight size={14} />
          </button>
        </section>
      </div>

      <section className="panel cg-modern-panel">
        <div className="panel-heading">
          <div><h3>Dernières mises à jour</h3><p>Produits récents de votre catalogue.</p></div>
          <button type="button" className="subtle-link" onClick={() => go('Mes produits')}>
            Tout afficher <ArrowRight size={14} />
          </button>
        </div>
        <ProductTable
          products={myProducts.slice(0, 5)}
          pharmacies={data.pharmacies}
          onEdit={resetProductForm}
          onStock={onQuickStock}
          onDuplicate={onDuplicate}
          onDelete={removeProduct}
          onStatus={(id, s) => {
            if (s === 'Brouillon' || s === 'En attente' || s === 'Masqué' || s === 'Archivé') {
              productStatus(id, s);
            }
          }}
          admin={false}
          canOperate={canOperatePharmacy}
          allowArchiveWhenExpired={
            activePharmacy.status === 'Abonnement expiré' ||
            (activePharmacy.status === 'Validée' && !isPharmacyActiveAndValid(activePharmacy))
          }
        />
      </section>
    </>
  );
}
