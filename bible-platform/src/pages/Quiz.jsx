import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, XCircle, Sparkles, Trophy, RotateCcw, Share2, HelpCircle, Plus, Edit, Trash2, ChevronRight, X, ArrowLeft, BookOpen, Star, Flame, Sun, AlertCircle, Timer, BookmarkCheck, Check } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { QUIZ_CATEGORIES, BIBLE_QUIZ_LIST } from '../data/quizData';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

export default function Quiz() {
  const { currentUser, showToast } = useContext(UserContext);
  
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

  // 3. 무한 서바이벌 골든벨 시작 (전체 문제 중 무작위 50문제 세트 생성)
  const handleStartSurvival = () => {
    const allQuestions = [];
    BIBLE_QUIZ_LIST.forEach(set => {
      set.questions.forEach(q => allQuestions.push({ ...q, roundTitle: set.roundTitle }));
    });
    const shuffledPool = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 50);

    const survivalQuizObj = {
      id: 'survival_challenge',
      category: '무한 서바이벌',
      roundTitle: '🔥 무한 서바이벌 골든벨',
      description: '1문제당 15초 제한! 틀릴 때까지 연속 콤보에 도전하세요.',
      difficulty: '고급',
      questions: shuffledPool
    };

    handleStartQuiz(survivalQuizObj, 'survival');
  };

  // 4. 오답노트 복습 퀴즈 시작
  const handleStartWrongNotesQuiz = () => {
    if (wrongNotes.length === 0) {
      if (showToast) showToast('오답노트에 저장된 문제가 없습니다! 👏');
      return;
    }
    const wrongQuizObj = {
      id: 'wrong_notes_quiz',
      category: '오답노트 복습',
      roundTitle: `📝 오답노트 완벽 복습 (${wrongNotes.length}문제)`,
      description: '틀렸던 문제들을 다시 풀며 확실하게 내 말씀으로 마스터하세요!',
      difficulty: '중급',
      questions: wrongNotes.slice(0, 20)
    };

    handleStartQuiz(wrongQuizObj, 'wrongNotes');
  };

  const currentQ = activeQuiz?.questions?.[currentIdx];

  // 보기 선택 처리
  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    setIsAnswered(true);

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
      const updatedTalents = talents + earnedTalents;
      setTalents(updatedTalents);
      localStorage.setItem('user_talents', String(updatedTalents));

      if (activeMode === 'category') {
        const updatedScores = {
          ...completedScores,
          [activeQuiz.id]: Math.max(completedScores[activeQuiz.id] || 0, score + (selectedOption === currentQ.correct ? 1 : 0))
        };
        setCompletedScores(updatedScores);
        localStorage.setItem('quiz_completed_scores', JSON.stringify(updatedScores));
      }
    }
  };

  // 퀴즈 다시 시작
  const handleRestart = () => {
    if (activeQuiz) {
      setActiveQuiz(prepareQuiz(activeQuiz));
    }
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
    setShowHintModal(false);
    setIsSurvivalOver(false);
    if (activeMode === 'survival') setSurvivalCombo(0);
  };

  // 퀴즈 결과 카톡 공유
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

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '840px', margin: '0 auto' }}>
      {/* 1. 상단 타이틀 & 칭호 & 달란트 정보 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', margin: 0, lineHeight: 1.2 }}>
            <Trophy color="var(--accent-gold)" /> 말씀 골든벨 & 성경 퀴즈
          </h1>
          <p style={{ fontSize: 'clamp(0.8rem, 2.4vw, 0.85rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5, wordBreak: 'keep-all', margin: '4px 0 0 0' }}>
            총 346세트 1,730문제 완비! 성경 66권 전체와 매일 1분 퀴즈, 무한 서바이벌로 성경을 마스터하세요.
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
            background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.35)',
            padding: '5px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px',
            color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0
          }}>
            🪙 달란트: {talents}개
          </div>
        </div>
      </div>

      {/* 2. 문제 풀이 화면이 아닐 때: 4대 모드 탭 & 브라우저 */}
      {!activeQuiz ? (
        <div>
          {/* 4대 주요 학습 모드 배너 카드 (오늘의 퀴즈 / 서바이벌 / 오답노트) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {/* ① 오늘의 1분 퀴즈 */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={handleStartDailyQuiz}
              style={{
                background: isDailyDoneToday ? 'rgba(34, 197, 94, 0.08)' : 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.05) 100%)',
                border: isDailyDoneToday ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: '16px', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: isDailyDoneToday ? '#22c55e22' : '#eab30822',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Sun size={22} color={isDailyDoneToday ? '#22c55e' : '#eab308'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ☀️ 오늘의 1분 퀴즈
                  </h3>
                  {isDailyDoneToday && (
                    <span style={{ fontSize: '10px', background: '#22c55e', color: '#111', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>완료</span>
                  )}
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {isDailyDoneToday ? '오늘 미션 완료 (+50 달란트 획득)' : '매일 3문제 풀고 +50 보너스 달란트!'}
                </p>
              </div>
            </motion.div>

            {/* ② 무한 서바이벌 골든벨 */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={handleStartSurvival}
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '16px', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ef444422', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Flame size={22} color="#ef4444" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🔥 무한 서바이벌 골든벨
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  15초 타임어택! 최고 기록: {bestSurvival}연속 콤보
                </p>
              </div>
            </motion.div>

            {/* ③ 오답노트 & 약점 복습 */}
            <motion.div
              whileHover={{ y: -3 }}
              onClick={handleStartWrongNotesQuiz}
              style={{
                background: wrongNotes.length > 0 ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.05) 100%)' : 'rgba(255,255,255,0.03)',
                border: wrongNotes.length > 0 ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid var(--glass-border)',
                borderRadius: '16px', padding: '14px 16px', cursor: wrongNotes.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3b82f622', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookmarkCheck size={22} color="#3b82f6" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  📝 오답노트 복습 ({wrongNotes.length}문제)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {wrongNotes.length > 0 ? '틀린 문제만 모아서 완벽 마스터하기' : '틀린 문제가 아직 없습니다.'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* 주제별 카테고리 탭 바 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              📚 성경 전권 & 주제별 골든벨 ({filteredQuizzes.length}개 세트)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {QUIZ_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px', borderRadius: '18px', border: 'none', cursor: 'pointer',
                  background: selectedCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                  color: selectedCategory === cat ? '#111' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap',
                  boxShadow: selectedCategory === cat ? '0 2px 8px rgba(212, 175, 55, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 퀴즈 팩 그리드 목록 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {filteredQuizzes.map((q) => {
              const bestScore = completedScores[q.id];
              const isPerfect = bestScore === q.questions.length;

              return (
                <motion.div
                  key={q.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleStartQuiz(q, 'category')}
                  style={{
                    background: 'var(--glass-bg)',
                    border: isPerfect ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s'
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
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
                      margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)',
                      lineHeight: 1.45, wordBreak: 'keep-all'
                    }}>
                      {q.description}
                    </p>
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
                      도전하기 <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. 퀴즈 진행 / 결과 화면 */
        <div>
          {/* 상단 뒤로가기 바 */}
          <button
            onClick={() => setActiveQuiz(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--glass-border)', color: 'var(--text-secondary)',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginBottom: '16px'
            }}
          >
            <ArrowLeft size={14} /> 퀴즈 목록으로 돌아가기
          </button>

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
                      color: selectedOption === currentQ.correct ? '#22c55e' : '#ef4444',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      {selectedOption === currentQ.correct ? '🎉 정답입니다! (+10 달란트)' : (activeMode === 'survival' ? '💥 아쉽습니다! 서바이벌 도전 종료' : '😢 오답입니다! (오답노트에 자동 저장됨)')}
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                      📖 <strong>말씀 해설</strong>: {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 다음 문제 버튼 */}
              {isAnswered && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleNext}
                    style={{
                      padding: '12px 24px', borderRadius: '24px', background: 'var(--accent-gold)',
                      border: 'none', color: '#111', fontWeight: 800, fontSize: '0.95rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    {activeMode === 'survival' && isSurvivalOver ? '서바이벌 결과 확인 🏆' : currentIdx + 1 < activeQuiz.questions.length ? '다음 문제로 ▶' : '결과 확인하기 🏆'}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* 4. 퀴즈 결과 화면 */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '24px', textAlign: 'center' }}
            >
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: score === activeQuiz.questions.length ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                border: score === activeQuiz.questions.length ? '2px solid #22c55e' : '2px solid var(--accent-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)'
              }}>
                <Trophy size={36} color={score === activeQuiz.questions.length ? '#22c55e' : 'var(--accent-gold)'} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {activeMode === 'survival' ? `🔥 서바이벌 콤보: ${survivalCombo}문제 연속 돌파!` : score === activeQuiz.questions.length ? '🎉 골든벨 만점 달성!' : '수고하셨습니다! 👏'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px' }}>
                {activeQuiz.roundTitle}
              </p>

              {/* 점수 & 달란트 카드 */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                maxWidth: '360px', margin: '20px auto', padding: '16px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>맞힌 문제</p>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                    {score} / {activeQuiz.questions.length}
                  </h3>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>획득 달란트</p>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.5rem', color: '#4ade80', fontWeight: 800 }}>
                    +{score * 10 + (activeMode === 'daily' ? 50 : 0)} 🪙
                  </h3>
                </div>
              </div>

              {/* 문제별 복습 리스트 */}
              <div style={{ textAlign: 'left', marginTop: '24px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  ✦ 말씀 복습 노트
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userAnswers.map((ans, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px', borderRadius: '12px',
                        background: ans.isCorrect ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                        border: ans.isCorrect ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {ans.isCorrect ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="#ef4444" />}
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Q{idx + 1}. {ans.question}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, paddingLeft: '22px' }}>
                        정답: <strong style={{ color: '#4ade80' }}>{ans.options[ans.correct]}</strong> • {ans.explanation}
                      </p>
                      {ans.hintText && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: 'var(--accent-gold)', paddingLeft: '22px' }}>
                          📖 {ans.hintRef}: "{ans.hintText}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 하단 버튼 */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleRestart}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 18px', borderRadius: '20px', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.86rem'
                  }}
                >
                  <RotateCcw size={15} /> 다시 풀기
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 18px', borderRadius: '20px', background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--accent-gold)', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.86rem'
                  }}
                >
                  <BookOpen size={15} /> 다른 퀴즈 풀기
                </button>
                <button
                  onClick={handleShareResult}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '20px', background: 'var(--accent-gold)',
                    border: 'none', color: '#111', fontWeight: 800, cursor: 'pointer', fontSize: '0.86rem'
                  }}
                >
                  <Share2 size={15} /> 카톡 공유 💬
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
