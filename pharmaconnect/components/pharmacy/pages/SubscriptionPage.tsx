'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  AppData,
  Metric,
  PaymentsTable,
  Pharmacy,
  SectionTitle,
  Status,
  isActiveTrial,
  money
} from '@/lib/shared';
import {
  ModernCreditCardPlanIcon,
  ModernEmergency24Icon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';
import { SanteProcheCalendarScene } from '@/components/shared/SanteProcheIllustrations';

type PaymentFilter = 'Tous' | 'Confirmé' | 'En attente' | 'Échoué';
const PAYMENT_STATUS_TABS: PaymentFilter[] = ['Tous', 'Confirmé', 'En attente', 'Échoué'];

interface SubscriptionPageProps {
  data: AppData;
  pharmacyId: number;
  activePharmacy: Pharmacy;
  canOperatePharmacy?: boolean;
  planPeriod: string;
  setPlanPeriod: (p: string) => void;
  changePlan: (plan: any) => void;
  go?: (p: string) => void;
  onRequestCancellation?: () => void;
}

export function SubscriptionPage({
  data,
  pharmacyId,
  activePharmacy,
  planPeriod,
  setPlanPeriod,
  changePlan,
  go,
  onRequestCancellation,
}: SubscriptionPageProps) {
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('Tous');

  const canSubscribe = ['Validée', 'Abonnement expiré'].includes(activePharmacy.status);

  const { myPayments, confirmedCount, pendingCount, filteredPayments } = useMemo(() => {
    const mine = data.payments.filter(p => p.pharmacyId === pharmacyId);
    const confirmed = mine.filter(p => p.status === 'Confirmé').length;
    const pending = mine.filter(p => p.status === 'En attente').length;
    const filtered = paymentFilter === 'Tous' ? mine : mine.filter(p => p.status === paymentFilter);
    return {
      myPayments: mine,
      confirmedCount: confirmed,
      pendingCount: pending,
      filteredPayments: filtered,
    };
  }, [data.payments, pharmacyId, paymentFilter]);

  const activePlanLabel = isActiveTrial(activePharmacy)
    ? 'Essai Premium'
    : activePharmacy.subscription || 'Basic';

  return (
    <>
      <SectionTitle
        eyebrow="FACTURATION & FORMULES"
        title="Abonnement"
        desc="Consultez votre formule, comparez les offres et suivez vos paiements."
        icon={<ModernCreditCardPlanIcon size={24} />}
      />

      <div className="trial-banner cg-trial-banner-pro">
        <span className="cg-info-icon-pill"><ModernSparkleCrownIcon size={19} /></span>
        <span>
          <b>Essai gratuit de 14 jours</b> : dès approbation de votre officine, « Votre essai gratuit de 14 jours commence maintenant ».
        </span>
      </div>

      <div className="metric-grid">
        <Metric
          title="Formule active"
          value={activePlanLabel}
          detail={`Statut dossier : ${activePharmacy.status}`}
          icon={ModernSparkleCrownIcon}
        />
        <Metric
          title="Paiements confirmés"
          value={String(confirmedCount)}
          detail={`${myPayments.length} demande(s) enregistrée(s)`}
          icon={ModernVerifiedShieldIcon}
        />
        <Metric
          title="En attente de validation"
          value={String(pendingCount)}
          detail="Rapprochement Mobile Money"
          icon={ModernEmergency24Icon}
        />
      </div>

      <div className="subscription-current">
        <div>
          <small>FORMULE ACTUELLE</small>
          <h2>{activePlanLabel}</h2>
          <p>
            {activePharmacy.subscriptionEndsAt
              ? `Échéance : ${new Date(activePharmacy.subscriptionEndsAt).toLocaleDateString('fr-FR')}`
              : activePharmacy.trialEndsAt
                ? `Fin de l’essai : ${new Date(activePharmacy.trialEndsAt).toLocaleDateString('fr-FR')}`
                : 'Aucune échéance enregistrée.'}
          </p>
        </div>
        <Status>{activePharmacy.status}</Status>
      </div>

      <div className="period-switch">
        <button type="button" className={planPeriod === 'monthly' ? 'active' : ''} onClick={() => setPlanPeriod('monthly')}>Mensuel</button>
        <button type="button" className={planPeriod === 'quarterly' ? 'active' : ''} onClick={() => setPlanPeriod('quarterly')}>Trimestriel</button>
        <button type="button" className={planPeriod === 'yearly' ? 'active' : ''} onClick={() => setPlanPeriod('yearly')}>Annuel</button>
      </div>

      {!canSubscribe && (
        <div className="pc-status-banner pc-status-banner--warning">
          <div className="pc-status-banner-content">
            <ModernCreditCardPlanIcon size={18} />
            <div>
              <strong>Validation requise avant souscription</strong>
              <p>L’administration doit valider ou réactiver votre dossier avant d’enregistrer un paiement.</p>
            </div>
          </div>
          {go && (
            <button type="button" className="outline-btn pc-status-banner-cta" onClick={() => go('Mon établissement')}>
              Voir mon dossier <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      <div className="pricing-grid compact">
        {data.plans.map(p => {
          const isCurrentPlan = activePharmacy.subscription === p.name;
          const isPremium = p.name === 'Premium';
          return (
            <div
              className={`price-card cg-price-card-modern ${isPremium ? 'featured' : ''} ${isCurrentPlan ? 'is-current-plan' : ''}`}
              key={p.name}
            >
              <div className="pc-plan-card-top">
                <div className="eyebrow">{p.name.toUpperCase()}</div>
                {isCurrentPlan && <span className="pc-plan-current-pill">Formule actuelle</span>}
              </div>
              <div className="price-value">
                {money(p[planPeriod as 'monthly' | 'quarterly' | 'yearly'])}
                <small> / période</small>
              </div>
              {p.features.map(f => (
                <div className="price-feature" key={f}>
                  <ModernVerifiedShieldIcon size={15} />
                  {f}
                </div>
              ))}
              <button
                type="button"
                className={isPremium ? 'primary-btn full-btn' : 'outline-btn full-btn'}
                disabled={!canSubscribe}
                onClick={() => changePlan(p)}
              >
                {isCurrentPlan ? `Renouveler ${p.name}` : `Choisir ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <section className="panel cg-modern-panel">
        <div className="panel-heading">
          <div>
            <h3>Historique des paiements</h3>
            <p>{filteredPayments.length} transaction(s) affichée(s)</p>
          </div>
        </div>
        <div className="pc-status-filter-bar" role="tablist" aria-label="Filtrer les paiements par statut">
          {PAYMENT_STATUS_TABS.map(status => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={paymentFilter === status}
              className={`pc-status-pill ${paymentFilter === status ? 'active' : ''}`}
              onClick={() => setPaymentFilter(status)}
            >
              <span>{status}</span>
            </button>
          ))}
        </div>
        <PaymentsTable
          payments={filteredPayments}
          pharmacies={data.pharmacies}
          hidePharmacyColumn
        />
      </section>

      <div className="info-note">
        <ModernCreditCardPlanIcon size={17} />
        <span>Paiement Mobile Money disponible auprès des opérateurs agréés de votre pays.</span>
      </div>

      <section className="panel cg-modern-panel pc-cancellation-panel">
        <h3>Résiliation, non-renouvellement &amp; rétractation (14 jours)</h3>
        <p className="muted">
          Aucun débit automatique par carte n’est effectué sans action de votre part. Pour résilier votre abonnement en cours ou exercer votre droit de rétractation de 14 jours (art. L.221-3 / L.221-18 C. conso), utilisez le bouton ci-dessous.
        </p>
        {onRequestCancellation && (
          <button
            type="button"
            className="outline-btn"
            onClick={onRequestCancellation}
          >
            Demander la résiliation ou le remboursement
          </button>
        )}
      </section>

      <div className="pc-subscription-calendar-wrap">
        <SanteProcheCalendarScene
          title="Gestion simplifiée des échéances et renouvellements"
          subtitle="Votre visibilité reste active pendant l’essai de 14 jours puis à chaque échéance confirmée."
        />
      </div>
    </>
  );
}
