import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Patient, Doctor, Consultation } from '../types';
import {
  FileText, Plus, X, AlertCircle, UserCheck,
  Calendar, Stethoscope, Pill, ClipboardList, CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Consultations: React.FC = () => {
  const { user, hasRole } = useAuth();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [specialists, setSpecialists] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [motif, setMotif] = useState('');
  const [observations, setObservations] = useState('');
  const [medicaments, setMedicaments] = useState([{ name: '', dosage: '', durationDays: 7 }]);
  const [specialtyNeeded, setSpecialtyNeeded] = useState('');
  const [specialistReason, setSpecialistReason] = useState('');
  const [referredDoctorId, setReferredDoctorId] = useState('');

  const flash = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 4000); }
    else { setError(msg); setTimeout(() => setError(null), 5000); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (hasRole('ROLE_MEDECIN')) {
        const docRes = await api.get<Doctor>(`/api/doctors/user/${user?.id}`);
        const consultsRes = await api.get<Consultation[]>(`/api/consultations/doctor/${docRes.data.id}`);
        const patientsRes = await api.get<Patient[]>('/api/patients');
        const specsRes = await api.get<Doctor[]>('/api/doctors/specialty/SPECIALISTE');
        setConsultations(consultsRes.data);
        setPatients(patientsRes.data);
        setSpecialists(specsRes.data);
      } else if (hasRole('ROLE_PATIENT')) {
        const patRes = await api.get<Patient>(`/api/patients/user/${user?.id}`);
        const consultsRes = await api.get<Consultation[]>(`/api/consultations/patient/${patRes.data.id}`);
        setConsultations(consultsRes.data);
      }
    } catch (err) {
      flash('Erreur lors du chargement des données.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addMedicament = () => setMedicaments(prev => [...prev, { name: '', dosage: '', durationDays: 7 }]);
  const removeMedicament = (i: number) => setMedicaments(prev => prev.filter((_, idx) => idx !== i));
  const updateMedicament = (i: number, field: string, value: string | number) => {
    setMedicaments(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { flash('Veuillez sélectionner un patient.', 'error'); return; }
    setSubmitting(true);
    try {
      const validMeds = medicaments.filter(m => m.name.trim() && m.dosage.trim());
      const payload: any = {
        patientId: parseInt(patientId),
        date, motif, observations,
        medicaments: validMeds.length > 0 ? validMeds : null,
      };
      if (specialtyNeeded.trim()) {
        payload.specialtyNeeded = specialtyNeeded;
        payload.specialistReason = specialistReason;
        if (referredDoctorId) payload.referredDoctorId = parseInt(referredDoctorId);
      }
      await api.post('/api/consultations', payload);
      flash('Consultation enregistrée avec succès. Feuille de maladie et remboursement générés automatiquement.', 'success');
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      flash(err.response?.data?.message || "Erreur lors de l'enregistrement.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPatientId(''); setDate(new Date().toISOString().slice(0, 16));
    setMotif(''); setObservations('');
    setMedicaments([{ name: '', dosage: '', durationDays: 7 }]);
    setSpecialtyNeeded(''); setSpecialistReason(''); setReferredDoctorId('');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            Consultations Médicales
          </h1>
          <p className="text-slate-400 mt-1 ml-10 sm:ml-12 text-sm">
            {consultations.length} acte(s) médical(aux) enregistré(s).
          </p>
        </div>
        {hasRole('ROLE_MEDECIN') && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-300 text-sm"
          >
            <Plus size={16} />
            <span>Nouvelle Consultation</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-3 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm">
          <UserCheck size={16} className="shrink-0 mt-0.5" /><span>{successMsg}</span>
        </div>
      )}

      {/* Consultations List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {consultations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-12 sm:py-16 text-center text-slate-400">
              <FileText size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune consultation enregistrée.</p>
            </div>
          ) : (
            consultations.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 hover:border-brand-200 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                      <Stethoscope size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                          {hasRole('ROLE_MEDECIN')
                            ? `${c.patient.user.firstName} ${c.patient.user.lastName}`
                            : `Dr. ${c.doctor.user.firstName} ${c.doctor.user.lastName}`}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium shrink-0 ${c.doctor.specialty === 'GENERALISTE'
                            ? 'bg-brand-50 text-brand-600 border-brand-100'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                          {c.doctor.specialty}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{c.motif}</p>
                      {c.observations && (
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">{c.observations}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pl-0 sm:pl-14">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
                      <Calendar size={13} />
                      <span>{new Date(c.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                    {(hasRole('ROLE_PATIENT') || hasRole('ROLE_ASSUREUR')) && (
                      <Link
                        to="/remboursements"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <CreditCard size={12} />
                        Voir Remboursement
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL RESPONSIVE */}
      {showForm && hasRole('ROLE_MEDECIN') && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
          className="bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetForm(); } }}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center p-2 sm:p-4 py-4 sm:py-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200/80 animate-fade-in relative z-10">

              {/* Header */}
              <div className="flex items-start sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 rounded-t-2xl gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">Enregistrer une Consultation</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">La feuille de maladie et le remboursement seront générés automatiquement.</p>
                </div>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">

                {/* Section 1 */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList size={13} /> Informations de la Consultation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient *</label>
                      <select
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      >
                        <option value="">-- Sélectionner un patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.user.firstName} {p.user.lastName} — {p.socialSecurityNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Date et Heure *</label>
                      <input
                        type="datetime-local"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Motif de Consultation *</label>
                    <input
                      type="text"
                      value={motif}
                      onChange={e => setMotif(e.target.value)}
                      required
                      placeholder="Fièvre, toux persistante, bilan annuel…"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Observations Cliniques</label>
                    <textarea
                      value={observations}
                      onChange={e => setObservations(e.target.value)}
                      rows={3}
                      placeholder="Description des symptômes, résultats d'examens, recommandations…"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Pill size={13} /> Ordonnance Médicaments
                    </h4>
                    <button
                      type="button"
                      onClick={addMedicament}
                      className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={12} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {medicaments.map((med, i) => (
                      <div key={i} className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_80px_auto] gap-2 items-start">
                        <input
                          type="text"
                          placeholder="Nom (ex: Doliprane)"
                          value={med.name}
                          onChange={e => updateMedicament(i, 'name', e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Posologie (ex: 1cp/6h)"
                          value={med.dosage}
                          onChange={e => updateMedicament(i, 'dosage', e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-all"
                        />
                        <div className="relative w-full sm:w-auto">
                          <input
                            type="number"
                            min={1}
                            placeholder="Jours"
                            value={med.durationDays}
                            onChange={e => updateMedicament(i, 'durationDays', parseInt(e.target.value))}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-all"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">j</span>
                        </div>
                        {medicaments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicament(i)}
                            className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-3 bg-indigo-50/50 p-3 sm:p-4 rounded-xl border border-indigo-100/80">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Stethoscope size={13} /> Prescription Spécialiste (Optionnel)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Spécialité requise (ex: Cardiologie)"
                      value={specialtyNeeded}
                      onChange={e => setSpecialtyNeeded(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-indigo-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all"
                    />
                    <select
                      value={referredDoctorId}
                      onChange={e => setReferredDoctorId(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-indigo-200/80 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-400 transition-all"
                    >
                      <option value="">-- Spécialiste référent (optionnel) --</option>
                      {specialists.map(s => (
                        <option key={s.id} value={s.id}>
                          Dr. {s.user.firstName} {s.user.lastName} ({s.matricule})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Motif de référence vers le spécialiste…"
                    value={specialistReason}
                    onChange={e => setSpecialistReason(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-indigo-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="w-full sm:flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow shadow-brand-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Enregistrement…</span></>
                      : <span>Enregistrer la Consultation</span>
                    }
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      , document.body)}

    </div>
  );
};

export default Consultations;