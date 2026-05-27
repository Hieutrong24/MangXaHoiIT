import { useEffect, useMemo, useState } from 'react';
import { pickMessage, toArray, toObject } from '../../../shared/utils/api';
import { formatDateTime, formatNumber, initials } from '../../../shared/utils/format';
import { communicationAdminApi } from '../../../shared/utils/adminApi';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import LoadingState from '../../../shared/components/LoadingState.jsx';
import EmptyState from '../../../shared/components/EmptyState.jsx';
import StatCard from '../../../shared/components/StatCard.jsx';
import AppIcon from '../../../shared/components/AppIcon.jsx';

function normalizeGroup(item) {
  return {
    chatId: item?.chatId || item?.id,
    name: item?.name || 'Chat chưa có tên',
    description: item?.description || '',
    memberCount: item?.memberCount || 0,
    lastMessageAt: item?.lastMessageAt || null,
    lastMessagePreview: item?.lastMessagePreview || '',
    ownerId: item?.ownerId || item?.createdBy || '-',
  };
}

function normalizeMessage(item) {
  return {
    id: item?.id || item?._id,
    senderId: item?.senderId || '-',
    type: item?.type || 'text',
    content: item?.content || '',
    createdAt: item?.createdAt || null,
  };
}

export default function ChatOperationsPage() {
  const [dashboard, setDashboard] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboardAndGroups() {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, groupsData] = await Promise.all([
        communicationAdminApi.chatDashboard(),
        communicationAdminApi.listChatGroups({ page: 1, limit: 24 }),
      ]);
      const nextGroups = toArray(groupsData).map(normalizeGroup);
      setDashboard(toObject(dashboardData));
      setGroups(nextGroups);
      if (!selectedChatId && nextGroups[0]?.chatId) setSelectedChatId(nextGroups[0].chatId);
    } catch (nextError) {
      setError(pickMessage(nextError));
      setDashboard({});
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadChatDetail(chatId) {
    if (!chatId) return;
    setDetailLoading(true);
    try {
      const [groupData, messageData] = await Promise.all([
        communicationAdminApi.getChatGroup(chatId),
        communicationAdminApi.listChatMessages(chatId, { limit: 50 }),
      ]);
      setSelectedGroup(toObject(groupData.group || groupData));
      setMessages(toArray(messageData).map(normalizeMessage));
    } catch (nextError) {
      setError(pickMessage(nextError));
      setSelectedGroup({});
      setMessages([]);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardAndGroups();
  }, []);

  useEffect(() => {
    loadChatDetail(selectedChatId);
  }, [selectedChatId]);

  async function removeGroup(chatId) {
    if (!window.confirm('Xóa nhóm chat này và toàn bộ tin nhắn đã lưu?')) return;
    try {
      await communicationAdminApi.deleteChatGroup(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId('');
        setSelectedGroup({});
        setMessages([]);
      }
      await loadDashboardAndGroups();
    } catch (nextError) {
      setError(pickMessage(nextError));
    }
  }

  async function removeMessage(messageId) {
    if (!window.confirm('Xóa tin nhắn này?')) return;
    try {
      await communicationAdminApi.deleteChatMessage(messageId);
      await loadChatDetail(selectedChatId);
    } catch (nextError) {
      setError(pickMessage(nextError));
    }
  }

  const stats = useMemo(() => ({
    totalGroups: dashboard.totalGroups || 0,
    totalMessages: dashboard.totalMessages || 0,
    totalMembers: dashboard.totalMembers || 0,
    recentMessages7d: dashboard.recentMessages7d || 0,
  }), [dashboard]);

  if (loading) return <LoadingState label="Đang tải vận hành chat..." />;

  return (
    <div className="stack-lg">
      <PageHeader
        title="Vận hành chat"
        subtitle="Kiểm tra hội thoại nhóm, rà soát tin nhắn đã lưu và xử lý các không gian chat có vấn đề trong bố cục hai khung."
        icon="chat"
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stats-grid content-summary-grid compact-stat-grid">
        <StatCard label="Nhóm chat" value={stats.totalGroups} icon="chat" tone="info" hint="Không gian" />
        <StatCard label="Tin nhắn" value={stats.totalMessages} icon="comment" tone="success" hint="Dung lượng" />
        <StatCard label="Thành viên" value={stats.totalMembers} icon="users" tone="violet" hint="Phạm vi" />
        <StatCard label="7 ngày gần đây" value={stats.recentMessages7d} icon="activity" tone="warning" hint="Nhịp độ" />
      </div>

      {!groups.length ? <EmptyState title="Không có nhóm chat" description="Chưa có nhóm chat nào khả dụng để kiểm duyệt." /> : null}

      {groups.length ? (
        <div className="split-layout split-layout-wide">
          <div className="card section-card">
            <div className="section-title-row">
              <div>
                <div className="eyebrow">Nhóm chat</div>
                <h3>Không gian hội thoại</h3>
              </div>
              <div className="meta-chip">{formatNumber(groups.length)} nhóm</div>
            </div>
            <div className="selection-list">
              {groups.map((group) => (
                <button key={group.chatId} className={`selection-item ${selectedChatId === group.chatId ? 'active' : ''}`} onClick={() => setSelectedChatId(group.chatId)}>
                  <div className="selection-copy">
                    <strong>{group.name}</strong>
                    <span className="muted small">{group.memberCount} thành viên - chủ sở hữu {group.ownerId}</span>
                    <span className="muted tiny truncate-copy">{group.lastMessagePreview || group.description || 'Chưa có nội dung xem trước'}</span>
                  </div>
                  <span className="surface-pill">{formatDateTime(group.lastMessageAt)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card section-card">
            {detailLoading ? <LoadingState label="Đang tải chi tiết chat..." /> : null}
            {!detailLoading && !selectedGroup?.chatId ? <EmptyState title="Chọn một nhóm chat" description="Chọn một hội thoại để xem lịch sử tin nhắn và xử lý nội dung có hại." /> : null}
            {!detailLoading && selectedGroup?.chatId ? (
              <div className="stack-lg">
                <div className="section-title-row">
                  <div>
                    <div className="eyebrow">Chi tiết hội thoại</div>
                    <h3>{selectedGroup.name}</h3>
                    <p className="muted small">{selectedGroup.description || 'Không có mô tả'}</p>
                  </div>
                  <button className="btn btn-danger" onClick={() => removeGroup(selectedGroup.chatId)}><AppIcon name="trash" size={16} />Xóa nhóm</button>
                </div>
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-key">ID chat</div><strong className="code-inline">{selectedGroup.chatId}</strong></div>
                  <div className="detail-item"><div className="detail-key">Chủ sở hữu</div><strong>{selectedGroup.ownerId || selectedGroup.createdBy}</strong></div>
                  <div className="detail-item"><div className="detail-key">Thành viên</div><strong>{formatNumber(selectedGroup.memberCount || 0)}</strong></div>
                  <div className="detail-item"><div className="detail-key">Hoạt động cuối</div><strong>{formatDateTime(selectedGroup.lastMessageAt)}</strong></div>
                </div>
                <div className="message-stream">
                  {messages.length ? messages.map((message) => (
                    <div className="message-card" key={message.id}>
                      <div className="message-card-head">
                        <div className="person-cell">
                          <div className="person-avatar">{initials(message.senderId)}</div>
                          <div>
                            <strong>{message.senderId}</strong>
                            <div className="muted tiny">{message.type} • {formatDateTime(message.createdAt)}</div>
                          </div>
                        </div>
                        <button className="btn btn-danger" onClick={() => removeMessage(message.id)}><AppIcon name="trash" size={14} />Xóa</button>
                      </div>
                      <div className="message-card-body">{message.content}</div>
                    </div>
                  )) : <EmptyState title="Không có tin nhắn" description="Chat này chưa có lịch sử tin nhắn trong lát cắt hiện tại." />}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
