import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import { Download, X, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getQTQuestions, inferBookIdFromVerse } from '../data/qtQuestions';
import { db } from '../services/firebase';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, deleteDoc
} from 'firebase/firestore';

const Devotion = () => {
  const { devotions, addDevotion, deleteDevotion, shareDevotion, currentUser, deleteSharedDevotion } = useContext(UserContext);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('write');
  const [form, setForm] = useState({
    verse: location.state?.verse || '',
    verseText: location.state?.verseText || '',
    feeling: '', apply: '', prayer: ''
  });
  const [selectedDevotion, setSelectedDevotion] = useState(null);
  const [qtQuestions, setQtQuestions] = useState([]);
  const [sharedDevotions, setSharedDevotions] = useState([]);

  // 댓글 관련 상태
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const pdfRef = useRef(null);

  // 파이어베이스 나눔터 실시간 동기화
  useEffect(() => {
    const q = query(collection(db, 'sharedDevotions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Firestore 문서 ID가 항상 유지되도록 spread 순서 수정
      const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setSharedDevotions(docs);
    });
    return () => unsubscribe();
  }, []);

  // 선택된 나눔터 묵상의 댓글 실시간 동기화 (orderBy 없이 → 클라이언트 정렬)
  useEffect(() => {
    if (!selectedDevotion || activeTab !== 'shared') {
      setComments([]);
      return;
    }
    const devotionFirestoreId = String(selectedDevotion.id);
    let unsubscribe = () => {};
    try {
      const q = collection(db, 'sharedDevotions', devotionFirestoreId, 'comments');
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
          // 클라이언트에서 시간순 정렬
          loaded.sort((a, b) => {
            const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return ta - tb;
          });
          setComments(loaded);
        },
        (err) => console.error('댓글 로딩 오류:', err)
      );
    } catch (err) {
      console.error('댓글 구독 설정 오류:', err);
    }
    return () => unsubscribe();
  }, [selectedDevotion, activeTab]);

  // 즉시 QT 질문 생성 (즐겨찾기에서 넘어온 경우)
  useEffect(() => {
    if (location.state?.verse) {
      const bookId = inferBookIdFromVerse(location.state.verse);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQtQuestions(getQTQuestions(bookId));
    }
  }, [location.state]);

  // 성경구절 입력 완료 시 QT 질문 자동 생성
  const handleVerseBlur = useCallback(() => {
    if (!form.verse.trim()) { setQtQuestions([]); return; }
    const bookId = inferBookIdFromVerse(form.verse);
    setQtQuestions(getQTQuestions(bookId));
  }, [form.verse]);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    if (!form.verse.trim()) return;
    addDevotion(form);
    setForm({ verse: '', verseText: '', feeling: '', apply: '', prayer: '' });
    setActiveTab('list');
  };

  // 댓글 추가
  const handleAddComment = async () => {
    if (!currentUser) { alert('댓글을 작성하려면 로그인이 필요합니다.'); return; }
    if (!commentText.trim() || !selectedDevotion) return;
    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'sharedDevotions', selectedDevotion.id, 'comments'), {
        text: commentText.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || '익명',
        userPhoto: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
      });
      setCommentText('');
    } catch (err) {
      console.error('댓글 작성 실패:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // 댓글 삭제 (본인 댓글만)
  const handleDeleteComment = async (commentId) => {
    if (!selectedDevotion) return;
    try {
      await deleteDoc(doc(db, 'sharedDevotions', selectedDevotion.id, 'comments', commentId));
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
    }
  };

  const inputStyle = {
    width: '100%', padding: '1rem', borderRadius: '10px',
    border: '1px solid var(--glass-border)', background: 'transparent',
    color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', outline: 'none',
    fontSize: '1rem', resize: 'vertical', transition: 'border-color 0.2s'
  };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem' };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatDatetime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadPdf = async (devotion) => {
    if (!pdfRef.current) return;
    try {
      const element = pdfRef.current;
      const originalBackground = element.style.background;
      element.style.background = '#1a1a1a';
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#1a1a1a' });
      element.style.background = originalBackground;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`QT묵상_${formatDate(devotion.createdAt)}.pdf`);
    } catch (err) {
      console.error('PDF Generate Error:', err);
      alert('PDF 생성 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // 선택된 묵상이 있을 경우 전체화면 읽기 모드
  if (selectedDevotion) {
    const isSharedTab = activeTab === 'shared';
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* 상단 버튼 바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => setSelectedDevotion(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
          >
            <X size={20} /> 목록으로
          </button>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => handleDownloadPdf(selectedDevotion)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <Download size={16} /> PDF 저장
            </button>
            {activeTab === 'list' && (
              selectedDevotion.isShared ? (
                <button disabled style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid var(--accent-gold)', fontSize: '0.85rem', cursor: 'default' }}>
                  공유 완료됨
                </button>
              ) : (
                <button
                  onClick={() => {
                    shareDevotion(selectedDevotion);
                    setSelectedDevotion({ ...selectedDevotion, isShared: true });
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-gold)', color: '#111', padding: '0.5rem 1rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  나눔터에 공유 🌐
                </button>
              )
            )}
          </div>
        </div>

        {/* 묵상 본문 */}
        <div ref={pdfRef} className="glass-card" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255, 235, 59, 0.2)', paddingBottom: '1.5rem' }}>
            <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '2px', marginBottom: '0.8rem' }}>QUIET TIME</p>
            <h2 className="serif-font" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', color: 'var(--text-primary)', marginBottom: '0.8rem' }}>{selectedDevotion.verse}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {selectedDevotion.createdAt ? (selectedDevotion.createdAt.toDate ? formatDate(selectedDevotion.createdAt.toDate().toISOString()) : formatDate(selectedDevotion.createdAt)) : ''}
              {selectedDevotion.userName && ` · ${selectedDevotion.userName}`}
            </p>
          </div>

          {selectedDevotion.verseText && (
            <div style={{ marginBottom: '2.5rem', background: 'rgba(212,175,55,0.05)', padding: 'clamp(1.2rem, 4vw, 2rem)', borderRadius: '15px', borderLeft: '4px solid var(--accent-gold)' }}>
              <p className="serif-font" style={{ fontSize: 'clamp(1rem, 3vw, 1.15rem)', lineHeight: 1.8, fontStyle: 'italic', margin: 0, color: 'var(--text-primary)' }}>"{selectedDevotion.verseText}"</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>💭</span> 묵상 (느낀 점)
              </h4>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{selectedDevotion.feeling}</p>
            </div>
            {selectedDevotion.apply && (
              <div>
                <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>✨</span> 적용
                </h4>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{selectedDevotion.apply}</p>
              </div>
            )}
            {selectedDevotion.prayer && (
              <div>
                <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🙏</span> 기도
                </h4>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{selectedDevotion.prayer}</p>
              </div>
            )}
          </div>
        </div>

        {/* 댓글 섹션 - 나눔터 묵상일 때만 표시 */}
        {isSharedTab && (
          <div className="glass-card" style={{ padding: 'clamp(1.2rem, 4vw, 2rem)' }}>
            <h4 style={{ color: 'var(--accent-gold)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💬 댓글 {comments.length > 0 && <span style={{ background: 'var(--accent-gold)', color: '#111', borderRadius: '20px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>{comments.length}</span>}
            </h4>

            {/* 댓글 목록 */}
            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0', opacity: 0.7 }}>
                첫 번째 댓글을 남겨보세요 🌱
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {comments.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                  >
                    {/* 프로필 아이콘 */}
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {c.userPhoto
                        ? <img src={c.userPhoto} alt={c.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '0.85rem' }}>✨</span>
                      }
                    </div>
                    {/* 댓글 말풍선 */}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.userName}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatDatetime(c.createdAt)}</span>
                          {currentUser && currentUser.uid === c.userId && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0 2px', display: 'flex', alignItems: 'center', fontSize: '0.85rem', lineHeight: 1 }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>{c.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 댓글 입력창 */}
            {currentUser ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {currentUser.photoURL
                    ? <img src={currentUser.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '0.85rem' }}>✨</span>
                  }
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  placeholder="댓글을 입력하세요... (Enter로 전송)"
                  rows={2}
                  style={{ ...inputStyle, fontSize: '0.92rem', flex: 1, resize: 'none', padding: '0.75rem' }}
                />
                  <button
                    onClick={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: commentText.trim() ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', color: commentText.trim() ? '#111' : 'var(--text-secondary)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', cursor: commentText.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s', fontSize: '1.1rem', fontWeight: 700 }}
                  >
                    ↑
                  </button>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                댓글을 작성하려면 <strong>Google 로그인</strong>이 필요합니다.
              </p>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="serif-font" style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}>묵상 노트</h2>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
          {['write', 'list', 'shared'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '30px', border: 'none', cursor: 'pointer',
                background: activeTab === tab ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === tab ? '#111' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s' }}>
              {tab === 'write' ? '새 묵상 쓰기' : tab === 'list' ? `나의 묵상 (${devotions.length})` : '나눔터'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'write' ? (
        <motion.div key="write" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>📖 오늘의 말씀 (성경 구절)</label>
            <input type="text" value={form.verse} onChange={handleChange('verse')} onBlur={handleVerseBlur}
              style={{ ...inputStyle, resize: 'none' }}
              placeholder="예: 시편 23:1, 요한복음 3:16" />
          </div>

          {/* QT 질문 카드 */}
          <AnimatePresence>
            {qtQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '1.2rem 1.4rem' }}
              >
                <p style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={14} /> 오늘의 QT 묵상 질문
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(클릭하면 아래 칸에 자동 입력됩니다)</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {qtQuestions.map((q, i) => (
                    <button key={i}
                      onClick={() => setForm(prev => ({ ...prev, feeling: prev.feeling ? prev.feeling + '\n\nQ. ' + q + '\n' : 'Q. ' + q + '\n' }))}
                      style={{ textAlign: 'left', background: 'transparent', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '0.6rem 0.9rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.5, transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(212,175,55,0.12)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 700, marginRight: '0.4rem' }}>Q{i + 1}.</span>{q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label style={labelStyle}>말씀 본문 (선택)</label>
            <textarea rows={3} value={form.verseText} onChange={handleChange('verseText')} style={inputStyle}
              placeholder="말씀 본문을 직접 입력하세요..." />
          </div>
          <div>
            <label style={labelStyle}>💭 느낀 점</label>
            <textarea rows={4} value={form.feeling} onChange={handleChange('feeling')} style={inputStyle}
              placeholder="이 말씀을 읽고 마음에 와닿은 것을 자유롭게 적어보세요..." />
          </div>
          <div>
            <label style={labelStyle}>🌱 삶에 적용</label>
            <textarea rows={3} value={form.apply} onChange={handleChange('apply')} style={inputStyle}
              placeholder="이 말씀을 내 생활에 어떻게 적용할 수 있을지 구체적으로 생각해 보세요..." />
          </div>
          <div>
            <label style={labelStyle}>🙏 오늘의 기도</label>
            <textarea rows={3} value={form.prayer} onChange={handleChange('prayer')} style={inputStyle}
              placeholder="주님께 드리는 오늘의 기도를 적어보세요..." />
          </div>
          <button onClick={handleSave}
            style={{ background: 'var(--accent-gold)', color: '#fff', padding: '1rem 3rem', borderRadius: '30px', border: 'none',
              alignSelf: 'flex-end', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseOver={e => e.target.style.opacity = 0.85} onMouseOut={e => e.target.style.opacity = 1}>
            묵상 저장하기 ✨
          </button>
        </motion.div>
      ) : activeTab === 'list' ? (
        <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {devotions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>아직 작성된 묵상이 없습니다.</p>
              <button onClick={() => setActiveTab('write')}
                style={{ background: 'var(--accent-gold)', color: '#fff', padding: '0.8rem 2rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                첫 묵상 작성하기 →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {devotions.map((d) => (
                <motion.div key={d.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card" style={{ position: 'relative', padding: '1.5rem', cursor: 'pointer' }}
                  onClick={() => setSelectedDevotion(d)}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button onClick={(e) => { e.stopPropagation(); deleteDevotion(d.id); }}
                      style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '0.5rem' }}>{formatDate(d.createdAt)}</p>
                  <h3 className="serif-font" style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>{d.verse}</h3>
                  {d.feeling && <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.feeling}</p>}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.8rem' }}>클릭하면 전체 보기 →</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div key="shared" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {sharedDevotions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={40} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '1rem', margin: '0 auto' }} />
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>아직 나누어진 묵상이 없습니다.</p>
              <p style={{ fontSize: '0.9rem' }}>첫 번째로 묵상을 나누어보세요!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {sharedDevotions.map((d) => (
                <motion.div key={d.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card" style={{ position: 'relative', padding: '1.5rem', cursor: 'pointer', borderTop: '3px solid var(--accent-gold)' }}
                  onClick={() => setSelectedDevotion(d)}>

                  {currentUser && currentUser.uid === d.userId && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                      <button onClick={(e) => { e.stopPropagation(); deleteSharedDevotion(d.id); }}
                        style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>
                        ×
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', paddingRight: '2rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {d.userPhoto ? <img src={d.userPhoto} alt={d.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem' }}>✨</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.userName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                        {d.createdAt ? (d.createdAt.toDate ? formatDate(d.createdAt.toDate().toISOString()) : formatDate(d.createdAt)) : ''}
                      </p>
                    </div>
                  </div>
                  <h3 className="serif-font" style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>{d.verse}</h3>
                  {d.feeling && <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.feeling}</p>}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.8rem' }}>클릭하면 전체 보기 →</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Devotion;
