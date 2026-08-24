import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BookHeart, User, BookOpen, Sparkles, CalendarDays, CalendarClock, Search as SearchIcon, Heart, Menu, X, MonitorPlay, HandHeart, BarChart2, Users, MessageSquare, Newspaper, Brain, Map, Music, Bell, Shield } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { UserContext } from '../context/UserContext';
import NotificationModal from './NotificationModal';

const NAV_ITEMS = [
  { to: '/schedule',  icon: CalendarClock, label: '일정' },
  { to: '/sermon',    icon: MonitorPlay,   label: '말씀' },
  { to: '/read',      icon: BookOpen,      label: '읽기' },
  { to: '/hymns',     icon: Music,         label: '찬송가' },
  { to: '/search',    icon: SearchIcon,    label: '찾기' },
  { to: '/plan',      icon: CalendarDays,  label: '플랜' },
  { to: '/devotion',  icon: BookHeart,     label: '묵상' },
  { to: '/favorites', icon: Heart,         label: '즐겨찾기' },
  { to: '/prayer',    icon: HandHeart,     label: '기도 노트' },
  { to: '/prayer-wall', icon: MessageSquare, label: '중보 기도' },
  { to: '/groups',    icon: Users,         label: '소그룹' },
  { to: '/bulletin',  icon: Newspaper,     label: '주보' },
  { to: '/memorize',  icon: Brain,         label: '암송 훈련' },
  { to: '/bible-map', icon: Map,           label: '성경 지도' },
  { to: '/stats',     icon: BarChart2,     label: '통계' },
  { to: '/ai',        icon: Sparkles,      label: 'AI 도우미' },
  { to: '/profile',   icon: User,          label: '프로필' },
];

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { memberProfile } = useContext(UserContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const isAdmin = memberProfile?.isAdmin === true;
  const isActive = (to) => location.pathname === to;

  return (
    <>
    <nav style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 1000,
      background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 1.5rem', height: 'var(--navbar-height)',
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-gold)', flexShrink: 0 }}>
          BethelChurch 말씀묵상
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }} className="desktop-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.88rem', fontWeight: 500,
              color: isActive(to) ? 'var(--accent-gold)' : 'var(--text-secondary)',
              textDecoration: 'none', transition: 'color 0.2s',
              paddingBottom: '2px',
              borderBottom: isActive(to) ? '2px solid var(--accent-gold)' : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}>
              <Icon size={15} /> {label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.82rem', fontWeight: 600,
              color: isActive('/admin') ? 'var(--accent-gold)' : 'rgba(212,175,55,0.7)',
              textDecoration: 'none',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '999px',
              padding: '0.25rem 0.75rem',
              whiteSpace: 'nowrap',
            }}>
              <Shield size={13} /> 관리자
            </Link>
          )}
          <button onClick={() => setShowNotificationModal(true)} title="말씀 알림 설정" style={{ color: 'var(--accent-gold)', display: 'flex', padding: '0.4rem', minWidth: '36px', minHeight: '36px', alignItems: 'center', justifyContent: 'center', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '50%', cursor: 'pointer' }}>
            <Bell size={18} />
          </button>
          <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)', display: 'flex', marginLeft: '0.3rem', padding: '0.4rem', minWidth: '36px', minHeight: '36px', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </div>

        {/* Mobile: notification + theme + hamburger */}
        <div style={{ display: 'none' }} className="mobile-nav">
          <button onClick={() => setShowNotificationModal(true)} style={{ color: 'var(--accent-gold)', marginRight: '0.4rem', display: 'flex', padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Bell size={20} />
          </button>
          <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)', marginRight: '0.8rem', display: 'flex', padding: '0.4rem' }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-primary)', display: 'flex', padding: '0.4rem', minWidth: '44px', minHeight: '44px', alignItems: 'center', justifyContent: 'center' }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex', flexDirection: 'column',
          padding: '0.75rem 1.5rem 1.25rem', gap: '0.25rem',
        }} className="mobile-menu">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.5rem', borderRadius: '10px',
                color: isActive(to) ? 'var(--accent-gold)' : 'var(--text-primary)',
                fontSize: '1rem', fontWeight: isActive(to) ? 700 : 400,
                background: isActive(to) ? 'rgba(196,164,132,0.1)' : 'transparent',
                transition: 'all 0.15s',
                minHeight: '48px',
              }}
              onClick={() => setMenuOpen(false)}>
              <Icon size={20} /> {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; align-items: center; }
        }
      `}</style>
    </nav>
    <NotificationModal 
      isOpen={showNotificationModal} 
      onClose={() => setShowNotificationModal(false)} 
    />
    </>
  );
};

export default Navbar;
