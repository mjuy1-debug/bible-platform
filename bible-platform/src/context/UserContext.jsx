import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_PLAN, generatePlan } from '../data/readingPlanData';
import { SAMPLE_EVENTS } from '../data/scheduleData';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection, addDoc, serverTimestamp, doc, deleteDoc,
  query, where, getDocs, setDoc, getDoc, onSnapshot, updateDoc
} from 'firebase/firestore';

export const UserContext = createContext();

const INITIAL_STATE = {
  favorites: [],
  devotions: [],
  highlights: {},
  memorized: {},
  prayers: [],
  streak: { current: 0, longest: 0, lastCompletedDate: null },
  planProgress: {
    type: DEFAULT_PLAN.type,
    totalDays: DEFAULT_PLAN.totalDays,
    completedDays: [],
    dailySchedule: DEFAULT_PLAN.dailySchedule,
    selectedBooks: DEFAULT_PLAN.selectedBooks,
  },
  events: SAMPLE_EVENTS,
};

// ── 로컬 스토리지에서 초기 상태 불러오기 ──
const loadLocalState = () => {
  try {
    const saved = localStorage.getItem('luxverbi_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      // 구버전 dailySchedule(7일 이하) 마이그레이션: type/selectedBooks는 유지, dailySchedule 재생성
      if (
        parsed.planProgress &&
        parsed.planProgress.dailySchedule &&
        parsed.planProgress.dailySchedule.length <= 7 &&
        !parsed.planProgress.type  // type이 없을 때만 리셋 (구버전 기본값 제거)
      ) {
        parsed.planProgress = { ...INITIAL_STATE.planProgress, completedDays: parsed.planProgress.completedDays || [] };
      }
      parsed.events = SAMPLE_EVENTS;
      return { ...INITIAL_STATE, ...parsed };
    }
  } catch { /* ignore */ }
  return INITIAL_STATE;
};

// Firestore 문서 경로: users/{uid}/userData/main
const userDocRef = (uid) => doc(db, 'users', uid, 'userData', 'main');

// Firestore 저장 가능한 형태로 변환 (undefined 제거)
const sanitize = (obj) => JSON.parse(JSON.stringify(obj ?? {}));

export const UserProvider = ({ children }) => {
  const [state, setState] = useState(loadLocalState);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [memberStatus, setMemberStatus] = useState(null); // null=loading, 'pending'|'approved'|'rejected'
  const [memberProfile, setMemberProfile] = useState(null);
  const unsubCloudRef = useRef(null);
  const unsubMemberRef = useRef(null);
  const savingToCloud = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── 로컬 스토리지 자동 저장 ──
  useEffect(() => {
    localStorage.setItem('luxverbi_user', JSON.stringify(state));
  }, [state]);

  // ── Firestore에 저장 (debounce 500ms) ──
  const cloudSaveTimer = useRef(null);
  const saveToCloud = useCallback((uid, newState) => {
    if (!uid) return;
    clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(async () => {
      if (savingToCloud.current) return;
      savingToCloud.current = true;
      try {
        const payload = sanitize({
          favorites: newState.favorites,
          devotions: newState.devotions,
          highlights: newState.highlights,
          planProgress: {
            type: newState.planProgress.type,
            totalDays: newState.planProgress.totalDays,
            completedDays: newState.planProgress.completedDays,
            selectedBooks: newState.planProgress.selectedBooks,
            dailySchedule: newState.planProgress.dailySchedule,
          },
          updatedAt: new Date().toISOString(),
        });
        await setDoc(userDocRef(uid), payload, { merge: true });
      } catch (err) {
        console.error('클라우드 저장 실패:', err);
      } finally {
        savingToCloud.current = false;
      }
    }, 500);
  }, []);

  // ── 로그인 상태 감지 → 클라우드 데이터 실시간 동기화 + 회원 승인 상태 감지 ──
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // 이전 리스너 정리
      if (unsubCloudRef.current) { unsubCloudRef.current(); unsubCloudRef.current = null; }
      if (unsubMemberRef.current) { unsubMemberRef.current(); unsubMemberRef.current = null; }

      if (user) {
        // ── 1. 회원 승인 상태 실시간 감지 ──
        const memberRef = doc(db, 'memberProfiles', user.uid);
        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {
          // 최초 로그인: memberProfile 생성 (pending 상태)
          await setDoc(memberRef, {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            status: 'pending',
            isAdmin: false,
            position: '',
            district: '',
            createdAt: serverTimestamp(),
          });
          setMemberStatus('pending');
          setMemberProfile({ status: 'pending', isAdmin: false });
        } else {
          const mData = memberSnap.data();
          setMemberStatus(mData.status || 'pending');
          setMemberProfile(mData);
        }

        // 실시간 승인 상태 리스너 (관리자가 승인하면 즉시 반영)
        unsubMemberRef.current = onSnapshot(memberRef, (snap) => {
          if (snap.exists()) {
            const d = snap.data();
            setMemberStatus(d.status || 'pending');
            setMemberProfile(d);
            // 방금 승인된 경우 환영 토스트
            if (d.status === 'approved') {
              const prevStatus = localStorage.getItem('_prevMemberStatus');
              if (prevStatus === 'pending') {
                showToast('🎉 관리자가 승인했습니다! 앱을 이용해 주세요.');
              }
            }
            localStorage.setItem('_prevMemberStatus', d.status || 'pending');
          }
        });

        // ── 2. 클라우드 데이터 동기화 (기존 로직 유지) ──
        try {
          const snap = await getDoc(userDocRef(user.uid));
          if (snap.exists()) {
            const cloudData = snap.data();
            setState(prev => {
              const merged = {
                ...prev,
                favorites: cloudData.favorites?.length ? cloudData.favorites : prev.favorites,
                devotions: cloudData.devotions?.length ? cloudData.devotions : prev.devotions,
                highlights: Object.keys(cloudData.highlights || {}).length ? cloudData.highlights : prev.highlights,
                planProgress: cloudData.planProgress?.completedDays?.length
                  ? { ...INITIAL_STATE.planProgress, ...cloudData.planProgress }
                  : prev.planProgress,
              };
              return merged;
            });
            setCloudSynced(true);
            showToast('☁️ 클라우드 데이터가 복구되었습니다!');
          } else {
            const local = loadLocalState();
            const payload = sanitize({
              favorites: local.favorites,
              devotions: local.devotions,
              highlights: local.highlights,
              planProgress: {
                type: local.planProgress.type,
                totalDays: local.planProgress.totalDays,
                completedDays: local.planProgress.completedDays,
                selectedBooks: local.planProgress.selectedBooks,
              },
              updatedAt: new Date().toISOString(),
            });
            await setDoc(userDocRef(user.uid), payload);
            setCloudSynced(true);
            showToast('☁️ 기존 데이터를 클라우드에 저장했습니다!');
          }
        } catch (err) {
          console.error('클라우드 로드 실패:', err);
        }

        // 실시간 리스너 (다른 기기에서 변경 시 동기화)
        unsubCloudRef.current = onSnapshot(userDocRef(user.uid), (snap) => {
          if (!snap.exists() || savingToCloud.current) return;
          const cloudData = snap.data();
          setState(prev => ({
            ...prev,
            favorites: cloudData.favorites ?? prev.favorites,
            devotions: cloudData.devotions ?? prev.devotions,
            highlights: cloudData.highlights ?? prev.highlights,
            planProgress: cloudData.planProgress
              ? { ...INITIAL_STATE.planProgress, ...cloudData.planProgress }
              : prev.planProgress,
          }));
        });
      } else {
        setCloudSynced(false);
        setMemberStatus(null);
        setMemberProfile(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubCloudRef.current) unsubCloudRef.current();
      if (unsubMemberRef.current) unsubMemberRef.current();
    };
  }, [showToast]);

  // ── state 변경 시 클라우드에 자동 저장 ──
  useEffect(() => {
    if (currentUser) {
      saveToCloud(currentUser.uid, state);
    }
  }, [state, currentUser, saveToCloud]);

  // ── Google 로그인 / 로그아웃 ──
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('로그인에 성공했습니다! 🎉');
    } catch (error) {
      console.error('Google Login Error:', error);
      showToast(`로그인 실패: ${error.message}`, 'error');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast('로그아웃 되었습니다.');
    } catch {
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };

  // ── 즐겨찾기 ──
  const toggleFavorite = useCallback((verse) => {
    setState(prev => {
      const exists = prev.favorites.find(f => f.ref === verse.ref);
      const newFavorites = exists
        ? prev.favorites.filter(f => f.ref !== verse.ref)
        : [...prev.favorites, { ...verse, savedAt: new Date().toISOString() }];
      return { ...prev, favorites: newFavorites };
    });
    showToast(state.favorites.find(f => f.ref === verse.ref) ? '즐겨찾기에서 제거했습니다.' : '즐겨찾기에 저장했습니다. ✨');
  }, [state.favorites, showToast]);

  const isFavorite = useCallback((ref) => {
    return state.favorites.some(f => f.ref === ref);
  }, [state.favorites]);

  // ── 묵상 ──
  const addDevotion = useCallback(async (devotion) => {
    const newDevotion = { ...devotion, id: Date.now(), createdAt: new Date().toISOString(), isShared: false };
    setState(prev => ({ ...prev, devotions: [newDevotion, ...prev.devotions] }));
    showToast('나의 묵상에 저장되었습니다. 🙏');
  }, [showToast]);

  const deleteDevotion = useCallback(async (id) => {
    setState(prev => ({ ...prev, devotions: prev.devotions.filter(d => d.id !== id) }));
    if (currentUser) {
      try {
        const q = query(collection(db, 'sharedDevotions'), where('id', '==', id), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docSnap) => { await deleteDoc(doc(db, 'sharedDevotions', docSnap.id)); });
      } catch (err) { console.error('서버 연동 삭제 실패:', err); }
    }
    showToast('묵상이 완전히 삭제되었습니다.');
  }, [showToast, currentUser]);

  const shareDevotion = useCallback(async (devotion) => {
    if (!currentUser) { showToast('공유하려면 로그인이 필요합니다.', 'error'); return; }
    try {
      const payload = sanitize({
        id: devotion.id || Date.now(),
        verse: devotion.verse || '',
        verseText: devotion.verseText || '',
        feeling: devotion.feeling || '',
        apply: devotion.apply || '',
        prayer: devotion.prayer || '',
        userId: currentUser.uid,
        userName: currentUser.displayName || '익명',
        userPhoto: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'sharedDevotions'), payload);
      setState(prev => ({ ...prev, devotions: prev.devotions.map(d => d.id === devotion.id ? { ...d, isShared: true } : d) }));
      showToast('나눔터에 묵상을 공유했습니다! 🌐');
    } catch (err) {
      console.error('커뮤니티 공유 실패:', err);
      showToast(`공유 중 오류가 발생했습니다: ${err.message}`, 'error');
    }
  }, [showToast, currentUser]);

  const deleteSharedDevotion = useCallback(async (docId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'sharedDevotions', docId));
      // 로컬 상태 업데이트 - docId 또는 sharedDocId 모두 대응
      setState(prev => ({
        ...prev,
        devotions: prev.devotions.map(d =>
          (d.id === docId || d.sharedDocId === docId || d.sharedId === docId)
            ? { ...d, isShared: false, sharedDocId: null }
            : d
        )
      }));
      showToast('나눔터에서 묵상이 삭제되었습니다.');
    } catch (err) {
      console.error('커뮤니티 삭제 실패:', err);
      // Firestore 권한 오류여도 로컬 UI는 제거
      if (err.code === 'permission-denied') {
        showToast('삭제 권한이 없습니다. (본인 글만 삭제 가능)', 'error');
      } else {
        // 네트워크 등 기타 오류 시 재시도 안내
        showToast(`삭제 중 오류: ${err.message}`, 'error');
      }
    }
  }, [showToast, currentUser]);

  // 스트릭 로직 포함
  const togglePlanDay = useCallback((day) => {
    setState(prev => {
      const completed = prev.planProgress.completedDays;
      const newCompleted = completed.includes(day) ? completed.filter(d => d !== day) : [...completed, day];
      
      // 스트릭 계산
      let newStreak = { ...prev.streak };
      if (!completed.includes(day)) {
        const today = new Date().toDateString();
        const last = newStreak.lastCompletedDate;
        if (last === today) {
          // already done today, no change
        } else if (last === new Date(Date.now() - 86400000).toDateString()) {
          newStreak.current += 1;
        } else {
          newStreak.current = 1;
        }
        newStreak.lastCompletedDate = today;
        if (newStreak.current > newStreak.longest) newStreak.longest = newStreak.current;
      }
      
      return { ...prev, planProgress: { ...prev.planProgress, completedDays: newCompleted }, streak: newStreak };
    });
    showToast('오늘 말씀을 완료했습니다! 🎉');
  }, [showToast]);

  // 기도 제목 CRUD
  const addPrayer = useCallback((prayer) => {
    const newPrayer = { ...prayer, id: Date.now(), createdAt: new Date().toISOString(), answered: false, answeredAt: null };
    setState(prev => ({ ...prev, prayers: [newPrayer, ...prev.prayers] }));
    showToast('기도 제목이 추가되었습니다. 🙏');
  }, [showToast]);

  const togglePrayerAnswered = useCallback((id) => {
    setState(prev => ({
      ...prev,
      prayers: prev.prayers.map(p => p.id === id
        ? { ...p, answered: !p.answered, answeredAt: !p.answered ? new Date().toISOString() : null }
        : p
      )
    }));
  }, []);

  const deletePrayer = useCallback((id) => {
    setState(prev => ({ ...prev, prayers: prev.prayers.filter(p => p.id !== id) }));
    showToast('기도 제목이 삭제되었습니다.');
  }, [showToast]);

  const resetPlan = useCallback((type, selectedBookIds = []) => {
    const newPlan = generatePlan(type, selectedBookIds);
    setState(prev => ({ ...prev, planProgress: { ...newPlan, completedDays: [] } }));
    showToast('새 플랜이 설정되었습니다! 📖');
  }, [showToast]);

  // ── 암송 완료 표시 ──
  const toggleMemorized = useCallback((verseRef, forceValue) => {
    setState(prev => {
      const newMemorized = { ...prev.memorized };
      if (forceValue === true) {
        newMemorized[verseRef] = true;
      } else if (forceValue === false) {
        delete newMemorized[verseRef];
      } else {
        if (newMemorized[verseRef]) { delete newMemorized[verseRef]; }
        else { newMemorized[verseRef] = true; }
      }
      return { ...prev, memorized: newMemorized };
    });
  }, []);

  // ── 하이라이트 ──
  const toggleHighlight = useCallback((verseRef, color) => {
    setState(prev => {
      const current = prev.highlights[verseRef];
      const newHighlights = { ...prev.highlights };
      if (current === color) { delete newHighlights[verseRef]; } else { newHighlights[verseRef] = color; }
      return { ...prev, highlights: newHighlights };
    });
  }, []);

  const removeHighlight = useCallback((verseRef) => {
    setState(prev => {
      const newHighlights = { ...prev.highlights };
      delete newHighlights[verseRef];
      return { ...prev, highlights: newHighlights };
    });
  }, []);

  // ── 일정 관리 ──
  const addEvent = useCallback((event) => {
    setState(prev => ({ ...prev, events: [...prev.events, { ...event, id: Date.now() }] }));
    showToast('일정이 추가되었습니다! 📅');
  }, [showToast]);

  const deleteEvent = useCallback((id) => {
    setState(prev => ({ ...prev, events: prev.events.filter(e => String(e.id) !== String(id)) }));
    showToast('일정이 삭제되었습니다.');
  }, [showToast]);

  const updateEvent = useCallback((id, updates) => {
    setState(prev => ({ ...prev, events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e) }));
    showToast('일정이 수정되었습니다.');
  }, [showToast]);

  // ── 수동 재동기화 ──
  const forceSync = useCallback(async () => {
    if (!currentUser) { showToast('로그인이 필요합니다.'); return; }
    showToast('⏳ 클라우드에서 데이터를 불러오는 중...');
    try {
      const snap = await getDoc(userDocRef(currentUser.uid));
      if (snap.exists()) {
        const cloudData = snap.data();
        setState(prev => ({
          ...prev,
          favorites: cloudData.favorites?.length ? cloudData.favorites : prev.favorites,
          devotions: cloudData.devotions?.length ? cloudData.devotions : prev.devotions,
          highlights: Object.keys(cloudData.highlights || {}).length ? cloudData.highlights : prev.highlights,
          planProgress: cloudData.planProgress?.completedDays?.length
            ? { ...INITIAL_STATE.planProgress, ...cloudData.planProgress }
            : prev.planProgress,
        }));
        setCloudSynced(true);
        showToast('✅ 클라우드 데이터 복구 완료!');
      } else {
        // 처음 사용자: 로컬 데이터 업로드
        const local = loadLocalState();
        const payload = sanitize({
          favorites: local.favorites,
          devotions: local.devotions,
          highlights: local.highlights,
          planProgress: { type: local.planProgress.type, totalDays: local.planProgress.totalDays, completedDays: local.planProgress.completedDays, selectedBooks: local.planProgress.selectedBooks },
          updatedAt: new Date().toISOString(),
        });
        await setDoc(userDocRef(currentUser.uid), payload);
        setCloudSynced(true);
        showToast('✅ 로컬 데이터를 클라우드에 저장했습니다!');
      }
    } catch (err) {
      console.error('수동 동기화 실패:', err);
      showToast(`❌ 동기화 실패: ${err.code || err.message}`);
    }
  }, [currentUser, showToast]);

  // ── 회원 직분/구역 업데이트 ──
  const updateMemberProfile = useCallback(async (updates) => {
    if (!currentUser) return;
    try {
      const memberRef = doc(db, 'memberProfiles', currentUser.uid);
      await updateDoc(memberRef, { ...updates, updatedAt: serverTimestamp() });
      showToast('✅ 프로필이 업데이트되었습니다.');
    } catch (err) {
      showToast('프로필 업데이트 실패: ' + err.message, 'error');
    }
  }, [currentUser, showToast]);

  return (
    <UserContext.Provider value={{
      ...state,
      toast,
      cloudSynced,
      memberStatus,
      memberProfile,
      updateMemberProfile,
      forceSync,
      toggleFavorite,
      isFavorite,
      addDevotion,
      deleteDevotion,
      togglePlanDay,
      resetPlan,
      toggleHighlight,
      removeHighlight,
      toggleMemorized,
      showToast,
      addPrayer,
      togglePrayerAnswered,
      deletePrayer,
      addEvent,
      deleteEvent,
      updateEvent,
      currentUser,
      loginWithGoogle,
      logout,
      shareDevotion,
      deleteSharedDevotion,
    }}>
      {children}
    </UserContext.Provider>
  );
};
