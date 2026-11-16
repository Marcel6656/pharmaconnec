# Revue et corrections de PharmaConnect

**Projet examiné** · Archive PharmaConnect-COMPLET.zip, frontend Next.js, API NestJS et schémas Prisma. La version corrigée contient les sources, les tests, les ressources graphiques et les instructions de démarrage. Les fichiers de configuration privés, les bases existantes, les justificatifs téléversés et les dépendances installées ont été exclus de l’archive.

## Principaux constats et corrections

| Priorité | Module | Constat | Correction |
| --- | --- | --- | --- |
| Critique | Écritures métier | L’espace officine renvoyait une copie globale des données. Le serveur pouvait supprimer les produits absents de cette copie et réécrire l’historique de stock. | Mutations ciblées pour les produits, les stocks, la fiche, les catégories, les messages, les notifications et les préférences. La lecture de l’état est conservée. Les anciennes écritures globales reçoivent HTTP 410. |
| Élevée | Messagerie et confidentialité | La vue agrégée et l’API de messagerie utilisaient des critères différents pour rattacher un fil à un visiteur. | Critère commun. Le fil relève du compte authentifié qui l’a ouvert. Les fils envoyés anonymement restent accessibles à l’officine qui les a reçus. La pharmacie ne voit que ses propres fils. La réponse de l’officine marque le fil comme lu dans une même transaction. |
| Élevée | Dossier d’officine | Une première validation pouvait partir d’un dossier sans justificatif déposé. Un échec d’envoi pouvait être masqué par le message de succès de l’inscription. | La première validation exige un justificatif en base. L’officine peut compléter le dossier dans « Mon établissement ». Le contrôle du document relève toujours de l’administration. Le téléchargement administratif est protégé par rôle. |
| Élevée | Abonnement et badge | La validation et le badge étaient écrits séparément. La tâche d’expiration pouvait utiliser une lecture obsolète. | Validation, essai initial, badge et audit enregistrés ensemble. Le badge de vérification est géré par le serveur. L’expiration vérifie à nouveau l’échéance lors de la mise à jour et peut être annulée par un renouvellement déjà enregistré. |
| Élevée | Paiements | Une demande opérateur pouvait partir avant l’enregistrement de la facture. L’interface proposait une carte dont le connecteur ne pouvait pas effectuer le débit. | Facture créée avant envoi, référence de demande stable et confirmation atomique. L’opérateur est choisi parmi les options configurées. Une transmission incertaine garde la facture en attente. Les demandes par carte sont désactivées et l’historique reste disponible. |
| Élevée | Catalogue et modération | Les routes publiques, les signalements et l’interface n’utilisaient pas partout le même périmètre de visibilité. Les modifications globales pouvaient altérer la date de fraîcheur. | Visibilité conditionnée par l’officine active, le statut publié et la fraîcheur du stock. Stock zéro affiché « Indisponible ». Modification de la fiche publiée renvoyée en validation. La déclaration dédiée des prix et stocks est horodatée, historisée et conserve le statut de modération. |
| Moyenne | Comptes | L’interface regroupait les identifiants incorrects, l’absence de droit, la limite de tentatives et l’indisponibilité de l’API. Les comptes de démonstration pouvaient être repeuplés en production. | L’interface relaie les erreurs de connexion. Le backend révoque les jetons lors des changements de mot de passe ou de suspension et refuse les comptes Google désactivés. Le peuplement fictif est explicite et bloqué en production. |
| Moyenne | Catégories et profils | Des catégories utilisées pouvaient être supprimées et des champs obligatoires acceptaient des espaces seuls. | Suppression bloquée jusqu’à la réaffectation des produits. Les champs obligatoires sont contrôlés après nettoyage. Le stock doit être déclaré en unités entières. |
| Moyenne | Administration et contenus | L’administration persistait des instantanés privés dans le navigateur. La rubrique Santé réaffichait des valeurs prédéfinies après retrait des contenus. | Suppression du cache métier persistant. La rubrique publique laisse la liste vide lorsque l’administration retire ou désactive les entrées. Les numéros d’urgence affichés proviennent du contenu publié. |
| Moyenne | Démarrage et déploiement | La documentation mélangeait prototype local et API existante. L’archive emportait des dépendances installées, des sorties de build et des données locales. | Guides Next.js et NestJS actualisés. L’installation repose sur les fichiers de verrouillage. Le Compose racine lie l’interface à la boucle locale par défaut et garde PostgreSQL et l’API sur le réseau interne. |

## Isolation des officines

Le compte professionnel reçoit uniquement les établissements qui lui sont rattachés et leurs données privées. Un compte qui gère plusieurs établissements peut les retrouver dans son sélecteur. L’annuaire et le catalogue publiés sont chargés séparément. Les données de facturation et les échéances sont réservées aux comptes autorisés.

Le serveur contrôle le propriétaire à la lecture et à la modification. Une ressource hors du périmètre du compte renvoie la même réponse qu’une ressource inconnue. Les justificatifs sont protégés par rôle et par établissement. Les images liées à des produits non publiés et les couvertures d’officines non visibles nécessitent un accès propriétaire ou administration, même pour les anciens liens sous `/uploads/public/`.

Le test entre deux officines vérifie l’état agrégé, l’accès direct aux profils, produits, justificatifs, conversations, règlements, catégories, préférences, notifications et statistiques, ainsi que les réponses à des modifications hors périmètre. Il vérifie aussi le passage d’une image de produit de privée à publique, puis son retrait après masquage.

## Contre-vérification des accès

- La première association Google à un compte existant exige le mot de passe PharmaConnect. Les connexions suivantes reposent sur le sujet Google déjà enregistré. Les contrôles ont été validés avec des identités Google simulées.
- Le serveur exclut les anciennes réponses dont l’officine diffère de celle du fil. Une adresse e-mail saisie dans un message anonyme sert de contact. L’accès au fil dans l’espace visiteur dépend de l’identité authentifiée à l’envoi.
- Une session expirée, invalide ou révoquée est rejetée sur la route d’état. Les identifiants et les rôles sont vérifiés sur le serveur. La projection publique ne contient ni les métadonnées de gestion ni le planning structuré de l’officine.

Documentation de référence pour l’identifiant Google et la vérification d’identité. [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

## Règles appliquées

- PharmaConnect permet de consulter les disponibilités et de contacter l’officine. Les paiements concernent les abonnements des pharmacies.
- L’essai initial dure 14 jours. Il débloque les fonctions Premium pendant sa validité. Les quotas de produits actifs, brouillons compris, sont de 50 pour Basic, 300 pour Standard et sans plafond pour Premium. Les archives ne consomment pas ce quota.
- Le stock et le prix ont leur propre déclaration. La date de fraîcheur est calculée côté serveur. La fiche d’un produit peut exiger une nouvelle décision de modération.
- Pour Mobile Money, une demande reste en attente jusqu’à confirmation. Le montant est calculé depuis la formule côté serveur. Les périodes mensuelle, trimestrielle et annuelle ajoutent respectivement 1, 3 et 12 mois à l’échéance applicable. Une confirmation répétée sur la même facture ne prolonge pas deux fois l’abonnement.
- Les pièces nécessaires selon la juridiction, les tarifs définitifs et les contenus sanitaires restent des paramètres d’exploitation à faire approuver.

## Contre-vérification des règles métier

| Parcours | Règle vérifiée |
| --- | --- |
| Dossier et essai | Un dossier jamais validé exige un justificatif pour démarrer son essai de 14 jours. Réactiver l’officine conserve l’échéance existante. La confirmation d’un abonnement ne remplace pas la vérification du dossier. |
| Visibilité publique | Une officine suspendue, non validée ou échue n’apparaît plus dans l’annuaire. Le catalogue exclut aussi les déclarations trop anciennes ou datées dans le futur. Le stock zéro apparaît comme indisponible. |
| Produits | L’approbation porte sur la version examinée. Un brouillon passe par la soumission. Une demande de correction ou un refus exige un motif. Un changement de prix ou de stock via la déclaration prévue actualise la fraîcheur et conserve le statut. |
| Quotas | 50 produits actifs pour Basic, 300 pour Standard, plafond absent en Premium ou pendant l’essai valide. Le quota est contrôlé à la demande de paiement, à la confirmation et lors de la réouverture d’une archive. Une officine échue peut archiver des produits pour rendre son catalogue compatible. Le règlement reste en attente si le quota est dépassé. |
| Paiements | La confirmation manuelle exige la référence du reçu. Un webhook signé doit aussi indiquer le montant de la facture et sa devise XAF. Réutiliser la même référence sur une autre facture est refusé et rejouer une confirmation valide ne prolonge pas une seconde fois. |
| Catégories et badge | Une catégorie utilisée doit être libérée avant suppression. Le nom du badge de vérification est réservé. |
| Statistiques d’officine | Les stocks faibles utilisent le seuil configuré. Les produits archivés sont exclus des indicateurs de stock actif. |

## Vérifications

| Contrôle | Couverture |
| --- | --- |
| 17 tests d’intégration HTTP sur SQLite isolé | Rôles réels, sessions expirées ou révoquées, association Google simulée, suivi des contacts, modération, quotas, fichiers, 14 jours, filiales, messagerie, devises et références de règlement, expiration et fraîcheur. |
| 36 contrôles statiques et builds de production | TypeScript, compilation NestJS et Next.js, pages publiques et administration. |
| Vérification HTTP Next.js → NestJS | Accueil, page admin, catalogue, refus d’accès anonyme à l’API admin, connexion officine, webhook signé avec le corps brut et accès aux images vérifié avec deux comptes et refus des sessions révoquées. La contre-vérification a confirmé la transmission de la version de modération et le refus d’un montant de webhook signé incorrect. |
| Recette Chromium sur PostgreSQL 16.15 | Quatre sessions séparées, trois sur ordinateur à 1 440 × 900 et une en émulation iPhone 13. Inscription officine en trois étapes, dépôt et consultation administrative du justificatif, absence publique avant validation, essai Premium après validation, soumission et publication du produit, rupture de stock, inscription visiteur et réponse affichée sur mobile. Aucun débordement horizontal relevé sur l’écran du compte patient testé. |
| Changement d’officine dans le navigateur | Après déconnexion de l’officine A puis connexion de B dans le même navigateur, les produits et la conversation de A sont absents de l’espace de B. Le serveur exclut A de l’état privé de B et renvoie HTTP 404 pour ses produits et ses justificatifs. |
| Initialisation PostgreSQL de production | La base vierge reçoit un seul administrateur et les trois formules. Les établissements fictifs sont absents et la demande de peuplement de démonstration est refusée. |
| Sauvegarde et restauration PostgreSQL 16.15 | Export `pg_dump` et restauration `pg_restore` avec les outils PostgreSQL 16.15 dans une seconde base. Les décomptes de huit tables et les empreintes SHA-256 du volume de fichiers correspondent. L’API a redémarré sur cette copie et a retrouvé le compte administratif, le justificatif exact, le produit publié à stock zéro, la conversation et la facture confirmée avec son échéance. La procédure Compose figure dans `backend/README.md`. |
| Paiements et notifications sur relais locaux | Moov Money simulé en succès et en échec, Airtel Money simulé indisponible avec facture maintenue en attente, montant erroné refusé et webhook répété sans deuxième prolongation. Le relais e-mail et le relais SMS ont chacun reçu une seule notification pour la facture confirmée. Aucun débit ni message réel. |

## Limites constatées

- Docker Compose v2.39.4 a validé la configuration. Le frontend écoute par défaut sur la boucle locale, tandis que l’API et PostgreSQL restent sur le réseau interne. Les données PostgreSQL et les fichiers ont deux volumes persistants. Le démarrage de la pile conteneurisée reste à vérifier sur un hôte doté d’un démon Docker accessible.
- Google, Airtel Money, Moov Money, e-mail et SMS restent à valider avec les comptes et identifiants de test des prestataires dans l’environnement cible. Le contrat Mobile Money implémenté exige un relais compatible avec le format de demande et de webhook documenté. Google reste désactivé sans identifiant client et son association de comptes a été vérifiée par le test local simulé.
- Le code contient encore des libellés en français dans plusieurs écrans. La revue n’inclut pas une traduction intégrale de chaque écran. Les statistiques de fréquentation nécessitent une instrumentation avec des données réelles.
- Les jetons sont stockés côté navigateur. Le contrôle d’accès serveur et l’isolation des conversations ont été vérifiés par la suite d’intégration. L’hébergement privé, son TLS et ses contrôles d’accès restent à vérifier sur l’hôte cible.

## Corrections issues de la recette

- Le formulaire d’agrément invite à sélectionner les formats admis par l’API. Son texte décrit l’examen des justificatifs par l’équipe PharmaConnect et le début de l’essai après validation.
- La liste des pièces annoncées par l’officine est distincte des fichiers reçus. L’envoi enregistre ensemble les pièces et leur événement d’audit. Le téléchargement des justificatifs demeure réservé à l’administration.
- Le bandeau de l’espace officine affiche « Essai Premium » pendant l’essai actif. Les menus, la page des tarifs et la console d’administration décrivent le mode de paiement proposé, Mobile Money.
- Sur mobile, le bouton du compte patient et le menu disposent de zones distinctes après connexion. Le bouton du compte conserve un libellé accessible lorsque seul son pictogramme s’affiche.
- La page publique des urgences ne contient plus de numéro hospitalier codé en dur. Les coordonnées affichées proviennent des entrées publiées par l’administration. L’API ne contient aucune publication sanitaire dans la base neuve de test.

## Préparation du pilote

Le projet est préconfiguré pour N’Djamena au Tchad, avec des adresses et numéros de démonstration au `+235`. La devise d’abonnement est le franc CFA d’Afrique centrale (`XAF`), conformément à la zone d’émission qui couvre le Tchad. Le pays de lancement reste à confirmer pour le projet. [BEAC](https://www.beac.int/wp-content/uploads/2018/05/rchangecemac.pdf) · [Banque de France](https://webstat.banque-france.fr/api/datasets/1.0/tableaux_rapports_preetablis/images/8d39b3ec2cdd5733dd198516131b7df9)

Airtel Money et Moov Money sont documentés au Tchad et disposent de points de configuration dans le projet. Le mode de rapprochement manuel propose aussi Orange Money et Wave. Le choix des opérateurs à afficher et l’accès marchand en test doivent être confirmés avant le pilote. [Agence tchadienne de presse et d’édition](https://www.atpe.td/flux-financiers-de-letat-vers-lintegration-du-paiement-electronique/)

| Formule | Prix mensuel | Prix trimestriel | Prix annuel |
| --- | ---: | ---: | ---: |
| Basic | 5 000 XAF | 13 500 XAF | 48 000 XAF |
| Standard | 10 000 XAF | 27 000 XAF | 96 000 XAF |
| Premium | 20 000 XAF | 54 000 XAF | 192 000 XAF |

Le tableau reprend les tarifs initiaux du code. L’administration peut les modifier après validation commerciale.

Le décret tchadien prévoit un arrêté délivré par le ministre chargé de la Santé après avis de l’Ordre national des pharmaciens. Pour le contrôle des officines sur la plateforme, rapprocher l’arrêté délivré de l’établissement inscrit et vérifier l’inscription à l’Ordre du pharmacien titulaire. Le dossier complet d’ouverture adressé à l’autorité relève de l’article 6. Le formulaire PharmaConnect collecte les justificatifs nécessaires à l’examen de l’inscription sur la plateforme. [Décret n° 1582/PR/PM/MSP/2015, articles 3 et 6](https://legitchad.org/textes/decrets/decret-15-1582-2015-07-24-pr-pm-msp/)

Les numéros, les horaires et les contenus sanitaires du pilote restent à faire valider par le responsable éditorial avec les services compétents avant leur publication sur PharmaConnect.

Pour lancer le projet, ouvrez `backend/README.md`, puis `pharmaconnect/README.md`.
