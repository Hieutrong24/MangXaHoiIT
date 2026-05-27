import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { codeAdminApi } from '../api/code.api';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatNumber, normalizeListField } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import KeyValueGrid from '../../../shared/components/KeyValueGrid.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

const testCaseInitial = {
  input: '',
  expectedOutput: '',
  isSample: false,
  score: 1,
  orderNo: 1,
};

export default function ProblemDetailPage() {
  const { problemId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [problem, setProblem] = useState({});
  const [overview, setOverview] = useState({});
  const [testCases, setTestCases] = useState([]);
  const [testCaseForm, setTestCaseForm] = useState(testCaseInitial);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [problemData, overviewData, testCasesData] = await Promise.all([
        codeAdminApi.getProblem(problemId),
        codeAdminApi.getOverview(problemId),
        codeAdminApi.listTestCases(problemId),
      ]);
      setProblem(toObject(problemData));
      setOverview(toObject(overviewData));
      setTestCases(toArray(testCasesData));
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [problemId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...testCaseForm,
      score: Number(testCaseForm.score),
      orderNo: Number(testCaseForm.orderNo),
    };
    try {
      if (editingId) {
        await codeAdminApi.updateTestCase(editingId, payload);
      } else {
        await codeAdminApi.createTestCase(problemId, payload);
      }
      setEditingId('');
      setTestCaseForm(testCaseInitial);
      await load();
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id || item.testCaseId);
    setTestCaseForm({
      input: item.input || '',
      expectedOutput: item.expectedOutput || item.output || '',
      isSample: Boolean(item.isSample),
      score: item.score ?? 1,
      orderNo: item.orderNo ?? 1,
    });
  }

  async function removeTestCase(item) {
    const id = item.id || item.testCaseId;
    if (!window.confirm(`Xóa testcase ${id}?`)) return;
    try {
      await codeAdminApi.removeTestCase(id);
      await load();
    } catch (error) {
      setError(pickMessage(error));
    }
  }

  const tags = useMemo(() => Array.isArray(problem.tags) ? problem.tags : normalizeListField(problem.tags), [problem]);

  if (loading) return <LoadingState label="Đang tải chi tiết bài tập..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Chi tiết bài tập"
        subtitle={problem.title || problemId}
        icon="code"
        actions={<><Link className="btn btn-secondary" to={`/code/problems/${problemId}/edit`}>Sửa bài tập</Link><Link className="btn btn-secondary" to="/code/problems">Quay lại</Link></>}
      />
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stats-grid stats-grid-tight">
        <StatCard label="Test cases" value={testCases.length} icon="submissions" tone="info" />
        <StatCard label="Time limit" value={problem.timeLimitMs ?? '-'} icon="activity" tone="default" hint="ms" />
        <StatCard label="Memory" value={problem.memoryLimitMb ?? '-'} icon="dashboard" tone="warning" hint="MB" />
      </div>

      <div className="card section-card hero-detail-card">
        <div>
          <div className="eyebrow">Thông tin bài tập</div>
          <h3>{problem.title || '-'}</h3>
          <div className="tag-list large-gap">{tags.length ? tags.map((tag) => <span className="tag" key={tag}>{tag}</span>) : <span className="muted">Không có tag</span>}</div>
        </div>
        <StatusBadge value={problem.status || (problem.isPublished ? 'published' : 'draft')} />
      </div>

      <KeyValueGrid data={{
        id: problem.id || problem.problemId,
        difficulty: problem.difficulty,
        slug: problem.slug,
        status: problem.status || (problem.isPublished ? 'published' : 'draft'),
        timeLimitMs: problem.timeLimitMs,
        memoryLimitMb: problem.memoryLimitMb,
      }} />

      <div className="grid-2">
        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Statement</div><h3>Nội dung đề bài</h3></div></div>
          <p className="long-copy">{problem.statement || problem.description || 'Không có nội dung đề bài.'}</p>
        </div>
        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Overview</div><h3>Chỉ số tổng hợp</h3></div></div>
          <div className="detail-grid single-column">
            {Object.entries(overview || {}).slice(0, 8).map(([key, value]) => (
              <div className="detail-item" key={key}>
                <div className="detail-key">{key}</div>
                <div className="detail-value">{String(value)}</div>
              </div>
            ))}
            {!Object.keys(overview || {}).length ? <div className="empty-inline">Không có dữ liệu overview.</div> : null}
          </div>
        </div>
      </div>

      <div className="card section-card">
        <div className="section-title-row"><div><div className="eyebrow">Quản lý testcase</div><h3>{editingId ? 'Sửa testcase' : 'Thêm testcase mới'}</h3></div></div>
        <form className="form-grid form-grid-2" onSubmit={handleSubmit}>
          <label><span>Order No</span><input type="number" value={testCaseForm.orderNo} onChange={(e) => setTestCaseForm((prev) => ({ ...prev, orderNo: e.target.value }))} /></label>
          <label><span>Score</span><input type="number" value={testCaseForm.score} onChange={(e) => setTestCaseForm((prev) => ({ ...prev, score: e.target.value }))} /></label>
          <label className="full-row"><span>Input</span><textarea rows="5" value={testCaseForm.input} onChange={(e) => setTestCaseForm((prev) => ({ ...prev, input: e.target.value }))} /></label>
          <label className="full-row"><span>Expected output</span><textarea rows="5" value={testCaseForm.expectedOutput} onChange={(e) => setTestCaseForm((prev) => ({ ...prev, expectedOutput: e.target.value }))} /></label>
          <label className="checkbox-row"><input type="checkbox" checked={Boolean(testCaseForm.isSample)} onChange={(e) => setTestCaseForm((prev) => ({ ...prev, isSample: e.target.checked }))} /><span>Là sample testcase</span></label>
          <div className="row-actions">
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : editingId ? 'Cập nhật testcase' : 'Thêm testcase'}</button>
            {editingId ? <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(''); setTestCaseForm(testCaseInitial); }}>Hủy sửa</button> : null}
          </div>
        </form>
      </div>

      <div className="card section-card table-wrap">
        <div className="section-title-row"><div><div className="eyebrow">Testcase list</div><h3>Danh sách test case</h3></div><div className="meta-chip">{formatNumber(testCases.length)} bản ghi</div></div>
        <table className="table admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Order</th>
              <th>Score</th>
              <th>Sample</th>
              <th>Input</th>
              <th>Output</th>
              <th>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((item, index) => {
              const id = item.id || item.testCaseId || index;
              return (
                <tr key={id}>
                  <td className="code-cell">{id}</td>
                  <td>{item.orderNo ?? '-'}</td>
                  <td>{item.score ?? '-'}</td>
                  <td><StatusBadge value={item.isSample ? 'sample' : 'hidden'} /></td>
                  <td className="truncate-cell">{item.input || '-'}</td>
                  <td className="truncate-cell">{item.expectedOutput || item.output || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-secondary" onClick={() => startEdit(item)}><AppIcon name="pencil" size={16} />Sửa</button>
                      <button className="btn btn-danger" onClick={() => removeTestCase(item)}><AppIcon name="trash" size={16} />Xóa</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
