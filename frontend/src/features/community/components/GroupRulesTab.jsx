import { useState } from 'react';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import { Trash2, Plus } from 'lucide-react';

export default function GroupRulesTab({ group = {}, isManager = false, onUpdateRules }) {
  const [editMode, setEditMode] = useState(false);
  const [rules, setRules] = useState(Array.isArray(group?.rules) ? [...group.rules] : []);
  const [newRule, setNewRule] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!onUpdateRules) return;
    try {
      setSaving(true);
      await onUpdateRules({ rules });
      setEditMode(false);
    } catch (e) {
      console.error('Save rules error:', e);
      alert('Không thể cập nhật quy định.');
    } finally {
      setSaving(false);
    }
  }

  function addRule() {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    setRules([...rules, trimmed]);
    setNewRule('');
  }

  function removeRule(index) {
    setRules(rules.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-bold text-white">Quy định nhóm</div>
        {isManager && (
          <Button
            onClick={() => setEditMode(!editMode)}
            className="!h-8 !rounded-lg !bg-cyan-500/15 !px-3 !py-1 !text-xs !text-cyan-300 !shadow-none hover:!bg-cyan-500/25"
          >
            {editMode ? 'Huỷ' : 'Chỉnh sửa'}
          </Button>
        )}
      </div>

      {editMode && isManager ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-100">Danh sách quy định hiện tại</div>
            {rules.length === 0 ? (
              <div className="text-xs text-slate-400">Chưa có quy định nào</div>
            ) : (
              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-lg bg-slate-800/50 p-3">
                    <div className="flex-1 text-sm text-slate-200">{rule}</div>
                    <button
                      onClick={() => removeRule(i)}
                      className="text-red-400 hover:text-red-300"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3">
            <div className="mb-2 text-sm font-semibold text-slate-100">Thêm quy định mới</div>
            <div className="flex gap-2">
              <textarea
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Nhập quy định..."
                rows={2}
                className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
              />
              <button
                onClick={addRule}
                disabled={!newRule.trim()}
                className="rounded-xl bg-cyan-500/20 p-2 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50"
                title="Thêm"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={saving}>
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu quy định'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {Array.isArray(group?.rules) && group.rules.length > 0 ? (
            group.rules.map((rule, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-cyan-400/20 px-2 py-1 text-xs text-cyan-300">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-sm text-slate-200">{rule}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
              Nhóm chưa có quy định nào
            </div>
          )}
        </div>
      )}
    </div>
  );
}
