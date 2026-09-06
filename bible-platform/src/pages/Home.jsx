import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, CalendarDays, BookHeart, ArrowRight, Heart, Search, CalendarClock, Clock, X, MapPin, AlignLeft, Users, Handshake, Map, FileText, Brain, Music, Trophy, Megaphone, Video, Copy, Share2, Check } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { CATEGORY_COLORS, CATEGORY_LABELS, getUpcomingEvents } from '../data/scheduleData';
import { getTodayVerse } from '../data/dailyVerses';
import { getTodayBiblePattern, getPatternForVerse } from '../data/dailyBiblePatterns';
import LiveBanner from '../components/LiveBanner';

// 홈화면 퀵 링크 - 주요 기능
const MAIN_LINKS = [
  { to: '/read',       icon: BookOpen,     title: '성경 읽기',   color: '#4f86c6' },
  { to: '/sermon',     icon: Video,        title: '말씀과 설교', color: '#ff6b6b' },
  { to: '/hymns',      icon: Music,        title: '찬송가',      color: '#e5a93b' },
  { to: '/devotion',   icon: BookHeart,    title: '묵상 노트',   color: '#c4a484' },
  { to: '/plan',       icon: CalendarDays, title: '통독 플랜',   color: '#5bbf6e' },
  { to: '/quiz',       icon: Trophy,        title: '말씀 퀴즈',   color: '#f59e0b' },
  { to: '/memorize',   icon: Brain,        title: '말씀 암송',   color: '#64b5f6' },
  { to: '/favorites',  icon: Heart,        title: '즐겨찾기',    color: '#e85b72' },
];

// 커뮤니티 & 기타
const COMMUNITY_LINKS = [
  { to: '/announce',   icon: Megaphone,     title: '교회 공지',   color: '#fbbf24' },
  { to: '/ai',         icon: Sparkles,     title: 'AI 도우미',   color: '#9b7de8' },
  { to: '/schedule',   icon: CalendarClock, title: '일정 & 계획',  color: '#e8a73d' },
  { to: '/bulletin',   icon: FileText,      title: '교회 주보',   color: '#ff8a65' },
  { to: '/prayer-wall',icon: Handshake,     title: '중보 기도',   color: '#81c784' },
  { to: '/groups',     icon: Users,         title: '소그룹',        color: '#4db6ac' },
  { to: '/bible-map',  icon: Map,           title: '성경 지도',   color: '#ba68c8' },
  { to: '/search',     icon: Search,        title: '말씀 검색',   color: '#f5a623' },
];

const Home = () => {
  const { planProgress, devotions, favorites, events, openInstallModal, isStandalone, showToast } = useContext(UserContext);
  const { completedDays, totalDays } = planProgress;
  const pct = ((completedDays.length / totalDays) * 100).toFixed(1);

  const todayVerse = getTodayVerse();
  // 영어 탭 패턴: 오늘의 말씀 구절에 매칭된 패턴, 없으면 자동 추출
  const todayPattern = getPatternForVerse(todayVerse.ref, todayVerse.engText || '');

  const [verseTab, setVerseTab] = useState('korean'); // 'korean' | 'english_pattern'
  const [isSpeakingEng, setIsSpeakingEng] = useState(false);
  const [copied, setCopied] = useState(false);

  const getFullDevotionText = () => {
    let out = `[☀️ 오늘의 말씀]\n\n`;
    out += `말씀\n${todayVerse.ref}\n\n${todayVerse.text}\n\n`;
    if (todayVerse.engText) {
      out += `(NIV) ${todayVerse.engText}\n\n`;
    }
    if (todayVerse.commentary) {
      out += `🕊 본문 해설\n${todayVerse.commentary}\n\n`;
    }
    if (todayVerse.questions && todayVerse.questions.length > 0) {
      out += `🙏 묵상 질문\n` + todayVerse.questions.map((q, i) => `${i + 1}. ${q}`).join('\n') + `\n\n`;
    }
    if (todayVerse.prayer) {
      out += `🙏 기도문\n${todayVerse.prayer}\n\n`;
    }
    out += `화도벧엘교회 성경 플랫폼\nhttps://mjuy1-debug.github.io/bible-platform`;
    return out;
  };

  const handleCopyDevotion = async () => {
    try {
      await navigator.clipboard.writeText(getFullDevotionText());
      setCopied(true);
      if (showToast) showToast('📋 오늘의 말씀과 해설, 기도문이 복사되었습니다!');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      if (showToast) showToast('복사에 실패했습니다.');
    }
  };

  const handleShareDevotion = async () => {
    const text = getFullDevotionText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `☀️ [화도벧엘교회] 오늘의 말씀 (${todayVerse.ref})`,
          text: text,
          url: 'https://mjuy1-debug.github.io/bible-platform'
        });
      } catch (e) {}
    } else {
      handleCopyDevotion();
    }
  };

  const speakEngVerse = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (isSpeakingEng) {
      setIsSpeakingEng(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => setIsSpeakingEng(false);
    utterance.onerror = () => setIsSpeakingEng(false);
    setIsSpeakingEng(true);
    window.speechSynthesis.speak(utterance);
  };

  const upcoming = useMemo(() => getUpcomingEvents(events, 3), [events]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (h < 5)  setGreeting('아직 밤이 깊네요. 말씀 안에서 쉬세요 🌙');
    else if (h < 12) setGreeting('좋은 아침이에요 ☀️ 오늘도 말씀으로 시작해요');
    else if (h < 17) setGreeting('오후에도 말씀과 함께해요 🌿');
    else if (h < 21) setGreeting('저녁에 찾아와 주셨네요 🌆');
    else setGreeting('오늘 하루도 수고하셨어요 🌙');
  }, []);

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

      {/* 실시간 주일/수요 예배 라이브 스트리밍 알림 배너 */}
      <LiveBanner />

      {/* 📱 스마트폰 홈 화면에 앱 설치 안내 배너 (미설치 시) */}
      {!isStandalone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '760px',
            margin: '0 auto 1.2rem',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(168,85,247,0.18) 100%)',
            border: '1px solid rgba(212,175,55,0.45)',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📱</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                화도벧엘교회 앱을 홈 화면에 설치하세요
              </div>
              <div style={{ fontSize: '0.74rem', color: '#e5e7eb' }}>
                앱스토어 없이 1초 만에 스마트폰 앱으로 설치 & 매일 아침 말씀 알림 수신
              </div>
            </div>
          </div>
          <button
            onClick={openInstallModal}
            style={{
              padding: '7px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #d4af37, #f3e5ab)',
              color: '#1a1400',
              fontWeight: 800,
              fontSize: '0.8rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(212,175,55,0.4)'
            }}
          >
            앱 설치하기 ➔
          </button>
        </motion.div>
      )}

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(2rem, 5vw, 4rem) 0 clamp(2rem, 4vw, 3.5rem)', position: 'relative' }}>
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
          BethelChurch<br />말씀묵상
        </motion.h1>
        <motion.p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          말씀을 읽고, 듣고, 묵상하는 하루
        </motion.p>
      </div>

      {/* Today's Verse & Daily Pattern Card */}
      <motion.div className="glass-card"
        style={{ maxWidth: '760px', margin: '0 auto 2.5rem', textAlign: 'center', padding: 'clamp(1.2rem, 4vw, 2.2rem)', position: 'relative', borderRadius: '24px' }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        
        {/* 상단 탭 전환: [오늘의 말씀] vs [하루 1 영어패턴] */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.2rem' }}>
          <button
            onClick={() => setVerseTab('korean')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: verseTab === 'korean' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
              color: verseTab === 'korean' ? '#111' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ✦ 오늘의 말씀
          </button>
          <button
            onClick={() => setVerseTab('english_pattern')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: verseTab === 'english_pattern' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
              color: verseTab === 'english_pattern' ? '#111' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🇺🇸 영어로 읽기
          </button>
        </div>

        {verseTab === 'korean' ? (
          <div style={{ textAlign: 'left' }}>
            {/* 1. 📖 말씀 영역 */}
            <div style={{ textAlign: 'center', marginBottom: '1.4rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
              <span style={{ display: 'inline-block', fontSize: '0.8rem', background: 'rgba(212,175,55,0.18)', color: 'var(--accent-gold)', padding: '4px 14px', borderRadius: '14px', fontWeight: 800, marginBottom: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                📖 말씀 · {todayVerse.ref}
              </span>
              <p className="serif-font" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.48rem)', lineHeight: 1.9, margin: '0 0 0.8rem', color: 'var(--text-primary)', wordBreak: 'keep-all', fontWeight: 700 }}>
                &ldquo;{todayVerse.text}&rdquo;
              </p>
              {todayVerse.engText && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                  {todayVerse.engText}
                </p>
              )}
            </div>

            {/* 2. 🕊 본문 해설 */}
            {todayVerse.commentary && (
              <div style={{ marginBottom: '1.2rem', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '10px' }}>
                  <span>🕊</span>
                  <span>본문 해설</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.85, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                  {todayVerse.commentary}
                </div>
              </div>
            )}

            {/* 3. 🙏 묵상 질문 */}
            {todayVerse.questions && todayVerse.questions.length > 0 && (
              <div style={{ marginBottom: '1.2rem', background: 'rgba(212,175,55,0.05)', padding: '16px 20px', borderRadius: '18px', border: '1px solid rgba(212,175,55,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b', marginBottom: '10px' }}>
                  <span>🙏</span>
                  <span>묵상 질문</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {todayVerse.questions.map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                      <span style={{ background: 'rgba(212,175,55,0.25)', color: 'var(--accent-gold)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 🙏 기도문 */}
            {todayVerse.prayer && (
              <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(79,134,198,0.08) 0%, rgba(168,85,247,0.08) 100%)', padding: '16px 20px', borderRadius: '18px', border: '1px solid rgba(168,85,247,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800, color: '#c084fc', marginBottom: '10px' }}>
                  <span>🙏</span>
                  <span>기도문</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.85, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                  {todayVerse.prayer}
                </div>
              </div>
            )}

            {/* 5. 🛠 액션 버튼 바 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={handleCopyDevotion}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
                  color: copied ? '#4ade80' : 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? '복사 완료!' : '전체 복사'}
              </button>

              <button
                onClick={handleShareDevotion}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Share2 size={15} />
                은혜 나누기
              </button>

              <Link
                to="/devotion"
                state={{ verse: todayVerse.ref, verseText: todayVerse.text }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(196,164,132,0.2)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(212,175,55,0.35)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                ✏️ 묵상 노트 쓰기
              </Link>

              <Link
                to="/verse-card"
                state={{
                  verses: [{ verse: 1, text: todayVerse.text, ref: todayVerse.ref, book: todayVerse.ref.split(' ')[0], chapter: 1 }],
                  refText: todayVerse.ref
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(245,158,11,0.22))',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                💌 말씀 카드
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: 'clamp(14px, 3vw, 20px)', borderRadius: '18px', border: '1px solid rgba(212,175,55,0.2)' }}>
            {/* 상단 뱃지 & 발음 듣기 버튼 헤더 행 (양쪽 정렬) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.74rem', background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', padding: '3px 10px', borderRadius: '6px', fontWeight: 800 }}>
                📖 NIV · {todayVerse.ref}
              </span>

              <button
                onClick={() => speakEngVerse(todayVerse.engText || '')}
                style={{
                  background: isSpeakingEng ? '#ef4444' : 'var(--accent-gold)',
                  border: 'none',
                  color: isSpeakingEng ? '#fff' : '#111',
                  borderRadius: '10px',
                  padding: '5px 10px',
                  minWidth: '82px',
                  height: '30px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  flexShrink: 0,
                  transition: 'background 0.2s'
                }}
              >
                {isSpeakingEng ? '⏹️ 중지' : '🔊 발음 듣기'}
              </button>
            </div>

            {/* 영문 구절 본문 — 오늘의 말씀과 동일한 구절 NIV */}
            <div style={{ width: '100%', marginBottom: '8px' }}>
              {todayVerse.engText ? (
                <p style={{ margin: '0 0 10px', fontSize: 'clamp(1.02rem, 2.5vw, 1.15rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                  &ldquo;{todayVerse.engText}&rdquo;
                </p>
              ) : (
                <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  (영어 번역을 준비 중입니다)
                </p>
              )}
              {/* 한글 대조 */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.55, borderLeft: '2px solid rgba(212,175,55,0.35)', paddingLeft: '8px' }}>
                🇰🇷 {todayVerse.text.replace(/^\[.*?\]\s*/, '')}
              </div>
            </div>

            {/* 핵심 문법 패턴 박스 (todayPattern 활용) */}
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '4px' }}>
                💡 오늘의 영어 패턴: <span style={{ color: '#fff' }}>{todayPattern.pattern}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>
                👉 뜻: {todayPattern.meaning}
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
                {todayPattern.explanation}
              </p>
              <div style={{ fontSize: '0.76rem', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px', borderLeft: '3px solid var(--accent-gold)' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>✨ 예문:</span> {todayPattern.exampleSentence}<br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.73rem' }}>({todayPattern.exampleMeaning})</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Link
                to="/memorize"
                state={{
                  verse: todayVerse.text,
                  engVerse: todayVerse.engText || todayVerse.text,
                  reference: todayVerse.ref,
                  initialMode: 'en'
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', padding: '0.45rem 1.1rem',
                  borderRadius: '20px', border: '1px solid var(--glass-border)', fontWeight: 700, fontSize: '0.82rem' }}>
                🧠 영어 말씀 4단계 암송하러 가기 →
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 'clamp(0.75rem, 2vw, 1.5rem)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
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

      {/* Upcoming Events Widget */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ maxWidth: '720px', margin: '0 auto 2.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 className="serif-font" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarClock size={18} color="var(--accent-gold)" /> 다가오는 일정
            </h3>
            <Link to="/schedule" style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              전체보기 <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upcoming.map(ev => {
              // 카테고리를 배열로 정규화 (문자열/배열 모두 처리)
              const cats = Array.isArray(ev.category)
                ? ev.category
                : (typeof ev.category === 'string' ? ev.category.split(',').map(s => s.trim()) : [ev.category]);

              // 카드 배경/테두리는 첫 번째 카테고리 색상 사용
              const firstColors = CATEGORY_COLORS[cats[0]] || CATEGORY_COLORS.normal;

              return (
                <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '0.8rem 1rem', borderRadius: '12px',
                    background: firstColors.bg, border: `1px solid ${firstColors.border}`,
                    transition: 'transform 0.15s',
                  }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = ''}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: firstColors.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ev.title}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.75rem', color: firstColors.text, marginTop: '0.2rem' }}>
                        <span>{ev.date.slice(5).replace('-', '/')}</span>
                        {ev.time && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {ev.time}</span>}
                        {/* 모든 카테고리 태그 표시 */}
                        {cats.map(cat => {
                          const c = CATEGORY_COLORS[cat] || CATEGORY_COLORS.normal;
                          const lbl = CATEGORY_LABELS[cat] || CATEGORY_LABELS.normal;
                          return (
                            <span key={cat} style={{ padding: '0 0.4rem', borderRadius: '6px', background: c.bg, color: c.text, fontWeight: 600, fontSize: '0.68rem', border: `1px solid ${c.border}` }}>
                              {lbl}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--text-secondary)" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Links - Main Features */}
      <div style={{ maxWidth: '960px', margin: '0 auto 2rem' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', marginBottom: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.82rem', fontWeight: 700 }}>✦ 주요 기능</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'clamp(0.6rem, 1.5vw, 1rem)' }}>
          {MAIN_LINKS.map(({ to, icon: Icon, title, color }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.06 }}>
              <Link to={to} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 'clamp(0.9rem, 2.5vw, 1.3rem)', textAlign: 'center',
                  transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = color; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.7rem' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <p style={{ fontSize: 'clamp(0.82rem, 2vw, 0.95rem)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links - Community */}
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>✦ 커뮤니티 & 탐색</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'clamp(0.6rem, 1.5vw, 1rem)' }}>
          {COMMUNITY_LINKS.map(({ to, icon: Icon, title, color }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.06 }}>
              <Link to={to} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 'clamp(0.9rem, 2.5vw, 1.3rem)', textAlign: 'center',
                  transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = color; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.7rem' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <p style={{ fontSize: 'clamp(0.82rem, 2vw, 0.95rem)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>

      {/* ─── Event Detail Modal ─── */}
      <AnimatePresence>
        {selectedEvent && (() => {
          const firstCat = Array.isArray(selectedEvent.category) ? selectedEvent.category[0] : (typeof selectedEvent.category === 'string' ? selectedEvent.category.split(',')[0].trim() : selectedEvent.category);
          const colors = CATEGORY_COLORS[firstCat] || CATEGORY_COLORS.normal;
          const label = CATEGORY_LABELS[firstCat] || CATEGORY_LABELS.normal;

          return (
            <motion.div
              key="event-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem',
              }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '480px', padding: '1.8rem', maxHeight: '85vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text,
                      background: colors.bg, padding: '0.2rem 0.8rem', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                      {label}
                    </span>
                  </div>
                  <button onClick={() => setSelectedEvent(null)}
                    style={{ padding: '0.3rem', background: 'var(--bg-secondary)', borderRadius: '50%',
                      border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {selectedEvent.title}
                </h3>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <CalendarClock size={16} color="var(--accent-gold)" />
                    <span>
                      {selectedEvent.date.replace(/-/g, '.')}
                      {selectedEvent.endDate && ` ~ ${selectedEvent.endDate.replace(/-/g, '.')}`}
                      {selectedEvent.time && ` · ${selectedEvent.time}`}
                    </span>
                  </div>
                  {selectedEvent.description && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <AlignLeft size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                      <span style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedEvent.description}</span>
                    </div>
                  )}
                </div>

                {/* Footer btn */}
                <Link to="/schedule" onClick={() => setSelectedEvent(null)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', borderRadius: '10px', background: 'var(--accent-gold)',
                    color: '#1a1a2e', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                    transition: 'opacity 0.2s' }}>
                  전체 일정 보기 <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
};

export default Home;
