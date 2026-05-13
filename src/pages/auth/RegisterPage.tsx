import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Senha mínimo 6 caracteres'); return; }
    setLoading(true);
    try {
      await signUp(email, password, name);
      toast.success('Conta criada! Seu trial de 14 dias começou 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:24 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg, var(--accent), var(--primary))', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={20} color="#0A0F1E" />
            </div>
            <span style={{ fontSize:22, fontWeight:700, color:'var(--text)' }}>Cento<span style={{ color:'var(--accent)' }}>Fin</span></span>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:'var(--text)', letterSpacing:'-0.5px', marginBottom:8 }}>Criar conta grátis</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>14 dias de acesso completo sem cartão</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input className="form-input" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
              {loading ? 'Criando conta...' : 'Começar gratuitamente →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text2)' }}>
          Já tem conta? <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Entrar →</Link>
        </p>
      </div>
    </div>
  );
}
