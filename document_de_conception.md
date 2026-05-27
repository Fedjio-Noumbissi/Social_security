# Document de Conception - Application CSI Sécurité Sociale

## 1. Introduction
Ce document présente l'architecture, les choix techniques, le modèle de données et les règles métier de l'application **CSI Sécurité Sociale**, destinée à la gestion des soins médicaux, des patients et des remboursements au sein de l'École Nationale Supérieure Polytechnique de Yaoundé.

---

## 2. Architecture Globale
L'application repose sur une architecture moderne de type **Client-Serveur (Monolithe Séparé)** :
- **Frontend (Client)** : Application Single Page Application (SPA) développée en React. Elle communique avec le backend via des requêtes HTTP (API RESTful) asynchrones.
- **Backend (Serveur)** : Serveur API REST développé en Java avec Spring Boot. Il expose les points d'entrée sécurisés, gère la logique métier et l'accès aux données.
- **Base de Données** : Base de données relationnelle gérant les entités métiers.

---

## 3. Stack Technique

### 3.1 Frontend
- **Framework** : React avec TypeScript
- **Style & UI** : Tailwind CSS (approches utilitaires), composants dynamiques et modales (React Portals)
- **Routage** : React Router v6
- **Requêtes HTTP** : Axios avec Intercepteurs pour injection de Token JWT
- **Icônes** : Lucide React

### 3.2 Backend
- **Framework** : Java Spring Boot 3.x
- **Accès aux données** : Spring Data JPA / Hibernate
- **Sécurité** : Spring Security avec JSON Web Tokens (JWT)
- **Base de données** : H2 Database (In-Memory pour le développement) / MySQL ou PostgreSQL (Production)
- **Outil de build** : Maven

---

## 4. Modèle de Données (MCD)

Le modèle relationnel est structuré autour des entités suivantes :

### Utilisateurs et Rôles
- **User** (`users`) : Entité centrale contenant les informations de base (Nom, Prénom, Email, Mot de passe crypté, Genre).
- **Role** (`roles`) : `ROLE_ADMIN`, `ROLE_ASSUREUR`, `ROLE_MEDECIN`, `ROLE_PATIENT`.
- **User_Roles** : Table de jointure (Many-to-Many).

### Acteurs du système
- **Patient** (`patients`) : Hérite (logiquement) d'un User. Contient le `socialSecurityNumber` et la référence optionnelle à un médecin traitant.
- **Doctor** (`doctors`) : Hérite d'un User. Contient le `matricule` et la `specialty` (GÉNÉRALISTE, CARDIOLOGUE, etc.).

### Cœur Métier (Consultations et Remboursements)
- **Consultation** (`consultations`) : Lie un Patient et un Medecin à une date donnée. Contient le `motif` et les `observations`.
- **Prescription** (`prescriptions`) : Liée à une consultation. Se divise en :
  - `prescription_medicaments` : Nom du médicament, posologie, durée.
  - `prescription_specialists` : Référence vers un autre médecin (si besoin).
- **Feuille Maladie** (`feuilles_maladie`) : Générée automatiquement après une consultation. Atteste de l'acte médical.
- **Remboursement** (`remboursements`) : Lié à une feuille de maladie.
  - Propriétés : `amount` (montant calculé), `rate` (taux, ex: 70%), `status` (EN_ATTENTE, EFFECTUE), `method` (CASH, VIREMENT), `bankAccount` (RIB).

---

## 5. Cas d'Utilisation par Rôles

### ⚙️ Super Administrateur (`ROLE_ADMIN`)
- **Gestion des Accès :** Créer, consulter et révoquer les comptes des agents **Assureurs**.
- **Sécurité :** Supervision des droits d'accès principaux de l'application.

### 🏢 Agent Assureur (`ROLE_ASSUREUR`)
- **Gestion Financière (Remboursements) :**
  - Consulter toutes les demandes de remboursement.
  - Traiter les paiements (approuver un virement ou un paiement en espèces).
  - Générer et imprimer les factures/reçus.
- **Gestion des Dossiers :**
  - Consulter le registre des Patients et des Médecins affiliés.
  - Accéder aux rapports globaux et statistiques (Dashboard).

### 👨‍⚕️ Médecin (`ROLE_MEDECIN`)
- **Consultations :**
  - Enregistrer une nouvelle consultation médicale pour un patient.
  - Rédiger des ordonnances (médicaments) et des références vers des spécialistes.
  - *Automatisme : L'enregistrement génère instantanément la feuille de maladie pour le patient.*
- **Suivi :** Consulter l'historique médical des patients qu'il a reçus.

### 🤒 Patient (`ROLE_PATIENT`)
- **Carnet de santé numérique :** Consulter l'historique de ses consultations et les recommandations des médecins.
- **Suivi Financier :** Suivre l'état d'avancement de ses remboursements en temps réel et consulter ses factures.

---

## 6. Sécurité et Contrôle d'Accès

L'application respecte les principes du **Role-Based Access Control (RBAC)** :
1. **Authentification (Login)** : L'utilisateur fournit ses identifiants. Si valide, le backend Spring Security génère un token JWT signé avec une clé secrète.
2. **Autorisation Frontend** : Le `AuthContext` (React) lit les rôles depuis le profil utilisateur. Le composant `<ProtectedRoute />` bloque l'accès aux pages non autorisées (ex: Un patient ne peut pas accéder à `/admin/assureurs`).
3. **Autorisation Backend** : Chaque point de terminaison (`Endpoint`) API est protégé via les annotations `@PreAuthorize("hasRole('ROLE_...')")`. Une requête sans token valide ou sans le bon rôle est rejetée avec un code HTTP `401 Unauthorized` ou `403 Forbidden`.

---

## 7. Flux Fonctionnel Principal (Workflow d'une maladie)

1. Le **Médecin** reçoit le **Patient** et saisit le diagnostic sur la page "Nouvelle Consultation".
2. Le système sauvegarde la `Consultation` et les `Prescriptions`.
3. Le système génère automatiquement une `FeuilleMaladie` en arrière-plan.
4. Le système génère automatiquement une demande de `Remboursement` au statut "EN_ATTENTE".
5. L'**Assureur** se connecte, voit la demande, vérifie le RIB, et valide le paiement (passe en "EFFECTUE").
6. Le **Patient** voit sur son tableau de bord que son argent a été remboursé.
