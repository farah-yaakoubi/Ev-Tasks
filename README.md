# EV TASKS

Plateforme de travail d'équipe pour le Groupe Espace Vert.

## Structure du projet

```text
frontend/                       Interface React/Vite
  src/app/                      Composition de l'application et état partagé
  src/features/                 Pages regroupées par fonctionnalité
  src/shared/                   Types et composants communs
  src/services/                 Services API et accès aux données mock
  src/mocks/                    Données locales de démonstration

backend/                        Serveur et accès aux données
  src/server/                   Application Express, routes et services métier
  src/database/client.ts        Connexion Prisma à MySQL
  src/server/storage/            Stockage local des médias
  prisma/schema.prisma          Structure des tables SQL
  prisma/migrations/             Historique des changements MySQL

compose.yaml                    MySQL local avec volume persistant
.env.example                    Exemple des paramètres locaux
```

### Rôle des parties

- **Frontend** affiche les pages et envoie les requêtes HTTP. Il ne se connecte jamais directement à la base.
- **Backend** reçoit ces requêtes, vérifie les droits, exécute les règles métier et répond au frontend.
- **MySQL** conserve les données structurées comme les membres, projets, tâches, messages et évaluations.
- **Stockage média** conserve les fichiers sur le disque du serveur; MySQL garde leur nom, chemin et métadonnées.

Le parcours prévu est : navigateur ou mobile → backend → MySQL et dossier média.

## Créer la base en local

Depuis la racine du projet, dans PowerShell :

1. Créer le fichier de configuration local : `Copy-Item .env.example .env`.
2. Dans `.env`, remplacer les mots de passe d'exemple. Garder le même mot de passe utilisateur dans `DATABASE_URL`, `SHADOW_DATABASE_URL` et `MYSQL_PASSWORD`. Pour éviter les problèmes d'encodage de l'URL, utiliser des lettres et chiffres, ou encoder les caractères spéciaux.
3. Démarrer Docker Desktop, puis lancer `docker compose up -d db`.
4. Créer les tables avec la migration initiale : `npm run db:deploy`.
5. Pour consulter les tables, lancer `npm run db:studio`.

Compose crée `ev_tasks` et un schéma séparé `ev_tasks_shadow` utilisé lors de la création de futures migrations. Les données restent dans le volume Docker `ev_tasks_mysql_data` quand le conteneur redémarre.

## Démarrer l'application

Après la création de la base :

1. `npm install`
2. `npm run db:generate`
3. Pour créer le premier compte directeur, renseigner `INITIAL_ADMIN_*` dans `.env`, puis lancer `npm run auth:create-admin`.
4. Ouvrir deux terminaux : lancer `npm run dev:backend` dans le premier et `npm run dev` dans le second.

## Fichiers et sécurité

- `STORAGE_DIR` indique le dossier des médias; par défaut, `var/media` à la racine du projet.
- Sauvegarder ensemble le volume MySQL et `STORAGE_DIR`.
- Les secrets réels vont dans `.env`, jamais dans `.env.example`.
- Le client Prisma généré est créé sous `node_modules/.prisma/ev-tasks`; il n'est pas du code source.

## État du backend

Le schéma MySQL et la migration initiale sont prêts. Le backend possède des routes de connexion, de session et de déconnexion. Le premier compte directeur se crée avec `npm run auth:create-admin`. L'interface permet aussi d'entrer avec un profil de démonstration. Les pages métiers utilisent encore des données de démonstration dans le navigateur; projets, tâches, messages et autres modules ne sont donc pas encore partagés entre les membres.

## Déploiement sur serveur local (VM)

La procédure complète (Nginx, HTTPS, systemd, MySQL, sauvegarde) est décrite dans le dossier de livraison
`DOCUMENTATION/` (PDF 01 à 04). Résumé :

1. Cloner ce dépôt sur la VM, copier `.env.example` en `.env` et renseigner les valeurs de production (bloc commenté en bas du fichier).
2. `npm install` puis `npm run db:generate` puis `npm run db:deploy`.
3. Construire le frontend : `VITE_DATA_MODE=api VITE_API_BASE_URL=/api npm run build --workspace @ev-tasks/frontend`.
4. Lancer le backend avec le service systemd (`npm run start --workspace @ev-tasks/backend`) derrière Nginx en **HTTPS** (le cookie de session est `Secure` en production).

`compose.yaml` sert uniquement au développement local ; il n'est pas utilisé sur la VM.

> **Accès réseau pendant l'installation.** `npm install` et `npm run db:generate` téléchargent des paquets depuis le registre npm
> et des binaires Prisma depuis `binaries.prisma.sh`. La VM doit pouvoir joindre ces deux adresses (directement ou via le proxy
> de l'entreprise) au moins lors de l'installation et des mises à jour. Une fois installé, le serveur n'a plus besoin d'Internet.
