import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Music, FileText, Search, ChevronLeft, ChevronRight, 
  Loader, ZoomIn, ZoomOut, Image as ImageIcon, AlignLeft, Play, 
  CheckCircle2, Radio, Sparkles 
} from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleData';
import { fetchChapter } from '../services/bibleService';
import { TONGL_HYMNS } from '../data/hymnsData';

export const DEFAULT_CCM_TRACKS = [
  // ─── 🏆 인기 찬양팀 베스트 모음 ───
  { id: '1', title: '마커스워십 (Markers Worship) 묵상 & 워십 찬양 베스트 모음', category: '워십/찬양팀', artist: '마커스워십', url: 'https://www.youtube.com/watch?v=gQ2X2m7BwTY' },
  { id: '2', title: '손경민 작곡 찬양 베스트 29곡 모음 (2시간 연속재생/무광고)', category: '워십/찬양팀', artist: '손경민 워십', url: 'https://www.youtube.com/watch?v=DgtY1F99BA4' },
  { id: '3', title: '위러브 (WELOVE) 대표 워십 찬양 베스트 모음집', category: '워십/찬양팀', artist: 'WELOVE', url: 'https://www.youtube.com/watch?v=yH-yV4qJKI0' },
  { id: '4', title: '어노인팅 (Anointing) BEST 예배 찬양 20곡 연속듣기', category: '워십/찬양팀', artist: '어노인팅', url: 'https://www.youtube.com/watch?v=FK2YHK0UQ4M' },
  { id: '5', title: '제이어스 (J-US) 은혜의 워십 찬양 베스트 연속듣기', category: '워십/찬양팀', artist: '제이어스', url: 'https://www.youtube.com/watch?v=QTMRxWVFO1A' },
  { id: '6', title: '히즈윌 (HisWill) 은혜와 위로의 찬양 모음집', category: '워십/찬양팀', artist: '히즈윌', url: 'https://www.youtube.com/watch?v=beMKqQn0iZw' },
  { id: '7', title: '피아워십 (FIA Worship) 대표 찬양 20곡 연속듣기', category: '워십/찬양팀', artist: '피아워십', url: 'https://www.youtube.com/watch?v=PLIicL24-6s' },
  { id: '8', title: '예람워십 (Yeram Worship) 대표 찬양 33곡 베스트 모음', category: '워십/찬양팀', artist: '예람워십', url: 'https://www.youtube.com/watch?v=EtW9xPOShaQ' },
  // ─── 📅 2026년 월별 CCM 차트 베스트 ───
  { id: '9', title: '🗓️ 2026년 8월 KOREA CCM BEST 40 — 이 달의 인기 찬양 총망라', category: '2026 월별베스트', artist: '2026.08 차트', url: 'https://www.youtube.com/watch?v=EqWVU_J7O2g' },
  { id: '10', title: '📊 2026년 8월 멜론·유튜브 CCM 차트 TOP 25 (피아워십·히즈윌·위러브)', category: '2026 월별베스트', artist: '2026.08 차트', url: 'https://www.youtube.com/watch?v=ru9J6-eSORw' },
  { id: '11', title: '🗓️ 2026년 7월 KOREA CCM BEST 40 — 여름 은혜 워십 베스트', category: '2026 월별베스트', artist: '2026.07 차트', url: 'https://www.youtube.com/watch?v=quCXotqhaaw' },
  { id: '12', title: '🗓️ 2026년 6월 KOREA CCM BEST 40 — 상반기 결산 워십 베스트', category: '2026 월별베스트', artist: '2026.06 차트', url: 'https://www.youtube.com/watch?v=iXAOZ8P63cs' },
  { id: '13', title: '📊 2026년 5월 멜론 CCM 차트 TOP 20 — 가정의 달 은혜 찬양', category: '2026 월별베스트', artist: '2026.05 차트', url: 'https://www.youtube.com/watch?v=WwetWEKtic8' },
  { id: '14', title: '🗓️ 2026년 4월 CCM 차트 BEST 40 — 봄·부활의 계절 은혜 찬양', category: '2026 월별베스트', artist: '2026.04 차트', url: 'https://www.youtube.com/watch?v=pUFzQEZpvy8' },
  { id: '15', title: '🗓️ 2026년 3월 CCM 차트 BEST 40 — 봄을 여는 은혜의 찬양', category: '2026 월별베스트', artist: '2026.03 차트', url: 'https://www.youtube.com/watch?v=FmqACCA374I' },
  { id: '16', title: '🗓️ 2026년 2월 CCM 차트 BEST 40 — 평안과 회복의 겨울 찬양', category: '2026 월별베스트', artist: '2026.02 차트', url: 'https://www.youtube.com/watch?v=-KMr3VbZdQI' },
  { id: '17', title: '🗓️ 2026년 1월 KOREA CCM BEST 40 — 신년 감사·결단의 찬양', category: '2026 월별베스트', artist: '2026.01 차트', url: 'https://www.youtube.com/watch?v=nOTRLwHlms4' },
  // ─── 🎹 상황별 모음 ───
  { id: '18', title: '깊은 기도로 인도하는 피아노 묵상 찬양 (2시간)', category: '기도/묵상', artist: '피아노 묵상', url: 'https://www.youtube.com/watch?v=f742p7mQ0Ic' },
  { id: '19', title: '산뜻한 하루를 시작할 때 듣는 아침 찬양 플레이리스트', category: '아침/새벽', artist: '아침 찬양', url: 'https://www.youtube.com/watch?v=crrfujNlEL8' },
  { id: '20', title: '마음이 지치고 힘들 때 힘이 되는 위로와 회복의 찬양 모음', category: '위로/평안', artist: '위로와 회복', url: 'https://www.youtube.com/watch?v=D9b_SBEv_XY' },
  { id: '21', title: '은혜의 찬송가 피아노 연주 베스트 모음 (묵상/기도/일할 때)', category: '찬송가', artist: '찬송가 연주', url: 'https://www.youtube.com/watch?v=BeoPMcAS3JA' },
  { id: '22', title: '잠들기 전 듣는 클래식 기타 찬송가 3시간 (수면/평안/묵상)', category: '수면/평안', artist: '수면 묵상', url: 'https://www.youtube.com/watch?v=dNntR1kU6ec' }
];

const STATIC_INFO = {
  basicLife: [
    "온전한 주일 성수 (출 20:8 ~ 11)",
    "온전한 십일조 (말 3:7 ~ 10)",
    "매일 성경읽기 (행 17:11)",
    "매일 기도하기 (살전 5:17)",
    "매일 전도하기 (행 5:42)"
  ],
  prayers: [
    "① 목사님을 위해 기도하자",
    "② 전교인 주일 성수하기 위해 기도하자",
    "③ 전교인 십일조 생활하기 위해 기도하자",
    "④ 교회부흥과 영,혼의 성장을 위해 기도하자",
    "⑤ 세계선교 및 나라와 민족을 위해 기도하자"
  ],
  branches: [
    { name: "비난고난벧엘교회", pastor: "June Pastor" },
    { name: "팔라완벧엘교회", pastor: "Kenniel Pastor" },
    { name: "나보타스벧엘교회", pastor: "Predley Pastor" }
  ],
  schedule: [
    { type: "예배", time: "매일오전 5시", name: "새벽 기도회", place: "본당 예배실" },
    { type: "예배", time: "주일오전 9/30", name: "유치부 예배", place: "주일학교 기관실" },
    { type: "예배", time: "주일오전 9, 1시", name: "유,초등부예배", place: "주일학교 기관실" },
    { type: "예배", time: "주일오전 11시", name: "주일 낮 예배", place: "본당 예배실" },
    { type: "예배", time: "주일오후 1시", name: "주일 오후 예배", place: "본당 예배실" },
    { type: "예배", time: "화요일오후 2시", name: "여호와닛시기도회", place: "김남숙권사님가정" },
    { type: "모임", time: "수요일오전11시", name: "수요 기도회", place: "본당 예배실" },
    { type: "모임", time: "셋째주오전예배후", name: "권사특별기도회", place: "4층 친교실" },
    { type: "모임", time: "금요일오후 9시", name: "철야 기도회", place: "본당 예배실" },
    { type: "모임", time: "주일오전예배후", name: "요셉청년부 예배", place: "요셉 기관실" },
    { type: "모임", time: "주일오전에 예배후", name: "에스겔학생부 예배", place: "에스겔 기관실" }
  ]
};

const S = {
  panel: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: '12px 14px 40px',
    background: '#0f0f11',
    color: '#f5f0e8'
  },
  label: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '5px',
    display: 'block'
  },
  select: {
    width: '100%',
    padding: '8px 28px 8px 10px',
    borderRadius: '8px',
    background: '#1c1c1e',
    border: '1px solid rgba(255,255,255,0.14)',
    color: '#fff',
    fontSize: '13px',
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center'
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    background: '#1c1c1e',
    border: '1px solid rgba(255,255,255,0.14)',
    color: '#fff',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '7px 12px',
    borderRadius: '20px',
    background: 'rgba(212,175,55,0.14)',
    border: '1px solid rgba(212,175,55,0.38)',
    color: '#d4af37',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer'
  }
};

/* ─── 탭0: CCM 찬양곡 선택 ─── */
function CCMTab({ liveUrl, onSelectVideo, customTracks }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const tracks = customTracks && customTracks.length > 0 ? customTracks : DEFAULT_CCM_TRACKS;
  const categories = ['전체', ...Array.from(new Set(tracks.map(t => t.category).filter(Boolean)))];

  const filtered = tracks.filter(t => {
    const matchesCat = selectedCategory === '전체' || t.category === selectedCategory;
    const matchesQ = !query.trim() || 
      t.title.toLowerCase().includes(query.trim().toLowerCase()) || 
      (t.artist && t.artist.toLowerCase().includes(query.trim().toLowerCase()));
    return matchesCat && matchesQ;
  });

  return (
    <div style={S.panel}>
      {/* 안내 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)',
        border: '1px solid rgba(212,175,55,0.35)',
        borderRadius: '12px',
        padding: '10px 14px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '20px' }}>🎵</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)' }}>
            원하시는 찬양곡을 선택해 보세요!
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.7)', wordBreak: 'keep-all' }}>
            곡을 누르면 상단 영상에서 바로 재생됩니다.
          </p>
        </div>
      </div>

      {/* 검색창 */}
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="찬양 제목 또는 키워드 검색..."
        style={{ ...S.input, marginBottom: '10px' }}
      />

      {/* 카테고리 칩 */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 700,
                background: selectedCategory === cat ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.06)',
                color: selectedCategory === cat ? '#111' : 'rgba(255,255,255,0.7)',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 찬양곡 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((item, idx) => {
          const isPlaying = liveUrl && item.url && (liveUrl.includes(item.url) || item.url.includes(liveUrl));
          return (
            <div
              key={item.id || idx}
              onClick={() => onSelectVideo && onSelectVideo(item.url, `🔴 ${item.title}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                background: isPlaying ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
                border: isPlaying ? '1px solid var(--accent-gold, #d4af37)' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isPlaying ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isPlaying ? '#111' : '#fff', flexShrink: 0
                }}>
                  {isPlaying ? <Radio size={16} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    {item.category && (
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: 'rgba(212,175,55,0.2)', color: 'var(--accent-gold, #d4af37)' }}>
                        {item.category}
                      </span>
                    )}
                    {isPlaying && (
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <CheckCircle2 size={11} /> 현재 재생 중
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '13.5px',
                    fontWeight: isPlaying ? 800 : 600,
                    color: isPlaying ? '#fff' : 'rgba(255,255,255,0.92)',
                    lineHeight: 1.35,
                    wordBreak: 'keep-all'
                  }}>
                    {item.title}
                  </p>
                  {item.artist && (
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: '2px' }}>
                      {item.artist}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVideo && onSelectVideo(item.url, `🔴 ${item.title}`);
                }}
                style={{
                  ...S.btn,
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  background: isPlaying ? 'var(--accent-gold, #d4af37)' : 'rgba(212,175,55,0.12)',
                  color: isPlaying ? '#111' : '#d4af37',
                  flexShrink: 0
                }}
              >
                {isPlaying ? '재생 중' : '재생'}
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '30px 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            검색 결과가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── 탭1: 성경 ─── */
function BibleTab() {
  const OLD_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'old');
  const NEW_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'new');

  const [testament, setTestament] = useState('old');
  const [book, setBook] = useState(OLD_BOOKS[0]);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const bookList = testament === 'old' ? OLD_BOOKS : NEW_BOOKS;

  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVerses([]);
    setError(false);
    fetchChapter(book.id, chapter)
      .then(d => {
        if (!cancelled) {
          setVerses(d || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [book, chapter]);

  const goBook = (bookId) => {
    const b = BIBLE_BOOKS.find(x => x.id === bookId);
    if (b) {
      setBook(b);
      setChapter(1);
    }
  };

  const changeChapter = (n) => {
    setChapter(n);
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  };

  return (
    <div style={{ ...S.panel, display: 'flex', flexDirection: 'column', padding: '10px 12px 30px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['old', 'new'].map(t => (
            <button
              key={t}
              onClick={() => {
                setTestament(t);
                goBook(t === 'old' ? 'gen' : 'mat');
              }}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: testament === t ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.06)',
                border: testament === t ? '1px solid rgba(212,175,55,0.45)' : '1px solid rgba(255,255,255,0.1)',
                color: testament === t ? '#d4af37' : 'rgba(255,255,255,0.55)'
              }}
            >
              {t === 'old' ? '구약' : '신약'}
            </button>
          ))}
        </div>
        <select value={book.id} onChange={e => goBook(e.target.value)} style={S.select}>
          {bookList.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => chapter > 1 && changeChapter(chapter - 1)}
            style={{ ...S.btn, padding: '7px 10px', opacity: chapter <= 1 ? 0.3 : 1 }}
          >
            <ChevronLeft size={14} />
          </button>
          <select
            value={chapter}
            onChange={e => changeChapter(Number(e.target.value))}
            style={{ ...S.select, flex: 1, textAlign: 'center' }}
          >
            {Array.from({ length: book.chapters }, (_, i) => (
              <option key={i + 1} value={i + 1}>{book.name} {i + 1}장</option>
            ))}
          </select>
          <button
            onClick={() => chapter < book.chapters && changeChapter(chapter + 1)}
            style={{ ...S.btn, padding: '7px 10px', opacity: chapter >= book.chapters ? 0.3 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'rgba(255,255,255,0.35)' }}>
            <Loader size={18} />
            <p style={{ margin: '6px 0 0', fontSize: '11.5px' }}>말씀을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '32px 12px', color: 'rgba(255,255,255,0.4)' }}>
            <p style={{ fontSize: '24px', margin: '0 0 8px' }}>📶</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>말씀을 불러오지 못했습니다</p>
            <p style={{ fontSize: '11.5px', margin: 0, lineHeight: 1.5 }}>
              인터넷 연결을 확인하신 후<br/>다시 시도해 주세요
            </p>
            <button
              onClick={() => { setVerses([]); setError(false); setLoading(true); fetchChapter(book.id, chapter).then(d => { setVerses(d || []); setLoading(false); }).catch(() => { setLoading(false); setError(true); }); }}
              style={{ marginTop: '14px', padding: '8px 18px', borderRadius: '8px', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              🔄 다시 불러오기
            </button>
          </div>
        ) : verses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            <p style={{ fontSize: '22px', margin: '0 0 8px' }}>📖</p>
            <p style={{ margin: 0 }}>구절 데이터가 없습니다</p>
          </div>
        ) : (
          verses.map(v => (
            <div
              key={v.verse}
              style={{
                display: 'flex',
                gap: '8px',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.055)',
                alignItems: 'flex-start',
                lineHeight: 1.65
              }}
            >
              <span style={{ minWidth: '18px', fontSize: '9.5px', fontWeight: 800, color: '#d4af37', paddingTop: '3px', flexShrink: 0 }}>
                {v.verse}
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', wordBreak: 'keep-all' }}>
                {v.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── 탭2: 찬송가 (가사 및 악보 이미지 조회 지원) ─── */
function HymnsTab() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('lyrics'); // 'lyrics' or 'score'
  const [fontSize, setFontSize] = useState(14);
  const [scoreZoom, setScoreZoom] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);

  const cleanQ = query.trim();
  const results = cleanQ
    ? TONGL_HYMNS.filter(h => {
        const numStr = String(h.num || '');
        const newNumStr = String(h.newNum || '');
        return numStr === cleanQ ||
               numStr.startsWith(cleanQ) ||
               numStr.includes(cleanQ) ||
               newNumStr === cleanQ ||
               newNumStr.includes(cleanQ) ||
               (h.title && h.title.includes(cleanQ)) ||
               (h.lyrics && h.lyrics.some(l => l.includes(cleanQ)));
      }).slice(0, 50)
    : TONGL_HYMNS.slice(0, 50);

  if (selected) {
    const scoreImgUrl = `https://wsrv.nl/?url=http%3A%2F%2Fwww.holybible.or.kr%2FHYMN%2FHYMN_SCR%2F${String(selected.num).padStart(3, '0')}.jpg&output=jpg&n=-1`;

    return (
      <div style={S.panel}>
        {/* 상단 툴바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
          <button onClick={() => setSelected(null)} style={{ ...S.btn, padding: '5px 9px' }}>
            <ChevronLeft size={13} /> 목록
          </button>
          
          <div style={{ flex: '1 1 180px', minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: '#fff', wordBreak: 'keep-all' }}>
              {selected.num}장 {selected.title}
            </span>
            {selected.newNum && selected.newNum !== selected.num && (
              <span style={{ fontSize: '10.5px', color: 'rgba(212,175,55,0.8)', marginLeft: '6px' }}>
                (새 {selected.newNum}장)
              </span>
            )}
          </div>

          {/* 가사 ↔ 악보 모드 전환 버튼 */}
          <div style={{ display: 'flex', background: '#1c1c1e', padding: '2px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <button
              onClick={() => setViewMode('lyrics')}
              style={{
                padding: '4px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'lyrics' ? 'var(--accent-gold, #d4af37)' : 'transparent',
                color: viewMode === 'lyrics' ? '#111' : 'rgba(255,255,255,0.7)',
                fontWeight: 700, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px'
              }}
            >
              <AlignLeft size={11} /> 가사
            </button>
            <button
              onClick={() => { setViewMode('score'); setScoreLoading(true); }}
              style={{
                padding: '4px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: viewMode === 'score' ? 'var(--accent-gold, #d4af37)' : 'transparent',
                color: viewMode === 'score' ? '#111' : 'rgba(255,255,255,0.7)',
                fontWeight: 700, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px'
              }}
            >
              <ImageIcon size={11} /> 악보
            </button>
          </div>

          {viewMode === 'lyrics' && (
            <div style={{ display: 'flex', gap: '3px' }}>
              <button onClick={() => setFontSize(f => Math.max(11, f - 1))} style={{ ...S.btn, padding: '3px 7px', fontSize: '11px' }}>A-</button>
              <button onClick={() => setFontSize(f => Math.min(22, f + 1))} style={{ ...S.btn, padding: '3px 7px', fontSize: '11px' }}>A+</button>
            </div>
          )}

          {viewMode === 'score' && (
            <button
              onClick={() => setScoreZoom(z => !z)}
              style={{ ...S.btn, padding: '4px 8px', fontSize: '11px' }}
              title={scoreZoom ? '기본 크기' : '확대 보기'}
            >
              {scoreZoom ? <ZoomOut size={12} /> : <ZoomIn size={12} />}
              {scoreZoom ? '축소' : '확대'}
            </button>
          )}
        </div>

        {/* 가사 보기 */}
        {viewMode === 'lyrics' && (
          <div style={{ padding: '4px 0 20px' }}>
            {(selected.lyrics || []).map((verse, i) =>
              verse.startsWith('[') ? (
                <p key={i} style={{ margin: '6px 0 2px', fontSize: '11.5px', fontWeight: 800, color: '#d4af37' }}>
                  {verse}
                </p>
              ) : (
                <div key={i} style={{ marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', borderLeft: '3px solid rgba(212,175,55,0.4)' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.7)', display: 'block', marginBottom: '3px', fontWeight: 800 }}>
                    {i + 1}절
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: `${fontSize}px`,
                      color: 'rgba(255,255,255,0.92)',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'keep-all'
                    }}
                  >
                    {verse}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* 악보 보기 */}
        {viewMode === 'score' && (
          <div style={{ overflowX: scoreZoom ? 'auto' : 'hidden', textAlign: 'center', padding: '6px 0 20px' }}>
            {scoreLoading && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.4)' }}>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: '6px 0 0', fontSize: '11.5px' }}>악보 이미지를 불러오는 중...</p>
              </div>
            )}
            <img
              src={scoreImgUrl}
              alt={`통일찬송가 ${selected.num}장 악보`}
              onLoad={() => setScoreLoading(false)}
              onError={() => setScoreLoading(false)}
              style={{
                display: scoreLoading ? 'none' : 'block',
                width: scoreZoom ? '150%' : '100%',
                maxWidth: scoreZoom ? 'none' : '100%',
                borderRadius: '8px',
                background: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                margin: '0 auto'
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={S.panel}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="장수 번호(예: 1, 405, 28) 또는 제목 검색"
        style={{ ...S.input, marginBottom: '8px' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '24px' }}>
        {results.map(h => (
          <button
            key={h.num}
            onClick={() => { setSelected(h); setViewMode('lyrics'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 8px',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <span style={{ minWidth: '32px', fontSize: '12px', fontWeight: 800, color: '#d4af37' }}>
              {h.num}장
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', wordBreak: 'keep-all', flex: 1 }}>
              {h.title}
            </span>
            {h.newNum && h.newNum !== h.num && (
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                (새 {h.newNum})
              </span>
            )}
          </button>
        ))}
        {results.length === 0 && (
          <p style={{ textAlign: 'center', padding: '24px 0', fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>
            검색된 찬송가가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── 탭3: 주보 (전체 예배순서, 오후예배, 교회소식, 기도제목 완벽 표시) ─── */
function BulletinTab({ db }) {
  const [bulletins, setBulletins] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 실제 주보 날짜 파싱 헬퍼 (Bulletin.jsx와 동일한 정렬 규칙)
  const parseBulletinDate = (bulletin) => {
    if (bulletin.date) {
      const cleaned = String(bulletin.date).trim();
      let parsed = new Date(cleaned).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
      const match = cleaned.match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        parsed = new Date(year, month, day).getTime();
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    if (bulletin.createdAt?.seconds) {
      return bulletin.createdAt.seconds * 1000;
    }
    return 0;
  };

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    let unsub;
    import('firebase/firestore').then(({ collection, query, onSnapshot }) => {
      const q = query(collection(db, 'bulletins'));
      unsub = onSnapshot(
        q,
        snap => {
          const list = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(b => !b.isSermon && (b.isDigital || b.imageUrl || b.worshipOrder));

          list.sort((a, b) => {
            const timeA = parseBulletinDate(a);
            const timeB = parseBulletinDate(b);
            if (timeB !== timeA) return timeB - timeA;
            const dateA = a.date || '';
            const dateB = b.date || '';
            return dateB.localeCompare(dateA);
          });

          setBulletins(list);
          setLoading(false);
        },
        () => setLoading(false)
      );
    });
    return () => unsub && unsub();
  }, [db]);

  // 선택된 주보가 있으면 그것을 표시하고, 없으면 항상 가장 최신(0번째) 주보 표시
  const currentBulletin = (selectedId && bulletins.find(b => b.id === selectedId)) || bulletins[0];
  const latest = currentBulletin;

  if (loading) {
    return (
      <div style={{ ...S.panel, textAlign: 'center', paddingTop: '40px' }}>
        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'rgba(255,255,255,0.4)' }}>주보를 불러오는 중...</p>
      </div>
    );
  }

  const FALLBACK_ORDER = [
    { type: '※ 목도', content: '', leader: '다같이' },
    { type: '경시 묵상', content: '', leader: '사회자' },
    { type: '기원', content: '', leader: '사회자' },
    { type: '※ 찬송', content: '27(27)', leader: '다같이' },
    { type: '※ 교독문', content: '24. 시편 100편', leader: '사회와 회중' },
    { type: '※ 신앙 고백', content: '사도신경', leader: '다같이' },
    { type: '기도', content: '', leader: '장로' },
    { type: '성경 봉독', content: '', leader: '사회자' },
    { type: '말씀 선포', content: '', leader: '김석주 목사' },
    { type: '※ 찬송', content: '', leader: '다같이' },
    { type: '봉헌', content: '', leader: '헌금 위원' },
    { type: '광고', content: '', leader: '사회자' },
    { type: '※ 축도', content: '', leader: '김석주 목사' }
  ];

  return (
    <div style={{ ...S.panel, paddingBottom: '80px' }}>
      {latest ? (
        <div>
          {/* 주보 날짜 선택 드롭다운 (주보가 여러 개 있을 때 지난 주보 선택 가능) */}
          {bulletins.length > 1 && (
            <div style={{ marginBottom: '12px' }}>
              <select
                value={latest.id}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: '#1c1c1e',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: 'var(--accent-gold, #d4af37)',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                {bulletins.map((b, idx) => (
                  <option key={b.id} value={b.id}>
                    {idx === 0 ? '✨ [최신] ' : '📜 '} {b.date ? `(${b.date}) ` : ''}{b.title || '주일 주보'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 주보 헤더 카드 */}
          <div style={{
            background: 'linear-gradient(135deg, #1c1c20 0%, #161618 100%)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)', letterSpacing: '1px' }}>
              ⛪ 화도벧엘교회 스마트 주보
            </span>
            <h3 style={{ margin: '4px 0 2px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>
              {latest.title || '주일 주보'}
            </h3>
            {latest.date && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {latest.date}
              </span>
            )}
          </div>

          {/* 이미지 주보인 경우 */}
          {latest.imageUrl && (
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <img src={latest.imageUrl} alt="주보 이미지" style={{ width: '100%', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }} />
            </div>
          )}

          {/* 1. 주일 오전 예배 순서 (완벽한 좌/중/우 3열 정렬) */}
          <div style={{
            background: '#161618',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--accent-gold, #d4af37)',
              borderBottom: '1px solid rgba(212,175,55,0.25)',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>✞</span> 주일 오전 예배 순서
            </h4>

            <table style={{ width: '100%', tableLayout: 'fixed', fontSize: '12.5px', borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: '28%' }} />
                <col style={{ width: '44%' }} />
                <col style={{ width: '28%' }} />
              </colgroup>
              <tbody>
                {(latest.worshipOrder?.length > 0 ? latest.worshipOrder : FALLBACK_ORDER).map((item, i) => {
                  const isStand = item.type?.includes('※');
                  return (
                    <tr key={i} style={{ borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
                      <td style={{
                        padding: '8px 4px',
                        textAlign: 'left',
                        fontWeight: isStand ? 800 : 500,
                        color: isStand ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.7)',
                        verticalAlign: 'middle',
                        wordBreak: 'keep-all'
                      }}>
                        {item.type}
                      </td>
                      <td style={{
                        padding: '8px 4px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#fff',
                        verticalAlign: 'middle',
                        wordBreak: 'keep-all'
                      }}>
                        {item.content || '-'}
                      </td>
                      <td style={{
                        padding: '8px 4px',
                        textAlign: 'right',
                        color: 'rgba(255,255,255,0.5)',
                        verticalAlign: 'middle',
                        wordBreak: 'keep-all'
                      }}>
                        {item.leader}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: '10.5px', color: 'rgba(255,255,255,0.4)' }}>
              ※ 표는 일어서서 참여합니다
            </p>
          </div>

          {/* 2. 주일 오후 예배 순서 (있는 경우) */}
          {latest.includeAfternoon && latest.afternoonOrder?.length > 0 && (
            <div style={{
              background: '#161618',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--accent-gold, #d4af37)',
                borderBottom: '1px solid rgba(212,175,55,0.25)',
                paddingBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>✞</span> 주일 오후 예배 순서
              </h4>

              <table style={{ width: '100%', tableLayout: 'fixed', fontSize: '12.5px', borderCollapse: 'collapse' }}>
                <colgroup>
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '44%' }} />
                  <col style={{ width: '28%' }} />
                </colgroup>
                <tbody>
                  {latest.afternoonOrder.map((item, i) => {
                    const isStand = item.type?.includes('※');
                    return (
                      <tr key={i} style={{ borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
                        <td style={{
                          padding: '8px 4px',
                          textAlign: 'left',
                          fontWeight: isStand ? 800 : 500,
                          color: isStand ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.7)',
                          verticalAlign: 'middle',
                          wordBreak: 'keep-all'
                        }}>
                          {item.type}
                        </td>
                        <td style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          fontWeight: 600,
                          color: '#fff',
                          verticalAlign: 'middle',
                          wordBreak: 'keep-all'
                        }}>
                          {item.content || '-'}
                        </td>
                        <td style={{
                          padding: '8px 4px',
                          textAlign: 'right',
                          color: 'rgba(255,255,255,0.5)',
                          verticalAlign: 'middle',
                          wordBreak: 'keep-all'
                        }}>
                          {item.leader}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. 교회 소식 & 알림 (줄바꿈 완벽 보존) */}
          {(latest.news?.length > 0 || latest.newsSubtitle) && (
            <div style={{
              background: '#161618',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--accent-gold, #d4af37)',
                borderBottom: '1px solid rgba(212,175,55,0.25)',
                paddingBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>ℹ</span> 교회 소식 & 알림
              </h4>

              {latest.newsSubtitle && (
                <div style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'keep-all',
                  fontSize: '12px',
                  color: '#fff',
                  lineHeight: 1.6
                }}>
                  {latest.newsSubtitle}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {latest.news?.map((n, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      background: 'var(--accent-gold, #d4af37)',
                      color: '#111',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </span>
                    <div style={{
                      flex: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'keep-all',
                      fontSize: '12.5px',
                      color: 'rgba(255,255,255,0.92)',
                      lineHeight: 1.65,
                      fontFamily: 'inherit'
                    }}>
                      {n}
                    </div>
                  </div>
                ))}
              </div>

              {latest.newsImageUrl && (
                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <img src={latest.newsImageUrl} alt="소식 이미지" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                </div>
              )}
            </div>
          )}

          {/* 4. 성도의 기본생활 & 기도제목 & 필리핀 지교회 (3열 카드) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ background: '#161618', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h5 style={{ margin: '0 0 8px 0', color: 'var(--accent-gold, #d4af37)', fontSize: '12px', fontWeight: 800, textAlign: 'center' }}>
                ✿ 성도의 기본생활 ✿
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                {STATIC_INFO.basicLife.map((life, i) => (
                  <div key={i}>• {life}</div>
                ))}
              </div>
            </div>

            <div style={{ background: '#161618', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h5 style={{ margin: '0 0 8px 0', color: 'var(--accent-gold, #d4af37)', fontSize: '12px', fontWeight: 800, textAlign: 'center' }}>
                🙏 벧엘교회 기도 제목
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                {STATIC_INFO.prayers.map((prayer, i) => (
                  <div key={i}>{prayer}</div>
                ))}
              </div>
            </div>

            <div style={{ background: '#161618', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '12px', fontWeight: 800, textAlign: 'center' }}>
                ♥ 필리핀 지교회 ♥
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                {STATIC_INFO.branches.map((branch, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👤</span> <span>{branch.name}</span> : <span style={{ color: '#f59e0b', fontWeight: 700 }}>{branch.pastor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. 예배 시간 안내 (스마트주보와 100% 동일한 11개 항목 및 헤더) */}
          <div style={{ background: '#161618', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-gold, #d4af37)', fontSize: '13px', fontWeight: 800, textAlign: 'center' }}>
              🕒 예배 시간 안내
            </h5>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', tableLayout: 'fixed', fontSize: '11.5px', borderCollapse: 'collapse', textAlign: 'center' }}>
                <colgroup>
                  <col style={{ width: '36%' }} />
                  <col style={{ width: '36%' }} />
                  <col style={{ width: '28%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold, #d4af37)' }}>
                    <th style={{ padding: '7px 4px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, wordBreak: 'keep-all' }}>일시</th>
                    <th style={{ padding: '7px 4px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, wordBreak: 'keep-all' }}>예배종류</th>
                    <th style={{ padding: '7px 4px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, wordBreak: 'keep-all' }}>장소</th>
                  </tr>
                </thead>
                <tbody>
                  {STATIC_INFO.schedule.map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '7px 4px', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', wordBreak: 'keep-all', lineHeight: 1.4 }}>{item.time}</td>
                      <td style={{ padding: '7px 4px', border: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: 'var(--accent-gold, #d4af37)', wordBreak: 'keep-all', lineHeight: 1.4 }}>{item.name}</td>
                      <td style={{ padding: '7px 4px', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', wordBreak: 'keep-all', lineHeight: 1.4 }}>{item.place}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37', padding: '9px 12px', borderRadius: '8px', marginTop: '12px', fontSize: '11px', lineHeight: 1.5, wordBreak: 'keep-all' }}>
              날마다 마음을 같이하여 성전에 모이기를 힘쓰고... (행 2:46)
            </div>
          </div>
        </div>
      ) : (
        <div>
          <span style={{ ...S.label, color: 'var(--accent-gold, #d4af37)' }}>⛪ 기본 예배 순서 안내</span>
          <table style={{ width: '100%', tableLayout: 'fixed', fontSize: '12.5px', borderCollapse: 'collapse' }}>
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '44%' }} />
              <col style={{ width: '28%' }} />
            </colgroup>
            <tbody>
              {FALLBACK_ORDER.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '8px 4px', color: item.type.includes('※') ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.7)', fontWeight: item.type.includes('※') ? 800 : 500 }}>
                    {item.type}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', color: '#fff' }}>
                    {item.content || '-'}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', color: 'rgba(255,255,255,0.45)' }}>
                    {item.leader}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── 탭4: 말씀 검색 ─── */
function SearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    const searchBooks = ['psa', 'pro', 'isa', 'mat', 'mar', 'luk', 'joh', 'act', 'rom', '1co', 'eph', 'php', 'heb', '1pe', 'rev'];
    const found = [];
    for (const bookId of searchBooks) {
      if (found.length >= 20) break;
      const book = BIBLE_BOOKS.find(b => b.id === bookId);
      if (!book) continue;
      try {
        for (let ch = 1; ch <= book.chapters; ch++) {
          if (found.length >= 20) break;
          const vv = await fetchChapter(bookId, ch);
          (vv || [])
            .filter(v => v.text && v.text.includes(q))
            .forEach(v => {
              if (found.length < 20) found.push({ bookName: book.name, chapter: ch, verse: v.verse, text: v.text });
            });
        }
      } catch (e) {
        /* continue */
      }
    }
    setResults(found);
    setLoading(false);
  };

  const highlight = (text, q) => {
    if (!q || !text) return text;
    const lowerQ = q.toLowerCase();
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(lowerQ);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const matched = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <span>
        {before}
        <mark style={{ background: 'rgba(212,175,55,0.38)', color: '#fff', borderRadius: '2px', padding: '0 1px' }}>{matched}</mark>
        {after}
      </span>
    );
  };

  return (
    <div style={S.panel}>
      <div style={{ display: 'flex', gap: '7px', marginBottom: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="말씀 검색 (예: 사랑, 기도, 은혜)"
          style={{ ...S.input, flex: 1 }}
        />
        <button onClick={handleSearch} style={{ ...S.btn, padding: '9px 13px', flexShrink: 0 }}>
          <Search size={14} />
        </button>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: '10.5px', color: 'rgba(255,255,255,0.32)', wordBreak: 'keep-all' }}>
        시편·잠언·이사야·신약 전서 중심으로 검색합니다
      </p>
      {loading && (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'rgba(255,255,255,0.35)' }}>
          <Loader size={18} />
          <p style={{ margin: '6px 0 0', fontSize: '11.5px' }}>검색 중...</p>
        </div>
      )}
      {!loading && searched && results.length === 0 && (
        <p style={{ textAlign: 'center', padding: '28px 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          검색 결과가 없습니다.
        </p>
      )}
      {results.map((r, i) => (
        <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#d4af37', display: 'block', marginBottom: '3px' }}>
            {r.bookName} {r.chapter}:{r.verse}
          </span>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, wordBreak: 'keep-all' }}>{highlight(r.text, query)}</p>
        </div>
      ))}
    </div>
  );
}

export default function LivePlayerTabs({ db, liveTitle = '', liveUrl = '', onSelectVideo, customTracks }) {
  // 방송 제목에 CCM 또는 찬양이 포함되어 있으면 기본 탭을 'ccm'으로 활성화!
  const isCCM = Boolean(liveTitle && (liveTitle.includes('CCM') || liveTitle.includes('찬양')));
  const [activeTab, setActiveTab] = useState(isCCM ? 'ccm' : 'bible');

  useEffect(() => {
    if (isCCM) {
      setActiveTab('ccm');
    }
  }, [isCCM]);

  // CCM 방송 중일 때와 예배 생중계 중일 때 탭 구성
  const tabs = isCCM
    ? [
        { key: 'ccm',      label: '찬양곡',   Icon: Music },
        { key: 'hymns',    label: '찬송가',   Icon: BookOpen },
        { key: 'bible',    label: '성경',     Icon: BookOpen },
        { key: 'bulletin', label: '주보',     Icon: FileText },
        { key: 'search',   label: '검색',     Icon: Search },
      ]
    : [
        { key: 'bible',    label: '성경',     Icon: BookOpen },
        { key: 'hymns',    label: '찬송가',   Icon: Music },
        { key: 'bulletin', label: '주보',     Icon: FileText },
        { key: 'search',   label: '검색',     Icon: Search },
        { key: 'ccm',      label: 'CCM찬양',  Icon: Sparkles },
      ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: '#0f0f11' }}>
      {/* 탭 네비게이션 바 */}
      <div style={{ display: 'flex', background: '#161618', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {tabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '9px 2px',
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid #d4af37' : '2px solid transparent',
                color: active ? '#d4af37' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: active ? 800 : 600,
                transition: 'all 0.15s'
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'ccm'      && <CCMTab liveUrl={liveUrl} onSelectVideo={onSelectVideo} customTracks={customTracks} />}
        {activeTab === 'bible'    && <BibleTab />}
        {activeTab === 'hymns'    && <HymnsTab />}
        {activeTab === 'bulletin' && <BulletinTab db={db} />}
        {activeTab === 'search'   && <SearchTab />}
      </div>
    </div>
  );
}
