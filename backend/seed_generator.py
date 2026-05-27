import random
from datetime import datetime, timedelta

hash_pw = "'$2a$10$JseRBA/zzbDPPfiQ9wwPAeXW/U27uxjbD6zMwfgY8ViNmJ9KXMMwS'"

with open('src/main/resources/schema-data.sql', 'r') as f:
    lines = f.readlines()

# find index of "-- Seeding data"
seed_index = -1
for i, line in enumerate(lines):
    if line.startswith('-- Seeding data'):
        seed_index = i
        break

header = lines[:seed_index+1]

with open('src/main/resources/schema-data.sql', 'w') as f:
    f.writelines(header)
    f.write("\n-- 1. Insert Users\n")
    f.write("INSERT INTO users (id, email, password, first_name, last_name, gender) VALUES\n")
    users = [
        "(100, 'admin@csi.com', " + hash_pw + ", 'Super', 'Admin', 'M')",
        "(1, 'assureur@csi.com', " + hash_pw + ", 'Jean', 'Dupont', 'M')",
        "(2, 'dr.ngolo@csi.com', " + hash_pw + ", 'Alain', 'Ngolo', 'M')",
        "(3, 'dr.mbarga@csi.com', " + hash_pw + ", 'Sophie', 'Mbarga', 'F')",
        "(4, 'dr.tchuente@csi.com', " + hash_pw + ", 'Marc', 'Tchuente', 'M')",
        "(5, 'patient1@csi.com', " + hash_pw + ", 'Alice', 'Eto', 'F')",
        "(6, 'patient2@csi.com', " + hash_pw + ", 'Paul', 'Biya', 'M')",
        "(7, 'patient3@csi.com', " + hash_pw + ", 'Marie', 'Fouda', 'F')",
        "(8, 'patient4@csi.com', " + hash_pw + ", 'Chantal', 'Mbia', 'F')",
        "(9, 'dr.kamga@csi.com', " + hash_pw + ", 'Luc', 'Kamga', 'M')",
        "(10, 'patient5@csi.com', " + hash_pw + ", 'Roger', 'Milla', 'M')",
        "(11, 'patient6@csi.com', " + hash_pw + ", 'Samuel', 'Etoo', 'M')"
    ]
    f.write(",\n".join(users) + ";\n")

    f.write("\n-- 2. Insert User Roles\n")
    f.write("INSERT INTO user_roles (user_id, role) VALUES\n")
    roles = [
        "(100, 'ROLE_ADMIN')",
        "(1, 'ROLE_ASSUREUR')",
        "(2, 'ROLE_MEDECIN')", "(3, 'ROLE_MEDECIN')", "(4, 'ROLE_MEDECIN')", "(9, 'ROLE_MEDECIN')",
        "(5, 'ROLE_PATIENT')", "(6, 'ROLE_PATIENT')", "(7, 'ROLE_PATIENT')", "(8, 'ROLE_PATIENT')",
        "(10, 'ROLE_PATIENT')", "(11, 'ROLE_PATIENT')"
    ]
    f.write(",\n".join(roles) + ";\n")

    f.write("\n-- 3. Insert Doctors\n")
    f.write("INSERT INTO doctors (id, user_id, matricule, specialty, is_insured) VALUES\n")
    doctors = [
        "(1, 2, 'MED-GEN-001', 'GENERALISTE', FALSE)",
        "(2, 3, 'MED-SPE-002', 'SPECIALISTE', FALSE)",
        "(3, 4, 'MED-GEN-003', 'GENERALISTE', TRUE)",
        "(4, 9, 'MED-SPE-004', 'SPECIALISTE', FALSE)"
    ]
    f.write(",\n".join(doctors) + ";\n")

    f.write("\n-- 4. Insert Patients\n")
    f.write("INSERT INTO patients (id, user_id, social_security_number, emergency_contact, medecin_traitant_id) VALUES\n")
    patients = [
        "(1, 5, '1891234567801', 'Contact (+237 6 77 11 22 33)', 1)",
        "(2, 6, '1859876543202', 'Contact (+237 6 99 88 77 66)', 1)",
        "(3, 7, '1901122334403', 'Contact (+237 6 75 44 33 22)', 3)",
        "(4, 8, '1912233445504', 'Contact (+237 6 55 11 22 33)', 1)",
        "(5, 10, '1823344556605', 'Contact (+237 6 98 76 54 32)', 3)",
        "(6, 11, '1884455667706', 'Contact (+237 6 77 88 99 00)', 1)"
    ]
    f.write(",\n".join(patients) + ";\n")

    f.write("\n-- 5. Insert Consultations\n")
    f.write("INSERT INTO consultations (id, doctor_id, patient_id, date, motif, observations) VALUES\n")
    consultations = []
    base_date = datetime(2026, 5, 1)
    
    motifs = ['Fièvre et toux', 'Maux de ventre', 'Consultation de routine', 'Douleurs articulaires', 'Paludisme', 'Fatigue générale', 'Bilan sanguin']
    
    for i in range(1, 16):
        doc_id = random.choice([1, 2, 3, 4])
        pat_id = random.choice([1, 2, 3, 4, 5, 6])
        date = base_date + timedelta(days=i, hours=random.randint(8, 16), minutes=random.choice([0, 15, 30, 45]))
        motif = random.choice(motifs)
        obs = 'Observations médicales standards suite à la consultation.'
        consultations.append(f"({i}, {doc_id}, {pat_id}, '{date.strftime('%Y-%m-%d %H:%M:%S')}', '{motif}', '{obs}')")
    
    f.write(",\n".join(consultations) + ";\n")

    f.write("\n-- 6. Insert Feuilles de Maladie\n")
    f.write("INSERT INTO feuilles_maladie (id, consultation_id, date, status) VALUES\n")
    feuilles = []
    for i in range(1, 16):
        date = base_date + timedelta(days=i, hours=17)
        status = random.choice(['VALIDEE', 'EN_ATTENTE']) if i > 10 else 'VALIDEE'
        feuilles.append(f"({i}, {i}, '{date.strftime('%Y-%m-%d %H:%M:%S')}', '{status}')")
    f.write(",\n".join(feuilles) + ";\n")

    f.write("\n-- 7. Insert Remboursements\n")
    f.write("INSERT INTO remboursements (id, feuille_maladie_id, amount, rate, method, bank_account, status) VALUES\n")
    remboursements = []
    for i in range(1, 16):
        # generaliste -> doc 1 or 3 -> rate 100%, 5000 FCFA
        # specialiste -> doc 2 or 4 -> rate 80%, 15000 * 0.8 = 12000 FCFA
        # doc_id is random, let's just make it randomly 5000 or 12000
        amount = random.choice([5000.0, 12000.0])
        rate = 100 if amount == 5000.0 else 80
        method = random.choice(['CASH', 'VIREMENT'])
        bank = "'CM21 10005 00003 01234567890 89'" if method == 'VIREMENT' else "NULL"
        status = 'EFFECTUE' if i <= 8 else 'EN_ATTENTE'
        remboursements.append(f"({i}, {i}, {amount}, {rate}, '{method}', {bank}, '{status}')")
    
    f.write(",\n".join(remboursements) + ";\n")

    f.write("\n-- Sequences reset\n")
    f.write("ALTER TABLE users ALTER COLUMN id RESTART WITH 101;\n")
    f.write("ALTER TABLE doctors ALTER COLUMN id RESTART WITH 100;\n")
    f.write("ALTER TABLE patients ALTER COLUMN id RESTART WITH 100;\n")
    f.write("ALTER TABLE consultations ALTER COLUMN id RESTART WITH 100;\n")
    f.write("ALTER TABLE feuilles_maladie ALTER COLUMN id RESTART WITH 100;\n")
    f.write("ALTER TABLE remboursements ALTER COLUMN id RESTART WITH 100;\n")

