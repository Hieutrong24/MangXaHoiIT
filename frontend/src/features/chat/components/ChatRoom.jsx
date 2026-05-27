import { useEffect, useMemo, useRef, useState } from 'react';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { Phone, Video, Info, Hash, ArrowUp, Circle, Users } from 'lucide-react';
import MessageBubble from './MessageBubble';

function shortId(id) {
  if (!id) return '';
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
}

function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  const a = parts[0]?.[0] || 'U';
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (a + b).toUpperCase();
}

function Avatar({ src, name, size = 40 }) {
  const [bad, setBad] = useState(false);

  if (!src || bad) {
    return (
      <div
        className="grid place-items-center rounded-lg bg-[#21262d] text-sm font-semibold text-[#f0f6fc]"
        style={{ width: size, height: size }}
        title={name}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setBad(true)}
      className="rounded-lg bg-[#21262d] object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function ActionButton({ title, onClick, className, children, label, disabled = false }) {
  return (
    <Button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        '!h-9 !rounded-lg !px-3 !py-2 !text-sm !font-medium !shadow-none',
        className,
      ].join(' ')}
    >
      <span className="flex items-center gap-2">
        {children}
        <span className="hidden sm:inline">{label}</span>
      </span>
    </Button>
  );
}

export default function ChatRoom({
  room,
  messages = [],
  onSend,
  sending = false,
  onCall,
  onVideo,
  onInfo,
}) {
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const isGroup = room?.type === 'group';
  const online = !!room?.online;

  const sorted = useMemo(() => {
    const arr = [...messages];
    arr.sort((a, b) => {
      const ta = a.createdAtMs ?? (a.time ? Date.parse(a.time) : 0);
      const tb = b.createdAtMs ?? (b.time ? Date.parse(b.time) : 0);
      return ta - tb;
    });
    return arr;
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [sorted.length]);

  function handleSend() {
    const value = text.trim();
    if (!value) return;
    onSend?.(value);
    setText('');
  }

  return (
    <div className="flex min-h-[540px] flex-col overflow-hidden rounded-2xl bg-[#0d1117] shadow-[0_16px_40px_rgba(0,0,0,0.24)] xl:h-[calc(100vh-10rem)] xl:min-h-[620px]">
      <div className="flex flex-col gap-3 bg-[#161b22] px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={room?.avatarUrl} name={room?.title || room?.fullName || room?.username} size={40} />

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#f0f6fc] sm:text-base">
              {room?.title || room?.fullName || room?.username || 'Người dùng'}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8b949e]">
              {isGroup ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0d1117] px-2 py-1 text-[#79c0ff]">
                    <Users size={12} />
                    {room?.memberCount || 0} thành viên
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0d1117] px-2 py-1 text-[#c9d1d9]">
                    <Hash size={11} />
                    {shortId(room?.id)}
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0d1117] px-2 py-1 text-[#c9d1d9]">
                    <Circle
                      size={10}
                      className={online ? 'fill-[#2ea043] text-[#2ea043]' : 'fill-[#6e7681] text-[#6e7681]'}
                    />
                    {online ? 'Đang hoạt động' : 'Offline'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0d1117] px-2 py-1">
                    <Hash size={11} />
                    {shortId(room?.userId || room?.peerId || room?.id)}
                  </span>
                </>
              )}
              {room?.secondaryText ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0d1117] px-2 py-1 text-[#8b949e]">
                  {room.secondaryText}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isGroup ? (
            <>
              <ActionButton
                title="Gọi thoại"
                onClick={onCall}
                label="Thoại"
                className="!bg-none !bg-[#064e3b] !text-emerald-100 hover:!bg-[#065f46] !border-emerald-400/40"
              >
                <Phone size={15} />
              </ActionButton>

              <ActionButton
                title="Gọi video"
                onClick={onVideo}
                label="Video"
                className="!bg-none !bg-[#064e3b] !text-emerald-100 hover:!bg-[#065f46] !border-emerald-400/40"
              >
                <Video size={15} />
              </ActionButton>
            </>
          ) : null}

          <ActionButton
            title="Thông tin"
            onClick={onInfo}
            label="Chi tiết"
            className="!bg-none !bg-[#064e3b] !text-emerald-100 hover:!bg-[#065f46] !border-emerald-400/40"
          >
            <Info size={15} />
          </ActionButton>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-auto bg-[#0d1117] px-3 py-3 sm:px-4 sm:py-4">
        {sorted.length === 0 ? (
          <div className="grid h-full place-items-center px-4 text-center">
            <div className="rounded-2xl bg-[#161b22] px-5 py-6 text-sm text-[#8b949e]">
              Chưa có tin nhắn
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sorted.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#161b22] px-3 py-3 sm:px-4">
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 rounded-xl bg-[#0d1117] px-3 py-2 transition-colors focus-within:bg-[#11161d]">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isGroup ? 'Nhập tin nhắn cho nhóm...' : 'Nhập tin nhắn...'}
              className="!min-h-[38px] !border-0 !bg-transparent !px-0 !py-0 !text-sm !text-[#c9d1d9] !shadow-none placeholder:!text-[#6e7681] focus:!ring-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <Button
            title="Gửi tin nhắn"
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl !bg-[#238636] !p-0 !text-white !shadow-none hover:!bg-[#2ea043] disabled:!opacity-50"
          >
            {sending ? <span className="text-xs">...</span> : <ArrowUp size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
