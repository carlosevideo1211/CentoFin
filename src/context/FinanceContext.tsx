import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Transaction, Budget, Goal, CustomCategory, CreditCard } from '../types/index';

interface FinanceCtx {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  customCategories: CustomCategory[];
  creditCards: CreditCard[];
  loading: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (b: Omit<Budget, 'id' | 'user_id'>) => Promise<void>;
  updateBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addCustomCategory: (c: Omit<CustomCategory, 'id' | 'user_id'>) => Promise<void>;
  deleteCustomCategory: (id: string) => Promise<void>;
  addCreditCard: (c: Omit<CreditCard, 'id' | 'user_id'>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const Ctx = createContext<FinanceCtx | null>(null);
export const useFinance = () => { const c = useContext(Ctx); if (!c) throw new Error('useFinance'); return c; };

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('custom_categories').select('*').eq('user_id', user.id),
      supabase.from('credit_cards').select('*').eq('user_id', user.id),
    ]).then(([tx, bg, gl, cc, cr]) => {
      if (tx.data) setTransactions(tx.data as Transaction[]);
      if (bg.data) setBudgets(bg.data.map((b: any) => ({ ...b, limit: b.budget_limit })) as Budget[]);
      if (gl.data) setGoals(gl.data as Goal[]);
      if (cc.data) setCustomCategories(cc.data as CustomCategory[]);
      if (cr.data) setCreditCards(cr.data.map((c: any) => ({ ...c, limit: c.card_limit })) as CreditCard[]);
      setLoading(false);
    });
  }, [user]);

  const addTransaction = async (t: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data } = await supabase.from('transactions').insert([{ ...t, user_id: user.id }]).select().single();
    if (data) setTransactions(p => [data as Transaction, ...p]);
  };
  const updateTransaction = async (t: Transaction) => {
    await supabase.from('transactions').update(t).eq('id', t.id);
    setTransactions(p => p.map(x => x.id === t.id ? t : x));
  };
  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(p => p.filter(x => x.id !== id));
  };
  const addBudget = async (b: Omit<Budget, 'id' | 'user_id'>) => {
    if (!user) return;
    const { data } = await supabase.from('budgets').insert([{ ...b, budget_limit: b.limit, user_id: user.id }]).select().single();
    if (data) setBudgets(p => [...p, data as Budget]);
  };
  const updateBudget = async (b: Budget) => {
    await supabase.from('budgets').update(b).eq('id', b.id);
    setBudgets(p => p.map(x => x.id === b.id ? b : x));
  };
  const deleteBudget = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id);
    setBudgets(p => p.filter(x => x.id !== id));
  };
  const addGoal = async (g: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data } = await supabase.from('goals').insert([{ ...g, user_id: user.id }]).select().single();
    if (data) setGoals(p => [...p, data as Goal]);
  };
  const updateGoal = async (id: string, g: Partial<Goal>) => {
    await supabase.from('goals').update(g).eq('id', id);
    setGoals(p => p.map(x => x.id === id ? { ...x, ...g } : x));
  };
  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    setGoals(p => p.filter(x => x.id !== id));
  };
  const addCustomCategory = async (c: Omit<CustomCategory, 'id' | 'user_id'>) => {
    if (!user) return;
    const { data } = await supabase.from('custom_categories').insert([{ ...c, user_id: user.id }]).select().single();
    if (data) setCustomCategories(p => [...p, data as CustomCategory]);
  };
  const deleteCustomCategory = async (id: string) => {
    await supabase.from('custom_categories').delete().eq('id', id);
    setCustomCategories(p => p.filter(x => x.id !== id));
  };
  const addCreditCard = async (c: Omit<CreditCard, 'id' | 'user_id'>) => {
    if (!user) return;
    const { data } = await supabase.from('credit_cards').insert([{ ...c, card_limit: c.limit, user_id: user.id }]).select().single();
    if (data) setCreditCards(p => [...p, data as CreditCard]);
  };
  const deleteCreditCard = async (id: string) => {
    await supabase.from('credit_cards').delete().eq('id', id);
    setCreditCards(p => p.filter(x => x.id !== id));
  };
  const clearAll = async () => {
    if (!user) return;
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', user.id),
      supabase.from('budgets').delete().eq('user_id', user.id),
    ]);
    setTransactions([]); setBudgets([]);
  };

  return (
    <Ctx.Provider value={{ transactions, budgets, goals, customCategories, creditCards, loading, addTransaction, updateTransaction, deleteTransaction, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal, addCustomCategory, deleteCustomCategory, addCreditCard, deleteCreditCard, clearAll }}>
      {children}
    </Ctx.Provider>
  );
}
