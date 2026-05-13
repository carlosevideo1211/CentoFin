import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Target, PieChart, BarChart3, CreditCard, Settings, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
  { to: '/lancamentos',   label: 'Lançamentos',   Icon: ArrowLeftRight  },
  { to: '/orcamentos',    label: 'Orçamentos',    Icon: Target          },
  { to: '/metas',         label: 'Metas',         Icon: PieChart        },
  { to: '/relatorios',    label: 'Relatórios',    Icon: BarChart3       },
  { to: '/cartoes',       label: 'Cartões',       Icon: CreditCard      },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings        },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Até logo!');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'CF';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Zap size={18} style={{ color: '#0A0F1E' }} /></div>
          <div className="sidebar-logo-text">Cento<span>Fin</span></div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:8 }}>
            <div className="avatar">{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'var(--text2)' }}>{user?.plan}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleSignOut} style={{ color:'var(--expense)' }}>
            <LogOut size={18} />Sair
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
