import { useState, useEffect } from 'react';
import api from '../services/api';
import { Remboursement, Patient, Doctor } from '../types';
import {
  BarChart3, TrendingUp, Users, CreditCard,
  DollarSign, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#22c55e', '#6366f1', '#f59e0b', '#ef4444'];

const Reports: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, rembRes, patRes, docRes] = await Promise.all([
          api.get('/api/remboursements/summary'),
          api.get<Remboursement[]>('/api/remboursements'),
          api.get<Patient[]>('/api/patients'),
          api.get<Doctor[]>('/api/doctors'),
        ]);
        setSummary(sumRes.data);
        setRemboursements(rembRes.data);
        setPatients(patRes.data);
        setDoctors(docRes.data);
      } catch (err) {
        console.error('Erreur chargement rapports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build per-doctor remboursement chart data
  const perDoctorData = doctors.map(doc => {
    const total = remboursements
      .filter(r => r.feuilleMaladie.consultation.doctor.id === doc.id)
      .reduce((s, r) => s + r.amount, 0);
    return {
      name: `Dr. ${doc.user.lastName}`,
      montant: parseFloat(total.toFixed(2)),
      specialite: doc.specialty,
    };
  }).filter(d => d.montant > 0);

  // Build per-patient remboursement chart data (top 5)
  const perPatientData = patients.map(pat => {
    const total = remboursements
      .filter(r => r.feuilleMaladie.consultation.patient.id === pat.id)
      .reduce((s, r) => s + r.amount, 0);
    return { name: `${pat.user.firstName} ${pat.user.lastName}`, montant: parseFloat(total.toFixed(2)) };
  }).filter(d => d.montant > 0).sort((a, b) => b.montant - a.montant).slice(0, 6);

  // Pie data: Statut des remboursements
  const effectueCount = remboursements.filter(r => r.status === 'EFFECTUE').length;
  const enAttenteCount = remboursements.filter(r => r.status === 'EN_ATTENTE').length;
  const pieData = [
    { name: 'Effectués', value: effectueCount },
    { name: 'En attente', value: enAttenteCount },
  ].filter(d => d.value > 0);

  // Method split
  const virementCount = remboursements.filter(r => r.method === 'VIREMENT').length;
  const cashCount = remboursements.filter(r => r.method === 'CASH').length;
  const methodData = [
    { name: 'Virement', value: virementCount },
    { name: 'Cash', value: cashCount },
  ].filter(d => d.value > 0);

  // Anomaly detection: patients with more than 3 pending remboursements
  const patientPendingCounts = patients.map(pat => ({
    patient: pat,
    pending: remboursements.filter(
      r => r.feuilleMaladie.consultation.patient.id === pat.id && r.status === 'EN_ATTENTE'
    ).length,
  })).filter(d => d.pending >= 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
          Rapports & Statistiques
        </h1>
        <p className="text-slate-400 mt-1 ml-12">Synthèse financière et suivi opérationnel de l'organisme.</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Remboursé', value: `${(summary?.totalRemboursed || 0).toLocaleString('fr-CM')} FCFA`, icon: <DollarSign size={22} />, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'En Attente', value: `${(summary?.pendingAmount || 0).toLocaleString('fr-CM')} FCFA`, icon: <CreditCard size={22} />, color: 'text-amber-500 bg-amber-50' },
          { label: 'Assurés', value: patients.length, icon: <Users size={22} />, color: 'text-blue-500 bg-blue-50' },
          { label: 'Médecins', value: doctors.length, icon: <TrendingUp size={22} />, color: 'text-indigo-500 bg-indigo-50' },
        ].map(k => (
          <div key={k.label} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>{k.icon}</div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{k.label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Per-Doctor Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-1">Remboursements par Médecin (FCFA)</h3>
          <p className="text-xs text-slate-400 mb-6">Montant total remboursé par praticien dans le réseau</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perDoctorData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tick={{ fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  formatter={(v: any) => [`${v} FCFA`, 'Montant']}
                />
                <Bar dataKey="montant" radius={[6, 6, 0, 0]}>
                  {perDoctorData.map((entry, i) => (
                    <Cell key={i} fill={entry.specialite === 'GENERALISTE' ? '#22c55e' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center text-xs text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-brand-500"></div> Généraliste (100%)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-500"></div> Spécialiste (80%)</div>
          </div>
        </div>

        {/* Statut Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Statut des Dossiers</h3>
          <p className="text-xs text-slate-400 mb-4">Répartition des remboursements par statut</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Mode split */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Par Mode de Paiement</p>
            {methodData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i + 2] }}></div>
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Patient Chart */}
      {perPatientData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Top Patients — Remboursements (FCFA)</h3>
          <p className="text-xs text-slate-400 mb-6">Les 6 patients bénéficiant des montants les plus élevés</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perPatientData} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={140} tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  formatter={(v: any) => [`${v} FCFA`, 'Montant']}
                />
                <Bar dataKey="montant" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Anomaly Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <AlertTriangle size={17} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Alertes & Anomalies</h3>
            <p className="text-xs text-slate-400">Patients avec 2 remboursements ou plus en attente de traitement</p>
          </div>
        </div>
        {patientPendingCounts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <p>Aucune anomalie détectée. Tous les dossiers sont à jour.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientPendingCounts.map(({ patient, pending }) => (
              <div key={patient.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-800">{patient.user.firstName} {patient.user.lastName}</p>
                  <p className="text-xs text-slate-400">N° SS : {patient.socialSecurityNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-600 font-bold text-sm">{pending} dossier(s)</span>
                  <p className="text-xs text-amber-500">en attente de traitement</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
