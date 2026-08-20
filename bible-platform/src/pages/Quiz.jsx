import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, XCircle, Sparkles, Trophy, RotateCcw, Share2, HelpCircle, Plus, Edit, Trash2, ChevronRight, X } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

// 기본 내장 퀴즈 세트 (매주 다양하게 도전 가능)
const DEFAULT_QUIZZES = [
  {
    id: 'default_1',
    roundTitle: '제1회 벧엘 말씀 골든벨 ✦ 천지창조와 믿음의 조상',
    week: '이번 주 퀴즈',
    questions: [
      {
        question: '하나님이 첫째 날에 창조하신 것은 무엇일까요?',
        options: ['빛', '해와 달', '물과 하늘', '사람과 동물'],
        correct: 0,
        explanation: '창세기 1장 3절에 "하나님이 이르시되 빛이 있으라 하시니 빛이 있었고"라고 기록되어 있습니다.'
      },
      {
        question: '아브라함이 백 세에 낳은 아들의 이름은 무엇일까요?',
        options: ['이스마엘', '이삭', '야곱', '요셉'],
        correct: 1,
        explanation: '창세기 21장 3절: "아브라함이 그에게 태어난 아들 곧 사라가 자기에게 낳은 아들을 이름하여 이삭이라 하였고"'
      },
      {
        question: '신약성경 27권 중 가장 첫 번째 책은 무엇일까요?',
        options: ['요한복음', '사도행전', '마태복음', '로마서'],
        correct: 2,
        explanation: '신약성경은 마태복음, 마가복음, 누가복음, 요한복음으로 시작합니다.'
      },
      {
        question: '성령의 9가지 열매 중 첫 번째 열매는 사랑이다. (O / X)',
        options: ['O (그렇다)', 'X (아니다)'],
        correct: 0,
        explanation: '갈라디아서 5장 22절: "오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과..."'
      },
      {
        question: '예수님께서 제자들에게 가르쳐 주신 기도의 명칭은 무엇일까요?',
        options: ['사도신경', '십계명', '주기도문', '축도'],
        correct: 2,
        explanation: '마태복음 6장 9~13절에 예수님이 친히 가르쳐 주신 주기도문이 기록되어 있습니다.'
      }
    ]
  }
];

export default function Quiz() {
  const { currentUser, showToast } = useContext(UserContext);
  const [quizzes, setQuizzes] = useState(DEFAULT_QUIZZES);
  const [selectedQuiz, setSelectedQuiz] = useState(DEFAULT_QUIZZES[0]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [talents, setTalents] = useState(() => {
    return parseInt(localStorage.getItem('user_talents') || '0', 10);
  });

  // 관리자 여부
  const isAdmin = Boolean(
    currentUser && (
      currentUser.email?.includes('admin') || 
      currentUser.displayName?.includes('유정파파') ||
      currentUser.displayName?.includes('관리자')
    )
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuestions, setNewQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }
  ]);

  // Firestore에서 실시간 퀴즈 목록 불러오기
  useEffect(() => {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuizzes([...loaded, ...DEFAULT_QUIZZES]);
        if (!selectedQuiz || selectedQuiz.id === 'default_1') {
          setSelectedQuiz(loaded[0] || DEFAULT_QUIZZES[0]);
        }
      }
    }, (err) => console.warn('퀴즈 불러오기:', err));

    return () => unsub();
  }, []);

  const currentQ = selectedQuiz?.questions?.[currentIdx];

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
    if (currentIdx + 1 < selectedQuiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // 퀴즈 완료
      setShowResult(true);
      const earnedTalents = (score + (selectedOption === currentQ.correct ? 1 : 0)) * 10;
      const updatedTalents = talents + earnedTalents;
      setTalents(updatedTalents);
      localStorage.setItem('user_talents', String(updatedTalents));
    }
  };

  // 퀴즈 다시 시작
  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
  };

  // 퀴즈 결과 카톡 공유
  const handleShareResult = () => {
    const total = selectedQuiz.questions.length;
    const shareText = `🏆 [벧엘교회 말씀 골든벨]\n${selectedQuiz.roundTitle}\n\n제 점수는 ${score} / ${total}점 (${Math.round((score/total)*100)}점) 입니다! ✨\n함께 말씀 퀴즈에 도전해 보세요!`;
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
    <div style={{ paddingBottom: '3rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* 1. 상단 타이틀 & 소개 문구 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', margin: 0, lineHeight: 1.2 }}>
            <Trophy color="var(--accent-gold)" /> 말씀 골든벨
          </h1>
          <p style={{ fontSize: 'clamp(0.82rem, 2.5vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word', margin: '6px 0 0 0' }}>
            매주 주일 설교와 성경 말씀에서 출제되는 재미있는 성경 퀴즈! 만점에 도전해보세요.
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

      {/* 2. 퀴즈 라운드 선택 바 */}
      {quizzes.length > 1 && !showResult && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
          {quizzes.map(q => (
            <button
              key={q.id}
              onClick={() => { setSelectedQuiz(q); handleRestart(); }}
              style={{
                padding: '6px 14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                background: selectedQuiz?.id === q.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                color: selectedQuiz?.id === q.id ? '#111' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap'
              }}
            >
              {q.roundTitle.slice(0, 18)}...
            </button>
          ))}
        </div>
      )}

      {/* 3. 퀴즈 진행 화면 */}
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
              문제 {currentIdx + 1} / {selectedQuiz?.questions?.length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              현재 점수: {score}점
            </span>
          </div>

          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{
              width: `${((currentIdx + 1) / selectedQuiz?.questions?.length) * 100}%`,
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
                {currentIdx + 1 < selectedQuiz.questions.length ? '다음 문제로 ▶' : '결과 확인하기 🏆'}
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
            background: score === selectedQuiz.questions.length ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 175, 55, 0.15)',
            border: score === selectedQuiz.questions.length ? '2px solid #22c55e' : '2px solid var(--accent-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)'
          }}>
            <Trophy size={36} color={score === selectedQuiz.questions.length ? '#22c55e' : 'var(--accent-gold)'} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {score === selectedQuiz.questions.length ? '🎉 골든벨 만점 달성!' : '수고하셨습니다! 👏'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            {selectedQuiz.roundTitle}
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
                {score} / {selectedQuiz.questions.length}
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
                padding: '10px 20px', borderRadius: '20px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: 700,
                cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              <RotateCcw size={15} /> 다시 풀기
            </button>
            <button
              onClick={handleShareResult}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 22px', borderRadius: '20px', background: 'var(--accent-gold)',
                border: 'none', color: '#111', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              <Share2 size={15} /> 친구에게 자랑하기 💬
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
