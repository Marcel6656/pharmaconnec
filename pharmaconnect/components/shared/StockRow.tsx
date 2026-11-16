'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Product, money } from '@/lib/shared';

interface StockRowProps {
  product: Product;
  onSave: (price: number, stock: number) => void;
}

export function StockRow({ product, onSave }: StockRowProps) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [showHistory, setShowHistory] = useState(false);

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
    parsedStock >= 0;

  return (
    <div className="stock-row-wrap">
      <div className="stock-row">
        <div>
          <b>{product.name}</b>
          <small>{product.category} · Actualisé {product.updated}</small>
          <button className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Masquer' : 'Historique'} ({product.stockHistory?.length || 0})
          </button>
        </div>
        <label>
          Prix FCFA
          <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
        </label>
        <label>
          Stock
          <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} />
        </label>
        <button className="outline-btn" disabled={!validValues} onClick={() => validValues && onSave(parsedPrice, parsedStock)}>
          <Check size={14} /> Enregistrer
        </button>
      </div>
      {showHistory && (
        <div className="stock-history">
          {(product.stockHistory || []).map((h, i) => (
            <span key={i}>{h.date} <b>{money(h.price)}</b> · stock {h.stock}</span>
          ))}
          {!(product.stockHistory || []).length && <small>Aucun historique disponible.</small>}
        </div>
      )}
    </div>
  );
}
