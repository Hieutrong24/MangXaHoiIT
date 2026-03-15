// src/app/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../shared/components/Sidebar";
import Header from "../../shared/components/Header";
import Footer from "../../shared/components/Footer";

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">
          <aside className="hidden lg:block sticky top-0 h-screen border-r border-white/10 bg-slate-950/40 backdrop-blur-xl">
            <Sidebar />
          </aside>

          <main className="min-h-screen">
            <Header />
            <div className="px-4 py-6">
              <Outlet />
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
