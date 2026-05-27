-- schema-data.sql (PostgreSQL Init Script)

-- Seeding data

-- 1. Insert Users
INSERT INTO users (id, email, password, first_name, last_name, gender) VALUES
(100, 'admin@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Super', 'Admin', 'M'),
(1, 'assureur@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Jean', 'Dupont', 'M'),
(2, 'dr.ngolo@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Alain', 'Ngolo', 'M'),
(3, 'dr.mbarga@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Sophie', 'Mbarga', 'F'),
(4, 'dr.tchuente@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Marc', 'Tchuente', 'M'),
(5, 'patient1@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Alice', 'Eto', 'F'),
(6, 'patient2@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Paul', 'Biya', 'M'),
(7, 'patient3@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Marie', 'Fouda', 'F'),
(8, 'patient4@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Chantal', 'Mbia', 'F'),
(9, 'dr.kamga@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Luc', 'Kamga', 'M'),
(10, 'patient5@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Roger', 'Milla', 'M'),
(11, 'patient6@csi.com', '$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS', 'Samuel', 'Etoo', 'M');

-- 2. Insert User Roles
INSERT INTO user_roles (user_id, role) VALUES
(100, 'ROLE_ADMIN'),
(1, 'ROLE_ASSUREUR'),
(2, 'ROLE_MEDECIN'),
(3, 'ROLE_MEDECIN'),
(4, 'ROLE_MEDECIN'),
(9, 'ROLE_MEDECIN'),
(5, 'ROLE_PATIENT'),
(6, 'ROLE_PATIENT'),
(7, 'ROLE_PATIENT'),
(8, 'ROLE_PATIENT'),
(10, 'ROLE_PATIENT'),
(11, 'ROLE_PATIENT');

-- 3. Insert Doctors
INSERT INTO doctors (id, user_id, matricule, specialty, is_insured) VALUES
(1, 2, 'MED-GEN-001', 'GENERALISTE', FALSE),
(2, 3, 'MED-SPE-002', 'SPECIALISTE', FALSE),
(3, 4, 'MED-GEN-003', 'GENERALISTE', TRUE),
(4, 9, 'MED-SPE-004', 'SPECIALISTE', FALSE);

-- 4. Insert Patients
INSERT INTO patients (id, user_id, social_security_number, emergency_contact, medecin_traitant_id) VALUES
(1, 5, '1891234567801', 'Contact (+237 6 77 11 22 33)', 1),
(2, 6, '1859876543202', 'Contact (+237 6 99 88 77 66)', 1),
(3, 7, '1901122334403', 'Contact (+237 6 75 44 33 22)', 3),
(4, 8, '1912233445504', 'Contact (+237 6 55 11 22 33)', 1),
(5, 10, '1823344556605', 'Contact (+237 6 98 76 54 32)', 3),
(6, 11, '1884455667706', 'Contact (+237 6 77 88 99 00)', 1);

-- 5. Insert Consultations
INSERT INTO consultations (id, doctor_id, patient_id, date, motif, observations) VALUES
(1, 2, 2, '2026-05-02 08:00:00', 'Fièvre et toux', 'Observations médicales standards suite à la consultation.'),
(2, 2, 4, '2026-05-03 09:00:00', 'Douleurs articulaires', 'Observations médicales standards suite à la consultation.'),
(3, 3, 6, '2026-05-04 10:30:00', 'Fatigue générale', 'Observations médicales standards suite à la consultation.'),
(4, 2, 5, '2026-05-05 14:00:00', 'Bilan sanguin', 'Observations médicales standards suite à la consultation.'),
(5, 3, 3, '2026-05-06 09:15:00', 'Douleurs articulaires', 'Observations médicales standards suite à la consultation.'),
(6, 3, 2, '2026-05-07 16:30:00', 'Maux de ventre', 'Observations médicales standards suite à la consultation.'),
(7, 2, 3, '2026-05-08 13:30:00', 'Maux de ventre', 'Observations médicales standards suite à la consultation.'),
(8, 4, 2, '2026-05-09 15:15:00', 'Fièvre et toux', 'Observations médicales standards suite à la consultation.'),
(9, 1, 4, '2026-05-10 10:30:00', 'Paludisme', 'Observations médicales standards suite à la consultation.'),
(10, 3, 6, '2026-05-11 09:30:00', 'Fatigue générale', 'Observations médicales standards suite à la consultation.'),
(11, 3, 3, '2026-05-12 15:15:00', 'Fièvre et toux', 'Observations médicales standards suite à la consultation.'),
(12, 2, 4, '2026-05-13 15:15:00', 'Consultation de routine', 'Observations médicales standards suite à la consultation.'),
(13, 4, 1, '2026-05-14 15:00:00', 'Paludisme', 'Observations médicales standards suite à la consultation.'),
(14, 1, 3, '2026-05-15 10:15:00', 'Fatigue générale', 'Observations médicales standards suite à la consultation.'),
(15, 2, 4, '2026-05-16 13:30:00', 'Fièvre et toux', 'Observations médicales standards suite à la consultation.');

-- 6. Insert Feuilles de Maladie
INSERT INTO feuilles_maladie (id, consultation_id, date, status) VALUES
(1, 1, '2026-05-02 17:00:00', 'VALIDEE'),
(2, 2, '2026-05-03 17:00:00', 'VALIDEE'),
(3, 3, '2026-05-04 17:00:00', 'VALIDEE'),
(4, 4, '2026-05-05 17:00:00', 'VALIDEE'),
(5, 5, '2026-05-06 17:00:00', 'VALIDEE'),
(6, 6, '2026-05-07 17:00:00', 'VALIDEE'),
(7, 7, '2026-05-08 17:00:00', 'VALIDEE'),
(8, 8, '2026-05-09 17:00:00', 'VALIDEE'),
(9, 9, '2026-05-10 17:00:00', 'VALIDEE'),
(10, 10, '2026-05-11 17:00:00', 'VALIDEE'),
(11, 11, '2026-05-12 17:00:00', 'EN_ATTENTE'),
(12, 12, '2026-05-13 17:00:00', 'EN_ATTENTE'),
(13, 13, '2026-05-14 17:00:00', 'VALIDEE'),
(14, 14, '2026-05-15 17:00:00', 'EN_ATTENTE'),
(15, 15, '2026-05-16 17:00:00', 'EN_ATTENTE');

-- 7. Insert Remboursements
INSERT INTO remboursements (id, feuille_maladie_id, amount, rate, method, bank_account, status) VALUES
(1, 1, 5000.0, 100, 'CASH', NULL, 'EFFECTUE'),
(2, 2, 5000.0, 100, 'VIREMENT', 'CM21 10005 00003 01234567890 89', 'EFFECTUE'),
(3, 3, 5000.0, 100, 'CASH', NULL, 'EFFECTUE'),
(4, 4, 5000.0, 100, 'VIREMENT', 'CM21 10005 00003 01234567890 89', 'EFFECTUE'),
(5, 5, 5000.0, 100, 'VIREMENT', 'CM21 10005 00003 01234567890 89', 'EFFECTUE'),
(6, 6, 5000.0, 100, 'CASH', NULL, 'EFFECTUE'),
(7, 7, 12000.0, 80, 'CASH', NULL, 'EFFECTUE'),
(8, 8, 12000.0, 80, 'CASH', NULL, 'EFFECTUE'),
(9, 9, 5000.0, 100, 'CASH', NULL, 'EN_ATTENTE'),
(10, 10, 5000.0, 100, 'CASH', NULL, 'EN_ATTENTE'),
(11, 11, 12000.0, 80, 'CASH', NULL, 'EN_ATTENTE'),
(12, 12, 12000.0, 80, 'CASH', NULL, 'EN_ATTENTE'),
(13, 13, 12000.0, 80, 'VIREMENT', 'CM21 10005 00003 01234567890 89', 'EN_ATTENTE'),
(14, 14, 12000.0, 80, 'CASH', NULL, 'EN_ATTENTE'),
(15, 15, 12000.0, 80, 'CASH', NULL, 'EN_ATTENTE');

-- Sequences reset
ALTER TABLE users ALTER COLUMN id RESTART WITH 101;
ALTER TABLE doctors ALTER COLUMN id RESTART WITH 100;
ALTER TABLE patients ALTER COLUMN id RESTART WITH 100;
ALTER TABLE consultations ALTER COLUMN id RESTART WITH 100;
ALTER TABLE feuilles_maladie ALTER COLUMN id RESTART WITH 100;
ALTER TABLE remboursements ALTER COLUMN id RESTART WITH 100;
