import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { codeAdminApi } from '../api/code.api';
import { pickMessage, toObject } from '../../../shared/utils/api';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';

const initialState = {
  title: '',
  slug: '',
  difficulty: 'easy',
  statement: '',
  inputFormat: '',
  outputFormat: '',
  constraints: '',
  sampleInput: '',
  sampleOutput: '',
  explanation: '',
  tags: '',
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  isPublished: true,
};

export default function ProblemEditorPage({ mode }) {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (mode !== 'edit' || !problemId) return undefined;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = toObject(await codeAdminApi.getProblem(problemId));
        if (!active) return;
        setForm({
          ...initialState,
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        });
      } catch (error) {
        if (active) setError(pickMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [mode, problemId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      timeLimitMs: Number(form.timeLimitMs),
      memoryLimitMb: Number(form.memoryLimitMb),
      tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
    };
    try {
      const data = mode === 'edit'
        ? await codeAdminApi.updateProblem(problemId, payload)
        : await codeAdminApi.createProblem(payload);
      const id = data?.data?.id || data?.id || problemId;
      navigate(id ? `/code/problems/${id}` : '/code/problems');
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Đang tải bài tập..." />;

  return (
    <div className="stack-lg">
      <PageHeader title={mode === 'edit' ? 'Sửa bài tập' : 'Thêm bài tập'} subtitle="Biểu mẫu quản trị bài code." actions={<Link className="btn btn-secondary" to="/code/problems">Quay lại</Link>} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      <form className="card form-grid form-grid-2" onSubmit={handleSubmit}>
        <label><span>Tiêu đề</span><input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required /></label>
        <label><span>Slug</span><input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} /></label>
        <label><span>Độ khó</span><select value={form.difficulty} onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
        <label><span>Tags</span><input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="array, dp" /></label>
        <label><span>Time limit (ms)</span><input type="number" value={form.timeLimitMs} onChange={(e) => setForm((prev) => ({ ...prev, timeLimitMs: e.target.value }))} /></label>
        <label><span>Memory limit (MB)</span><input type="number" value={form.memoryLimitMb} onChange={(e) => setForm((prev) => ({ ...prev, memoryLimitMb: e.target.value }))} /></label>
        <label className="checkbox-row"><input type="checkbox" checked={Boolean(form.isPublished)} onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))} /><span>Published</span></label>
        <div />
        <label className="full-row"><span>Statement</span><textarea rows="7" value={form.statement} onChange={(e) => setForm((prev) => ({ ...prev, statement: e.target.value }))} /></label>
        <label className="full-row"><span>Input format</span><textarea rows="4" value={form.inputFormat} onChange={(e) => setForm((prev) => ({ ...prev, inputFormat: e.target.value }))} /></label>
        <label className="full-row"><span>Output format</span><textarea rows="4" value={form.outputFormat} onChange={(e) => setForm((prev) => ({ ...prev, outputFormat: e.target.value }))} /></label>
        <label className="full-row"><span>Constraints</span><textarea rows="4" value={form.constraints} onChange={(e) => setForm((prev) => ({ ...prev, constraints: e.target.value }))} /></label>
        <label><span>Sample input</span><textarea rows="5" value={form.sampleInput} onChange={(e) => setForm((prev) => ({ ...prev, sampleInput: e.target.value }))} /></label>
        <label><span>Sample output</span><textarea rows="5" value={form.sampleOutput} onChange={(e) => setForm((prev) => ({ ...prev, sampleOutput: e.target.value }))} /></label>
        <label className="full-row"><span>Explanation</span><textarea rows="4" value={form.explanation} onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))} /></label>
        <div className="full-row row-actions">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu bài tập'}</button>
        </div>
      </form>
    </div>
  );
}
