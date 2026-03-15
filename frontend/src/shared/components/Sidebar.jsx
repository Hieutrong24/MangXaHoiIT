import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Tags,
  Code2,
  MessageSquare,MessageCircle,
  Bell,
  Settings,
  PenLine,
  User,
} from "lucide-react";
import Brand from "./Brand";
import { cn } from "../utils/cn";

const items = [
  { to: "/feed", label: "Bảng tin", icon: Home },
  { to: "/posts", label: "Bài viết", icon: FileText },
  { to: "/tags", label: "Chủ đề", icon: Tags },
  { to: "/code/problems", label: "Luyện code", icon: Code2 },
 { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/notifications", label: "Thông báo", icon: Bell },
  { to: "/settings", label: "Cài đặt", icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="px-3 pt-4">
        <Brand />
      </div>

      <div className="px-3">  
        <NavLink
          to="/posts/new"
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold text-slate-950 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 hover:brightness-110 transition shadow-soft"
        >
          <PenLine className="h-4 w-4" />
          Đăng bài
        </NavLink>
      </div>

      <nav className="px-3 flex-1 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold border border-transparent transition",
                  isActive
                    ? "bg-white/10 border-white/10"
                    : "hover:bg-white/5 hover:border-white/10 text-slate-200"
                )
              }
            >
              <Icon className="h-4 w-4 text-slate-200" />
              {it.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <NavLink
          to="/me/edit"
          className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          <User className="h-4 w-4" />
          Chỉnh sửa hồ sơ
        </NavLink>
      </div>
    </div>
  );
}
