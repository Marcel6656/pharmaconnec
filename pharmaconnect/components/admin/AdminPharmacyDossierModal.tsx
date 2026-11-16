'use client';

import { Check, Download, Eye, MapPin, Phone, ShieldCheck, XCircle } from 'lucide-react';
import { Badge, Modal, Pharmacy, PharmacyStatus, Status } from '@/lib/shared';
import { ModernDigitalStoreIcon, ModernDocumentCheckIcon, ModernVerifiedShieldIcon } from '@/components/shared/ModernIcons';

interface AdminPharmacyDossierModalProps {
  pharmacy: Pharmacy | null;
  badges: Badge[];
  onClose: () => void;
  onStatus: (id: number, status: PharmacyStatus) => void;
  onDownloadDocument: (docId: number, fileName: string) => void;
}

export function AdminPharmacyDossierModal({
  pharmacy,
  badges,
  onClose,
  onStatus,
  onDownloadDocument,
}: AdminPharmacyDossierModalProps) {
  if (!pharmacy) return null;

  const assignedBadges = badges.filter(b => pharmacy.badgeIds.includes(b.id));

  return (
    <Modal
      title={`Dossier officine · ${pharmacy.name}`}
      icon={<ModernDocumentCheckIcon size={20} />}
      onClose={onClose}
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
              <strong>Contact :</strong> <Phone size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              {pharmacy.phone} · {pharmacy.email}
            </li>
            <li><strong>Formule :</strong> {pharmacy.subscription}</li>
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
                assignedBadges.map(b => (
                  <span key={b.id} className="pc-role-chip">
                    <ModernVerifiedShieldIcon size={13} /> {b.name}
                  </span>
                ))
              ) : (
                <span className="muted" style={{ fontSize: 12 }}>Aucun badge actif</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div className="table-actions">
          {(pharmacy.status === 'En attente' || pharmacy.status === 'En vérification') && (
            <>
              <button
                type="button"
                className="mini-action accept"
                onClick={() => {
                  onClose();
                  onStatus(pharmacy.id, 'Validée');
                }}
              >
                <Check size={14} /> Valider l’agrément
              </button>
              <button
                type="button"
                className="mini-action"
                onClick={() => {
                  onClose();
                  onStatus(pharmacy.id, 'En vérification');
                }}
              >
                <Eye size={14} /> Mettre en vérification
              </button>
              <button
                type="button"
                className="mini-action reject"
                onClick={() => {
                  onClose();
                  onStatus(pharmacy.id, 'Refusée');
                }}
              >
                <XCircle size={14} /> Refuser avec motif
              </button>
            </>
          )}
          {pharmacy.status === 'Validée' && (
            <button
              type="button"
              className="mini-action reject"
              onClick={() => {
                onClose();
                onStatus(pharmacy.id, 'Suspendue');
              }}
            >
              <XCircle size={14} /> Suspendre avec motif
            </button>
          )}
          {pharmacy.status === 'Suspendue' && (
            <button
              type="button"
              className="mini-action accept"
              onClick={() => {
                onClose();
                onStatus(pharmacy.id, 'Validée');
              }}
            >
              <ShieldCheck size={14} /> Réactiver l’établissement
            </button>
          )}
        </div>

        <button type="button" className="outline-btn" onClick={onClose}>
          Fermer
        </button>
      </div>
    </Modal>
  );
}
