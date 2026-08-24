import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, BookOpen, BookHeart, User, CalendarClock, MonitorPlay, Newspaper, Users, HandHeart, Music } from 'lucide-react';

const TABS = [
  { to: '/',            icon: HomeIcon,      label: '홈' },
  { to: '/sermon',      icon: MonitorPlay,   label: '말씀' },
  { to: '/read',        icon: BookOpen,      label: '읽기' },
  { to: '/devotion',    icon: BookHeart,     label: '묵상' },
  { to: '/schedule',    icon: CalendarClock, label: '일정' },
  { to: '/bulletin',    icon: Newspaper,     label: '주보' },
  { to: '/prayer-wall', icon: HandHeart,     label: '중보' },
  { to: '/hymns',       icon: Music,         label: '찬송' },
  { to: '/profile',     icon: User,          label: '프로필' },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <>
      {/* Actual nav bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }} className="mobile-bottom-nav">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to === '/read' && pathname.startsWith('/read'));
          return (
            <Link key={to} to={to} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.6rem 0',
              color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
              transition: 'color 0.2s',
              minHeight: '60px',
              gap: '0.2rem',
              position: 'relative',
            }}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: 'clamp(9px, 2.2vw, 11px)', fontWeight: active ? 700 : 400, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
                {label}
              </span>
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  width: '20px',
                  height: '2px',
                  background: 'var(--accent-gold)',
                  borderRadius: '0 0 4px 4px',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      <style>{`
        .mobile-bottom-nav { display: none; }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: flex; }
        }
      `}</style>
    </>
  );
};

export default BottomNav;
