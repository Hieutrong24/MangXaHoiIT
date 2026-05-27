export default function ProblemPagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"
        disabled={page <= 1}
      >
        «
      </button>

      {start > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
          >
            1
          </button>
          {start > 2 ? <span className="px-1 text-slate-500">…</span> : null}
        </>
      ) : null}

      {pages.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`rounded-lg border px-3 py-2 text-sm ${
            value === page
              ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
              : "border-white/10 bg-slate-950/70 text-slate-200"
          }`}
        >
          {value}
        </button>
      ))}

      {end < totalPages ? (
        <>
          {end < totalPages - 1 ? <span className="px-1 text-slate-500">…</span> : null}
          <button
            type="button"
            onClick={() => onChange(totalPages)}
            className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
          >
            {totalPages}
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"
        disabled={page >= totalPages}
      >
        »
      </button>
    </div>
  );
}
