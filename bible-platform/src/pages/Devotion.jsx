import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import { Download, X, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { getQTQuestions, inferBookIdFromVerse } from '../data/qtQuestions';

const Devotion = () => {
  const { devotions, addDevotion, deleteDevotion } = useContext(UserContext);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('write');
  const [form, setForm] = useState({
    verse: location.state?.verse || '',
    verseText: location.state?.verseText || '',
    feeling: '', apply: '', prayer: ''
  });
  const [selectedDevotion, setSelectedDevotion] = useState(null);
  const [qtQuestions, setQtQuestions] = useState([]);
  const pdfRef = useRef(null);

  // 즉시 QT 질문 생성 (즐겨찾기에서 넘어온 경우)
  useEffect(() => {
    if (location.state?.verse) {
      const bookId = inferBookIdFromVerse(location.state.verse);
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

  const inputStyle = {
    width: '100%', padding: '1rem', borderRadius: '10px',
    border: '1px solid var(--glass-border)', background: 'transparent',
    color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', outline: 'none',
    fontSize: '1rem', resize: 'vertical', transition: 'border-color 0.2s'
  };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem' };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownloadPdf = (devotion) => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxW = pageW - margin * 2;
      let y = margin;

      const checkPage = (needed) => {
        if (y + needed > pageH - margin) { pdf.addPage(); y = margin; }
      };

      // 제목
      pdf.setFontSize(11);
      pdf.setTextColor(180, 150, 80);
      pdf.text('QUIET TIME', pageW / 2, y, { align: 'center' });
      y += 10;

      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text(devotion.verse, pageW / 2, y, { align: 'center' });
      y += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(130, 130, 130);
      pdf.text(formatDate(devotion.createdAt), pageW / 2, y, { align: 'center' });
      y += 6;

      // 구분선
      pdf.setDrawColor(200, 180, 120);
      pdf.line(margin, y, pageW - margin, y);
      y += 10;

      // 말씀 본문
      if (devotion.verseText) {
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        const lines = pdf.splitTextToSize('"' + devotion.verseText + '"', maxW - 10);
        checkPage(lines.length * 5 + 10);
        pdf.text(lines, margin + 5, y);
        y += lines.length * 5 + 10;
      }

      // 섹션 헬퍼
      const addSection = (title, content) => {
        if (!content) return;
        checkPage(20);
        pdf.setFontSize(12);
        pdf.setTextColor(180, 150, 80);
        pdf.text(title, margin, y);
        y += 7;

        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);
        const lines = pdf.splitTextToSize(content, maxW);
        for (let i = 0; i < lines.length; i++) {
          checkPage(6);
          pdf.text(lines[i], margin, y);
          y += 5;
        }
        y += 8;
      };

      addSection('묵상 (느낀 점)', devotion.feeling);
      addSection('삶에 적용하기', devotion.apply);
      addSection('오늘의 기도', devotion.prayer);

      // 푸터
      pdf.setFontSize(8);
      pdf.setTextColor(180, 180, 180);
      pdf.text('Joshua 말씀묵상', pageW / 2, pageH - 10, { align: 'center' });

      pdf.save(`QT묵상_${formatDate(devotion.createdAt)}.pdf`);
    } catch (err) {
      console.error('PDF Generate Error:', err);
      alert('PDF 생성 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="serif-font" style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}>묵상 노트</h2>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
          {['write', 'list'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '30px', border: 'none', cursor: 'pointer',
                background: activeTab === tab ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s' }}>
              {tab === 'write' ? '새 묵상 쓰기' : `나의 묵상 (${devotions.length})`}
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
      ) : (
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
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadPdf(d); }}
                      title="PDF 다운로드"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                      <Download size={13} /> PDF
                    </button>
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
      )}

      {/* QT 세부 보기 및 PDF 다운로드 모달 */}
      <AnimatePresence>
        {selectedDevotion && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setSelectedDevotion(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: '#1a1a1a', padding: '3rem', borderRadius: '20px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: '1px solid rgba(255, 235, 59, 0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedDevotion(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <button
                onClick={() => handleDownloadPdf(selectedDevotion)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-gold)', color: '#111', padding: '0.6rem 1.2rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 600, margin: '0 auto 2rem auto' }}
              >
                <Download size={18} />
                PDF로 다운로드
              </button>

              {/* 캡처될 QT 형식 컨텐츠 */}
              <div ref={pdfRef} style={{ background: '#1a1a1a', padding: '2rem', color: '#eaeaea' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(255, 235, 59, 0.3)', paddingBottom: '2rem' }}>
                  <p style={{ color: 'var(--accent-gold)', fontSize: '1rem', fontWeight: 600, letterSpacing: '2px', marginBottom: '1rem' }}>QUIET TIME</p>
                  <h2 className="serif-font" style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '1rem' }}>{selectedDevotion.verse}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{formatDate(selectedDevotion.createdAt)}</p>
                </div>

                {selectedDevotion.verseText && (
                  <div style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '15px', borderLeft: '4px solid var(--accent-gold)' }}>
                    <p className="serif-font" style={{ fontSize: '1.15rem', lineHeight: 1.8, fontStyle: 'italic', margin: 0 }}>"{selectedDevotion.verseText}"</p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>💭</span> 묵상 (느낀 점)
                    </h4>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedDevotion.feeling}</p>
                  </div>
                  
                  {selectedDevotion.apply && (
                    <div>
                      <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>🌱</span> 삶에 적용하기
                      </h4>
                      <p style={{ fontSize: '1.05rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedDevotion.apply}</p>
                    </div>
                  )}

                  {selectedDevotion.prayer && (
                    <div>
                      <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>🙏</span> 오늘의 기도
                      </h4>
                      <p style={{ fontSize: '1.05rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedDevotion.prayer}</p>
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                  <p>Joshua 말씀묵상</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Devotion;
