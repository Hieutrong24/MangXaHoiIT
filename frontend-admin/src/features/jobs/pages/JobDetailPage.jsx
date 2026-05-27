import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jobsAdminApi } from '../api/jobs.api';
import { pickMessage, toObject } from '../../../shared/utils/api';
import { formatDate, normalizeListField } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import KeyValueGrid from '../../../shared/components/KeyValueGrid.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';

function splitLines(value) {
  return normalizeListField(value);
}

export default function JobDetailPage() {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await jobsAdminApi.get(jobId);
        if (!active) return;
        setJob(toObject(data));
      } catch (error) {
        if (active) setError(pickMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [jobId]);

  const requirements = useMemo(() => splitLines(job.requirements), [job]);
  const benefits = useMemo(() => splitLines(job.benefits), [job]);

  if (loading) return <LoadingState label="Đang tải chi tiết job..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Chi tiết job"
        subtitle={job.title || job.name || jobId}
        icon="jobs"
        actions={<><Link className="btn btn-secondary" to={`/jobs/${jobId}/edit`}>Sửa</Link><Link className="btn btn-secondary" to={`/jobs/${jobId}/applications`}>Ứng tuyển</Link></>}
      />
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="card section-card hero-detail-card">
        <div>
          <div className="eyebrow">Thông tin vị trí</div>
          <h3>{job.title || job.name || '-'}</h3>
          <p className="muted">{job.company || job.companyName || '-'} • {job.location || '-'} • {job.employmentType || '-'}</p>
        </div>
        <StatusBadge value={job.status || (job.isPublished ? 'published' : 'draft')} />
      </div>
      <KeyValueGrid data={{
        id: job.id || job.jobId,
        company: job.company || job.companyName,
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        deadline: formatDate(job.deadline || job.expiresAt),
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        tags: Array.isArray(job.tags) ? job.tags : splitLines(job.tags),
      }} />
      <div className="grid-2">
        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Mô tả</div><h3>Nội dung công việc</h3></div></div>
          <p className="long-copy">{job.description || 'Không có mô tả chi tiết.'}</p>
        </div>
        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Yêu cầu</div><h3>Checklist tuyển dụng</h3></div></div>
          <ul className="detail-list">
            {requirements.length ? requirements.map((item) => <li key={item}>{item}</li>) : <li>Không có yêu cầu chi tiết.</li>}
          </ul>
        </div>
      </div>
      <div className="card section-card">
        <div className="section-title-row"><div><div className="eyebrow">Quyền lợi</div><h3>Benefits</h3></div></div>
        <ul className="detail-list grid-list-two">
          {benefits.length ? benefits.map((item) => <li key={item}>{item}</li>) : <li>Không có quyền lợi chi tiết.</li>}
        </ul>
      </div>
    </div>
  );
}
