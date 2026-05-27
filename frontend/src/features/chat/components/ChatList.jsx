function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  const a = parts[0]?.[0] || 'U';
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (a + b).toUpperCase();
}

export default function ChatList({ rooms = [], activeId, onSelect }) {
  return (
    <div className="space-y-1.5">
      {rooms.map((r, index) => {
        const active = activeId === r.id;
        const label = r.title || 'Người dùng';
        const online = !!r.online;
        const isGroup = r.type === 'group';

        return (
          <button
            key={r.id}
            onClick={() => onSelect?.(r.id)}
            className={[
              'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150',
              active
                ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]',
            ].join(' ')}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-xs font-semibold text-[var(--text-secondary)]">
              {initials(label)}
              <span
                className={[
                  'absolute -bottom-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-[var(--surface-card-solid)] px-1 text-[8px] font-bold',
                  isGroup
                    ? 'bg-[#1f6feb] text-white'
                    : online
                      ? 'bg-[#2ea043] text-transparent'
                      : 'bg-[#6e7681] text-transparent',
                ].join(' ')}
              >
                {isGroup ? 'N' : '•'}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">{label}</div>
                    <span
                      className={[
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        isGroup ? 'bg-[#1f6feb]/20 text-[#79c0ff]' : 'bg-[#2ea043]/15 text-[#3fb950]',
                      ].join(' ')}
                    >
                      {isGroup ? 'Nhóm' : 'DM'}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                    {r.lastMessage || r.secondaryText || 'Chưa có tin nhắn'}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 text-[10px] text-[var(--text-muted)]">
                  <span>{r.metaText || `#${index + 1}`}</span>
                  <span>{isGroup ? `${r.memberCount || 0} TV` : online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
