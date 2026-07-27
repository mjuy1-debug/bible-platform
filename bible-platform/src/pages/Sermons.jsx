import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Play, Plus, X, Edit2, Trash2, Save, Download } from 'lucide-react';
import { SERMONS } from '../data/sermonData';

export default function Sermons() {
  const [sermons, setSermons] = useState([...SERMONS].sort((a, b) => new Date(b.date) - new Date(a.date)));
  
  // Modals state
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Admin states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

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
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : 'https://via.placeholder.com/320x180?text=No+Video';
  };

  const getPdfViewerUrl = (pdfPath) => {
    if (!pdfPath) return "";
    const relativePath = pdfPath.replace(/^\//, '');
    
    if (import.meta.env.DEV) {
      // 로컬 환경에서는 기본 브라우저 뷰어 사용
      return `${import.meta.env.BASE_URL}${relativePath}`;
    }
    
    // 배포 환경(GitHub Pages)에서는 모바일 호환을 위해 구글 Docs 뷰어 사용
    const fullUrl = `https://mjuy1-debug.github.io/bible-platform/${relativePath}`;
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  };

  // Admin functions
  const handleSaveSermon = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.videoUrl) {
      alert("제목, 날짜, 유튜브 링크는 필수입니다.");
      return;
    }
    
    let updatedSermons;
    if (editId) {
      updatedSermons = sermons.map(s => s.id === editId ? { ...newEvent, id: editId } : s);
    } else {
      updatedSermons = [{ ...newEvent, id: Date.now() }, ...sermons];
    }
    
    // Sort descending by date
    updatedSermons.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSermons(updatedSermons);
    
    setNewEvent({ title: '', date: '', preacher: '', scripture: '', videoUrl: '', summary: '', file: '' });
    setEditId(null);
    setShowAddForm(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result;
          // encode filename to avoid issues with korean characters in URL
          const safeName = `sermon_${Date.now()}.pdf`;
          
          const response = await fetch('http://localhost:3001/api/admin/upload-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: safeName, fileData: base64Data }),
          });

          // Check if response is ok before parsing json
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.ok) {
            setNewEvent({ ...newEvent, file: result.fileUrl });
          } else {
            alert(`업로드 실패: ${result.error}`);
          }
        } catch (err) {
          alert('서버와 통신 중 오류가 발생했습니다. 관리자 서버가 켜져있는지 확인해주세요.');
          console.error(err);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('파일 읽기 오류');
      setIsUploading(false);
    }
  };

  const handleEdit = (sermon, e) => {
    e.stopPropagation();
    setEditId(sermon.id);
    setNewEvent({ ...sermon });
    setShowAddForm(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("정말 이 말씀을 삭제하시겠습니까?")) {
      setSermons(sermons.filter(s => s.id !== id));
    }
  };

  const deployToGitHub = async () => {
    if (!window.confirm("현재 화면의 말씀 목록을 서버에 저장하고 반영하시겠습니까? (1~2분 소요)")) return;
    setIsSaving(true);
    setSaveStatus('저장 및 배포 중...');
    try {
      const response = await fetch('http://localhost:3001/api/admin/save-sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sermons, commitMessage: '관리자: 말씀 업데이트' }),
      });
      const result = await response.json();
      if (result.ok) {
        setSaveStatus('성공적으로 배포되었습니다! 1~2분 후 새로고침 해보세요.');
      } else {
        setSaveStatus(`오류 발생: ${result.error}`);
      }
    } catch (err) {
      setSaveStatus('서버 연결 실패. 관리자 서버가 실행 중인지 확인하세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in pb-20">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="serif-font" style={{ fontSize: '1.8rem', color: 'var(--accent-gold)' }}>말씀과 설교</h2>
        
        {import.meta.env.DEV && (
          <button onClick={() => { setEditId(null); setNewEvent({ title: '', date: new Date().toISOString().slice(0,10), preacher: '담임목사', scripture: '', videoUrl: '', summary: '', file: '' }); setShowAddForm(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.2rem', borderRadius: '30px',
              background: 'var(--accent-gold)', color: '#fff',
              fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
            }}>
            <Plus size={16} /> 새 설교 등록
          </button>
        )}
      </div>

      {/* Admin Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && import.meta.env.DEV && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-gold)' }}>
                {editId ? '설교 수정' : '새 설교 등록'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="제목" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="input-field" style={{ gridColumn: '1 / -1' }} />
                <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="input-field" />
                <input type="text" placeholder="설교자 (예: 담임목사)" value={newEvent.preacher} onChange={e => setNewEvent({...newEvent, preacher: e.target.value})} className="input-field" />
                <input type="text" placeholder="본문 (예: 요한복음 3:16)" value={newEvent.scripture} onChange={e => setNewEvent({...newEvent, scripture: e.target.value})} className="input-field" style={{ gridColumn: '1 / -1' }} />
                <input type="text" placeholder="유튜브 링크 (https://youtube.com/...)" value={newEvent.videoUrl} onChange={e => setNewEvent({...newEvent, videoUrl: e.target.value})} className="input-field" style={{ gridColumn: '1 / -1' }} />
                
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>설교 PDF 파일 업로드 (선택)</label>
                  <input type="file" accept="application/pdf" onChange={handleFileUpload} className="input-field" disabled={isUploading} />
                  {isUploading && <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>업로드 중...</span>}
                  {newEvent.file && !isUploading && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ 파일이 첨부되었습니다 ({newEvent.file})</span>}
                </div>

                <textarea placeholder="설교 요약 (선택 사항)" value={newEvent.summary} onChange={e => setNewEvent({...newEvent, summary: e.target.value})} className="input-field" style={{ gridColumn: '1 / -1', minHeight: '100px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button onClick={() => setShowAddForm(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}>취소</button>
                <button onClick={handleSaveSermon} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'var(--accent-gold)', color: '#fff', fontWeight: 600 }}>저장</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sermons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {sermons.map(sermon => (
          <div key={sermon.id} className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => setSelectedVideo(sermon)}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              <img src={getThumbnail(sermon.videoUrl)} alt={sermon.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '48px', height: '48px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Play fill="currentColor" size={20} style={{ marginLeft: '4px' }} />
              </div>
            </div>
            
            {/* Info */}
            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '0.3rem' }}>{sermon.date}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>{sermon.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{sermon.scripture} | {sermon.preacher}</p>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {import.meta.env.DEV && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={(e) => handleEdit(sermon, e)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button onClick={(e) => handleDelete(sermon.id, e)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {sermons.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            등록된 설교가 없습니다.
          </div>
        )}
      </div>

      {/* Admin Deploy Section */}
      {import.meta.env.DEV && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid var(--accent-gold)', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>👨‍💻 관리자 전용: 말씀 저장 및 배포</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.6 }}>
            화면에서 수정한 말씀 목록을 아래 버튼을 누르는 것만으로 자동 저장하고 GitHub에 배포합니다.<br/>
          </p>
          <button onClick={deployToGitHub} disabled={isSaving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '8px', background: 'var(--accent-gold)', color: '#fff', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
            <Save size={18} /> {isSaving ? '배포 중...' : '모두 저장하고 배포하기'}
          </button>
          {saveStatus && <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: saveStatus.includes('오류') || saveStatus.includes('실패') ? '#ef4444' : '#10b981' }}>{saveStatus}</p>}
        </div>
      )}

      {/* Combined Video & Summary Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setSelectedVideo(null)}>
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: 'var(--bg-primary)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
              onClick={e => e.stopPropagation()}>
              
              {/* Header / Close button */}
              <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                <X size={20} />
              </button>

              {/* Video Player */}
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', flexShrink: 0 }}>
                <iframe width="100%" height="100%" src={getEmbedUrl(selectedVideo.videoUrl)} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
              
              {/* Sermon Details */}
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, color: 'var(--text-primary)' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-gold)' }}>{selectedVideo.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{selectedVideo.date} | {selectedVideo.scripture} | {selectedVideo.preacher}</p>
                
                {selectedVideo.summary && (
                  <div style={{ marginBottom: '2rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {selectedVideo.summary}
                  </div>
                )}

                {selectedVideo.file && (
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: '55vh', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                      <iframe src={getPdfViewerUrl(selectedVideo.file)} width="100%" height="100%" style={{ border: 'none' }} title="PDF Viewer" />
                    </div>
                    <a href={`${import.meta.env.BASE_URL}${selectedVideo.file.replace(/^\//, '')}`} download 
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', borderRadius: '8px', background: 'var(--accent-gold)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
                      <Download size={18} /> 설교 요약 PDF 다운로드
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
