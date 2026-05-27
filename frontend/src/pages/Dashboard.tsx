import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Patient, Doctor, Consultation, Remboursement } from '../types';
import { Link } from 'react-router-dom';
import {
  DollarSign, Activity, Users, Stethoscope,
  CheckCircle, Clock, FileText, ArrowRight, UserPlus, Shield
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [recentRemboursements, setRecentRemboursements] = useState<Remboursement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (hasRole('ROLE_ASSUREUR')) {
          const statsRes = await api.get('/api/remboursements/summary');
          const rembRes = await api.get('/api/remboursements');
          const patientsRes = await api.get('/api/patients');
          const doctorsRes = await api.get('/api/doctors');

          setStats({
            ...statsRes.data,
            patientsCount: patientsRes.data.length,
            doctorsCount: doctorsRes.data.length
          });
          setRecentRemboursements(rembRes.data.slice(0, 5));
        }

        if (hasRole('ROLE_MEDECIN')) {
          const docRes = await api.get<Doctor>(`/api/doctors/user/${user?.id}`);
          setDoctorProfile(docRes.data);
          const consultsRes = await api.get<Consultation[]>(`/api/consultations/doctor/${docRes.data.id}`);
          setRecentConsultations(consultsRes.data.slice(0, 5));
        }

        if (hasRole('ROLE_PATIENT')) {
          const patRes = await api.get<Patient>(`/api/patients/user/${user?.id}`);
          setPatientProfile(patRes.data);
          const consultsRes = await api.get<Consultation[]>(`/api/consultations/patient/${patRes.data.id}`);
          const rembRes = await api.get<Remboursement[]>(`/api/remboursements/patient/${patRes.data.id}`);

          setRecentConsultations(consultsRes.data.slice(0, 5));
          setRecentRemboursements(rembRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données du dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- 1. VIEW FOR ASSUREUR ---
  if (hasRole('ROLE_ASSUREUR')) {
    const chartData = [
      { name: 'Jan', montant: 450 },
      { name: 'Feb', montant: 320 },
      { name: 'Mar', montant: 600 },
      { name: 'Apr', montant: 480 },
      { name: 'May', montant: stats?.totalRemboursed || 120 },
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Bienvenue, {user?.firstName}</h1>
          <p className="text-slate-400 mt-1">Vue d'ensemble de l'activité financière et administrative.</p>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Remboursé</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats?.totalRemboursed?.toLocaleString('fr-CM')} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Montant en attente</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats?.pendingAmount?.toLocaleString('fr-CM')} FCFA</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Assurés Inscrits</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats?.patientsCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Médecins Agréés</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats?.doctorsCount}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
              <Stethoscope size={24} />
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-slate-850 mb-6">Évolution des Remboursements (FCFA)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="montant" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-850 mb-6">Traitement en Attente</h3>
            <div className="space-y-4">
              {recentRemboursements.filter(r => r.status === 'EN_ATTENTE').length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <CheckCircle className="mx-auto text-emerald-500 mb-2" size={36} />
                  <span>Aucune demande en attente.</span>
                </div>
              ) : (
                recentRemboursements
                  .filter(r => r.status === 'EN_ATTENTE')
                  .map((remb) => (
                    <div key={remb.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {remb.feuilleMaladie.consultation.patient.user.firstName} {remb.feuilleMaladie.consultation.patient.user.lastName}
                        </p>
                        <span className="text-xs text-slate-400">{remb.method} • {remb.rate}%</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 text-sm">{remb.amount.toLocaleString('fr-CM')} FCFA</p>
                        <Link to="/remboursements" className="text-xs text-brand-500 hover:underline flex items-center justify-end gap-1 mt-1">
                          Traiter <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. VIEW FOR MEDECIN ---
  if (hasRole('ROLE_MEDECIN')) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dr. {user?.firstName} {user?.lastName}</h1>
            <p className="text-slate-400 mt-1">Espace de consultations - Spécialité : <span className="text-brand-500 font-semibold">{doctorProfile?.specialty}</span></p>
          </div>
          <Link
            to="/consultations"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-300"
          >
            <UserPlus size={18} />
            <span>Nouvelle Consultation</span>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Actes Effectués</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{recentConsultations.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Matricule Praticien</span>
              <p className="text-lg font-bold text-slate-850 mt-1 truncate">{doctorProfile?.matricule}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
              <Shield size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Statut Assuré</span>
              <p className="text-lg font-bold text-slate-850 mt-1">
                {doctorProfile?.isInsured ? "Oui (Profil actif)" : "Non"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        {/* Recent consultations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-850 mb-6">Actes médicaux récents</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 font-semibold">Patient</th>
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold">Motif</th>
                  <th className="py-3 font-semibold">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {recentConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">Aucune consultation enregistrée.</td>
                  </tr>
                ) : (
                  recentConsultations.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-semibold text-slate-800">
                        {c.patient.user.firstName} {c.patient.user.lastName}
                      </td>
                      <td className="py-4 text-slate-500">
                        {new Date(c.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 text-slate-600 font-medium">{c.motif}</td>
                      <td className="py-4 text-slate-400 truncate max-w-xs">{c.observations}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 0. VIEW FOR ADMIN ---
  if (hasRole('ROLE_ADMIN')) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            Administration Système
          </h1>
          <p className="text-slate-400 mt-1 ml-12">
            Bonjour <span className="font-semibold text-slate-600">{user?.firstName}</span> — Espace Super Administrateur CSI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Votre Rôle</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1">Super Admin</p>
              <p className="text-xs text-slate-400 mt-0.5">Accès total au système</p>
            </div>
            <div className="w-14 h-14 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center">
              <Shield size={28} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Compte</span>
              <p className="text-lg font-bold text-slate-800 mt-1">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{user?.email}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Statut Système</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">Opérationnel</p>
              <p className="text-xs text-slate-400 mt-0.5">Tous les services actifs</p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <CheckCircle size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Actions Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/assureurs"
              className="flex items-center gap-4 p-5 rounded-2xl bg-violet-50 border border-violet-100 hover:bg-violet-100 hover:border-violet-200 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white text-violet-500 rounded-xl flex items-center justify-center shadow-sm">
                <Shield size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Gestion des Assureurs</p>
                <p className="text-sm text-slate-500 mt-0.5">Créer, modifier et gérer les comptes assureurs</p>
              </div>
              <ArrowRight size={18} className="ml-auto text-violet-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register"
              className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-white text-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                <UserPlus size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Créer un Compte</p>
                <p className="text-sm text-slate-500 mt-0.5">Enregistrer un nouveau médecin ou assuré</p>
              </div>
              <ArrowRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="font-semibold text-amber-800">Rôle Administrateur</p>
            <p className="text-sm text-amber-700 mt-1">
              En tant qu'administrateur, vous gérez uniquement les comptes assureurs.
              Les assureurs gèrent à leur tour les médecins, patients, consultations et remboursements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. VIEW FOR PATIENT ---
  const totalReimbursedValue = recentRemboursements
    .filter(r => r.status === 'EFFECTUE')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Bonjour, {user?.firstName}</h1>
        <p className="text-slate-400 mt-1">Espace Assuré Social - Suivez vos remboursements et votre dossier.</p>
      </div>

      {/* Patient info boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">N° Sécurité Sociale</span>
            <p className="text-lg font-bold text-slate-850 mt-1">{patientProfile?.socialSecurityNumber}</p>
          </div>
          <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
            <Shield size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Remboursements Reçus</span>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalReimbursedValue.toLocaleString('fr-CM')} FCFA</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Médecin Traitant</span>
            <p className="text-lg font-bold text-slate-850 mt-1 truncate">
              {patientProfile?.medecinTraitant
                ? `Dr. ${patientProfile.medecinTraitant.user.firstName} ${patientProfile.medecinTraitant.user.lastName}`
                : "Non attribué"
              }
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
            <Stethoscope size={24} />
          </div>
        </div>
      </div>

      {/* History tables split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Consultations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-850 mb-6 flex items-center gap-2">
            <FileText size={18} className="text-slate-400" />
            <span>Vos Consultations Récentes</span>
          </h3>
          <div className="space-y-4">
            {recentConsultations.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">Aucune consultation dans votre historique.</p>
            ) : (
              recentConsultations.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Dr. {c.doctor.user.firstName} {c.doctor.user.lastName}</p>
                    <p className="text-xs text-slate-450 mt-0.5">{c.motif}</p>
                    <span className="text-[10px] bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded mt-2 inline-block">
                      {new Date(c.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patient Remboursements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-850 mb-6 flex items-center gap-2">
            <DollarSign size={18} className="text-slate-400" />
            <span>Vos Remboursements</span>
          </h3>
          <div className="space-y-4">
            {recentRemboursements.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">Aucun remboursement trouvé.</p>
            ) : (
              recentRemboursements.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Réf: REMB-{r.id}</span>
                    <p className="font-semibold text-slate-850 text-sm mt-0.5">Taux de prise en charge : {r.rate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{r.amount.toLocaleString('fr-CM')} FCFA</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${r.status === 'EFFECTUE'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                      {r.status === 'EFFECTUE' ? 'Payé' : 'En traitement'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
