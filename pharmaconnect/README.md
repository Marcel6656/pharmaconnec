# PharmaConnect — frontend React / Next.js

Prototype frontend interactif de PharmaConnect, porté par **KAYRA Innovation**. L'application est construite avec React, Next.js, TypeScript, Tailwind CSS et Lucide React.

## Lancer le projet

Démarrez l’API selon le [guide backend](../backend/README.md). Ensuite, dans `pharmaconnect/` :

```bash
npm ci
npm run dev
```

Ouvrez http://localhost:3000 pour le site et http://localhost:3000/admin pour l’administration. Si l’API utilise un autre port, configurez `BACKEND_URL` avant de lancer Next.js, y compris lors du build.

```bash
npm run verify
npm run typecheck
npm run build
```

Les vérifications statiques complètent les tests d’intégration du backend. Le navigateur conserve les préférences d’affichage et le jeton de session. Les données métier et les justificatifs passent par l’API.

## Modules présents dans le frontend

### Site public
- Accueil vitrine et navigation responsive.
- Annuaire des pharmacies validées uniquement, avec recherche par nom, ville et quartier.
- Catalogue public avec recherche par nom, catégorie, marque/laboratoire, pharmacie, ville/quartier, prix min/max et disponibilité.
- Fiches pharmacie avec téléphone, messagerie, badges, produits récents et itinéraire externe.
- Inscription d'une pharmacie, avec dépôt des justificatifs et suivi du dossier.
- Formules Basic, Standard et Premium, avec périodes mensuelle, trimestrielle et annuelle.
- Consultation libre sans compte ; espace visiteur facultatif pour retrouver ses conversations liées au compte.
- Signalement d'une fiche pharmacie ou d'un produit.

### Espace pharmacie
- Tableau de bord et changement d'établissement (plusieurs établissements rattachés au même compte professionnel).
- Ajout, modification, suppression, soumission à validation et sauvegarde en brouillon des produits.
- Catégories officielles communes et catégories personnalisées propres à l'établissement.
- Déclaration du prix et du stock, historique des mises à jour, alertes de stock réglables.
- Gestion de la fiche établissement et de ses coordonnées géographiques.
- Messagerie par fils de discussion, réponses pharmacie/visiteur et notifications persistées.
- Abonnement, demandes de paiement Mobile Money, historique des paiements et rappels d'échéance.
- Indicateurs du catalogue, préférences et notifications.

### Administration
- Tableau de bord et file de demandes de pharmacies.
- Examen, validation, refus, réexamen et suspension des établissements.
- Essai de 14 jours déclenché après la première validation administrative.
- Attribution automatique du badge « Pharmacie vérifiée » à un établissement validé ; ce badge réservé ne peut pas être supprimé ni retiré tant que la pharmacie est validée.
- File de validation des produits : approbation, demande de correction, refus, masquage, suspension, réactivation et archivage.
- Gestion des catégories officielles, badges personnalisables, formules, abonnements, paiements et signalements.
- Réglage du seuil de fraîcheur des stocks et prix.
- Journal serveur des principales opérations avec export JSON.

## Règles métier reprises

- Pas de panier, pas de commande, pas de checkout et pas de paiement de produits par les visiteurs. La plateforme sert à consulter les informations et à joindre directement la pharmacie par téléphone ou messagerie.
- Seules les pharmacies validées et non expirées sont affichées dans l'annuaire public.
- Un produit doit être approuvé par l'administration avant publication. Toute modification d'un produit publié le renvoie en validation. Le brouillon reste privé.
- Les données de prix et de stock sont déclarées par la pharmacie. La dernière date d'actualisation est visible ; les déclarations trop anciennes sont exclues du catalogue public selon un seuil provisoire configurable.
- Un stock égal à zéro apparaît comme indisponible, il ne disparaît pas artificiellement.
- Le badge de vérification est distinct de l'abonnement. Des badges complémentaires peuvent être créés et attribués par l'administration.
- L'essai gratuit de 14 jours commence après validation, pas à la création de la demande.
- Les tarifs de démonstration sont en FCFA : Basic 5 000 / 13 500 / 48 000 ; Standard 10 000 / 27 000 / 96 000 ; Premium 20 000 / 54 000 / 192 000 (mensuel / trimestriel / annuel). Ils restent provisoires.
- Les paiements Mobile Money restent en attente jusqu’au rapprochement administratif ou à la confirmation d’un webhook signé. L’annuaire retire une pharmacie dès l’échéance et conserve ses données.
- La rubrique Santé affiche les contenus activés et enregistrés depuis l’administration.

## Intégrations à configurer

Google OAuth, Mobile Money, e-mail et SMS utilisent les paramètres du déploiement. Les tarifs, justificatifs exigés dans le pays pilote et contenus de santé doivent être paramétrés ou approuvés par l’exploitant. Les adresses et produits peuplés par le seed local sont des données fictives.
