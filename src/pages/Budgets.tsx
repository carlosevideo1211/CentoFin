import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, EXPENSE_CATEGORIES, formatBRL, filterByMonth } from '../types/index';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Budget } from '../types/index';

export default function Budgets() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget, customCategories = [] } = useFinance();
  const month = new Date().toISOString().slice(0,7);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [formCat, setFormCat] = useState('');
  const [formLimit, setFormLimit] = useState('');

  const monthTxs = useMemo(() => filterByMonth(transactions, month), [transactions, month]);
  const expByCategory = useMemo(() => {
    const map: Record<string,number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return map;
  }, [monthTxs]);

  const monthBudgets = budgets.filter(b => b.month === month);
  const allCats = { ...CATEGORIES, ...Object.fromEntries(customCategories.map(c => [c.id, c])) };
  const allExpCats = [...EXPENSE_CATEGORIES, ...customCategories.filter(c => c.type === 'expense' || c.type === 'both').map(c => c.id)];
  const usedCats = monthBudgets.map(b => b.category);

  const handleSave = async () => {
    const limit = parseFloat(formLimit.replace(',','.'));
    if (!formCat || !limit) return;
    if (editing) await updateBudget({ ...editing, category:formCat, limit, month });
    else await addBudget({ category:formCat, limit, month });
    setShowForm(false); setEditing(null); setFormCat(''); setFormLimit('');
  };

  const barColor = (pct: number) => pct >= 100 ? 'var(--expense)' : pct >= 80 ? '#F59E0B' : 'var(--income)';

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Orçamentos</h1><p className="page-sub">{new Date(month+'-01T12:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setFormCat(''); setFormLimit(''); setShowForm(true); }}><Plus size={16} /> Novo orçamento</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-title">{ editing ? 'Editar' : 'Novo'} orçamento</div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:160 }}>
              <label className="form-label">Categoria</label>
              <select className="form-select" value={formCat} onChange={e => setFormCat(e.target.value)}>
                <option value="">Selecione...</option>
                {allExpCats.filter(c => !usedCats.includes(c) || editing?.category === c).map(k => (
                  <option key={k} value={k}>{allCats[k]?.emoji} {allCats[k]?.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex:1, minWidth:160 }}>
              <label className="form-label">Limite (R$)</label>
              <input className="form-input" type="number" placeholder="0,00" value={formLimit} onChange={e => setFormLimit(e.target.value)} />
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
              <button className="btn btn-primary" onClick={handleSave}>Salvar</button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {monthBudgets.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎯</div><h3>Nenhum orçamento este mês</h3><p>Crie orçamentos para controlar seus gastos por categoria</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {monthBudgets.map(b => {
            const spent = expByCategory[b.category] ?? 0;
            const pct = Math.min((spent / b.limit) * 100, 100);
            const cat = allCats[b.category];
            return (
              <div key={b.id} className="card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:cat?.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{cat?.emoji}</div>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--text)' }}>{cat?.label ?? b.category}</div>
                      <div style={{ fontSize:12, color:'var(--text2)' }}>{formatBRL(spent)} de {formatBRL(b.limit)}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:barColor(pct) }}>{pct.toFixed(0)}%</span>
                    <button className="btn-icon" onClick={() => { setEditing(b); setFormCat(b.category); setFormLimit(String(b.limit)); setShowForm(true); }}><Pencil size={14} /></button>
                    <button className="btn-icon" style={{ color:'var(--expense)' }} onClick={() => deleteBudget(b.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="progress-wrap">
                  <div className="progress-bar" style={{ width:`${pct}%`, background:barColor(pct) }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
