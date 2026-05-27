import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Remboursement } from '../types';
import {
  CreditCard, CheckCircle, Clock, AlertCircle,
  Printer, X, Building2, Banknote
} from 'lucide-react';

const Remboursements: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRemb, setSelectedRemb] = useState<Remboursement | null>(null);
  const [method, setMethod] = useState<'VIREMENT' | 'CASH'>('CASH');
  const [bankAccount, setBankAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<Remboursement | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const flash = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 4000); }
    else { setError(msg); setTimeout(() => setError(null), 5000); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (hasRole('ROLE_ASSUREUR')) {
        const res = await api.get<Remboursement[]>('/api/remboursements');
        setRemboursements(res.data);
      } else if (hasRole('ROLE_PATIENT')) {
        const patRes = await api.get(`/api/patients/user/${user?.id}`);
        const res = await api.get<Remboursement[]>(`/api/remboursements/patient/${patRes.data.id}`);
        setRemboursements(res.data);
      }
    } catch {
      flash('Impossible de charger les remboursements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProcess = async () => {
    if (!selectedRemb) return;
    if (method === 'VIREMENT' && !bankAccount.trim()) {
      flash('Le numéro de compte (RIB) est obligatoire pour un virement.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.put<Remboursement>(
        `/api/remboursements/${selectedRemb.id}/process`,
        { method, bankAccount: method === 'VIREMENT' ? bankAccount : null }
      );
      flash('Remboursement effectué avec succès !', 'success');
      setShowProcessModal(false);
      setInvoiceData(res.data);
      setShowInvoice(true);
      fetchData();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Erreur lors du traitement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    const printContents = invoiceRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Facture de Remboursement - CSI</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
            .badge-green { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-row td { font-weight: 700; font-size: 16px; color: #16a34a; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const pendingCount = remboursements.filter(r => r.status === 'EN_ATTENTE').length;
  const totalEffectue = remboursements.filter(r => r.status === 'EFFECTUE').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          Remboursements
        </h1>
        <p className="text-slate-400 mt-1 ml-12">
          {hasRole('ROLE_ASSUREUR') ? `Gestion de ${remboursements.length} remboursement(s).` : `Vos ${remboursements.length} remboursement(s).`}
        </p>
      </div>

      {/* KPIs */}
      {hasRole('ROLE_ASSUREUR') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Versé</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalEffectue.toLocaleString('fr-CM')} FCFA</p></div>
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">En Attente</p>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">{pendingCount}</p></div>
            <Clock size={28} className="text-amber-400" />
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div><p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Dossiers</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{remboursements.length}</p></div>
            <CreditCard size={28} className="text-violet-400" />
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" /><span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm">
          <CheckCircle size={18} className="shrink-0" /><span>{successMsg}</span>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Référence</th>
                  <th className="px-6 py-4 font-semibold">Patient</th>
                  <th className="px-6 py-4 font-semibold">Médecin</th>
                  <th className="px-6 py-4 font-semibold">Taux</th>
                  <th className="px-6 py-4 font-semibold">Montant</th>
                  <th className="px-6 py-4 font-semibold">Mode</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  {hasRole('ROLE_ASSUREUR') && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {remboursements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Aucun remboursement trouvé.</p>
                    </td>
                  </tr>
                ) : (
                  remboursements.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600 font-semibold">REMB-{r.id.toString().padStart(4, '0')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 text-sm">
                          {r.feuilleMaladie.consultation.patient.user.firstName} {r.feuilleMaladie.consultation.patient.user.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{r.feuilleMaladie.consultation.patient.socialSecurityNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          Dr. {r.feuilleMaladie.consultation.doctor.user.firstName} {r.feuilleMaladie.consultation.doctor.user.lastName}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${r.feuilleMaladie.consultation.doctor.specialty === 'GENERALISTE'
                          ? 'bg-brand-50 text-brand-600 border-brand-100'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>{r.feuilleMaladie.consultation.doctor.specialty}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{r.rate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-emerald-600">{r.amount.toLocaleString('fr-CM')} FCFA</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          {r.method === 'VIREMENT' ? <Building2 size={14} className="text-blue-500" /> : <Banknote size={14} className="text-emerald-500" />}
                          <span className="font-medium">{r.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${r.status === 'EFFECTUE'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {r.status === 'EFFECTUE' ? '✓ Effectué' : '⏳ En attente'}
                        </span>
                      </td>
                      {hasRole('ROLE_ASSUREUR') && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {r.status === 'EN_ATTENTE' && (
                              <button
                                onClick={() => { setSelectedRemb(r); setMethod('CASH'); setBankAccount(''); setShowProcessModal(true); }}
                                className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-brand-500/20 transition-colors"
                              >
                                Traiter
                              </button>
                            )}
                            {r.status === 'EFFECTUE' && (
                              <button
                                onClick={() => { setInvoiceData(r); setShowInvoice(true); }}
                                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                                title="Imprimer la facture"
                              >
                                <Printer size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {showProcessModal && selectedRemb && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
          className="bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200/80 animate-fade-in max-h-[95vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Traiter le Remboursement</h3>
                <p className="text-sm text-slate-400 mt-1">
                  REMB-{selectedRemb.id.toString().padStart(4, '0')} — Montant : <span className="font-bold text-emerald-600">{selectedRemb.amount.toLocaleString('fr-CM')} FCFA</span>
                </p>
              </div>
              <button onClick={() => setShowProcessModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Patient Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                <p className="text-slate-500 mb-1">Bénéficiaire</p>
                <p className="font-bold text-slate-900">
                  {selectedRemb.feuilleMaladie.consultation.patient.user.firstName} {selectedRemb.feuilleMaladie.consultation.patient.user.lastName}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  N° SS : {selectedRemb.feuilleMaladie.consultation.patient.socialSecurityNumber}
                </p>
              </div>

              {/* Method Choice */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Mode de Remboursement *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['CASH', 'VIREMENT'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${method === m
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      {m === 'CASH' ? <Banknote size={20} /> : <Building2 size={20} />}
                      <div>
                        <p className="font-semibold text-sm">{m === 'CASH' ? 'Espèces' : 'Virement'}</p>
                        <p className="text-xs opacity-70">{m === 'CASH' ? 'Paiement direct' : 'Compte bancaire'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {method === 'VIREMENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">RIB / Coordonnées Bancaires *</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="CM21 XXXXX XXXXX XXXXXXXXXXX XX"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleProcess}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow shadow-brand-500/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Traitement…</span></>
                    : <span>Confirmer le Remboursement</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Invoice Modal */}
      {showInvoice && invoiceData && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
          className="bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200/80 animate-fade-in flex flex-col max-h-[95vh] relative z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900">Facture de Remboursement</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Printer size={15} />
                  Imprimer
                </button>
                <button onClick={() => setShowInvoice(false)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div ref={invoiceRef} className="p-8 overflow-y-auto">
              <div className="invoice-header flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">🛡️ CSI Sécurité Sociale</h2>
                  <p className="text-slate-400 text-sm mt-1">École Nationale Supérieure Polytechnique de Yaoundé</p>
                  <p className="text-slate-400 text-xs">B.P. 8390 Yaoundé — Tél : 222 22.45.47</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">N° Facture</p>
                  <p className="font-mono font-bold text-slate-800 text-lg">REMB-{invoiceData.id.toString().padStart(6, '0')}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Date : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <span className="badge badge-green inline-block mt-2">✓ EFFECTUÉ</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Émetteur</p>
                  <p className="font-bold text-slate-800">Organisme de Sécurité Sociale — CSI</p>
                  <p className="text-sm text-slate-500">Service des remboursements médicaux</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bénéficiaire</p>
                  <p className="font-bold text-slate-800">
                    {invoiceData.feuilleMaladie.consultation.patient.user.firstName} {invoiceData.feuilleMaladie.consultation.patient.user.lastName}
                  </p>
                  <p className="text-sm text-slate-500">N° SS : {invoiceData.feuilleMaladie.consultation.patient.socialSecurityNumber}</p>
                </div>
              </div>

              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold border-b border-slate-200">Description</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-slate-200">Médecin</th>
                    <th className="px-4 py-3 text-center font-semibold border-b border-slate-200">Taux</th>
                    <th className="px-4 py-3 text-right font-semibold border-b border-slate-200">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-4 border-b border-slate-100">
                      Remboursement de consultation médicale
                      <br />
                      <span className="text-xs text-slate-400">
                        Motif : {invoiceData.feuilleMaladie.consultation.motif}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-b border-slate-100">
                      Dr. {invoiceData.feuilleMaladie.consultation.doctor.user.firstName} {invoiceData.feuilleMaladie.consultation.doctor.user.lastName}
                      <br />
                      <span className="text-xs text-slate-400">{invoiceData.feuilleMaladie.consultation.doctor.specialty}</span>
                    </td>
                    <td className="px-4 py-4 border-b border-slate-100 text-center font-bold">{invoiceData.rate}%</td>
                    <td className="px-4 py-4 border-b border-slate-100 text-right font-bold text-emerald-600">{invoiceData.amount.toLocaleString('fr-CM')} FCFA</td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td colSpan={3} className="px-4 py-4 text-right font-bold text-slate-800">Total Remboursé</td>
                    <td className="px-4 py-4 text-right font-extrabold text-emerald-600 text-lg">{invoiceData.amount.toLocaleString('fr-CM')} FCFA</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Mode de Paiement</p>
                  <p className="font-bold text-slate-800">{invoiceData.method}</p>
                </div>
                {invoiceData.bankAccount && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">RIB Bénéficiaire</p>
                    <p className="font-mono font-semibold text-slate-700">{invoiceData.bankAccount}</p>
                  </div>
                )}
              </div>

              <div className="footer mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
                <p>Ce document constitue une preuve officielle de remboursement délivrée par CSI Sécurité Sociale.</p>
                <p className="mt-1">Toute contestation doit être signalée sous 30 jours à compter de la date d'émission.</p>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default Remboursements;
