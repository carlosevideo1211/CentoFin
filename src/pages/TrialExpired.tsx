import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function TrialExpired() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const plans = [
    { name: 'Pessoal', price: 'R$ 14,90', period: '/mês', features: ['Lançamentos ilimitados','Relatórios PDF','Metas financeiras','Recorrências'] },
    { name: 'Profissional', price: 'R$ 24,90', period: '/mês', features: ['Tudo do Pessoal','IA categorização','Cartão de crédito','Importar CSV'], featured: true },
    { name: 'Empresa', price: 'R$ 49,90', period: '/mês', features: ['Tudo do Profissional','5 usuários','Relatórios avançados','Suporte prioritário'] },
  ];
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ maxWidth:800, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⏰</div>
        <h1 style={{ fontSize:32, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Seu trial expirou</h1>
        <p style={{ color:'var(--text2)', marginBottom:48 }}>Escolha um plano para continuar usando o CentoFin</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
          {plans.map(p => (
            <div key={p.name} className="card" style={{ border: p.featured ? '2px solid var(--primary)' : undefined, position:'relative' }}>
              {p.featured && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'var(--primary)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:99 }}>Mais popular</div>}
              <div style={{ fontSize:17, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{p.name}</div>
              <div style={{ fontSize:28, fontWeight:700, color: p.featured ? 'var(--accent)' : 'var(--text)' }}>{p.price}<span style={{ fontSize:13, fontWeight:400, color:'var(--text2)' }}>{p.period}</span></div>
              <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
                {p.features.map(f => <div key={f} style={{ fontSize:13, color:'var(--text2)', display:'flex', alignItems:'center', gap:8 }}>✅ {f}</div>)}
              </div>
              <button className="btn btn-primary btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:20 }}>Assinar agora</button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={async () => { await signOut(); navigate('/login'); }}>Sair da conta</button>
      </div>
    </div>
  );
}
