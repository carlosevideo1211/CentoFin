export type Plan = 'trial' | 'pessoal' | 'pessoal_anual' | 'profissional' | 'profissional_anual' | 'empresa' | 'cancelado';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  trial_end: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  note?: string;
  is_recurring?: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit: number;
  month: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface CustomCategory {
  id: string;
  user_id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  type: 'income' | 'expense' | 'both';
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  limit: number;
  closing_day: number;
  due_day: number;
  color: string;
  last_four?: string;
}

export const CATEGORIES: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  alimentacao:  { label: 'Alimentação',  emoji: '🍔', color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  transporte:   { label: 'Transporte',   emoji: '🚗', color: '#4ECDC4', bg: 'rgba(78,205,196,0.12)'  },
  moradia:      { label: 'Moradia',      emoji: '🏠', color: '#0070F3', bg: 'rgba(0,112,243,0.12)'   },
  saude:        { label: 'Saúde',        emoji: '❤️', color: '#FF6B9D', bg: 'rgba(255,107,157,0.12)' },
  lazer:        { label: 'Lazer',        emoji: '🎮', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  educacao:     { label: 'Educação',     emoji: '📚', color: '#00E5C8', bg: 'rgba(0,229,200,0.12)'   },
  roupas:       { label: 'Roupas',       emoji: '👕', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  assinaturas:  { label: 'Assinaturas', emoji: '📺', color: '#8892A4', bg: 'rgba(136,146,164,0.12)' },
  investimento: { label: 'Investimento', emoji: '📈', color: '#00C853', bg: 'rgba(0,200,83,0.12)'    },
  salario:      { label: 'Salário',      emoji: '💰', color: '#00C853', bg: 'rgba(0,200,83,0.12)'    },
  freelance:    { label: 'Freelance',    emoji: '💻', color: '#00E5C8', bg: 'rgba(0,229,200,0.12)'   },
  outros:       { label: 'Outros',       emoji: '📦', color: '#8892A4', bg: 'rgba(136,146,164,0.12)' },
};

export const INCOME_CATEGORIES  = ['salario', 'freelance', 'investimento', 'outros'];
export const EXPENSE_CATEGORIES = ['alimentacao','transporte','moradia','saude','lazer','educacao','roupas','assinaturas','outros'];

export const PLAN_LABELS: Record<Plan, string> = {
  trial: '🕐 Trial',
  pessoal: '⭐ Pessoal',
  pessoal_anual: '⭐ Pessoal Anual',
  profissional: '👑 Profissional',
  profissional_anual: '👑 Profissional Anual',
  empresa: '🏢 Empresa',
  cancelado: '❌ Cancelado',
};

export const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
export const currentMonth = () => new Date().toISOString().slice(0, 7);
export const filterByMonth = (txs: Transaction[], month: string) => txs.filter(t => t.date.startsWith(month));
export const sumByType = (txs: Transaction[], type: 'income' | 'expense') => txs.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
export const groupByCategory = (txs: Transaction[]) => {
  const map: Record<string, number> = {};
  txs.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
  return map;
};
