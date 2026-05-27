// src/shared/components/Footer.jsx
export default function Footer() {
  return (
    <div className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-500 sm:mt-12 sm:pt-6">
      © {new Date().getFullYear()} sockioIT • TDMU IT • Built for learning
    </div>
  );
}
