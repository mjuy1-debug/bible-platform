import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Megaphone, AlertTriangle, Info, Calendar, Plus, X, Trash2, Send, ChevronDown } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, deleteDoc, doc, limit
} from 'firebase/firestore';

const NOTICE_TYPES = [
  { value: 'general', label: '📢 일반 공지', color: '#4a9eff', bg: 'rgba(74,158,255,0.10)', border: 'rgba(74,158,255,0.35)' },
  { value: 'urgent', label: '🚨 긴급 공지', color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  { value: 'event', label: '🎉 행사 안내', color: '#a855f7', bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.35)' },
  { value: 'pastoral', label: '💌 목사님 말씀', color: 'var(--accent-gold)', bg: 'rgba(212,175,55,0.10)', border: 'rgba(212,175,55,0.35)' },
  { value: 'schedule', label: '📅 일정 변경', color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
];

function typeStyle(value) {
  return NOTICE_TYPES.find(t => t.value === value) || NOTICE_TYPES[0];
}

function timeAgo(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function Announce() {
  const { currentUser, isAdmin, showToast } = useContext(UserContext);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'general' });
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  // Firestore 실시간 구독
  useEffect(() => {
    const q = query(collection(db, 'churchAnnouncements'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.warn('공지 불러오기 오류:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 새 공지 작성 & 전송
  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      if (showToast) showToast('제목과 내용을 모두 입력해주세요.', 'error');
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'churchAnnouncements'), {
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
        author: currentUser.displayName || '관리자',
        authorUid: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      if (showToast) showToast('✅ 교회 전체 공지가 발송되었습니다! 🙏', 'success');
      setForm({ title: '', body: '', type: 'general' });
      setIsComposing(false);
    } catch (e) {
      console.error(e);
      if (showToast) showToast('공지 발송 실패. 다시 시도해주세요.', 'error');
    } finally {
      setSending(false);
    }
  };

  // 공지 삭제 (관리자 전용)
  const handleDelete = async (id) => {
    if (!window.confirm('이 공지를 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'churchAnnouncements', id));
      if (showToast) showToast('공지가 삭제되었습니다.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filter === 'all' ? notices : notices.filter(n => n.type === filter);

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '780px', margin: '0 auto' }}>

      {/* 상단 타이틀 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', margin: 0 }}>
            <Megaphone color="var(--accent-gold)" /> 교회 공지
          </h1>
          <p style={{ fontSize: 'clamp(0.82rem, 2.5vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55, wordBreak: 'keep-all', margin: '6px 0 0' }}>
            벧엘교회 전체 성도에게 전달되는 공지 및 긴급 알림을 확인하세요.
          </p>
        </div>

        {/* 관리자: 공지 작성 버튼 */}
        {isAdmin && (
          <button
            onClick={() => setIsComposing(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '20px',
              background: 'var(--accent-gold)', border: 'none',
              color: '#111', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212,175,55,0.35)', flexShrink: 0
            }}
          >
            <Plus size={16} /> 전체 공지 발송
          </button>
        )}
      </div>

      {/* 필터 칩 */}
      <div style={{ display: 'flex', gap: '7px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
        {[{ value: 'all', label: '전체' }, ...NOTICE_TYPES.map(t => ({ value: t.value, label: t.label }))].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '5px 14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
              background: filter === f.value ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
              color: filter === f.value ? '#111' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 공지 목록 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <Bell size={36} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: '0.7rem' }}>공지를 불러오는 중…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <Megaphone size={40} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
          <p style={{ margin: 0, fontSize: '0.95rem' }}>등록된 공지가 없습니다.</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>관리자가 공지를 등록하면 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence initial={false}>
            {filtered.map((notice) => {
              const ts = typeStyle(notice.type);
              const isExpanded = expanded === notice.id;
              return (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: ts.bg,
                    border: `1px solid ${ts.border}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpanded(isExpanded ? null : notice.id)}
                >
                  {/* 카드 헤더 */}
                  <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '8px',
                          background: ts.border, color: ts.color, letterSpacing: '0.01em'
                        }}>{ts.label}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {notice.author} • {timeAgo(notice.createdAt)}
                        </span>
                      </div>
                      <h3 style={{
                        margin: 0, fontSize: 'clamp(0.95rem, 2.8vw, 1.05rem)',
                        fontWeight: 800, color: 'var(--text-primary)',
                        wordBreak: 'keep-all', lineHeight: 1.4
                      }}>
                        {notice.title}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <ChevronDown
                        size={18}
                        style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                  </div>

                  {/* 카드 본문 (펼치기) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: '0 18px 18px',
                          borderTop: `1px solid ${ts.border}`,
                          paddingTop: '14px'
                        }}>
                          <p style={{
                            margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)',
                            lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'keep-all'
                          }}>
                            {notice.body}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── 공지 작성 모달 (관리자 전용) ─── */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1100,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}
            onClick={() => setIsComposing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                borderRadius: '22px', width: '100%', maxWidth: '540px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)', overflow: 'hidden'
              }}
            >
              {/* 모달 헤더 */}
              <div style={{
                padding: '16px 22px', borderBottom: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Megaphone size={20} color="var(--accent-gold)" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    전체 공지 발송
                  </h3>
                </div>
                <button onClick={() => setIsComposing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                  <X size={22} />
                </button>
              </div>

              {/* 모달 폼 */}
              <div style={{ padding: '22px' }}>
                {/* 공지 유형 선택 */}
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '7px' }}>
                  공지 유형
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '18px' }}>
                  {NOTICE_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      style={{
                        padding: '5px 12px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                        background: form.type === t.value ? t.color : 'rgba(255,255,255,0.06)',
                        color: form.type === t.value ? '#111' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: '0.8rem'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* 제목 */}
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '7px' }}>
                  공지 제목 *
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="예) 주일예배 시간 변경 안내"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px', borderRadius: '12px', marginBottom: '14px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none'
                  }}
                />

                {/* 내용 */}
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '7px' }}>
                  공지 내용 *
                </label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="전 성도에게 전달할 공지 내용을 입력하세요.&#10;예) 다음 주일 오전 11시 예배는 수련회 관계로 오전 10시로 변경됩니다."
                  rows={5}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px', borderRadius: '12px', marginBottom: '20px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontSize: '0.92rem', resize: 'vertical',
                    outline: 'none', lineHeight: 1.6
                  }}
                />

                {/* 안내 */}
                <div style={{
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
                  marginBottom: '18px', display: 'flex', gap: '8px', alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                    이 공지는 <strong style={{ color: 'var(--accent-gold)' }}>앱을 사용하는 모든 성도</strong>의 화면에 즉시 표시됩니다.
                    신중하게 작성해 주세요.
                  </p>
                </div>

                {/* 발송 버튼 */}
                <button
                  onClick={handleSend}
                  disabled={sending}
                  style={{
                    width: '100%', padding: '13px', borderRadius: '16px',
                    background: 'var(--accent-gold)', border: 'none', color: '#111',
                    fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: sending ? 0.7 : 1, transition: 'opacity 0.2s'
                  }}
                >
                  <Send size={17} />
                  {sending ? '발송 중…' : '전체 성도에게 공지 발송 📣'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
