import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PLAN_LABELS } from '../../types/index';
import type { Plan, UserProfile } from '../../types/index';
import { LogOut, RefreshCw, Search, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const PLANS: Plan[] = ['trial','pessoal','pessoal_anual','profissional','profissional_anual','empresa','cancelado'];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string|null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session || session.session.user.email !== ADMIN_EMAIL) { navigate('/admin-login'); return; }
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending:false });
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const updatePlan = async (id: string, plan: Plan) => {
    setUpdating(id);
    await supabase.from('profiles').update({ plan }).eq('id', id);
    setUsers(p => p.map(u => u.id === id ? { ...u, plan } : u));
    setUpdating(null);
    toast.success('Plano atualizado!');
  };

  const filtered = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: users.length,
    trial: users.filter(u => u.plan === 'trial').length,
    paid: users.filter(u => !['trial','cancelado'].includes(u.plan)).length,
    canceled: users.filter(u => u.plan === 'cancelado').length,
  };

  const planColor = (plan: string) => {
    if (plan.startsWith('profissional')) return 'var(--accent)';
    if (plan.startsWith('pessoal')) return 'var(--primary)';
    if (plan === 'empresa') return '#A78BFA';
    if (plan === 'cancelado') return 'var(--expense)';
    return 'var(--warning)';
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:32 }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg, var(--accent), var(--primary))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:'var(--text)' }}>CentoFin Admin</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>Painel administrativo</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-secondary btn-sm" onClick={loadUsers}><RefreshCw size={14} /></button>
            <button className="btn btn-ghost btn-sm" onClick={async () => { await supabase.auth.signOut(); navigate('/admin-login'); }}><LogOut size={14} /> Sair</button>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom:24 }}>
          <div className="stat-card"><div className="stat-label"><Users size={13} /> Total</div><div className="stat-value">{stats.total}</div></div>
          <div className="stat-card"><div className="stat-label">Trial</div><div className="stat-value" style={{ color:'var(--warning)' }}>{stats.trial}</div></div>
          <div className="stat-card income-card"><div className="stat-label"><TrendingUp size={13} /> Pagantes</div><div className="stat-value">{stats.paid}</div></div>
          <div className="stat-card expense-card"><div className="stat-label">Cancelados</div><div className="stat-value">{stats.canceled}</div></div>
        </div>

        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ position:'relative', flex:1 }}>
              <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }} />
              <input className="form-input" placeholder="Buscar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:36 }} />
            </div>
          </div>

          {loading ? <div style={{ textAlign:'center', padding:32, color:'var(--text2)' }}>Carregando...</div> : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['Usuário','Email','Plano','Trial até','Desde','Ação'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'10px 12px', fontSize:11, fontWeight:600, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'12px', color:'var(--text)', fontWeight:600 }}>{u.name ?? '-'}</td>
                      <td style={{ padding:'12px', color:'var(--text2)' }}>{u.email}</td>
                      <td style={{ padding:'12px' }}>
                        <span style={{ background:planColor(u.plan)+'20', color:planColor(u.plan), padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600 }}>{PLAN_LABELS[u.plan] ?? u.plan}</span>
                      </td>
                      <td style={{ padding:'12px', color:'var(--text2)', fontSize:13 }}>{u.trial_end ? new Date(u.trial_end).toLocaleDateString('pt-BR') : '-'}</td>
                      <td style={{ padding:'12px', color:'var(--text2)', fontSize:13 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                      <td style={{ padding:'12px' }}>
                        <select className="form-select" value={u.plan} onChange={e => updatePlan(u.id, e.target.value as Plan)} disabled={updating === u.id} style={{ fontSize:12, padding:'6px 10px' }}>
                          {PLANS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
