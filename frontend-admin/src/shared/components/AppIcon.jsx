const iconMap = {
  home: 'M4 11.5L12 4l8 7.5M6.5 10.5V20h4.5v-5h2v5h4.5v-9.5',
  users: 'M16 19v-1.5A3.5 3.5 0 0012.5 14h-1A3.5 3.5 0 008 17.5V19m9-8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM7 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  activity: 'M4 13h3l2.2-5 3.6 9 2.2-4H20',
  jobs: 'M4 8.5h16v10a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-10zM8 8V6.8A1.8 1.8 0 019.8 5h4.4A1.8 1.8 0 0116 6.8V8m-12 4h16',
  dashboard: 'M5 5h6v6H5zm8 0h6v10h-6zM5 13h6v6H5zm8 12h6v-4h-6z',
  code: 'M9 8l-4 4 4 4m6-8l4 4-4 4',
  submissions: 'M7 4.5h7l4 4V19a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19V6A1.5 1.5 0 017.5 4.5zM14 4.5V9h4.5',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zm9 3l-4.2-4.2',
  bell: 'M12 4.5a4 4 0 00-4 4V11c0 .9-.3 1.8-.9 2.5L6 15h12l-1.1-1.5A4.2 4.2 0 0116 11V8.5a4 4 0 00-4-4zm-2 13a2 2 0 004 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
  logout: 'M9 20H6.5A1.5 1.5 0 015 18.5v-13A1.5 1.5 0 016.5 4H9m5 4l4 4-4 4m4-4H10',
  plus: 'M12 5v14M5 12h14',
  pencil: 'M5 19l3.2-.6L18 8.6 15.4 6 5.6 15.8 5 19zM13.8 7.5l2.7 2.7',
  trash: 'M5.5 7h13M9 7V5.5h6V7m-7 3v6m4-6v6m4-6v6M7 7l.7 12.1A1 1 0 008.7 20h6.6a1 1 0 001-.9L17 7',
  eye: 'M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6zm9.5 3a3 3 0 100-6 3 3 0 000 6z',
  refresh: 'M19 8V4m0 0h-4m4 0l-3 3A8 8 0 104 12',
  lock: 'M8 10V8a4 4 0 118 0v2m-9 0h10v9H7z',
  unlock: 'M16 10V8a4 4 0 00-7-2.6M7 10h10v9H7z',
  chevronRight: 'M9 6l6 6-6 6',
  spark: 'M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4L12 3z',
  server: 'M5 6.5h14v4H5zm0 7h14v4H5zm2 2h.01m0-7h.01',
  shield: 'M12 3l7 3v5c0 4.5-2.8 8.7-7 10-4.2-1.3-7-5.5-7-10V6l7-3z',
  key: 'M14 7a4 4 0 11-2.8 6.8L8 17H5v-3l3.2-3.2A4 4 0 0114 7z',
  fileText: 'M7 4.5h7l4 4V19a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19V6A1.5 1.5 0 017.5 4.5zM14 4.5V9h4.5M9 13h6M9 16h6',
  layers: 'M12 4l8 4-8 4-8-4 8-4zm-8 8l8 4 8-4M4 16l8 4 8-4',
  post: 'M6 5h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zm2 4h8M8 9h.01M8 13h8M8 17h5',
  comment: 'M5 6h14a2 2 0 012 2v7a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V8a2 2 0 012-2z',
  community: 'M6 19v-1a3 3 0 013-3h6a3 3 0 013 3v1M9 8a3 3 0 106 0 3 3 0 00-6 0M4 10a2 2 0 104 0 2 2 0 00-4 0m12 0a2 2 0 104 0 2 2 0 00-4 0',
  flag: 'M6 21V4m0 0h10l-2 3 2 3H6',
  chat: 'M4 5h16v11H8l-4 3V5zm4 4h8M8 9h8M8 13h5',
  megaphone: 'M4 12l11-6v12L4 12zm11-6h3a2 2 0 012 2v8a2 2 0 01-2 2h-3M7 14l2 5',
  notification: 'M12 5a4 4 0 00-4 4v2.5c0 .9-.3 1.8-.9 2.5L6 15h12l-1.1-1.5A4.2 4.2 0 0116 11.5V9a4 4 0 00-4-4zm-2 13a2 2 0 004 0',
  send: 'M4 20l16-8L4 4l2.8 6.4L14 12l-7.2 1.6L4 20z',
  book: 'M5 5.5A2.5 2.5 0 017.5 3H19v18H7.5A2.5 2.5 0 015 18.5v-13zM8 7h8M8 11h8',
  path: 'M5 7h5v5H5zm9 0h5v5h-5zM9 9.5h5m-2.5 0v8M5 19h5v-5H5zm9 0h5v-5h-5z',
  lesson: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h4',
  quiz: 'M12 18h.01M9.1 9a3 3 0 115.8 1c-.7.5-1.4 1-1.7 1.8-.2.4-.2.8-.2 1.2',
  challenge: 'M8 4h8v3l-2 2v2.5a4 4 0 01-1.2 2.8L12 15l-.8-.7A4 4 0 0110 11.5V9L8 7V4zm2 15h4',
};

export default function AppIcon({ name, size = 18, className = '' }) {
  const path = iconMap[name] || iconMap.spark;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
