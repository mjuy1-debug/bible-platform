import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, X, Edit2, Trash2, Download, ExternalLink, Share2, Check, Loader, Video, FileText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SERMONS } from '../data/sermonData';
import { UserContext } from '../context/UserContext';
import { db, storage } from '../services/firebase';
import { collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Sermons() {
  const { currentUser, showToast } = useContext(UserContext);
  const isAdmin = import.meta.env.DEV || (currentUser && (
    currentUser.email?.includes('admin') ||
    currentUser.displayName?.includes('관리자') ||
    currentUser.displayName?.includes('유정파파')
  ));

  const [sermons, setSermons] = useState([...SERMONS].sort((a, b) => new Date(b.date) - new Date(a.date)));
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [linkViewerUrl, setLinkViewerUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null); // share badge feedback
  const [searchParams] = useSearchParams();
  
  // Admin states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '', fileName: '', externalLink: '' });
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Real-time Firestore sync + merge with static SERMONS
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'sermons'), orderBy('date', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreSermons = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          isFirestore: true
        }));

        // Merge firestore with static sermons (deduping by ID)
        const firestoreIds = new Set(firestoreSermons.map(s => String(s.id)));
        const remainingStatic = SERMONS.filter(s => !firestoreIds.has(String(s.id)));

        const combined = [...firestoreSermons, ...remainingStatic].sort((a, b) => new Date(b.date) - new Date(a.date));
        setSermons(combined);
        setLoading(false);
      }, (err) => {
        console.error('설교 목록 Firestore 구독 오류:', err);
        setLoading(false);
      });
    } catch (err) {
      console.error('Firestore 연결 실패:', err);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  // Auto-open sermon when arriving via a shared link (?id=xxxxx)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id && sermons.length > 0) {
      const found = sermons.find(s => String(s.id) === String(id));
      if (found) setSelectedVideo(found);
    }
  }, [searchParams, sermons]);

  // Copy shareable deep-link to clipboard
  const handleShare = async (sermon, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}#/sermon?id=${sermon.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error('Clipboard API fallback');
      }
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedId(sermon.id);
    if (showToast) showToast('설교 링크가 복사되었습니다! 🔗');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract YouTube ID
  const extractId = (url) => {
    if (!url) return "";
    const r = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const m = url.match(r);
    return (m && m[2].length === 11) ? m[2] : "";
  };

  const getEmbedUrl = (url) => {
    const id = extractId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : "";
  };

  const getThumbnail = (url) => {
    const id = extractId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=600&auto=format&fit=crop&q=80';
  };

  const getPdfViewerUrl = (pdfPath) => {
    if (!pdfPath) return "";
    if (pdfPath.startsWith('data:application/pdf') || pdfPath.startsWith('blob:')) {
      return pdfPath;
    }
    if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfPath)}&embedded=true`;
    }
    const relativePath = pdfPath.replace(/^\//, '');
    if (import.meta.env.DEV) {
      return `${import.meta.env.BASE_URL}${relativePath}`;
    }
    const fullUrl = `https://mjuy1-debug.github.io/bible-platform/${relativePath}`;
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  };

  // File select handler (instant, non-blocking)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 파일만 첨부할 수 있습니다.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('파일 크기는 최대 25MB 이하만 가능합니다.');
      return;
    }

    setSelectedFileObj(file);
    setNewEvent(prev => ({
      ...prev,
      fileName: `${file.name} (${(file.size / 1024).toFixed(0)} KB)`
    }));
  };

  const handleRemoveFile = () => {
    setSelectedFileObj(null);
    setNewEvent(prev => ({ ...prev, file: '', fileName: '' }));
  };

  // Admin save function (Cloud Firestore with robust Storage/Base64 fallback)
  const handleSaveSermon = async (e) => {
    if (e) e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.videoUrl.trim()) {
      alert("제목, 날짜, 유튜브 링크는 필수 입력 항목입니다.");
      return;
    }

    setIsSaving(true);
    let uploadedFileUrl = newEvent.file || '';

    // Handle PDF upload if user selected a new file
    if (selectedFileObj) {
      try {
        const safeName = `sermon_${Date.now()}_${selectedFileObj.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const storageRef = ref(storage, `sermons/${safeName}`);

        // Try Firebase Storage with 6-second timeout
        const uploadPromise = uploadBytes(storageRef, selectedFileObj).then(async (snap) => {
          return await getDownloadURL(snap.ref);
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Storage Timeout')), 6000)
        );

        uploadedFileUrl = await Promise.race([uploadPromise, timeoutPromise]);
      } catch (uploadErr) {
        console.warn('Firebase Storage 업로드 지연/실패, Base64 fallback 시도:', uploadErr);

        // Fallback: If file <= 800KB, store as Base64 Data URL
        if (selectedFileObj.size <= 800 * 1024) {
          try {
            uploadedFileUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(selectedFileObj);
            });
          } catch (readErr) {
            console.error('Base64 읽기 오류:', readErr);
          }
        } else {
          console.warn('대용량 PDF는 스토리지 연결 설정 후 재시도할 수 있습니다.');
        }
      }
    }

    try {
      const sermonData = {
        title: newEvent.title.trim(),
        date: newEvent.date,
        preacher: newEvent.preacher?.trim() || '담임목사',
        scripture: newEvent.scripture?.trim() || '',
        videoUrl: newEvent.videoUrl.trim(),
        externalLink: newEvent.externalLink?.trim() || '',
        summary: newEvent.summary?.trim() || '',
        file: uploadedFileUrl,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
        // 기존 설교 수정
        await setDoc(doc(db, 'sermons', String(editId)), sermonData, { merge: true });
        if (showToast) showToast('설교가 성공적으로 수정되었습니다. ✨');
      } else {
        // 새 설교 등록
        sermonData.createdAt = serverTimestamp();
        sermonData.uploadedBy = currentUser ? currentUser.uid : 'admin';
        await addDoc(collection(db, 'sermons'), sermonData);
        if (showToast) showToast('새 설교가 클라우드에 등록되었습니다! 🎉');
      }

      setNewEvent({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '', fileName: '', externalLink: '' });
      setSelectedFileObj(null);
      setEditId(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('설교 저장 실패:', err);
      alert(`저장 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (sermon, e) => {
    e.stopPropagation();
    setEditId(sermon.id);
    setSelectedFileObj(null);
    setNewEvent({
      title: sermon.title || '',
      date: sermon.date || new Date().toISOString().slice(0, 10),
      preacher: sermon.preacher || '',
      scripture: sermon.scripture || '',
      videoUrl: sermon.videoUrl || '',
      summary: sermon.summary || '',
      file: sermon.file || '',
      fileName: sermon.file ? '첨부된 PDF 파일 있음' : '',
      externalLink: sermon.externalLink || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (sermon, e) => {
    e.stopPropagation();
    if (!window.confirm(`'${sermon.title}' 설교를 삭제하시겠습니까?`)) return;

    try {
      if (sermon.isFirestore) {
        await deleteDoc(doc(db, 'sermons', String(sermon.id)));
        if (showToast) showToast('설교가 삭제되었습니다.');
      } else {
        // 기본 정적 설교인 경우 로컬 목록에서 제거
        setSermons(prev => prev.filter(s => s.id !== sermon.id));
        if (showToast) showToast('설교가 목록에서 제거되었습니다.');
      }
    } catch (err) {
      console.error('설교 삭제 실패:', err);
      alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  return (
    <div className="fade-in pb-20">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h2 className="serif-font" style={{ fontSize: '1.8rem', color: 'var(--accent-gold)' }}>말씀과 설교</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>벧엘교회 주일 설교와 특별 집회 말씀</p>
        </div>
        
        {isAdmin && (
          <button onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditId(null);
              setSelectedFileObj(null);
            } else {
              setEditId(null);
              setSelectedFileObj(null);
              setNewEvent({
                title: '',
                date: new Date().toISOString().slice(0, 10),
                preacher: '김석주 목사님',
                scripture: '',
                videoUrl: '',
                summary: '',
                file: '',
                fileName: '',
                externalLink: ''
              });
              setShowAddForm(true);
            }
          }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.2rem', borderRadius: '30px',
              background: showAddForm ? 'var(--glass-bg)' : 'var(--accent-gold)',
              color: showAddForm ? 'var(--text-secondary)' : '#1a1a2e',
              fontSize: '0.9rem', fontWeight: 700, border: showAddForm ? '1px solid var(--glass-border)' : 'none', cursor: 'pointer',
              boxShadow: showAddForm ? 'none' : '0 4px 14px rgba(212,175,55,0.3)',
              transition: 'all 0.2s'
            }}>
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? '닫기' : '새 설교 등록'}
          </button>
        )}
      </div>

      {/* Admin Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '2rem' }}>
            <form onSubmit={handleSaveSermon} className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--accent-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={18} />
                  {editId ? '설교 수정' : '새 설교 등록 (클라우드 실시간 동기화)'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>* 제목, 날짜, 유튜브 링크 필수</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>설교 제목 *</label>
                  <input type="text" placeholder="설교 제목을 입력하세요 (예: 하나님의 관심)" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="input-field" style={{ width: '100%' }} required />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>설교 일자 *</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="input-field" style={{ width: '100%' }} required />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>설교자</label>
                  <input type="text" placeholder="예: 김석주 목사님" value={newEvent.preacher} onChange={e => setNewEvent({...newEvent, preacher: e.target.value})} className="input-field" style={{ width: '100%' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>본문 구절</label>
                  <input type="text" placeholder="예: 요한삼서 1:2-4" value={newEvent.scripture} onChange={e => setNewEvent({...newEvent, scripture: e.target.value})} className="input-field" style={{ width: '100%' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>유튜브 영상 링크 *</label>
                  <input type="text" placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..." value={newEvent.videoUrl} onChange={e => setNewEvent({...newEvent, videoUrl: e.target.value})} className="input-field" style={{ width: '100%' }} required />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>외부 관련 링크 (선택)</label>
                  <input type="text" placeholder="https://..." value={newEvent.externalLink || ''} onChange={e => setNewEvent({...newEvent, externalLink: e.target.value})} className="input-field" style={{ width: '100%' }} />
                </div>
                
                {/* PDF Upload Section */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={15} /> 설교 요약 PDF 파일 첨부 (선택)
                    </label>
                    {(selectedFileObj || newEvent.file) && (
                      <button type="button" onClick={handleRemoveFile} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <X size={13} /> 파일 첨부 취소
                      </button>
                    )}
                  </div>
                  
                  <input type="file" accept="application/pdf,.pdf" onChange={handleFileSelect} className="input-field" />
                  
                  {(newEvent.fileName || selectedFileObj) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                      <Check size={14} /> {newEvent.fileName || selectedFileObj?.name}
                    </div>
                  )}
                  
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    * PDF 파일을 선택한 후 아래 [등록하기] 버튼을 누르면 설교와 함께 안전하게 저장됩니다.
                  </p>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>설교 요약 및 나눔 질문</label>
                  <textarea placeholder="설교 핵심 요약이나 묵상 질문을 자유롭게 입력하세요." value={newEvent.summary} onChange={e => setNewEvent({...newEvent, summary: e.target.value})} className="input-field" style={{ width: '100%', minHeight: '120px', resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  취소
                </button>
                <button type="submit" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.6rem', borderRadius: '8px', border: 'none', background: 'var(--accent-gold)', color: '#1a1a2e', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.8 : 1 }}>
                  {isSaving ? <Loader size={16} className="animate-spin" /> : null}
                  {isSaving ? '클라우드에 저장 중...' : (editId ? '수정 완료' : '등록하기')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sermons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {sermons.map(sermon => (
          <div key={sermon.id} className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => setSelectedVideo(sermon)}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              <img src={getThumbnail(sermon.videoUrl)} alt={sermon.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '48px', height: '48px', background: 'rgba(0,0,0,0.65)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', backdropFilter: 'blur(2px)' }}>
                <Play fill="currentColor" size={20} style={{ marginLeft: '4px' }} />
              </div>
            </div>
            
            {/* Info */}
            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '0.3rem' }}>{sermon.date}</span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>{sermon.title}</h3>

                {/* ── Share Badge ─────────────────────────── */}
                <button
                  onClick={(e) => handleShare(sermon, e)}
                  title="공유 링크 복사"
                  style={{
                    flexShrink: 0,
                    background: copiedId === sermon.id ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.12)',
                    border: `1px solid ${copiedId === sermon.id ? 'rgba(16,185,129,0.5)' : 'rgba(212,175,55,0.35)'}`,
                    borderRadius: '6px',
                    color: copiedId === sermon.id ? '#10b981' : 'var(--accent-gold)',
                    cursor: 'pointer',
                    padding: '4px 7px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    transition: 'all 0.25s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedId === sermon.id
                    ? <><Check size={12} /> 복사됨!</>
                    : <><Share2 size={12} /> 공유</>}
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {sermon.scripture ? `${sermon.scripture} | ` : ''}{sermon.preacher}
              </p>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={(e) => handleEdit(sermon, e)} title="수정" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} /></button>
                    <button onClick={(e) => handleDelete(sermon, e)} title="삭제" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {sermons.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            등록된 설교가 없습니다.
          </div>
        )}
      </div>

      {/* Combined Video & Summary Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setSelectedVideo(null)}>
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
              onClick={e => e.stopPropagation()}>
              
              {/* Header / Close button */}
              <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'rgba(0,0,0,0.6)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                <X size={20} />
              </button>

              {/* Video Player */}
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', flexShrink: 0 }}>
                <iframe width="100%" height="100%" src={getEmbedUrl(selectedVideo.videoUrl)} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={selectedVideo.title}></iframe>
              </div>
              
              {/* Sermon Details */}
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, color: 'var(--text-primary)' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-gold)' }}>{selectedVideo.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{selectedVideo.date} | {selectedVideo.scripture} | {selectedVideo.preacher}</p>
                
                {selectedVideo.externalLink && (
                  <a href={selectedVideo.externalLink.startsWith('http') ? selectedVideo.externalLink : `https://${selectedVideo.externalLink}`} target="_blank" rel="noopener noreferrer" 
                     style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600, border: '1px solid rgba(212,175,55,0.3)' }}>
                    <ExternalLink size={16} /> 관련 링크 열기
                  </a>
                )}
                
                {selectedVideo.summary && (
                  <div style={{ marginBottom: '2rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    {selectedVideo.summary}
                  </div>
                )}

                {selectedVideo.file && (
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: '55vh', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                      <iframe src={getPdfViewerUrl(selectedVideo.file)} width="100%" height="100%" style={{ border: 'none' }} title="PDF Viewer" />
                    </div>
                    <a href={selectedVideo.file.startsWith('http') || selectedVideo.file.startsWith('data:') ? selectedVideo.file : `${import.meta.env.BASE_URL}${selectedVideo.file.replace(/^\//, '')}`} download="sermon.pdf" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', borderRadius: '8px', background: 'var(--accent-gold)', color: '#1a1a2e', textDecoration: 'none', fontWeight: 700 }}>
                      <Download size={18} /> 설교 요약 PDF 다운로드
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── In-App Link Viewer Modal ─────────────────────────── */}
      <AnimatePresence>
        {linkViewerUrl && (
          <motion.div
            key="link-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.7rem 1rem',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--glass-border)',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setLinkViewerUrl(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)',
                  borderRadius: '8px', color: 'var(--text-primary)',
                  padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                }}
              >
                <X size={16} /> 닫기
              </button>
              <span style={{
                flex: 1, fontSize: '0.9rem', fontWeight: 700,
                color: 'var(--accent-gold)', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {linkViewerUrl.title}
              </span>
              {/* Open in new tab fallback */}
              <a
                href={linkViewerUrl.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: 'transparent', border: 'none',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  fontSize: '0.8rem', cursor: 'pointer', padding: '0.4rem',
                }}
              >
                <ExternalLink size={14} /> 새 탭
              </a>
            </div>

            {/* iframe Viewer */}
            <iframe
              src={linkViewerUrl.url}
              title={linkViewerUrl.title}
              style={{ flex: 1, border: 'none', width: '100%', background: '#fff' }}
              allow="fullscreen"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
