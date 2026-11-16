# PharmaConnect — Backend REST API (NestJS + Prisma)

Backend officiel du projet **PharmaConnect** (KAYRA Innovation), couvrant l'ensemble des fonctionnalités exposées par le frontend Next.js (`../pharmaconnect`).

---

## Démarrage local

Prérequis recommandés : Node.js 22 ou 24 et npm. Procédez sur une base de développement SQLite.

1. Copiez `.env.example` vers `.env`.
2. Renseignez un `JWT_SECRET` aléatoire d’au moins 32 caractères. Générez-le avec `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Exécutez les commandes depuis `backend/`.

```bash
npm ci
npm run setup
npm run start:dev
```

L’API écoute sur le port 4000. Swagger est disponible en développement à l’adresse http://localhost:4000/api/docs.

L’exemple local utilise `SEED_DEMO_DATA=true` et crée un jeu fictif. Les comptes pour essais locaux sont `admin@pharmaconnect.org` / `admin2026` et `contact@centrale.example` / `pharma2026`. Le fichier `.env` peut définir des valeurs locales différentes avant le premier peuplement. Le seed conserve les mots de passe existants.

Pour une instance PostgreSQL, configurez les secrets et exécutez à la racine `docker compose up --build -d`. Initialisez une seule fois le référentiel et le premier administrateur avec `docker compose exec -e SEED_ADMIN_EMAIL -e SEED_ADMIN_PASSWORD backend npm run seed`, après export de ces deux valeurs dans le terminal. Le seed de production exige 12 caractères minimum pour le premier administrateur et refuse les données fictives. Après cette initialisation, gardez les accès à PostgreSQL et à l’API internes. Configurez les origines, éventuels intermédiaires de confiance et le TLS selon l’hébergement.

`npm test` exécute les tests HTTP sur une base SQLite jetable. Générer d’abord le client Prisma SQLite (`npm run db:use:sqlite` puis `npm run prisma:generate`) si le projet a été basculé en PostgreSQL.

### Sauvegarde et restauration PostgreSQL

La sauvegarde comprend la base et le volume des fichiers `pharmaconnect-uploads`. Depuis la racine du projet, arrêtez l’API pendant les deux copies pour garder les fichiers et la base à la même version. La base demeure démarrée.

```bash
umask 077
mkdir -p sauvegarde-pharma
docker compose stop backend
docker compose exec -T db sh -c 'pg_dump --format=custom --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' > sauvegarde-pharma/base.dump
docker compose run --rm --no-deps -T --entrypoint tar backend -C /app/uploads -cf - . > sauvegarde-pharma/fichiers.tar
docker compose start backend
sha256sum sauvegarde-pharma/base.dump sauvegarde-pharma/fichiers.tar > sauvegarde-pharma/SHA256SUMS
```

Vérifiez les empreintes avec `sha256sum -c sauvegarde-pharma/SHA256SUMS`. Pour tester la restauration, utilisez un environnement distinct et démarrez uniquement PostgreSQL sur un volume vierge. Depuis la racine de cet environnement, avec les deux sauvegardes présentes et l’image de l’API construite, restaurez les objets dans la base vide et les fichiers dans le volume vierge.

```bash
docker compose up -d --wait db
docker compose build backend
docker compose exec -T db sh -c 'pg_restore --no-owner --exit-on-error --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' < sauvegarde-pharma/base.dump
docker compose run --rm --no-deps -T --entrypoint tar backend -C /app/uploads -xf - < sauvegarde-pharma/fichiers.tar
docker compose up -d backend frontend
```

Ouvrez la copie restaurée avec un compte autorisé et vérifiez un justificatif, une fiche produit, une conversation et une échéance d’abonnement.

## Règles métier implémentées côté serveur

1. **Aucune vente en ligne** : aucun panier, commande ni paiement produit visiteur — la plateforme sert à localiser les pharmacies, consulter stocks/prix indicatifs et contacter directement l'officine.
2. **Annuaire public strict** : seules les pharmacies `Validée` dont l'essai gratuit (14 jours) ou l'abonnement payé n'est pas expiré sont visibles publiquement.
3. **Seuil de fraîcheur et stock à zéro**. Seuls les produits `Publié` dont la dernière déclaration est datée dans la fenêtre `freshnessDays` (7 jours par défaut) apparaissent dans le catalogue public. Un stock `0` apparaît comme *Indisponible*.
4. **Validation obligatoire des produits** : toute création (hors brouillon) et la modification de la fiche d’un produit `Publié` le renvoie en `En attente`. L’action dédiée Stock et prix actualise une déclaration horodatée, historise les changements de valeur et conserve le statut de modération. Pour publier, l’administration fournit la version examinée (`expectedModifiedAt`), obtenue dans `modifiedAt`. Les demandes de correction et les refus exigent un motif.
5. **Essai 14 jours & Badge « Pharmacie vérifiée »** : la première validation d’une pharmacie exige au moins un justificatif déposé, démarre son essai gratuit de 14 jours et lui attribue automatiquement le badge système réservé *Pharmacie vérifiée*. Seule une officine avec un essai ou un abonnement déjà enregistré peut demander un renouvellement. Une suspension ou un refus exige une décision de réactivation administrative avant tout paiement.
6. **Paiements Mobile Money** : création d’une facture rattachée à une référence de demande unique, prolongation de l'abonnement (`Mensuel` +1 mois, `Trimestriel` +3 mois, `Annuel` +12 mois) lors de la confirmation admin ou par webhook signé HMAC-SHA256 (`x-signature`).
7. **Expiration automatique**. Le catalogue retire l’officine à l’échéance. La tâche horaire met à jour le statut `Abonnement expiré`. L’action administrative qui constate l’expiration exige une échéance dépassée.
8. **Quotas**. Les produits actifs, brouillons compris, sont limités à 50 pour Basic et à 300 pour Standard. Premium et l’essai actif ne sont pas plafonnés. L’activation d’une formule moins élevée nécessite un catalogue compatible. Le serveur revérifie le quota au moment du règlement et lors de la réouverture d’une archive.

---

## Endpoints principaux (`/api`)

### Santé & Documentation
- `GET /api/health` — État du serveur
- `GET /api/docs` — Interface Swagger OpenAPI

### Authentification (`/api/auth`)
- `POST /api/auth/register` — Inscription compte visiteur (e-mail + mot de passe)
- `POST /api/auth/login` — Connexion (`ADMIN`, `PHARMACIST`, `VISITOR`)
- `POST /api/auth/google` — Inscription visiteur ou connexion Google. La première association à un compte existant exige le mot de passe PharmaConnect. Les connexions suivantes utilisent l’identifiant Google enregistré.
- `GET /api/auth/me` — Profil utilisateur connecté & officines gérées
- `PATCH /api/auth/me` — Mise à jour du profil
- `POST /api/auth/change-password` — Changement de mot de passe

### Consultation publique (`/api/public`)
- `GET /api/public/meta` — Catégories officielles, badges visibles, formules, villes actives, `freshnessDays`
- `GET /api/public/pharmacies` — Annuaire public (filtres `q`, `city`, `badgeId`, tri GPS `lat`/`lng`)
- `GET /api/public/pharmacies/:id` — Fiche détaillée d'une pharmacie validée + catalogue public
- `GET /api/public/products` — Catalogue public filtré (`q`, `category`, `city`, `pharmacyId`, `availability`, `minPrice`, `maxPrice`, pagination)
- `POST /api/public/contact` — Formulaire de contact général

### Espace Pharmacie (`PHARMACIST`)
- `POST /api/pharmacies/register` — Inscription multi-étapes d'une officine (nouveau compte ou rattachement)
- `GET /api/pharmacies/mine` — Liste des établissements du compte connecté
- `GET /api/pharmacies/:id`, `PATCH /api/pharmacies/:id` — Consultation & édition de la fiche établissement
- `POST /api/pharmacies/:id/cover` — Téléversement de l'image de couverture
- `POST /api/pharmacies/:id/documents`, `GET /api/pharmacies/:id/documents` — Justificatifs privés (PDF/PNG/JPG)
- `GET /api/pharmacies/:id/categories`, `POST /api/pharmacies/:id/categories`, `DELETE /api/pharmacies/:id/categories/:name` — Catégories officielles & personnalisées
- `GET /api/pharmacies/:id/preferences`, `PATCH /api/pharmacies/:id/preferences` — Préférences d'alertes
- `GET /api/pharmacies/:id/notices`, `POST /api/pharmacies/:id/notices/read-all`, `PATCH /api/notices/:noticeId/read` — Notifications
- `GET /api/pharmacies/:id/stats` — Statistiques et compteurs du tableau de bord
- `GET /api/pharmacies/:id/products`, `POST /api/pharmacies/:id/products` — Produits & brouillons
- `PATCH /api/products/:id`, `PATCH /api/products/:id/stock`, `PATCH /api/products/:id/status`, `POST /api/products/:id/image`, `DELETE /api/products/:id` — Édition, stock/prix (historique `StockSnapshot`), visibilité et suppression
- `GET /api/pharmacies/:id/payments`, `POST /api/pharmacies/:id/payments` — Historique et demandes de paiement Mobile Money
- `POST /api/payments/webhook` — Webhook prestataire signé HMAC-SHA256

### Messagerie & Signalements
- `POST /api/messages` — Envoi d'un message public visiteur → pharmacie
- `GET /api/pharmacies/:pharmacyId/messages`, `POST /api/messages/:threadId/reply`, `PATCH /api/messages/:id/read` — Boîte de réception officinale
- `GET /api/messages/visitor`, `POST /api/messages/:threadId/visitor-reply` — Fils ouverts depuis le compte visiteur authentifié
- `POST /api/reports` — Signalement d'une fiche pharmacie ou d'un produit

### Administration (`ADMIN`)
- `GET /api/admin/dashboard` — Indicateurs globaux
- `GET /api/admin/pharmacies`, `PATCH /api/admin/pharmacies/:id/status`, `GET /api/admin/documents/:docId/download`
- `GET /api/admin/products`, `PATCH /api/admin/products/:id/status`, `DELETE /api/admin/products/:id`
- `GET /api/admin/categories`, `POST /api/admin/categories`, `DELETE /api/admin/categories/:name`
- `GET /api/admin/badges`, `POST /api/admin/badges`, `PATCH /api/admin/badges/:id`, `DELETE /api/admin/badges/:id`, `PUT /api/admin/pharmacies/:id/badges/:badgeId`
- `GET /api/admin/plans`, `PATCH /api/admin/plans/:name`
- `GET /api/admin/payments`, `PATCH /api/admin/payments/:id/status`
- `GET /api/admin/reports`, `PATCH /api/admin/reports/:id/status`
- `GET /api/admin/settings`, `PATCH /api/admin/settings`
- `GET /api/admin/audit-logs`, `GET /api/admin/audit-logs/export`

### État de l’interface (`AppData`)
- `GET /api/state` — Charge l’état de l’interface. Un compte professionnel reçoit uniquement ses établissements et leurs données. Les vues anonyme et visiteur incluent le catalogue publié.
- `PUT /api/state` — Route retirée avec HTTP 410 pour les anciens clients autorisés. Utilisez les routes de mutation dédiées.

### Cloisonnement des officines

Les routes privées vérifient l’établissement rattaché au compte professionnel. Les ressources hors de ce périmètre sont traitées comme introuvables. Un jeton invalide, expiré ou révoqué est rejeté par la route d’état. Les fils visiteurs reposent sur l’identifiant du compte à l’envoi et chaque réponse doit appartenir à l’officine du fil. Les images téléversées sous `/uploads/public/:filename` restent accessibles en consultation publique seulement si le produit ou l’officine auquel elles sont liées est visible. Le propriétaire et l’administration peuvent aussi consulter les images liées aux fiches privées, avec leur jeton de session. Les fichiers devenus sans référence restent inaccessibles par cette route.

### Paiements et notifications

- `MOBILE_MONEY_MODE=manual_reconciliation` crée une demande en attente. Pour confirmer un encaissement constaté, un administrateur saisit la référence du reçu dans `externalRef`. Une référence déjà utilisée pour une autre facture est refusée.
- `MOBILE_MONEY_MODE=live` nécessite un adaptateur Airtel ou Moov et ses identifiants. Le contrat implémenté transmet montant, devise XAF, numéro, facture et référence unique. Une réponse incertaine reste à rapprocher. Le webhook signe `x-timestamp + "." + corps brut` par HMAC-SHA256 hexadécimal (`x-signature`). Il nécessite un secret de 32 caractères minimum. Pour `Confirmé`, le relais fournit `invoiceRef`, `status`, `amount` numérique, `currency` égal à `XAF` et `externalRef` égal à la référence unique du règlement. Le serveur compare le montant et la devise avec la facture.
- Les demandes de carte bancaire sont désactivées jusqu’à l’intégration d’un formulaire hébergé par un prestataire. L’historique des anciens règlements reste lisible.
- Les notifications internes sont enregistrées en base. Les canaux e-mail et SMS dépendent des clés et URL des prestataires.

