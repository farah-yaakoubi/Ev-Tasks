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

