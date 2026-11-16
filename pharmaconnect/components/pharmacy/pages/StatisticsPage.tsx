'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { AppData, Product, SectionTitle, Metric } from '@/lib/shared';
import {
  ModernChatEncryptedIcon,
  ModernLivePulseIcon,
  ModernPackageBoxIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

interface StatisticsPageProps {
  data: AppData;
  pharmacyId: number;
  myProducts: Product[];
}

export function StatisticsPage({ data, pharmacyId, myProducts }: StatisticsPageProps) {
  const activeProducts = myProducts.filter(product => product.status !== 'Archivé');
  const publishedCount = activeProducts.filter(product => product.status === 'Publié').length;
  const threshold = data.preferences[pharmacyId]?.lowStockThreshold ?? 5;
  const lowStockCount = activeProducts.filter(product => product.stock > 0 && product.stock <= threshold).length;
  const totalThreads = data.messages.filter(m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.threadId).length;
  const answeredThreads = data.messages.filter(
    m => m.pharmacyId === pharmacyId && m.direction === 'visitor' && !m.threadId && data.messages.some(r => r.threadId === m.id && r.direction === 'pharmacy')
  ).length;

  return (
    <>
      <SectionTitle
        eyebrow="ANALYSE & VISIBILITÉ"
        title="Statistiques"
        desc="Indicateurs réels calculés à partir de votre catalogue et de vos échanges patients."
        icon={<ModernLivePulseIcon size={24} />}
      />
      <div className="metric-grid">
        <Metric title="Produits publiés" value={String(publishedCount)} detail={`${activeProducts.length} produits actifs`} icon={Eye} />
        <Metric title={`Stocks faibles (≤ ${threshold})`} value={String(lowStockCount)} detail="Réassort conseillé" icon={ModernPackageBoxIcon} />
        <Metric title="Demandes patients" value={String(totalThreads)} detail={`${answeredThreads} fil(s) avec réponse`} icon={ModernChatEncryptedIcon} />
        <Metric title="Disponibilité déclarée" value={`${activeProducts.filter(product => product.stock > 0).length}/${activeProducts.length}`} detail="Produits avec stock supérieur à 0" icon={ModernVerifiedShieldIcon} />
      </div>
    </>
  );
}
