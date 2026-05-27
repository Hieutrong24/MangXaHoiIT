import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { codeAdminApi } from '../api/code.api';
import { pickMessage, toObject } from '../../../shared/utils/api';
import { formatDateTime } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import KeyValueGrid from '../../../shared/components/KeyValueGrid.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import JsonBlock from '../../../shared/components/JsonBlock.jsx';

export default function SubmissionDetailPage() {
  const { submissionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState({});
  const [result, setResult] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [submissionData, resultData] = await Promise.all([
          codeAdminApi.getSubmission(submissionId),
          codeAdminApi.getSubmissionResult(submissionId),
        ]);
        if (!active) return;
        setSubmission(toObject(submissionData));
        setResult(toObject(resultData));
      } catch (error) {
        if (active) setError(pickMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [submissionId]);

  if (loading) return <LoadingState label="Đang tải chi tiết bài nộp..." />;

  return (
    <div className="stack-lg">
      <PageHeader title="Chi tiết bài nộp" subtitle={submissionId} icon="submissions" actions={<Link className="btn btn-secondary" to="/code/submissions">Quay lại</Link>} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="card section-card hero-detail-card">
        <div>
          <div className="eyebrow">Kết quả chấm bài</div>
          <h3>{submission.problemId || '-'} • {submission.language || submission.languageCode || '-'}</h3>
          <p className="muted">Người dùng: {submission.userId || '-'} • Nộp lúc {formatDateTime(submission.createdAt || submission.submittedAt)}</p>
        </div>
        <StatusBadge value={submission.status || submission.verdict || '-'} />
      </div>
      <KeyValueGrid data={{
        id: submission.id || submission.submissionId,
        userId: submission.userId,
        problemId: submission.problemId,
        language: submission.language || submission.languageCode,
        status: submission.status || submission.verdict,
        score: submission.score,
        createdAt: formatDateTime(submission.createdAt || submission.submittedAt),
      }} />
      <div className="grid-2">
        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Bài nộp</div><h3>Thông tin bài nộp</h3></div></div>
          <JsonBlock value={submission} />
        </div>
        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Kết quả chấm</div><h3>Kết quả chấm</h3></div></div>
          <JsonBlock value={result} />
        </div>
      </div>
    </div>
  );
}
