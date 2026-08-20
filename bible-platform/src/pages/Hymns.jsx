import React, { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Search, Heart, Share2, Copy, X, ArrowUpDown, Sparkles, BookOpen, ChevronRight, Check } from 'lucide-react';
import { TONGL_HYMNS, HYMN_CATEGORIES } from '../data/hymnsData';
import { UserContext } from '../context/UserContext';

export default function Hymns() {
  const { showToast } = useContext(UserContext);
  const [activeVersion, setActiveVersion] = useState('old'); // 'old' (통일찬송가) or 'new' (새찬송가)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedHymn, setSelectedHymn] = useState(null);
  const [viewMode, setViewMode] = useState('lyrics'); // 'lyrics' (가사) or 'score' (악보)
  const [fontSize, setFontSize] = useState(18); // 기본 18px (어르신 가독성)
  const [scoreZoom, setScoreZoom] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [favoriteHymns, setFavoriteHymns] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorite_hymns') || '[]');
    } catch {
      return [];
    }
  });

  // 즐겨찾기 토글
  const toggleFavorite = (hymnNum, e) => {
    if (e) e.stopPropagation();
    let updated;
    if (favoriteHymns.includes(hymnNum)) {
      updated = favoriteHymns.filter(n => n !== hymnNum);
      if (showToast) showToast('즐겨찾기에서 제거되었습니다.');
    } else {
      updated = [...favoriteHymns, hymnNum];
      if (showToast) showToast('⭐ 즐겨찾는 찬송가에 추가되었습니다!');
    }
    setFavoriteHymns(updated);
    localStorage.setItem('favorite_hymns', JSON.stringify(updated));
  };

  // 찬송가 가사 스마트 파싱: 마지막 절에 붙어있는 후렴을 분리 → 각 절 뒤에 삽입
  const parseHymnLyrics = (lyrics) => {
    if (!lyrics || lyrics.length < 2) return lyrics;
    const last = lyrics[lyrics.length - 1];
    const verses = lyrics.slice(0, -1);
    const avgLen = verses.reduce((s, l) => s + l.length, 0) / verses.length;

    // 이미 [후렴]이 별도 항목으로 존재하면 그대로 반환
    if (lyrics.some(l => l.startsWith('[후렴]') || l.trim().startsWith('[후렴]'))) return lyrics;

    // 마지막 절이 다른 절 평균보다 1.45배 이상 길어야 후렴이 붙어있다고 판단
    if (last.length <= avgLen * 1.45) return lyrics;

    // 후렴 분리: 다른 절 평균 길이만큼을 절로, 나머지를 후렴으로 분리
    const words = last.split(' ');
    let cutPoint = 0;
    let len = 0;
    for (let i = 0; i < words.length; i++) {
      len += words[i].length + 1;
      if (len >= avgLen * 0.92) { cutPoint = i + 1; break; }
    }

    if (cutPoint <= 0 || cutPoint >= words.length) return lyrics;

    const lastVerse = words.slice(0, cutPoint).join(' ').trim();
    const chorus = '[후렴] ' + words.slice(cutPoint).join(' ').trim();

    // 각 절 뒤에 후렴 삽입
    const result = [];
    for (const v of verses) {
      result.push(v);
      result.push(chorus);
    }
    result.push(lastVerse);
    result.push(chorus);
    return result;
  };

  // 찬송가 목록 필터링 (검색 & 카테고리)
  const filteredHymns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return TONGL_HYMNS.filter(h => {
      // 카테고리 필터
      if (selectedCategory === '⭐ 즐겨찾기') {
        if (!favoriteHymns.includes(h.num)) return false;
      } else if (selectedCategory !== '전체' && h.theme !== selectedCategory) {
        return false;
      }

      // 검색어 필터
      if (!q) return true;

      const cleanNum = q.replace(/장$/, '').trim();
      const numMatch = String(h.num) === cleanNum || String(h.newNum) === cleanNum || String(h.num) === q;
      const titleMatch = h.title.toLowerCase().includes(q) || h.title.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
      const lyricsMatch = h.lyrics.some(line => line.toLowerCase().includes(q) || line.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')));

      return numMatch || titleMatch || lyricsMatch;
    });
  }, [searchQuery, selectedCategory, favoriteHymns]);

  // 가사 복사
  const handleCopyLyrics = (hymn) => {
    const text = `[통일찬송가 ${hymn.num}장 (새 ${hymn.newNum}장)] ${hymn.title}\n\n${hymn.lyrics.join('\n\n')}\n\n벧엘교회 말씀묵상 앱`;
    navigator.clipboard.writeText(text);
    if (showToast) showToast('가사가 클립보드에 복사되었습니다! 📋');
  };

  // 카카오톡 공유
  const handleShareKakao = (hymn) => {
    const shareText = `🎵 [통일찬송가 ${hymn.num}장 (새 ${hymn.newNum}장)] ${hymn.title}\n\n${hymn.lyrics.slice(0, 2).join('\n')}\n...\n벧엘교회 말씀묵상에서 찬양 가사를 확인해보세요!`;
    if (navigator.share) {
      navigator.share({
        title: `찬송가 ${hymn.num}장 - ${hymn.title}`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLyrics(hymn);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '880px', margin: '0 auto' }}>
      {/* 1. 상단 타이틀 & 소개 문구 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', margin: 0, lineHeight: 1.2 }}>
            <Music color="var(--accent-gold)" /> 찬송가
          </h1>
          <p style={{ fontSize: 'clamp(0.82rem, 2.5vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word', margin: '6px 0 0 0' }}>
            벧엘교회에서 부르는 통일찬송가(구찬송가 558장)와 새찬송가 대조 뷰어입니다.
          </p>
        </div>

        {/* 찬송가 버전 선택 탭 (구찬송가 기본) */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)', padding: '4px',
          borderRadius: '24px', border: '1px solid var(--glass-border)', flexShrink: 0
        }}>
          <button
            onClick={() => setActiveVersion('old')}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: activeVersion === 'old' ? 'var(--accent-gold)' : 'transparent',
              color: activeVersion === 'old' ? '#111' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s'
            }}
          >
            구찬송가 (통일 558장)
          </button>
          <button
            onClick={() => setActiveVersion('new')}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: activeVersion === 'new' ? 'var(--accent-gold)' : 'transparent',
              color: activeVersion === 'new' ? '#111' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s'
            }}
          >
            새찬송가 (645장 대조)
          </button>
        </div>
      </div>

      {/* 2. 빠른 검색창 */}
      <div style={{
        position: 'relative', marginBottom: '1rem', background: 'var(--bg-secondary)',
        borderRadius: '14px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', padding: '0 1rem'
      }}>
        <Search size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="장수 번호(예: 405, 28), 제목(나 같은 죄인), 가사 검색..."
          style={{
            width: '100%', padding: '0.9rem 0.8rem', background: 'transparent',
            border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 3. 주제별 카테고리 칩 */}
      <div style={{
        display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.6rem',
        marginBottom: '1rem', scrollbarWidth: 'none'
      }}>
        <button
          onClick={() => setSelectedCategory('⭐ 즐겨찾기')}
          style={{
            padding: '6px 14px', borderRadius: '18px', border: '1px solid var(--accent-gold)',
            background: selectedCategory === '⭐ 즐겨찾기' ? 'var(--accent-gold)' : 'rgba(212,175,55,0.1)',
            color: selectedCategory === '⭐ 즐겨찾기' ? '#111' : 'var(--accent-gold)',
            fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
          }}
        >
          ⭐ 즐겨찾기 ({favoriteHymns.length})
        </button>
        {HYMN_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 13px', borderRadius: '18px',
              background: selectedCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
              color: selectedCategory === cat ? '#111' : 'var(--text-secondary)',
              border: selectedCategory === cat ? 'none' : '1px solid var(--glass-border)',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.15s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. 찬송가 목록 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
        {filteredHymns.map((hymn) => {
          const isFav = favoriteHymns.includes(hymn.num);
          const primaryNum = activeVersion === 'old' ? hymn.num : hymn.newNum;
          const secondaryNum = activeVersion === 'old' ? `새 ${hymn.newNum}장` : `구 ${hymn.num}장`;

          return (
            <motion.div
              key={hymn.num}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setSelectedHymn(hymn);
                setViewMode('lyrics');
                setScoreZoom(false);
                setScoreLoading(false);
              }}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {/* 장수 배지 */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {primaryNum}장
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '-1px' }}>
                    {secondaryNum}
                  </span>
                </div>

                {/* 찬송가 제목 & 가사 미리보기 */}
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hymn.title}
                  </h4>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hymn.lyrics[0] ? hymn.lyrics[0].replace(/^[0-9]\.\s*/, '') : hymn.engTitle}
                  </p>
                </div>
              </div>

              {/* 즐겨찾기 버튼 */}
              <button
                onClick={(e) => toggleFavorite(hymn.num, e)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: isFav ? '#ef4444' : 'var(--text-secondary)',
                  padding: '6px', display: 'flex', alignItems: 'center', flexShrink: 0
                }}
              >
                <Heart size={18} fill={isFav ? '#ef4444' : 'none'} />
              </button>
            </motion.div>
          );
        })}
      </div>

      {filteredHymns.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <Music size={40} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
          <p style={{ margin: 0, fontSize: '0.95rem' }}>검색 결과가 없습니다.</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>장수 번호나 찬송가 제목을 다시 확인해주세요.</p>
        </div>
      )}

      {/* 5. 찬송가 가사 상세 모달 */}
      <AnimatePresence>
        {selectedHymn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1100,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '16px', backdropFilter: 'blur(6px)'
            }}
            onClick={() => setSelectedHymn(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                width: '100%', maxWidth: '640px',
                maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }}
            >
              {/* 모달 상단 헤더 */}
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: 'var(--accent-gold)', color: '#111', fontWeight: 800,
                      fontSize: '12px', padding: '2px 8px', borderRadius: '6px'
                    }}>
                      통일 {selectedHymn.num}장
                    </span>
                    <span style={{
                      background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                      fontSize: '11px', padding: '2px 8px', borderRadius: '6px'
                    }}>
                      새찬송가 {selectedHymn.newNum}장
                    </span>
                  </div>
                  <h3 style={{ margin: '6px 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedHymn.title}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedHymn.engTitle} • {selectedHymn.theme}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedHymn(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* 모달 툴바 (가사/악보 전환 & 폰트 조절 & 기능 버튼) */}
              <div style={{
                padding: '10px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
              }}>
                {/* 가사 / 악보 모드 전환 버튼 */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '18px', padding: '3px', border: '1px solid var(--glass-border)' }}>
                  <button
                    onClick={() => setViewMode('lyrics')}
                    style={{
                      padding: '4px 12px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                      background: viewMode === 'lyrics' ? 'var(--accent-gold)' : 'transparent',
                      color: viewMode === 'lyrics' ? '#111' : 'var(--text-secondary)',
                      fontWeight: 700, fontSize: '12px', transition: 'all 0.2s'
                    }}
                  >
                    📝 가사 보기
                  </button>
                  <button
                    onClick={() => { setViewMode('score'); setScoreLoading(true); }}
                    style={{
                      padding: '4px 12px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                      background: viewMode === 'score' ? 'var(--accent-gold)' : 'transparent',
                      color: viewMode === 'score' ? '#111' : 'var(--text-secondary)',
                      fontWeight: 700, fontSize: '12px', transition: 'all 0.2s'
                    }}
                  >
                    🎼 악보 보기
                  </button>
                </div>

                {/* 가사 모드일 때: 폰트 조절 */}
                {viewMode === 'lyrics' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>글자 크기:</span>
                    <button
                      onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                      style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}
                    >
                      가-
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>
                      {fontSize}px
                    </span>
                    <button
                      onClick={() => setFontSize(prev => Math.min(30, prev + 2))}
                      style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}
                    >
                      가+
                    </button>
                  </div>
                ) : (
                  /* 악보 모드일 때: 확대 토글 */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setScoreZoom(!scoreZoom)}
                      style={{
                        padding: '4px 10px', borderRadius: '14px',
                        background: scoreZoom ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                        color: scoreZoom ? '#111' : 'var(--text-primary)',
                        border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      {scoreZoom ? '🔍 원래 크기' : '🔍 악보 확대'}
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  {viewMode === 'lyrics' ? (
                    <button
                      onClick={() => handleCopyLyrics(selectedHymn)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      <Copy size={13} /> 복사
                    </button>
                  ) : (
                    <a
                      href={`https://wsrv.nl/?url=http://www.holybible.or.kr/HYMN/HYMN_SCR/${String(selectedHymn.num).padStart(3, '0')}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`통일찬송가_${selectedHymn.num}장_${selectedHymn.title}.jpg`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-primary)', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}
                    >
                      원본 열기 ↗
                    </a>
                  )}
                  <button
                    onClick={() => handleShareKakao(selectedHymn)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '14px', background: 'var(--accent-gold)', border: 'none', color: '#111', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Share2 size={13} /> 공유
                  </button>
                </div>
              </div>

              {/* 모달 본문 영역 (가사 또는 악보 이미지) */}
              {viewMode === 'lyrics' ? (
                <div style={{
                  padding: '24px 20px', overflowY: 'auto', flex: 1,
                  lineHeight: 1.8, wordBreak: 'keep-all', overflowWrap: 'break-word',
                  fontSize: `${fontSize}px`, color: 'var(--text-primary)'
                }}>
                  {parseHymnLyrics(selectedHymn.lyrics).map((verse, idx) => {
                    const isChorus = verse.startsWith('[후렴]');
                    const displayText = isChorus ? verse.replace(/^\[후렴\]\s*/, '') : verse;
                    return (
                      <div key={idx} style={{
                        marginBottom: '1.2rem',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: isChorus ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.02)',
                        borderLeft: isChorus ? '3px solid var(--accent-gold)' : '3px solid rgba(255,255,255,0.15)'
                      }}>
                        {isChorus && (
                          <span style={{
                            display: 'inline-block', marginBottom: '4px',
                            fontSize: `${Math.max(10, fontSize - 4)}px`,
                            fontWeight: 800, color: 'var(--accent-gold)',
                            letterSpacing: '0.05em'
                          }}>
                            ♪ 후렴
                          </span>
                        )}
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {displayText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 🎼 악보 이미지 뷰어 */
                <div style={{
                  padding: '20px', overflowY: 'auto', overflowX: scoreZoom ? 'auto' : 'hidden', flex: 1,
                  background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'
                }}>
                  {/* 로딩 스켈레톤 */}
                  {scoreLoading && (
                    <div style={{
                      width: '100%', borderRadius: '12px', padding: '16px',
                      background: '#1a1a1a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                      display: 'flex', flexDirection: 'column', gap: '10px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}>
                      <style>{`
                        @keyframes skeletonPulse {
                          0%, 100% { opacity: 0.4; }
                          50% { opacity: 1; }
                        }
                      `}</style>
                      {/* 악보 이름 스켈레톤 */}
                      <div style={{ height: '18px', width: '60%', borderRadius: '6px', background: 'linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.4) 50%, rgba(212,175,55,0.2) 100%)', backgroundSize: '200% 100%', animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
                      {/* 오선지 줄 스켈레톤 (7줄) */}
                      {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} style={{
                          height: i % 3 === 0 ? '40px' : '22px',
                          width: i === 7 ? '75%' : '100%',
                          borderRadius: '6px',
                          background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%)',
                          backgroundSize: '200% 100%',
                          animation: `skeletonPulse ${1.2 + i * 0.08}s ease-in-out infinite`,
                          animationDelay: `${i * 0.07}s`
                        }} />
                      ))}
                      <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: 'rgba(212,175,55,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)', animation: 'skeletonPulse 0.8s ease-in-out infinite' }} />
                        악보 이미지 불러오는 중…
                      </div>
                    </div>
                  )}

                  {/* 실제 악보 이미지 (로딩 중엔 숨김, 완료 시 fade-in) */}
                  <div style={{
                    display: scoreLoading ? 'none' : 'block',
                    background: '#ffffff', borderRadius: '12px', padding: '16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    maxWidth: scoreZoom ? 'none' : '100%',
                    width: scoreZoom ? '140%' : '100%',
                    transition: 'width 0.3s ease, opacity 0.4s ease',
                    textAlign: 'center',
                    minHeight: '200px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img
                      key={`score-${selectedHymn.num}`}
                      src={`https://wsrv.nl/?url=http%3A%2F%2Fwww.holybible.or.kr%2FHYMN%2FHYMN_SCR%2F${String(selectedHymn.num).padStart(3, '0')}.jpg&output=jpg&n=-1`}
                      alt={`통일찬송가 ${selectedHymn.num}장 악보`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        borderRadius: '6px',
                        opacity: 0,
                        transition: 'opacity 0.45s ease'
                      }}
                      loading="eager"
                      onLoad={(e) => {
                        setScoreLoading(false);
                        e.currentTarget.style.opacity = '1';
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        const directUrl = `https://corsproxy.io/?url=http://www.holybible.or.kr/HYMN/HYMN_SCR/${String(selectedHymn.num).padStart(3, '0')}.jpg`;
                        if (e.currentTarget.src !== directUrl) {
                          e.currentTarget.src = directUrl;
                        } else {
                          setScoreLoading(false);
                          e.currentTarget.parentElement.innerHTML = `<div style="padding:20px;color:#666;font-size:13px;text-align:center"><p>악보를 불러올 수 없습니다.<br/><a href="http://www.holybible.or.kr/HYMN/HYMN_SCR/${String(selectedHymn.num).padStart(3, '0')}.jpg" target="_blank" rel="noopener noreferrer" style="color:#4a9eff">원본 이미지 보기 ↗</a></p></div>`;
                        }
                      }}
                    />
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '12px', textAlign: 'center', display: scoreLoading ? 'none' : 'block' }}>
                    💡 악보를 더 크게 보시려면 <strong>[🔍 악보 확대]</strong> 버튼을 누르세요.
                  </p>
                </div>
              )}

              {/* 하단 닫기 바 */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => toggleFavorite(selectedHymn.num)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: favoriteHymns.includes(selectedHymn.num) ? '#ef4444' : 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: 600
                  }}
                >
                  <Heart size={16} fill={favoriteHymns.includes(selectedHymn.num) ? '#ef4444' : 'none'} />
                  {favoriteHymns.includes(selectedHymn.num) ? '즐겨찾기 됨' : '즐겨찾기 추가'}
                </button>
                <button
                  onClick={() => setSelectedHymn(null)}
                  style={{ padding: '6px 18px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
