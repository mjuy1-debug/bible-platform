import React, { createContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_PLAN, generatePlan } from '../data/readingPlanData';
import { SAMPLE_EVENTS } from '../data/scheduleData';

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
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('luxverbi_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기존 데이터에 7일치 플랜만 있으면 새 365일 플랜으로 마이그레이션
        if (parsed.planProgress && parsed.planProgress.dailySchedule && parsed.planProgress.dailySchedule.length <= 7) {
          parsed.planProgress = {
            ...INITIAL_STATE.planProgress,
            completedDays: parsed.planProgress.completedDays || [],
          };
        }
        // 외부 업데이트 시 브라우저 캐시 무시하고 항상 최신 데이터를 불러옴
        parsed.events = SAMPLE_EVENTS;
        
        return { ...INITIAL_STATE, ...parsed };
      }
      return INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [toast, setToast] = useState(null);

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

  const addDevotion = useCallback((devotion) => {
    setState(prev => ({
      ...prev,
      devotions: [{ ...devotion, id: Date.now(), createdAt: new Date().toISOString() }, ...prev.devotions]
    }));
    showToast('묵상이 저장되었습니다. 🙏');
  }, [showToast]);

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
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id),
    }));
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
    }}>
      {children}
    </UserContext.Provider>
  );
};
