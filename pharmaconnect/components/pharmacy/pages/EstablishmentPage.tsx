'use client';

import { AuthenticatedImage } from '@/components/shared/AuthenticatedImage';
import { ActionMenu } from '@/components/shared/ActionMenu';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  apiDeletePharmacyDocument,
  apiListPharmacyDocuments,
  apiUploadPharmacyCover,
  apiUploadPharmacyDocuments,
  PharmacyDocumentItem,
} from '@/lib/api';
import { Check, Clock3, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Pharmacy, SectionTitle, Status } from '@/lib/shared';
import {
  ModernDigitalStoreIcon,
  ModernMailEnvelopeIcon,
  ModernPhoneCallIcon,
  ModernRadarPinIcon,
  ModernUserBadgeIcon
} from '@/components/shared/ModernIcons';
import { SanteProcheWaveRibbon } from '@/components/shared/SanteProcheIllustrations';

interface EstablishmentPageProps {
  activePharmacy: Pharmacy;
  setExistingAccountRegistration: (v: boolean) => void;
  setPharmacyForm: (f: any) => void;
  setProfileForm: (f: any) => void;
  setModal: (m: any) => void;
  onDocumentsUploaded: () => Promise<unknown>;
  say?: (s: string) => void;
}

export function EstablishmentPage({
  activePharmacy,
  setExistingAccountRegistration,
  setPharmacyForm,
  setProfileForm,
  setModal,
  onDocumentsUploaded,
  say,
}: EstablishmentPageProps) {
  const [uploadState, setUploadState] = useState('');
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<PharmacyDocumentItem[]>([]);
  const [coverBusy, setCoverBusy] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const loadDocuments = useCallback(async () => {
    const list = await apiListPharmacyDocuments(activePharmacy.id);
    setDocs(list);
  }, [activePharmacy.id]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const openEditProfile = () => {
    setProfileForm({
      name: activePharmacy.name,
      city: activePharmacy.city,
      area: activePharmacy.area,
      address: activePharmacy.address,
      phone: activePharmacy.phone,
      email: activePharmacy.email,
      responsible: activePharmacy.responsible,
      lat: activePharmacy.lat === undefined ? '' : String(activePharmacy.lat),
      lng: activePharmacy.lng === undefined ? '' : String(activePharmacy.lng),
    });
    setModal('profile');
  };

  const openAddEstablishment = () => {
    setExistingAccountRegistration(true);
    setPharmacyForm({
      name: '', city: '', area: '', address: '', phone: '', email: activePharmacy.email,
      license: '', responsible: '', lat: '', lng: '', password: '', documents: ''
    });
    setModal('register');
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file) return;
    setCoverBusy(true);
    try {
      const res = await apiUploadPharmacyCover(activePharmacy.id, file);
      if (!res.ok) {
        say?.(res.error);
        return;
      }
      await onDocumentsUploaded();
      say?.('Photo de couverture mise à jour.');
    } finally {
      setCoverBusy(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={e => void handleCoverUpload(e.target.files?.[0])}
      />
      <SectionTitle
        eyebrow="FICHE OFFICINE"
        title="Mon établissement"
        desc="Gérez les informations affichées sur votre fiche publique."
        icon={<ModernDigitalStoreIcon size={24} />}
        action={
          <div className="action-pair" style={{ alignItems: 'center' }}>
            <button className="primary-btn" onClick={openEditProfile}>
              <Pencil size={15} /> Modifier le profil
            </button>
            <ActionMenu
              label="Plus d’actions établissement"
              items={[
                {
                  key: 'cover',
                  label: coverBusy ? 'Envoi de la photo…' : 'Changer la photo de couverture',
                  icon: <ImagePlus size={14} />,
                  disabled: coverBusy,
                  onClick: () => coverInputRef.current?.click(),
                },
                {
                  key: 'add-establishment',
                  label: 'Ajouter un établissement',
                  icon: <Plus size={14} />,
                  onClick: openAddEstablishment,
                },
              ]}
            />
          </div>
        }
      />
      <div className="sp-profile-wave-banner">
        <div className="sp-profile-wave-avatar">
          <AuthenticatedImage src={activePharmacy.coverImage || '/images/hero-pharmacist.jpg'} alt={activePharmacy.name} />
          {activePharmacy.status === 'Validée' && <span className="sp-profile-verified-orb">✓</span>}
        </div>
        <div>
          <h2>{activePharmacy.name}</h2>
          <span>{activePharmacy.responsible} · {activePharmacy.city}</span>
        </div>
        <SanteProcheWaveRibbon variant="emerald" className="sp-banner-wave" />
      </div>
      <div className="two-panels">
        <section className="panel cg-modern-panel detail-panel">
          <div className="profile-avatar"><ModernDigitalStoreIcon size={28} /></div>
          <h2>{activePharmacy.name}</h2>
          <Status>{activePharmacy.status}</Status>
          <p><ModernRadarPinIcon size={16} />{activePharmacy.address}, {activePharmacy.city} · {activePharmacy.area}</p>
          <p><ModernPhoneCallIcon size={16} />{activePharmacy.phone}</p>
          <p><ModernMailEnvelopeIcon size={16} />{activePharmacy.email}</p>
          <p><ModernUserBadgeIcon size={16} />{activePharmacy.responsible}</p>
        </section>
        <section className="panel cg-modern-panel">
          <h3>Vérification administrative</h3>
          <form onSubmit={async event => {
            event.preventDefault();
            if (uploading) return;
            const form = event.currentTarget;
            const selected = new FormData(form).getAll('files').filter((file): file is File => file instanceof File && file.size > 0);
            if (!selected.length) return;
            setUploading(true);
            setUploadState('');
            try {
              const result = await apiUploadPharmacyDocuments(activePharmacy.id, selected);
              if (!result.ok) {
                setUploadState(result.error);
                return;
              }
              form.reset();
              setUploadState('Justificatifs transmis.');
              await loadDocuments();
              await onDocumentsUploaded();
            } finally {
              setUploading(false);
            }
          }}>
            <label className="form-field">Ajouter des justificatifs (PDF, PNG ou JPEG)
              <input name="files" type="file" accept="application/pdf,image/png,image/jpeg" multiple required disabled={uploading} />
            </label>
            <button className="outline-btn" disabled={uploading}>{uploading ? 'Envoi en cours…' : 'Envoyer les justificatifs'}</button>
            {uploadState && <p role="status">{uploadState}</p>}
          </form>

          {docs.length > 0 && (
            <div className="pc-doc-list">
              {docs.map(doc => (
                <div key={doc.id} className="pc-doc-row">
                  <div className="pc-doc-row-info">
                    <b>{doc.fileName}</b>
                    <small>{Math.max(1, Math.round(doc.size / 1024))} Ko · {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</small>
                  </div>
                  <ActionMenu
                    label={`Actions pour ${doc.fileName}`}
                    items={[
                      {
                        key: 'delete-doc',
                        label: 'Supprimer le justificatif',
                        icon: <Trash2 size={14} />,
                        variant: 'danger',
                        onClick: async () => {
                          if (!window.confirm(`Supprimer le justificatif « ${doc.fileName} » ?`)) return;
                          const res = await apiDeletePharmacyDocument(activePharmacy.id, doc.id);
                          if (!res.ok) {
                            say?.(res.error);
                            return;
                          }
                          await loadDocuments();
                          await onDocumentsUploaded();
                          say?.('Justificatif supprimé.');
                        },
                      },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}

          <p className="muted">Votre établissement est soumis à la vérification des documents avant son affichage public.</p>
          <div className="verification-step">
            <span className="step-complete"><Check size={14} /></span>
            <div><b>Demande enregistrée</b><small>Informations de l’établissement reçues.</small></div>
          </div>
          <div className="verification-step">
            <span className={activePharmacy.status === 'Validée' ? 'step-complete' : 'step-pending'}>
              {activePharmacy.status === 'Validée' ? <Check size={14} /> : <Clock3 size={14} />}
            </span>
            <div>
              <b>Vérification des documents</b>
              <small>{activePharmacy.status === 'Validée' ? 'Validation administrative terminée.' : 'En attente de contrôle par l’administration.'}</small>
            </div>
          </div>
          <div className="verification-step">
            <span className={activePharmacy.status === 'Validée' ? 'step-complete' : 'step-pending'}>
              {activePharmacy.status === 'Validée' ? <Check size={14} /> : <Clock3 size={14} />}
            </span>
            <div>
              <b>Publication de la fiche</b>
              <small>{activePharmacy.status === 'Validée' ? 'Fiche éligible à la publication.' : 'La fiche sera visible après validation et abonnement actif.'}</small>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
