export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  // Patient-specific
  socialSecurityNumber?: string;
  emergencyContact?: string;
  medecinTraitantId?: number;
  // Doctor-specific
  matricule?: string;
  specialty?: string;
  isInsured?: boolean;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  roles: string[];
}

export interface Doctor {
  id: number;
  user: User;
  matricule: string;
  specialty: 'GENERALISTE' | 'SPECIALISTE';
  isInsured: boolean;
}

export interface Patient {
  id: number;
  user: User;
  socialSecurityNumber: string;
  emergencyContact: string;
  medecinTraitant: Doctor | null;
}

export interface Consultation {
  id: number;
  doctor: Doctor;
  patient: Patient;
  date: string;
  motif: string;
  observations: string;
}

export interface FeuilleMaladie {
  id: number;
  consultation: Consultation;
  date: string;
  status: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
}

export interface PrescriptionMedicament {
  id?: number;
  name: string;
  dosage: string;
  durationDays: number;
}

export interface PrescriptionSpecialist {
  id?: number;
  specialtyNeeded: string;
  reason: string;
  referredDoctor: Doctor | null;
}

export interface Prescription {
  id: number;
  consultation: Consultation;
  medicaments: PrescriptionMedicament[];
  specialists: PrescriptionSpecialist[];
}

export interface Remboursement {
  id: number;
  feuilleMaladie: FeuilleMaladie;
  amount: number;
  rate: number;
  method: 'VIREMENT' | 'CASH';
  bankAccount: string | null;
  status: 'EN_ATTENTE' | 'EFFECTUE';
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
