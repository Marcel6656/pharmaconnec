'use client';

import React, { useEffect, useState } from 'react';
import { Check, History } from 'lucide-react';
import { Product, Status, money } from '@/lib/shared';
import { AuthenticatedImage } from '@/components/shared/AuthenticatedImage';
import { ModernPackageBoxIcon } from '@/components/shared/ModernIcons';

interface StockRowProps {
  product: Product;
  lowStockThreshold?: number;
  canOperate?: boolean;
  onSave: (price: number, stock: number) => Promise<boolean> | void;
}

const LOCKED_PRODUCT_STATUSES = new Set(['Refusé', 'Suspendu', 'Archivé']);

export function StockRow({
  product,
  lowStockThreshold = 5,
  canOperate = true,
  onSave,
}: StockRowProps) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrice(String(product.price));
    setStock(String(product.stock));
  }, [product.price, product.stock]);

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);
  const validValues =
    price.trim() !== '' &&
    stock.trim() !== '' &&
    Number.isFinite(parsedPrice) &&
    Number.isInteger(parsedStock) &&
    parsedPrice >= 0 &&
    parsedStock >= 0 &&
    Math.round(parsedPrice * 100) === Math.round(Number((parsedPrice * 100).toFixed(6)));

  const isLocked = !canOperate || LOCKED_PRODUCT_STATUSES.has(product.status);
  const isDirty = validValues && (parsedPrice !== product.price || parsedStock !== product.stock);
  const stockLevelClass =
    product.stock === 0 ? 'stock-empty' : product.stock <= lowStockThreshold ? 'stock-low' : 'stock-good';

  const handleSave = async () => {
    if (isLocked || !validValues || !isDirty || saving) return;
    setSaving(true);
    try {
      await onSave(parsedPrice, parsedStock);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr className={`pc-stock-row ${isDirty ? 'is-dirty' : ''} ${isLocked ? 'is-locked' : ''}`}>
        <td>
          <div className="table-product">
            <span className="product-thumb">
              {product.imageDataUrl ? (
                <AuthenticatedImage src={product.imageDataUrl} alt="" />
              ) : (
                <ModernPackageBoxIcon size={17} />
              )}
            </span>
            <div>
              <b>{product.name}</b>
              <small>{product.brand || 'Marque non renseignée'}</small>
              <button
                type="button"
                className="history-toggle"
                aria-expanded={showHistory}
                onClick={() => setShowHistory(v => !v)}
              >
                <History size={12} /> {showHistory ? 'Masquer' : 'Historique'} ({product.stockHistory?.length || 0})
              </button>
            </div>
          </div>
        </td>
        <td>{product.category}</td>
        <td><Status>{product.status}</Status></td>
        <td>
          <span className={stockLevelClass}>{product.stock}</span>
        </td>
        <td>
          <input
            type="number"
            min="0"
            step="0.01"
            className="pc-stock-input"
            aria-label={`Prix (FCFA) pour ${product.name}`}
            value={price}
            disabled={isLocked || saving}
            onChange={e => setPrice(e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            min="0"
            step="1"
            className="pc-stock-input"
            aria-label={`Nouveau stock pour ${product.name}`}
            value={stock}
            disabled={isLocked || saving}
            onChange={e => setStock(e.target.value)}
          />
        </td>
        <td>{product.updated}</td>
        <td>
          <button
            type="button"
            className="outline-btn pc-stock-save-btn"
            disabled={isLocked || !validValues || !isDirty || saving}
            title={
              isLocked
                ? 'Modification verrouillée pour ce statut'
                : !isDirty
                  ? 'Modifiez le prix ou le stock pour enregistrer'
                  : 'Enregistrer la mise à jour'
            }
            onClick={() => void handleSave()}
          >
            <Check size={14} /> {saving ? 'Envoi…' : 'Enregistrer'}
          </button>
        </td>
      </tr>
      {showHistory && (
        <tr className="pc-stock-history-row">
          <td colSpan={8}>
            <div className="stock-history">
              {(product.stockHistory || []).map((h, i) => (
                <span key={i}>
                  {h.date} · <b>{money(h.price)}</b> · stock {h.stock}
                </span>
              ))}
              {!(product.stockHistory || []).length && <small>Aucun historique disponible.</small>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
