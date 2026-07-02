# Cheval d'Or Essentials

Plateforme web complète dédiée à la gestion et à la présence digitale de l'hôtel Le Cheval d'Or. Ce projet combine un site public moderne, des parcours de réservation, des intégrations paiement, et un back-office d'administration pour piloter les opérations de l'établissement.

## Vue d'ensemble

Cette application a été conçue pour couvrir plusieurs besoins métiers à la fois :

- présenter l'hôtel, les chambres, le restaurant, les événements et les expériences ;
- permettre aux visiteurs de réserver et de contacter l'établissement ;
- offrir une interface d'administration pour la gestion des réservations, clients, paiements, contenu, SEO, communication et opérations ;
- intégrer des services externes tels que Supabase, un système d'authentification, et des mécanismes de paiement/notifications.

Le projet repose sur une architecture moderne TypeScript avec React, TanStack Start, Tailwind CSS et Supabase.

## Fonctionnalités principales

### Site public

- pages institutionnelles : accueil, à propos, chambres, offres, expériences, restaurant, événements, galerie, contact ;
- contenu éditorial et blog ;
- pages SEO et métadonnées ;
- formulaires de contact / réservation / événement ;
- expérience responsive et design premium.

### Administration

Le back-office contient des modules autour de :

- réservations et confirmations ;
- clients et utilisateurs ;
- chambres et stock ;
- événements et conférences ;
- restaurant et activités ;
- marketing, campagnes et notifications ;
- finance, paiements et rapports ;
- configuration SEO, sécurité et paramètres généraux.

### Intégrations techniques

- authentification et gestion des rôles ;
- base de données et API via Supabase ;
- intégration serveur pour les opérations sensibles ;
- structure prête pour les déploiements sur Vercel ;
- tests unitaires autour de modules métiers et utilitaires.

## Stack technique

- React 19
- TypeScript
- TanStack Router / TanStack Start
- Vite
- Tailwind CSS
- Supabase
- Radix UI / shadcn-style components
- Vitest + Testing Library
- ESLint + Prettier

## Structure du projet

- src/routes : routes publiques et routes authentifiées de l'application
- src/components : composants UI et modules fonctionnels
- src/lib : logique métier, contenus, permissions, exports, helpers
- src/hooks : hooks React réutilisables
- src/integrations/supabase : intégration backend et auth
- server : routes et logique serveur
- scripts : automatisation setup, Supabase, Vercel, administration
- supabase : migrations et configuration Supabase

## Prérequis

- Node.js 20+ recommandé
- npm ou bun
- accès à un projet Supabase configuré
- variables d'environnement correctement renseignées

## Installation

1. Cloner le dépôt
2. Installer les dépendances :

```bash
npm install
```

3. Copier le fichier d'exemple d'environnement :

```bash
cp .env.example .env.local
```

4. Renseigner les variables nécessaires, notamment :

- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SITE_URL

## Lancer le projet localement

```bash
npm run dev
```

Le site sera disponible sur le port Vite par défaut, généralement sur http://localhost:5173.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run test
npm run test:watch
npm run format
```

## Variables d'environnement

Le projet fournit un fichier .env.example prêt à l'emploi avec les variables essentielles pour :

- l'authentification Supabase ;
- l'URL du site ;
- les intégrations paiement ;
- les notifications email.

## Déploiement

Le projet est configuré pour un déploiement sur Vercel via la configuration présente dans vercel.json.

Étapes recommandées :

1. créer un projet Vercel ;
2. connecter le dépôt ;
3. définir les variables d'environnement en production ;
4. déclencher un déploiement.

## Vision plateforme premium

L'objectif de cette plateforme n'est plus seulement d'être un site vitrine, mais de devenir une solution hôtelière complète, entièrement administrable et prête pour un usage professionnel haut de gamme.

### Direction produit cible

- un CMS complet où 100 % du contenu est modifiable depuis l'admin sans toucher au code ;
- une médiathèque centralisée pour toutes les images, vidéos et documents ;
- un constructeur de sections et de pages dynamique ;
- des modules avancés pour les réservations, paiements, WhatsApp, SEO, analytics et marketing ;
- une expérience multilingue et évolutive ;
- une gestion fine des rôles, permissions, logs et sauvegardes.

### Modules prioritaires à transformer

- CMS complet des pages publiques : accueil, chambres, restaurant, spa, événements, galerie, blog, FAQ, mentions légales, etc. ;
- gestion dynamique des sections du site : activation, désactivation, ordre, couleurs, textes, boutons ;
- hero builder, theme manager, menu/footer builder ;
- centre WhatsApp professionnel avec messages contextuels et automatisation ;
- réservations avancées avec disponibilités, annulations, acomptes, factures et PDF ;
- gestion des chambres, des albums, des témoignages, de la newsletter et du blog ;
- tableau de bord analytics, SEO avancé, sauvegardes, notifications et sécurité renforcée ;
- intégration IA pour le contenu, le marketing et le support.

## Tests

Le dépôt contient déjà des tests unitaires sur plusieurs modules utilitaires et métiers. Pour les exécuter :

```bash
npm run test
```

## Recommandations de maintenance

- garder les variables d'environnement centralisées et documentées ;
- conserver les migrations Supabase versionnées ;
- couvrir les parcours critiques par des tests automatisés ;
- auditer régulièrement la sécurité, les permissions et les parcours de paiement ;
- documenter chaque nouveau module admin ou feature publique.

## Contribution

Pour contribuer proprement :

- conserver la structure existante ;
- ajouter des tests pour toute nouvelle logique métier ;
- éviter les changements non justifiés sur le routing et les modules sensibles ;
- documenter les nouvelles variables d'environnement et les nouveaux workflows.

## Résumé

Ce projet est déjà une base solide et relativement avancée pour une plateforme hôtelière moderne. Il contient une vraie vision produit, une architecture répartie entre site public et back-office, et des intégrations métiers sérieuses. La prochaine étape consiste surtout à renforcer la robustesse opérationnelle, la qualité automatisée et la gouvernance de la plateforme.
