import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatBRL } from '../types/index';
import type { Transaction } from '../types/index';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';

interface Props { tx: Transaction; onEdit: (t: Transaction) => void; }

export default function TxItem({ tx, onEdit }: Props) {
  const { deleteTransaction, customCategories = [] } = useFinance();
  const allCats = { ...CATEGORIES, ...Object.fromEntries(customCategories.map(c => [c.id, { label:c.label, emoji:c.emoji, color:c.color, bg:c.bg }])) };
  const cat = allCats[tx.category];

  return (
    <div className="tx-item">
      <div className="tx-icon" style={{ background: cat?.bg ?? 'var(--bg3)' }}>
        <span style={{ fontSize:18 }}>{cat?.emoji ?? '📦'}</span>
      </div>
      <div className="tx-info">
        <div className="tx-desc">{tx.description}</div>
        <div className="tx-meta">
          <span>{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
          <span className="badge" style={{ background:cat?.bg, color:cat?.color, padding:'2px 8px', fontSize:11 }}>{cat?.label ?? tx.category}</span>
          {tx.is_recurring && <span style={{ color:'var(--accent)', fontSize:11, display:'flex', alignItems:'center', gap:3 }}><RefreshCw size={10} /> Fixo</span>}
        </div>
      </div>
      <span className={`tx-amount ${tx.type}`}>{tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}</span>
      <div className="tx-actions">
        <button className="btn-icon" onClick={() => onEdit(tx)}><Pencil size={14} /></button>
        <button className="btn-icon" style={{ color:'var(--expense)' }} onClick={() => confirm(`Excluir "${tx.description}"?`) && deleteTransaction(tx.id)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
