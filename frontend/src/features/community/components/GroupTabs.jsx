import { FileText, Users, BookOpen, CheckCircle, Mail, Inbox } from 'lucide-react';

export default function GroupTabs({
  activeTab,
  onTabChange,
  postCount = 0,
  memberCount = 0,
  ruleCount = 0,
  pendingCount = 0,
  invitationCount = 0,
  joinRequestCount = 0,
  isManager = false,
}) {
  const tabs = [
    { id: 'posts', label: 'Bài viết', icon: FileText, count: postCount },
    { id: 'members', label: 'Thành viên', icon: Users, count: memberCount },
    { id: 'rules', label: 'Quy định', icon: BookOpen, count: ruleCount },
  ];

  if (isManager) {
    tabs.push({ id: 'moderation', label: 'Duyệt bài', icon: CheckCircle, count: pendingCount, badge: pendingCount > 0 ? pendingCount : 0 });
    tabs.push({ id: 'requests', label: 'Yêu cầu tham gia', icon: Inbox, count: joinRequestCount, badge: joinRequestCount > 0 ? joinRequestCount : 0 });
    tabs.push({ id: 'invitations', label: 'Lời mời', icon: Mail, count: invitationCount });
  }

  return (
    <div className="flex gap-2 overflow-auto border-b border-white/10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition',
              isActive
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-300',
            ].join(' ')}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={[
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-700 text-slate-300',
              ].join(' ')}>
                {tab.count}
              </span>
            )}
            {!!tab.badge && (
              <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-xs font-bold text-red-300">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
