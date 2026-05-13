import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatBRL, filterByMonth, sumByType, groupByCategory } from '../types/index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const { transactions, customCategories = [] } = useFinance();
  const allCats = { ...CATEGORIES, ...Object.fromEntries(customCategories.map(c => [c.id, c])) };

  const barData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      months.push({ month: d.toISOString().slice(0,7), label: d.toLocaleDateString('pt-BR',{month:'short'}) });
    }
    return months.map(({ month, label }) => {
      const txs = filterByMonth(transactions, month);
      return { label, Receitas: sumByType(txs,'income'), Despesas: sumByType(txs,'expense') };
    });
  }, [transactions]);

  const month = new Date().toISOString().slice(0,7);
  const monthTxs = useMemo(() => filterByMonth(transactions, month), [transactions, month]);
  const expByCategory = useMemo(() => groupByCategory(monthTxs.filter(t => t.type === 'expense')), [monthTxs]);
  const ranking = Object.entries(expByCategory).map(([k,v]) => ({ key:k, label:allCats[k]?.label ?? k, emoji:allCats[k]?.emoji ?? '📦', value:v, color:allCats[k]?.color ?? '#8892A4' })).sort((a,b) => b.value - a.value);

  const handleExportPDF = () => toast('Em breve: exportar PDF!', { icon: '📄' });

  const totalIncome  = useMemo(() => sumByType(transactions.filter(t => t.date.startsWith(String(new Date().getFullYear()))), 'income'),  [transactions]);
  const totalExpense = useMemo(() => sumByType(transactions.filter(t => t.date.startsWith(String(new Date().getFullYear()))), 'expense'), [transactions]);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Relatórios</h1><p className="page-sub">Visão completa das suas finanças</p></div>
        <button className="btn btn-secondary" onClick={handleExportPDF}><Download size={16} /> Exportar PDF</button>
      </div>

      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card income-card"><div className="stat-label">Receitas {new Date().getFullYear()}</div><div className="stat-value">{formatBRL(totalIncome)}</div></div>
        <div className="stat-card expense-card"><div className="stat-label">Despesas {new Date().getFullYear()}</div><div className="stat-value">{formatBRL(totalExpense)}</div></div>
        <div className="stat-card"><div className="stat-label">Saldo {new Date().getFullYear()}</div><div className="stat-value" style={{ color: totalIncome - totalExpense >= 0 ? 'var(--income)' : 'var(--expense)' }}>{formatBRL(totalIncome - totalExpense)}</div></div>
      </div>

      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-title">Receitas vs Despesas — últimos 6 meses</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fill:'var(--text2)', fontSize:12 }} />
            <YAxis tickFormatter={v => `R$${v}`} tick={{ fill:'var(--text2)', fontSize:11 }} width={75} />
            <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8 }} formatter={(v: unknown) => [formatBRL(v as number), '']} />
            <Legend />
            <Bar dataKey="Receitas" fill="var(--income)"  radius={[4,4,0,0]} />
            <Bar dataKey="Despesas" fill="var(--expense)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card-title">Top categorias — mês atual</div>
        {ranking.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {ranking.map((r, i) => (
              <div key={r.key}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontSize:14, color:'var(--text)', display:'flex', alignItems:'center', gap:8 }}><span>{i+1}.</span>{r.emoji} {r.label}</span>
                  <span style={{ fontWeight:700, color:r.color }}>{formatBRL(r.value)}</span>
                </div>
                <div className="progress-wrap"><div className="progress-bar" style={{ width:`${(r.value / ranking[0].value)*100}%`, background:r.color }} /></div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state" style={{ padding:'24px 0' }}><p>Nenhuma despesa este mês</p></div>}
      </div>
    </div>
  );
}
