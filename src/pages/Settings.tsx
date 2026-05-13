import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { PLAN_LABELS } from '../types/index';
import { LogOut, Trash2, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { clearAll } = useFinance();
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate('/login'); toast.success('Até logo!'); };
  const handleClearAll = async () => {
    if (!confirm('Apagar todos os lançamentos e orçamentos? Essa ação não pode ser desfeita.')) return;
    await clearAll();
    toast.success('Dados apagados!');
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Configurações</h1></div>

      <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:600 }}>
        <div className="card">
          <div className="card-title"><User size={14} style={{ display:'inline', marginRight:6 }} />Minha conta</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text2)', fontSize:14 }}>Nome</span>
              <span style={{ color:'var(--text)', fontSize:14, fontWeight:600 }}>{user?.name}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text2)', fontSize:14 }}>E-mail</span>
              <span style={{ color:'var(--text)', fontSize:14, fontWeight:600 }}>{user?.email}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text2)', fontSize:14 }}>Plano</span>
              <span style={{ fontSize:14, fontWeight:600 }}>{user?.plan ? PLAN_LABELS[user.plan] : '-'}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text2)', fontSize:14 }}>Trial até</span>
              <span style={{ color:'var(--text)', fontSize:14, fontWeight:600 }}>{user?.trial_end ? new Date(user.trial_end).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><Shield size={14} style={{ display:'inline', marginRight:6 }} />Dados</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>Limpar todos os dados</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>Remove lançamentos e orçamentos</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleClearAll}><Trash2 size={14} /> Limpar</button>
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={handleSignOut} style={{ justifyContent:'center' }}>
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
    </div>
  );
}
