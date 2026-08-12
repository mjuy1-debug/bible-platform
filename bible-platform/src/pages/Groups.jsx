import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Copy, Check, X, ChevronRight, Search, Loader } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, updateDoc, deleteDoc, increment, arrayUnion } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';
import { fetchChapter } from '../services/bibleService';
import { BIBLE_BOOKS } from '../data/bibleData';

// 한국어 책 이름 → bookId 매핑 테이블
const BOOK_NAME_TO_ID = {};
BIBLE_BOOKS.forEach(b => {
  BOOK_NAME_TO_ID[b.name] = b.id;
  BOOK_NAME_TO_ID[b.shortName] = b.id;
});

/**
 * "창세기 1:1-5" 또는 "창 1:1" 같은 문자열을 파싱해서
 * { bookId, chapter, startVerse, endVerse } 를 반환
 */
function parseVerseRef(refStr) {
  if (!refStr) return null;
  const s = refStr.trim();
  // 패턴: (책이름)(공백?)(장):(절[-절])
  const match = s.match(/^(.+?)(\d+)[:\s:](\d+)(?:[\-–](\d+))?$/);
  if (!match) return null;
  const bookName = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const startVerse = parseInt(match[3], 10);
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;
  const bookId = BOOK_NAME_TO_ID[bookName];
  if (!bookId || !chapter || !startVerse) return null;
  return { bookId, chapter, startVerse, endVerse };
}

export default function Groups() {
  const { currentUser, showToast } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('my_groups');
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Forms
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  
  // Group feed
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostVerse, setNewPostVerse] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [editPostVerse, setEditPostVerse] = useState('');
  const [todayVerseInput, setTodayVerseInput] = useState('');
  const [todayVerseRefInput, setTodayVerseRefInput] = useState('');
  const [showVerseForm, setShowVerseForm] = useState(false);
  const [isFetchingVerse, setIsFetchingVerse] = useState(false);
  const [editingDayVerseDate, setEditingDayVerseDate] = useState(null);
  const [editDayVerseText, setEditDayVerseText] = useState('');
  const [editDayVerseRef, setEditDayVerseRef] = useState('');
  const [verseHistory, setVerseHistory] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  // ① 공지사항
  const [noticeText, setNoticeText] = useState('');
  const [isEditingNotice, setIsEditingNotice] = useState(false);

  // ③ 주간 말씀 계획
  const [isWeeklyPlanOpen, setIsWeeklyPlanOpen] = useState(false);
  const [weeklyPlanDraft, setWeeklyPlanDraft] = useState([]);

  // ④ 기도 제목 태그 & 필터
  const [newPostIsPrayer, setNewPostIsPrayer] = useState(false);
  const [postFilter, setPostFilter] = useState('all'); // 'all' | 'prayer'

  // 말씀 구절 참조 입력 후 자동 조회
  const handleFetchVerseFromRef = useCallback(async (refStr) => {
    const parsed = parseVerseRef(refStr);
    if (!parsed) return;
    setIsFetchingVerse(true);
    try {
      const allVerses = await fetchChapter(parsed.bookId, parsed.chapter);
      const selected = allVerses.filter(
        v => v.verse >= parsed.startVerse && v.verse <= parsed.endVerse
      );
      if (selected.length > 0) {
        const text = selected.map(v => `${v.verse}. ${v.text}`).join(' ');
        setTodayVerseInput(text);
      } else {
        if (showToast) showToast('해당 구절을 찾을 수 없습니다.', 'error');
      }
    } catch (err) {
      console.error('말씀 조회 오류:', err);
      if (showToast) showToast('말씀 조회 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsFetchingVerse(false);
    }
  }, [showToast]);

  // Fetch My Groups — also sync selectedGroup when Firestore updates
  useEffect(() => {
    if (!currentUser) return;

    const q = collection(db, 'groups');
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const groups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      groups.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      // ✅ 기존 버그로 인해 삭제되지 않고 남아있는 비어있는 방(유령방) 자동 청소 + 요청하신 특정 방 강제 삭제
      for (const g of groups) {
        if (g.memberCount <= 0 || g.name === '여호수아1' || g.name === '여호수아 1') {
          deleteDoc(doc(db, 'groups', g.id)).catch(console.error);
        }
      }

      setAllGroups(groups.filter(g => g.memberCount > 0 && g.name !== '여호수아1' && g.name !== '여호수아 1')); // 화면에서도 즉시 제외

      const myGroupsList = [];
      for (const g of groups) {
        try {
          const memberSnap = await getDoc(doc(db, `groups/${g.id}/members/${currentUser.uid}`));
          if (memberSnap.exists()) myGroupsList.push(g);
        } catch (_) {}
      }
      setMyGroups(myGroupsList);

      // ✅ 현재 열려 있는 그룹도 최신 데이터로 자동 갱신
      setSelectedGroup(prev => {
        if (!prev) return prev;
        const updated = groups.find(g => g.id === prev.id);
        return updated ? updated : prev;
      });
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (showToast) showToast('로그인이 필요합니다.');
      return;
    }
    if (!newGroupName.trim()) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: newGroupName.trim(),
        code,
        leaderId: currentUser.uid,
        leaderName: currentUser.displayName || '이름 없음',
        memberCount: 1,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, `groups/${groupRef.id}/members/${currentUser.uid}`), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || '이름 없음',
        photoURL: currentUser.photoURL || '',
        joinedAt: serverTimestamp()
      });

      setIsCreateModalOpen(false);
      setNewGroupName('');
      if (showToast) showToast('그룹이 생성되었습니다! 🎉');
    } catch (error) {
      console.error('그룹 생성 오류:', error);
      if (showToast) showToast(`오류: ${error.code || error.message}`);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!currentUser || !inviteCodeInput.trim()) return;
    
    try {
      const q = query(collection(db, 'groups'), where('code', '==', inviteCodeInput.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        if (showToast) showToast('존재하지 않는 코드입니다.');
        return;
      }
      
      const groupDoc = snap.docs[0];
      
      const memberRef = doc(db, `groups/${groupDoc.id}/members/${currentUser.uid}`);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        if (showToast) showToast('이미 가입된 그룹입니다.');
        return;
      }
      
      await setDoc(memberRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || '이름 없음',
        photoURL: currentUser.photoURL || '',
        joinedAt: serverTimestamp()
      });
      
      await setDoc(doc(db, 'groups', groupDoc.id), { memberCount: (groupDoc.data().memberCount || 0) + 1 }, { merge: true });
      
      setInviteCodeInput('');
      if (showToast) showToast('그룹에 참여했습니다.');
    } catch (error) {
      console.error(error);
    }
  };
  
  // Group Feed
  useEffect(() => {
    if (!selectedGroup?.id) return;
    const q = query(
      collection(db, `groups/${selectedGroup.id}/posts`),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedGroup?.id]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!currentUser || !newPostText.trim() || !selectedGroup) return;
    const postVerse = newPostVerse.trim() || selectedGroup.todayVerse || '';
    try {
      await addDoc(collection(db, `groups/${selectedGroup.id}/posts`), {
        text: newPostText,
        verse: postVerse,
        isPrayer: newPostIsPrayer,
        userId: currentUser.uid,
        userName: currentUser.displayName || '이름 없음',
        userPhoto: currentUser.photoURL || '',
        amenCount: 0,
        amenedBy: [],
        createdAt: serverTimestamp()
      });
      setNewPostText('');
      setNewPostVerse('');
      setNewPostIsPrayer(false);
    } catch (error) {
      console.error(error);
      if (showToast) showToast('오류가 발생했습니다.', 'error');
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditPostText(post.text);
    setEditPostVerse(post.verse || '');
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editingPostId || !editPostText.trim()) return;

    try {
      await updateDoc(doc(db, `groups/${selectedGroup.id}/posts`, editingPostId), {
        text: editPostText,
        verse: editPostVerse,
      });
      setEditingPostId(null);
      setEditPostText('');
      setEditPostVerse('');
      if (showToast) showToast('수정되었습니다.');
    } catch (error) {
      console.error(error);
      if (showToast) showToast('오류가 발생했습니다.', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('이 글을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, `groups/${selectedGroup.id}/posts`, postId));
      if (showToast) showToast('삭제되었습니다.');
    } catch (error) {
      console.error(error);
      if (showToast) showToast('오류가 발생했습니다.', 'error');
    }
  };

  const groupedPosts = {};
  (posts || []).forEach(post => {
    let dateStr;
    try {
      if (post.createdAt?.toDate) {
        dateStr = post.createdAt.toDate().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '').trim();
      } else if (typeof post.createdAt === 'string') {
        dateStr = new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '').trim();
      } else {
        dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '').trim();
      }
    } catch (e) {
      dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '').trim();
    }
    
    if (!groupedPosts[dateStr]) groupedPosts[dateStr] = [];
    groupedPosts[dateStr].push(post);
  });
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));

  const getTodayVerseForDate = (dateStr) => {
    if (selectedGroup?.todayVerseDate === dateStr) return { text: selectedGroup.todayVerse, ref: selectedGroup.todayVerseRef };
    if (Array.isArray(selectedGroup?.verseHistory)) {
      const found = selectedGroup.verseHistory.find(v => v.date === dateStr);
      if (found) return { text: found.text, ref: found.ref };
    }
    return null;
  };

  const updateTodayVerse = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !todayVerseInput.trim() || !currentUser) return;
    
    // Korean local date YYYY-MM-DD
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).replace(/\. /g, '-').replace('.', '').trim();

    const verseText = todayVerseInput.trim();
    const verseRef = todayVerseRefInput.trim();
    try {
      let history = Array.isArray(selectedGroup.verseHistory) ? [...selectedGroup.verseHistory] : [];
      let foundIndex = history.findIndex(v => v.date === today);
      
      const newObj = { id: Date.now().toString(), text: verseText, ref: verseRef, date: today, setBy: currentUser.displayName || '멤버' };
      
      if (foundIndex >= 0) {
        history[foundIndex] = newObj;
      } else {
        history.push(newObj);
      }

      await setDoc(doc(db, 'groups', selectedGroup.id), {
        todayVerse: verseText,
        todayVerseRef: verseRef,
        todayVerseDate: today,
        todayVerseSetBy: currentUser.displayName || '멤버',
        verseHistory: history
      }, { merge: true });

      if (showToast) showToast('오늘의 말씀이 저장되었습니다. 📖');
      setTodayVerseInput('');
      setTodayVerseRefInput('');
      setSelectedGroup(prev => ({ ...prev, todayVerse: verseText, todayVerseRef: verseRef, todayVerseDate: today, verseHistory: history }));
    } catch (error) {
      console.error('오늘의 말씀 저장 오류:', error);
      if (showToast) showToast(`저장 실패: ${error.code || error.message}`, 'error');
    }
  };

  const handleUpdateDayVerse = async (e, dateStr) => {
    e.preventDefault();
    if (!editDayVerseText.trim()) return;
    
    try {
      let history = Array.isArray(selectedGroup.verseHistory) ? [...selectedGroup.verseHistory] : [];
      let foundIndex = history.findIndex(v => v.date === dateStr);
      
      const newRef = editDayVerseRef.trim();
      const newText = editDayVerseText.trim();
      
      if (foundIndex >= 0) {
        history[foundIndex] = { ...history[foundIndex], text: newText, ref: newRef };
      } else {
        history.push({ id: Date.now().toString(), date: dateStr, text: newText, ref: newRef, setBy: currentUser.displayName || '멤버' });
      }
      
      const updates = { verseHistory: history };
      if (selectedGroup.todayVerseDate === dateStr) {
        updates.todayVerse = newText;
        updates.todayVerseRef = newRef;
      }
      
      await setDoc(doc(db, 'groups', selectedGroup.id), updates, { merge: true });
      if (showToast) showToast('말씀이 수정되었습니다.');
      setEditingDayVerseDate(null);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('오류가 발생했습니다.', 'error');
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser || !selectedGroup) return;
    if (window.confirm('정말 이 그룹에서 나가시겠습니까?')) {
      try {
        await deleteDoc(doc(db, `groups/${selectedGroup.id}/members/${currentUser.uid}`));
        
        if (selectedGroup.memberCount <= 1) {
          // 마지막 남은 멤버가 나갈 경우 그룹 폭파 (삭제)
          await deleteDoc(doc(db, 'groups', selectedGroup.id));
        } else {
          // 다른 멤버가 남아있을 경우 카운트만 감소
          await updateDoc(doc(db, 'groups', selectedGroup.id), {
            memberCount: increment(-1)
          });
        }
        
        setSelectedGroup(null);
        if (showToast) showToast('그룹에서 나갔습니다.');
      } catch (error) {
        console.error(error);
        if (showToast) showToast('오류가 발생했습니다.');
      }
    }
  };

  // ① 공지사항 저장
  const handleSaveNotice = async () => {
    if (!selectedGroup || currentUser?.uid !== selectedGroup.leaderId) return;
    try {
      await setDoc(doc(db, 'groups', selectedGroup.id), {
        notice: noticeText.trim() ? { text: noticeText.trim(), setBy: currentUser.displayName || '리더' } : null
      }, { merge: true });
      setIsEditingNotice(false);
      if (showToast) showToast(noticeText.trim() ? '공지가 저장되었습니다. 📢' : '공지가 삭제되었습니다.');
    } catch(err) { if (showToast) showToast('오류가 발생했습니다.', 'error'); }
  };

  // ② 아멘 반응 토글
  const handleAmen = async (post) => {
    if (!currentUser) { if (showToast) showToast('로그인이 필요합니다.'); return; }
    const postRef = doc(db, `groups/${selectedGroup.id}/posts`, post.id);
    const amenedBy = Array.isArray(post.amenedBy) ? post.amenedBy : [];
    if (amenedBy.includes(currentUser.uid)) {
      await updateDoc(postRef, { amenCount: Math.max((post.amenCount || 1) - 1, 0), amenedBy: amenedBy.filter(id => id !== currentUser.uid) });
    } else {
      await updateDoc(postRef, { amenCount: (post.amenCount || 0) + 1, amenedBy: [...amenedBy, currentUser.uid] });
    }
  };

  // ③ 주간 말씀 계획 저장
  const handleSaveWeeklyPlan = async () => {
    if (!selectedGroup) return;
    try {
      await setDoc(doc(db, 'groups', selectedGroup.id), { weeklyPlan: weeklyPlanDraft }, { merge: true });
      setIsWeeklyPlanOpen(false);
      if (showToast) showToast('주간 말씀 계획이 저장되었습니다. 📅');
    } catch(err) { if (showToast) showToast('오류가 발생했습니다.', 'error'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (selectedGroup) {
    return (
      <div style={{ padding: '20px', paddingBottom: '180px', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSelectedGroup(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <ChevronRight style={{ transform: 'rotate(180deg)' }} />
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedGroup.name}</h1>
          </div>
          <button onClick={handleLeaveGroup} style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4f', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
            나가기
          </button>
        </div>
        
        {/* ① 공지사항 카드 */}
        {(selectedGroup.notice?.text || currentUser?.uid === selectedGroup.leaderId) && (
          <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.3)', padding: '14px 16px', borderRadius: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffd700' }}>📢 공지사항</span>
              {currentUser?.uid === selectedGroup.leaderId && (
                <button onClick={() => { setNoticeText(selectedGroup.notice?.text || ''); setIsEditingNotice(!isEditingNotice); }}
                  style={{ fontSize: '11px', background: 'none', border: 'none', color: '#ffd700', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isEditingNotice ? '취소' : (selectedGroup.notice?.text ? '수정' : '+ 공지 작성')}
                </button>
              )}
            </div>
            {isEditingNotice ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={noticeText} onChange={e => setNoticeText(e.target.value)} placeholder="공지 내용을 입력하세요"
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }} />
                <button onClick={handleSaveNotice} style={{ background: '#ffd700', color: '#000', border: 'none', borderRadius: '6px', padding: '0 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>저장</button>
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedGroup.notice?.text || <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>공지사항이 없습니다. 리더만 작성할 수 있습니다.</span>}
              </div>
            )}
          </div>
        )}

        {/* ③ 주간 말씀 계획 */}
        {currentUser?.uid === selectedGroup.leaderId && (
          <div style={{ marginBottom: '14px' }}>
            <button onClick={() => { setIsWeeklyPlanOpen(!isWeeklyPlanOpen); if (!isWeeklyPlanOpen) { const plan = Array.isArray(selectedGroup.weeklyPlan) && selectedGroup.weeklyPlan.length > 0 ? selectedGroup.weeklyPlan : Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()+i); return { date: d.toLocaleDateString('ko-KR',{month:'2-digit',day:'2-digit'}).replace('. ','월 ').replace('.','일'), verseRef:'' }; }); setWeeklyPlanDraft(plan); } }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: '8px' }}>
              📅 주간 말씀 계획 {isWeeklyPlanOpen ? '▲' : '▼'}
            </button>
            {isWeeklyPlanOpen && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {weeklyPlanDraft.map((day, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '48px' }}>{day.date}</span>
                    <input value={day.verseRef} onChange={e => { const d=[...weeklyPlanDraft]; d[i]={...d[i],verseRef:e.target.value}; setWeeklyPlanDraft(d); }}
                      placeholder="예) 창세기 1:1" style={{ flex:1, padding:'6px 10px', borderRadius:'6px', background:'var(--bg-primary)', border:'1px solid var(--glass-border)', color:'var(--text-primary)', fontSize:'13px' }} />
                  </div>
                ))}
                <button onClick={handleSaveWeeklyPlan} style={{ marginTop:'4px', background:'var(--accent-gold)', color:'#000', border:'none', borderRadius:'8px', padding:'8px', fontWeight:'bold', cursor:'pointer' }}>저장</button>
              </div>
            )}
          </div>
        )}
        {!isWeeklyPlanOpen && Array.isArray(selectedGroup.weeklyPlan) && selectedGroup.weeklyPlan.some(d=>d.verseRef) && (
          <div style={{ marginBottom: '14px', overflowX: 'auto' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>📅 이번 주 말씀 계획</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedGroup.weeklyPlan.filter(d=>d.verseRef).map((day,i) => (
                <div key={i} style={{ minWidth:'90px', background:'var(--glass-bg)', border:'1px solid var(--glass-border)', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                  <div style={{ fontSize:'11px', color:'var(--text-secondary)', marginBottom:'4px' }}>{day.date}</div>
                  <div style={{ fontSize:'12px', fontWeight:'bold', color:'var(--accent-gold)' }}>{day.verseRef}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 지난 말씀 기록 */}
        {(Array.isArray(selectedGroup?.verseHistory) ? selectedGroup.verseHistory : []).length > 1 && (
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>📅 지난 말씀 기록 ({(Array.isArray(selectedGroup.verseHistory) ? selectedGroup.verseHistory : []).length - 1}건)</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {[...(Array.isArray(selectedGroup.verseHistory) ? selectedGroup.verseHistory : [])].reverse().slice(1).map(v => (
                <div key={v.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{v.date} {v.setBy && `(by ${v.setBy})`}</div>
                  <div>{v.text}{v.ref && <div style={{ opacity:0.8, marginTop:'2px' }}>- {v.ref}</div>}</div>
                </div>
              ))}
            </div>
          </details>
        )}
        
        {currentUser && (
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setShowVerseForm(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: showVerseForm ? 'var(--glass-bg)' : 'rgba(212,175,55,0.12)',
                border: `1px solid ${showVerseForm ? 'var(--glass-border)' : 'var(--accent-gold)'}`,
                color: showVerseForm ? 'var(--text-secondary)' : 'var(--accent-gold)',
                borderRadius: '20px', padding: '6px 14px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              📖 {showVerseForm ? '닫기' : '오늘의 말씀 설정'}
            </button>

            {showVerseForm && (
              <form onSubmit={async (e) => { await updateTodayVerse(e); setShowVerseForm(false); }} style={{ marginTop: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>📖 오늘의 말씀 설정 (모든 멤버 가능)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="말씀 구절 입력 ex) 창세기 1:1-5 → 자동 조회"
                      value={todayVerseRefInput}
                      onChange={(e) => setTodayVerseRefInput(e.target.value)}
                      onBlur={(e) => handleFetchVerseFromRef(e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleFetchVerseFromRef(todayVerseRefInput)}
                      disabled={isFetchingVerse || !todayVerseRefInput.trim()}
                      title="말씀 자동 조회"
                      style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap', opacity: (!todayVerseRefInput.trim() || isFetchingVerse) ? 0.5 : 1 }}
                    >
                      조회
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea
                      placeholder="말씀 본문이 여기에 자동으로 채워집니다. 직접 입력도 가능합니다."
                      value={todayVerseInput}
                      onChange={(e) => setTodayVerseInput(e.target.value)}
                      rows={3}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', resize: 'vertical', fontSize: '13px', lineHeight: '1.6' }}
                    />
                    <button type="submit" disabled={!todayVerseInput.trim()} style={{ background: todayVerseInput.trim() ? 'var(--accent-gold)' : 'var(--glass-bg)', color: todayVerseInput.trim() ? '#000' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: todayVerseInput.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', whiteSpace: 'nowrap', alignSelf: 'flex-end', height: '42px' }}>
                      저장
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>💬 나눔 피드</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setPostFilter('all')} style={{ fontSize:'12px', padding:'4px 10px', borderRadius:'16px', border:'none', background: postFilter==='all' ? 'var(--accent-gold)' : 'var(--glass-bg)', color: postFilter==='all' ? '#000' : 'var(--text-secondary)', cursor:'pointer', fontWeight:'bold' }}>전체</button>
              <button onClick={() => setPostFilter('prayer')} style={{ fontSize:'12px', padding:'4px 10px', borderRadius:'16px', border:'none', background: postFilter==='prayer' ? '#7c3aed' : 'var(--glass-bg)', color: postFilter==='prayer' ? '#fff' : 'var(--text-secondary)', cursor:'pointer', fontWeight:'bold' }}>🙏 기도</button>
            </div>
          </div>
          
          {/* ✅ 오늘의 말씀 - 포스트 여부와 관계없이 항상 표시 */}
          {selectedGroup.todayVerse && (() => {
            const today = new Date().toLocaleDateString('ko-KR', {
              year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\. /g, '-').replace('.', '').trim();
            const isToday = selectedGroup.todayVerseDate === today;
            return (
              <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.35)', padding: '18px', borderRadius: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                      📖 {isToday ? '오늘의 말씀' : `${selectedGroup.todayVerseDate} 말씀`}
                    </span>
                    {selectedGroup.todayVerseSetBy && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>by {selectedGroup.todayVerseSetBy}</span>
                    )}
                  </div>
                  <button onClick={() => { setEditingDayVerseDate(today); setEditDayVerseText(selectedGroup.todayVerse); setEditDayVerseRef(selectedGroup.todayVerseRef || ''); }}
                    style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', opacity: 0.8 }}>수정</button>
                </div>
                {editingDayVerseDate === today ? (
                  <form onSubmit={(e) => handleUpdateDayVerse(e, today)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" placeholder="관련 말씀 구절 (선택)" value={editDayVerseRef} onChange={(e) => setEditDayVerseRef(e.target.value)} style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }} />
                    <textarea required value={editDayVerseText} onChange={(e) => setEditDayVerseText(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '14px', minHeight: '60px', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setEditingDayVerseDate(null)} style={{ background: 'none', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '12px' }}>취소</button>
                      <button type="submit" style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>저장</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ color: 'var(--text-primary)', lineHeight: '1.7', fontSize: '15px', fontWeight: 500 }}>
                      {selectedGroup.todayVerse}
                    </div>
                    {selectedGroup.todayVerseRef && (
                      <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--accent-gold)', opacity: 0.9, fontStyle: 'italic' }}>
                        — {selectedGroup.todayVerseRef}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              아직 작성된 나눔이 없습니다.<br/>
              하단 입력창을 통해 첫 번째 묵상을 나눠보세요! 👇
            </div>
          ) : (
            sortedDates.map(dateStr => {
              const dayVerse = getTodayVerseForDate(dateStr);
              return (
                <div key={dateStr} style={{ marginBottom: '24px' }}>
                  {/* Date Header */}
                  <div style={{ textAlign: 'center', margin: '10px 0 20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--glass-border)', zIndex: 1 }}></div>
                    <span style={{ background: 'var(--bg-primary)', padding: '0 12px', position: 'relative', zIndex: 2, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {dateStr}
                    </span>
                  </div>
                  
                  {/* Today's Verse Header for this date */}
                  {dayVerse && (
                    <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '16px', color: 'var(--accent-gold)' }}>
                      {editingDayVerseDate === dateStr ? (
                        <form onSubmit={(e) => handleUpdateDayVerse(e, dateStr)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input type="text" placeholder="관련 말씀 구절 (선택)" value={editDayVerseRef} onChange={(e) => setEditDayVerseRef(e.target.value)} style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }} />
                          <textarea required value={editDayVerseText} onChange={(e) => setEditDayVerseText(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '14px', minHeight: '60px', resize: 'vertical' }} />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setEditingDayVerseDate(null)} style={{ background: 'none', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '12px' }}>취소</button>
                            <button type="submit" style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>저장</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>📖 이 날의 말씀</div>
                            <button onClick={() => { setEditingDayVerseDate(dateStr); setEditDayVerseText(dayVerse.text); setEditDayVerseRef(dayVerse.ref || ''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', opacity: 0.7, cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>수정</button>
                          </div>
                          <div style={{ fontWeight: 'bold', lineHeight: 1.5 }}>
                            {dayVerse.text}
                            {dayVerse.ref && <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.9 }}>- {dayVerse.ref}</div>}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Posts for this date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {groupedPosts[dateStr].filter(p => postFilter === 'all' || p.isPrayer).map(post => {
                      const iAmen = Array.isArray(post.amenedBy) && post.amenedBy.includes(currentUser?.uid);
                      return (
                        <div key={post.id} style={{ background: post.isPrayer ? 'rgba(124,58,237,0.08)' : 'var(--glass-bg)', border: `1px solid ${post.isPrayer ? 'rgba(124,58,237,0.4)' : 'var(--glass-border)'}`, padding: '16px', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {post.userPhoto ? (
                                <img src={post.userPhoto} alt="profile" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                              ) : (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                              )}
                              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{post.userName}</span>
                              {post.isPrayer && <span style={{ fontSize: '11px', background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', borderRadius: '10px', padding: '2px 8px' }}>🙏 기도 제목</span>}
                            </div>
                            {currentUser?.uid === post.userId && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEditPost(post)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>수정</button>
                                <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '12px' }}>삭제</button>
                              </div>
                            )}
                          </div>

                          {editingPostId === post.id ? (
                            <form onSubmit={handleUpdatePost} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                              <input type="text" placeholder="관련 말씀 구절 (선택)" value={editPostVerse} onChange={(e) => setEditPostVerse(e.target.value)} style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }} />
                              <textarea required value={editPostText} onChange={(e) => setEditPostText(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '14px', minHeight: '60px', resize: 'vertical' }} />
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditingPostId(null)} style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>저장</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p style={{ lineHeight: '1.5', marginBottom: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{post.text}</p>
                              {post.verse && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '10px' }}>
                                  <span>📖</span> <span style={{ color: 'var(--accent-gold)' }}>{post.verse}</span>
                                </div>
                              )}
                              {/* ② 아멘 반응 버튼 */}
                              <button onClick={() => handleAmen(post)}
                                style={{ display:'flex', alignItems:'center', gap:'5px', background: iAmen ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${iAmen ? 'var(--accent-gold)' : 'var(--glass-border)'}`, borderRadius:'20px', padding:'5px 12px', cursor:'pointer', fontSize:'13px', color: iAmen ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: iAmen ? 'bold' : 'normal', transition:'all 0.2s' }}>
                                🙏 아멘 {post.amenCount > 0 && <span style={{ fontWeight:'bold' }}>{post.amenCount}</span>}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div style={{ position: 'fixed', bottom: 'var(--bottomnav-height, 64px)', left: 0, right: 0, padding: '12px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', zIndex: 10 }}>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '600px', margin: '0 auto' }}>
            <input 
              type="text"
              placeholder="관련 말씀 구절 (선택)"
              value={newPostVerse}
              onChange={(e) => setNewPostVerse(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                required
                type="text"
                placeholder="묵상을 나눠주세요..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              />
              <button type="submit" style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' }}>
                게시
              </button>
            </div>
            {/* ④ 기도 제목 토글 */}
            <button type="button" onClick={() => setNewPostIsPrayer(p => !p)}
              style={{ alignSelf: 'flex-start', display:'flex', alignItems:'center', gap:'5px', background: newPostIsPrayer ? 'rgba(124,58,237,0.2)' : 'transparent', border: `1px solid ${newPostIsPrayer ? '#7c3aed' : 'var(--glass-border)'}`, borderRadius:'16px', padding:'4px 12px', cursor:'pointer', fontSize:'12px', color: newPostIsPrayer ? '#c4b5fd' : 'var(--text-secondary)', transition:'all 0.2s' }}>
              🙏 {newPostIsPrayer ? '기도 제목으로 등록됨 (취소하려면 클릭)' : '기도 제목으로 등록하기'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.5rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users color="var(--accent-gold)" /> 소그룹
        </h1>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('my_groups')}
          style={{ flex: 1, padding: '12px', background: activeTab === 'my_groups' ? 'var(--accent-gold)' : 'var(--glass-bg)', color: activeTab === 'my_groups' ? '#fff' : 'var(--text-primary)', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          내 그룹
        </button>
        <button 
          onClick={() => setActiveTab('find_group')}
          style={{ flex: 1, padding: '12px', background: activeTab === 'find_group' ? 'var(--accent-gold)' : 'var(--glass-bg)', color: activeTab === 'find_group' ? '#fff' : 'var(--text-primary)', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          그룹 찾기/참여
        </button>
      </div>

      {activeTab === 'my_groups' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              참여 중인 그룹이 없습니다.
            </div>
          ) : (
            myGroups.map(group => (
              <div 
                key={group.id} 
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedGroup(group)}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{group.name}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> 멤버 {group.memberCount || 1}명
                    </div>
                  </div>
                  <ChevronRight color="var(--text-secondary)" />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>초대 코드: <strong style={{ color: 'var(--accent-gold)' }}>{group.code}</strong></div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyCode(group.code); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}
                  >
                    {copiedCode === group.code ? <Check size={14} color="var(--accent-gold)" /> : <Copy size={14} />}
                    {copiedCode === group.code ? '복사됨' : '복사'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{ width: '100%', padding: '16px', background: 'var(--glass-bg)', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)', borderRadius: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Plus size={20} /> 새 그룹 만들기
          </button>

          {/* 전체 공개 그룹 목록 */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>전체 그룹 ({allGroups.length})</h3>
          {allGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>아직 생성된 그룹이 없습니다.</div>
          ) : (
            allGroups.map(group => {
              const isJoined = myGroups.some(g => g.id === group.id);
              return (
                <div
                  key={group.id}
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{group.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} /> 멤버 {group.memberCount || 1}명 · 리더: {group.leaderName}
                    </div>
                  </div>
                  {isJoined ? (
                    <button
                      onClick={() => { setSelectedGroup(group); setActiveTab('my_groups'); }}
                      style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                    >
                      입장
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!currentUser) { showToast('로그인이 필요합니다.'); return; }
                        const code = window.prompt(`'${group.name}' 그룹의 6자리 초대 코드를 입력하세요:`);
                        if (!code) return;
                        if (code.trim().toUpperCase() !== group.code) {
                          showToast('초대 코드가 일치하지 않습니다.');
                          return;
                        }
                        try {
                          const memberRef = doc(db, `groups/${group.id}/members/${currentUser.uid}`);
                          await setDoc(memberRef, { uid: currentUser.uid, displayName: currentUser.displayName || '이름 없음', photoURL: currentUser.photoURL || '', joinedAt: serverTimestamp() });
                          await updateDoc(doc(db, 'groups', group.id), { memberCount: increment(1) });
                          showToast(`'${group.name}' 그룹에 참여했습니다! 🎉`);
                        } catch(err) { showToast(`오류: ${err.code || err.message}`); }
                      }}
                      style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      참여
                    </button>
                  )}
                </div>
              );
            })
          )}

          {/* 초대 코드 참여 */}
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>초대 코드로 참여</h3>
            <form onSubmit={handleJoinGroup} style={{ display: 'flex', gap: '8px' }}>
              <input 
                required type="text" placeholder="6자리 코드"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ flex: 1, maxWidth: '140px', padding: '10px 12px', fontSize: '14px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', textTransform: 'uppercase' }}
              />
              <button type="submit" style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>참여</button>
            </form>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--glass-border)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>새 그룹 만들기</h2>
                <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X />
                </button>
              </div>
              
              <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input 
                  required
                  type="text"
                  placeholder="그룹 이름"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                />
                <button 
                  type="submit"
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'var(--accent-gold)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  만들기
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
