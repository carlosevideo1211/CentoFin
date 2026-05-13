import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types/index';
import type { Transaction } from '../types/index';
import { X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { onClose: () => void; initial?: Transaction; }

export default function TransactionModal({ onClose, initial }: Props) {
  const { addTransaction, updateTransaction, customCategories = [] } = useFinance();
  const [type, setType]   = useState<'income'|'expense'>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [date, setDate]   = useState(initial?.date ?? new Date().toISOString().slice(0,10));
  const [note, setNote]   = useState(initial?.note ?? '');
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false);
  const [recurrence, setRecurrence] = useState<string>(initial?.recurrence ?? 'monthly');
  const [loading, setLoading] = useState(false);

  const customCatKeys = customCategories.filter(c => c.type === type || c.type === 'both').map(c => c.id);
  const catOptions = [...(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES), ...customCatKeys];
  const allCats = { ...CATEGORIES, ...Object.fromEntries(customCategories.map(c => [c.id, { label:c.label, emoji:c.emoji }])) };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',','.'));
    if (!val || !description.trim() || !category || !date) return;
    setLoading(true);
    try {
      const data = { type, amount:val, description:description.trim(), category, date, note:note.trim(), is_recurring:isRecurring, recurrence: isRecurring ? recurrence as any : undefined };
      if (initial) await updateTransaction({ ...initial, ...data });
      else await addTransaction(data);
      toast.success(initial ? 'Lançamento atualizado!' : 'Lançamento adicionado!');
      onClose();
    } catch { toast.error('Erro ao salvar'); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{initial ? 'Editar lançamento' : 'Novo lançamento'}</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <div className="type-toggle">
                <button type="button" className={`type-btn ${type==='expense' ? 'active-expense' : ''}`} onClick={() => { setType('expense'); setCategory(''); }}>💸 Despesa</button>
                <button type="button" className={`type-btn ${type==='income' ? 'active-income' : ''}`} onClick={() => { setType('income'); setCategory(''); }}>💰 Receita</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input className="form-input" type="number" step="0.01" min="0.01" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input className="form-input" type="text" placeholder="Ex: Aluguel, Salário..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Selecione...</option>
                {catOptions.map(k => <option key={k} value={k}>{allCats[k]?.emoji} {allCats[k]?.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
                <span className="form-label" style={{ margin:0 }}><Zap size={12} color="var(--accent)" /> Lançamento recorrente</span>
              </label>
            </div>
            {isRecurring && (
              <div className="form-group">
                <label className="form-label">Frequência</label>
                <select className="form-select" value={recurrence} onChange={e => setRecurrence(e.target.value)}>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Nota (opcional)</label>
              <input className="form-input" type="text" placeholder="Observação..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Salvando...' : initial ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
