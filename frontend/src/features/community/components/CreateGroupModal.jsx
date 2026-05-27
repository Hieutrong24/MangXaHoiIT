import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";

const INITIAL_FORM = {
  name: '',
  description: '',
  category: 'study',
  privacy: 'public',
  topics: '',
  rules: '',
  website: '',
  contactEmail: '',
};

export default function CreateGroupModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!open) setForm(INITIAL_FORM);
  }, [open]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Tạo nhóm mới">
      <div className="space-y-3">
        <Input placeholder="Tên nhóm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-sm text-white" rows={4} placeholder="Mô tả nhóm học tập, dự án, hỏi đáp..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Category: study/project/qna" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <select className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 text-sm text-white" value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
          </select>
        </div>
        <Input placeholder="Chủ đề, ví dụ: react, java, lab" value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} />
        <Input placeholder="Quy định ngắn, phân tách bằng dấu |" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Website (https://...)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input placeholder="Email liên hệ" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSubmit({
            ...form,
            topics: form.topics.split(',').map((x) => x.trim()).filter(Boolean),
            rules: form.rules.split('|').map((x) => x.trim()).filter(Boolean),
          })}>Tạo nhóm</Button>
        </div>
      </div>
    </Modal>
  );
}
