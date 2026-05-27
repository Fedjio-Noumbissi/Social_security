import { useState, useEffect } from 'react';
import api from '../services/api';
import { Patient, Doctor } from '../types';
import {
  Users, Search, Plus, Trash2, X,
  UserCheck, Stethoscope, AlertCircle, Eye, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [generalists, setGeneralists] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsRes, docsRes] = await Promise.all([
        api.get<Patient[]>('/api/patients'),
        api.get<Doctor[]>('/api/doctors/specialty/GENERALISTE'),
      ]);
      setPatients(patientsRes.data);
      setGeneralists(docsRes.data);
    } catch (err) {
      console.error('Erreur chargement patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Supprimer le patient ${name} ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/api/patients/${id}`);
      setPatients(prev => prev.filter(p => p.id !== id));
      flash('Patient supprimé avec succès.', 'success');
    } catch (err: any) {
      flash(err.response?.data?.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedPatient) return;
    try {
      const doctorId = selectedDoctorId ? parseInt(selectedDoctorId) : null;
      const url = doctorId
        ? `/api/patients/${selectedPatient.id}/assign-doctor?doctorId=${doctorId}`
        : `/api/patients/${selectedPatient.id}/assign-doctor`;
      await api.put(url);
      flash('Médecin traitant mis à jour.', 'success');
      setShowAssignModal(false);
      fetchData();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Erreur lors de l\'assignation.', 'error');
    }
  };

  const flash = (message: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccessMsg(message); setTimeout(() => setSuccessMsg(null), 3500); }
    else { setError(message); setTimeout(() => setError(null), 4000); }
  };

  const filtered = patients.filter(p => {
    const term = search.toLowerCase();
    return (
      p.user.firstName.toLowerCase().includes(term) ||
      p.user.lastName.toLowerCase().includes(term) ||
      p.socialSecurityNumber.includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            Gestion des Assurés
          </h1>
          <p className="text-slate-400 mt-1 ml-12">{patients.length} patient(s) enregistré(s) dans le système.</p>
        </div>
        <Link
          to="/register"
          className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-300 text-sm"
        >
          <Plus size={18} />
          <span>Inscrire un assuré</span>
        </Link>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm">
          <UserCheck size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou numéro de sécurité sociale…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Assuré</th>
                  <th className="px-6 py-4 font-semibold">N° SS</th>
                  <th className="px-6 py-4 font-semibold">Médecin Traitant</th>
                  <th className="px-6 py-4 font-semibold">Contact d'Urgence</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Aucun patient trouvé.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(patient => (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                            {patient.user.firstName[0]}{patient.user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {patient.user.firstName} {patient.user.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{patient.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-slate-600">{patient.socialSecurityNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        {patient.medecinTraitant ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Stethoscope size={14} className="text-brand-500" />
                            <span className="text-slate-700 font-medium">
                              Dr. {patient.medecinTraitant.user.firstName} {patient.medecinTraitant.user.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg font-medium">
                            Non attribué
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {patient.emergencyContact ? (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={12} className="shrink-0" />
                            <span className="truncate max-w-[150px]">{patient.emergencyContact}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedPatient(patient); setSelectedDoctorId(patient.medecinTraitant?.id.toString() || ''); setShowAssignModal(true); }}
                            title="Assigner médecin traitant"
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors"
                          >
                            <Stethoscope size={16} />
                          </button>
                          <Link
                            to={`/patients/${patient.id}/history`}
                            title="Voir l'historique médical"
                            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(patient.id, `${patient.user.firstName} ${patient.user.lastName}`)}
                            title="Supprimer ce patient"
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Doctor Modal */}
      {showAssignModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200/80 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Attribuer un Médecin Traitant</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Patient : <strong>{selectedPatient.user.firstName} {selectedPatient.user.lastName}</strong>
                </p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sélectionner un Médecin Généraliste
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="">-- Aucun médecin traitant --</option>
                  {generalists.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.user.firstName} {doc.user.lastName} ({doc.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
                ℹ️ Conformément au règlement, le médecin traitant doit obligatoirement être un <strong>médecin généraliste</strong>.
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignDoctor}
                className="flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow shadow-brand-500/20 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
