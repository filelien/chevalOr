# 📘 Guide Complet - Dashboard Admin Cheval d'Or Essentials

## Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Modules Core](#modules-core)
3. [Gestion Opérationnelle](#gestion-opérationnelle)
4. [Gestion Financière](#gestion-financière)
5. [Paramétrage](#paramétrage)
6. [Troubleshooting](#troubleshooting)

---

## Vue d'Ensemble

Le Dashboard Admin regroupe **33 modules professionnels** pour la gestion complète d'un hôtel. Tout est **entièrement dynamique** - aucune valeur n'est codée en dur dans la base de données.

### Accès
- **URL**: `/admin` (sécurisé par authentification)
- **Rôles**: Admin, Manager, réception, cuisine, gestion, comptabilité, entretien
- **Permissions**: RBAC granulaires par module

---

## Modules Core

### 🏨 Chambres (`/admin/chambres`)
**Responsabilité**: Gestion d'inventaire hôtel

**Fonctionnalités**:
- CRUD complet (créer/modifier/supprimer chambres)
- Configuration: type, prix/nuit, équipements, image
- Statuts: disponible, occupée, nettoyage, maintenance, réservée
- Recherche/filtrage par type, prix, statut
- Galerie images intégrée

**Actions rapides**:
```
+ Ajouter chambre → Remplir formulaire → Sélectionner image → Enregistrer
📝 Modifier → Cliquer sur chambre → Editer détails → Sauvegarder
🗑️ Supprimer → Confirmer suppression
```

### 📅 Planning (`/admin/planning`)
**Responsabilité**: Vue calendrier occupancy

**Fonctionnalités**:
- Calendrier semaine/mois interactif
- Suivi occupancy rate en temps réel
- Nombre nuits réservées affichées
- Visualisation réservations par couleur
- Export occupancy stats

**Actions rapides**:
```
📊 Voir taux occupation: En haut page
🔄 Changer vue: Boutons semaine/mois
📥 Exporter: Bouton download en bas
```

### 🛏️ Réservations (`/admin/reservations`)
**Responsabilité**: Gestion complète des bookings

**Fonctionnalités**:
- 3 vues: Tableau, Kanban, Cartes
- Filtres: statut, paiement, date, client
- Statuts: confirmée, payée, annulée, pending
- Génération facture/reçu PDF
- Créations walk-in (client sans réservation)
- Export CSV complet
- Historique modifications

**Actions rapides**:
```
➕ Nouvelle réservation → Form → Enregistrer
💳 Marquer payée → Cliquer paiement → Confirmer
❌ Annuler → Cliquer actions → Confirmer
📄 Facture → Cliquer → PDF généré
📊 Export → CSV téléchargé
```

### 🍽️ Restaurant (`/admin/restaurant`)
**Responsabilité**: POS & gestion restaurant

**Fonctionnalités**:
- Gestion tables
- Menu éditable (créer/modifier/supprimer items)
- Prises de commande
- Affichage cuisine (kitchen display)
- Suivi paiements par table
- Historique commandes

**Actions rapides**:
```
➕ Nouvelle table → Form → Sauvegarder
📋 Menu → Ajouter/modifier items de la liste
🥘 Commande → Sélectionner table → Ajouter items → Passer commande
✅ Marquer prête → Affichage cuisine
💰 Paiement → Enregistrer montant
```

### 📦 Stock (`/admin/stock`)
**Responsabilité**: Inventory & barcode scanning

**Fonctionnalités**:
- Ajout/modification items
- Suivi quantités en temps réel
- Alertes seuil critique (stock bas)
- Scan code-barres
- Recherche par nom/barcode
- Historique mouvements

**Actions rapides**:
```
➕ Ajouter item → Infos → Quantité seuil → Enregistrer
🔍 Chercher → Taper nom/barcode
📉 Sortie stock → Diminuer quantité
⚠️ Alertes → Items sous seuil affichés en rouge
```

### ⭐ Avis Clients (`/admin/avis`)
**Responsabilité**: Modération avis et réputation

**Fonctionnalités**:
- Liste tous avis (publiés/masqués)
- Publication/masquage avis
- Réponses hôtel personnalisées
- Visualisation rating (★★★★★)
- Statuts: en attente, publié, masqué
- Suppression avis

**Actions rapides**:
```
✅ Publier → Cliquer "Publier"
🔇 Masquer → Cliquer "Masquer"
💬 Répondre → Taper réponse → Enregistrer
🗑️ Supprimer → Confirmer
```

---

## Gestion Opérationnelle

### 👥 Utilisateurs (`/admin/utilisateurs`)
**Responsabilité**: Gestion staff & permissions

**Fonctionnalités**:
- CRUD personnel (recrutement/départs)
- Assignation rôles par département
- Configuration statuts (actif/inactif/congé)
- MFA (2FA) par personne
- Historique connexions
- Réinitialisation mot de passe

**Actions rapides**:
```
➕ Embaucher → Email → Rôles → Département → Enregistrer
🔐 Mot de passe oublié → Réinitialiser
👁️ Historique connexion → Cliquer utilisateur → "Historique"
🔒 Activer 2FA → Cocher "MFA requis"
```

### 🛡️ Rôles & Permissions (`/admin/roles`)
**Responsabilité**: Gestion RBAC

**Fonctionnalités**:
- Rôles prédéfinis (admin, manager, reception, kitchen, etc.)
- Permissions granulaires par rôle
- Création rôles personnalisés
- Assignation rapide à utilisateurs

**Actions rapides**:
```
🔧 Modifier rôle → Sélectionner rôle → Cocher/décocher permissions
➕ Rôle custom → Nom + "Basé sur" → Permissions → Enregistrer
```

### 📊 Clients (`/admin/clients`)
**Responsabilité**: CRM & client base

**Fonctionnalités**:
- Liste tous clients avec historique
- Segmentation VIP (standard/silver/gold/platinum)
- Total dépensé par client
- Nombre réservations
- Dernière visite
- Préférences de langue
- Export CSV

**Actions rapides**:
```
🔍 Chercher → Nom/email → Affichage client
💰 Voir total → Colonnes dépenses/réservations
📧 Contacter → Email ou WhatsApp direct
📊 Export → CSV de tous clients
```

### 🎯 Activité & Audit (`/admin/activite`)
**Responsabilité**: Supervision temps réel

**Fonctionnalités**:
- Audit trail TOUS modules (qui/quand/quoi)
- Historique connexions utilisateurs
- Alertes critiques (suppressions, changements importants)
- Filtres: module, action, utilisateur, date, niveau
- Export logs complet

**Actions rapides**:
```
🔍 Filtrer → Module/Action/User → Voir détails
📅 Période → Sélectionner dates
🚨 Alertes → Critiques en rouge
📥 Export → CSV logs complets
```

---

## Gestion Financière

### 💰 Finance (`/admin/finance`)
**Responsabilité**: Enregistrement transactions

**Fonctionnalités**:
- Entrées/sorties financières
- Catégories: revenus divers, dépenses, remboursements
- Suivi revenu hôtel vs restaurant séparés
- Calcul profit net
- Date/description pour chaque entrée

**Actions rapides**:
```
➕ Entrée → Type (income/expense) → Montant → Catégorie → Date → Enregistrer
📊 Voir résumé → Revenus/dépenses/profit affichés
📈 Trend → Graphique évolution sur période
```

### 📈 Rapports & BI (`/admin/rapports`)
**Responsabilité**: Analytics professionnelle - **NOUVEAU**

**Fonctionnalités**:
- Filtrage par période (date début/fin)
- KPIs: CA total, profit net, clients actifs, réservations confirmées
- Revenue split: Hôtel vs Restaurant (graphique pie)
- Trend chiffre affaires (courbe temporelle)
- Statuts réservations (graphique barres)
- Tableaux détail: top chambres, produits restaurant, pays clients, catégories finance, stock critique
- Métriques: clients uniques, panier moyen, taux occupation, durée moyenne séjour
- Export données en CSV

**Actions rapides**:
```
📅 Définir période → Date début/fin → Données rafraîchies
📊 KPIs → Cards en haut (totalRevenue, netProfit, etc.)
📉 Graphiques → Pie/Bar/Line charts interactifs
📋 Tableaux → Scroll pour détails détaillés
💾 Export → CSV pour Excel/BI externe
```

---

## Paramétrage

### ⚙️ Paramètres Globaux (`/admin/parametres`)
**Responsabilité**: Config application

**Fonctionnalités**:
- Configuration générale hôtel
- Intégrations (Stripe, etc.)
- Notifications par email
- Localisation/fuseau horaire

### 🌐 Site Web (`/admin/site-web`)
**Responsabilité**: CMS et branding - **DYNAMIQUE**

**Fonctionnalités**:
- **Pages**: Créer/éditer/publier pages web
- **Infos hôtel**: Nom, adresse, tel, email, horaires (DB)
- **Apparence**: Couleurs thème, logo, favicon (DB)
- **Contenu global**: Textes à travers le site (DB)
- **SEO**: Métadescriptions par page

**Actions rapides**:
```
📄 Pages → "Ajouter page" → Titre + contenu → Publier
🎨 Apparence → Changer couleurs/logo/favicon
📝 Infos hôtel → Editer contact/horaires (DYNAMIQUE - utilisé partout)
🔍 SEO → Ajouter métabalises
```

### 📱 WhatsApp (`/admin/whatsapp`)
**Responsabilité**: Configuration messagerie - **DYNAMIQUE**

**Fonctionnalités**:
- Numéro WhatsApp (DB)
- Horaires actifs (DB)
- Messages par défaut (DB)
- Templates notifications:
  - Confirmation réservation
  - Rappel J-1
  - Remerciement après séjour

**Actions rapides**:
```
📞 Numéro → Modifier + Test bouton
⏰ Horaires → Changer heures activation
💬 Messages → Templates pré-remplies modifiables
```

### 🖼️ Galerie (`/admin/galerie`)
**Responsabilité**: Media library centralisée

**Fonctionnalités**:
- Upload image/PDF/vidéo
- Tags et organisation
- Favorites/publish status
- Recherche et filtres avancés
- Preview full-screen
- Suppression avec confirmation
- Métadonnées (auteur, date, taille)

**Actions rapides**:
```
⬆️ Upload → Drag-drop ou cliquer → Ajouter metadata
🏷️ Tags → Organiser par catégorie
⭐ Favorite → Marquer important
🔍 Chercher → Par nom/tag/date
🗑️ Supprimer → Confirmer
```

---

## Troubleshooting

### 🔴 Erreurs Communes

**"Erreur de permission"**
- ✓ Vérifier rôle utilisateur (admin/manager)
- ✓ Vérifier permissions RBAC pour ce module
- ✓ Contacter admin pour élévation

**"Données disparues"**
- ✓ Vérifier historique audit (`/admin/activite`)
- ✓ Backup BD récent disponible
- ✓ Contacter support

**"Données codées en dur qui ne changent pas"**
- ✓ ✅ RÉSOLU - Tous les paramètres hôtel maintenant en BD
- ✓ Utiliser `/admin/site-web` pour modifier

**"Build error après modification"**
- ✓ Vérifier `npm run build` localement
- ✓ Vérifier types TypeScript: `npm run type-check`
- ✓ Vérifier import/export dans fichier

---

## 🚀 Optimisations Futures

1. **Notifications Temps Réel** - Websocket pour alertes live
2. **API Publique** - Partenaires/intégrations externes
3. **Mobile App** - React Native pour iOS/Android
4. **ML Pricing** - Algorithme pricing intelligent
5. **Intégration Comptabilité** - Export Odoo/QuickBooks

---

## 📞 Support

Pour questions/problèmes:
- Consulter ce guide
- Vérifier `/admin/activite` pour diagnostiquer
- Contacter administrateur système

**Version**: v2.0 (2026)
**Dernière mise à jour**: Juillet 2026
**Statut**: ✅ Production Ready
