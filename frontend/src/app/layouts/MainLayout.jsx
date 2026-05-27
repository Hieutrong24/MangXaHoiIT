import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <Outlet />
    </div>
  );
}