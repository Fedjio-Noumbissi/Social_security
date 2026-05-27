# Documentation Frontend - CSI Sécurité Sociale

Ce document détaille l'ensemble des fonctionnalités implémentées dans le Frontend de l'application **CSI Sécurité Sociale**, développée en React (TypeScript) et Tailwind CSS.

---

## 1. Sécurité et Authentification
Le système repose sur un contrôle d'accès basé sur les rôles (RBAC - *Role-Based Access Control*).

- **Inscription / Connexion (`/login`, `/register`)** : Pages publiques permettant l'authentification des utilisateurs et la création de compte.
- **Contexte d'Authentification (`AuthContext`)** : Gère l'état global de l'utilisateur (token JWT, informations de profil, rôles) et persiste la session.
- **Routes Protégées (`ProtectedRoute`)** : Composant de sécurité qui empêche l'accès aux URL privées si l'utilisateur n'est pas connecté, et qui redirige les utilisateurs s'ils n'ont pas les permissions requises pour une page spécifique.

---

## 2. Rôles Utilisateurs
L'interface s'adapte dynamiquement selon le rôle de l'utilisateur connecté :
1. **Super Administrateur (`ROLE_ADMIN`)** : Gère l'infrastructure de base (les assureurs).
2. **Assureur (`ROLE_ASSUREUR`)** : Gère les finances, les remboursements, les médecins et les rapports.
3. **Médecin (`ROLE_MEDECIN`)** : Gère les consultations médicales et les dossiers de ses patients.
4. **Patient (`ROLE_PATIENT`)** : Consulte son historique médical et le suivi de ses remboursements.

---

## 3. Fonctionnalités par Page (Routing)

### 📊 Tableau de Bord (`/dashboard`)
*Accessible à : Tous les rôles connectés*
- Page d'accueil après connexion.
- Affiche des **KPIs (Indicateurs Clés de Performance)** spécifiques au rôle de l'utilisateur (ex: nombre de consultations pour un médecin, remboursements en attente pour un assureur, etc.).
- Affiche les activités récentes et des graphiques statistiques si applicable.

### 🛡️ Gestion des Assureurs (`/admin/assureurs`)
*Accessible à : `ROLE_ADMIN`*
- Liste complète des agents assureurs enregistrés.
- **Création** d'un nouveau compte Assureur via une modale sécurisée.
- **Recherche** et filtrage dynamique.
- **Suppression** des comptes assureurs existants.

### 👥 Gestion des Patients (`/patients`)
*Accessible à : `ROLE_ASSUREUR`, `ROLE_MEDECIN`*
- Répertoire des patients inscrits dans le système.
- Affichage de leurs informations personnelles et de leur numéro de sécurité sociale.
- Accès rapide à l'historique de chaque patient.

### 👨‍⚕️ Gestion des Médecins (`/doctors`)
*Accessible à : `ROLE_ASSUREUR`*
- Liste du personnel de santé rattaché au système.
- Affichage des spécialités (Généralistes, Spécialistes).
- Suivi de leur activité et de leurs matricules.

### 🩺 Consultations Médicales (`/consultations`)
*Accessible à : `ROLE_MEDECIN`, `ROLE_PATIENT`*
- **Vue Médecin :**
  - Historique complet des actes médicaux réalisés.
  - **Enregistrer une consultation :** Modale de saisie (Motif, Observations cliniques, Date).
  - **Ordonnance :** Ajout dynamique de médicaments (nom, posologie, durée).
  - **Prescription Spécialiste :** Possibilité de référer le patient vers un autre médecin spécialisé.
  - *Note : L'enregistrement d'une consultation génère automatiquement la feuille de maladie et déclenche la demande de remboursement.*
- **Vue Patient :**
  - Accès à son historique médical personnel et aux détails de ses consultations.

### 💳 Remboursements (`/remboursements`)
*Accessible à : `ROLE_ASSUREUR`, `ROLE_PATIENT`*
- **Vue Assureur :**
  - Suivi des KPIs financiers (Total versé, En attente).
  - Liste des demandes de remboursement avec leur statut (`EFFECTUE`, `EN_ATTENTE`).
  - **Traiter un remboursement :** Modale permettant de choisir le mode de paiement (Espèces ou Virement) et d'ajouter un RIB.
  - **Facturation :** Possibilité d'afficher et d'imprimer (format PDF/Print) la facture d'un remboursement effectué.
- **Vue Patient :**
  - Visualisation de l'état d'avancement de ses propres remboursements (Montant, Statut, Méthode de paiement).

### 📈 Rapports et Statistiques (`/reports`)
*Accessible à : `ROLE_ASSUREUR`*
- Page d'analyse métier (Business Intelligence).
- Affiche des données agrégées et des graphiques concernant les finances de la sécurité sociale, l'activité médicale et les statistiques démographiques.

---

## 4. Architecture et UI/UX (Interface Utilisateur)

- **Layout Global (`Layout.tsx`)** : Barre de navigation latérale (Sidebar) responsive qui ajuste automatiquement ses liens selon le rôle de l'utilisateur. Barre supérieure (Header) avec le profil utilisateur et bouton de déconnexion.
- **Modales Dynamiques (React Portals)** : Utilisation de `createPortal` pour assurer que les fenêtres pop-up (Création, Traitement, Factures) s'affichent parfaitement au centre de l'écran, bloquent le défilement de la page arrière et gèrent le flou d'arrière-plan sans bugs de superposition CSS.
- **Feedback Utilisateur (Toast/Flash messages)** : Système de notifications contextuelles vertes ou rouges pour informer l'utilisateur de la réussite ou de l'échec de ses actions (ex: *"Remboursement traité avec succès"*).
- **Responsive Design** : Toutes les pages (Tableaux, Formulaires, Modales) sont conçues avec Tailwind CSS pour s'adapter parfaitement aux écrans d'ordinateurs, de tablettes et de téléphones portables.
- **Requêtes API (`api.ts` avec Axios)** : Intercepteur global qui attache automatiquement le Token JWT sécurisé à chaque requête envoyée vers le backend Spring Boot.
