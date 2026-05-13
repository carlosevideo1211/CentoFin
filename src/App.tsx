import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import Shell from './components/Shell';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import CreditCards from './pages/CreditCards';
import Settings from './pages/Settings';
import TrialExpired from './pages/TrialExpired';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0A0F1E' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⚡</div>
        <div style={{ color:'#00E5C8', fontSize:14 }}>Carregando CentoFin...</div>
      </div>
    </div>
  );

  const trialExpired = user && user.plan === 'trial' && new Date(user.trial_end) < new Date();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/trial-expirado" element={<TrialExpired />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/*" element={
        !user ? <Navigate to="/login" /> :
        trialExpired ? <Navigate to="/trial-expirado" /> :
        <FinanceProvider>
          <Shell>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lancamentos" element={<Transactions />} />
              <Route path="/orcamentos" element={<Budgets />} />
              <Route path="/metas" element={<Goals />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/cartoes" element={<CreditCards />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Shell>
        </FinanceProvider>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1A2235', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
