import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BookHeart, User, BookOpen, Sparkles, CalendarDays, CalendarClock, Search as SearchIcon, Heart, Menu, X } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/schedule',  icon: CalendarClock, label: '일정' },
  { to: '/read',      icon: BookOpen,      label: '읽기' },
  { to: '/search',    icon: SearchIcon,    label: '찾기' },
  { to: '/plan',      icon: CalendarDays,  label: '플랜' },
  { to: '/devotion',  icon: BookHeart,     label: '묵상' },
  { to: '/favorites', icon: Heart,         label: '즐겨찾기' },
  { to: '/ai',        icon: Sparkles,      label: 'AI 도우미' },
  { to: '/profile',   icon: User,          label: '프로필' },
];

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to) => location.pathname === to;

  return (
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
          Joshua 말씀묵상
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
          <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)', display: 'flex', marginLeft: '0.3rem', padding: '0.4rem', minWidth: '36px', minHeight: '36px', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </div>

        {/* Mobile: theme + hamburger */}
        <div style={{ display: 'none' }} className="mobile-nav">
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
  );
};

export default Navbar;
