import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Patient, Consultation, FeuilleMaladie, Remboursement } from '../types';
import { ArrowLeft, User, Calendar, Activity, FileText, DollarSign, AlertCircle } from 'lucide-react';

interface HistoryData {
  patient: Patient;
  consultations: Consultation[];
  feuillesMaladie: FeuilleMaladie[];
  remboursements: Remboursement[];
}

const PatientHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get<HistoryData>(`/api/patients/${id}/history`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <p className="text-slate-600 mb-4">{error || 'Patient introuvable'}</p>
        <Link to="/patients" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
          Retour aux patients
        </Link>
      </div>
    );
  }

  const { patient, consultations, feuillesMaladie, remboursements } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/patients" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand-500 hover:border-brand-200 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            Dossier Médical: {patient.user.firstName} {patient.user.lastName}
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <User size={14} /> N° SS: <span className="font-mono text-slate-600 font-medium">{patient.socialSecurityNumber}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Infos */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-brand-500" />
              Informations du Patient
            </h2>
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-slate-400">Email</span>
                <span className="font-medium text-slate-700">{patient.user.email}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Sexe</span>
                <span className="font-medium text-slate-700">{patient.user.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400">Contact d'Urgence</span>
                <span className="font-medium text-slate-700">{patient.emergencyContact || 'Non renseigné'}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100">
                <span className="block text-xs text-slate-400">Médecin Traitant</span>
                {patient.medecinTraitant ? (
                  <span className="font-medium text-brand-600">
                    Dr. {patient.medecinTraitant.user.firstName} {patient.medecinTraitant.user.lastName}
                  </span>
                ) : (
                  <span className="text-amber-500 text-sm italic">Non attribué</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              Synthèse
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <span className="block text-2xl font-black text-slate-700">{consultations.length}</span>
                <span className="text-xs text-slate-500">Consultations</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <span className="block text-2xl font-black text-slate-700">{feuillesMaladie.length}</span>
                <span className="text-xs text-slate-500">Feuilles Maladie</span>
              </div>
              <div className="col-span-2 p-4 bg-emerald-50 rounded-xl text-center">
                <span className="block text-2xl font-black text-emerald-600">{remboursements.length}</span>
                <span className="text-xs text-emerald-600 font-medium">Remboursements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Consultations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-500" />
              Historique des Consultations
            </h2>
            {consultations.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucune consultation trouvée.</p>
            ) : (
              <div className="space-y-4">
                {consultations.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-slate-800">
                        {new Date(c.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-brand-50 text-brand-600 rounded-lg">
                        Dr. {c.doctor.user.lastName}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600"><span className="font-medium">Motif:</span> {c.motif}</p>
                    {c.observations && <p className="text-sm text-slate-500 mt-1"><span className="font-medium">Obs:</span> {c.observations}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feuilles de Maladie */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Feuilles de Maladie
            </h2>
            {feuillesMaladie.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucune feuille de maladie.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Médecin</th>
                      <th className="pb-3 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {feuillesMaladie.map(fm => (
                      <tr key={fm.id}>
                        <td className="py-3 text-slate-700">{new Date(fm.date).toLocaleDateString()}</td>
                        <td className="py-3 text-slate-600">Dr. {fm.consultation.doctor.user.lastName}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            fm.status === 'VALIDEE' ? 'bg-emerald-50 text-emerald-600' :
                            fm.status === 'REFUSEE' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {fm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Remboursements */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-500" />
              Historique des Remboursements
            </h2>
            {remboursements.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucun remboursement.</p>
            ) : (
              <div className="space-y-3">
                {remboursements.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-emerald-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{r.amount.toLocaleString('fr-CM')} FCFA</p>
                        <p className="text-xs text-slate-500">Taux: {r.rate}% • {r.method}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === 'EFFECTUE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
