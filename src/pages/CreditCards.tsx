import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBRL } from '../types/index';
import { Plus, Trash2, CreditCard as CardIcon } from 'lucide-react';

const CARD_COLORS = ['#0070F3','#00E5C8','#A78BFA','#FF6B6B','#F59E0B','#00C853'];

export default function CreditCards() {
  const { creditCards, addCreditCard, deleteCreditCard } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', limit:'', closing_day:'', due_day:'', color:CARD_COLORS[0], last_four:'' });

  const handleAdd = async () => {
    if (!form.name || !form.limit) return;
    await addCreditCard({ ...form, limit:parseFloat(form.limit), closing_day:parseInt(form.closing_day||'1'), due_day:parseInt(form.due_day||'10') });
    setShowForm(false);
    setForm({ name:'', limit:'', closing_day:'', due_day:'', color:CARD_COLORS[0], last_four:'' });
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Cartões de Crédito</h1><p className="page-sub">{creditCards.length} cartões cadastrados</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Novo cartão</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-title">Novo cartão</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Nome</label><input className="form-input" placeholder="Ex: Nubank" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Limite (R$)</label><input className="form-input" type="number" placeholder="0,00" value={form.limit} onChange={e => setForm(p=>({...p,limit:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Dia fechamento</label><input className="form-input" type="number" min="1" max="31" placeholder="Ex: 19" value={form.closing_day} onChange={e => setForm(p=>({...p,closing_day:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Dia vencimento</label><input className="form-input" type="number" min="1" max="31" placeholder="Ex: 26" value={form.due_day} onChange={e => setForm(p=>({...p,due_day:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Últimos 4 dígitos</label><input className="form-input" maxLength={4} placeholder="0000" value={form.last_four} onChange={e => setForm(p=>({...p,last_four:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Cor</label><div style={{ display:'flex', gap:8 }}>{CARD_COLORS.map(c => <button key={c} type="button" onClick={() => setForm(p=>({...p,color:c}))} style={{ width:32, height:32, borderRadius:8, background:c, border: form.color===c ? '3px solid white' : '3px solid transparent', cursor:'pointer' }} />)}</div></div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" onClick={handleAdd}>Adicionar</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {creditCards.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💳</div><h3>Nenhum cartão cadastrado</h3><p>Adicione seus cartões de crédito para controlar os gastos</p></div>
      ) : (
        <div className="grid-2">
          {creditCards.map(c => (
            <div key={c.id} className="card" style={{ borderTop:`3px solid ${c.color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <CardIcon size={20} style={{ color:c.color }} />
                  <div>
                    <div style={{ fontWeight:700, color:'var(--text)' }}>{c.name}</div>
                    {c.last_four && <div style={{ fontSize:12, color:'var(--text2)' }}>•••• {c.last_four}</div>}
                  </div>
                </div>
                <button className="btn-icon" style={{ color:'var(--expense)' }} onClick={() => deleteCreditCard(c.id)}><Trash2 size={14} /></button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><div style={{ fontSize:11, color:'var(--text2)' }}>Limite</div><div style={{ fontWeight:700, color:'var(--text)' }}>{formatBRL(c.limit)}</div></div>
                <div><div style={{ fontSize:11, color:'var(--text2)' }}>Fechamento</div><div style={{ fontWeight:700, color:'var(--text)' }}>Dia {c.closing_day}</div></div>
                <div><div style={{ fontSize:11, color:'var(--text2)' }}>Vencimento</div><div style={{ fontWeight:700, color:'var(--text)' }}>Dia {c.due_day}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
