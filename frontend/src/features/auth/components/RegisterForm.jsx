// src/features/auth/components/RegisterForm.jsx
import { useState } from "react";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";

export default function RegisterForm({ onSubmit, loading }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ displayName, email, password });
      }}
    >
      <div>
        <div className="text-xs text-slate-300 mb-1">Tên hiển thị</div>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div>
        <div className="text-xs text-slate-300 mb-1">Email TDMU</div>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@tdmu.edu.vn" />
      </div>
      <div>
        <div className="text-xs text-slate-300 mb-1">Mật khẩu</div>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button disabled={loading} className="w-full">
        {loading ? "Đang tạo..." : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
