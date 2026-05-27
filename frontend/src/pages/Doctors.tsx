import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Doctor } from '../types';
import { Stethoscope, Search, Trash2, AlertCircle, UserCheck, Badge } from 'lucide-react';
import { Link } from 'react-router-dom';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'GENERALISTE' | 'SPECIALISTE'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get<Doctor[]>('/api/doctors');
      setDoctors(res.data);
    } catch {
      flash('Impossible de charger la liste des médecins.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Supprimer le Dr. ${name} ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/api/doctors/${id}`);
      setDoctors(prev => prev.filter(d => d.id !== id));
      flash('Médecin supprimé avec succès.', 'success');
    } catch (err: any) {
      flash(err.response?.data?.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  const flash = (message: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccessMsg(message); setTimeout(() => setSuccessMsg(null), 3500); }
    else { setError(message); setTimeout(() => setError(null), 4000); }
  };

  const filtered = doctors.filter(d => {
    const term = search.toLowerCase();
    const matchesSearch =
      d.user.firstName.toLowerCase().includes(term) ||
      d.user.lastName.toLowerCase().includes(term) ||
      d.matricule.toLowerCase().includes(term);
    const matchesFilter = filter === 'ALL' || d.specialty === filter;
    return matchesSearch && matchesFilter;
  });

  const generalistCount = doctors.filter(d => d.specialty === 'GENERALISTE').length;
  const specialistCount = doctors.filter(d => d.specialty === 'SPECIALISTE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            Gestion des Médecins
          </h1>
          <p className="text-slate-400 mt-1 ml-12">{doctors.length} médecin(s) agréé(s) dans le réseau.</p>
        </div>
        <Link
          to="/register"
          className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 text-sm"
        >
          <Stethoscope size={18} />
          <span>Enregistrer un médecin</span>
        </Link>
      </div>

      {/* KPI boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Médecins', value: doctors.length, color: 'bg-slate-50 border-slate-200 text-slate-600' },
          { label: 'Généralistes', value: generalistCount, color: 'bg-brand-50 border-brand-100 text-brand-600' },
          { label: 'Spécialistes', value: specialistCount, color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
        ].map(kpi => (
          <div key={kpi.label} className={`flex items-center justify-between p-5 rounded-2xl border ${kpi.color} bg-white shadow-sm`}>
            <span className="text-sm font-semibold text-slate-500">{kpi.label}</span>
            <span className="text-3xl font-extrabold text-slate-900">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" /><span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm">
          <UserCheck size={18} className="shrink-0" /><span>{successMsg}</span>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300 shadow-sm"
          />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm gap-1">
          {(['ALL', 'GENERALISTE', 'SPECIALISTE'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === opt ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt === 'ALL' ? 'Tous' : opt === 'GENERALISTE' ? 'Généralistes' : 'Spécialistes'}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-slate-400">
              <Stethoscope size={32} className="mx-auto mb-2 opacity-30" />
              <p>Aucun médecin trouvé.</p>
            </div>
          ) : (
            filtered.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                      doc.specialty === 'GENERALISTE'
                        ? 'bg-brand-100 text-brand-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {doc.user.firstName[0]}{doc.user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Dr. {doc.user.firstName} {doc.user.lastName}</p>
                      <p className="text-xs text-slate-400">{doc.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id, `${doc.user.firstName} ${doc.user.lastName}`)}
                    className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Matricule</span>
                    <span className="font-mono font-semibold text-slate-700">{doc.matricule}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Spécialité</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      doc.specialty === 'GENERALISTE'
                        ? 'bg-brand-50 text-brand-600 border border-brand-100'
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    }`}>
                      {doc.specialty}
                    </span>
                  </div>
                  {doc.isInsured && (
                    <div className="flex items-center gap-2 mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                      <Badge size={14} className="text-amber-500 shrink-0" />
                      <span className="text-xs text-amber-600 font-medium">Médecin également assuré</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Doctors;
