'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import { isStrongPassword, PASSWORD_POLICY_ERROR } from '@/lib/shared';
import {
  ModernAlertWarningIcon,
  ModernDigitalStoreIcon,
  ModernDocumentCheckIcon,
  ModernLockSecurityIcon,
  ModernMailEnvelopeIcon,
  ModernPhoneCallIcon,
  ModernRadarPinIcon,
  ModernSparkleCrownIcon,
  ModernUserBadgeIcon,
  ModernVerifiedShieldIcon
} from '@/components/shared/ModernIcons';

interface RegistrationFormProps {
  form: any;
  setForm: (v: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  existingAccount?: boolean;
  onFilesChange?: (files: File[]) => void;
}

export function RegistrationForm({ form, setForm, onSubmit, existingAccount = false, onFilesChange }: RegistrationFormProps) {
  const [step, setStep] = useState<number>(existingAccount ? 2 : 1);
  const [stepError, setStepError] = useState<string>('');

  useEffect(() => {
    setStep(existingAccount ? 2 : 1);
    setStepError('');
  }, [existingAccount]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((form.email || '').trim());
  const passwordOk = isStrongPassword(form.password || '');
  const step1Valid = existingAccount || (emailOk && passwordOk);

  const nameOk = (form.name || '').trim().length >= 2;
  const cityOk = (form.city || '').trim().length >= 2;
  const areaOk = (form.area || '').trim().length >= 2;
  const addressOk = (form.address || '').trim().length >= 3;
  const step2Valid = step1Valid && nameOk && cityOk && areaOk && addressOk;

  const phoneOk = (form.phone || '').trim().length >= 6;
  const licenseOk = (form.license || '').trim().length >= 3;
  const responsibleOk = (form.responsible || '').trim().length >= 2;
  const documentsOk = (form.documents || '').trim().length > 0;
  const step3Valid = step2Valid && phoneOk && licenseOk && responsibleOk && documentsOk;

  const tryGoToStep = (target: number) => {
    setStepError('');
    if (target === 2 && !step1Valid) {
      setStep(1);
      setStepError(`Complétez d’abord l’étape 1 (e-mail valide et mot de passe conforme : ${PASSWORD_POLICY_ERROR.toLowerCase()}) pour débloquer la suite.`);
      return;
    }
    if (target === 3) {
      if (!step1Valid) {
        setStep(1);
        setStepError('Complétez d’abord l’étape 1 (Compte & Accès) avant d’accéder aux étapes suivantes.');
        return;
      }
      if (!step2Valid) {
        setStep(2);
        setStepError('Complétez tous les champs obligatoires de l’étape 2 (nom, ville, quartier et adresse) pour débloquer l’étape 3.');
        return;
      }
    }
    setStep(target);
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    if (!step1Valid) {
      e.preventDefault();
      setStep(1);
      setStepError(`Complétez l’étape 1 (e-mail professionnel valide et ${PASSWORD_POLICY_ERROR.toLowerCase()}).`);
      return;
    }
    if (!step2Valid) {
      e.preventDefault();
      setStep(2);
      setStepError('Complétez l’étape 2 (nom, ville, quartier et adresse précise de l’officine).');
      return;
    }
    if (!step3Valid) {
      e.preventDefault();
      setStep(3);
      setStepError('Complétez l’étape 3 (téléphone, numéro d’autorisation, pharmacien responsable et justificatifs).');
      return;
    }
    setStepError('');
    onSubmit(e);
  };

  return (
    <form className="registration-form cg-wizard-form" onSubmit={handleWizardSubmit}>
      {/* 14-Day Free Trial Guarantee Banner (Checked by verify-project.mjs) */}
      <div className="trial-banner cg-trial-banner">
        <div className="cg-trial-banner-left">
          <div className="cg-trial-badge-icon">
            <ModernVerifiedShieldIcon size={20} />
          </div>
          <div>
            <b>Votre essai gratuit de 14 jours commence dès la validation de votre dossier.</b>
            <p>Accès complet aux outils : synchronisation des stocks, réception des demandes patients et visibilité cartographique.</p>
          </div>
        </div>
      </div>

      {/* Multi-step Navigation Pills */}
      <div className="cg-form-stepper">
        {!existingAccount && (
          <button
            type="button"
            className={`cg-step-tab ${step === 1 ? 'active' : step1Valid && step > 1 ? 'completed' : ''}`}
            onClick={() => tryGoToStep(1)}
          >
            <span className="cg-step-number">{step1Valid && step > 1 ? <Check size={12} /> : '1'}</span>
            <span className="cg-step-label">Compte & Accès</span>
          </button>
        )}

        <button
          type="button"
          disabled={!step1Valid}
          aria-disabled={!step1Valid}
          title={!step1Valid ? 'Remplissez d’abord l’étape 1 pour débloquer' : undefined}
          className={`cg-step-tab ${step === 2 ? 'active' : step2Valid && step > 2 ? 'completed' : ''} ${!step1Valid ? 'locked' : ''}`}
          onClick={() => tryGoToStep(2)}
        >
          <span className="cg-step-number">
            {!step1Valid ? <Lock size={11} /> : step2Valid && step > 2 ? <Check size={12} /> : existingAccount ? '1' : '2'}
          </span>
          <span className="cg-step-label">
            {existingAccount ? 'Ajouter un établissement à votre compte' : 'Identité Officine'}
          </span>
        </button>

        <button
          type="button"
          disabled={!step2Valid}
          aria-disabled={!step2Valid}
          title={!step2Valid ? 'Remplissez les étapes précédentes pour débloquer' : undefined}
          className={`cg-step-tab ${step === 3 ? 'active' : ''} ${!step2Valid ? 'locked' : ''}`}
          onClick={() => tryGoToStep(3)}
        >
          <span className="cg-step-number">{!step2Valid ? <Lock size={11} /> : existingAccount ? '2' : '3'}</span>
          <span className="cg-step-label">Agrément & Justificatifs</span>
        </button>
      </div>

      {stepError && (
        <div className="gm-error-alert" role="alert" style={{ marginBottom: 14 }}>
          <ModernAlertWarningIcon size={16} />
          <span>{stepError}</span>
        </div>
      )}

      {/* STEP 1: Account Credentials */}
      {!existingAccount && step === 1 && (
        <div className="cg-step-card animate-fade-in">
          <div className="cg-step-card-header">
            <h3>1. Compte professionnel & Sécurité</h3>
            <p>Ces identifiants vous permettront d’accéder à votre espace de gestion d’officine.</p>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span className="form-label-row">
                <ModernMailEnvelopeIcon size={15} /> E-mail professionnel *
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="titulaire@pharmacie.com"
              />
              <small>Utilisé pour les notifications et la récupération de compte.</small>
            </label>

            <label className="form-field">
              <span className="form-label-row">
                <ModernLockSecurityIcon size={15} /> Mot de passe sécurisé *
              </span>
              <input
                type="password"
                minLength={8}
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="8 car. min (Majuscule, minuscule, chiffre)"
              />
              <small>Minimum 8 caractères incluant majuscule, minuscule et chiffre.</small>
            </label>
          </div>

          <div className="cg-step-actions">
            <div />
            <button
              type="button"
              className="primary-btn"
              disabled={!step1Valid}
              onClick={() => tryGoToStep(2)}
            >
              Étape suivante : Officine <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pharmacy Identity & Location */}
      {step === 2 && (
        <div className="cg-step-card animate-fade-in">
          <div className="cg-step-card-header">
            <h3>{existingAccount ? 'Ajouter un établissement à votre compte' : '2. Identité de la pharmacie & Localisation'}</h3>
            <p>Informations qui apparaîtront sur l’annuaire public et la carte interactive.</p>
          </div>

          <div className="form-grid">
            <label className="form-field full-col">
              <span className="form-label-row">
                <ModernDigitalStoreIcon size={15} /> Nom officiel de la pharmacie *
              </span>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex. Grande Pharmacie du Centre"
              />
            </label>

            <label className="form-field">
              <span className="form-label-row">
                <ModernRadarPinIcon size={15} /> Ville *
              </span>
              <input
                required
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Ex. N’Djamena"
              />
            </label>

            <label className="form-field">
              <span className="form-label-row">
                <ModernRadarPinIcon size={15} /> Quartier / Commune *
              </span>
              <input
                required
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
                placeholder="Ex. Moursal, Chagoua, Klemat…"
              />
            </label>

            <label className="form-field full-col">
              <span className="form-label-row">
                <ModernRadarPinIcon size={15} /> Adresse précise & repères *
              </span>
              <input
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Rue, avenue, carrefour de référence…"
              />
            </label>

            <label className="form-field">
              <span className="form-label-row">Latitude (facultatif)</span>
              <input
                type="number"
                step="any"
                value={form.lat || ''}
                onChange={e => setForm({ ...form, lat: e.target.value })}
                placeholder="Ex. 12.1131"
              />
            </label>

            <label className="form-field">
              <span className="form-label-row">Longitude (facultatif)</span>
              <input
                type="number"
                step="any"
                value={form.lng || ''}
                onChange={e => setForm({ ...form, lng: e.target.value })}
                placeholder="Ex. 15.0492"
              />
            </label>
          </div>

          <div className="cg-step-actions">
            {!existingAccount ? (
              <button type="button" className="outline-btn" onClick={() => tryGoToStep(1)}>
                <ArrowLeft size={14} /> Précédent
              </button>
            ) : <div />}
            <button
              type="button"
              className="primary-btn"
              disabled={!step2Valid}
              onClick={() => tryGoToStep(3)}
            >
              Étape suivante : Justificatifs <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Accreditation & Documents */}
      {step === 3 && (
        <div className="cg-step-card animate-fade-in">
          <div className="cg-step-card-header">
            <h3>3. Agrément officiel & Justificatifs</h3>
            <p>Documents nécessaires à la modération administrative avant publication au public.</p>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span className="form-label-row">
                <ModernPhoneCallIcon size={15} /> Téléphone professionnel *
              </span>
              <input
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+235 66 00 00 00"
              />
            </label>

            <label className="form-field">
              <span className="form-label-row">
                <ModernDocumentCheckIcon size={15} /> Numéro d’autorisation d’ouverture *
              </span>
              <input
                required
                value={form.license}
                onChange={e => setForm({ ...form, license: e.target.value })}
                placeholder="N° arrêté / agrément ministériel"
              />
            </label>

            <label className="form-field full-col">
              <span className="form-label-row">
                <ModernUserBadgeIcon size={15} /> Pharmacien titulaire responsable *
              </span>
              <input
                required
                value={form.responsible}
                onChange={e => setForm({ ...form, responsible: e.target.value })}
                placeholder="Dr. Prénom Nom (Inscrit au tableau de l’Ordre)"
              />
            </label>

            <label className="form-field full-col">
              <span className="form-label-row">
                <ModernDocumentCheckIcon size={15} /> Justificatifs officiels (Arrêté ministériel, Ordre des pharmaciens) *
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.docx,.xlsx,.csv,.txt"
                onChange={e => {
                  const files = Array.from(e.target.files || []) as File[];
                  onFilesChange?.(files);
                  setForm({
                    ...form,
                    documents: files.map(f => f.name).join(', ')
                  });
                }}
              />
              <div className="cg-file-info-badge">
                <ModernSparkleCrownIcon size={14} />
                <span>{form.documents || 'Sélectionnez les documents requis (PDF, PNG, JPG)'}</span>
              </div>
            </label>
          </div>

          <div className="modal-info cg-secure-notice">
            <ModernVerifiedShieldIcon size={17} />
            <span>Les justificatifs sont conservés dans un espace privé pour l’examen du dossier par l’équipe PharmaConnect.</span>
          </div>

          <div className="cg-step-actions">
            <button type="button" className="outline-btn" onClick={() => tryGoToStep(2)}>
              <ArrowLeft size={14} /> Précédent
            </button>
            <button type="submit" className="primary-btn cg-submit-btn" disabled={!step3Valid}>
              Envoyer la demande d'inscription <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
