'use client';

import { useState } from 'react';
import { Check, Clock, Download, Eye, MapPin, Package, Pencil, Phone, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { Badge, Modal, Pharmacy, PharmacyStatus, Status, isBadgeActive } from '@/lib/shared';
import { ModernDigitalStoreIcon, ModernDocumentCheckIcon, ModernVerifiedShieldIcon } from '@/components/shared/ModernIcons';

interface AdminPharmacyDossierModalProps {
  pharmacy: Pharmacy | null;
  badges: Badge[];
  busy?: boolean;
  onClose: () => void;
  onStatus: (id: number, status: PharmacyStatus) => Promise<boolean | void> | void;
  onEdit?: (p: Pharmacy) => void;
  onDownloadDocument: (docId: number, fileName: string) => void;
}

export function AdminPharmacyDossierModal({
  pharmacy,
  badges,
  busy = false,
  onClose,
  onStatus,
  onEdit,
  onDownloadDocument,
}: AdminPharmacyDossierModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!pharmacy) return null;

  const isBusy = busy || submitting;
  const assignedBadges = badges.filter(b => pharmacy.badgeIds.includes(b.id));

  const triggerStatus = async (status: PharmacyStatus) => {
    if (isBusy) return;
    setSubmitting(true);
    try {
      const ok = await Promise.resolve(onStatus(pharmacy.id, status));
      if (ok !== false) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Dossier officine · ${pharmacy.name}`}
      icon={<ModernDocumentCheckIcon size={20} />}
      onClose={() => { if (!isBusy) onClose(); }}
      wide
    >
      <div className="pc-dossier-grid">
        <div className="pc-dossier-card">
          <div className="pc-dossier-head">
            <div>
              <span className="cg-eyebrow">IDENTITÉ & AGRÉMENT</span>
              <h4>{pharmacy.name}</h4>
            </div>
            <Status>{pharmacy.status}</Status>
          </div>
          <ul className="pc-dossier-list">
            <li><strong>Agrément / Licence :</strong> {pharmacy.license || 'Non renseigné'}</li>
            <li><strong>Pharmacien responsable :</strong> {pharmacy.responsible || 'Non renseigné'}</li>
            <li>
              <strong>Localisation :</strong> <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              {pharmacy.address ? `${pharmacy.address}, ` : ''}{pharmacy.area}, {pharmacy.city}
            </li>
            <li>
              <strong>Coordonnées GPS :</strong>{' '}
              {pharmacy.lat != null && pharmacy.lng != null
                ? `${pharmacy.lat.toFixed(5)}, ${pharmacy.lng.toFixed(5)}`
                : 'Non géolocalisée'}
            </li>
            <li>
              <strong>Horaires d’ouverture :</strong> <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              {pharmacy.openingHours || 'Non renseignés'}
            </li>
            <li>
              <strong>Contact :</strong> <Phone size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              {pharmacy.phone}{pharmacy.email ? ` · ${pharmacy.email}` : ''}
            </li>
            <li>
              <strong>Catalogue produits :</strong> <Package size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              {pharmacy.products} produit(s)
            </li>
            <li><strong>Formule :</strong> {pharmacy.subscription || 'Basic'}</li>
            <li>
              <strong>Échéance :</strong>{' '}
              {pharmacy.subscriptionEndsAt
                ? `Abonnement jusqu’au ${new Date(pharmacy.subscriptionEndsAt).toLocaleDateString('fr-FR')}`
                : pharmacy.trialEndsAt
                  ? `Essai jusqu’au ${new Date(pharmacy.trialEndsAt).toLocaleDateString('fr-FR')}`
                  : 'À activer après validation'}
            </li>
          </ul>
        </div>

        <div className="pc-dossier-card">
          <span className="cg-eyebrow">PIÈCES JUSTIFICATIVES & DISTINCTIONS</span>
          <p className="muted" style={{ fontSize: 12.5, margin: '6px 0 10px' }}>
            {pharmacy.documents ? `Déclaration dossier : ${pharmacy.documents}` : 'Aucune note documentaire déclarée.'}
          </p>

          {pharmacy.uploadedDocuments && pharmacy.uploadedDocuments.length > 0 ? (
            <div className="pc-dossier-docs">
              {pharmacy.uploadedDocuments.map(doc => (
                <button
                  key={doc.id}
                  type="button"
                  className="mini-action"
                  onClick={() => onDownloadDocument(doc.id, doc.fileName)}
                >
                  <Download size={13} /> {doc.fileName}
                </button>
              ))}
            </div>
          ) : (
            <div className="info-note" style={{ marginBottom: 12 }}>
              <ModernDigitalStoreIcon size={15} /> Aucun fichier binaire déposé pour cet établissement.
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <strong style={{ fontSize: 12, color: 'var(--pine)' }}>Badges attribués :</strong>
            <div className="pc-dossier-badges">
              {assignedBadges.length > 0 ? (
                assignedBadges.map(b => {
                  const active = isBadgeActive(pharmacy, b);
                  const assignedAt = pharmacy.badgeAssignedAt?.[String(b.id)];
                  const expiresAt = assignedAt && b.expiryDays
                    ? new Date(new Date(assignedAt).getTime() + b.expiryDays * 86400000).toLocaleDateString('fr-FR')
                    : null;
                  return (
                    <span
                      key={b.id}
                      className={`pc-role-chip ${!active ? 'pc-badge-expired' : ''}`}
                      title={
                        assignedAt
                          ? `Attribué le ${new Date(assignedAt).toLocaleDateString('fr-FR')}${expiresAt ? ` · Expire le ${expiresAt}` : ''}`
                          : b.description
                      }
                    >
                      <ModernVerifiedShieldIcon size={13} />
                      <span>{b.name}</span>
                      {!active && <small className="pc-badge-expired-tag">Expiré</small>}
                      {active && expiresAt && <small className="pc-badge-date-meta">({expiresAt})</small>}
                    </span>
                  );
                })
              ) : (
                <span className="muted" style={{ fontSize: 12 }}>Aucun badge actif</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div className="table-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
          {(pharmacy.status === 'En attente' || pharmacy.status === 'En vérification') && (
            <>
              <button
                type="button"
                className="primary-btn"
                disabled={isBusy}
                onClick={() => void triggerStatus('Validée')}
              >
                <Check size={14} /> {isBusy ? 'Traitement…' : 'Valider l’agrément'}
              </button>
              {pharmacy.status === 'En attente' && (
                <button
                  type="button"
                  className="outline-btn"
                  disabled={isBusy}
                  onClick={() => void triggerStatus('En vérification')}
                >
                  <Eye size={14} /> Mettre en vérification
                </button>
              )}
              <button
                type="button"
                className="pc-danger-btn"
                disabled={isBusy}
                onClick={() => void triggerStatus('Refusée')}
              >
                <XCircle size={14} /> Refuser avec motif
              </button>
            </>
          )}
          {pharmacy.status === 'Validée' && (
            <button
              type="button"
              className="pc-danger-btn"
              disabled={isBusy}
              onClick={() => void triggerStatus('Suspendue')}
            >
              <XCircle size={14} /> Suspendre avec motif
            </button>
          )}
          {pharmacy.status === 'Suspendue' && (
            <button
              type="button"
              className="primary-btn"
              disabled={isBusy}
              onClick={() => void triggerStatus('Validée')}
            >
              <ShieldCheck size={14} /> {isBusy ? 'Traitement…' : 'Réactiver l’établissement'}
            </button>
          )}
          {pharmacy.status === 'Refusée' && (
            <button
              type="button"
              className="primary-btn"
              disabled={isBusy}
              onClick={() => void triggerStatus('En vérification')}
            >
              <RotateCcw size={14} /> {isBusy ? 'Traitement…' : 'Ré-examiner'}
            </button>
          )}
          {pharmacy.status === 'Abonnement expiré' && !pharmacy.subscriptionEndsAt && !pharmacy.trialEndsAt && (
            <button
              type="button"
              className="primary-btn"
              disabled={isBusy}
              onClick={() => void triggerStatus('Validée')}
            >
              <Check size={14} /> {isBusy ? 'Traitement…' : 'Valider le dossier'}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className="outline-btn"
              disabled={isBusy}
              onClick={() => {
                onClose();
                onEdit(pharmacy);
              }}
            >
              <Pencil size={14} /> Modifier
            </button>
          )}
        </div>

        <button type="button" className="outline-btn" disabled={isBusy} onClick={onClose}>
          Fermer
        </button>
      </div>
    </Modal>
  );
}
