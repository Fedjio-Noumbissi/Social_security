import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { User } from '../types';
import {
  Shield, Search, Plus, Trash2, X,
  UserCheck, AlertCircle
} from 'lucide-react';

const AdminAssureurs: React.FC = () => {
  const [assureurs, setAssureurs] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'M',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<User[]>('/api/admin/assureurs');
      setAssureurs(res.data);
    } catch (err) {
      console.error('Erreur chargement assureurs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Supprimer l'assureur ${name} ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/api/admin/assureurs/${id}`);
      setAssureurs(prev => prev.filter(u => u.id !== id));
      flash('Assureur supprimé avec succès.', 'success');
    } catch (err: any) {
      flash(err.response?.data?.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  const handleCreateAssureur = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role: 'ASSUREUR' };
      await api.post('/api/admin/assureurs', payload);
      flash('Assureur créé avec succès.', 'success');
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: 'M',
      });
      fetchData();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Erreur lors de la création.', 'error');
    }
  };

  const flash = (message: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccessMsg(message); setTimeout(() => setSuccessMsg(null), 3500); }
    else { setError(message); setTimeout(() => setError(null), 4000); }
  };

  const filtered = assureurs.filter(u => {
    const term = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center border border-brand-100">
              <Shield size={20} />
            </div>
            Gestion des Assureurs
          </h1>
          <p className="text-slate-400 mt-1 ml-12">{assureurs.length} assureur(s) enregistré(s) dans le système.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-300 text-sm"
        >
          <Plus size={18} />
          <span>Ajouter un Assureur</span>
        </button>
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
          placeholder="Rechercher par nom, prénom ou email…"
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
                  <th className="px-6 py-4 font-semibold">Assureur</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Genre</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <Shield size={32} className="mx-auto mb-2 opacity-30" />
                      <p>Aucun assureur trouvé.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(assureur => (
                    <tr key={assureur.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border border-brand-200">
                            {assureur.firstName[0]}{assureur.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {assureur.firstName} {assureur.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{assureur.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {assureur.gender === 'M' ? 'Masculin' : 'Féminin'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(assureur.id, `${assureur.firstName} ${assureur.lastName}`)}
                            title="Supprimer cet assureur"
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

      {/* Add Assureur Modal */}
      {showAddModal && createPortal(
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
          className="bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); } }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200/80 animate-fade-in my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Créer un Assureur</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Ajouter un nouveau compte assureur au système.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssureur} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow shadow-brand-500/20 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default AdminAssureurs;
