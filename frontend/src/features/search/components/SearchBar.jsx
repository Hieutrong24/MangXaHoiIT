// src/features/search/components/SearchBar.jsx
import Input from "../../../shared/components/Input";

export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder="Tìm bài viết, tag, người dùng..." />
      <button
        onClick={() => onSubmit?.()}
        className="px-4 py-2 rounded-2xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition"
      >
        Tìm
      </button>
    </div>
  );
}
