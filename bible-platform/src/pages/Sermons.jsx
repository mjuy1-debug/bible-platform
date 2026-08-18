import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, X, Edit2, Trash2, Download, ExternalLink, Share2, Check, Loader, Video, FileText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SERMONS } from '../data/sermonData';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import { collection, doc, setDoc, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';

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
  const [editSermon, setEditSermon] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '', fileName: '', hasChunks: false, externalLink: '' });
  const [selectedRawBase64, setSelectedRawBase64] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgressText, setSaveProgressText] = useState('');

  // Memory cache for reconstructed chunked PDF Blob URLs
  const [pdfBlobCache, setPdfBlobCache] = useState({});
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Firestore sync ref to avoid race conditions
  const firestoreMapRef = useRef({ sermons: [], bulletins: [] });

  const updateCombinedSermons = useCallback((list, source) => {
    firestoreMapRef.current[source] = list;
    const allFirestore = [...firestoreMapRef.current.sermons, ...firestoreMapRef.current.bulletins];
    
    // Deduplicate by ID
    const firestoreIds = new Set(allFirestore.map(s => String(s.id)));
    const remainingStatic = SERMONS.filter(s => !firestoreIds.has(String(s.id)));

    const combined = [...allFirestore, ...remainingStatic].sort((a, b) => new Date(b.date) - new Date(a.date));
    setSermons(combined);
    setLoading(false);
  }, []);

  // Real-time Firestore sync (multi-collection fallback support)
  useEffect(() => {
    const unsubs = [];
    try {
      // 1. bulletins 컬렉션 (isSermon: true) 구독
      const q1 = query(collection(db, 'bulletins'), orderBy('createdAt', 'desc'));
      const unsub1 = onSnapshot(q1, (snapshot) => {
        const list = snapshot.docs
          .map(doc => ({
            ...doc.data(),
            id: doc.id,
            isFirestore: true,
            collectionName: 'bulletins'
          }))
          .filter(d => d.isSermon === true);
        updateCombinedSermons(list, 'bulletins');
      }, (err) => {
        console.error('bulletins 구독 오류:', err);
      });
      unsubs.push(unsub1);

      // 2. sermons 컬렉션 구독
      const q2 = query(collection(db, 'sermons'), orderBy('date', 'desc'));
      const unsub2 = onSnapshot(q2, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          isFirestore: true,
          collectionName: 'sermons'
        }));
        updateCombinedSermons(list, 'sermons');
      }, (err) => {
        console.warn('sermons 컬렉션 대기 중:', err.message);
      });
      unsubs.push(unsub2);
    } catch (err) {
      console.error('Firestore 연결 실패:', err);
      setLoading(false);
    }
    return () => unsubs.forEach(fn => fn());
  }, [updateCombinedSermons]);

  // Convert Base64 string to Blob URL
  const base64ToBlobUrl = useCallback((base64String) => {
    try {
      const pureBase64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;
      const byteCharacters = atob(pureBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Blob 변환 실패:', e);
      return base64String;
    }
  }, []);

  // Load chunked PDF on demand when opening a sermon modal
  useEffect(() => {
    if (!selectedVideo) return;

    const sermonId = String(selectedVideo.id);

    // If already cached, done
    if (pdfBlobCache[sermonId]) return;

    // Case 1: Has chunked subcollection in Firestore
    if (selectedVideo.hasChunks) {
      setIsLoadingPdf(true);
      const col = selectedVideo.collectionName || 'bulletins';
      
      const fetchChunks = async () => {
        try {
          const chunksQuery = query(collection(db, col, sermonId, 'pdfChunks'), orderBy('index', 'asc'));
          const snap = await getDocs(chunksQuery);
          
          if (!snap.empty) {
            const assembledBase64 = snap.docs.map(d => d.data().data).join('');
            const blobUrl = base64ToBlobUrl(assembledBase64);
            setPdfBlobCache(prev => ({ ...prev, [sermonId]: blobUrl }));
          }
        } catch (err) {
          console.error('대용량 PDF 로드 실패:', err);
        } finally {
          setIsLoadingPdf(false);
        }
      };

      fetchChunks();
    } 
    // Case 2: Inline Base64 Data URL
    else if (selectedVideo.file && selectedVideo.file.startsWith('data:application/pdf')) {
      const blobUrl = base64ToBlobUrl(selectedVideo.file);
      setPdfBlobCache(prev => ({ ...prev, [sermonId]: blobUrl }));
    }
  }, [selectedVideo, pdfBlobCache, base64ToBlobUrl]);

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

  // Get active PDF URL for preview
  const getActivePdfUrl = (sermon) => {
    if (!sermon) return "";
    const sermonId = String(sermon.id);
    
    // Check blob cache first
    if (pdfBlobCache[sermonId]) {
      return pdfBlobCache[sermonId];
    }
    
    if (sermon.file) {
      if (sermon.file.startsWith('http://') || sermon.file.startsWith('https://')) {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(sermon.file)}&embedded=true`;
      }
      if (sermon.file.startsWith('data:application/pdf') || sermon.file.startsWith('blob:')) {
        return sermon.file;
      }
      const relativePath = sermon.file.replace(/^\//, '');
      if (import.meta.env.DEV) {
        return `${import.meta.env.BASE_URL}${relativePath}`;
      }
      const fullUrl = `https://mjuy1-debug.github.io/bible-platform/${relativePath}`;
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    }
    return "";
  };

  // Open PDF in new tab
  const handleOpenPdfNewTab = (sermon) => {
    const sermonId = String(sermon.id);
    const activeUrl = pdfBlobCache[sermonId] || sermon.file;
    if (!activeUrl) return;

    if (activeUrl.startsWith('blob:') || activeUrl.startsWith('http')) {
      window.open(activeUrl, '_blank');
    } else {
      const relativePath = activeUrl.replace(/^\//, '');
      window.open(`https://mjuy1-debug.github.io/bible-platform/${relativePath}`, '_blank');
    }
  };

  // Download PDF directly
  const handleDownloadPdf = (sermon) => {
    const sermonId = String(sermon.id);
    const activeUrl = pdfBlobCache[sermonId] || sermon.file;
    if (!activeUrl) return;

    const cleanTitle = (sermon.title || '설교요약').replace(/[/\\?%*:|"<>]/g, '_');
    
    if (activeUrl.startsWith('blob:') || activeUrl.startsWith('data:application/pdf')) {
      const link = document.createElement('a');
      link.href = activeUrl;
      link.download = `${cleanTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeUrl.startsWith('http')) {
      window.open(activeUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = `${import.meta.env.BASE_URL}${activeUrl.replace(/^\//, '')}`;
      link.download = `${cleanTitle}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // File Select Handler (Supports Large PDFs up to 30MB)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 파일만 첨부할 수 있습니다.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert(`파일 크기가 ${(file.size / (1024 * 1024)).toFixed(1)}MB 입니다. 최대 30MB 이하 파일만 지원됩니다.`);
      return;
    }

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedRawBase64(reader.result);
      setNewEvent(prev => ({
        ...prev,
        fileName: `${file.name} (${fileSizeStr})`
      }));
      if (showToast) showToast(`PDF 파일이 준비되었습니다! (${fileSizeStr}) 📄`);
    };
    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedRawBase64(null);
    setNewEvent(prev => ({ ...prev, file: '', fileName: '', hasChunks: false }));
  };

  // Admin Save Function (Supports Direct & Chunked Subcollection Storage)
  const handleSaveSermon = async (e) => {
    if (e) e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.videoUrl.trim()) {
      alert("제목, 날짜, 유튜브 링크는 필수 입력 항목입니다.");
      return;
    }

    setIsSaving(true);
    setSaveProgressText('클라우드에 저장 준비 중...');

    try {
      let isChunked = false;
      let chunks = [];
      let inlineFile = newEvent.file || '';

      // If user selected a new PDF
      if (selectedRawBase64) {
        const rawStr = selectedRawBase64;
        
        // If file is smaller than 450KB binary (~600K chars base64), store inline
        if (rawStr.length <= 600000) {
          inlineFile = rawStr;
          isChunked = false;
        } else {
          // Chunk into 350,000 chars blocks (~260KB each)
          isChunked = true;
          inlineFile = '';
          const chunkSize = 350000;
          for (let i = 0; i < rawStr.length; i += chunkSize) {
            chunks.push(rawStr.slice(i, i + chunkSize));
          }
        }
      } else if (editSermon && editSermon.hasChunks) {
        isChunked = true;
      }

      const sermonData = {
        title: newEvent.title.trim(),
        date: newEvent.date,
        preacher: newEvent.preacher?.trim() || '김석주 목사님',
        scripture: newEvent.scripture?.trim() || '',
        videoUrl: newEvent.videoUrl.trim(),
        externalLink: newEvent.externalLink?.trim() || '',
        summary: newEvent.summary?.trim() || '',
        file: inlineFile,
        fileName: newEvent.fileName || '',
        hasChunks: isChunked,
        chunkCount: chunks.length || (editSermon?.chunkCount || 0),
        isSermon: true,
        updatedAt: serverTimestamp(),
      };

      let targetDocId = null;
      let targetCollection = 'bulletins';

      if (editSermon) {
        targetDocId = String(editSermon.id);
        targetCollection = editSermon.collectionName || 'bulletins';
        await setDoc(doc(db, targetCollection, targetDocId), sermonData, { merge: true });
        if (showToast) showToast('설교 정보가 수정되었습니다. ✨');
      } else {
        sermonData.createdAt = serverTimestamp();
        sermonData.uploadedBy = currentUser ? currentUser.uid : 'admin';
        
        const docRef = await addDoc(collection(db, 'bulletins'), sermonData);
        targetDocId = docRef.id;
        if (showToast) showToast('새 설교가 클라우드에 등록되었습니다! 🎉');
      }

      // If there are chunks to upload, write them to subcollection in batches
      if (isChunked && chunks.length > 0 && targetDocId) {
        const total = chunks.length;
        const batchLimit = 8;
        
        for (let i = 0; i < total; i += batchLimit) {
          const slice = chunks.slice(i, i + batchLimit);
          const percent = Math.round(((i + slice.length) / total) * 100);
          setSaveProgressText(`대용량 PDF 분할 저장 중 (${percent}%)...`);

          await Promise.all(slice.map((chunkData, idx) => {
            const index = i + idx;
            const chunkDocRef = doc(db, targetCollection, targetDocId, 'pdfChunks', `chunk_${String(index).padStart(4, '0')}`);
            return setDoc(chunkDocRef, { index, data: chunkData });
          }));
        }

        // Cache the full blob locally so it's instantly available without re-downloading
        if (selectedRawBase64) {
          const blobUrl = base64ToBlobUrl(selectedRawBase64);
          setPdfBlobCache(prev => ({ ...prev, [targetDocId]: blobUrl }));
        }
      }

      setNewEvent({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '', fileName: '', hasChunks: false, externalLink: '' });
      setSelectedRawBase64(null);
      setEditSermon(null);
      setShowAddForm(false);
      setSaveProgressText('');
    } catch (err) {
      console.error('설교 저장 실패:', err);
      alert(`저장 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsSaving(false);
      setSaveProgressText('');
    }
  };

  const handleEdit = (sermon, e) => {
    e.stopPropagation();
    setEditSermon(sermon);
    setSelectedRawBase64(null);
    setNewEvent({
      title: sermon.title || '',
      date: sermon.date || new Date().toISOString().slice(0, 10),
      preacher: sermon.preacher || '김석주 목사님',
      scripture: sermon.scripture || '',
      videoUrl: sermon.videoUrl || '',
      summary: sermon.summary || '',
      file: sermon.file || '',
      fileName: sermon.fileName || (sermon.hasChunks || sermon.file ? '첨부된 PDF 파일 있음' : ''),
      hasChunks: !!sermon.hasChunks,
      externalLink: sermon.externalLink || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (sermon, e) => {
    e.stopPropagation();
    if (!window.confirm(`'${sermon.title}' 설교를 삭제하시겠습니까?`)) return;

    try {
      if (sermon.isFirestore) {
        const col = sermon.collectionName || (sermon.isSermon ? 'bulletins' : 'sermons');
        try {
          await deleteDoc(doc(db, col, String(sermon.id)));
        } catch {
          const altCol = col === 'sermons' ? 'bulletins' : 'sermons';
          await deleteDoc(doc(db, altCol, String(sermon.id)));
        }
        if (showToast) showToast('설교가 삭제되었습니다.');
      } else {
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
              setEditSermon(null);
            } else {
              setEditSermon(null);
              setSelectedRawBase64(null);
              setNewEvent({
                title: '',
                date: new Date().toISOString().slice(0, 10),
                preacher: '김석주 목사님',
                scripture: '',
                videoUrl: '',
                summary: '',
                file: '',
                fileName: '',
                hasChunks: false,
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
                  {editSermon ? '설교 수정' : '새 설교 등록 (대용량 PDF 클라우드 저장 지원)'}
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
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={16} /> 설교 요약 PDF 파일 첨부 (최대 30MB 지원)
                    </label>
                    {(newEvent.fileName || selectedRawBase64 || newEvent.file) && (
                      <button type="button" onClick={handleRemoveFile} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <X size={14} /> 첨부 취소
                      </button>
                    )}
                  </div>
                  
                  <input type="file" accept="application/pdf,.pdf" onChange={handleFileSelect} className="input-field" />
                  
                  {newEvent.fileName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', marginTop: '0.2rem', fontWeight: 600 }}>
                      <Check size={16} /> {newEvent.fileName} (첨부 준비 완료)
                    </div>
                  )}
                  
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    * 첨부된 PDF는 클라우드 분할 저장 기술을 통해 대용량(10MB 이상) 파일도 손실 없이 안전하게 영구 보관됩니다.
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
                  {isSaving ? (saveProgressText || '클라우드에 저장 중...') : (editSermon ? '수정 완료' : '등록하기')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sermons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {sermons.map(sermon => {
          const hasPdf = !!(sermon.hasChunks || sermon.file);
          
          return (
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
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {sermon.scripture ? `${sermon.scripture} | ` : ''}{sermon.preacher}
                </p>

                {/* PDF attached badge */}
                {hasPdf && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.72rem', color: 'var(--accent-gold)',
                    background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '6px', padding: '2px 8px', marginBottom: '0.8rem', width: 'fit-content', fontWeight: 600
                  }}>
                    <FileText size={12} /> PDF 요약 첨부됨
                  </span>
                )}
                
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
          );
        })}
        
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

                {/* PDF Viewer Section */}
                {(selectedVideo.hasChunks || selectedVideo.file) && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.35)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={18} /> 설교 요약 및 나눔 자료 (PDF)
                      </span>
                      
                      {!isLoadingPdf && getActivePdfUrl(selectedVideo) && (
                        <button
                          type="button"
                          onClick={() => handleOpenPdfNewTab(selectedVideo)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.4rem 0.9rem', borderRadius: '6px',
                            background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)',
                            fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(212,175,55,0.3)', cursor: 'pointer'
                          }}
                        >
                          <ExternalLink size={13} /> 새 탭에서 열기
                        </button>
                      )}
                    </div>

                    {/* Loading State or PDF Frame */}
                    {isLoadingPdf ? (
                      <div style={{ height: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <Loader size={28} className="animate-spin" color="var(--accent-gold)" />
                        <span style={{ fontSize: '0.88rem', color: 'var(--accent-gold)' }}>대용량 PDF 문서를 불러오는 중입니다...</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ height: '48vh', minHeight: '320px', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                          <iframe src={getActivePdfUrl(selectedVideo)} width="100%" height="100%" style={{ border: 'none' }} title="PDF Viewer" />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(selectedVideo)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.8rem', borderRadius: '8px', background: 'var(--accent-gold)', color: '#1a1a2e',
                            border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.25)'
                          }}
                        >
                          <Download size={18} /> 설교 요약 PDF 다운로드 / 바로 열기
                        </button>
                      </>
                    )}
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
