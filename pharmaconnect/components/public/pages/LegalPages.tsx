'use client';

import React from 'react';
import { Cookie, FileText, Mail, RefreshCw, Scale, ShieldCheck } from 'lucide-react';
import { Language } from '@/lib/translations';

interface LegalCommonProps {
  go: (p: string) => void;
  currentLang?: Language;
}

export function LegalNoticePage({ go, currentLang = 'fr' }: LegalCommonProps) {
  const isEn = currentLang === 'en';
  return (
    <div className="pc-luxe-subpage animate-fade-in">
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/pharmacy-interior.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'LEGAL INFORMATION · LCEN ART. 6 III' : 'INFORMATIONS LÉGALES · LCEN ART. 6 III'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Legal Notice' : 'Mentions légales'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Mandatory publisher, hosting and regulatory disclosures for the PharmaConnect platform.'
              : 'Identification de l’éditeur, des hébergeurs et des coordonnées officielles de la plateforme PharmaConnect.'}
          </p>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 28 }}>
        <div className="privacy-content cg-static-wide">
          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><Scale size={20} /></span>
              <h3>1. Éditeur de la plateforme</h3>
            </div>
            <ul className="about-list cg-about-list-clean">
              <li><span><b>Nom commercial :</b> PharmaConnect — projet porté par KAYRA Innovation</span></li>
              <li><span><b>Raison sociale &amp; forme juridique :</b> [À compléter avant ouverture commerciale : dénomination sociale, forme juridique et capital social]</span></li>
              <li><span><b>Immatriculation &amp; TVA :</b> [À compléter : n° SIRET / RCS / Registre du commerce et n° TVA intracommunautaire le cas échéant]</span></li>
              <li><span><b>Siège social :</b> Avenue Charles de Gaulle, N’Djamena, Tchad · [À compléter : adresse précise de l’établissement ou du représentant UE]</span></li>
              <li><span><b>Directeur de la publication :</b> [À compléter : Nom et Prénom du représentant légal]</span></li>
              <li><span><b>Contact officiel &amp; DPO / RGPD :</b> tginnovation7@gmail.com · Téléphone / WhatsApp : +235 60 70 91 92</span></li>
            </ul>
          </section>

          <div className="two-panels">
            <section className="panel cg-modern-panel">
              <div className="cg-panel-title-badge">
                <span className="cg-info-icon-pill"><ShieldCheck size={20} /></span>
                <h3>2. Hébergement applicatif</h3>
              </div>
              <p>
                L’application web et l’API sont hébergées par <b>Vercel Inc.</b>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (site : vercel.com).
              </p>
            </section>

            <section className="panel cg-modern-panel">
              <div className="cg-panel-title-badge">
                <span className="cg-info-icon-pill"><ShieldCheck size={20} /></span>
                <h3>3. Hébergement base de données</h3>
              </div>
              <p>
                La base de données PostgreSQL est hébergée sur l’infrastructure cloud managée <b>Neon Inc.</b> (neon.tech). Les transferts hors UE sont encadrés conformément au RGPD.
              </p>
            </section>
          </div>

          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><FileText size={20} /></span>
              <h3>4. Objet du service &amp; propriété intellectuelle</h3>
            </div>
            <p>
              PharmaConnect est un annuaire d’information et de mise en relation entre patients et pharmacies agréées. <b>Aucune vente en ligne, commande ou paiement de médicaments n’est réalisée sur la plateforme.</b> Les contenus éditoriaux, la marque et les éléments graphiques propres à PharmaConnect sont protégés par le droit de la propriété intellectuelle.
            </p>
            <div className="pc-legal-cta-row">
              <button type="button" className="outline-btn" onClick={() => go('Conditions générales')}>
                Consulter les CGU &amp; CGV
              </button>
              <button type="button" className="outline-btn" onClick={() => go('Confidentialité')}>
                Politique de confidentialité
              </button>
              <button type="button" className="primary-btn" onClick={() => go('Contact')}>
                <Mail size={14} /> Contacter l’éditeur
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function TermsPage({ go, currentLang = 'fr' }: LegalCommonProps) {
  const isEn = currentLang === 'en';
  return (
    <div className="pc-luxe-subpage animate-fade-in">
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/cta-pharmacist.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'TERMS OF USE, SALE & WITHDRAWAL' : 'CGU · CGV · RÉTRACTATION 14 JOURS'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Terms & Conditions' : 'Conditions générales (CGU & CGV)'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Rules of use for visitors and pharmacies, subscription terms, cancellation and 14-day withdrawal & refund policy.'
              : 'Règles d’utilisation de la plateforme, conditions d’abonnement des officines, résiliation et droit de rétractation / remboursement.'}
          </p>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 28 }}>
        <div className="privacy-content cg-static-wide">
          <section className="panel cg-modern-panel">
            <h3>Article 1 — Conditions Générales d’Utilisation (CGU)</h3>
            <ul className="about-list cg-about-list-clean">
              <li><span><b>Rôle d’intermédiaire :</b> PharmaConnect référence des officines dont les justificatifs d’agrément sont examinés par l’administration avant activation. Les stocks, horaires et prix affichés sont déclarés par chaque pharmacie sous sa seule responsabilité.</span></li>
              <li><span><b>Absence de vente de médicaments :</b> Aucun médicament ni produit de santé n’est vendu, commandé ou livré via PharmaConnect. La délivrance s’effectue exclusivement à l’officine sous contrôle d’un pharmacien diplômé.</span></li>
              <li><span><b>Âge minimum (art. 8 RGPD / art. 45 LIL) :</b> La création d’un compte personnel visiteur est réservée aux personnes âgées d’au moins <b>15 ans</b> en France/UE (ou disposant de l’accord exprès du titulaire de l’autorité parentale).</span></li>
              <li><span><b>Signalements &amp; modération :</b> Tout utilisateur peut signaler une information inexacte depuis la fiche pharmacie ; l’administration se réserve le droit de masquer ou suspendre toute fiche non conforme.</span></li>
            </ul>
          </section>

          <section className="panel cg-modern-panel">
            <h3>Article 2 — Conditions Générales de Vente des abonnements (CGV)</h3>
            <ul className="about-list cg-about-list-clean">
              <li><span><b>Formules proposées :</b> Abonnements professionnels Basic, Standard et Premium payables par période mensuelle, trimestrielle ou annuelle.</span></li>
              <li><span><b>Prix fermes &amp; transparence :</b> Les montants affichés sur la page Formules et dans la fenêtre de paiement constituent des prix fermes (précisés HT/TTC selon le régime fiscal applicable). Pour les formules trimestrielle et annuelle, le règlement porte sur la totalité de la période en une fois. D’éventuels frais opérateur Mobile Money tiers restent à la charge de l’émetteur selon son contrat opérateur.</span></li>
              <li><span><b>Essai gratuit de 14 jours :</b> Activé sans engagement ni paiement préalable après validation administrative du dossier pharmacie. À l’issue de l’essai, aucun débit automatique par carte n’est effectué sans demande volontaire de souscription.</span></li>
              <li><span><b>Résiliation simple (art. L.215-1-1 C. conso) :</b> Chaque titulaire peut demander le non-renouvellement ou la résiliation de son abonnement à tout moment depuis l’onglet <b>Abonnement</b> de son espace pharmacie ou via le formulaire de contact, sans frais cachés.</span></li>
            </ul>
          </section>

          <section className="panel cg-modern-panel" id="retractation">
            <h3>Article 3 — Politique de remboursement et droit de rétractation (14 jours)</h3>
            <ul className="about-list cg-about-list-clean">
              <li><span><b>Champ d’application (art. L.221-18 et L.221-3 C. conso) :</b> En France, les professionnels employant au plus <b>5 salariés</b> (lorsque l’abonnement logiciel/annuaire n’entre pas dans le champ principal de leur activité officinale) bénéficient d’un droit de rétractation de <b>14 jours calendaires</b> à compter de la confirmation du paiement, sans avoir à motiver leur décision.</span></li>
              <li><span><b>Exécution immédiate pendant le délai :</b> Si l’officine demande l’activation immédiate de l’abonnement avant l’expiration des 14 jours, le remboursement reste dû au prorata des jours restants en cas d’exercice du droit de rétractation (ou intégral si le service n’a pas encore été activé).</span></li>
              <li><span><b>Modalités de remboursement :</b> Pour exercer votre droit de rétractation ou demander un remboursement en cas d’erreur de facturation / incident technique avéré, adressez votre demande avec le numéro de facture (`invoiceRef`) à <b>tginnovation7@gmail.com</b>, par téléphone/WhatsApp au <b>+235 60 70 91 92</b> ou via la page Contact. Le remboursement est effectué sous <b>14 jours</b> par le même moyen de paiement (ou virement/Mobile Money convenu).</span></li>
              <li><span><b>Litiges &amp; médiation :</b> En cas de litige non résolu amiablement, l’utilisateur éligible peut saisir le médiateur de la consommation compétent (coordonnées communiquées sur simple demande à tginnovation7@gmail.com) ou la juridiction compétente selon le droit applicable.</span></li>
            </ul>
            <div className="pc-legal-cta-row">
              <button type="button" className="outline-btn" onClick={() => go('Tarifs')}>
                Voir les formules &amp; tarifs
              </button>
              <button type="button" className="primary-btn" onClick={() => go('Contact')}>
                Exercer ma rétractation / Contacter
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function CookiesPage({
  go,
  onOpenCookieSettings,
  currentLang = 'fr',
}: LegalCommonProps & { onOpenCookieSettings?: () => void }) {
  const isEn = currentLang === 'en';
  return (
    <div className="pc-luxe-subpage animate-fade-in">
      <section className="luxe-inner-hero">
        <div
          className="luxe-inner-hero-bg"
          style={{ backgroundImage: "url('/images/hero-cinema-care.jpg')" }}
          aria-hidden="true"
        />
        <div className="luxe-hero-overlay" aria-hidden="true" />
        <div className="luxe-container luxe-inner-hero-content">
          <span className="luxe-section-subtitle">
            {isEn ? 'COOKIES & STORAGE · CNIL GUIDELINES' : 'TRACEURS & STOCKAGE LOCAL · CNIL'}
          </span>
          <h1 className="luxe-inner-hero-title">
            {isEn ? 'Cookie Policy' : 'Politique cookies'}
          </h1>
          <p className="luxe-inner-hero-sub">
            {isEn
              ? 'Full inventory of technical browser storage and optional third-party services used on PharmaConnect.'
              : 'Inventaire complet des traceurs et stockages locaux utilisés, de leur finalité, de leur durée et de vos choix de consentement.'}
          </p>
        </div>
      </section>

      <div className="cg-page-container" style={{ paddingTop: 28 }}>
        <div className="privacy-content cg-static-wide">
          <section className="panel cg-modern-panel">
            <div className="cg-panel-title-badge">
              <span className="cg-info-icon-pill"><Cookie size={20} /></span>
              <h3>Principes appliqués (recommandations CNIL)</h3>
            </div>
            <p>
              PharmaConnect n’utilise <b>aucun cookie publicitaire ni outil de mesure d’audience tiers</b>. Les polices typographiques sont auto-hébergées sur notre propre serveur (`next/font`) sans requête externe vers Google Fonts. Les scripts d’authentification Google OAuth restent bloqués tant que vous n’avez pas donné votre consentement explicite.
            </p>
            <div className="pc-legal-cta-row">
              <button
                type="button"
                className="primary-btn"
                onClick={() => onOpenCookieSettings?.()}
              >
                <RefreshCw size={14} /> Modifier mes préférences cookies
              </button>
              <button type="button" className="outline-btn" onClick={() => go('Confidentialité')}>
                Politique de confidentialité
              </button>
            </div>
          </section>

          <section className="panel cg-modern-panel">
            <h3>Tableau détaillé des stockages et traceurs</h3>
            <div className="pc-legal-table-wrap">
              <table className="pc-legal-table">
                <thead>
                  <tr>
                    <th>Nom / Service</th>
                    <th>Finalité</th>
                    <th>Consentement</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>pharmaconnect-jwt-token</code></td>
                    <td>Maintien sécurisé de la session authentifiée (Patient, Pharmacie ou Admin).</td>
                    <td>Exempté (strictement nécessaire)</td>
                    <td>Jusqu’à déconnexion ou expiration JWT</td>
                  </tr>
                  <tr>
                    <td><code>pharmaconnect-lang</code></td>
                    <td>Mémorisation du choix de langue (FR / EN).</td>
                    <td>Exempté (strictement nécessaire)</td>
                    <td>Persistant (effaçable dans le navigateur)</td>
                  </tr>
                  <tr>
                    <td><code>pharmaconnect-cookie-consent</code></td>
                    <td>Conservation de votre choix d’acceptation ou de refus des services tiers.</td>
                    <td>Exempté (preuve du choix utilisateur)</td>
                    <td>6 mois recommandés / modifiable à tout moment</td>
                  </tr>
                  <tr>
                    <td><code>pharmaconnect-visitor-favorites-v2</code></td>
                    <td>Mémorisation locale de vos pharmacies favorites sur cet appareil.</td>
                    <td>Exempté (fonction demandée par l’utilisateur)</td>
                    <td>Effacé à la déconnexion / suppression du compte</td>
                  </tr>
                  <tr>
                    <td>Google Identity Services (<code>accounts.google.com</code>)</td>
                    <td>Connexion optionnelle via un compte Google (uniquement si configurée et acceptée).</td>
                    <td><b>Consentement préalable requis</b></td>
                    <td>Chargé uniquement après accord explicite</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
