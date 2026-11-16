'use client';

import React from 'react';
import { AppData, Pharmacy, money, SectionTitle, Status, PaymentsTable, isActiveTrial } from '@/lib/shared';
import {
  ModernCreditCardPlanIcon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';
import { SanteProcheCalendarScene } from '@/components/shared/SanteProcheIllustrations';

interface SubscriptionPageProps {
  data: AppData;
  pharmacyId: number;
  activePharmacy: Pharmacy;
  planPeriod: string;
  setPlanPeriod: (p: string) => void;
  changePlan: (plan: any) => void;
}

export function SubscriptionPage({
  data,
  pharmacyId,
  activePharmacy,
  planPeriod,
  setPlanPeriod,
  changePlan
}: SubscriptionPageProps) {
  const canSubscribe = ['Validée', 'Abonnement expiré'].includes(activePharmacy.status)
    && Boolean(activePharmacy.subscriptionEndsAt || activePharmacy.trialEndsAt);
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
        <span><b>Essai gratuit de 14 jours</b> : déclenché uniquement après validation de l’établissement.</span>
      </div>
      <div className="subscription-current">
        <div>
          <small>FORMULE ACTUELLE</small>
          <h2>{isActiveTrial(activePharmacy) ? 'Essai Premium' : activePharmacy.subscription}</h2>
          <p>{activePharmacy.subscriptionEndsAt ? `Échéance : ${new Date(activePharmacy.subscriptionEndsAt).toLocaleDateString('fr-FR')}` : activePharmacy.trialEndsAt ? `Fin de l’essai : ${new Date(activePharmacy.trialEndsAt).toLocaleDateString('fr-FR')}` : 'Aucune échéance enregistrée.'}</p>
        </div>
        <Status>{activePharmacy.status}</Status>
      </div>
      <div className="period-switch">
        <button className={planPeriod === 'monthly' ? 'active' : ''} onClick={() => setPlanPeriod('monthly')}>Mensuel</button>
        <button className={planPeriod === 'quarterly' ? 'active' : ''} onClick={() => setPlanPeriod('quarterly')}>Trimestriel</button>
        <button className={planPeriod === 'yearly' ? 'active' : ''} onClick={() => setPlanPeriod('yearly')}>Annuel</button>
      </div>
      {!canSubscribe && <p className="info-note">L’administration doit valider ou réactiver votre dossier avant un paiement.</p>}
      <div className="pricing-grid compact">
        {data.plans.map((p, i) => (
          <div className={`price-card cg-price-card-modern ${i === 2 ? 'featured' : ''}`} key={p.name}>
            <div className="eyebrow">{p.name.toUpperCase()}</div>
            <div className="price-value">{money(p[planPeriod as 'monthly' | 'quarterly' | 'yearly'])}<small> / période</small></div>
            {p.features.map(f => (
              <div className="price-feature" key={f}><ModernVerifiedShieldIcon size={15} />{f}</div>
            ))}
            <button className={i === 2 ? 'primary-btn full-btn' : 'outline-btn full-btn'} disabled={!canSubscribe} onClick={() => changePlan(p)}>Choisir {p.name}</button>
          </div>
        ))}
      </div>
      <section className="panel cg-modern-panel">
        <div className="panel-heading"><div><h3>Historique des paiements</h3><p>Factures et demandes de paiement enregistrées.</p></div></div>
        <PaymentsTable payments={data.payments.filter(p => p.pharmacyId === pharmacyId)} pharmacies={data.pharmacies} />
      </section>
      <div className="info-note">
        <ModernCreditCardPlanIcon size={17} /> Souscrivez par Mobile Money auprès des opérateurs disponibles.
      </div>
      <div style={{ marginTop: 18 }}>
        <SanteProcheCalendarScene
          title="Gestion simplifiée des échéances et renouvellements"
          subtitle="Votre visibilité reste active pendant l’essai de 14 jours puis à chaque échéance confirmée."
        />
      </div>
    </>
  );
}
