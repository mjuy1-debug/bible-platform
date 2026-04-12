import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Search, X,
  AlertTriangle, RefreshCw, PlayCircle, Share2, Heart
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { BIBLE_BOOKS } from '../data/bibleData';
import { fetchChapter } from '../services/bibleService';
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
  const { highlights, toggleHighlight, toggleFavorite, isFavorite } = useContext(UserContext);
  const location = useLocation();

  // Plan 페이지에서 넘어온 경우 해당 책/장으로 초기화
  const initBook = location.state?.bookId
    ? BIBLE_BOOKS.find(b => b.id === location.state.bookId) || BIBLE_BOOKS[0]
    : BIBLE_BOOKS[0];
  const initChapter = location.state?.chapter || 1;

  const [selectedBook, setSelectedBook] = useState(initBook);
  const [selectedChapter, setSelectedChapter] = useState(initChapter);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [fontSize, setFontSize] = useState(1.15);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [activeTestament, setActiveTestament] = useState('old');
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  const loadChapter = useCallback(async (bookId, chapter) => {
    setLoading(true);
    setError(null);
    setSelectedVerse(null);
    setVerses([]);
    setPlayingVideo(null); // 장 넘기면 플레이어 닫기
    try {
      const data = await fetchChapter(bookId, chapter);
      setVerses(data);
    } catch (err) {
      setError(err.message || '성경 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);  // eslint-disable-line

  useEffect(() => {
    loadChapter(selectedBook.id, selectedChapter);
  }, [selectedBook.id, selectedChapter]); // eslint-disable-line

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookSelector(false);
    setBookSearch('');
  };

  const handleVerseClick = (v) => {
    const ref = `${selectedBook.shortName} ${selectedChapter}:${v.verse}`;
    setSelectedVerse((sel) => (sel?.ref === ref ? null : { ...v, ref, book: selectedBook.name }));
  };

  const handleShare = useCallback((text, ref) => {
    const shareText = `"${text}"
— ${ref}`;
    if (navigator.share) {
      navigator.share({ title: '말씀 나눔', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).then(() => alert('클립보드에 복사됐습니다! ✅'));
    }
  }, []);

  const goChapter = (dir) => {
    const next = selectedChapter + dir;
    if (next >= 1 && next <= selectedBook.chapters) setSelectedChapter(next);
  };

  const filteredBooks = (activeTestament === 'old' ? OLD_BOOKS : NEW_BOOKS).filter(
    (b) => b.name.includes(bookSearch) || b.shortName.includes(bookSearch)
  );

  // ── Styles ──
  const navBtn = (disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer',
    opacity: disabled ? 0.3 : 1, transition: 'opacity 0.2s',
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '820px', margin: '0 auto' }}>

      {/* ── Top Nav ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setShowBookSelector(!showBookSelector)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.3rem',
            borderRadius: '30px', border: '1px solid var(--accent-gold)', background: 'var(--glass-bg)',
            color: 'var(--accent-gold)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
          {selectedBook.name} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button onClick={() => goChapter(-1)} disabled={selectedChapter === 1 || loading} style={navBtn(selectedChapter === 1 || loading)}>
            <ChevronLeft size={18} />
          </button>
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(Number(e.target.value))} disabled={loading}
            style={{ padding: '0.5rem 0.8rem', borderRadius: '20px', border: '1px solid var(--glass-border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>{ch}장</option>
            ))}
          </select>
          <button onClick={() => goChapter(1)} disabled={selectedChapter === selectedBook.chapters || loading} style={navBtn(selectedChapter === selectedBook.chapters || loading)}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Font size */}
        <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
          {['A-', 'A+'].map((lbl, i) => (
            <button key={lbl} onClick={() => setFontSize((f) => Math.max(0.85, Math.min(2.0, +(f + (i === 0 ? -0.1 : 0.1)).toFixed(2))))}
              style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Book Selector ── */}
      <AnimatePresence>
        {showBookSelector && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
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
                    color: activeTestament === val ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}>
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
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, textAlign: 'center',
                    transition: 'all 0.2s', fontFamily: 'var(--font-serif)', lineHeight: 1.3 }}>
                  {book.shortName}<br />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{book.chapters}장</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* ── Bible Text ── */}
      <div className="glass-card" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="serif-font" style={{ color: 'var(--accent-gold)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '0.8rem' }}>
            {selectedBook.name} {selectedChapter}장
          </h2>

          {/* ─ 공동체성경읽기 유튜브 듣기 버튼 ─ */}
          {(() => {
            const yt = getYouTubeUrl(selectedBook.id, selectedBook.name, selectedChapter);
            const isEmbeddable = yt.type === 'video' || yt.type === 'playlist';
            const isActive = playingVideo?.embedId === yt.embedId;

            return isEmbeddable ? (
              <button
                onClick={() => setPlayingVideo(isActive ? null : yt)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.45rem 1.2rem', borderRadius: '20px', marginBottom: '1rem',
                  background: isActive ? '#cc0000' : '#FF0000',
                  color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600,
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
                  padding: '0.45rem 1.2rem', borderRadius: '20px', marginBottom: '1rem',
                  background: 'rgba(255,0,0,0.12)',
                  color: '#FF4444',
                  border: '1px solid rgba(255,0,0,0.3)',
                  fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                <PlayCircle size={16} />
                {yt.label}
                <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>（유튜브 검색）</span>
              </a>
            );
          })()}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            {loading ? '말씀을 불러오는 중...' : verses.length > 0 ? `총 ${verses.length}절 · 구절 클릭 시 하이라이트/즐겨찾기` : ''}
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

        {/* Verses — 절 번호 컬럼 + 본문 컬럼 */}
        {!loading && !error && verses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {verses.map((v) => {
              const ref = `${selectedBook.shortName} ${selectedChapter}:${v.verse}`;
              const isSelected = selectedVerse?.ref === ref;

              return (
                <div key={v.verse}>
                  {/* 
                    ★ 핵심 레이아웃 변경:
                    display:grid, gridTemplateColumns: '2.5rem 1fr'
                    → 절 번호는 항상 왼쪽 2.5rem 고정
                    → 본문이 줄바꿈되어도 오른쪽 컬럼 경계에서 맞춰짐
                  */}
                  <div
                    onClick={() => handleVerseClick(v)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2.8rem 1fr',
                      alignItems: 'baseline',
                      gap: '0',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: highlights[ref] || (isSelected ? 'rgba(196,164,132,0.12)' : 'transparent'),
                      border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'transparent'}`,
                      transition: 'background 0.2s, border-color 0.15s',
                    }}>
                    {/* 절 번호 — 오른쪽 정렬, 고정폭 */}
                    <span style={{
                      color: 'rgba(196,164,132,0.8)',
                      fontWeight: 700,
                      fontSize: `${fontSize * 0.72}rem`,
                      lineHeight: `${fontSize * 2.1}rem`,
                      textAlign: 'right',
                      paddingRight: '0.75rem',
                      fontStyle: 'normal',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}>
                      {v.verse}
                    </span>
                    {/* 본문 — 줄바꿈 시 이 컬럼 안에서만 정렬됨 */}
                    <span
                      className="serif-font"
                      style={{
                        fontSize: `${fontSize}rem`,
                        lineHeight: 2.1,
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                        letterSpacing: '0.015em',
                        color: 'var(--text-primary)',
                        userSelect: 'text',
                      }}>
                      {v.text}
                    </span>
                  </div>

                  {/* Action Toolbar */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', margin: '0 0.5rem 0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1rem',
                          background: 'var(--bg-secondary)', borderRadius: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>형광펜</span>
                          {HIGHLIGHT_COLORS.map(({ color, name }) => (
                            <button key={name} title={name} onClick={(e) => { e.stopPropagation(); toggleHighlight(ref, color); }}
                              style={{ width: '22px', height: '22px', borderRadius: '50%', background: color, cursor: 'pointer',
                                border: `2px solid ${highlights[ref] === color ? 'var(--accent-gold)' : 'transparent'}`,
                                flexShrink: 0, transition: 'border-color 0.15s' }} />
                          ))}
                          <div style={{ width: '1px', height: '18px', background: 'var(--glass-border)', flexShrink: 0 }} />
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorite({ text: v.text, ref }); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.9rem',
                              borderRadius: '20px', border: '1px solid var(--glass-border)', cursor: 'pointer',
                              background: isFavorite(ref) ? 'var(--accent-gold)' : 'transparent',
                              color: isFavorite(ref) ? '#fff' : 'var(--text-secondary)',
                              fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s' }}>
                            {isFavorite(ref) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                            {isFavorite(ref) ? '저장됨' : '즐겨찾기'}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleShare(v.text, ref); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.9rem',
                              borderRadius: '20px', border: '1px solid var(--glass-border)', cursor: 'pointer',
                              background: 'transparent', color: 'var(--text-secondary)',
                              fontSize: '0.82rem', fontWeight: 600, minHeight: '36px' }}>
                            <Share2 size={14} /> 공유
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedVerse(null); }}
                            style={{ marginLeft: 'auto', color: 'var(--text-secondary)', display: 'flex', cursor: 'pointer' }}>
                            <X size={15} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Chapter Footer Nav ── */}
      {!loading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <button onClick={() => goChapter(-1)} disabled={selectedChapter === 1}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem',
              borderRadius: '30px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
              color: 'var(--text-secondary)', cursor: 'pointer', opacity: selectedChapter === 1 ? 0.3 : 1 }}>
            <ChevronLeft size={18} /> 이전 장
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {selectedBook.name} {selectedChapter} / {selectedBook.chapters}장
          </span>
          <button onClick={() => goChapter(1)} disabled={selectedChapter === selectedBook.chapters}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem',
              borderRadius: '30px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
              color: 'var(--text-secondary)', cursor: 'pointer', opacity: selectedChapter === selectedBook.chapters ? 0.3 : 1 }}>
            다음 장 <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Floating Bible Player */}
      <BiblePlayer
        embedUrl={playingVideo?.embedUrl}
        title={playingVideo?.label}
        onClose={() => setPlayingVideo(null)}
      />
    </motion.div>
  );
};

export default Read;
