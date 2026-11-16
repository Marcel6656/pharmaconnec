'use client';

import { AuthenticatedImage } from '@/components/shared/AuthenticatedImage';
import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { AppData, Pharmacy, Product, SectionTitle, Metric, ProductTable, isActiveTrial, isPharmacyActiveAndValid } from '@/lib/shared';
import {
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
  myProducts: Product[];
  go: (p: string) => void;
  resetProductForm: (p?: Product) => void;
  onQuickStock?: (p: Product) => void;
  onDuplicate?: (p: Product) => void;
  removeProduct: (id: number) => void;
  productStatus: (id: number, s: any) => void;
}

export function OverviewPage({
  data,
  pharmacyId,
  activePharmacy,
  myProducts,
  go,
  resetProductForm,
  onQuickStock,
  onDuplicate,
  removeProduct,
  productStatus
}: OverviewPageProps) {
  const unreadMessages = data.messages.filter(m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.read).length;

  return (
    <>
      <SectionTitle
        eyebrow="TABLEAU DE BORD"
        badge={activePharmacy.status}
        title={`Bonjour, ${activePharmacy.name}`}
        desc="Voici un aperçu de votre présence sur PharmaConnect."
        icon={<ModernDashboardIcon size={24} />}
        action={<button className="primary-btn" onClick={() => resetProductForm()}><Plus size={15} /> Ajouter un produit</button>}
      />
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
          <button className="white-btn" onClick={() => go('Mon établissement')}>Gérer ma vitrine <ArrowRight size={15} /></button>
        </div>
        <div className="sp-welcome-blended-media">
          <AuthenticatedImage src={activePharmacy.coverImage || '/images/pharmacy-interior.jpg'} alt={activePharmacy.name} className="sp-blended-photo-right" />
        </div>
        <SanteProcheWaveRibbon variant="emerald" className="sp-banner-wave" />
      </div>
      <div className="metric-grid">
        <Metric title="Produits au catalogue" value={String(myProducts.length)} detail="Produits enregistrés" icon={ModernPackageBoxIcon} />
        <Metric title="Produits publiés" value={String(myProducts.filter(p => p.status === 'Publié').length)} detail="Visibles au public" icon={ModernVerifiedShieldIcon} />
        <Metric title="À traiter" value={String(myProducts.filter(p => ['En attente', 'À corriger'].includes(p.status)).length)} detail="Validation administrative" icon={ModernEmergency24Icon} />
        <Metric title="Messages non lus" value={String(unreadMessages)} detail="Demandes visiteurs" icon={ModernChatEncryptedIcon} />
      </div>

      <div className="cg-dashboard-quick-actions" style={{ display: 'flex', gap: '10px', margin: '14px 0 20px', flexWrap: 'wrap' }}>
        <button type="button" className="outline-btn" onClick={() => go('Stocks & prix')} style={{ background: '#ffffff' }}>
          <ModernClipboardStockIcon size={15} /> Mettre à jour les stocks en direct
        </button>
        <button type="button" className="outline-btn" onClick={() => go('Messagerie')} style={{ background: '#ffffff' }}>
          <ModernChatEncryptedIcon size={15} /> Consulter les messages patients ({unreadMessages} non lu)
        </button>
        <button type="button" className="outline-btn" onClick={() => go('Mon établissement')} style={{ background: '#ffffff' }}>
          <ModernRadarPinIcon size={15} /> Coordonnées, Horaires & Gardes
        </button>
      </div>
      <div className="dashboard-grid">
        <section className="panel cg-modern-panel">
          <div className="panel-heading">
            <div><h3>État de votre catalogue</h3><p>Répartition par statut de publication.</p></div>
            <button className="subtle-link" onClick={() => go('Mes produits')}>Voir les produits <ArrowRight size={14} /></button>
          </div>
          <div className="status-summary">
            {[['Publié', 'green'], ['En attente', 'amber'], ['À corriger', 'red'], ['Brouillon', 'gray']].map(([s, c]) => (
              <div key={s}><span className={`summary-dot ${c}`} /><span>{s}</span><b>{myProducts.filter(p => p.status === s).length}</b></div>
            ))}
          </div>
          <div className="horizontal-bars">
            {[['Publié', 'green'], ['En attente', 'amber'], ['À corriger', 'red'], ['Brouillon', 'gray']].map(([s, c]) => (
              <div className="bar-row" key={s}>
                <span>{s}</span>
                <div><i className={c} style={{ width: `${myProducts.length ? Math.max(3, myProducts.filter(p => p.status === s).length / myProducts.length * 100) : 0}%` }} /></div>
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
          <button className="outline-btn full-btn" onClick={() => go('Abonnement')}>Gérer mon abonnement <ArrowRight size={14} /></button>
        </section>
      </div>
      <section className="panel cg-modern-panel">
        <div className="panel-heading">
          <div><h3>Dernières mises à jour</h3><p>Produits récents de votre catalogue.</p></div>
          <button className="subtle-link" onClick={() => go('Mes produits')}>Tout afficher <ArrowRight size={14} /></button>
        </div>
        <ProductTable
          rows={myProducts.slice(0, 5)}
          onEdit={resetProductForm}
          onQuickStock={onQuickStock}
          onDuplicate={onDuplicate}
          onDelete={removeProduct}
          onStatus={productStatus}
          admin={false}
        />
      </section>
    </>
  );
}
