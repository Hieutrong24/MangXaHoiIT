export default function QuizQuestionCard({ question, value, onChange, index = 0, reveal = false }) {
  const selected = String(value || '');
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Câu {index + 1}</div>
      <div className="mt-2 text-base font-semibold text-white">{question?.content || question?.title || 'Câu hỏi'}</div>
      <div className="mt-4 space-y-3">
        {(question?.choices || []).map((choice) => {
          const choiceId = String(choice.choiceId || choice.id);
          const isSelected = selected === choiceId;
          const isCorrect = !!choice.isCorrect;
          const shouldRevealCorrect = reveal && isCorrect;
          const shouldRevealWrong = reveal && isSelected && !isCorrect;
          return (
            <label
              key={choiceId}
              className={[
                'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition',
                shouldRevealCorrect
                  ? 'border-emerald-300/30 bg-emerald-500/10'
                  : shouldRevealWrong
                  ? 'border-rose-300/30 bg-rose-500/10'
                  : isSelected
                  ? 'border-sky-300/30 bg-sky-500/10'
                  : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
              ].join(' ')}
            >
              <input type="radio" name={`question-${question.questionId || question.id}`} className="mt-1" checked={isSelected} onChange={() => onChange(choiceId)} />
              <div className="min-w-0 flex-1 text-sm text-slate-100">{choice.content || choice.label}</div>
            </label>
          );
        })}
      </div>
      {reveal && question?.explanation ? <div className="mt-4 rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-slate-300">{question.explanation}</div> : null}
    </div>
  );
}
