import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch {
      toast.error('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      {/* Left */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px', maxWidth:480 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:48 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg, var(--accent), var(--primary))', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={20} color="#0A0F1E" />
          </div>
          <span style={{ fontSize:22, fontWeight:700, color:'var(--text)' }}>Cento<span style={{ color:'var(--accent)' }}>Fin</span></span>
        </div>

        <h1 style={{ fontSize:32, fontWeight:700, color:'var(--text)', letterSpacing:'-0.5px', marginBottom:8 }}>Bem-vindo de volta</h1>
        <p style={{ color:'var(--text2)', marginBottom:40 }}>Entre na sua conta para continuar</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <div style={{ position:'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight:44 }} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text2)', cursor:'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text2)' }}>
          Não tem conta? <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Criar grátis →</Link>
        </p>
      </div>

      {/* Right — decorative */}
      <div style={{ flex:1, background:'var(--bg2)', borderLeft:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
        <div style={{ textAlign:'center', maxWidth:360 }}>
          <div style={{ fontSize:64, marginBottom:24 }}>⚡</div>
          <h2 style={{ fontSize:28, fontWeight:700, color:'var(--text)', marginBottom:16, letterSpacing:'-0.5px' }}>Controle financeiro <span style={{ color:'var(--accent)' }}>inteligente</span></h2>
          <p style={{ color:'var(--text2)', lineHeight:1.7 }}>Dashboard completo, metas, relatórios em PDF, IA de categorização e muito mais — tudo para sua liberdade financeira.</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:32 }}>
            {[['⚡','IA', 'Categoriza automático'],['📊','PDF','Relatórios completos'],['🔄','Auto','Lançamentos fixos']].map(([icon, label, desc]) => (
              <div key={label} style={{ background:'var(--bg3)', borderRadius:12, padding:16, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--accent)' }}>{label}</div>
                <div style={{ fontSize:11, color:'var(--text2)', marginTop:4 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
