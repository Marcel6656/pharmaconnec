'use client';

import { Ban, Check, History, Pencil, ShieldAlert } from 'lucide-react';
import { AuthenticatedImage } from '@/components/shared/AuthenticatedImage';
import { Modal, Pharmacy, Product, ProductStatus, Status, money } from '@/lib/shared';
import { ModernPackageBoxIcon } from '@/components/shared/ModernIcons';

interface AdminProductInspectModalProps {
  product: Product | null;
  pharmacies: Pharmacy[];
  busy?: boolean;
  onClose: () => void;
  onApprove: (product: Product) => Promise<boolean | void> | void;
  onModerate: (product: Product, status: ProductStatus) => void;
  onEdit: (product: Product) => void;
}

/**
 * Read-only product inspection modal for admin moderation with quick actions.
 */
export function AdminProductInspectModal({
  product,
  pharmacies,
  busy = false,
  onClose,
  onApprove,
  onModerate,
  onEdit,
}: AdminProductInspectModalProps) {
  if (!product) return null;

  const pharmacy = pharmacies.find(x => x.id === product.pharmacyId);
  const pharmacyLabel = pharmacy?.name || `Pharmacie #${product.pharmacyId}`;
  const canApprove = ['En attente', 'À corriger', 'Refusé', 'Suspendu', 'Masqué'].includes(product.status);
  const canRequestFix = ['En attente', 'Publié'].includes(product.status);
  const canRefuse = product.status === 'En attente';
  const canSuspend = product.status === 'Publié';

  return (
    <Modal
      title={`Inspection produit · ${product.name}`}
      icon={<ModernPackageBoxIcon size={20} />}
      onClose={onClose}
      wide
    >
      <div className="pc-adm-inspect-layout">
        <div className="pc-adm-inspect-media">
          {product.imageDataUrl ? (
            <AuthenticatedImage src={product.imageDataUrl} alt={product.name} />
          ) : (
            <div className="pc-adm-inspect-placeholder">
              <ModernPackageBoxIcon size={40} />
              <span>Aucun visuel fourni</span>
            </div>
          )}
        </div>

        <div className="pc-adm-inspect-details">
          <div className="pc-dossier-head">
            <div>
              <span className="cg-eyebrow">{product.category}</span>
              <h4>{product.name}</h4>
            </div>
            <Status>{product.status}</Status>
          </div>

          <ul className="pc-dossier-list">
            <li><strong>Officine :</strong> {pharmacyLabel}</li>
            <li><strong>Marque / Laboratoire :</strong> {product.brand || 'Non renseignée'}</li>
            <li><strong>Code-barres (EAN / GTIN) :</strong> {product.code || 'Non renseigné'}</li>
            <li><strong>Prix public :</strong> {money(product.price)}</li>
            <li>
              <strong>Stock déclaré :</strong>{' '}
              <span className={product.stock > 10 ? 'stock-good' : product.stock > 0 ? 'stock-low' : 'stock-empty'}>
                {product.stock} unité(s)
              </span>
            </li>
            <li><strong>Dernière mise à jour :</strong> {product.updated}</li>
          </ul>

          <div className="pc-adm-inspect-desc">
            <strong>Description</strong>
            <p>{product.description || 'Aucune description renseignée par l’officine.'}</p>
          </div>

          {product.note && (
            <div className="pc-adm-inspect-note">
              <ShieldAlert size={16} />
              <div>
                <strong>Note de modération</strong>
                <p>{product.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pc-adm-inspect-history">
        <div className="pc-adm-inspect-history-head">
          <History size={15} />
          <strong>Historique des prix et stocks ({product.stockHistory?.length ?? 0})</strong>
        </div>
        {product.stockHistory && product.stockHistory.length > 0 ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>PRIX</th>
                  <th>STOCK</th>
                </tr>
              </thead>
              <tbody>
                {product.stockHistory.map((h, idx) => (
                  <tr key={`${h.date}-${idx}`}>
                    <td>{h.date}</td>
                    <td>{money(h.price)}</td>
                    <td>{h.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted" style={{ fontSize: 12.5 }}>Aucun historique de stock enregistré.</p>
        )}
      </div>

      <div className="modal-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div className="table-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
          {canApprove && (
            <button
              type="button"
              className="primary-btn"
              disabled={busy}
              onClick={async () => {
                const ok = await Promise.resolve(onApprove(product));
                if (ok !== false) onClose();
              }}
            >
              <Check size={14} /> Approuver et publier
            </button>
          )}
          {canRequestFix && (
            <button
              type="button"
              className="outline-btn"
              disabled={busy}
              onClick={() => {
                onClose();
                onModerate(product, 'À corriger');
              }}
            >
              <Pencil size={14} /> Demander correction
            </button>
          )}
          {canRefuse && (
            <button
              type="button"
              className="pc-danger-btn"
              disabled={busy}
              onClick={() => {
                onClose();
                onModerate(product, 'Refusé');
              }}
            >
              <Ban size={14} /> Refuser
            </button>
          )}
          {canSuspend && (
            <button
              type="button"
              className="pc-danger-btn"
              disabled={busy}
              onClick={() => {
                onClose();
                onModerate(product, 'Suspendu');
              }}
            >
              <Ban size={14} /> Suspendre
            </button>
          )}
          <button
            type="button"
            className="outline-btn"
            disabled={busy}
            onClick={() => {
              onClose();
              onEdit(product);
            }}
          >
            <Pencil size={14} /> Modifier
          </button>
        </div>

        <button type="button" className="outline-btn" onClick={onClose}>
          Fermer
        </button>
      </div>
    </Modal>
  );
}
