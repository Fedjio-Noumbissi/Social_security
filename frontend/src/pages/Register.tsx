import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Doctor } from '../types';
import { Shield, User, UserCheck, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('M');
  const [role, setRole] = useState<'PATIENT' | 'MEDECIN'>('PATIENT');

  // Patient Fields
  const [ssn, setSsn] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medecinTraitantId, setMedecinTraitantId] = useState<string>('');
  const [generalists, setGeneralists] = useState<Doctor[]>([]);

  // Doctor Fields
  const [matricule, setMatricule] = useState('');
  const [specialty, setSpecialty] = useState('GENERALISTE');
  const [isInsured, setIsInsured] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Load available generalists when registering as a patient
  useEffect(() => {
    if (role === 'PATIENT') {
      api.get<Doctor[]>('/api/doctors/specialty/GENERALISTE')
        .then(res => setGeneralists(res.data))
        .catch(err => console.log("Erreur de chargement des généralistes", err));
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload: any = {
      email,
      password,
      firstName,
      lastName,
      gender,
      role,
    };

    if (role === 'PATIENT') {
      payload.socialSecurityNumber = ssn;
      payload.emergencyContact = emergencyContact;
      if (medecinTraitantId) {
        payload.medecinTraitantId = parseInt(medecinTraitantId);
      }
    } else if (role === 'MEDECIN') {
      payload.matricule = matricule;
      payload.specialty = specialty;
      payload.isInsured = isInsured;
    }

    try {
      await register(payload);
      setSuccess("Compte créé avec succès ! Redirection vers la page de connexion...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Erreur lors de l'inscription. Veuillez vérifier vos données."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e1b4b] p-4 py-12">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20 text-brand-500 mb-4 shadow-lg shadow-brand-500/5">
            <Shield size={36} className="stroke-[1.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CSI Sécurité</h1>
          <p className="text-slate-400 mt-2">Création d'un Espace Personnel</p>
        </div>

        <div className="glass-card-dark p-8 border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-semibold text-white mb-6">Créer un compte</h2>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl mb-6 text-sm">
              <UserCheck size={20} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Role selector tabs */}
          <div className="flex bg-slate-950/40 p-1 rounded-xl mb-8 border border-slate-800">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${role === 'PATIENT'
                ? 'bg-brand-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <User size={16} />
              <span>Assuré (Patient)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('MEDECIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${role === 'MEDECIN'
                ? 'bg-brand-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Stethoscope size={16} />
              <span>Professionnel de Santé (Médecin)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prénom</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nom de famille</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Common Fields Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                >
                  <option value="M" className="bg-slate-900">Homme</option>
                  <option value="F" className="bg-slate-900">Femme</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.dupont@exemple.com"
                  className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
              />
            </div>

            {/* Role Specific Section */}
            {role === 'PATIENT' ? (
              <div className="space-y-5 bg-slate-950/20 p-5 rounded-xl border border-slate-800/80">
                <h3 className="text-sm font-semibold text-brand-500 tracking-wider uppercase mb-2">Informations d'Assuré</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Numéro de Sécurité Sociale</label>
                  <input
                    type="text"
                    required
                    value={ssn}
                    onChange={(e) => setSsn(e.target.value)}
                    placeholder="12 chiffres (ex: 189123456789)"
                    maxLength={20}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Contact d'Urgence</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Nom et Téléphone (ex: Marie Dupont - +237 6 77 12 34 56)"
                    className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Médecin Traitant Référent (Facultatif)</label>
                  <select
                    value={medecinTraitantId}
                    onChange={(e) => setMedecinTraitantId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                  >
                    <option value="" className="bg-slate-900">-- Choisir un Médecin Généraliste --</option>
                    {generalists.map(doc => (
                      <option key={doc.id} value={doc.id} className="bg-slate-900">
                        Dr. {doc.user.firstName} {doc.user.lastName} (Matricule: {doc.matricule})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-5 bg-slate-950/20 p-5 rounded-xl border border-slate-800/80">
                <h3 className="text-sm font-semibold text-brand-500 tracking-wider uppercase mb-2">Informations Professionnelles</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Matricule Praticien</label>
                    <input
                      type="text"
                      required
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      placeholder="MED-XXX-000"
                      className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Spécialité</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                    >
                      <option value="GENERALISTE" className="bg-slate-900">Médecin Généraliste</option>
                      <option value="SPECIALISTE" className="bg-slate-900">Médecin Spécialiste</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isInsured"
                    checked={isInsured}
                    onChange={(e) => setIsInsured(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-850 bg-slate-950 text-brand-500 focus:ring-brand-500"
                  />
                  <label htmlFor="isInsured" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                    Je souhaite également m'enregistrer comme Assuré (Médecin malade pouvant être soigné/remboursé)
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Créer mon espace</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400 border-t border-slate-800/80 pt-6">
            <span>Vous avez déjà un compte ? </span>
            <RouterLink to="/login" className="text-brand-500 hover:text-brand-400 font-medium transition-colors">
              Se connecter
            </RouterLink>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Register;
