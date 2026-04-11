import React, { createContext, useState, useEffect, useCallback } from 'react';

export const UserContext = createContext();

const INITIAL_STATE = {
  favorites: [],
  devotions: [],
  highlights: {},
  planProgress: {
    type: '1년통독',
    totalDays: 365,
    completedDays: [],
    dailySchedule: [
      { day: 1, range: '창세기 1~3장', ref: '창 1-3' },
      { day: 2, range: '창세기 4~6장', ref: '창 4-6' },
      { day: 3, range: '창세기 7~9장', ref: '창 7-9' },
      { day: 4, range: '창세기 10~11장', ref: '창 10-11' },
      { day: 5, range: '창세기 12~14장', ref: '창 12-14' },
      { day: 6, range: '창세기 15~17장', ref: '창 15-17' },
      { day: 7, range: '창세기 18~20장', ref: '창 18-20' },
    ]
  }
};

export const UserProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('luxverbi_user');
      return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
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

  return (
    <UserContext.Provider value={{
      ...state,
      toast,
      toggleFavorite,
      isFavorite,
      addDevotion,
      deleteDevotion,
      togglePlanDay,
      toggleHighlight,
      showToast
    }}>
      {children}
    </UserContext.Provider>
  );
};
