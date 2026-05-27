export default function SampleTestCases({ samples = [] }) {
  if (!samples.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        Chưa có sample testcase.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {samples.map((sample) => (
        <div key={sample.testCaseId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-100">Sample #{sample.orderNo}</div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Input</div>
              <pre className="overflow-auto rounded-xl bg-black/40 p-3 text-sm text-slate-100 whitespace-pre-wrap">{sample.inputText}</pre>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Output</div>
              <pre className="overflow-auto rounded-xl bg-black/40 p-3 text-sm text-slate-100 whitespace-pre-wrap">{sample.outputText}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
