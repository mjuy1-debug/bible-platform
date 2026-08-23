import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Music, FileText, Search, ChevronLeft, ChevronRight, Loader, ZoomIn, ZoomOut, Image as ImageIcon, AlignLeft } from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleData';
import { fetchChapter } from '../services/bibleService';
import { TONGL_HYMNS } from '../data/hymnsData';

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

const OLD_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'old');
const NEW_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'new');

/* ─── 탭1: 성경 ─── */
function BibleTab() {
  const [testament, setTestament] = useState('old');
  const [book, setBook] = useState(BIBLE_BOOKS[0]);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const bookList = testament === 'old' ? OLD_BOOKS : NEW_BOOKS;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVerses([]);
    fetchChapter(book.id, chapter)
      .then(d => {
        if (!cancelled) {
          setVerses(d || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
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
  const [loading, setLoading] = useState(true);

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
            const dateA = a.date || '';
            const dateB = b.date || '';
            if (dateB !== dateA) return dateB.localeCompare(dateA);
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          setBulletins(list);
          setLoading(false);
        },
        () => setLoading(false)
      );
    });
    return () => unsub && unsub();
  }, [db]);

  const latest = bulletins[0];

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
    <div style={{ ...S.panel, paddingBottom: '60px' }}>
      {latest ? (
        <div>
          {/* 주보 제목 & 날짜 헤더 */}
          <div style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ ...S.label, color: 'var(--accent-gold, #d4af37)' }}>⛪ 화도벧엘교회 주보</span>
            <p style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#fff' }}>
              {latest.title || '주일 주보'}
            </p>
            {latest.date && (
              <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>
                {latest.date}
              </p>
            )}
          </div>

          {/* 이미지 주보인 경우 */}
          {latest.imageUrl && (
            <img src={latest.imageUrl} alt="주보" style={{ width: '100%', borderRadius: '8px', marginBottom: '14px' }} />
          )}

          {/* 1. 주일 오전 예배 순서 */}
          <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✞</span> 주일 오전 예배 순서
            </h4>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tbody>
                {(latest.worshipOrder?.length > 0 ? latest.worshipOrder : FALLBACK_ORDER).map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '6px 4px', width: '28%', fontWeight: item.type?.includes('※') ? 'bold' : 'normal', color: item.type?.includes('※') ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.6)', verticalAlign: 'top' }}>
                      {item.type}
                    </td>
                    <td style={{ padding: '6px 4px', width: '46%', color: 'rgba(255,255,255,0.92)', verticalAlign: 'top', wordBreak: 'keep-all' }}>
                      {item.content}
                    </td>
                    <td style={{ padding: '6px 4px', width: '26%', textAlign: 'right', color: 'rgba(255,255,255,0.45)', verticalAlign: 'top', wordBreak: 'keep-all' }}>
                      {item.leader}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. 주일 오후 예배 순서 (있는 경우) */}
          {latest.includeAfternoon && latest.afternoonOrder?.length > 0 && (
            <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✞</span> 주일 오후 예배 순서
              </h4>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  {latest.afternoonOrder.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '6px 4px', width: '28%', fontWeight: item.type?.includes('※') ? 'bold' : 'normal', color: item.type?.includes('※') ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.6)', verticalAlign: 'top' }}>
                        {item.type}
                      </td>
                      <td style={{ padding: '6px 4px', width: '46%', color: 'rgba(255,255,255,0.92)', verticalAlign: 'top', wordBreak: 'keep-all' }}>
                        {item.content}
                      </td>
                      <td style={{ padding: '6px 4px', width: '26%', textAlign: 'right', color: 'rgba(255,255,255,0.45)', verticalAlign: 'top', wordBreak: 'keep-all' }}>
                        {item.leader}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. 교회 소식 */}
          {(latest.news?.length > 0 || latest.newsSubtitle) && (
            <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>ℹ</span> 교회 소식 & 알림
              </h4>
              {latest.newsSubtitle && (
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'rgba(212,175,55,0.9)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                  {latest.newsSubtitle}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {latest.news?.map((n, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
                    <span style={{ color: 'var(--accent-gold, #d4af37)', fontWeight: 800, flexShrink: 0 }}>{idx + 1}.</span>
                    <span style={{ wordBreak: 'keep-all' }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 기도 제목 & 기본 생활 */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold, #d4af37)' }}>
              🙏 교회 기도 제목
            </h4>
            {STATIC_INFO.prayers.map((p, i) => (
              <p key={i} style={{ margin: '0 0 5px', fontSize: '11.5px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45, wordBreak: 'keep-all' }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <span style={{ ...S.label, color: 'var(--accent-gold, #d4af37)' }}>⛪ 기본 예배 순서 안내</span>
          <table style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse' }}>
            <tbody>
              {FALLBACK_ORDER.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '8px 4px', width: '30%', color: item.type.includes('※') ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.7)', fontWeight: item.type.includes('※') ? 800 : 500 }}>
                    {item.type}
                  </td>
                  <td style={{ padding: '8px 4px', width: '45%', color: '#fff' }}>
                    {item.content}
                  </td>
                  <td style={{ padding: '8px 4px', width: '25%', textAlign: 'right', color: 'rgba(255,255,255,0.45)' }}>
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

const TABS = [
  { key: 'bible', label: '성경', Icon: BookOpen },
  { key: 'hymns', label: '찬송가', Icon: Music },
  { key: 'bulletin', label: '주보', Icon: FileText },
  { key: 'search', label: '검색', Icon: Search }
];

export default function LivePlayerTabs({ db }) {
  const [activeTab, setActiveTab] = useState('bible');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: '#0f0f11' }}>
      <div style={{ display: 'flex', background: '#161618', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {TABS.map(({ key, label, Icon }) => {
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
                padding: '9px 4px',
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
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'bible' && <BibleTab />}
        {activeTab === 'hymns' && <HymnsTab />}
        {activeTab === 'bulletin' && <BulletinTab db={db} />}
        {activeTab === 'search' && <SearchTab />}
      </div>
    </div>
  );
}
