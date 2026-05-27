import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '../../shared/components/Sidebar';
import Header from '../../shared/components/Header';
import SocialRealtimeBridge from '../../shared/realtime/SocialRealtimeBridge.jsx';

const SIDEBAR_PIN_KEY = 'ui.app.sidebar.pinned';

function cx() {
  return Array.from(arguments)
    .flat()
    .filter(Boolean)
    .join(' ');
}

function getInitialPinnedState() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(SIDEBAR_PIN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppShellLayout() {
  const [desktopPinned, setDesktopPinned] = useState(getInitialPinnedState);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    try {
      window.localStorage.setItem(SIDEBAR_PIN_KEY, String(desktopPinned));
    } catch {}

    return undefined;
  }, [desktopPinned]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainOffsetClass = desktopPinned ? 'lg:pl-[280px]' : 'lg:pl-[94px]';

  return (
    <div className="min-h-screen">
      <SocialRealtimeBridge />

      <Sidebar
        desktopPinned={desktopPinned}
        onTogglePinned={() => {
          setDesktopPinned((prev) => !prev);
          setSidebarHovered(false);
        }}
        hovered={sidebarHovered}
        onHoverChange={setSidebarHovered}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={cx('relative min-h-screen transition-[padding] duration-300', mainOffsetClass)}>
        <Header
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          desktopPinned={desktopPinned}
          onTogglePinned={() => {
            setDesktopPinned((prev) => !prev);
            setSidebarHovered(false);
          }}
        />

        <main className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
