# PharmaConnect Mobile — prototype Flutter

Application mobile grand public PharmaConnect. Première base de travail créée avant réception du dépôt React/NestJS existant.

## État du prototype

- Direction visuelle : blanc, vert et accents bleu pâle.
- Navigation : Accueil, Recherche, Pharmacies, Actualités, Profil.
- Recherche prioritaire sur l'accueil.
- Pharmacies : bascule Liste / Carte (la carte est actuellement un emplacement visuel, pas une carte interactive).
- Inscription/connexion : écrans de démonstration uniquement.
- Actualités et produits : données fictives clairement identifiées dans l'interface et les modèles.
- Client HTTP NestJS préparé, mais routes, format des jetons et URL à aligner sur le backend réel.

## Prérequis

- Flutter stable récent
- Dart compatible avec `>=3.3.0 <4.0.0`

## Initialiser et lancer

Ce paquet contient le code source Flutter et les dépendances, mais les dossiers natifs Android/iOS sont générés sur une machine disposant du SDK Flutter.

```bash
./scripts/bootstrap.sh
flutter run
```

## Configurer l'API

```bash
flutter run --dart-define=API_BASE_URL=https://votre-api.example.com
```

Le mode démonstration est activé par défaut. Le passage au mode connecté ne doit être effectué qu'après vérification des routes NestJS, du système d'authentification et des règles de sécurité du projet web.

## À intégrer après réception du ZIP web/backend

1. Aligner les routes et DTO avec NestJS.
2. Réutiliser le système de comptes et les jetons de session existants.
3. Connecter le catalogue réel, les pharmacies vérifiées et les déclarations de stock valides.
4. Connecter les actualités et alertes validées depuis le web.
5. Ajouter la permission de localisation au premier usage et le choix manuel de ville.
6. Choisir et intégrer le fournisseur cartographique et le routage.
7. Enregistrer les jetons FCM par compte et gérer les préférences régionales.
8. Ajouter stockage sécurisé, cache hors ligne et tests d'intégration.

## Sécurité

Ne placez jamais de secrets, clés privées ou fichiers `.env` dans le dépôt mobile. L'API NestJS doit appliquer toutes les autorisations côté serveur. Les données de démonstration ne doivent pas être utilisées en production.
