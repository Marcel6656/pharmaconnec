'use client';

import React, { useMemo } from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import {
  AppData,
  BadgeGlyph,
  Empty,
  Metric,
  Pharmacy,
  Product,
  SectionTitle,
  Status,
  activeBadges,
  isActiveTrial,
  isPharmacyActiveAndValid
} from '@/lib/shared';
import {
  ModernChatEncryptedIcon,
  ModernClipboardStockIcon,
  ModernLivePulseIcon,
  ModernPackageBoxIcon,
  ModernSparkleCrownIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

interface StatisticsPageProps {
  data: AppData;
  pharmacyId: number;
  activePharmacy?: Pharmacy;
  canOperatePharmacy?: boolean;
  myProducts: Product[];
  go?: (p: string) => void;
}

function getEffectivePlan(pharmacy?: Pharmacy): 'Basic' | 'Standard' | 'Premium' {
  if (!pharmacy || pharmacy.status !== 'Validée' || !isPharmacyActiveAndValid(pharmacy)) {
    return 'Basic';
  }
  if (isActiveTrial(pharmacy)) return 'Premium';
  if (pharmacy.subscription === 'Premium' || pharmacy.subscription === 'Standard') {
    return pharmacy.subscription;
  }
  return 'Basic';
}

export function StatisticsPage({
  data,
  pharmacyId,
  activePharmacy,
  myProducts,
  go
}: StatisticsPageProps) {
  const threshold = data.preferences[pharmacyId]?.lowStockThreshold ?? 5;
  const effectivePlan = getEffectivePlan(activePharmacy);
  const analyticsUnlocked = effectivePlan === 'Standard' || effectivePlan === 'Premium';

  const pharmacyBadges = useMemo(
    () => (activePharmacy ? activeBadges(activePharmacy, data.badges) : []),
    [activePharmacy, data.badges]
  );

  const {
    activeProducts,
    publishedCount,
    lowStockCount,
    inStockCount,
    totalThreads,
    answeredThreads,
    replenishmentList,
    categoryBreakdown,
  } = useMemo(() => {
    const active = myProducts.filter(product => product.status !== 'Archivé');
    const published = active.filter(product => product.status === 'Publié').length;
    const lowStock = active.filter(product => product.stock > 0 && product.stock <= threshold).length;
    const inStock = active.filter(product => product.stock > 0).length;

    const rootThreads = data.messages.filter(
      m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.threadId
    );
    const answered = rootThreads.filter(m =>
      data.messages.some(r => r.threadId === m.id && r.direction === 'pharmacy')
    ).length;

    const toReplenish = active
      .filter(product => product.stock <= threshold)
      .sort((a, b) => a.stock - b.stock);

    const catMap = new Map<
      string,
      { category: string; total: number; published: number; inStock: number; lowOrEmpty: number }
    >();
    for (const product of active) {
      const key = product.category || 'Non classé';
      const entry = catMap.get(key) || {
        category: key,
        total: 0,
        published: 0,
        inStock: 0,
        lowOrEmpty: 0,
      };
      entry.total += 1;
      if (product.status === 'Publié') entry.published += 1;
      if (product.stock > 0) entry.inStock += 1;
      if (product.stock <= threshold) entry.lowOrEmpty += 1;
      catMap.set(key, entry);
    }

    const categoriesSorted = Array.from(catMap.values()).sort((a, b) => b.total - a.total);

    return {
      activeProducts: active,
      publishedCount: published,
      lowStockCount: lowStock,
      inStockCount: inStock,
      totalThreads: rootThreads.length,
      answeredThreads: answered,
      replenishmentList: toReplenish,
      categoryBreakdown: categoriesSorted,
    };
  }, [data.messages, myProducts, pharmacyId, threshold]);

  return (
    <>
      <SectionTitle
        eyebrow="ANALYSE & VISIBILITÉ"
        badge={effectivePlan}
        title="Statistiques"
        desc="Indicateurs réels calculés à partir de votre catalogue et de vos échanges patients."
        icon={<ModernLivePulseIcon size={24} />}
      />

      {pharmacyBadges.length > 0 && (
        <div className="pc-stats-badges-bar">
          <span className="pc-stats-badges-label">Badges actifs :</span>
          <div className="pc-establishment-badges">
            {pharmacyBadges.map(b => (
              <span key={b.id} className={`badge-label ${b.color}`}>
                <BadgeGlyph icon={b.icon} size={14} /> {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="metric-grid">
        <Metric title="Produits publiés" value={String(publishedCount)} detail={`${activeProducts.length} produits actifs`} icon={Eye} />
        <Metric title={`Stocks faibles (≤ ${threshold})`} value={String(lowStockCount)} detail="Réassort conseillé" icon={ModernPackageBoxIcon} />
        <Metric title="Demandes patients" value={String(totalThreads)} detail={`${answeredThreads} fil(s) avec réponse`} icon={ModernChatEncryptedIcon} />
        <Metric title="Disponibilité déclarée" value={`${inStockCount}/${activeProducts.length}`} detail="Produits avec stock supérieur à 0" icon={ModernVerifiedShieldIcon} />
      </div>

      {!analyticsUnlocked ? (
        <section className="panel cg-modern-panel pc-upgrade-callout">
          <div className="pc-upgrade-callout-body">
            <span className="cg-info-icon-pill"><ModernSparkleCrownIcon size={20} /></span>
            <div>
              <h3>Analyses détaillées de réapprovisionnement et de catégories</h3>
              <p className="muted">
                Le suivi détaillé des références à réapprovisionner et la répartition par catégorie sont inclus dans les formules <b>Standard</b> et <b>Premium</b> (ainsi que pendant votre essai gratuit de 14 jours après validation).
              </p>
            </div>
          </div>
          {go && (
            <button type="button" className="primary-btn" onClick={() => go('Abonnement')}>
              Découvrir Standard &amp; Premium <ArrowRight size={14} />
            </button>
          )}
        </section>
      ) : (
        <div className="pc-stats-tables-grid">
          <section className="panel cg-modern-panel">
            <div className="panel-heading">
              <div>
                <h3>Produits à réapprovisionner</h3>
                <p>Références en rupture ou sous le seuil d’alerte (≤ {threshold}).</p>
              </div>
              {go && (
                <button type="button" className="outline-btn" onClick={() => go('Stocks & prix')}>
                  <ModernClipboardStockIcon size={14} /> Stocks &amp; prix
                </button>
              )}
            </div>
            {replenishmentList.length === 0 ? (
              <Empty
                title="Aucun réassort urgent"
                detail="Toutes vos références actives dépassent votre seuil de stock faible."
              />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PRODUIT</th>
                      <th>CATÉGORIE</th>
                      <th>STATUT</th>
                      <th>STOCK</th>
                      <th>MISE À JOUR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {replenishmentList.map(p => (
                      <tr key={p.id}>
                        <td>
                          <b>{p.name}</b>
                          <small className="table-sub">{p.brand || 'Marque non renseignée'}</small>
                        </td>
                        <td>{p.category}</td>
                        <td><Status>{p.status}</Status></td>
                        <td>
                          <span className={p.stock === 0 ? 'stock-empty' : 'stock-low'}>
                            {p.stock}
                          </span>
                        </td>
                        <td>{p.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel cg-modern-panel">
            <div className="panel-heading">
              <div>
                <h3>Répartition par catégorie</h3>
                <p>Couverture catalogue, publication et disponibilité par famille.</p>
              </div>
            </div>
            {categoryBreakdown.length === 0 ? (
              <Empty
                title="Aucune catégorie active"
                detail="Ajoutez des produits pour afficher la répartition par catégorie."
              />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>CATÉGORIE</th>
                      <th>PRODUITS</th>
                      <th>PUBLIÉS</th>
                      <th>EN STOCK</th>
                      <th>STOCK FAIBLE / RUPTURE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryBreakdown.map(row => (
                      <tr key={row.category}>
                        <td><b>{row.category}</b></td>
                        <td>{row.total}</td>
                        <td>{row.published}</td>
                        <td><span className="stock-good">{row.inStock}</span></td>
                        <td>
                          <span className={row.lowOrEmpty > 0 ? 'stock-low' : 'stock-good'}>
                            {row.lowOrEmpty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
