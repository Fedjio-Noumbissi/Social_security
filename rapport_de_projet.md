# Rapport de Projet - CSI Sécurité Sociale

## 1. Contexte et Objectifs du Projet
Le projet **CSI Sécurité Sociale** a pour objectif de digitaliser le processus de gestion médicale (patients, médecins, consultations) et le flux financier des remboursements de soins (assureurs) au sein d'un environnement éducatif / institutionnel. 
Le but principal était de construire une application Full-Stack robuste avec des rôles précis pour chaque intervenant, garantissant la sécurité des données médicales et la fiabilité des transactions.

---

## 2. Travaux Réalisés

L'ensemble de l'application a été structuré et développé selon les standards modernes du développement web :

### 2.1 Backend (Java Spring Boot)
- **Modélisation de la Base de données** : Création des entités (`User`, `Role`, `Doctor`, `Patient`, `Consultation`, `Remboursement`).
- **Sécurité et Authentification** : Mise en place d'un système de JWT (JSON Web Tokens) couplé à Spring Security pour gérer 4 rôles distincts (`ROLE_ADMIN`, `ROLE_ASSUREUR`, `ROLE_MEDECIN`, `ROLE_PATIENT`).
- **Logique Métier Automatisée** : Création automatique d'une feuille de maladie et déclenchement du processus de remboursement suite à l'enregistrement d'une consultation.
- **Seeding** : Création d'un script `schema-data.sql` (et un script de test Python) injectant des données réalistes de test au démarrage de l'application (H2 In-Memory).

### 2.2 Frontend (React & Tailwind CSS)
- **Interface Utilisateur (UI)** : Implémentation d'un design moderne, "responsive" et épuré avec Tailwind CSS (effets de flou, ombres, transitions).
- **Tableaux de bord (Dashboards)** : Séparation claire des vues selon le rôle de l'utilisateur connecté (KPIs dynamiques).
- **Pages fonctionnelles majeures** :
  - **Super Administrateur** : Création de la page `/admin/assureurs` permettant d'ajouter et de supprimer des employés "Assureurs".
  - **Consultations** : Enregistrement de nouveaux diagnostics avec gestion dynamique des ordonnances (ajout/suppression de médicaments en temps réel).
  - **Remboursements** : Page permettant de voir l'état des paiements, avec une interface de validation des virements/paiements cash et génération de **factures imprimables**.

---

## 3. Défis Techniques et Solutions Apportées

Durant les dernières phases de développement, plusieurs correctifs critiques ont été appliqués :

1. **Erreur 400 (Bad Request) lors de la création d'Assureurs :**
   - *Problème* : Le backend rejetait l'ajout d'assureurs car le champ `role` était manquant dans la requête Frontend, malgré l'attribution côté serveur.
   - *Solution* : Modification du Payload Axios dans `AdminAssureurs.tsx` pour inclure explicitement `role: 'ASSUREUR'`.

2. **Problème d'Affichage des Modales (CSS / Layout) :**
   - *Problème* : Les fenêtres superposées (modales de consultation et de traitement de remboursement) ne couvraient pas tout l'écran à cause du contexte d'empilement CSS (stacking context) créé par les animations du layout principal.
   - *Solution* : Implémentation experte de **React Portals (`createPortal`)** pour attacher physiquement les modales directement au `document.body`. Ceci a garanti un centrage parfait et un fond flou sur 100% de l'écran.

3. **Conflit de Port Serveur (8080 already in use) :**
   - *Problème* : Le backend Maven ne pouvait pas démarrer à cause de processus fantômes restant en arrière-plan.
   - *Solution* : Utilisation des commandes système Unix (`fuser -k 8080/tcp`) pour purger la mémoire système et permettre le redémarrage propre de l'API.

---

## 4. Statut Actuel du Projet

À ce jour, le projet est **Fonctionnel et Prêt pour une phase de Recette (Test Utilisateurs)**.

✅ **Ce qui fonctionne à 100% :**
- L'authentification et l'étanchéité des rôles.
- La création de comptes administratifs (Assureurs).
- Le cycle de vie complet d'une maladie : `Consultation -> Feuille de maladie -> Remboursement -> Facture`.
- L'interface utilisateur est entièrement finalisée et réactive (Responsive).

🚀 **Évolutions futures possibles :**
- Export complet des tableaux de rapports statistiques en format Excel / CSV.
- Notification par Email (SMTP) lorsqu'un remboursement de patient passe à l'état `EFFECTUÉ`.
- Migration de la base de données H2 vers PostgreSQL ou MySQL pour une vraie mise en production sur un serveur distant (Cloud).

---

## 5. Conclusion
Le développement de la plateforme CSI s'est déroulé de manière fluide grâce à une séparation stricte des responsabilités entre le Frontend et le Backend. Les problèmes d'intégration rencontrés ont été diagnostiqués et corrigés très rapidement, aboutissant à une interface premium, fluide et hautement sécurisée.
