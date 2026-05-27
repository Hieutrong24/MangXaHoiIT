import { BellRing, BriefcaseBusiness, CheckCircle2, Clock3, MessageCircleMore, ShieldCheck, UserPlus2, Users } from 'lucide-react';
import { buildAvatarCandidates } from '../../../shared/utils/avatar';

function typeIcon(typeKey) {
  switch (typeKey) {
    case 'friend_request_sent':
      return UserPlus2;
    case 'message_sent':
      return MessageCircleMore;
    case 'group_invite':
    case 'group_member_invited':
    case 'group_invite_accepted':
    case 'group_invite_rejected':
    case 'group_post_pending':
    case 'group_post_approved':
    case 'group_post_rejected':
      return Users;
    case 'job_created':
    case 'job_published':
    case 'job_application_created':
    case 'job_application_submitted':
    case 'job_application_status_changed':
      return BriefcaseBusiness;
    default:
      return BellRing;
  }
}

function resolveMeta(n) {
  if (n?.groupName) return `Nhóm: ${n.groupName}`;
  if (n?.jobTitle) return `Vị trí: ${n.jobTitle}`;
  if (n?.companyName) return `Đơn vị: ${n.companyName}`;
  return n?.actorEmail || '';
}

export default function NotificationItem({ n, onClick }) {
  const unread = !n?.isRead;
  const Icon = typeIcon(n?.typeKey);
  const avatarCandidates = buildAvatarCandidates({
    avatarUrl: n?.actorAvatarUrl,
    fullName: n?.actorName,
    email: n?.actorEmail,
    username: n?.actorName,
    id: n?.actorId,
    userId: n?.actorId,
  });
  const avatarUrl = avatarCandidates?.[0] || '';
  const meta = resolveMeta(n);

  return (
    <button
      type="button"
      onClick={() => onClick?.(n)}
      className={`w-full rounded-3xl border p-4 text-left transition sm:p-5 ${
        unread
          ? 'border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/15'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 sm:h-12 sm:w-12">
          {avatarUrl ? (
            <img src={avatarUrl} alt={n?.actorName || 'avatar'} className="h-full w-full object-cover" />
          ) : null}
          <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-xl border border-slate-950 bg-slate-900 text-cyan-300 shadow-lg">
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-white sm:text-[15px]">{n?.titleDisplay || n?.title || 'Thông báo'}</div>
              <div className="mt-1 line-clamp-3 text-sm leading-6 text-slate-200">{n?.bodyDisplay || n?.body || ''}</div>
            </div>
            {unread ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{n?.occurredAtRelative || 'Vừa xong'}</span>
            {n?.occurredAtAbsolute ? <span className="text-slate-500">{n.occurredAtAbsolute}</span> : null}
            {meta ? <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />{meta}</span> : null}
          </div>
        </div>
      </div>
    </button>
  );
}
