import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, CalendarDays, BookHeart, ArrowRight, Heart, Search } from 'lucide-react';
import { UserContext } from '../context/UserContext';

// 날별 말씀 (날짜 기반으로 순환)
const DAILY_VERSES = [
  { text: '여호와는 나의 목자시니 내게 부족함이 없으리로다.', ref: '시편 23:1' },
  { text: '내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라.', ref: '여호수아 1:9' },
  { text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라.', ref: '요한복음 3:16' },
  { text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라.', ref: '빌립보서 4:13' },
  { text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다.', ref: '시편 119:105' },
  { text: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라.', ref: '데살로니가전서 5:16-18' },
  { text: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라.', ref: '잠언 3:5-6' },
];

const QUICK_LINKS = [
  { to: '/read',      icon: BookOpen,    title: '성경 읽기',   desc: '말씀을 천천히 읽으며 하루를 시작해보세요.', color: '#4f86c6' },
  { to: '/devotion',  icon: BookHeart,   title: '묵상 노트',   desc: '오늘 느낀 은혜를 기록으로 남겨보세요.', color: '#c4a484' },
  { to: '/ai',        icon: Sparkles,    title: 'AI 도우미',   desc: '오늘 읽은 말씀을 함께 묵상해 드립니다.', color: '#9b7de8' },
  { to: '/plan',      icon: CalendarDays,title: '통독 플랜',   desc: '1년 통독 오늘의 목표를 확인해보세요.', color: '#5bbf6e' },
  { to: '/favorites', icon: Heart,       title: '즐겨찾기',    desc: '마음에 새긴 말씀들을 모아보세요.', color: '#e85b72' },
  { to: '/search',    icon: Search,      title: '말씀 찾기',   desc: '원하는 구절을 빠르게 검색하세요.', color: '#f5a623' },
];

const Home = () => {
  const { planProgress, devotions, favorites } = useContext(UserContext);
  const { completedDays, totalDays } = planProgress;
  const pct = ((completedDays.length / totalDays) * 100).toFixed(1);

  const todayIdx = Math.floor(Date.now() / 86400000) % DAILY_VERSES.length;
  const todayVerse = DAILY_VERSES[todayIdx];

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 5)  setGreeting('아직 밤이 깊네요. 말씀 안에서 쉬세요 🌙');
    else if (h < 12) setGreeting('좋은 아침이에요 ☀️ 오늘도 말씀으로 시작해요');
    else if (h < 17) setGreeting('오후에도 말씀과 함께해요 🌿');
    else if (h < 21) setGreeting('저녁에 찾아와 주셨네요 🌆');
    else setGreeting('오늘 하루도 수고하셨어요 🌙');
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(2.5rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3.5rem)', position: 'relative' }}>
        <motion.span
          style={{ display: 'inline-block', background: 'var(--bg-secondary)', padding: '0.4rem 1.2rem',
            borderRadius: '20px', fontSize: '0.82rem', color: 'var(--accent-gold)', marginBottom: '1.2rem',
            border: '1px solid var(--glass-border)' }}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </motion.span>

        <motion.p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginBottom: '0.8rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {greeting}
        </motion.p>

        <motion.h1 className="serif-font"
          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1.3, marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--accent-gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Joshua 말씀묵상
        </motion.h1>
        <motion.p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          말씀을 읽고, 듣고, 묵상하는 하루
        </motion.p>
      </div>

      {/* Today's Verse */}
      <motion.div className="glass-card"
        style={{ maxWidth: '720px', margin: '0 auto 2.5rem', textAlign: 'center', padding: 'clamp(1.5rem, 4vw, 2.5rem)', position: 'relative' }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '1.5rem', fontWeight: 700 }}>
          ✦ 오늘의 말씀 ✦
        </p>
        <p className="serif-font" style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.5rem)', lineHeight: 1.9, marginBottom: '1.2rem', color: 'var(--text-primary)', wordBreak: 'keep-all' }}>
          &ldquo;{todayVerse.text}&rdquo;
        </p>
        <p style={{ color: 'var(--accent-gold)', fontStyle: 'italic', fontWeight: 600, fontSize: '0.9rem' }}>
          — {todayVerse.ref} —
        </p>
        <Link to="/devotion" state={{ verse: todayVerse.ref, verseText: todayVerse.text }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem',
            background: 'rgba(196,164,132,0.15)', color: 'var(--accent-gold)', padding: '0.55rem 1.3rem',
            borderRadius: '30px', border: '1px solid var(--glass-border)', fontWeight: 600, fontSize: '0.88rem' }}>
          ✏️ 이 말씀으로 묵상 쓰기 →
        </Link>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(0.75rem, 2vw, 1.5rem)', maxWidth: '600px', margin: '0 auto 3rem' }}>
        {[
          { label: '통독 진행률', value: `${pct}%`, to: '/plan' },
          { label: '저장한 묵상', value: `${devotions.length}편`, to: '/devotion' },
          { label: '즐겨찾기', value: `${favorites.length}개`, to: '/favorites' },
        ].map(({ label, value, to }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
            <Link to={to} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ textAlign: 'center', padding: 'clamp(1rem, 3vw, 1.5rem)',
                transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                <p style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>{value}</p>
                <p style={{ fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)', color: 'var(--text-secondary)' }}>{label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', marginBottom: '1.5rem', textAlign: 'center' }}>빠른 이동</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: 'clamp(0.75rem, 2vw, 1.2rem)' }}>
          {QUICK_LINKS.map(({ to, icon: Icon, title, desc, color }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.07 }}>
              <Link to={to} style={{ display: 'block', textDecoration: 'none' }}>
                <div className="glass-card" style={{ height: '100%', padding: 'clamp(1rem, 3vw, 1.5rem)',
                  transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <h3 style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.78rem, 1.8vw, 0.88rem)', lineHeight: 1.55, wordBreak: 'keep-all' }}>{desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1rem', color, fontSize: '0.82rem', fontWeight: 600 }}>
                    시작하기 <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
