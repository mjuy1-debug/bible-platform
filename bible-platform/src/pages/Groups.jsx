import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Copy, Check, X, ChevronRight } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, updateDoc, deleteDoc, increment } from 'firebase/firestore';
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
  const [todayVerseInput, setTodayVerseInput] = useState('');
  const [verseHistory, setVerseHistory] = useState([]); // 날짜별 말씀 기록
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch My Groups
  useEffect(() => {
    if (!currentUser) return;

    const q = collection(db, 'groups');
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const groups = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      groups.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAllGroups(groups);

      const myGroupsList = [];
      for (const g of groups) {
        try {
          const memberSnap = await getDoc(doc(db, `groups/${g.id}/members/${currentUser.uid}`));
          if (memberSnap.exists()) myGroupsList.push(g);
        } catch (_) {}
      }
      setMyGroups(myGroupsList);
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
    if (!selectedGroup) return;
    
    const q = query(
      collection(db, `groups/${selectedGroup.id}/posts`),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedGroup]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!currentUser || !newPostText.trim() || !selectedGroup) return;
    
    try {
      await addDoc(collection(db, `groups/${selectedGroup.id}/posts`), {
        text: newPostText,
        verse: newPostVerse,
        userId: currentUser.uid,
        userName: currentUser.displayName || '이름 없음',
        userPhoto: currentUser.photoURL || '',
        createdAt: serverTimestamp()
      });
      setNewPostText('');
      setNewPostVerse('');
    } catch (error) {
      console.error(error);
    }
  };

  const updateTodayVerse = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !todayVerseInput.trim()) return;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
      // Save into a 'verses' subcollection keyed by date
      await setDoc(doc(db, `groups/${selectedGroup.id}/verses/${today}`), {
        text: todayVerseInput.trim(),
        date: today,
        setBy: currentUser.displayName || '방장',
        createdAt: serverTimestamp()
      });
      // Also update group's todayVerse for quick display
      await updateDoc(doc(db, 'groups', selectedGroup.id), {
        todayVerse: todayVerseInput.trim(),
        todayVerseDate: today
      });
      if (showToast) showToast('오늘의 말씀이 저장되었습니다.');
      setTodayVerseInput('');
      setSelectedGroup({...selectedGroup, todayVerse: todayVerseInput.trim(), todayVerseDate: today});
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser || !selectedGroup) return;
    if (window.confirm('정말 이 그룹에서 나가시겠습니까?')) {
      try {
        await deleteDoc(doc(db, `groups/${selectedGroup.id}/members/${currentUser.uid}`));
        await updateDoc(doc(db, 'groups', selectedGroup.id), {
          memberCount: increment(-1)
        });
        setSelectedGroup(null);
        if (showToast) showToast('그룹에서 나갔습니다.');
      } catch (error) {
        console.error(error);
        if (showToast) showToast('오류가 발생했습니다.');
      }
    }
  };

  // Load verse history when a group is selected
  useEffect(() => {
    if (!selectedGroup) return;
    const versesRef = collection(db, `groups/${selectedGroup.id}/verses`);
    const q = query(versesRef, orderBy('date', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setVerseHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedGroup?.id]);

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
        
        {selectedGroup.todayVerse && (
          <div style={{ background: 'var(--accent-gold)', color: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>📖 오늘의 말씀 ({selectedGroup.todayVerseDate || '오늘'})</div>
            <div style={{ fontWeight: 'bold', lineHeight: 1.5 }}>{selectedGroup.todayVerse}</div>
          </div>
        )}

        {/* 말씀 역사 (과거 날짜별) */}
        {verseHistory.length > 1 && (
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>📅 지난 말씀 기록 ({verseHistory.length - 1}건)</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {verseHistory.slice(1).map(v => (
                <div key={v.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{v.date}</div>
                  <div>{v.text}</div>
                </div>
              ))}
            </div>
          </details>
        )}
        
        {selectedGroup.leaderId === currentUser?.uid && (
          <form onSubmit={updateTodayVerse} style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              placeholder="오늘의 말씀 설정..."
              value={todayVerseInput}
              onChange={(e) => setTodayVerseInput(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
            />
            <button type="submit" style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: 'pointer' }}>
              저장
            </button>
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
            posts.map(post => (
              <div key={post.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {post.userPhoto ? (
                    <img src={post.userPhoto} alt="profile" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                  )}
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{post.userName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : ''}
                  </span>
                </div>
                <p style={{ lineHeight: '1.5', marginBottom: post.verse ? '8px' : 0 }}>{post.text}</p>
                {post.verse && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', fontSize: '13px' }}>
                    📖 {post.verse}
                  </div>
                )}
              </div>
            ))
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
    <div style={{ padding: '20px', paddingBottom: '80px', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', maxWidth: '820px', margin: '0 auto' }}>
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
