import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, formatBRL, filterByMonth, sumByType, groupByCategory, currentMonth } from '../types/index';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import TxItem from '../components/TxItem';
import type { Transaction } from '../types/index';

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, budgets, customCategories } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const month = currentMonth();
  const monthTxs = useMemo(() => filterByMonth(transactions, month), [transactions, month]);
  const totalIncome  = useMemo(() => sumByType(monthTxs, 'income'),  [monthTxs]);
  const totalExpense = useMemo(() => sumByType(monthTxs, 'expense'), [monthTxs]);
  const balance = totalIncome - totalExpense;

  const allCats = { ...CATEGORIES, ...Object.fromEntries((customCategories ?? []).map(c => [c.id, c])) };

  const expByCategory = useMemo(() => groupByCategory(monthTxs.filter(t => t.type === 'expense')), [monthTxs]);
  const pieData = useMemo(() =>
    Object.entries(expByCategory)
      .map(([k, v]) => ({ name: allCats[k]?.label ?? k, value: v, color: allCats[k]?.color ?? '#8892A4' }))
      .sort((a, b) => b.value - a.value)
  , [expByCategory]);

  const lineData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      months.push({ month: d.toISOString().slice(0,7), label: d.toLocaleDateString('pt-BR', { month: 'short' }) });
    }
    return months.map(({ month: m, label }) => {
      const txs = filterByMonth(transactions, m);
      return { label, saldo: parseFloat((sumByType(txs,'income') - sumByType(txs,'expense')).toFixed(2)) };
    });
  }, [transactions]);

  const alerts = useMemo(() => budgets
    .filter(b => b.month === month)
    .map(b => ({ ...b, spent: expByCategory[b.category] ?? 0, pct: ((expByCategory[b.category] ?? 0) / b.limit) * 100 }))
    .filter(b => b.pct >= 80)
    .sort((a, b) => b.pct - a.pct)
  , [budgets, expByCategory, month]);

  const recentTxs = useMemo(() => [...monthTxs].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6), [monthTxs]);

  const firstName = user?.name?.split(' ')[0] ?? 'usuário';

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ fontSize:14, color:'var(--text2)', marginBottom:4 }}>Olá, {firstName} 👋</div>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo lançamento
        </button>
      </div>

      {/* Balance hero */}
      <div className="balance-hero">
        <div className="balance-label">Saldo do mês</div>
        <div className="balance-amount">{formatBRL(balance)}</div>
        <div className="balance-change">{balance >= 0 ? '✅ Saldo positivo' : '⚠️ Saldo negativo'} · {monthTxs.length} lançamentos</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card income-card">
          <div className="stat-label"><TrendingUp size={14} /> Receitas</div>
          <div className="stat-value">{formatBRL(totalIncome)}</div>
          <div className="stat-sub">{monthTxs.filter(t => t.type === 'income').length} lançamentos</div>
        </div>
        <div className="stat-card expense-card">
          <div className="stat-label"><TrendingDown size={14} /> Despesas</div>
          <div className="stat-value">{formatBRL(totalExpense)}</div>
          <div className="stat-sub">{monthTxs.filter(t => t.type === 'expense').length} lançamentos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Wallet size={14} /> Taxa de economia</div>
          <div className="stat-value" style={{ color: totalIncome > 0 ? 'var(--accent)' : 'var(--text)' }}>
            {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0}%
          </div>
          <div className="stat-sub">do total de receitas</div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom:24 }}>
          {alerts.map(a => (
            <div key={a.id} className={`alert ${a.pct >= 100 ? 'alert-danger' : 'alert-warning'}`}>
              <AlertTriangle size={16} style={{ flexShrink:0, marginTop:2 }} />
              <span><strong>{allCats[a.category]?.label ?? a.category}</strong>: {a.pct >= 100 ? `Orçamento excedido! ${formatBRL(a.spent)} de ${formatBRL(a.limit)}` : `${a.pct.toFixed(0)}% usado · ${formatBRL(a.spent)} de ${formatBRL(a.limit)}`}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Line chart */}
        <div className="card">
          <div className="card-title">Evolução — últimos 6 meses</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill:'var(--text2)', fontSize:12 }} />
              <YAxis tick={{ fill:'var(--text2)', fontSize:11 }} tickFormatter={v => `R$${v}`} width={70} />
              <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }} labelStyle={{ color:'var(--text2)' }} formatter={(v: unknown) => [formatBRL(v as number), 'Saldo']} />
              <Line type="monotone" dataKey="saldo" stroke="var(--accent)" strokeWidth={2.5} dot={{ r:4, fill:'var(--accent)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="card-title">Gastos por categoria</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((_e, i) => <Cell key={i} fill={pieData[i].color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }} formatter={(v: unknown) => [formatBRL(v as number), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                {pieData.slice(0,4).map(d => (
                  <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:d.color, display:'inline-block' }} />
                      <span style={{ color:'var(--text2)' }}>{d.name}</span>
                    </span>
                    <span style={{ fontWeight:600, color:d.color }}>{formatBRL(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding:'20px 0' }}>
              <p>Nenhuma despesa este mês</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div className="card-title" style={{ margin:0 }}>Últimos lançamentos</div>
          <span style={{ fontSize:12, color:'var(--text2)' }}>{monthTxs.length} este mês</span>
        </div>
        {recentTxs.length > 0 ? (
          <div className="tx-list">
            {recentTxs.map(tx => (
              <TxItem key={tx.id} tx={tx} onEdit={t => { setEditing(t); setShowModal(true); }} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Nenhum lançamento este mês</h3>
            <p>Clique em "Novo lançamento" para começar</p>
          </div>
        )}
      </div>

      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditing(null); }} initial={editing ?? undefined} />}
      <button className="fab" onClick={() => setShowModal(true)}>+</button>
    </div>
  );
}
