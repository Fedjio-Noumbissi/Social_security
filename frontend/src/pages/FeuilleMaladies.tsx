import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FeuilleMaladie, Doctor, Patient } from '../types';
import {
  FileText, Search, AlertCircle, UserCheck,
  Clock, CheckCircle2, XCircle, Stethoscope, Calendar
} from 'lucide-react';

const STATUS_CONFIG = {
  EN_ATTENTE: { label: 'En Attente', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock },
  VALIDEE:    { label: 'Validée',    color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
  REFUSEE:    { label: 'Refusée',   color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle },
};

const FeuilleMaladies: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [feuilles, setFeuilles] = useState<FeuilleMaladie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const flash = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500); }
    else { setError(msg); setTimeout(() => setError(null), 4000); }
  };

  const fetchFeuilles = async () => {
    setLoading(true);
    try {
      if (hasRole('ROLE_ASSUREUR') || hasRole('ROLE_MEDECIN')) {
        const res = await api.get<FeuilleMaladie[]>('/api/feuilles-maladie');
        setFeuilles(res.data);
      } else if (hasRole('ROLE_PATIENT')) {
        const patRes = await api.get<Patient>(`/api/patients/user/${user?.id}`);
        const res = await api.get<FeuilleMaladie[]>(`/api/feuilles-maladie/patient/${patRes.data.id}`);
        setFeuilles(res.data);
      } else if (hasRole('ROLE_MEDECIN')) {
        const docRes = await api.get<Doctor>(`/api/doctors/user/${user?.id}`);
        const res = await api.get<FeuilleMaladie[]>(`/api/feuilles-maladie/doctor/${docRes.data.id}`);
        setFeuilles(res.data);
      }
    } catch {
      flash('Impossible de charger les feuilles de maladie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeuilles(); }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/api/feuilles-maladie/${id}/status?status=${newStatus}`);
      setFeuilles(prev => prev.map(f => f.id === id ? { ...f, status: newStatus as any } : f));
      flash(`Statut mis à jour : ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label}`, 'success');
    } catch (err: any) {
      flash(err.response?.data?.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = feuilles.filter(f => {
    const term = search.toLowerCase();
    const patName = `${f.consultation.patient.user.firstName} ${f.consultation.patient.user.lastName}`.toLowerCase();
    const docName = `${f.consultation.doctor.user.firstName} ${f.consultation.doctor.user.lastName}`.toLowerCase();
    const matchSearch = !term || patName.includes(term) || docName.includes(term);
    const matchStatus = filterStatus === 'ALL' || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const enAttenteCount = feuilles.filter(f => f.status === 'EN_ATTENTE').length;
  const valideeCount = feuilles.filter(f => f.status === 'VALIDEE').length;
  const refuseeCount = feuilles.filter(f => f.status === 'REFUSEE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            Feuilles de Maladie
          </h1>
          <p className="text-slate-400 mt-1 ml-12">{feuilles.length} feuille(s) de maladie dans le système.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'En Attente',  value: enAttenteCount, color: 'bg-amber-50 border-amber-100 text-amber-600',   icon: Clock,         filter: 'EN_ATTENTE' },
          { label: 'Validées',    value: valideeCount,   color: 'bg-emerald-50 border-emerald-100 text-emerald-600', icon: CheckCircle2, filter: 'VALIDEE' },
          { label: 'Refusées',    value: refuseeCount,   color: 'bg-red-50 border-red-100 text-red-600',          icon: XCircle,       filter: 'REFUSEE' },
        ].map(kpi => (
          <button
            key={kpi.label}
            onClick={() => setFilterStatus(filterStatus === kpi.filter as any ? 'ALL' : kpi.filter as any)}
            className={`flex items-center justify-between p-5 rounded-2xl border ${kpi.color} bg-white shadow-sm hover:shadow-md transition-all duration-200 ${filterStatus === kpi.filter ? 'ring-2 ring-offset-2 ring-current' : ''}`}
          >
            <div className="text-left">
              <span className="text-sm font-semibold opacity-80">{kpi.label}</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{kpi.value}</p>
            </div>
            <kpi.icon size={28} />
          </button>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou médecin…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm gap-1">
          {(['ALL', 'EN_ATTENTE', 'VALIDEE', 'REFUSEE'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filterStatus === s ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s === 'ALL' ? 'Toutes' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
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
                  <th className="px-6 py-4 font-semibold">Patient</th>
                  <th className="px-6 py-4 font-semibold">Médecin</th>
                  <th className="px-6 py-4 font-semibold">Motif Consultation</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  {hasRole('ROLE_ASSUREUR') && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Aucune feuille de maladie trouvée.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(f => {
                    const cfg = STATUS_CONFIG[f.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = cfg?.icon || Clock;
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                              {f.consultation.patient.user.firstName[0]}{f.consultation.patient.user.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">
                                {f.consultation.patient.user.firstName} {f.consultation.patient.user.lastName}
                              </p>
                              <p className="text-xs text-slate-400">{f.consultation.patient.socialSecurityNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Stethoscope size={14} className="text-brand-500 shrink-0" />
                            <div>
                              <span className="font-medium text-slate-700">
                                Dr. {f.consultation.doctor.user.firstName} {f.consultation.doctor.user.lastName}
                              </span>
                              <p className="text-xs text-slate-400">{f.consultation.doctor.specialty}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 line-clamp-1 max-w-[200px]">{f.consultation.motif}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar size={13} />
                            <span>{new Date(f.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg?.color}`}>
                            <StatusIcon size={12} />
                            {cfg?.label}
                          </span>
                        </td>
                        {hasRole('ROLE_ASSUREUR') && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {f.status === 'EN_ATTENTE' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(f.id, 'VALIDEE')}
                                    disabled={updatingId === f.id}
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                  >
                                    {updatingId === f.id ? '…' : 'Valider'}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(f.id, 'REFUSEE')}
                                    disabled={updatingId === f.id}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                  >
                                    Refuser
                                  </button>
                                </>
                              )}
                              {f.status !== 'EN_ATTENTE' && (
                                <button
                                  onClick={() => handleUpdateStatus(f.id, 'EN_ATTENTE')}
                                  disabled={updatingId === f.id}
                                  className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                >
                                  Réinitialiser
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeuilleMaladies;
