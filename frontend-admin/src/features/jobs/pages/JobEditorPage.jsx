import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { jobsAdminApi } from '../api/jobs.api';
import { pickMessage, toObject } from '../../../shared/utils/api';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';

const initialState = {
  title: '',
  company: '',
  location: '',
  employmentType: 'full-time',
  experienceLevel: 'junior',
  salaryMin: '',
  salaryMax: '',
  currency: 'VND',
  deadline: '',
  isPublished: true,
  tags: '',
  description: '',
  requirements: '',
  benefits: '',
};

export default function JobEditorPage({ mode }) {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (mode !== 'edit' || !jobId) return undefined;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = toObject(await jobsAdminApi.get(jobId));
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
  }, [mode, jobId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
      salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
      tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
    };
    try {
      const data = mode === 'edit'
        ? await jobsAdminApi.update(jobId, payload)
        : await jobsAdminApi.create(payload);
      const id = data?.data?.id || data?.id || jobId;
      navigate(id ? `/jobs/${id}` : '/jobs');
    } catch (error) {
      setError(pickMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Đang tải job..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title={mode === 'edit' ? 'Sửa job' : 'Tạo job'}
        subtitle="Biểu mẫu quản trị tin tuyển dụng theo đúng cấu trúc dữ liệu hiện tại, sẵn sàng nối thêm endpoint khi cần."
        actions={<Link className="btn btn-secondary" to="/jobs">Quay lại</Link>}
      />
      {error ? <div className="alert alert-error">{error}</div> : null}
      <form className="card form-grid form-grid-2" onSubmit={handleSubmit}>
        <label><span>Tiêu đề</span><input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required /></label>
        <label><span>Công ty</span><input value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} /></label>
        <label><span>Địa điểm</span><input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} /></label>
        <label><span>Loại việc làm</span><input value={form.employmentType} onChange={(e) => setForm((prev) => ({ ...prev, employmentType: e.target.value }))} /></label>
        <label><span>Cấp độ</span><input value={form.experienceLevel} onChange={(e) => setForm((prev) => ({ ...prev, experienceLevel: e.target.value }))} /></label>
        <label><span>Deadline</span><input type="datetime-local" value={form.deadline || ''} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} /></label>
        <label><span>Lương tối thiểu</span><input type="number" value={form.salaryMin} onChange={(e) => setForm((prev) => ({ ...prev, salaryMin: e.target.value }))} /></label>
        <label><span>Lương tối đa</span><input type="number" value={form.salaryMax} onChange={(e) => setForm((prev) => ({ ...prev, salaryMax: e.target.value }))} /></label>
        <label><span>Tiền tệ</span><input value={form.currency} onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))} /></label>
        <label><span>Tags</span><input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="react, nodejs, devops" /></label>
        <label className="checkbox-row"><input type="checkbox" checked={Boolean(form.isPublished)} onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))} /><span>Published</span></label>
        <div />
        <label className="full-row"><span>Mô tả</span><textarea rows="6" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} /></label>
        <label className="full-row"><span>Yêu cầu</span><textarea rows="5" value={form.requirements} onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))} /></label>
        <label className="full-row"><span>Quyền lợi</span><textarea rows="5" value={form.benefits} onChange={(e) => setForm((prev) => ({ ...prev, benefits: e.target.value }))} /></label>
        <div className="full-row row-actions">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu job'}</button>
        </div>
      </form>
    </div>
  );
}
