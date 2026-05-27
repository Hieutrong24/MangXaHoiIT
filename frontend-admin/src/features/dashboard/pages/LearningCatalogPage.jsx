import { useEffect, useState } from 'react';
import { pickMessage, toArray } from '../../../shared/utils/api';
import { formatDateTime, formatNumber } from '../../../shared/utils/format';
import { learningAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

export default function LearningCatalogPage() {
  const [filters, setFilters] = useState({ keyword: '', pageSize: 12, activeOnly: false });
  const [payload, setPayload] = useState({ paths: [], lessons: [], quizzes: [], challenges: [], badges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [paths, lessons, quizzes, challenges, badges] = await Promise.all([
        learningAdminApi.listPaths({ keyword: filters.keyword, pageSize: filters.pageSize }),
        learningAdminApi.listLessons({ keyword: filters.keyword, pageSize: filters.pageSize }),
        learningAdminApi.listQuizzes({ keyword: filters.keyword, pageSize: filters.pageSize }),
        learningAdminApi.listChallenges({ activeOnly: filters.activeOnly, pageSize: filters.pageSize }),
        learningAdminApi.listBadges({ pageSize: filters.pageSize }),
      ]);
      setPayload({
        paths: toArray(paths),
        lessons: toArray(lessons),
        quizzes: toArray(quizzes),
        challenges: toArray(challenges),
        badges: toArray(badges),
      });
    } catch (nextError) {
      setError(pickMessage(nextError));
      setPayload({ paths: [], lessons: [], quizzes: [], challenges: [], badges: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.pageSize, filters.activeOnly]);

  if (loading) return <LoadingState label="Loading learning catalog..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Learning Catalog"
        subtitle="A catalog-oriented workspace for paths, lessons, quizzes, challenges, and badges with enough density for content operations."
        icon="layers"
      />

      <div className="card section-card">
        <form className="toolbar toolbar-rich" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <div className="input-with-icon grow-2">
            <AppIcon name="search" size={16} />
            <input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="Search path, lesson, or quiz titles" />
          </div>
          <select value={filters.pageSize} onChange={(event) => setFilters((prev) => ({ ...prev, pageSize: Number(event.target.value) }))}>
            <option value={8}>8 / section</option>
            <option value={12}>12 / section</option>
            <option value={20}>20 / section</option>
          </select>
          <label className="checkbox-row">
            <input type="checkbox" checked={filters.activeOnly} onChange={(event) => setFilters((prev) => ({ ...prev, activeOnly: event.target.checked }))} />
            <span>Active challenges only</span>
          </label>
          <button className="btn btn-primary"><AppIcon name="refresh" size={16} />Refresh</button>
        </form>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="grid-2">
        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Paths</div><h3>Learning paths</h3></div><div className="meta-chip">{formatNumber(payload.paths.length)}</div></div>
          <div className="service-list">
            {payload.paths.map((item) => (
              <div className="service-row" key={item.pathId}>
                <div>
                  <strong>{item.title}</strong>
                  <div className="muted small">{item.lessonCount || 0} lessons • {item.totalXpReward || 0} XP</div>
                </div>
                <span className="surface-pill">{item.isPublic ? 'Public' : 'Private'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Lessons</div><h3>Lessons</h3></div><div className="meta-chip">{formatNumber(payload.lessons.length)}</div></div>
          <div className="service-list">
            {payload.lessons.map((item) => (
              <div className="service-row" key={item.lessonId}>
                <div>
                  <strong>{item.title}</strong>
                  <div className="muted small">{item.lessonType} • {item.itemCount || 0} items</div>
                </div>
                <span className="surface-pill">{item.isPublished ? 'Published' : 'Draft'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Quizzes</div><h3>Assessments</h3></div><div className="meta-chip">{formatNumber(payload.quizzes.length)}</div></div>
          <div className="service-list">
            {payload.quizzes.map((item) => (
              <div className="service-row" key={item.quizId}>
                <div>
                  <strong>{item.title}</strong>
                  <div className="muted small">{item.questionCount || 0} questions • pass {item.passingScore || 0}</div>
                </div>
                <span className="surface-pill">{item.isPublished ? 'Published' : 'Draft'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card section-card">
          <div className="section-title-row"><div><div className="eyebrow">Challenges</div><h3>Challenge roster</h3></div><div className="meta-chip">{formatNumber(payload.challenges.length)}</div></div>
          <div className="service-list">
            {payload.challenges.map((item) => (
              <div className="service-row" key={item.challengeId}>
                <div>
                  <strong>{item.title}</strong>
                  <div className="muted small">{item.challengeType} • reward {item.xpReward || 0} XP</div>
                </div>
                <span className="surface-pill">{formatDateTime(item.endsAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card section-card">
        <div className="section-title-row"><div><div className="eyebrow">Badges</div><h3>Recognition catalog</h3></div><div className="meta-chip">{formatNumber(payload.badges.length)}</div></div>
        <div className="grid-list-two">
          {payload.badges.map((item) => (
            <div className="detail-item" key={item.badgeId}>
              <div className="detail-key">{item.code}</div>
              <strong>{item.name}</strong>
              <div className="muted small">{item.description || 'No description'}</div>
              <div className="muted tiny">Awarded {formatNumber(item.awardCount || 0)} times</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
