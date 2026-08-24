// src/components/SermonNotesPanel.jsx
// 설교 실시간 노트 및 타임스탬프 재생 연동 컴포넌트

import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Plus, Trash2, Edit3, Check, Copy, Share2, 
  Sparkles, BookOpen, Bookmark, ChevronRight, Play, RefreshCw 
} from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

function formatSeconds(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return Number(timeStr) || 0;
}

export default function SermonNotesPanel({ sermon, currentVideoTime = 0, onSeekTo }) {
  const { currentUser, showToast } = useContext(UserContext);
  const storageKey = `sermon_notes_${sermon.id}`;

  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputNote, setInputNote] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Firestore에서 기존 작성 노트 불러오기 (로그인 시)
  useEffect(() => {
    if (currentUser?.uid && sermon?.id) {
      const noteDocRef = doc(db, 'users', currentUser.uid, 'sermonNotes', String(sermon.id));
      getDoc(noteDocRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.notes && Array.isArray(data.notes) && data.notes.length > 0) {
            setNotes(data.notes);
            localStorage.setItem(storageKey, JSON.stringify(data.notes));
          }
        }
      }).catch(err => console.warn('Firestore 설교노트 로드 생략:', err));
    }
  }, [currentUser, sermon.id]);

  // 노트 변경 시 로컬 & Firestore 저장
  const saveNotes = (newNotes) => {
    setNotes(newNotes);
    localStorage.setItem(storageKey, JSON.stringify(newNotes));

    if (currentUser?.uid && sermon?.id) {
      try {
        const noteDocRef = doc(db, 'users', currentUser.uid, 'sermonNotes', String(sermon.id));
        setDoc(noteDocRef, {
          sermonId: sermon.id,
          sermonTitle: sermon.title,
          notes: newNotes,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(() => {});
      } catch (e) {
        console.warn('Firestore 설교노트 저장 오류:', e);
      }
    }
  };

  const handleAddNote = (e) => {
    e?.preventDefault();
    if (!inputNote.trim()) return;

    const timestampSec = manualTime ? parseTimeToSeconds(manualTime) : Math.floor(currentVideoTime || 0);
    const timeFormatted = formatSeconds(timestampSec);

    if (editingId) {
      const updated = notes.map(n => n.id === editingId ? {
        ...n,
        text: inputNote.trim(),
        time: timestampSec,
        timeFormatted,
        updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      } : n);
      saveNotes(updated);
      setEditingId(null);
      if (showToast) showToast('설교 메모가 수정되었습니다. ✍️');
    } else {
      const newNoteItem = {
        id: Date.now(),
        text: inputNote.trim(),
        time: timestampSec,
        timeFormatted,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      const updated = [...notes, newNoteItem].sort((a, b) => a.time - b.time);
      saveNotes(updated);
      if (showToast) showToast(`[${timeFormatted}] 메모가 추가되었습니다! ⏱️`);
    }

    setInputNote('');
    setManualTime('');
  };

  const handleEdit = (n) => {
    setEditingId(n.id);
    setInputNote(n.text);
    setManualTime(n.timeFormatted);
  };

  const handleDelete = (id) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (showToast) showToast('메모가 삭제되었습니다.');
  };

  const handleCopyAll = () => {
    if (notes.length === 0) return;
    const text = `📖 [설교 묵상 노트]\n제목: ${sermon.title}\n설교자: ${sermon.preacher || '김석주 목사님'}\n본문: ${sermon.scripture || ''}\n\n` +
      notes.map(n => `[${n.timeFormatted}] ${n.text}`).join('\n') +
      `\n\n#설교노트 #말씀묵상 #벧엘교회`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    if (showToast) showToast('전체 설교 메모가 복사되었습니다! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      marginTop: '1.5rem',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: 'clamp(1rem, 3.5vw, 1.4rem)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* 헤더 바 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--glass-border)',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(212, 175, 55, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <Bookmark size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              실시간 설교 노트 & 타임스탬프
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              타임스탬프를 누르면 해당 시간으로 영상이 점프합니다
            </span>
          </div>
        </div>

        {notes.length > 0 && (
          <button
            onClick={handleCopyAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} color="var(--accent-gold)" /> : <Copy size={14} />}
            {copied ? '복사 완료' : '노트 전체 복사'}
          </button>
        )}
      </div>

      {/* 노트 작성 입력 폼 */}
      <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 타임스탬프 입력/버튼 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--accent-gold)',
            borderRadius: '8px',
            padding: '4px 8px'
          }}>
            <Clock size={14} color="var(--accent-gold)" />
            <input
              type="text"
              placeholder="00:00"
              value={manualTime}
              onChange={e => setManualTime(e.target.value)}
              style={{
                width: '54px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontWeight: 800,
                outline: 'none',
                textAlign: 'center'
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setManualTime(formatSeconds(currentVideoTime || 0))}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ⏱️ 현재 시각({formatSeconds(currentVideoTime || 0)}) 태그
          </button>
        </div>

        {/* 텍스트 입력창 + 기록 버튼 (반응형 넘침 방지) */}
        <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
          <input
            type="text"
            placeholder="은혜받은 말씀이나 깨달음을 기록하세요..."
            value={inputNote}
            onChange={e => setInputNote(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '11px 14px',
              borderRadius: '10px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="submit"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'var(--accent-gold)',
              border: 'none',
              color: '#1a1a2e',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)'
            }}
          >
            {editingId ? <Check size={16} /> : <Plus size={16} />}
            {editingId ? '수정' : '기록'}
          </button>
        </div>
      </form>

      {/* 작성된 노트 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
        {notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.84rem',
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            border: '1px dashed var(--glass-border)'
          }}>
            ✍️ 설교를 들으시며 마음에 와닿는 순간을 메모해보세요.
          </div>
        ) : (
          notes.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--glass-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                {/* 타임스탬프 점프 버튼 */}
                <button
                  type="button"
                  onClick={() => onSeekTo && onSeekTo(n.time)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: 'var(--accent-gold)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  title="이 시간으로 재생 이동"
                >
                  <Play size={10} fill="currentColor" /> {n.timeFormatted}
                </button>

                <p style={{
                  margin: 0,
                  fontSize: '0.86rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  wordBreak: 'keep-all',
                  overflowWrap: 'break-word',
                  flex: 1
                }}>
                  {n.text}
                </p>
              </div>

              {/* 수정 / 삭제 */}
              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleEdit(n)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239, 68, 68, 0.7)',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
