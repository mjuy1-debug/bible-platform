import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, XCircle, Sparkles, Trophy, RotateCcw, Share2, HelpCircle, Plus, Edit, Trash2, ChevronRight, X, ArrowLeft, BookOpen, Star, Flame } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { QUIZ_CATEGORIES, BIBLE_QUIZ_LIST } from '../data/quizData';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

export default function Quiz() {
  const { currentUser, showToast } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [quizzes, setQuizzes] = useState(BIBLE_QUIZ_LIST);
  
  // 현재 진행 중인 퀴즈 (null이면 퀴즈 목록 화면, 객체이면 문제 풀이 화면)
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  // 내 말씀 달란트 및 푼 퀴즈 기록 (localStorage)
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

  // 관리자 여부
  const isAdmin = Boolean(
    currentUser && (
      currentUser.email?.includes('admin') || 
      currentUser.displayName?.includes('유정파파') ||
      currentUser.displayName?.includes('관리자')
    )
  );

  // Firestore에서 실시간 관리자 추가 퀴즈 불러오기
  useEffect(() => {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuizzes([...loaded, ...BIBLE_QUIZ_LIST]);
      }
    }, (err) => console.warn('퀴즈 불러오기:', err));

    return () => unsub();
  }, []);

  // 카테고리별 필터링
  const filteredQuizzes = useMemo(() => {
    if (selectedCategory === '전체') return quizzes;
    return quizzes.filter(q => q.category === selectedCategory);
  }, [selectedCategory, quizzes]);

  // 퀴즈 시작 시 4지선다 보기를 무작위로 섞어서 정답 번호(1~4번)를 항상 골고루 랜덤 배치하는 헬퍼
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

  // 퀴즈 시작하기
  const handleStartQuiz = (quiz) => {
    const readyQuiz = prepareQuiz(quiz);
    setActiveQuiz(readyQuiz);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQ = activeQuiz?.questions?.[currentIdx];

  // 보기 선택 처리
  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => [...prev, {
      question: currentQ.question,
      selected: idx,
      correct: currentQ.correct,
      isCorrect,
      explanation: currentQ.explanation,
      options: currentQ.options
    }]);
  };

  // 다음 문제로 이동
  const handleNext = () => {
    if (currentIdx + 1 < activeQuiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // 퀴즈 완료
      setShowResult(true);
      const finalScore = score + (selectedOption === currentQ.correct ? 1 : 0);
      const earnedTalents = finalScore * 10;
      const updatedTalents = talents + earnedTalents;
      setTalents(updatedTalents);
      localStorage.setItem('user_talents', String(updatedTalents));

      // 최고 점수 갱신 저장
      const updatedScores = {
        ...completedScores,
        [activeQuiz.id]: Math.max(completedScores[activeQuiz.id] || 0, finalScore)
      };
      setCompletedScores(updatedScores);
      localStorage.setItem('quiz_completed_scores', JSON.stringify(updatedScores));
    }
  };

  // 퀴즈 다시 시작 (다시 풀 때도 보기 순서 랜덤 재배치)
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
  };

  // 퀴즈 결과 카톡 공유
  const handleShareResult = () => {
    const total = activeQuiz.questions.length;
    const shareText = `🏆 [벧엘교회 말씀 골든벨]\n${activeQuiz.roundTitle}\n\n제 점수는 ${score} / ${total}점 (${Math.round((score/total)*100)}점) 입니다! ✨\n함께 말씀 퀴즈에 도전해 보세요!`;
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
    <div style={{ paddingBottom: '3rem', maxWidth: '820px', margin: '0 auto' }}>
      {/* 1. 상단 타이틀 & 소개 문구 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', margin: 0, lineHeight: 1.2 }}>
            <Trophy color="var(--accent-gold)" /> 말씀 골든벨 퀴즈
          </h1>
          <p style={{ fontSize: 'clamp(0.82rem, 2.5vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word', margin: '6px 0 0 0' }}>
            주일학교부터 어르신까지! 1년 52주 말씀과 주제별 성경 퀴즈로 재미있게 말씀을 배우고 달란트를 모아보세요.
          </p>
        </div>

        {/* 내 말씀 달란트 뱃지 */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px',
          color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0
        }}>
          🪙 보유 달란트: {talents}개
        </div>
      </div>

      {/* 2. 문제 풀이 화면이 아닐 때: 주제별 퀴즈 목록 브라우저 */}
      {!activeQuiz ? (
        <div>
          {/* 주제 카테고리 탭 바 */}
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
                  onClick={() => handleStartQuiz(q)}
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
                      margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)',
                      lineHeight: 1.4, wordBreak: 'keep-all'
                    }}>
                      {q.roundTitle}
                    </h3>
                    <p style={{
                      margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)',
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
              {/* 상단 진행률 바 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {activeQuiz.roundTitle} • 문제 {currentIdx + 1} / {activeQuiz.questions.length}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  현재 점수: {score}점
                </span>
              </div>

              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{
                  width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%`,
                  height: '100%', background: 'var(--accent-gold)', borderRadius: '3px', transition: 'width 0.3s'
                }} />
              </div>

              {/* 문제 질문 */}
              <h2 style={{
                fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 800, color: 'var(--text-primary)',
                lineHeight: 1.6, marginBottom: '24px', wordBreak: 'keep-all'
              }}>
                Q{currentIdx + 1}. {currentQ?.question}
              </h2>

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
                        color: textColor, textAlign: 'left', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
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
                      {selectedOption === currentQ.correct ? '🎉 정답입니다! (+10 달란트)' : '😢 아쉽네요! 정답을 확인해보세요.'}
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
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
                    {currentIdx + 1 < activeQuiz.questions.length ? '다음 문제로 ▶' : '결과 확인하기 🏆'}
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

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {score === activeQuiz.questions.length ? '🎉 골든벨 만점 달성!' : '수고하셨습니다! 👏'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                {activeQuiz.roundTitle}
              </p>

              {/* 점수 & 달란트 카드 */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                maxWidth: '360px', margin: '24px auto', padding: '16px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)'
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>맞힌 문제</p>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.6rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                    {score} / {activeQuiz.questions.length}
                  </h3>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>획득 달란트</p>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.6rem', color: '#4ade80', fontWeight: 800 }}>
                    +{score * 10} 🪙
                  </h3>
                </div>
              </div>

              {/* 문제별 복습 리스트 */}
              <div style={{ textAlign: 'left', marginTop: '24px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
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
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Q{idx + 1}. {ans.question}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, paddingLeft: '22px' }}>
                        정답: {ans.options[ans.correct]} • {ans.explanation}
                      </p>
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
                    cursor: 'pointer', fontSize: '0.88rem'
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
                    cursor: 'pointer', fontSize: '0.88rem'
                  }}
                >
                  <BookOpen size={15} /> 다른 퀴즈 풀기
                </button>
                <button
                  onClick={handleShareResult}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '20px', background: 'var(--accent-gold)',
                    border: 'none', color: '#111', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem'
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
