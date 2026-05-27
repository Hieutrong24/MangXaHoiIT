import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usersAdminApi } from '../api/users.api';
import { pickMessage, toObject } from '../../../shared/utils/api';
import { formatDateTime, initials, normalizeListField } from '../../../shared/utils/format';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import KeyValueGrid from '../../../shared/components/KeyValueGrid.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';

export default function UserDetailPage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await usersAdminApi.get(userId);
        if (!active) return;
        setUser(toObject(data));
      } catch (error) {
        if (!active) return;
        setError(pickMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [userId]);

  const roles = useMemo(() => normalizeListField(user?.roles || user?.roleNames || user?.role), [user]);

  if (loading) return <LoadingState label="Đang tải chi tiết người dùng..." />;

  const displayName = user?.fullName || user?.displayName || user?.full_name || user?.email || userId;
  const status = user?.status || (user?.isLocked || user?.lockedAt ? 'locked' : 'active');

  return (
    <div className="stack-lg">
      <PageHeader title="Chi tiết người dùng" subtitle={displayName} icon="users" actions={<Link className="btn btn-secondary" to="/users">Quay lại</Link>} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {user ? (
        <>
          <div className="card section-card hero-detail-card">
            <div className="person-cell person-cell-large">
              <div className="person-avatar lg">{initials(displayName)}</div>
              <div>
                <h3>{displayName}</h3>
                <div className="muted">{user.email || user.tdmuEmail || '-'}</div>
                <div className="tiny code-inline">{user.id || user.userId}</div>
              </div>
            </div>
            <StatusBadge value={status} />
          </div>
          <KeyValueGrid data={{
            id: user.id || user.userId,
            username: user.username,
            email: user.email || user.tdmuEmail,
            status,
            isLocked: String(Boolean(user.isLocked || user.lockedAt)),
            createdAt: formatDateTime(user.createdAt),
            updatedAt: formatDateTime(user.updatedAt),
            roles,
          }} />
          <div className="grid-2">
            <div className="card section-card">
              <div className="section-title-row"><div><div className="eyebrow">Hồ sơ</div><h3>Thông tin nhận diện</h3></div></div>
              <div className="detail-grid single-column">
                <div className="detail-item"><div className="detail-key">Họ tên</div><div className="detail-value">{displayName}</div></div>
                <div className="detail-item"><div className="detail-key">Email</div><div className="detail-value">{user.email || user.tdmuEmail || '-'}</div></div>
                <div className="detail-item"><div className="detail-key">Username</div><div className="detail-value">{user.username || '-'}</div></div>
                <div className="detail-item"><div className="detail-key">Khóa gần nhất</div><div className="detail-value">{formatDateTime(user.lockedAt)}</div></div>
              </div>
            </div>
            <div className="card section-card">
              <div className="section-title-row"><div><div className="eyebrow">Vai trò</div><h3>Quyền truy cập</h3></div></div>
              <div className="tag-list large-gap">
                {roles.length ? roles.map((role) => <span className="tag" key={role}>{role}</span>) : <span className="muted">Không có dữ liệu vai trò.</span>}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
