'use client';

import React from 'react';
import { Product, SectionTitle } from '@/lib/shared';
import { StockRow } from '@/components/shared/StockRow';
import { ModernAlertWarningIcon, ModernClipboardStockIcon } from '@/components/shared/ModernIcons';

interface StocksPricesPageProps {
  myProducts: Product[];
  updateStock: (id: number, price: number, stock: number) => void;
}

export function StocksPricesPage({ myProducts, updateStock }: StocksPricesPageProps) {
  return (
    <>
      <SectionTitle
        eyebrow="MISE À JOUR EN DIRECT"
        title="Stocks & prix"
        desc="Actualisez les informations déclarées par votre pharmacie. La dernière date de mise à jour est visible au public."
        icon={<ModernClipboardStockIcon size={24} />}
      />
      <div className="info-note">
        <ModernAlertWarningIcon size={17} /> Le stock affiché est une déclaration de l’établissement et ne constitue pas une garantie de disponibilité instantanée.
      </div>
      <section className="panel cg-modern-panel">
        <div className="panel-heading">
          <div>
            <h3>Actualisation rapide</h3>
            <p>Modifiez le prix et le stock des produits déjà enregistrés.</p>
          </div>
        </div>
        <div className="stock-editor">
          {myProducts.map(p => (
            <StockRow key={p.id} product={p} onSave={(price, stock) => updateStock(p.id, price, stock)} />
          ))}
        </div>
      </section>
    </>
  );
}
