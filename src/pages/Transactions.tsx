import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatBRL, filterByMonth, sumByType } from '../types/index';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import TxItem from '../components/TxItem';
import CategoryManager from '../components/CategoryManager';
import type { Transaction } from '../types/index';

export default function Transactions() {
  const { transactions, customCategories = [] } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.toISOString().slice(0,7));
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all'|'income'|'expense'>('all');
  const [catFilter, setCatFilter] = useState('');

  const navMonth = (dir: number) => {
    const d = new Date(month + '-01'); d.setMonth(d.getMonth() + dir);
    setMonth(d.toISOString().slice(0,7));
  };
  const monthLabel = (ym: string) => new Date(ym + '-01T12:00:00').toLocaleDateString('pt-BR', { month:'long', year:'numeric' });

  const allCats = { ...CATEGORIES, ...Object.fromEntries(customCategories.map(c => [c.id, c])) };

  const filtered = useMemo(() => {
    let txs = filterByMonth(transactions, month);
    if (typeFilter !== 'all') txs = txs.filter(t => t.type === typeFilter);
    if (catFilter) txs = txs.filter(t => t.category === catFilter);
    if (search.trim()) txs = txs.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    return [...txs].sort((a,b) => b.date.localeCompare(a.date));
  }, [transactions, month, typeFilter, catFilter, search]);

  const totalIncome  = useMemo(() => sumByType(filtered, 'income'),  [filtered]);
  const totalExpense = useMemo(() => sumByType(filtered, 'expense'), [filtered]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lançamentos</h1>
          <p className="page-sub">{filtered.length} transações encontradas</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCatManager(true)}><SlidersHorizontal size={14} /> Categorias</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Novo</button>
        </div>
      </div>

      {/* Month nav */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'8px 16px' }}>
          <button className="btn-icon" onClick={() => navMonth(-1)} style={{ padding:4 }}>‹</button>
          <span style={{ fontSize:14, fontWeight:600, color:'var(--text)', minWidth:140, textAlign:'center', textTransform:'capitalize' }}>{monthLabel(month)}</span>
          <button className="btn-icon" onClick={() => navMonth(1)} style={{ padding:4 }}>›</button>
        </div>
        <span style={{ fontSize:13, color:'var(--income)', fontWeight:600 }}>+{formatBRL(totalIncome)}</span>
        <span style={{ fontSize:13, color:'var(--expense)', fontWeight:600 }}>-{formatBRL(totalExpense)}</span>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }} />
          <input className="form-input" placeholder="Buscar descrição..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:36 }} />
        </div>
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={{ width:160 }}>
          <option value="all">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select className="form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width:180 }}>
          <option value="">Todas categorias</option>
          {[...Object.entries(CATEGORIES), ...customCategories.map(c => [c.id, c] as const)].map(([k, v]: any) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="tx-list">
          {filtered.map(tx => <TxItem key={tx.id} tx={tx} onEdit={t => { setEditing(t); setShowModal(true); }} />)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Nenhum lançamento encontrado</h3>
          <p>Tente mudar os filtros ou adicione um novo lançamento</p>
        </div>
      )}

      {showCatManager && <CategoryManager onClose={() => setShowCatManager(false)} />}
      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditing(null); }} initial={editing ?? undefined} />}
      <button className="fab" onClick={() => setShowModal(true)}>+</button>
    </div>
  );
}
