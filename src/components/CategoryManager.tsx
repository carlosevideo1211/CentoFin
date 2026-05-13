import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Plus, Trash2 } from 'lucide-react';

const EMOJIS = ['🏷️','🎯','💡','🔖','⭐','🎁','🏦','💳','🐾','🌱','🏋️','✈️','🎓','🏥','🛒','🎨','🎵','💼','🔧','🍕','🎪','🌿','🏆','💎'];
const COLORS = ['#FF6B6B','#4ECDC4','#0070F3','#00E5C8','#A78BFA','#F59E0B','#00C853','#FF6B9D','#8892A4','#06B6D4'];

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const { customCategories = [], addCustomCategory, deleteCustomCategory } = useFinance();
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('🏷️');
  const [color, setColor] = useState('#0070F3');
  const [type, setType]   = useState<'income'|'expense'|'both'>('expense');
  const [saving, setSaving] = useState(false);

  const bg = (hex: string) => hex + '20';

  const handleAdd = async () => {
    if (!label.trim()) return;
    setSaving(true);
    await addCustomCategory({ label:label.trim(), emoji, color, bg:bg(color), type });
    setLabel('');
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:500 }}>
        <div className="modal-header">
          <h3>Gerenciar Categorias</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background:'var(--bg3)', borderRadius:12, padding:16, marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:12 }}>Nova categoria</div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <input className="form-input" placeholder="Nome..." value={label} onChange={e => setLabel(e.target.value)} style={{ flex:1 }} />
              <select className="form-select" value={type} onChange={e => setType(e.target.value as any)} style={{ width:130 }}>
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
                <option value="both">Ambos</option>
              </select>
            </div>
            <div style={{ marginBottom:12 }}>
              <div className="form-label">Emoji</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {EMOJIS.map(e => <button key={e} onClick={() => setEmoji(e)} style={{ fontSize:18, padding:'4px 6px', borderRadius:8, border: emoji===e ? '2px solid var(--primary)' : '2px solid transparent', background: emoji===e ? 'rgba(0,112,243,0.1)' : 'transparent', cursor:'pointer' }}>{e}</button>)}
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div className="form-label">Cor</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {COLORS.map(c => <button key={c} onClick={() => setColor(c)} style={{ width:28, height:28, borderRadius:8, background:c, border: color===c ? '3px solid white' : '3px solid transparent', cursor:'pointer', outline: color===c ? `2px solid ${c}` : 'none' }} />)}
              </div>
            </div>
            {label && <div style={{ marginBottom:12 }}><span style={{ background:bg(color), color, padding:'3px 10px', borderRadius:20, fontSize:13, fontWeight:600 }}>{emoji} {label}</span></div>}
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!label.trim() || saving}><Plus size={14} />{saving ? 'Salvando...' : 'Adicionar'}</button>
          </div>

          {customCategories.length > 0 && (
            <div>
              <div className="form-label" style={{ marginBottom:10 }}>Minhas categorias ({customCategories.length})</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {customCategories.map(c => (
                  <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg3)', borderRadius:10, padding:'8px 12px' }}>
                    <span style={{ background:c.bg, color:c.color, padding:'3px 10px', borderRadius:20, fontSize:13, fontWeight:600 }}>{c.emoji} {c.label}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, color:'var(--text2)' }}>{c.type === 'income' ? 'Receita' : c.type === 'expense' ? 'Despesa' : 'Ambos'}</span>
                      <button className="btn-icon" onClick={() => deleteCustomCategory(c.id)} style={{ color:'var(--expense)' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
