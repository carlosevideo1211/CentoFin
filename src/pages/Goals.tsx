import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatBRL } from '../types/index';
import { Plus, Trash2, Target } from 'lucide-react';
import type { Goal } from '../types/index';

const ICONS = ['🎯','✈️','🚗','🏠','📚','🛡️','💍','💻','❤️','🏆'];
const COLORS = ['#0070F3','#00E5C8','#00C853','#F59E0B','#FF6B6B','#A78BFA','#FF6B9D','#4ECDC4'];

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [form, setForm] = useState({ title:'', description:'', target_amount:'', current_amount:'0', deadline:'', color:COLORS[0], icon:ICONS[0] });

  const handleAdd = async () => {
    if (!form.title || !form.target_amount) return;
    await addGoal({ ...form, target_amount:parseFloat(form.target_amount), current_amount:parseFloat(form.current_amount||'0') });
    setShowForm(false);
    setForm({ title:'', description:'', target_amount:'', current_amount:'0', deadline:'', color:COLORS[0], icon:ICONS[0] });
  };

  const handleContribute = async () => {
    if (!contributing) return;
    const amount = parseFloat(contributeAmount);
    if (!amount) return;
    const newAmount = Math.min(contributing.current_amount + amount, contributing.target_amount);
    await updateGoal(contributing.id, { current_amount: newAmount });
    setContributing(null); setContributeAmount('');
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Metas</h1><p className="page-sub">{goals.length} metas cadastradas</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Nova meta</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-title">Nova meta financeira</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Título</label><input className="form-input" placeholder="Ex: Viagem para Europa" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Valor alvo (R$)</label><input className="form-input" type="number" placeholder="0,00" value={form.target_amount} onChange={e => setForm(p=>({...p,target_amount:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Valor atual (R$)</label><input className="form-input" type="number" placeholder="0,00" value={form.current_amount} onChange={e => setForm(p=>({...p,current_amount:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Prazo (opcional)</label><input className="form-input" type="date" value={form.deadline} onChange={e => setForm(p=>({...p,deadline:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Ícone</label><div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{ICONS.map(i => <button key={i} type="button" onClick={() => setForm(p=>({...p,icon:i}))} style={{ fontSize:22, padding:'6px 8px', borderRadius:10, border: form.icon===i ? '2px solid var(--primary)' : '2px solid transparent', background: form.icon===i ? 'rgba(0,112,243,0.1)' : 'transparent', cursor:'pointer' }}>{i}</button>)}</div></div>
          <div className="form-group"><label className="form-label">Cor</label><div style={{ display:'flex', gap:8 }}>{COLORS.map(c => <button key={c} type="button" onClick={() => setForm(p=>({...p,color:c}))} style={{ width:32, height:32, borderRadius:8, background:c, border: form.color===c ? '3px solid white' : '3px solid transparent', cursor:'pointer', outline: form.color===c ? `2px solid ${c}` : 'none' }} />)}</div></div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" onClick={handleAdd}>Criar meta</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {contributing && (
        <div className="modal-overlay" onClick={() => setContributing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Contribuir para "{contributing.title}"</h3></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Valor (R$)</label><input className="form-input" type="number" placeholder="0,00" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} autoFocus /></div>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Faltam {formatBRL(contributing.target_amount - contributing.current_amount)} para a meta</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setContributing(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleContribute}>Contribuir</button>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎯</div><h3>Nenhuma meta ainda</h3><p>Crie metas para acompanhar seu progresso financeiro</p></div>
      ) : (
        <div className="grid-2">
          {goals.map(g => {
            const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
            const done = g.current_amount >= g.target_amount;
            return (
              <div key={g.id} className="card" style={{ border: done ? `1px solid ${g.color}40` : undefined }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:g.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{g.icon}</div>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--text)', fontSize:15 }}>{g.title}</div>
                      {g.deadline && <div style={{ fontSize:12, color:'var(--text2)' }}>📅 {new Date(g.deadline+'T12:00').toLocaleDateString('pt-BR')}</div>}
                      {done && <div style={{ fontSize:12, color:'var(--income)', fontWeight:600 }}>✅ Concluída!</div>}
                    </div>
                  </div>
                  <button className="btn-icon" style={{ color:'var(--expense)' }} onClick={() => confirm('Excluir meta?') && deleteGoal(g.id)}><Trash2 size={14} /></button>
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                    <span style={{ color:'var(--text2)' }}>{formatBRL(g.current_amount)}</span>
                    <span style={{ fontWeight:700, color:g.color }}>{pct.toFixed(0)}%</span>
                    <span style={{ color:'var(--text2)' }}>{formatBRL(g.target_amount)}</span>
                  </div>
                  <div className="progress-wrap"><div className="progress-bar" style={{ width:`${pct}%`, background:g.color }} /></div>
                </div>
                {!done && <button className="btn btn-secondary btn-sm" style={{ width:'100%', justifyContent:'center' }} onClick={() => setContributing(g)}><Target size={14} /> Contribuir</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
