# 🛡️ CSI — Application de Gestion de Sécurité Sociale

Application web complète développée dans le cadre du projet tutoré de **Conception des Systèmes d'Information (CSI)** à l'**École Nationale Supérieure Polytechnique de Yaoundé**.

---

## 📋 Table des Matières

1. [Aperçu du Projet](#aperçu)
2. [Architecture Technique](#architecture)
3. [Prérequis](#prérequis)
4. [Installation et Démarrage](#installation)
5. [Comptes de Démonstration](#comptes)
6. [Structure du Projet](#structure)
7. [API Endpoints](#api)
8. [Règles Métier](#règles)

---

## Aperçu

Cette application permet à un organisme de sécurité sociale de gérer :
- **Les assurés** (inscription, suivi, attribution d'un médecin traitant)
- **Les médecins** (généralistes et spécialistes, dual rôle possible)
- **Les consultations** (avec ordonnances et références spécialiste)
- **Les feuilles de maladie** (générées automatiquement)
- **Les remboursements** (100% généraliste / 80% spécialiste, virement ou cash)
- **Les rapports statistiques** (graphiques, alertes d'anomalies)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
│                                                         │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────┐ │
│  │   React App  │───▶│  Spring Boot  │───▶│PostgreSQL│ │
│  │  (Nginx:80)  │    │  (Port 8080)  │    │(Port5432)│ │
│  │  TypeScript  │    │  JWT + REST   │    │          │ │
│  │  Tailwind    │    │  Swagger UI   │    │          │ │
│  └──────────────┘    └───────────────┘    └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Stack Technique :**
| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Recharts |
| Backend | Spring Boot 3.2, Java 17, Spring Security, JWT |
| Base de Données | PostgreSQL 15 |
| Documentation API | Swagger / OpenAPI 3 |
| Conteneurisation | Docker & Docker Compose |

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker** ≥ 24.0 et **Docker Compose** ≥ 2.20
- **Git**

Pour le développement local (sans Docker) :
- **Java 17** (JDK)
- **Maven** ≥ 3.8
- **Node.js** ≥ 20 et **npm** ≥ 10
- **PostgreSQL** ≥ 15

---

## Installation

### 🐳 Option 1 : Démarrage complet via Docker Compose (Recommandé)

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd Project_CSI

# 2. Lancer toute l'application
docker-compose up --build -d

# 3. Vérifier que les conteneurs sont lancés
docker-compose ps

# 4. Consulter les logs
docker-compose logs -f
```

Une fois démarré :
- 🌐 **Frontend** : http://localhost
- ⚙️ **Backend API** : http://localhost:8080
- 📚 **Swagger UI** : http://localhost:8080/swagger-ui.html

Pour stopper :
```bash
docker-compose down
# Pour supprimer également les volumes (BDD) :
docker-compose down -v
```

---

### 💻 Option 2 : Développement Local (Sans Docker)

#### Backend Spring Boot

```bash
# 1. Démarrer PostgreSQL et créer la base de données
psql -U postgres -c "CREATE DATABASE security_sociale;"
psql -U postgres -c "CREATE USER csi_user WITH PASSWORD 'csi_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE security_sociale TO csi_user;"

# 2. Initialiser les données de démonstration
psql -U csi_user -d security_sociale -f backend/src/main/resources/schema-data.sql

# 3. Lancer le backend
cd backend
mvn spring-boot:run
# Le backend est disponible sur http://localhost:8080
```

#### Frontend React

```bash
# Dans un nouveau terminal
cd frontend
npm install
npm run dev
# Le frontend est disponible sur http://localhost:5173
```

---

## Comptes de Démonstration

Après initialisation avec `schema-data.sql`, les comptes suivants sont disponibles :

| Rôle | Email | Mot de Passe | Description |
|------|-------|--------------|-------------|
| **Assureur** | assureur@csi.com | `password` | Accès complet : gestion patients/médecins, remboursements, rapports |
| **Médecin Généraliste** | dr.martin@csi.com | `password` | Consultation, prescriptions, feuilles de soins |
| **Médecin Spécialiste** | dr.keller@csi.com | `password` | Consultations spécialisées |
| **Patient** | patient@csi.com | `password` | Historique médical, suivi remboursements |
| **Médecin Assuré** | dr.malade@csi.com | `password` | Double rôle : Médecin **et** Assuré |

---

## Structure du Projet

```
Project_CSI/
├── docker-compose.yml
├── README.md
│
├── backend/                          ← Spring Boot Application
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/csi/securitysociale/
│       │   ├── SecuritySocialeApplication.java
│       │   ├── config/
│       │   │   └── SecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── PatientController.java
│       │   │   ├── DoctorController.java
│       │   │   ├── ConsultationController.java
│       │   │   └── RemboursementController.java
│       │   ├── dto/
│       │   │   ├── LoginRequest.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── JwtAuthenticationResponse.java
│       │   │   ├── ConsultationRequest.java
│       │   │   └── RemboursementProcessRequest.java
│       │   ├── entity/
│       │   │   ├── User.java
│       │   │   ├── Doctor.java
│       │   │   ├── Patient.java
│       │   │   ├── Consultation.java
│       │   │   ├── Prescription.java
│       │   │   ├── PrescriptionMedicament.java
│       │   │   ├── PrescriptionSpecialist.java
│       │   │   ├── FeuilleMaladie.java
│       │   │   └── Remboursement.java
│       │   ├── exception/
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   ├── ResourceNotFoundException.java
│       │   │   └── BadRequestException.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── DoctorRepository.java
│       │   │   ├── PatientRepository.java
│       │   │   ├── ConsultationRepository.java
│       │   │   ├── PrescriptionRepository.java
│       │   │   ├── FeuilleMaladieRepository.java
│       │   │   └── RemboursementRepository.java
│       │   ├── security/
│       │   │   ├── UserPrincipal.java
│       │   │   ├── CustomUserDetailsService.java
│       │   │   ├── JwtTokenProvider.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── JwtAuthenticationEntryPoint.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── PatientService.java
│       │       ├── DoctorService.java
│       │       ├── ConsultationService.java
│       │       └── RemboursementService.java
│       └── resources/
│           ├── application.properties
│           └── schema-data.sql
│
└── frontend/                         ← React TypeScript Application
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx                   ← Router principal
        ├── main.tsx                  ← Point d'entrée
        ├── index.css                 ← Styles globaux
        ├── context/
        │   └── AuthContext.tsx       ← Gestion session JWT
        ├── services/
        │   └── api.ts                ← Client Axios
        ├── types/
        │   └── index.ts              ← Interfaces TypeScript
        ├── components/
        │   └── Layout.tsx            ← Sidebar + Header
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── Dashboard.tsx         ← Adaptatif selon le rôle
            ├── Patients.tsx
            ├── Doctors.tsx
            ├── Consultations.tsx     ← + Prescriptions
            ├── Remboursements.tsx    ← + Impression facture
            └── Reports.tsx           ← Graphiques Recharts
```

---

## API Endpoints

La documentation interactive Swagger est disponible à : `http://localhost:8080/swagger-ui.html`

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion, retourne un JWT |
| POST | `/api/auth/register` | Inscription (Patient, Médecin, Assureur) |

### Patients
| Méthode | Endpoint | Rôles |
|---------|----------|-------|
| GET | `/api/patients` | ASSUREUR, MEDECIN |
| GET | `/api/patients/{id}` | Tous |
| GET | `/api/patients/user/{userId}` | Tous |
| PUT | `/api/patients/{id}` | ASSUREUR, PATIENT |
| DELETE | `/api/patients/{id}` | ASSUREUR |
| PUT | `/api/patients/{id}/assign-doctor?doctorId=X` | ASSUREUR, PATIENT |
| GET | `/api/patients/{id}/history` | Tous |

### Médecins
| Méthode | Endpoint | Rôles |
|---------|----------|-------|
| GET | `/api/doctors` | Tous |
| GET | `/api/doctors/{id}` | Tous |
| GET | `/api/doctors/specialty/{specialty}` | Tous |
| PUT | `/api/doctors/{id}` | ASSUREUR, MEDECIN |
| DELETE | `/api/doctors/{id}` | ASSUREUR |

### Consultations
| Méthode | Endpoint | Rôles |
|---------|----------|-------|
| GET | `/api/consultations` | ASSUREUR |
| POST | `/api/consultations` | MEDECIN |
| GET | `/api/consultations/patient/{id}` | Tous |
| GET | `/api/consultations/doctor/{id}` | ASSUREUR, MEDECIN |

### Remboursements
| Méthode | Endpoint | Rôles |
|---------|----------|-------|
| GET | `/api/remboursements` | ASSUREUR |
| GET | `/api/remboursements/{id}` | ASSUREUR, PATIENT |
| GET | `/api/remboursements/patient/{id}` | ASSUREUR, PATIENT |
| PUT | `/api/remboursements/{id}/process` | ASSUREUR |
| GET | `/api/remboursements/summary` | ASSUREUR |

---

## Règles Métier

| Règle | Implémentation |
|-------|---------------|
| Un médecin est soit généraliste, soit spécialiste | Validation dans `AuthService.registerUser()` |
| Le médecin traitant doit être généraliste | Vérification dans `PatientService.assignMedecinTraitant()` |
| Un médecin peut être aussi assuré | Double rôle `ROLE_MEDECIN` + `ROLE_PATIENT` à l'inscription |
| Remboursement 100% généraliste | Calcul dans `ConsultationService.createConsultation()` |
| Remboursement 80% spécialiste | Calcul dans `ConsultationService.createConsultation()` |
| Feuille de maladie auto-générée | Lors de chaque `POST /api/consultations` |
| Virement exige un RIB | Validation dans `RemboursementService.processRemboursement()` |

---

## Groupe 2 — Auteurs

| Nom | Matricule |
|-----|-----------|
| KEMGNE FOTSO CLAUDE DILAN | 23P623 |
| FONKEU SADEU WILFRIED | 23P175 |
| KOUAM KAMTO MARIUS | 23P320 |
| NDI ONANA LEILA PRISCA | 25P840 |
| YAMENI DJINE ELFRIEDE | 23P159 |
| NGAVOM'MOUN NDAM ABDUL'AZIZ NASSER | 23P339 |
| TADONKENG CORETTA | 25P849 |
| NGNINPA TCHOMBA PATERSON DESTIN | 22P423 |
| MBA DJOUSSI CHRIST NATHANAEL | 23P217 |
| ZAMBO BINDZI ERNEST GHISLAIN | 23P389 |
| KENGNI KOUGOUM ALAN TRESOR | 25P836 |
| AKOGO EMMANUEL GUILLAUME | — |
| MBA BELA OCEANNE | 23P518 |
| KEMDA DEMANOU JEAN LOIC | 22P356 |
| **FEDJIO NOUMBISSI GUENOLE** | **23P513** |
| DEFO TAKOUKAM RYAN | 23P543 |
| DJIOGUE LANGOUO JUNIOR | 23P166 |
| MBAH MOFFO JOSUE | 22P214 |

**Superviseurs :** Dr Anne Marie CHANA / Dr Jaures KAMENI  
**Institution :** École Nationale Supérieure Polytechnique de Yaoundé — Université de Yaoundé 1
