import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, X, Edit2, Trash2, Download, ExternalLink, Share2, Check, Loader, Video, FileText, Save, Bookmark, Sparkles, Key, ChevronDown, ChevronUp, CheckCircle, RefreshCw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SERMONS } from '../data/sermonData';
import { UserContext } from '../context/UserContext';
import { db, storage } from '../services/firebase';
import { collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { generateSermonQuiz, getGeminiApiKey, saveGeminiApiKey } from '../services/aiQuizService';
import SermonNotesPanel from '../components/SermonNotesPanel';
import YouTubeSyncPlayer from '../components/YouTubeSyncPlayer';

export default function Sermons() {
  const { currentUser, isAdmin: contextIsAdmin, showToast } = useContext(UserContext);
  const isAdmin = import.meta.env.DEV || contextIsAdmin;
  const navigate = useNavigate();

  const [sermons, setSermons] = useState([...SERMONS].sort((a, b) => new Date(b.date) - new Date(a.date)));
  
  // Modals state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const playerInstanceRef = useRef(null);
  const [linkViewerUrl, setLinkViewerUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null); // share badge feedback
  const [searchParams] = useSearchParams();
  
  // Admin states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editSermon, setEditSermon] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '', fileName: '', externalLink: '' });
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [selectedRawBase64, setSelectedRawBase64] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgressText, setSaveProgressText] = useState('');

  // Deploy button state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState('');

  // AI Quiz states
  const [quizDraft, setQuizDraft] = useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isQuizExpanded, setIsQuizExpanded] = useState(false);
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);

  // Firestore 실시간 설교 목록 동기화 (모바일/PC 어디서나 등록 즉시 반영)
  useEffect(() => {
    const q = query(collection(db, 'sermons'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remoteSermons = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const map = new Map();
      // 1. 정적 기본 설교 데이터 로드
      SERMONS.forEach(s => map.set(String(s.id), s));
      // 2. Firestore 설교 데이터로 병합 및 덮어쓰기
      remoteSermons.forEach(s => map.set(String(s.id), { ...map.get(String(s.id)), ...s }));
      const mergedList = Array.from(map.values());
      mergedList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSermons(mergedList);
    }, (err) => {
      console.warn('설교 Firestore 실시간 동기화 오류 (정적 데이터 사용):', err);
    });

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
    // 정적 share 페이지 URL → KakaoTalk이 OG 이미지(유튜브 썸네일)를 올바르게 표시
    // public/share/{id}/index.html 에 각 설교별 OG 태그가 이미 생성되어 있음
    const shareUrl = `https://mjuy1-debug.github.io/bible-platform/share/${sermon.id}/`;
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

  const getEmbedUrl = (url, start = 0) => {
    const id = extractId(url);
    const startParam = start > 0 ? `&start=${Math.floor(start)}` : '';
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1${startParam}` : "";
  };

  const getThumbnail = (url) => {
    const id = extractId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=600&auto=format&fit=crop&q=80';
  };

  // Get active PDF URL for preview
  const getActivePdfUrl = (sermon) => {
    if (!sermon || !sermon.file) return "";
    
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
  };

  // Open PDF in new tab
  const handleOpenPdfNewTab = (sermon) => {
    if (!sermon || !sermon.file) return;
    const fileUrl = sermon.file;

    if (fileUrl.startsWith('blob:') || fileUrl.startsWith('http') || fileUrl.startsWith('data:')) {
      window.open(fileUrl, '_blank');
    } else {
      const relativePath = fileUrl.replace(/^\//, '');
      if (import.meta.env.DEV) {
        window.open(`${import.meta.env.BASE_URL}${relativePath}`, '_blank');
      } else {
        window.open(`https://mjuy1-debug.github.io/bible-platform/${relativePath}`, '_blank');
      }
    }
  };

  // Download PDF directly
  const handleDownloadPdf = (sermon) => {
    if (!sermon || !sermon.file) return;
    const fileUrl = sermon.file;
    const cleanTitle = (sermon.title || '설교요약').replace(/[/\\?%*:|"<>]/g, '_');
    
    if (fileUrl.startsWith('blob:') || fileUrl.startsWith('data:application/pdf')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${cleanTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (fileUrl.startsWith('http')) {
      window.open(fileUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = `${import.meta.env.BASE_URL}${fileUrl.replace(/^\//, '')}`;
      link.download = `${cleanTitle}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // File Select Handler (원본 File 객체 보관으로 대용량 PDF 업로드 최적화)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 파일만 첨부할 수 있습니다.');
      return;
    }

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    setSelectedPdfFile(file);
    setNewEvent(prev => ({
      ...prev,
      fileName: `${file.name} (${fileSizeStr})`
    }));
    if (showToast) showToast(`PDF 파일이 준비되었습니다! (${fileSizeStr}) 📄`);
  };

  const handleRemoveFile = () => {
    setSelectedPdfFile(null);
    setSelectedRawBase64(null);
    setNewEvent(prev => ({ ...prev, file: '', fileName: '' }));
  };

  // AI 퀴즈 자동 생성 핸들러
  const handleGenerateAiQuiz = async () => {
    if (!newEvent.title.trim()) {
      alert('설교 제목을 먼저 입력해주세요.');
      return;
    }
    if (!newEvent.scripture.trim()) {
      alert('성경 본문 구절(예: 마태복음 16:13-20)을 먼저 입력해주세요.');
      return;
    }

    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      setApiKeyInput('');
      setShowApiKeyModal(true);
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const generated = await generateSermonQuiz(newEvent, apiKey);
      setQuizDraft(generated);
      setIsQuizExpanded(true);
      setIncludeQuiz(true);
      if (showToast) showToast('✨ 10문항 설교 퀴즈가 성공적으로 생성되었습니다!');
    } catch (err) {
      console.error('AI 퀴즈 생성 오류:', err);
      if (err.message === 'API_KEY_INVALID' || err.message === 'NO_API_KEY') {
        alert('Gemini API 키가 등록되지 않았거나 유효하지 않습니다. 무료 API 키를 등록해주세요.');
        setShowApiKeyModal(true);
      } else {
        alert('퀴즈 생성 중 오류가 발생했습니다: ' + err.message);
      }
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // API 키 저장 핸들러
  const handleSaveApiKey = async (e) => {
    if (e) e.preventDefault();
    if (!apiKeyInput.trim()) {
      alert('API 키를 입력해주세요.');
      return;
    }
    setIsSavingApiKey(true);
    try {
      await saveGeminiApiKey(apiKeyInput.trim());
      setShowApiKeyModal(false);
      if (showToast) showToast('✅ Gemini API 키가 클라우드 및 기기에 저장되었습니다!');
      // 키 저장 완료 후 자동으로 퀴즈 생성 재시도
      setTimeout(() => {
        handleGenerateAiQuiz();
      }, 300);
    } catch (err) {
      alert('API 키 저장 실패: ' + err.message);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  // 퀴즈 문항 수정 헬퍼
  const handleUpdateQuizQuestion = (qIdx, field, val) => {
    if (!quizDraft || !quizDraft.questions) return;
    const updated = [...quizDraft.questions];
    updated[qIdx] = { ...updated[qIdx], [field]: val };
    setQuizDraft({ ...quizDraft, questions: updated });
  };

  const handleUpdateQuizOption = (qIdx, optIdx, val) => {
    if (!quizDraft || !quizDraft.questions) return;
    const updatedQuestions = [...quizDraft.questions];
    const updatedOpts = [...updatedQuestions[qIdx].options];
    updatedOpts[optIdx] = val;
    updatedQuestions[qIdx] = { ...updatedQuestions[qIdx], options: updatedOpts };
    setQuizDraft({ ...quizDraft, questions: updatedQuestions });
  };

  // Admin Save Function (Firebase Firestore + Firebase Storage 실시간 저장)
  const handleSaveSermon = async (e) => {
    if (e) e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.videoUrl.trim()) {
      alert("제목, 날짜, 유튜브 링크는 필수 입력 항목입니다.");
      return;
    }

    setIsSaving(true);
    setSaveProgressText('저장 처리 중...');

    let finalFileUrl = newEvent.file || '';

    // 1. PDF 업로드 (Firebase Storage uploadBytesResumable로 대용량도 실시간 진행률 표시하며 안전 업로드)
    if (selectedPdfFile || selectedRawBase64) {
      const fileToUpload = selectedPdfFile;
      const safeName = `sermon_${Date.now()}_${(fileToUpload?.name || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      try {
        setSaveProgressText('클라우드 저장소(Firebase Storage)에 PDF 업로드 준비 중...');
        const storageRef = ref(storage, `sermons/${safeName}`);

        if (fileToUpload) {
          // 원본 바이너리 File 객체를 스트림으로 직접 업로드 (16MB 등 대용량 파일 완벽 지원)
          await new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
              contentType: 'application/pdf'
            });

            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setSaveProgressText(`클라우드에 PDF 업로드 중... (${progress}%)`);
              },
              (err) => {
                console.error('Firebase Storage 업로드 중 에러:', err);
                reject(err);
              },
              async () => {
                try {
                  finalFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
                  console.log('✅ Firebase Storage PDF 업로드 성공:', finalFileUrl);
                  resolve();
                } catch (urlErr) {
                  reject(urlErr);
                }
              }
            );
          });
        } else if (selectedRawBase64?.data) {
          const uploadTask = uploadBytesResumable(storageRef, await (await fetch(selectedRawBase64.data)).blob(), {
            contentType: 'application/pdf'
          });
          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', null, reject, async () => {
              finalFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            });
          });
        }
      } catch (storageErr) {
        console.error('Firebase Storage 업로드 실패:', storageErr);

        // 로컬 개발 환경(localhost)에서만 로컬 관리자 서버 시도 (3초 타임아웃 걸어 모바일/외부 멈춤 방지)
        const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalHost && selectedRawBase64?.data) {
          try {
            setSaveProgressText('로컬 관리자 서버에 PDF 백업 저장 중...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch('http://localhost:3001/api/admin/upload-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                fileName: safeName,
                fileData: selectedRawBase64.data
              }),
            });
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              if (data.ok) finalFileUrl = data.fileUrl;
            }
          } catch (localErr) {
            console.warn('로컬 서버 업로드 건너뜀:', localErr.message);
          }
        }

        // 클라우드 업로드에 실패한 경우 사용자에게 명확히 알림 및 선택권 제공 (작성한 퀴즈 유실 방지)
        if (!finalFileUrl) {
          const proceed = window.confirm(
            `클라우드 PDF 업로드 중 오류가 발생했습니다 (${storageErr.code || storageErr.message}).\n` +
            `PDF 파일 없이 설교와 출제된 퀴즈 내용만 먼저 저장하시겠습니까?\n(취소 시 현재 입력 및 퀴즈 내용이 그대로 유지됩니다)`
          );
          if (!proceed) {
            setIsSaving(false);
            setSaveProgressText('');
            return;
          }
        }
      }
    }

    const sermonId = editSermon ? editSermon.id : Date.now();

    // 2. 설교 데이터 페이로드
    const sermonPayload = {
      id: sermonId,
      title: newEvent.title.trim(),
      date: newEvent.date,
      preacher: newEvent.preacher?.trim() || '김석주 목사님',
      scripture: newEvent.scripture?.trim() || '',
      videoUrl: newEvent.videoUrl.trim(),
      externalLink: newEvent.externalLink?.trim() || '',
      summary: newEvent.summary?.trim() || '',
      file: finalFileUrl,
      hasQuiz: !!(includeQuiz && quizDraft),
      updatedAt: serverTimestamp(),
    };

    // 3. React 로컬 상태 즉시 갱신
    let updatedList;
    if (editSermon) {
      updatedList = sermons.map(s => s.id === editSermon.id ? { ...s, ...sermonPayload } : s);
    } else {
      updatedList = [sermonPayload, ...sermons];
    }
    updatedList.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSermons(updatedList);

    // 4. Firestore 실시간 클라우드 DB 저장 (어디서든 즉시 반영!)
    try {
      setSaveProgressText('클라우드 DB에 설교 저장 중...');
      await setDoc(doc(db, 'sermons', String(sermonId)), sermonPayload, { merge: true });

      // 퀴즈도 함께 등록할 경우 quizzes 컬렉션에 동시 저장
      if (includeQuiz && quizDraft) {
        setSaveProgressText('클라우드 DB에 10문항 설교 퀴즈 동시 등록 중...');
        const quizPayload = {
          ...quizDraft,
          id: `sermon_${sermonId}`,
          sermonId: sermonId,
          title: sermonPayload.title,
          date: sermonPayload.date,
          range: sermonPayload.scripture,
          bookName: quizDraft.bookName || sermonPayload.scripture?.split(' ')[0] || '성경',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'quizzes', `sermon_${sermonId}`), quizPayload, { merge: true });
      }

      if (showToast) {
        if (includeQuiz && quizDraft) {
          showToast('🎉 설교와 AI 퀴즈 10문항이 클라우드에 성공적으로 등록되었습니다!');
        } else {
          showToast('🎉 설교 말씀이 클라우드에 성공적으로 등록되었습니다!');
        }
      }
    } catch (dbErr) {
      console.error('Firestore 저장 오류:', dbErr);
      alert('클라우드 저장 중 오류가 발생했습니다: ' + dbErr.message);
    }

    setNewEvent({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '', fileName: '', externalLink: '' });
    setSelectedPdfFile(null);
    setSelectedRawBase64(null);
    setEditSermon(null);
    setQuizDraft(null);
    setIsQuizExpanded(false);
    setShowAddForm(false);
    setIsSaving(false);
    setSaveProgressText('');
  };

  // Deploy to GitHub Pages via local server (Like Schedule.jsx)
  const handleDeployToGitHub = async () => {
    if (!window.confirm("현재 화면의 말씀 목록을 영구 저장하고 GitHub에 배포하시겠습니까? (1~2분 소요)")) return;
    setIsDeploying(true);
    setDeployStatus('저장 및 배포 중...');
    
    try {
      const cleanSermons = sermons.map(s => ({
        id: s.id,
        title: s.title || '',
        date: s.date || '',
        preacher: s.preacher || '',
        scripture: s.scripture || '',
        videoUrl: s.videoUrl || '',
        externalLink: s.externalLink || '',
        summary: s.summary || '',
        file: s.file || ''
      }));

      const res = await fetch('http://localhost:3001/api/admin/save-sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermons: cleanSermons,
          commitMessage: `관리자: 말씀 업데이트 (${new Date().toLocaleDateString('ko-KR')})`
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setDeployStatus('✅ 성공적으로 저장 및 배포되었습니다! 1~2분 후 새로고침 해보세요.');
      } else {
        setDeployStatus(`❌ 오류 발생: ${data.error}`);
      }
    } catch (err) {
      setDeployStatus('❌ 관리자 서버에 연결할 수 없습니다. 터미널에서 npm run admin을 실행해주세요.');
    } finally {
      setIsDeploying(false);
      setTimeout(() => setDeployStatus(''), 8000);
    }
  };

  const handleEdit = async (sermon, e) => {
    e.stopPropagation();
    setEditSermon(sermon);
    setSelectedPdfFile(null);
    setSelectedRawBase64(null);
    setQuizDraft(null);
    setIsQuizExpanded(false);
    setNewEvent({
      title: sermon.title || '',
      date: sermon.date || new Date().toISOString().slice(0, 10),
      preacher: sermon.preacher || '김석주 목사님',
      scripture: sermon.scripture || '',
      videoUrl: sermon.videoUrl || '',
      summary: sermon.summary || '',
      file: sermon.file || '',
      fileName: sermon.file ? '첨부된 PDF 파일 있음' : '',
      externalLink: sermon.externalLink || ''
    });

    // 기존 퀴즈가 Firestore에 등록되어 있는지 확인하여 로드
    try {
      const quizSnap = await getDoc(doc(db, 'quizzes', `sermon_${sermon.id}`));
      if (quizSnap.exists()) {
        setQuizDraft(quizSnap.data());
        setIncludeQuiz(true);
      }
    } catch (err) {
      console.warn('기존 퀴즈 조회 건너뜀:', err);
    }

    setShowAddForm(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("정말 이 말씀을 삭제하시겠습니까? (연결된 퀴즈도 함께 삭제됩니다)")) return;

    setSermons(sermons.filter(s => s.id !== id));
    
    // Firestore에서도 실시간 삭제
    try {
      await deleteDoc(doc(db, 'sermons', String(id)));
      await deleteDoc(doc(db, 'quizzes', `sermon_${id}`));
    } catch (delErr) {
      console.warn('Firestore 삭제 오류:', delErr);
    }

    if (showToast) showToast('설교와 퀴즈가 클라우드에서 삭제되었습니다.');
  };

  return (
    <div className="fade-in pb-20">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h2 className="serif-font" style={{ fontSize: 'clamp(1.5rem, 5vw, 1.8rem)', color: 'var(--accent-gold)', margin: 0, lineHeight: 1.2 }}>말씀과 설교</h2>
          <p style={{ fontSize: 'clamp(0.82rem, 2.5vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word', margin: '6px 0 0 0' }}>
            벧엘교회 주일 설교와 특별 집회 말씀
          </p>
        </div>
        
        {isAdmin && (
          <button onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditSermon(null);
            } else {
              setEditSermon(null);
              setSelectedPdfFile(null);
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
                  {editSermon ? '설교 수정' : '새 설교 등록'}
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
                      <FileText size={16} /> 설교 요약 PDF 파일 첨부 (선택)
                    </label>
                    {(newEvent.fileName || selectedPdfFile || selectedRawBase64 || newEvent.file) && (
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
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>설교 요약 및 나눔 질문</label>
                  <textarea placeholder="설교 핵심 요약이나 묵상 질문을 자유롭게 입력하세요. (AI가 이 내용을 분석하여 정밀한 퀴즈를 출제합니다)" value={newEvent.summary} onChange={e => setNewEvent({...newEvent, summary: e.target.value})} className="input-field" style={{ width: '100%', minHeight: '110px', resize: 'vertical' }} />
                </div>

                {/* ── AI 설교 퀴즈 10문항 자동 생성 카드 ── */}
                <div style={{
                  gridColumn: '1 / -1',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(147,51,234,0.08))',
                  border: '1.5px solid rgba(212,175,55,0.35)',
                  borderRadius: '12px',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>🤖</span>
                      <strong style={{ color: 'var(--accent-gold)', fontSize: '0.95rem' }}>설교 퀴즈 자동 생성 (AI 10문항)</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowApiKeyModal(true)}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '20px',
                          color: 'var(--text-secondary)',
                          padding: '0.3rem 0.7rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Key size={12} /> Gemini 키 설정
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerateAiQuiz}
                        disabled={isGeneratingQuiz}
                        style={{
                          background: isGeneratingQuiz ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #d4af37, #9333ea)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '0.45rem 1.1rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: isGeneratingQuiz ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(147,51,234,0.25)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isGeneratingQuiz ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isGeneratingQuiz ? '10문제 출제 분석 중...' : (quizDraft ? '퀴즈 다시 생성' : 'AI 퀴즈 10문제 자동 생성')}
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    위 설교 제목, 본문, 요약문을 AI가 종합 분석하여 성도님들을 위한 <strong>4지선다형 10문제</strong>를 즉시 출제합니다. 스마트폰에서도 3초 만에 생성됩니다.
                  </p>

                  {/* 퀴즈 생성 완료 후 카드 */}
                  {quizDraft && (
                    <div style={{ marginTop: '0.4rem', borderTop: '1px dashed rgba(212,175,55,0.3)', paddingTop: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={includeQuiz}
                            onChange={e => setIncludeQuiz(e.target.checked)}
                            style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                          />
                          <CheckCircle size={15} /> 설교 등록 시 10문항 퀴즈를 퀴즈방에 동시 등록
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsQuizExpanded(!isQuizExpanded)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-gold)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isQuizExpanded ? '문제 목록 접기' : '생성된 10문제 검토 및 수정하기'}
                          {isQuizExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>

                      {/* 10문항 상세 목록 펼치기 */}
                      <AnimatePresence>
                        {isQuizExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden', marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
                          >
                            {quizDraft.questions.map((q, qIdx) => (
                              <div
                                key={qIdx}
                                style={{
                                  background: 'rgba(0,0,0,0.25)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: '8px',
                                  padding: '0.9rem',
                                  fontSize: '0.82rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <span style={{
                                    background: 'var(--accent-gold)',
                                    color: '#1a1a2e',
                                    borderRadius: '50%',
                                    width: '22px',
                                    height: '22px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.75rem'
                                  }}>
                                    {qIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={q.question}
                                    onChange={e => handleUpdateQuizQuestion(qIdx, 'question', e.target.value)}
                                    className="input-field"
                                    style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                                  />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem', marginLeft: '1.8rem', marginBottom: '0.6rem' }}>
                                  {q.options.map((opt, optIdx) => (
                                    <label
                                      key={optIdx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        background: q.correct === optIdx ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)',
                                        border: q.correct === optIdx ? '1px solid #10b981' : '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        padding: '0.3rem 0.5rem',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={`quiz_correct_${qIdx}`}
                                        checked={q.correct === optIdx}
                                        onChange={() => handleUpdateQuizQuestion(qIdx, 'correct', optIdx)}
                                        style={{ accentColor: '#10b981' }}
                                      />
                                      <span style={{ fontSize: '0.72rem', color: q.correct === optIdx ? '#10b981' : 'var(--text-secondary)', fontWeight: q.correct === optIdx ? 700 : 400 }}>
                                        {optIdx + 1}.
                                      </span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={e => handleUpdateQuizOption(qIdx, optIdx, e.target.value)}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: 'var(--text-primary)',
                                          fontSize: '0.78rem',
                                          width: '100%',
                                          outline: 'none'
                                        }}
                                      />
                                    </label>
                                  ))}
                                </div>

                                <div style={{ marginLeft: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <input
                                      type="text"
                                      placeholder="힌트 구절 (예: 마 16:16)"
                                      value={q.hintRef || ''}
                                      onChange={e => handleUpdateQuizQuestion(qIdx, 'hintRef', e.target.value)}
                                      className="input-field"
                                      style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.74rem' }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="해설 입력"
                                      value={q.explanation || ''}
                                      onChange={e => handleUpdateQuizQuestion(qIdx, 'explanation', e.target.value)}
                                      className="input-field"
                                      style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.74rem' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  취소
                </button>
                <button type="submit" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.6rem', borderRadius: '8px', border: 'none', background: 'var(--accent-gold)', color: '#1a1a2e', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.8 : 1 }}>
                  {isSaving ? <Loader size={16} className="animate-spin" /> : null}
                  {isSaving ? (saveProgressText || '저장 중...') : (editSermon ? '수정 완료 (클라우드 반영)' : '등록하기 (클라우드 반영)')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gemini API 키 설정 모달 ── */}
      <AnimatePresence>
        {showApiKeyModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{
                maxWidth: '460px',
                width: '100%',
                padding: '1.6rem',
                border: '1.5px solid var(--accent-gold)',
                background: '#131325'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={18} /> Google Gemini API 키 설정
                </h3>
                <button type="button" onClick={() => setShowApiKeyModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                설교 말씀을 바탕으로 10문항 퀴즈를 자동 생성하기 위해 <strong>Google Gemini API 키</strong>가 필요합니다.
                구글 계정만 있으면 <strong>완전 무료</strong>로 1분 만에 발급받으실 수 있습니다.
              </p>

              <form onSubmit={handleSaveApiKey}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>
                    Gemini API Key (AIzaSy...)
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.2rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                  >
                    👉 Google AI Studio에서 무료 API 키 발급받기 (새 창)
                  </a>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    * 한 번 저장하시면 클라우드 설정에 안전하게 보관되어 다른 기기에서도 자동으로 연동됩니다.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingApiKey}
                    style={{ padding: '0.5rem 1.3rem', borderRadius: '6px', border: 'none', background: 'var(--accent-gold)', color: '#1a1a2e', fontWeight: 700, cursor: isSavingApiKey ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                  >
                    {isSavingApiKey ? '저장 중...' : '저장 및 적용'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sermons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {sermons.map(sermon => {
          const hasPdf = !!sermon.file;
          
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
                
                <div style={{ marginTop: 'auto', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/quiz', { state: { category: '🎤 주일 설교 퀴즈', quizId: `sermon_${sermon.id}` } });
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.08))',
                      border: '1px solid rgba(212,175,55,0.45)',
                      color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.35)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.08))'}
                  >
                    ✍️ 설교 퀴즈 풀기
                  </button>

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                      <button onClick={(e) => handleEdit(sermon, e)} title="수정" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><Edit2 size={16} /></button>
                      <button onClick={(e) => handleDelete(sermon.id, e)} title="삭제" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {sermons.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            등록된 설교가 없습니다.
          </div>
        )}
      </div>

      {/* Admin Deploy Section (Like Schedule.jsx) */}
      {isAdmin && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid var(--accent-gold)', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>👨‍💻 관리자 전용: 말씀 저장 및 GitHub 자동 배포</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.6 }}>
            수정한 말씀 목록과 대용량 PDF를 GitHub에 자동 저장하고 배포합니다.<br/>
          </p>
          <button onClick={handleDeployToGitHub} disabled={isDeploying} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.8rem', borderRadius: '8px', background: 'var(--accent-gold)', color: '#1a1a2e', fontSize: '1rem', fontWeight: 700, border: 'none', cursor: isDeploying ? 'not-allowed' : 'pointer', opacity: isDeploying ? 0.7 : 1 }}>
            <Save size={18} /> {isDeploying ? 'GitHub 배포 중 (1~2분)...' : '변경사항 저장하기 (GitHub 자동 배포)'}
          </button>
          {deployStatus && (
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: deployStatus.includes('오류') || deployStatus.includes('실패') ? '#ef4444' : '#10b981' }}>
              {deployStatus}
            </p>
          )}
        </div>
      )}

      {/* Combined Video & Summary Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              /* 모바일: 여백 없이 꽉 차게 / 데스크톱: 살짝 여백 */
              padding: 'clamp(0px, 2vw, 1rem)',
            }}
            onClick={() => setSelectedVideo(null)}>
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{
                width: '100%', maxWidth: '860px', maxHeight: '95dvh',
                background: 'var(--bg-primary)', borderRadius: 'clamp(0px, 2vw, 16px)',
                border: '1px solid var(--glass-border)', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', position: 'relative',
              }}
              onClick={e => e.stopPropagation()}>
              
              {/* Header / Close button */}
              <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'rgba(0,0,0,0.6)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                <X size={20} />
              </button>

              {/* Video Player (실시간 재생시간 동기화 플레이어) */}
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', flexShrink: 0 }}>
                {extractId(selectedVideo.videoUrl) ? (
                  <YouTubeSyncPlayer
                    videoId={extractId(selectedVideo.videoUrl)}
                    playerRef={playerInstanceRef}
                    onTimeUpdate={(currentTime) => {
                      setVideoCurrentTime(currentTime);
                    }}
                  />
                ) : (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(selectedVideo.videoUrl)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                )}
              </div>
              
              {/* Sermon Details — 모바일에서 패딩 최소화 */}
              <div style={{ padding: 'clamp(0.75rem, 4vw, 1.5rem)', overflowY: 'auto', flex: 1, color: 'var(--text-primary)', WebkitOverflowScrolling: 'touch' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-gold)' }}>{selectedVideo.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>{selectedVideo.date} | {selectedVideo.scripture} | {selectedVideo.preacher}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  {selectedVideo.externalLink && (
                    <a href={selectedVideo.externalLink.startsWith('http') ? selectedVideo.externalLink : `https://${selectedVideo.externalLink}`} target="_blank" rel="noopener noreferrer" 
                       style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(212,175,55,0.3)' }}>
                      <ExternalLink size={16} /> 관련 링크 열기
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const targetId = selectedVideo.id;
                      setSelectedVideo(null);
                      navigate('/quiz', { state: { category: '🎤 주일 설교 퀴즈', quizId: `sermon_${targetId}` } });
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #d4af37, #f3e5ab)',
                      color: '#1a1400', borderRadius: '8px', border: 'none',
                      fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
                    }}
                  >
                    ✍️ 이 설교 퀴즈 풀기
                  </button>
                </div>
                
                {/* 실시간 설교 묵상 노트 & 타임스탬프 패널 */}
                <SermonNotesPanel
                  sermon={selectedVideo}
                  currentVideoTime={videoCurrentTime}
                  onSeekTo={(sec) => {
                    if (playerInstanceRef.current && typeof playerInstanceRef.current.seekTo === 'function') {
                      try {
                        playerInstanceRef.current.seekTo(sec, true);
                        if (typeof playerInstanceRef.current.playVideo === 'function') {
                          playerInstanceRef.current.playVideo();
                        }
                      } catch (e) {
                        console.warn('Player seek error:', e);
                      }
                    }
                    setVideoCurrentTime(sec);
                    if (showToast) showToast(`[${Math.floor(sec/60)}분 ${Math.floor(sec%60)}초]로 이동합니다 🎬`);
                  }}
                />

                {selectedVideo.summary && (
                  <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--accent-gold)' }}>📖 설교 요약</h4>
                    {selectedVideo.summary}
                  </div>
                )}

                {/* PDF Viewer Section */}
                {selectedVideo.file && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: 'clamp(0.75rem, 3vw, 1.2rem)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.35)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={18} /> 설교 요약 및 나눔 자료 (PDF)
                      </span>
                      
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
                    </div>

                    <div style={{ height: '55vh', minHeight: '300px', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
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
