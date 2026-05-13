import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) { toast.error('Acesso negado'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin');
    } catch { toast.error('Credenciais inválidas'); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg, var(--accent), var(--primary))', display:'flex', alignItems:'center', justifyContent:'center' }}><Zap size={20} color="#0A0F1E" /></div>
            <span style={{ fontSize:20, fontWeight:700, color:'var(--text)' }}>Cento<span style={{ color:'var(--accent)' }}>Fin</span> Admin</span>
          </div>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Senha</label><input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>{loading ? 'Entrando...' : 'Acessar painel'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
