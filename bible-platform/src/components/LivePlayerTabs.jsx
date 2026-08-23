import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Music, FileText, Search, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleData';
import { fetchChapter } from '../services/bibleService';
import { TONGL_HYMNS } from '../data/hymnsData';

const S = {
  panel: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: '12px 14px 24px',
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

function BibleTab() {
  const [testament, setTestament] = useState("old");
  const [book, setBook] = useState(BIBLE_BOOKS[0]);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const bookList = testament === "old" ? OLD_BOOKS : NEW_BOOKS;

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setVerses([]);
    fetchChapter(book.id, chapter)
      .then(d => { if (!cancelled) { setVerses(d || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [book, chapter]);

  const goBook = (bookId) => { const b = BIBLE_BOOKS.find(x => x.id === bookId); if (b) { setBook(b); setChapter(1); } };
  const changeChapter = (n) => { setChapter(n); scrollRef.current && scrollRef.current.scrollTo(0, 0); };

  return (
    React.createElement("div", { style: { ...S.panel, display: "flex", flexDirection: "column", padding: "10px 12px 20px" } },
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "7px", marginBottom: "10px" } },
        React.createElement("div", { style: { display: "flex", gap: "6px" } },
          ["old", "new"].map(t =>
            React.createElement("button", { key: t, onClick: () => { setTestament(t); goBook(t === "old" ? "gen" : "mat"); }, style: { flex: 1, padding: "7px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", background: testament === t ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.06)", border: testament === t ? "1px solid rgba(212,175,55,0.45)" : "1px solid rgba(255,255,255,0.1)", color: testament === t ? "#d4af37" : "rgba(255,255,255,0.55)" } }, t === "old" ? "구약" : "신약")
          )
        ),
        React.createElement("select", { value: book.id, onChange: e => goBook(e.target.value), style: S.select },
          bookList.map(b => React.createElement("option", { key: b.id, value: b.id }, b.name))
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "6px" } },
          React.createElement("button", { onClick: () => chapter > 1 && changeChapter(chapter - 1), style: { ...S.btn, padding: "7px 10px", opacity: chapter <= 1 ? 0.3 : 1 } }, React.createElement(ChevronLeft, { size: 14 })),
          React.createElement("select", { value: chapter, onChange: e => changeChapter(Number(e.target.value)), style: { ...S.select, flex: 1, textAlign: "center" } },
            Array.from({ length: book.chapters }, (_, i) => React.createElement("option", { key: i + 1, value: i + 1 }, book.name + " " + (i + 1) + "장"))
          ),
          React.createElement("button", { onClick: () => chapter < book.chapters && changeChapter(chapter + 1), style: { ...S.btn, padding: "7px 10px", opacity: chapter >= book.chapters ? 0.3 : 1 } }, React.createElement(ChevronRight, { size: 14 }))
        )
      ),
      React.createElement("div", { ref: scrollRef, style: { flex: 1, overflowY: "auto" } },
        loading
          ? React.createElement("div", { style: { textAlign: "center", padding: "28px 0", color: "rgba(255,255,255,0.35)" } }, React.createElement(Loader, { size: 18 }), React.createElement("p", { style: { margin: "6px 0 0", fontSize: "11.5px" } }, "말씀을 불러오는 중..."))
          : verses.map(v => React.createElement("div", { key: v.verse, style: { display: "flex", gap: "8px", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.055)", alignItems: "flex-start", lineHeight: 1.65 } },
              React.createElement("span", { style: { minWidth: "18px", fontSize: "9.5px", fontWeight: 800, color: "#d4af37", paddingTop: "3px", flexShrink: 0 } }, v.verse),
              React.createElement("span", { style: { fontSize: "13px", color: "rgba(255,255,255,0.9)", wordBreak: "keep-all" } }, v.text)
            ))
      )
    )
  );
}

function HymnsTab() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [fontSize, setFontSize] = useState(14);

  const results = query.trim()
    ? TONGL_HYMNS.filter(h => String(h.number).includes(query.trim()) || (h.title && h.title.includes(query.trim()))).slice(0, 40)
    : TONGL_HYMNS.slice(0, 60);

  if (selected) {
    return React.createElement("div", { style: S.panel },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" } },
        React.createElement("button", { onClick: () => setSelected(null), style: { ...S.btn, padding: "6px 10px" } }, React.createElement(ChevronLeft, { size: 14 }), " 목록"),
        React.createElement("span", { style: { flex: 1, fontWeight: 800, fontSize: "13.5px", color: "#fff", wordBreak: "keep-all" } }, selected.number + "장 " + selected.title),
        React.createElement("button", { onClick: () => setFontSize(f => Math.max(11, f - 1)), style: { ...S.btn, padding: "4px 8px" } }, "A-"),
        React.createElement("button", { onClick: () => setFontSize(f => Math.min(22, f + 1)), style: { ...S.btn, padding: "4px 8px" } }, "A+")
      ),
      (selected.lyrics || []).map((verse, i) =>
        verse.startsWith("[")
          ? React.createElement("p", { key: i, style: { margin: "4px 0", fontSize: "11px", fontWeight: 800, color: "#d4af37" } }, verse)
          : React.createElement("div", { key: i, style: { marginBottom: "16px" } },
              React.createElement("span", { style: { fontSize: "10px", color: "rgba(255,255,255,0.38)", display: "block", marginBottom: "3px" } }, (i + 1) + "절"),
              React.createElement("p", { style: { margin: 0, fontSize: fontSize + "px", color: "rgba(255,255,255,0.9)", lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "keep-all" } }, verse)
            )
      )
    );
  }

  return React.createElement("div", { style: S.panel },
    React.createElement("input", { type: "text", value: query, onChange: e => setQuery(e.target.value), placeholder: "번호 또는 제목 검색 (예: 93, 찬양)", style: { ...S.input, marginBottom: "10px" } }),
    results.map(h => React.createElement("button", { key: h.number, onClick: () => setSelected(h), style: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 6px", borderRadius: "6px", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left", cursor: "pointer", width: "100%" } },
      React.createElement("span", { style: { minWidth: "30px", fontSize: "11.5px", fontWeight: 800, color: "#d4af37" } }, h.number),
      React.createElement("span", { style: { fontSize: "13px", color: "rgba(255,255,255,0.88)", wordBreak: "keep-all" } }, h.title)
    ))
  );
}

function BulletinTab({ db }) {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    let unsub;
    import("firebase/firestore").then(({ collection, query, orderBy, onSnapshot }) => {
      const q = query(collection(db, "bulletins"), orderBy("createdAt", "desc"));
      unsub = onSnapshot(q, snap => { setBulletins(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }, () => setLoading(false));
    });
    return () => unsub && unsub();
  }, [db]);

  const latest = bulletins[0];

  if (loading) return React.createElement("div", { style: { ...S.panel, textAlign: "center", paddingTop: "40px" } },
    React.createElement(Loader, { size: 18 }),
    React.createElement("p", { style: { margin: "6px 0 0", fontSize: "11.5px", color: "rgba(255,255,255,0.4)" } }, "주보를 불러오는 중...")
  );

  const FALLBACK = ["※ 목도", "경시 묵상", "기원", "※ 찬송", "※ 교독문", "※ 신앙 고백", "기도", "성경봉독", "설교", "※ 찬송", "봉헌", "광고", "※ 축도"];

  return React.createElement("div", { style: S.panel },
    latest
      ? React.createElement("div", null,
          React.createElement("p", { style: { margin: "0 0 4px", fontSize: "15px", fontWeight: 800, color: "#fff" } }, latest.title || "주보"),
          latest.date && React.createElement("p", { style: { margin: "0 0 12px", fontSize: "11px", color: "rgba(255,255,255,0.45)" } }, latest.date),
          latest.imageUrl && React.createElement("img", { src: latest.imageUrl, alt: "주보", style: { width: "100%", borderRadius: "8px", marginBottom: "12px" } }),
          latest.content && React.createElement("p", { style: { margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "keep-all" } }, latest.content),
          latest.worshipOrder && latest.worshipOrder.length > 0 && React.createElement("div", { style: { marginTop: "14px" } },
            React.createElement("span", { style: S.label }, "예배 순서"),
            latest.worshipOrder.map((item, i) => React.createElement("div", { key: i, style: { display: "flex", gap: "10px", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" } },
              React.createElement("span", { style: { minWidth: "90px", fontSize: "11px", color: "rgba(255,255,255,0.45)" } }, item.type),
              React.createElement("span", { style: { fontSize: "12.5px", color: "rgba(255,255,255,0.88)", flex: 1, wordBreak: "keep-all" } }, item.content)
            ))
          )
        )
      : React.createElement("div", null,
          React.createElement("p", { style: { fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "12px", wordBreak: "keep-all" } }, "아직 등록된 주보가 없습니다."),
          React.createElement("span", { style: S.label }, "⛪ 기본 예배 순서 안내"),
          FALLBACK.map((item, i) => React.createElement("div", { key: i, style: { padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "13px", color: "rgba(255,255,255,0.82)" } }, (i + 1) + ". " + item))
        )
  );
}

function SearchTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setLoading(true); setSearched(true); setResults([]);
    const searchBooks = ["psa", "pro", "isa", "mat", "mar", "luk", "joh", "act", "rom", "1co", "eph", "php", "heb", "1pe", "rev"];
    const found = [];
    for (const bookId of searchBooks) {
      if (found.length >= 20) break;
      const book = BIBLE_BOOKS.find(b => b.id === bookId);
      if (!book) continue;
      try {
        for (let ch = 1; ch <= book.chapters; ch++) {
          if (found.length >= 20) break;
          const vv = await fetchChapter(bookId, ch);
          (vv || []).filter(v => v.text && v.text.includes(q)).forEach(v => {
            if (found.length < 20) found.push({ bookName: book.name, chapter: ch, verse: v.verse, text: v.text });
          });
        }
      } catch(e) { /* continue */ }
    }
    setResults(found); setLoading(false);
  };

  const highlight = (text, q) => {
    if (!q || !text) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp("(" + escaped + ")", "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase()
        ? React.createElement("mark", { key: i, style: { background: "rgba(212,175,55,0.38)", color: "#fff", borderRadius: "2px", padding: "0 1px" } }, p)
        : p
    );
  };

  return React.createElement("div", { style: S.panel },
    React.createElement("div", { style: { display: "flex", gap: "7px", marginBottom: "8px" } },
      React.createElement("input", { type: "text", value: query, onChange: e => setQuery(e.target.value), onKeyDown: e => e.key === "Enter" && handleSearch(), placeholder: "말씀 검색 (예: 사랑, 기도, 은혜)", style: { ...S.input, flex: 1 } }),
      React.createElement("button", { onClick: handleSearch, style: { ...S.btn, padding: "9px 13px", flexShrink: 0 } }, React.createElement(Search, { size: 14 }))
    ),
    React.createElement("p", { style: { margin: "0 0 10px", fontSize: "10.5px", color: "rgba(255,255,255,0.32)", wordBreak: "keep-all" } }, "시편·잠언·이사야·신약 전서 중심으로 검색합니다"),
    loading && React.createElement("div", { style: { textAlign: "center", padding: "28px 0", color: "rgba(255,255,255,0.35)" } }, React.createElement(Loader, { size: 18 }), React.createElement("p", { style: { margin: "6px 0 0", fontSize: "11.5px" } }, "검색 중...")),
    !loading && searched && results.length === 0 && React.createElement("p", { style: { textAlign: "center", padding: "28px 0", fontSize: "13px", color: "rgba(255,255,255,0.4)" } }, "검색 결과가 없습니다."),
    results.map((r, i) => React.createElement("div", { key: i, style: { padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" } },
      React.createElement("span", { style: { fontSize: "10.5px", fontWeight: 800, color: "#d4af37", display: "block", marginBottom: "3px" } }, r.bookName + " " + r.chapter + ":" + r.verse),
      React.createElement("p", { style: { margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.88)", lineHeight: 1.65, wordBreak: "keep-all" } }, highlight(r.text, query))
    ))
  );
}

const TABS = [
  { key: "bible",    label: "성경",   Icon: BookOpen },
  { key: "hymns",    label: "찬송가", Icon: Music },
  { key: "bulletin", label: "주보",   Icon: FileText },
  { key: "search",   label: "검색",   Icon: Search },
];

export default function LivePlayerTabs({ db }) {
  const [activeTab, setActiveTab] = useState("bible");

  return React.createElement("div", { style: { display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: "#0f0f11" } },
    React.createElement("div", { style: { display: "flex", background: "#161618", borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 } },
      TABS.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return React.createElement("button", { key, onClick: () => setActiveTab(key), style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", padding: "9px 4px", background: "transparent", border: "none", borderBottom: active ? "2px solid #d4af37" : "2px solid transparent", color: active ? "#d4af37" : "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "10px", fontWeight: active ? 800 : 600, transition: "all 0.15s" } },
          React.createElement(Icon, { size: 15 }),
          label
        );
      })
    ),
    React.createElement("div", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" } },
      activeTab === "bible"    && React.createElement(BibleTab, null),
      activeTab === "hymns"    && React.createElement(HymnsTab, null),
      activeTab === "bulletin" && React.createElement(BulletinTab, { db }),
      activeTab === "search"   && React.createElement(SearchTab, null)
    )
  );
}
