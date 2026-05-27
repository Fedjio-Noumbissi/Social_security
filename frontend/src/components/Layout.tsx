import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, LayoutDashboard, Users, Stethoscope, 
  FileText, CreditCard, BarChart3, LogOut, Menu, X, User 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: "Tableau de Bord",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_ASSUREUR", "ROLE_MEDECIN", "ROLE_PATIENT"]
    },
    {
      title: "Gestion Assureurs",
      path: "/admin/assureurs",
      icon: <Shield size={20} />,
      roles: ["ROLE_ADMIN"]
    },
    {
      title: "Gestion Patients",
      path: "/patients",
      icon: <Users size={20} />,
      roles: ["ROLE_ASSUREUR", "ROLE_MEDECIN"]
    },
    {
      title: "Gestion Médecins",
      path: "/doctors",
      icon: <Stethoscope size={20} />,
      roles: ["ROLE_ASSUREUR"]
    },
    {
      title: "Consultations",
      path: "/consultations",
      icon: <FileText size={20} />,
      roles: ["ROLE_MEDECIN", "ROLE_PATIENT"]
    },
    {
      title: "Remboursements",
      path: "/remboursements",
      icon: <CreditCard size={20} />,
      roles: ["ROLE_ASSUREUR", "ROLE_PATIENT"]
    },
    {
      title: "Rapports & Stats",
      path: "/reports",
      icon: <BarChart3 size={20} />,
      roles: ["ROLE_ASSUREUR"]
    }
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/80 p-6 shrink-0 z-20">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-4 mb-8">
          <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/5">
            <Shield size={22} className="stroke-[1.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight leading-none text-lg">CSI Sécurité</h1>
            <span className="text-xs text-slate-400 font-medium">Assurance Maladie</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5">
          {filteredMenu.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={isActive ? "nav-link-active" : "nav-link"}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 pt-6 mt-6">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200/50">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 text-sm truncate leading-none mb-1">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.roles[0].replace("ROLE_", "")}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle drawer */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white p-6 z-40 lg:hidden flex flex-col transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl flex items-center justify-center">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-lg leading-none">CSI Sécurité</h1>
              <span className="text-xs text-slate-400">Assurance Maladie</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          {filteredMenu.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={isActive ? "nav-link-active" : "nav-link"}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 pt-6 mt-6">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200/50">
              <User size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-none mb-1">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400">
                {user?.roles[0].replace("ROLE_", "")}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {location.pathname.replace("/", "").replace("-", " ") || "Tableau de Bord"}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold px-4 py-2 bg-brand-50 border border-brand-100 text-brand-600 rounded-xl">
            <span>Connexion active</span>
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-ping"></div>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
