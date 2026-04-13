import React, { createContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_PLAN, generatePlan } from '../data/readingPlanData';
import { SAMPLE_EVENTS } from '../data/scheduleData';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const UserContext = createContext();

const INITIAL_STATE = {
  favorites: [],
  devotions: [],
  highlights: {},
  planProgress: {
    type: DEFAULT_PLAN.type,
    totalDays: DEFAULT_PLAN.totalDays,
    completedDays: [],
    dailySchedule: DEFAULT_PLAN.dailySchedule,
    selectedBooks: DEFAULT_PLAN.selectedBooks,
  },
  events: SAMPLE_EVENTS,
};

export const UserProvider = ({ children }) => {
  // -- 로컬 스토리지 데이터 복구 부분 유지 --
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('luxverbi_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.planProgress && parsed.planProgress.dailySchedule && parsed.planProgress.dailySchedule.length <= 7) {
          parsed.planProgress = { ...INITIAL_STATE.planProgress, completedDays: parsed.planProgress.completedDays || [] };
        }
        parsed.events = SAMPLE_EVENTS;
        return { ...INITIAL_STATE, ...parsed };
      }
      return INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // 파이어베이스 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('로그인에 성공했습니다! 🎉');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showToast('로그인 중 문제가 발생했습니다.', 'error');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast('로그아웃 되었습니다.');
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };

  useEffect(() => {
    localStorage.setItem('luxverbi_user', JSON.stringify(state));
  }, [state]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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

  const addDevotion = useCallback(async (devotion) => {
    const newDevotion = { ...devotion, id: Date.now(), createdAt: new Date().toISOString() };
    
    // 로컬 스토리지 저장 (내 기기)
    setState(prev => ({
      ...prev,
      devotions: [newDevotion, ...prev.devotions]
    }));
    
    // 로그인한 유저의 경우 온라인 커뮤니티(Firestore)에도 함께 공유 저장
    if (currentUser) {
      try {
        await addDoc(collection(db, 'sharedDevotions'), {
          ...devotion,
          userId: currentUser.uid,
          userName: currentUser.displayName || '익명',
          userPhoto: currentUser.photoURL || '',
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error('커뮤니티 공유 실패:', err);
      }
    }
    
    showToast('묵상이 저장되었습니다. 🙏');
  }, [showToast, currentUser]);

  const deleteDevotion = useCallback((id) => {
    setState(prev => ({ ...prev, devotions: prev.devotions.filter(d => d.id !== id) }));
    showToast('묵상이 삭제되었습니다.');
  }, [showToast]);

  const togglePlanDay = useCallback((day) => {
    setState(prev => {
      const completed = prev.planProgress.completedDays;
      const newCompleted = completed.includes(day)
        ? completed.filter(d => d !== day)
        : [...completed, day];
      return { ...prev, planProgress: { ...prev.planProgress, completedDays: newCompleted } };
    });
    showToast('오늘 말씀을 완료했습니다! 🎉');
  }, [showToast]);

  const resetPlan = useCallback((type, selectedBookIds = []) => {
    const newPlan = generatePlan(type, selectedBookIds);
    setState(prev => ({
      ...prev,
      planProgress: {
        ...newPlan,
        completedDays: [],
      },
    }));
    showToast('새 플랜이 설정되었습니다! 📖');
  }, [showToast]);

  const toggleHighlight = useCallback((verseRef, color) => {
    setState(prev => {
      const current = prev.highlights[verseRef];
      const newHighlights = { ...prev.highlights };
      if (current === color) {
        delete newHighlights[verseRef];
      } else {
        newHighlights[verseRef] = color;
      }
      return { ...prev, highlights: newHighlights };
    });
  }, []);

  // ── 일정 관리 ──
  const addEvent = useCallback((event) => {
    setState(prev => ({
      ...prev,
      events: [...prev.events, { ...event, id: Date.now() }],
    }));
    showToast('일정이 추가되었습니다! 📅');
  }, [showToast]);

  const deleteEvent = useCallback((id) => {
    setState(prev => {
      // Loose equality in case string vs number mismatch
      const newEvents = prev.events.filter(e => String(e.id) !== String(id));
      return { ...prev, events: newEvents };
    });
    showToast('일정이 삭제되었습니다.');
  }, [showToast]);

  const updateEvent = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e),
    }));
    showToast('일정이 수정되었습니다.');
  }, [showToast]);

  return (
    <UserContext.Provider value={{
      ...state,
      toast,
      toggleFavorite,
      isFavorite,
      addDevotion,
      deleteDevotion,
      togglePlanDay,
      resetPlan,
      toggleHighlight,
      showToast,
      addEvent,
      deleteEvent,
      updateEvent,
      currentUser,
      loginWithGoogle,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
};
