import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Search, X,
  AlertTriangle, RefreshCw, PlayCircle, Share2, Heart, Eraser, Edit3, Image, Brain, Map as MapIcon,
  Globe, Volume2, VolumeX, BookMarked, Sparkles, HelpCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { BIBLE_BOOKS } from '../data/bibleData';
import { fetchChapter, fetchEnglishChapter, ENGLISH_TRANSLATIONS } from '../services/bibleService';
import { lookupBibleWord, lookupWordSmart } from '../data/bibleDictionary';
import { getYouTubeUrl, PRS_CHANNEL } from '../data/youtubeLinks';
import BiblePlayer from '../components/BiblePlayer';

const HIGHLIGHT_COLORS = [
  { color: 'rgba(255,235,59,0.45)', name: '노랑' },
  { color: 'rgba(79,195,247,0.45)', name: '하늘' },
  { color: 'rgba(129,199,132,0.45)', name: '초록' },
  { color: 'rgba(240,98,146,0.45)', name: '분홍' },
];

const OLD_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === 'old');
const NEW_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === 'new');

const Read = () => {
  const { highlights, toggleHighlight, removeHighlight, toggleFavorite, isFavorite, memorized, toggleMemorized, showToast } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Plan 페이지나 Map 페이지에서 넘어온 경우 해당 책/장/절로 초기화
  let initBook = BIBLE_BOOKS[0];
  let initChapter = 1;

  if (location.state?.bookId || location.state?.bookName) {
    initBook = BIBLE_BOOKS.find(b => 
      (location.state.bookId && b.id === location.state.bookId) || 
      (location.state.bookName && (b.name === location.state.bookName || b.shortName === location.state.bookName))
    ) || BIBLE_BOOKS[0];
    initChapter = location.state?.chapter || 1;
  } else if (location.state?.verseRef) {
    const match = location.state.verseRef.match(/(.+)\s(\d+):(\d+)/);
    if (match) {
      const bName = match[1].trim();
      initChapter = parseInt(match[2], 10);
      initBook = BIBLE_BOOKS.find(b => b.name === bName || b.shortName === bName) || BIBLE_BOOKS[0];
    }
  }

  const [selectedBook, setSelectedBook] = useState(initBook);
  const [selectedChapter, setSelectedChapter] = useState(initChapter);
  const [selectedVerses, setSelectedVerses] = useState({});
  const [fontSize, setFontSize] = useState(1.15);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [activeTestament, setActiveTestament] = useState('old');
  
  // 성경 데이터 상태
  const [verses, setVerses] = useState([]);
  const [englishVerses, setEnglishVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  // 🌐 영어 성경 학습 모드 상태
  // 'korean' (한글만), 'parallel' (한/영 나란히 대조), 'english' (영어만)
  const [languageMode, setLanguageMode] = useState('korean');
  const [englishTranslation, setEnglishTranslation] = useState('NIV');
  const [activeWordData, setActiveWordData] = useState(null);
  const [speakingVerse, setSpeakingVerse] = useState(null);

  const handleWriteDevotion = () => {
    const sortedVerses = Object.values(selectedVerses).sort((a, b) => a.verse - b.verse);
    if (sortedVerses.length === 0) return;

    const bookName = sortedVerses[0].book;
    const chapter = sortedVerses[0].chapter;
    const verseNumbers = sortedVerses.map(v => v.verse);

    let ranges = [];
    let start = verseNumbers[0];
    let prev = verseNumbers[0];
    for (let i = 1; i < verseNumbers.length; i++) {
      if (verseNumbers[i] === prev + 1) {
        prev = verseNumbers[i];
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = verseNumbers[i];
        prev = verseNumbers[i];
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    const verseStr = `${bookName} ${chapter}:${ranges.join(', ')}`;
    
    const textStr = sortedVerses.map(v => `${v.verse} ${v.text}`).join('\n');
    
    navigate('/devotion', { state: { verse: verseStr, verseText: textStr } });
    setSelectedVerses({});
  };

  const handleMakeCard = () => {
    const sortedVerses = Object.values(selectedVerses).sort((a, b) => a.verse - b.verse);
    if (sortedVerses.length === 0) return;
    const bookName = sortedVerses[0].book;
    const chapter = sortedVerses[0].chapter;
    const verseNumbers = sortedVerses.map(v => v.verse);
    let ranges = [];
    let start = verseNumbers[0], prev = verseNumbers[0];
    for (let i = 1; i < verseNumbers.length; i++) {
      if (verseNumbers[i] === prev + 1) { prev = verseNumbers[i]; }
      else { ranges.push(start === prev ? `${start}` : `${start}-${prev}`); start = verseNumbers[i]; prev = verseNumbers[i]; }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    const refText = `${bookName} ${chapter}:${ranges.join(', ')}`;
    navigate('/verse-card', { state: { verses: sortedVerses, refText } });
    setSelectedVerses({});
  };

  const handleMemorize = () => {
    const sortedVerses = Object.values(selectedVerses).sort((a, b) => a.verse - b.verse);
    if (sortedVerses.length === 0) return;
    const bookName = sortedVerses[0].book;
    const chapter = sortedVerses[0].chapter;
    const verseNumbers = sortedVerses.map(v => v.verse);
    let ranges = [];
    let start = verseNumbers[0], prev = verseNumbers[0];
    for (let i = 1; i < verseNumbers.length; i++) {
      if (verseNumbers[i] === prev + 1) { prev = verseNumbers[i]; }
      else { ranges.push(start === prev ? `${start}` : `${start}-${prev}`); start = verseNumbers[i]; prev = verseNumbers[i]; }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    const refText = `${bookName} ${chapter}:${ranges.join(', ')}`;
    const textStr = sortedVerses.map(v => v.text).join(' ');
    
    // 영어 구절 텍스트 추출
    const engTextStr = sortedVerses
      .map(v => {
        const engItem = englishVerses.find(ev => ev.verse === v.verse);
        return engItem?.text || '';
      })
      .filter(Boolean)
      .join(' ');
    
    // 현재 읽기 화면이 영어 모드이면 암송도 영어 모드로 즉시 시작
    const initialMode = languageMode === 'english' ? 'en' : 'kr';

    navigate('/memorize', {
      state: {
        verse: textStr,
        engVerse: engTextStr || textStr,
        reference: refText,
        initialMode: initialMode
      }
    });
    setSelectedVerses({});
  };

  const handleSearchMap = () => {
    const textStr = Object.values(selectedVerses).map(v => v.text).join(' ');
    const knownLocations = ["예루살렘", "베들레헴", "가버나움", "나사렛", "갈릴리", "요단", "여리고", "사마리아", "안디옥", "에베소", "고린도", "로마", "애굽", "다메섹", "시내"];
    let foundLoc = "";
    for (const loc of knownLocations) {
      if (textStr.includes(loc)) {
        foundLoc = loc;
        break;
      }
    }
    navigate('/bible-map', { state: { searchLoc: foundLoc } });
    setSelectedVerses({});
  };

  // 성경 데이터 로드 (한글 + 영어)
  const loadChapter = useCallback(async (bookId, chapter, engTrans = englishTranslation) => {
    setLoading(true);
    setError(null);
    setSelectedVerses({});
    setVerses([]);
    setEnglishVerses([]);
    setPlayingVideo(null);
    stopSpeaking();

    try {
      const [korData, engData] = await Promise.all([
        fetchChapter(bookId, chapter),
        fetchEnglishChapter(bookId, chapter, engTrans)
      ]);
      setVerses(korData || []);
      setEnglishVerses(engData || []);
    } catch (err) {
      setError(err.message || '성경 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [englishTranslation]);

  useEffect(() => {
    loadChapter(selectedBook.id, selectedChapter, englishTranslation);
  }, [selectedBook.id, selectedChapter, englishTranslation]);

  // 영어 원어민 음성 낭독 (TTS)
  const speakEnglishVerse = (text, verseNum) => {
    if (!window.speechSynthesis) {
      if (showToast) showToast('이 브라우저는 음성 낭독을 지원하지 않습니다.');
      return;
    }

    if (speakingVerse === verseNum) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88; // 또박또박한 영어 속도
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingVerse(null);
    utterance.onerror = () => setSpeakingVerse(null);

    setSpeakingVerse(verseNum);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingVerse(null);
  };

  // 영어 단어 클릭 시 사전 조회 (오프라인 1,000+ 핵심 단어 즉시 조회 + 스마트 사전 폴백)
  const handleWordClick = async (e, rawWord) => {
    e.stopPropagation();
    const clean = rawWord.replace(/[^a-zA-Z]/g, '');
    if (!clean) return;

    // 1. 오프라인 성경 어휘 사전에서 0초 즉시 조회
    const instant = lookupBibleWord(clean);
    if (instant) {
      setActiveWordData(instant);
      return;
    }

    // 2. 미등록 단어는 기본 껍데기 먼저 띄운 후 스마트 번역으로 실시간 완성
    setActiveWordData({
      word: clean,
      mean: '단어 뜻 불러오는 중...',
      pos: '어휘',
      phon: `[${clean.toLowerCase()}]`,
      desc: `영어 성경 (${englishTranslation}) 본문 어휘입니다.`
    });

    const smartData = await lookupWordSmart(clean);
    if (smartData) {
      setActiveWordData(smartData);
    }
  };

  // Map에서 특정 구절 클릭시 스크롤 및 하이라이트 효과
  useEffect(() => {
    if (verses.length > 0 && location.state?.verseRef) {
      const match = location.state.verseRef.match(/(.+)\s(\d+):(\d+)/);
      if (match) {
        const targetVerse = parseInt(match[3], 10);
        setTimeout(() => {
          const el = document.getElementById(`verse-${targetVerse}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.backgroundColor = 'rgba(212,175,55,0.4)';
            el.style.transition = 'background-color 2s';
            setTimeout(() => {
              el.style.backgroundColor = 'transparent';
            }, 2000);
          }
        }, 300);
      }
      window.history.replaceState({}, document.title);
    }
  }, [verses, location.state]);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookSelector(false);
    setBookSearch('');
  };

  const handleVerseClick = (v) => {
    if (window.getSelection && window.getSelection().toString().trim().length > 0) {
      return;
    }

    const ref = `${selectedBook.shortName} ${selectedChapter}:${v.verse}`;
    setSelectedVerses(prev => {
      const next = { ...prev };
      if (next[ref]) {
        delete next[ref];
      } else {
        next[ref] = {
          ...v,
          ref,
          book: selectedBook.name,
          chapter: selectedChapter
        };
      }
      return next;
    });
  };

  const goChapter = (dir) => {
    const next = selectedChapter + dir;
    if (next >= 1 && next <= selectedBook.chapters) {
      setSelectedChapter(next);
    }
  };

  const filteredBooks = (activeTestament === 'old' ? OLD_BOOKS : NEW_BOOKS).filter(
    (b) => b.name.includes(bookSearch) || b.shortName.includes(bookSearch)
  );

  const selectedCount = Object.keys(selectedVerses).length;

  const navBtn = (disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer',
    opacity: disabled ? 0.3 : 1, transition: 'opacity 0.2s',
  });

  // 영어 구절을 단어 단위로 분리하여 클릭 가능하게 렌더링 (단정하고 눈이 편안한 서적 타이포그래피)
  const renderEnglishText = (engText, verseNum) => {
    if (!engText) return null;
    const tokens = engText.split(/(\s+)/);

    return (
      <span style={{ fontSize: `${fontSize * 0.88}rem`, color: 'var(--text-secondary)', lineHeight: 1.85, fontFamily: 'var(--font-sans)' }}>
        {/* 인라인 미니멀 오디오 스피커 아이콘 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speakEnglishVerse(engText, verseNum);
          }}
          style={{
            background: speakingVerse === verseNum ? '#ef4444' : 'rgba(212, 175, 55, 0.12)',
            border: 'none',
            borderRadius: '5px',
            color: speakingVerse === verseNum ? '#fff' : 'var(--accent-gold)',
            padding: '2px 5px',
            marginRight: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            verticalAlign: 'middle',
            fontSize: '0.7rem',
            fontWeight: 700,
            transition: 'all 0.15s'
          }}
          title="원어민 발음 듣기"
        >
          {speakingVerse === verseNum ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>

        {tokens.map((token, idx) => {
          if (/^\s+$/.test(token)) return token;
          const clean = token.replace(/[^a-zA-Z]/g, '');

          return (
            <span
              key={idx}
              onClick={(e) => handleWordClick(e, clean)}
              style={{
                cursor: 'pointer',
                borderRadius: '3px',
                padding: '0 1px',
                color: 'inherit',
                transition: 'color 0.15s, background 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-gold)';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'inherit';
                e.currentTarget.style.textDecoration = 'none';
              }}
              title="클릭하여 단어 뜻 보기"
            >
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ── Top Nav Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* 책 선택 버튼 */}
        <button onClick={() => setShowBookSelector(!showBookSelector)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
            borderRadius: '24px', border: '1.5px solid var(--accent-gold)', background: 'var(--glass-bg)',
            color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
          {selectedBook.name} <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>▼</span>
        </button>

        {/* 장 이동 컨트롤 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button onClick={() => goChapter(-1)} disabled={selectedChapter === 1 || loading} style={navBtn(selectedChapter === 1 || loading)}>
            <ChevronLeft size={18} />
          </button>
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(Number(e.target.value))} disabled={loading}
            style={{ padding: '0.45rem 0.8rem', borderRadius: '18px', border: '1px solid var(--glass-border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>{ch}장</option>
            ))}
          </select>
          <button onClick={() => goChapter(1)} disabled={selectedChapter === selectedBook.chapters || loading} style={navBtn(selectedChapter === selectedBook.chapters || loading)}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 폰트 크기 */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['A-', 'A+'].map((lbl, i) => (
            <button key={lbl} onClick={() => setFontSize((f) => Math.max(0.85, Math.min(2.0, +(f + (i === 0 ? -0.1 : 0.1)).toFixed(2))))}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)', color: 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── 🌐 영어 성경 학습 툴바 (베스트 한/영 대조 모드) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '1.2rem',
        padding: '10px 14px',
        borderRadius: '16px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)'
      }}>
        {/* 언어 모드 탭 (한글 / 한·영 대조 / 영어만) */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { mode: 'korean', label: '🇰🇷 한글' },
            { mode: 'parallel', label: '🌐 한/영 대조' },
            { mode: 'english', label: '🇺🇸 영어' }
          ].map(tab => (
            <button
              key={tab.mode}
              onClick={() => setLanguageMode(tab.mode)}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: 'none',
                background: languageMode === tab.mode ? 'var(--accent-gold)' : 'transparent',
                color: languageMode === tab.mode ? '#1a1a2e' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 영어 번역본 선택기 (NIV / NLT / ESV / KJV) */}
        {languageMode !== 'korean' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>버전:</span>
            <select
              value={englishTranslation}
              onChange={(e) => setEnglishTranslation(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--glass-border)',
                color: 'var(--accent-gold)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {ENGLISH_TRANSLATIONS.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Book Selector ── */}
      <AnimatePresence>
        {showBookSelector && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '20px' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} placeholder="책 이름 검색 (예: 창, 시편, 요한)"
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '20px',
                  border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[['old', '📜 구약 (39권)'], ['new', '✝️  신약 (27권)']].map(([val, lbl]) => (
                <button key={val} onClick={() => setActiveTestament(val)}
                  style={{ padding: '0.4rem 1.2rem', borderRadius: '20px', border: '1px solid var(--glass-border)',
                    background: activeTestament === val ? 'var(--accent-gold)' : 'var(--glass-bg)',
                    color: activeTestament === val ? '#1a1a2e' : 'var(--text-secondary)',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '0.45rem',
              maxHeight: '260px', overflowY: 'auto', paddingRight: '0.3rem' }}>
              {filteredBooks.map((book) => (
                <button key={book.id} onClick={() => handleBookSelect(book)}
                  style={{ padding: '0.5rem 0.2rem', borderRadius: '10px',
                    border: selectedBook.id === book.id ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                    background: selectedBook.id === book.id ? 'rgba(196,164,132,0.18)' : 'var(--glass-bg)',
                    color: selectedBook.id === book.id ? 'var(--accent-gold)' : 'var(--text-primary)',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center',
                    transition: 'all 0.2s', fontFamily: 'var(--font-serif)', lineHeight: 1.3 }}>
                  {book.shortName}<br />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{book.chapters}장</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bible Text Area (여백 최적화로 가로폭 넉넉하게 확장) ── */}
      <div className="glass-card" style={{ padding: 'clamp(0.85rem, 2.5vw, 1.8rem) clamp(0.6rem, 2vw, 1.5rem)', minHeight: '400px', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <h2 className="serif-font" style={{ color: 'var(--accent-gold)', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', marginBottom: '0.6rem' }}>
            {selectedBook.name} {selectedChapter}장
          </h2>

          {/* 공동체성경읽기 유튜브 듣기 버튼 */}
          {(() => {
            const yt = getYouTubeUrl(selectedBook.id, selectedBook.name, selectedChapter);
            const isEmbeddable = yt.type === 'video' || yt.type === 'playlist';
            const isActive = playingVideo?.embedId === yt.embedId;

            return isEmbeddable ? (
              <button
                onClick={() => setPlayingVideo(isActive ? null : yt)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.45rem 1.2rem', borderRadius: '20px', marginBottom: '0.8rem',
                  background: isActive ? '#cc0000' : '#FF0000',
                  color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 700,
                  transition: 'background 0.2s',
                }}
              >
                <PlayCircle size={16} />
                {isActive ? '플레이어 닫기' : yt.label}
              </button>
            ) : (
              <a href={yt.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.45rem 1.2rem', borderRadius: '20px', marginBottom: '0.8rem',
                  background: 'rgba(255,0,0,0.12)',
                  color: '#FF4444',
                  border: '1px solid rgba(255,0,0,0.3)',
                  fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                }}
              >
                <PlayCircle size={16} /> {yt.label}
              </a>
            );
          })()}

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
            {loading ? '말씀을 불러오는 중...' : verses.length > 0 
              ? `총 ${verses.length}절 · ${languageMode === 'korean' ? '개역한글판' : `${englishTranslation} 대조`} · 구절 클릭 시 하이라이트/즐겨찾기` 
              : ''}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-gold)', animation: 'spin 0.9s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>{selectedBook.name} {selectedChapter}장 로딩 중...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <AlertTriangle size={36} color="#e53e3e" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#e53e3e', fontWeight: 600, marginBottom: '0.5rem' }}>말씀을 불러올 수 없습니다</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>{error}</p>
            <button onClick={() => loadChapter(selectedBook.id, selectedChapter)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem',
                borderRadius: '30px', border: '1px solid var(--accent-gold)', background: 'transparent',
                color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: 600 }}>
              <RefreshCw size={16} /> 다시 시도
            </button>
          </div>
        )}

        {/* Verses 목록 */}
        {!loading && !error && verses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: languageMode === 'parallel' ? '0.6rem' : '0.1rem' }}>
            {verses.map((v) => {
              const ref = `${selectedBook.shortName} ${selectedChapter}:${v.verse}`;
              const fullRef = `${selectedBook.name} ${selectedChapter}:${v.verse}`;
              const isSelected = !!selectedVerses[ref];
              const memorizedKey = memorized && (memorized[ref] ? ref : memorized[fullRef] ? fullRef : null);
              const engItem = englishVerses.find(ev => ev.verse === v.verse);
              const engText = engItem?.text || '';

              return (
                <div
                  key={v.verse}
                  id={`verse-${v.verse}`}
                  onClick={() => handleVerseClick(v)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'clamp(1.6rem, 4vw, 2.0rem) 1fr',
                    alignItems: 'baseline',
                    gap: '0',
                    padding: languageMode === 'parallel' ? '0.65rem 0.25rem' : '0.45rem 0.2rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: highlights[ref] || (isSelected ? 'rgba(196,164,132,0.12)' : 'transparent'),
                    border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'transparent'}`,
                    transition: 'background 0.2s, border-color 0.15s',
                  }}>
                  {/* 절 번호 */}
                  <span style={{
                    color: 'rgba(196,164,132,0.85)',
                    fontWeight: 800,
                    fontSize: `${fontSize * 0.75}rem`,
                    lineHeight: `${fontSize * 2.1}rem`,
                    textAlign: 'right',
                    paddingRight: '0.45rem',
                    fontStyle: 'normal',
                    userSelect: 'none',
                    flexShrink: 0,
                  }}>
                    {v.verse}
                  </span>

                  {/* 본문 (한글 & 영어가 화면 우측 끝까지 100% 가로폭을 시원하게 채움) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, width: '100%' }}>
                    {/* 한글 본문 */}
                    {languageMode !== 'english' && (
                      <span
                        className="serif-font"
                        style={{
                          fontSize: `${fontSize}rem`,
                          lineHeight: 2.05,
                          wordBreak: 'keep-all',
                          overflowWrap: 'break-word',
                          letterSpacing: '0.01em',
                          color: 'var(--text-primary)',
                          userSelect: 'text',
                        }}>
                        {v.text}
                        {memorizedKey && (
                          <span style={{
                            fontSize: '0.68rem',
                            background: 'rgba(212,175,55,0.15)',
                            color: 'var(--accent-gold)',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            marginLeft: '6px',
                            fontWeight: 700,
                            verticalAlign: 'middle'
                          }}>
                            ✓ 암송
                          </span>
                        )}
                      </span>
                    )}

                    {/* 영어 본문 (100% 온전한 가로폭 + 인라인 미니멀 스피커) */}
                    {languageMode !== 'korean' && engText && (
                      <div style={{
                        width: '100%',
                        marginTop: languageMode === 'parallel' ? '2px' : '0',
                        lineHeight: 1.85,
                      }}>
                        {renderEnglishText(engText, v.verse)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 영어 단어 사전 툴팁 팝업 모달 ── */}
      <AnimatePresence>
        {activeWordData && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: 'calc(var(--bottomnav-height, 64px) + 24px)',
              left: '16px',
              right: '16px',
              margin: '0 auto',
              zIndex: 99999,
              maxWidth: '440px',
              width: 'auto',
              background: 'var(--bg-secondary)',
              border: '2px solid var(--accent-gold)',
              borderRadius: '20px',
              padding: '16px 18px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              color: 'var(--text-primary)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {activeWordData.word}
                </span>
                {activeWordData.phon && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {activeWordData.phon}
                  </span>
                )}
                {activeWordData.pos && (
                  <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', padding: '1px 6px', borderRadius: '4px' }}>
                    {activeWordData.pos}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* 단어 발음 듣기 */}
                <button
                  onClick={() => speakEnglishVerse(activeWordData.word, 'word')}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    padding: '4px 8px',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <Volume2 size={13} /> 발음
                </button>

                <button
                  onClick={() => setActiveWordData(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              💡 {activeWordData.mean}
            </div>

            {activeWordData.desc && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                {activeWordData.desc}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Action Toolbar (선택된 구절 있을 때) ── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 'calc(var(--bottomnav-height, 64px) + 12px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '10px 16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '92vw',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {selectedCount}절 선택됨
            </span>

            {/* 하이라이트 색상들 */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {HIGHLIGHT_COLORS.map(hc => (
                <button
                  key={hc.name}
                  onClick={() => {
                    Object.keys(selectedVerses).forEach(r => toggleHighlight(r, hc.color));
                    setSelectedVerses({});
                  }}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: hc.color,
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer'
                  }}
                  title={`${hc.name} 하이라이트`}
                />
              ))}
              <button
                onClick={() => {
                  Object.keys(selectedVerses).forEach(r => removeHighlight(r));
                  setSelectedVerses({});
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="하이라이트 지우기"
              >
                <Eraser size={16} />
              </button>
            </div>

            {/* 묵상 / 암송 / 카드 만들기 */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleWriteDevotion}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'var(--accent-gold)',
                  color: '#1a1a2e',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                묵상 쓰기
              </button>
              <button
                onClick={handleMakeCard}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                말씀 카드
              </button>
              <button
                onClick={handleMemorize}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                암송 훈련
              </button>
              <button
                onClick={handleSearchMap}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                지도 보기
              </button>
            </div>

            <button
              onClick={() => setSelectedVerses({})}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── YouTube Player (PRS) ── */}
      {playingVideo && (
        <BiblePlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          bookName={selectedBook.name}
          chapter={selectedChapter}
        />
      )}
    </motion.div>
  );
};

export default Read;
