import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Copy, Check, X, ChevronRight } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, updateDoc, deleteDoc, increment, arrayUnion } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';

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
  const [editingDayVerseDate, setEditingDayVerseDate] = useState(null);
  const [editDayVerseText, setEditDayVerseText] = useState('');
  const [editDayVerseRef, setEditDayVerseRef] = useState('');
  const [verseHistory, setVerseHistory] = useState([]); // 날짜별 말씀 기록
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch My Groups — also sync selectedGroup when Firestore updates
  useEffect(() => {
    if (!currentUser) return;

    const q = collection(db, 'groups');
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const groups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      groups.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      // ✅ 기존 버그로 인해 삭제되지 않고 남아있는 비어있는 방(유령방) 자동 청소
      for (const g of groups) {
        if (g.memberCount <= 0) {
          deleteDoc(doc(db, 'groups', g.id)).catch(console.error);
        }
      }

      setAllGroups(groups.filter(g => g.memberCount > 0)); // 화면에서도 즉시 제외

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
    
    // Auto-fill the post verse with the group's todayVerse if the user didn't provide one
    const postVerse = newPostVerse.trim() || selectedGroup.todayVerse || '';
    
    try {
      await addDoc(collection(db, `groups/${selectedGroup.id}/posts`), {
        text: newPostText,
        verse: postVerse,
        userId: currentUser.uid,
        userName: currentUser.displayName || '이름 없음',
        userPhoto: currentUser.photoURL || '',
        createdAt: serverTimestamp()
      });
      setNewPostText('');
      setNewPostVerse('');
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

  // Removed verse history subcollection listener as it is now in selectedGroup.verseHistory

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (selectedGroup) {
    return (
      <div style={{ padding: '20px', paddingBottom: '100px', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        
        {/* 오늘의 말씀 (상단 고정은 삭제, 피드 내 날짜별로 표시) */}
        
        {/* 말씀 역사 (과거 날짜별) - 피드에 통합되었으므로 이전 기록 요약 뷰 */}
        {(Array.isArray(selectedGroup?.verseHistory) ? selectedGroup.verseHistory : []).length > 1 && (
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>📅 지난 말씀 기록 ({(Array.isArray(selectedGroup.verseHistory) ? selectedGroup.verseHistory : []).length - 1}건)</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {[...(Array.isArray(selectedGroup.verseHistory) ? selectedGroup.verseHistory : [])].reverse().slice(1).map(v => (
                <div key={v.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{v.date} {v.setBy && `(by ${v.setBy})`}</div>
                  <div>
                    {v.text}
                    {v.ref && <div style={{ opacity: 0.8, marginTop: '2px' }}>- {v.ref}</div>}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
        
        {currentUser && (
          <form onSubmit={updateTodayVerse} style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>📖 오늘의 말씀 설정 (모든 멤버 가능)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text"
                placeholder="관련 말씀 구절 (선택) ex) 창세기 1:1"
                value={todayVerseRefInput}
                onChange={(e) => setTodayVerseRefInput(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  placeholder="오늘의 말씀을 입력하세요..."
                  value={todayVerseInput}
                  onChange={(e) => setTodayVerseInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                />
                <button type="submit" disabled={!todayVerseInput.trim()} style={{ background: todayVerseInput.trim() ? 'var(--accent-gold)' : 'var(--glass-bg)', color: todayVerseInput.trim() ? '#000' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: todayVerseInput.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  저장
                </button>
              </div>
            </div>
          </form>
        )}
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            💬 나눔 피드
          </div>
          
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
                    {groupedPosts[dateStr].map(post => (
                      <div key={post.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {post.userPhoto ? (
                              <img src={post.userPhoto} alt="profile" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            ) : (
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                            )}
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{post.userName}</span>
                          </div>
                          
                          {/* Edit / Delete Buttons */}
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
                            <p style={{ lineHeight: '1.5', marginBottom: post.verse ? '8px' : 0, whiteSpace: 'pre-wrap' }}>{post.text}</p>
                            {post.verse && (
                              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <span>📖</span> <span style={{ color: 'var(--accent-gold)' }}>{post.verse}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div style={{ position: 'fixed', bottom: 'var(--bottomnav-height, 64px)', left: 0, right: 0, padding: '16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', zIndex: 10 }}>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
            <input 
              type="text"
              placeholder="관련 말씀 구절 (선택)"
              value={newPostVerse}
              onChange={(e) => setNewPostVerse(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
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
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--glass-border)' }}
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
