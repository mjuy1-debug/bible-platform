import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Sparkles, Trophy, RotateCcw, Share2, HelpCircle, Plus, Edit, Trash2, ChevronRight, X, ArrowLeft, BookOpen, Star, Flame, Sun, AlertCircle, Timer, BookmarkCheck, Check, ExternalLink } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { QUIZ_CATEGORIES, BIBLE_QUIZ_LIST } from '../data/quizData';
import { WEEKLY_READING_PLAN } from '../data/weeklyReadingPlanData';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

export default function Quiz() {
  const { currentUser, showToast } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 메인 모드: 'category' (주제별 골든벨), 'daily' (오늘의 퀴즈), 'survival' (무한 서바이벌), 'wrongNotes' (오답노트)
  const [activeMode, setActiveMode] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [quizzes, setQuizzes] = useState(BIBLE_QUIZ_LIST);
  
  // 퀴즈 진행 상태
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  
  // 힌트 모달 상태
  const [showHintModal, setShowHintModal] = useState(false);
  const [showReadingBriefing, setShowReadingBriefing] = useState(true);

  // 서바이벌 모드 상태 (15초 타이머 & 콤보)
  const [survivalTimer, setSurvivalTimer] = useState(15);
  const [survivalCombo, setSurvivalCombo] = useState(0);
  const [isSurvivalOver, setIsSurvivalOver] = useState(false);
  const timerRef = useRef(null);

  // LocalStorage 데이터 상태
  const [talents, setTalents] = useState(() => {
    return parseInt(localStorage.getItem('user_talents') || '0', 10);
  });
  const [completedScores, setCompletedScores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quiz_completed_scores') || '{}');
    } catch {
      return {};
    }
  });
  const [wrongNotes, setWrongNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quiz_wrong_notes') || '[]');
    } catch {
      return [];
    }
  });
  const [bestSurvival, setBestSurvival] = useState(() => {
    return parseInt(localStorage.getItem('quiz_best_survival') || '0', 10);
  });
  const [dailyCompletedDate, setDailyCompletedDate] = useState(() => {
    return localStorage.getItem('daily_quiz_completed_date') || '';
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isDailyDoneToday = dailyCompletedDate === todayStr;

  // Plan 페이지 등에서 navigate로 넘어온 경우 카테고리 자동 선택
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  // 칭호 계산 함수
  const getRankTitle = (t) => {
    if (t >= 3000) return { title: '🏆 말씀 골든벨 마스터', color: '#eab308' };
    if (t >= 1500) return { title: '👑 지혜의 사역자', color: '#a855f7' };
    if (t >= 500)  return { title: '⚔️ 말씀의 용사', color: '#3b82f6' };
    if (t >= 100)  return { title: '🧭 말씀 탐험가', color: '#10b981' };
    return { title: '🌱 새싹 성도', color: '#84cc16' };
  };

  const rankInfo = getRankTitle(talents);

  // Firestore 실시간 관리자 퀴즈 동기화
  useEffect(() => {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setQuizzes([...loaded, ...BIBLE_QUIZ_LIST]);
      }
    }, (err) => console.warn('퀴즈 동기화:', err));

    return () => unsub();
  }, []);

  // 서바이벌 모드 타이머 처리
  useEffect(() => {
    if (activeMode === 'survival' && activeQuiz && !isAnswered && !showResult && !isSurvivalOver) {
      setSurvivalTimer(15);
      timerRef.current = setInterval(() => {
        setSurvivalTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSurvivalTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeMode, activeQuiz, currentIdx, isAnswered, showResult, isSurvivalOver]);

  // 서바이벌 시간 초과 처리
  const handleSurvivalTimeout = () => {
    setIsAnswered(true);
    setIsSurvivalOver(true);
    setShowResult(true);
    if (survivalCombo > bestSurvival) {
      setBestSurvival(survivalCombo);
      localStorage.setItem('quiz_best_survival', String(survivalCombo));
    }
  };

  // 카테고리별 필터링
  const filteredQuizzes = useMemo(() => {
    if (selectedCategory === '전체') return quizzes;
    return quizzes.filter(q => q.category === selectedCategory);
  }, [selectedCategory, quizzes]);

  // 4지선다 보기 무작위 셔플 헬퍼 (정답 번호가 1~4번에 고르게 분산)
  const prepareQuiz = (quiz) => {
    if (!quiz || !quiz.questions) return quiz;
    const shuffledQuestions = quiz.questions.map(q => {
      const correctText = q.options[q.correct];
      const shuffledOptions = [...q.options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      const newCorrect = shuffledOptions.indexOf(correctText);
      return {
        ...q,
        options: shuffledOptions,
        correct: newCorrect >= 0 ? newCorrect : 0
      };
    });
    return { ...quiz, questions: shuffledQuestions };
  };

  // 1. 일반/주제별 퀴즈 시작
  const handleStartQuiz = (quiz, mode = 'category') => {
    const readyQuiz = prepareQuiz(quiz);
    setActiveMode(mode);
    setActiveQuiz(readyQuiz);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
    setShowHintModal(false);
    setShowReadingBriefing(true);
    setIsSurvivalOver(false);
    if (mode === 'survival') {
      setSurvivalCombo(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. 오늘의 1분 퀴즈 시작 (오늘 날짜 시드로 매일 3문제 자동 추출)
  const handleStartDailyQuiz = () => {
    const allQuestions = [];
    BIBLE_QUIZ_LIST.forEach(set => {
      set.questions.forEach(q => allQuestions.push({ ...q, roundTitle: set.roundTitle }));
    });
    const dateNum = parseInt(todayStr.replace(/-/g, ''), 10);
    const q1 = allQuestions[dateNum % allQuestions.length];
    const q2 = allQuestions[(dateNum * 7) % allQuestions.length];
    const q3 = allQuestions[(dateNum * 13) % allQuestions.length];

    const dailyQuizObj = {
      id: `daily_${todayStr}`,
      category: '오늘의 퀴즈',
      roundTitle: `☀️ 오늘의 1분 말씀 퀴즈 (${todayStr})`,
      description: '매일 아침 3문제로 여는 은혜의 말씀 챌린지! 완료 시 +50 보너스 달란트',
      difficulty: '초급',
      questions: [q1, q2, q3]
    };
    handleStartQuiz(dailyQuizObj, 'daily');
  };

  // 3. 무한 서바이벌 골든벨 시작 (전체 문제 무작위 무한 출제)
  const handleStartSurvivalQuiz = () => {
    const allQuestions = [];
    BIBLE_QUIZ_LIST.forEach(set => {
      set.questions.forEach(q => allQuestions.push({ ...q, roundTitle: set.roundTitle }));
    });
    // Shuffle all questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const survivalQuizObj = {
      id: `survival_${Date.now()}`,
      category: '무한 서바이벌',
      roundTitle: '🔥 무한 서바이벌 골든벨',
      description: '1문제당 15초 카운트다운! 틀릴 때까지 연속 콤보에 도전하세요.',
      difficulty: '고급',
      questions: shuffled.slice(0, 100)
    };
    handleStartQuiz(survivalQuizObj, 'survival');
  };

  // 4. 오답노트 복습 퀴즈 시작
  const handleStartWrongNotesQuiz = () => {
    if (wrongNotes.length === 0) {
      if (showToast) showToast('복습할 오답이 없습니다! 🎉');
      return;
    }
    const wrongQuizObj = {
      id: `wrong_${Date.now()}`,
      category: '오답노트',
      roundTitle: `📝 나의 약점 집중 복습 (${wrongNotes.length}문제)`,
      description: '틀렸던 문제를 다시 풀고 완전히 내 말씀으로 만드세요!',
      difficulty: '맞춤',
      questions: wrongNotes
    };
    handleStartQuiz(wrongQuizObj, 'wrongNotes');
  };

  // 보기 선택 시 채점 & 달란트 및 오답노트 처리
  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(idx);

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = activeQuiz.questions[currentIdx];
    const isCorrect = idx === currentQ.correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      if (activeMode === 'survival') {
        const nextCombo = survivalCombo + 1;
        setSurvivalCombo(nextCombo);
        if (nextCombo > bestSurvival) {
          setBestSurvival(nextCombo);
          localStorage.setItem('quiz_best_survival', String(nextCombo));
        }
      }
      if (activeMode === 'wrongNotes') {
        const updated = wrongNotes.filter(w => w.question !== currentQ.question);
        setWrongNotes(updated);
        localStorage.setItem('quiz_wrong_notes', JSON.stringify(updated));
      }
    } else {
      const alreadySaved = wrongNotes.some(w => w.question === currentQ.question);
      if (!alreadySaved) {
        const newWrongItem = {
          question: currentQ.question,
          options: currentQ.options,
          correct: currentQ.correct,
          hintRef: currentQ.hintRef,
          hintText: currentQ.hintText,
          explanation: currentQ.explanation,
          savedAt: new Date().toISOString()
        };
        const updated = [newWrongItem, ...wrongNotes].slice(0, 100);
        setWrongNotes(updated);
        localStorage.setItem('quiz_wrong_notes', JSON.stringify(updated));
      }

      if (activeMode === 'survival') {
        setIsSurvivalOver(true);
      }
    }

    setUserAnswers(prev => [...prev, {
      question: currentQ.question,
      selected: idx,
      correct: currentQ.correct,
      isCorrect,
      explanation: currentQ.explanation,
      hintRef: currentQ.hintRef,
      hintText: currentQ.hintText,
      options: currentQ.options
    }]);
  };

  // 다음 문제로 이동
  const handleNext = () => {
    if (activeMode === 'survival' && isSurvivalOver) {
      setShowResult(true);
      return;
    }

    if (currentIdx + 1 < activeQuiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHintModal(false);
    } else {
      setShowResult(true);
      let earnedTalents = score * 10;
      if (activeMode === 'daily' && !isDailyDoneToday) {
        earnedTalents += 50;
        setDailyCompletedDate(todayStr);
        localStorage.setItem('daily_quiz_completed_date', todayStr);
      }
      if (earnedTalents > 0) {
        const nextTalents = talents + earnedTalents;
        setTalents(nextTalents);
        localStorage.setItem('user_talents', String(nextTalents));
      }

      // 점수 저장
      if (activeQuiz.id && !activeQuiz.id.startsWith('survival_')) {
        const cappedScore = Math.min(score, activeQuiz.questions.length);
        const prevBest = completedScores[activeQuiz.id] || 0;
        if (cappedScore > prevBest) {
          const updated = { ...completedScores, [activeQuiz.id]: cappedScore };
          setCompletedScores(updated);
          localStorage.setItem('quiz_completed_scores', JSON.stringify(updated));
        }
      }
    }
  };

  // 결과 공유하기
  const handleShareResult = () => {
    const total = activeQuiz.questions.length;
    let shareText = '';
    if (activeMode === 'survival') {
      shareText = `🔥 [벧엘교회 무한 서바이벌 골든벨]\n연속 콤보 ${survivalCombo}문제 돌파 달성! 🏆\n나의 말씀 지식에 도전해 보세요!`;
    } else {
      shareText = `🏆 [벧엘교회 말씀 골든벨]\n${activeQuiz.roundTitle}\n\n제 점수는 ${score} / ${total}점 (${Math.round((score/total)*100)}점) 입니다! ✨\n함께 말씀 퀴즈에 도전해 보세요!`;
    }
    if (navigator.share) {
      navigator.share({
        title: '벧엘교회 말씀 골든벨 퀴즈 결과',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      if (showToast) showToast('퀴즈 결과가 복사되었습니다! 카톡에 붙여넣어 공유해보세요. 💬');
    }
  };

  const currentQ = activeQuiz?.questions[currentIdx];

  // 활성 퀴즈가 52주 통독인지 확인
  const activeWeeklyPlan = useMemo(() => {
    if (!activeQuiz || !activeQuiz.id || !activeQuiz.id.startsWith('week_')) return null;
    const weekNum = parseInt(activeQuiz.id.replace('week_', ''), 10);
    return WEEKLY_READING_PLAN.find(w => w.week === weekNum);
  }, [activeQuiz]);

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '840px', margin: '0 auto' }}>
      {/* 1. 상단 타이틀 & 칭호 & 달란트 정보 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', margin: 0, lineHeight: 1.2 }}>
            <Trophy color="var(--accent-gold)" /> 말씀 골든벨 & 성경 퀴즈
          </h1>
          <p style={{ fontSize: 'clamp(0.8rem, 2.4vw, 0.85rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5, wordBreak: 'keep-all', margin: '4px 0 0 0' }}>
            총 {quizzes.length}세트 4,000여 문제 완비! 52주 통독 15제 심층 퀴즈와 성경 66권 전권, 90대 인물 열전 본문 읽기 연동으로 말씀을 마스터하세요.
          </p>
        </div>

        {/* 내 말씀 달란트 & 칭호 뱃지 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${rankInfo.color}66`,
            padding: '5px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px',
            color: rankInfo.color, fontWeight: 800, fontSize: '0.8rem', flexShrink: 0
          }}>
            {rankInfo.title}
          </div>
          <div style={{
            background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)',
            padding: '5px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px',
            color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0
          }}>
            💰 {talents} 달란트
          </div>
        </div>
      </div>

      {/* 2. 메인 모드 선택 탭 (주제별 골든벨, 오늘의 퀴즈, 무한 서바이벌, 오답노트) */}
      {!activeQuiz && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px', marginBottom: '1.5rem'
        }}>
          {/* 오늘의 1분 퀴즈 */}
          <button
            onClick={handleStartDailyQuiz}
            style={{
              padding: '12px 10px', borderRadius: '14px',
              background: isDailyDoneToday ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(20,20,24,0.8) 100%)',
              border: isDailyDoneToday ? '1px solid var(--glass-border)' : '1px solid rgba(234,179,8,0.5)',
              color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sun size={14} /> 오늘의 퀴즈
              </span>
              {isDailyDoneToday && <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 800 }}>완료됨 ✓</span>}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>매일 3문제 챌린지</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>+50 달란트 보너스</span>
          </button>

          {/* 무한 서바이벌 */}
          <button
            onClick={handleStartSurvivalQuiz}
            style={{
              padding: '12px 10px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(20,20,24,0.8) 100%)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={14} /> 무한 서바이벌
              </span>
              <span style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: 800 }}>최고 {bestSurvival}콤보</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>15초 타임어택</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>틀릴 때까지 무한 도전</span>
          </button>

          {/* 오답노트 복습 */}
          <button
            onClick={handleStartWrongNotesQuiz}
            style={{
              padding: '12px 10px', borderRadius: '14px',
              background: wrongNotes.length > 0 ? 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(20,20,24,0.8) 100%)' : 'rgba(255,255,255,0.04)',
              border: wrongNotes.length > 0 ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--glass-border)',
              color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookmarkCheck size={14} /> 오답노트 복습
              </span>
              <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 800 }}>{wrongNotes.length}개</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>틀린 문제 마스터</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>정답 시 자동 삭제</span>
          </button>
        </div>
      )}

      {/* 3. 메인 화면 / 카테고리 탭 & 퀴즈 카드 목록 */}
      {!activeQuiz ? (
        <div>
          {/* 카테고리 수평 스크롤 칩 */}
          <div style={{
            display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px',
            marginBottom: '1rem', scrollbarWidth: 'none'
          }}>
            {QUIZ_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px', borderRadius: '20px', border: 'none',
                  background: selectedCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                  color: selectedCategory === cat ? '#111' : 'var(--text-secondary)',
                  fontWeight: selectedCategory === cat ? 800 : 500, fontSize: '0.82rem',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 52주 통독 안내 배너 (해당 카테고리 선택 시) */}
          {selectedCategory === "🌟 주간 골든벨 (52주)" && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(20,20,24,0.85) 100%)',
              border: '1px solid rgba(212,175,55,0.35)', borderRadius: '16px',
              padding: '14px 18px', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
            }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} /> 52주 성경 통독 연계 퀴즈 시스템
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, wordBreak: 'keep-all' }}>
                  각 주차별 성경 본문을 먼저 읽고 묵상하신 후 퀴즈를 푸시면 말씀이 마음에 더욱 깊이 새겨집니다.
                </p>
              </div>
              <button
                onClick={() => navigate('/plan')}
                style={{
                  padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--glass-border)', color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                📅 전체 통독표 보기
              </button>
            </div>
          )}

          {/* 퀴즈 세트 그리드 */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px'
          }}>
            {filteredQuizzes.map((q) => {
              const rawBestScore = completedScores[q.id];
              const bestScore = rawBestScore !== undefined ? Math.min(rawBestScore, q.questions.length) : undefined;
              const isPerfect = bestScore !== undefined && bestScore === q.questions.length;
              
              // 52주 통독 플랜 매핑
              const isWeekly = q.category === "🌟 주간 골든벨 (52주)";
              const weekNum = isWeekly ? parseInt(q.id.replace('week_', ''), 10) : null;
              const weeklyPlan = isWeekly ? WEEKLY_READING_PLAN.find(w => w.week === weekNum) : null;

              return (
                <motion.div
                  key={q.id}
                  whileHover={{ y: -2 }}
                  className="glass-card"
                  onClick={() => handleStartQuiz(q)}
                  style={{
                    padding: '14px 16px', borderRadius: '16px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    gap: '10px', border: isPerfect ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                    position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s'
                  }}
                >
                  {isPerfect && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      background: 'var(--accent-gold)', color: '#111',
                      fontSize: '10px', fontWeight: 800, padding: '2px 10px',
                      borderBottomLeftRadius: '10px'
                    }}>
                      ⭐ 만점 완료
                    </div>
                  )}

                  <div>
                    {/* 상단 태그 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                        padding: '2px 8px', borderRadius: '6px'
                      }}>
                        {q.category.replace(/^[^\s]+\s*/, '')}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        background: q.difficulty === '초급' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                        color: q.difficulty === '초급' ? '#4ade80' : 'var(--accent-gold)',
                        padding: '2px 8px', borderRadius: '6px'
                      }}>
                        {q.difficulty || '초급'}
                      </span>
                    </div>

                    {/* 퀴즈 제목 */}
                    <h3 style={{
                      margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)',
                      lineHeight: 1.4, wordBreak: 'keep-all'
                    }}>
                      {q.roundTitle}
                    </h3>
                    <p style={{
                      margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)',
                      lineHeight: 1.45, wordBreak: 'keep-all'
                    }}>
                      {q.description}
                    </p>

                    {/* 성경 본문 읽기 연동 배너 & 버튼 (모든 카테고리 지원) */}
                    {(() => {
                      const readBookName = q.bookName || weeklyPlan?.bookName;
                      const readChapter = q.startChapter || weeklyPlan?.startChapter || 1;
                      const readRange = q.range || weeklyPlan?.range || (readBookName ? `${readBookName} ${readChapter}장~` : null);

                      if (!readBookName && !readRange) return null;

                      return (
                        <div style={{
                          marginTop: '10px', padding: '8px 10px', borderRadius: '10px',
                          background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px'
                        }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <BookOpen size={13} /> {readRange}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/read', { state: { bookName: readBookName, chapter: readChapter } });
                            }}
                            style={{
                              fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                              background: 'var(--accent-gold)', color: '#111', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '3px'
                            }}
                          >
                            📖 본문 먼저 읽기
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 하단 도전 버튼 & 점수 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      총 {q.questions.length}문제
                      {bestScore !== undefined && ` • 최고 ${bestScore}/${q.questions.length}점`}
                    </span>
                    <span style={{
                      fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)',
                      display: 'flex', alignItems: 'center', gap: '2px'
                    }}>
                      퀴즈 도전 <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 4. 퀴즈 진행 / 결과 화면 */
        <div>
          {/* 상단 뒤로가기 바 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <button
              onClick={() => setActiveQuiz(null)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)', color: 'var(--text-secondary)',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> 퀴즈 목록으로
            </button>

            {/* 성경 본문 읽기 바로가기 (모든 카테고리 지원) */}
            {(() => {
              const activeBookName = activeQuiz?.bookName || activeWeeklyPlan?.bookName;
              const activeChapter = activeQuiz?.startChapter || activeWeeklyPlan?.startChapter || 1;
              if (!activeBookName) return null;
              return (
                <button
                  onClick={() => navigate('/read', { state: { bookName: activeBookName, chapter: activeChapter } })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.4)', color: 'var(--accent-gold)',
                    fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  <BookOpen size={14} /> 본문 읽으러 가기 ({activeBookName})
                </button>
              );
            })()}
          </div>

          {/* 52주차 통독 묵상 브리핑 가이드 (퀴즈 상단에 접기/펼치기 가능) */}
          {activeWeeklyPlan && showReadingBriefing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(20,20,24,0.95) 100%)',
                border: '1px solid rgba(212,175,55,0.35)', borderRadius: '16px',
                padding: '16px', marginBottom: '16px', position: 'relative'
              }}
            >
              <button
                onClick={() => setShowReadingBriefing(false)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
                <BookOpen size={16} /> 📖 이번 주 통독 범위: {activeWeeklyPlan.range}
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                💡 <strong>핵심 묵상 포인트:</strong> {activeWeeklyPlan.theme}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                {activeWeeklyPlan.keyPoints.map((pt, pIdx) => (
                  <div key={pIdx} style={{ fontSize: '0.78rem', color: '#e5e7eb', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--accent-gold)' }}>•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/read', { state: { bookName: activeWeeklyPlan.bookName, chapter: activeWeeklyPlan.startChapter } })}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', background: 'var(--accent-gold)',
                    color: '#111', fontWeight: 800, fontSize: '0.78rem', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <BookOpen size={13} /> 본문 먼저 읽기 ({activeWeeklyPlan.bookName} {activeWeeklyPlan.startChapter}장~)
                </button>
                <button
                  onClick={() => setShowReadingBriefing(false)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)',
                    color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: '1px solid var(--glass-border)', cursor: 'pointer'
                  }}
                >
                  🔥 준비완료! 퀴즈 풀기
                </button>
              </div>
            </motion.div>
          )}

          {!showResult ? (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card"
              style={{ padding: 'clamp(1.2rem, 3vw, 2rem)', borderRadius: '20px', position: 'relative' }}
            >
              {/* 상단 진행률 바 및 서바이벌 타이머 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {activeQuiz.roundTitle} • 문제 {currentIdx + 1} / {activeQuiz.questions.length}
                </span>

                {activeMode === 'survival' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: survivalTimer <= 5 ? '#ef4444' : '#f59e0b', fontWeight: 800, fontSize: '0.9rem' }}>
                    <Timer size={16} /> {survivalTimer}초 • 🔥 콤보: {survivalCombo}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    현재 점수: {score}점
                  </span>
                )}
              </div>

              {/* 진행 바 */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                <div style={{
                  width: activeMode === 'survival' ? `${(survivalTimer / 15) * 100}%` : `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%`,
                  height: '100%',
                  background: activeMode === 'survival' ? (survivalTimer <= 5 ? '#ef4444' : '#f59e0b') : 'var(--accent-gold)',
                  borderRadius: '3px', transition: 'width 0.3s'
                }} />
              </div>

              {/* 문제 질문 + 📖 성경 힌트 보기 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{
                  fontSize: 'clamp(1.05rem, 3.2vw, 1.3rem)', fontWeight: 800, color: 'var(--text-primary)',
                  lineHeight: 1.6, margin: 0, wordBreak: 'keep-all', flex: 1
                }}>
                  Q{currentIdx + 1}. {currentQ?.question}
                </h2>

                {/* 힌트 버튼 */}
                {currentQ?.hintText && (
                  <button
                    onClick={() => setShowHintModal(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '6px 10px', borderRadius: '10px',
                      background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)',
                      color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                      flexShrink: 0, whiteSpace: 'nowrap'
                    }}
                  >
                    <BookOpen size={13} /> 힌트 보기
                  </button>
                )}
              </div>

              {/* 힌트 모달 / 팝업 */}
              <AnimatePresence>
                {showHintModal && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(20, 20, 24, 0.95) 100%)',
                      border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '14px',
                      padding: '14px 16px', marginBottom: '20px', position: 'relative'
                    }}
                  >
                    <button
                      onClick={() => setShowHintModal(false)}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '6px' }}>
                      <BookOpen size={15} /> 📖 성경 말씀 힌트: {currentQ?.hintRef}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#fff', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                      "{currentQ?.hintText}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 보기 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {currentQ?.options?.map((opt, idx) => {
                  let btnBg = 'rgba(255, 255, 255, 0.04)';
                  let btnBorder = '1px solid var(--glass-border)';
                  let textColor = 'var(--text-primary)';
                  let icon = null;

                  if (isAnswered) {
                    if (idx === currentQ.correct) {
                      btnBg = 'rgba(34, 197, 94, 0.18)';
                      btnBorder = '2px solid #22c55e';
                      textColor = '#4ade80';
                      icon = <CheckCircle2 size={18} color="#22c55e" />;
                    } else if (idx === selectedOption) {
                      btnBg = 'rgba(239, 68, 68, 0.18)';
                      btnBorder = '2px solid #ef4444';
                      textColor = '#f87171';
                      icon = <XCircle size={18} color="#ef4444" />;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      style={{
                        padding: '14px 18px', borderRadius: '14px', background: btnBg, border: btnBorder,
                        color: textColor, textAlign: 'left', fontSize: 'clamp(0.88rem, 2.4vw, 0.98rem)',
                        fontWeight: 600, cursor: isAnswered ? 'default' : 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.15s', outline: 'none', lineHeight: 1.4, wordBreak: 'keep-all'
                      }}
                    >
                      <span>{idx + 1}. {opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* 정답 해설 카드 (답 선택 시 노출) */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: selectedOption === currentQ.correct ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: selectedOption === currentQ.correct ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '16px', borderRadius: '14px', marginBottom: '20px'
                    }}
                  >
                    <p style={{
                      margin: 0, fontWeight: 800, fontSize: '0.95rem',
                      color: selectedOption === currentQ.correct ? '#4ade80' : '#f87171',
                      display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px'
                    }}>
                      {selectedOption === currentQ.correct ? '🎉 정답입니다!' : '💧 아쉽습니다! 오답입니다.'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                      💡 {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 다음 버튼 */}
              {isAnswered && (
                <button
                  onClick={handleNext}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '14px',
                    background: 'var(--accent-gold)', color: '#111',
                    fontSize: '1rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                  }}
                >
                  {currentIdx + 1 < activeQuiz.questions.length ? '다음 문제 풀기 ➔' : '결과 확인하기 🏆'}
                </button>
              )}
            </motion.div>
          ) : (
            /* 5. 퀴즈 최종 결과 화면 */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '20px', textAlign: 'center' }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>
                {activeMode === 'survival' ? '🔥' : (score === activeQuiz.questions.length ? '👑' : (score >= activeQuiz.questions.length / 2 ? '🎉' : '📖'))}
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {activeMode === 'survival' ? '서바이벌 도전 완료!' : '말씀 퀴즈 완료!'}
              </h2>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '8px 0 20px' }}>
                {activeQuiz.roundTitle}
              </p>

              {/* 점수 & 보상 카드 */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-around',
                alignItems: 'center', marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {activeMode === 'survival' ? '연속 콤보' : '최종 점수'}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {activeMode === 'survival' ? `${survivalCombo}문제` : `${score} / ${activeQuiz.questions.length}`}
                  </div>
                </div>

                <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>획득 달란트</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ade80' }}>
                    +{activeMode === 'daily' && !isDailyDoneToday ? score * 10 + 50 : score * 10} 💰
                  </div>
                </div>
              </div>

              {/* 하단 액션 버튼들 */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleStartQuiz(activeQuiz, activeMode)}
                  style={{
                    flex: '1 1 140px', padding: '12px 18px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)',
                    color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                  }}
                >
                  <RotateCcw size={16} /> 다시 풀기
                </button>

                <button
                  onClick={handleShareResult}
                  style={{
                    flex: '1 1 140px', padding: '12px 18px', borderRadius: '12px',
                    background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)',
                    color: 'var(--accent-gold)', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Share2 size={16} /> 결과 공유
                </button>

                <button
                  onClick={() => setActiveQuiz(null)}
                  style={{
                    flex: '1 1 100%', padding: '12px 18px', borderRadius: '12px',
                    background: 'var(--accent-gold)', border: 'none',
                    color: '#111', fontSize: '0.92rem', fontWeight: 800, cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  다른 퀴즈 세트 도전하기 ➔
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
