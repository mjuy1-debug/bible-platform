// src/pages/Memorize.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, RefreshCw, Star, BookOpen, Trophy, Trash2, Lightbulb, 
  Volume2, VolumeX, Sparkles, CheckCircle2, ChevronRight, BookMarked,
  Layers, Key, Eye, EyeOff, RotateCcw, Share2, Copy, Check, Award
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { MEMORIZE_CATEGORIES, MEMORIZE_VERSES, getInitialConsonants } from '../data/memorizeVerses';

const STORAGE_KEY = 'memorize_records';

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function Memorize() {
  const location = useLocation();
  const { memorized = {}, toggleMemorized, showToast } = useContext(UserContext);

  // 기본 상태
  const [selectedVerse, setSelectedVerse] = useState(MEMORIZE_VERSES[0]);
  const [customVerse, setCustomVerse] = useState(MEMORIZE_VERSES[0].text);
  const [customRef, setCustomRef] = useState(MEMORIZE_VERSES[0].ref);
  const [activeCategory, setActiveCategory] = useState('essential');
  const [activeTab, setActiveTab] = useState('train'); // 'train' | 'library' | 'records' | 'tips'

  // 암송 훈련 모드 (1: 낭독/듣기, 2: 초성힌트, 3: 단어퍼즐, 4: 블라인드 마스터)
  const [trainingStage, setTrainingStage] = useState(1);
  const [trainingActive, setTrainingActive] = useState(false);

  // Step 1: TTS 오디오 상태
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loopCount, setLoopCount] = useState(3);
  const [currentLoop, setCurrentLoop] = useState(0);
  const synthRef = useRef(window.speechSynthesis);

  // Step 2 & 3: 단어 / 빈칸 / 퍼즐 상태
  const [words, setWords] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [wordBank, setWordBank] = useState([]);
  const [filledBlanks, setFilledBlanks] = useState({});
  const [currentBlankIdx, setCurrentBlankIdx] = useState(0);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 4: 블라인드 입력 상태
  const [blindInput, setBlindInput] = useState('');
  const [blindShowHint, setBlindShowHint] = useState(false);

  // 기록
  const [records, setRecords] = useState(loadRecords);
  const [copied, setCopied] = useState(false);

  // 외부(예: 성경 읽기)에서 넘어온 구절 처리
  useEffect(() => {
    if (location.state?.verse) {
      setCustomVerse(location.state.verse);
      setCustomRef(location.state.reference || '성경 구절');
      setSelectedVerse({
        id: 'custom_' + Date.now(),
        text: location.state.verse,
        ref: location.state.reference || '선택한 말씀',
        topic: '직접 선택'
      });
      setTrainingActive(false);
      setSuccess(false);
    }
  }, [location]);

  // 구절 변경 시 리셋
  const handleSelectVerse = (v) => {
    stopTTS();
    setSelectedVerse(v);
    setCustomVerse(v.text);
    setCustomRef(v.ref);
    setTrainingActive(false);
    setSuccess(false);
    setBlindInput('');
    setActiveTab('train');
  };

  // 훈련 시작
  const startStage = (stageNum) => {
    stopTTS();
    setTrainingStage(stageNum);
    setSuccess(false);
    setShake(false);
    setBlindInput('');

    const splitWords = customVerse.split(' ');
    setWords(splitWords);

    if (stageNum === 3) {
      // 3단계: 단어 퍼즐 모드 (50% 빈칸)
      const numBlanks = Math.max(1, Math.floor(splitWords.length * 0.5));
      const indices = Array.from({ length: splitWords.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const selected = indices.slice(0, numBlanks).sort((a, b) => a - b);
      setBlanks(selected);

      const bank = selected.map(i => splitWords[i]);
      for (let i = bank.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bank[i], bank[j]] = [bank[j], bank[i]];
      }
      setWordBank(bank);
      setFilledBlanks({});
      setCurrentBlankIdx(0);
    }

    setTrainingActive(true);
  };

  // 단어 뱅크 탭 핸들러 (3단계)
  const handleBankClick = (word, bankIdx) => {
    if (success) return;
    const targetWord = words[blanks[currentBlankIdx]];
    if (word === targetWord) {
      setFilledBlanks(prev => ({ ...prev, [blanks[currentBlankIdx]]: word }));
      const newBank = [...wordBank];
      newBank.splice(bankIdx, 1);
      setWordBank(newBank);

      if (currentBlankIdx + 1 === blanks.length) {
        setSuccess(true);
        triggerSuccess();
      } else {
        setCurrentBlankIdx(prev => prev + 1);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // 블라인드 입력 제출 (4단계)
  const handleBlindCheck = () => {
    const cleanOrig = customVerse.replace(/\s+/g, '').replace(/[.,!?;:~]/g, '');
    const cleanInput = blindInput.replace(/\s+/g, '').replace(/[.,!?;:~]/g, '');

    if (cleanInput === cleanOrig) {
      setSuccess(true);
      triggerSuccess();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      if (showToast) showToast('일부 글자가 다릅니다. 초성 힌트를 참고해보세요! 💡');
    }
  };

  // 성공 시 기록 저장
  const triggerSuccess = () => {
    const stageNames = { 1: '🎧 낭독 완료', 2: '💡 초성 암송', 3: '🧩 퍼즐 완성', 4: '👑 블라인드 마스터' };
    const newRec = {
      id: Date.now(),
      text: customVerse,
      ref: customRef,
      stage: stageNames[trainingStage] || '암송 완료',
      date: new Date().toLocaleDateString('ko-KR'),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newRec, ...records.filter(r => r.ref !== customRef || r.text !== customVerse)].slice(0, 50);
    setRecords(updated);
    saveRecords(updated);

    if (customRef && toggleMemorized) {
      toggleMemorized(customRef, true);
    }
  };

  // TTS 음성 재생
  const playTTS = (text) => {
    if (!window.speechSynthesis) {
      if (showToast) showToast('이 브라우저는 음성 낭독을 지원하지 않습니다.');
      return;
    }

    stopTTS();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.88; // 또박또박한 낭독 속도
    utterance.pitch = 1.0;

    let loopCounter = 0;
    utterance.onend = () => {
      loopCounter++;
      setCurrentLoop(loopCounter);
      if (loopCounter < loopCount) {
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
        setCurrentLoop(0);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    setCurrentLoop(1);
    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentLoop(0);
  };

  // 복사 기능
  const handleCopy = () => {
    const shareText = `[말씀 암송 완료! ✨]\n"${customVerse}"\n- ${customRef} -\n\n#말씀암송 #성경플랫폼`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    if (showToast) showToast('말씀 카드가 복사되었습니다! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // 암송 칭호 계산
  const getLevelTitle = (count) => {
    if (count >= 50) return { title: '👑 살아있는 말씀의 전당', badge: '최고 마스터' };
    if (count >= 30) return { title: '⚔️ 성령의 검', badge: '고급 암송자' };
    if (count >= 15) return { title: '🛡️ 지혜의 파수꾼', badge: '중급 암송자' };
    if (count >= 5) return { title: '🌱 말씀의 용사', badge: '성장하는 믿음' };
    return { title: '🌿 싹트는 믿음', badge: '암송 입문' };
  };

  const currentLevel = getLevelTitle(records.length);

  // 카테고리 필터링
  const filteredVerses = activeCategory === 'all'
    ? MEMORIZE_VERSES
    : MEMORIZE_VERSES.filter(v => v.category === activeCategory);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '3rem', color: 'var(--text-primary)' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1.2rem 1.5rem',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(20, 20, 28, 0.8) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111',
            boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)'
          }}>
            <Brain size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              말씀 암송 마스터
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
              {currentLevel.title} • {records.length}구절 암송 완료 🏆
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            const randomV = MEMORIZE_VERSES[Math.floor(Math.random() * MEMORIZE_VERSES.length)];
            handleSelectVerse(randomV);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={15} /> 추천 구절
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '1.5rem',
        background: 'var(--bg-secondary)',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid var(--glass-border)'
      }}>
        {[
          { key: 'train', label: '🎯 4단계 암송 훈련', icon: <Brain size={16} /> },
          { key: 'library', label: `📚 암송 구절집 (100구절)`, icon: <BookOpen size={16} /> },
          { key: 'records', label: `🏆 나의 기록 (${records.length})`, icon: <Trophy size={16} /> },
          { key: 'tips', label: '💡 암송 비법', icon: <Lightbulb size={16} /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              stopTTS();
              setActiveTab(tab.key);
            }}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === tab.key ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === tab.key ? '#111' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. 암송 훈련 탭 (4단계 시스템) ── */}
      {activeTab === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 현재 선택된 암송 구절 카드 */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                background: 'rgba(212, 175, 55, 0.12)',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                📖 {customRef || '성경 암송 구절'}
              </span>

              <button
                onClick={() => setActiveTab('library')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                다른 구절 고르기 <ChevronRight size={14} />
              </button>
            </div>

            {/* 4단계 스테이지 선택 버튼들 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '16px' }}>
              {[
                { stage: 1, title: '1단계 🎧 낭독/듣기', desc: '음성 반복 묵상' },
                { stage: 2, title: '2단계 💡 초성 힌트', desc: '초성 연상 훈련' },
                { stage: 3, title: '3단계 🧩 단어 퍼즐', desc: '블록 조립 훈련' },
                { stage: 4, title: '4단계 👑 마스터 체크', desc: '블라인드 완성' }
              ].map(s => (
                <button
                  key={s.stage}
                  onClick={() => startStage(s.stage)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '12px',
                    border: `1.5px solid ${trainingStage === s.stage && trainingActive ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                    background: trainingStage === s.stage && trainingActive ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: trainingStage === s.stage && trainingActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>{s.title}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{s.desc}</span>
                </button>
              ))}
            </div>

            {/* ── STAGE 1: 낭독 및 오디오 루프 모드 ── */}
            {trainingStage === 1 && (
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <p style={{
                  fontSize: '1.25rem',
                  lineHeight: '2.0',
                  fontWeight: 700,
                  margin: 0,
                  color: isSpeaking ? 'var(--accent-gold)' : 'var(--text-primary)',
                  wordBreak: 'keep-all'
                }}>
                  "{customVerse}"
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '8px'
                }}>
                  {/* 반복 횟수 선택 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>반복:</span>
                    {[1, 3, 5, 10].map(cnt => (
                      <button
                        key={cnt}
                        onClick={() => setLoopCount(cnt)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${loopCount === cnt ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                          background: loopCount === cnt ? 'var(--accent-gold)' : 'transparent',
                          color: loopCount === cnt ? '#111' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {cnt}회
                      </button>
                    ))}
                  </div>

                  {/* 오디오 재생 버튼 */}
                  <button
                    onClick={() => {
                      if (isSpeaking) stopTTS();
                      else playTTS(customVerse);
                    }}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '12px',
                      background: isSpeaking ? '#ef4444' : 'var(--accent-gold)',
                      border: 'none',
                      color: isSpeaking ? '#fff' : '#111',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    {isSpeaking ? <><VolumeX size={18} /> 낭독 중지 ({currentLoop}/{loopCount})</> : <><Volume2 size={18} /> 🎧 {loopCount}회 반복 듣기</>}
                  </button>

                  <button
                    onClick={() => startStage(2)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    다음 단계 (초성 힌트) 👉
                  </button>
                </div>
              </div>
            )}

            {/* ── STAGE 2: 초성 힌트 모드 ── */}
            {trainingStage === 2 && (
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                    💡 초성을 보고 소리 내어 말씀을 외워보세요!
                  </span>
                  <button
                    onClick={() => setBlindShowHint(!blindShowHint)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {blindShowHint ? <EyeOff size={15} /> : <Eye size={15} />}
                    {blindShowHint ? '정답 숨기기' : '정답 슬쩍보기'}
                  </button>
                </div>

                {/* 초성 변환 텍스트 */}
                <div style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  fontSize: '1.35rem',
                  lineHeight: '2.2',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'var(--accent-gold)',
                  textAlign: 'center',
                  wordBreak: 'keep-all'
                }}>
                  {getInitialConsonants(customVerse)}
                </div>

                {blindShowHint && (
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                    원문: {customVerse}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
                  <button
                    onClick={() => {
                      triggerSuccess();
                      setSuccess(true);
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      background: 'var(--accent-gold)',
                      border: 'none',
                      color: '#111',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    🎉 초성 보고 다 외웠어요!
                  </button>
                  <button
                    onClick={() => startStage(3)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    다음 단계 (단어 퍼즐) 👉
                  </button>
                </div>
              </div>
            )}

            {/* ── STAGE 3: 단어 조각 퍼즐 모드 ── */}
            {trainingStage === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <motion.div
                  animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: shake ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                    fontSize: '1.18rem',
                    lineHeight: '2.6',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'baseline',
                    gap: '0.3rem 0.4rem',
                    wordBreak: 'keep-all'
                  }}
                >
                  {words.map((word, i) => {
                    const isBlank = blanks.includes(i);
                    const isFilled = filledBlanks[i] !== undefined;
                    const isCurrent = blanks[currentBlankIdx] === i;

                    if (!isBlank || isFilled) {
                      return (
                        <span key={i} style={{
                          color: isFilled ? 'var(--accent-gold)' : 'var(--text-primary)',
                          fontWeight: isFilled ? 800 : 500,
                          transition: 'color 0.3s'
                        }}>
                          {isFilled ? filledBlanks[i] : word}
                        </span>
                      );
                    }

                    return (
                      <span key={i} style={{
                        display: 'inline-block',
                        minWidth: `${word.length * 0.9 + 1.2}rem`,
                        height: '1.8rem',
                        borderBottom: `2.5px solid ${isCurrent ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)'}`,
                        backgroundColor: isCurrent ? 'rgba(212,175,55,0.18)' : 'transparent',
                        verticalAlign: 'middle',
                        borderRadius: '4px',
                        transition: 'all 0.25s'
                      }} />
                    );
                  })}
                </motion.div>

                {/* 흩어진 단어 뱅크 */}
                {!success && (
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      🧩 알맞은 단어를 순서대로 탭하세요:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <AnimatePresence>
                        {wordBank.map((word, idx) => (
                          <motion.button
                            key={`${word}-${idx}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => handleBankClick(word, idx)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '10px',
                              background: 'var(--bg-primary)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: 'var(--text-primary)',
                              fontSize: '1rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}
                            whileHover={{ scale: 1.05, borderColor: 'var(--accent-gold)' }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {word}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STAGE 4: 블라인드 마스터 체크 모드 ── */}
            {trainingStage === 4 && (
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                    👑 블라인드 마스터 챌린지 (전체 문장을 타이핑해보세요)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    띄어쓰기나 부호는 자유롭게 입력하셔도 됩니다
                  </span>
                </div>

                <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
                  <textarea
                    value={blindInput}
                    onChange={(e) => setBlindInput(e.target.value)}
                    placeholder="외운 말씀을 여기에 처음부터 끝까지 입력해보세요..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: shake ? '2px solid #ef4444' : '1px solid rgba(212, 175, 55, 0.4)',
                      color: 'var(--text-primary)',
                      fontSize: '1.05rem',
                      lineHeight: '1.8',
                      boxSizing: 'border-box',
                      resize: 'none',
                      wordBreak: 'keep-all'
                    }}
                  />
                </motion.div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    onClick={() => setBlindShowHint(!blindShowHint)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-gold)',
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {blindShowHint ? `힌트 숨기기` : `💡 초성 힌트 보기: ${getInitialConsonants(customVerse).slice(0, 15)}...`}
                  </button>

                  <button
                    onClick={handleBlindCheck}
                    disabled={!blindInput.trim()}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '12px',
                      background: 'var(--accent-gold)',
                      border: 'none',
                      color: '#111',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: blindInput.trim() ? 'pointer' : 'not-allowed',
                      opacity: blindInput.trim() ? 1 : 0.5,
                      boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)'
                    }}
                  >
                    ✅ 암송 검증하기
                  </button>
                </div>

                {blindShowHint && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    fontSize: '0.9rem',
                    color: 'var(--accent-gold)',
                    letterSpacing: '0.08em'
                  }}>
                    {getInitialConsonants(customVerse)}
                  </div>
                )}
              </div>
            )}

            {/* ── 성공 시 축하 & 말씀 인증 카드 ── */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                  padding: '28px 20px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(20, 20, 28, 0.95) 100%)',
                  border: '2px solid var(--accent-gold)',
                  boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  marginTop: '16px'
                }}
              >
                <div style={{ fontSize: '3.5rem' }}>🎉 🏆 ✨</div>
                <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  말씀 암송 완벽 달성!
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px' }}>
                  거룩한 생명의 말씀이 마음에 깊이 새겨졌습니다.
                </p>

                {/* 말씀 카드 프리뷰 */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  maxWidth: '460px',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.7', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>
                    "{customVerse}"
                  </p>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                    - {customRef} -
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {copied ? <Check size={16} color="var(--accent-gold)" /> : <Copy size={16} />}
                    {copied ? '복사 완료!' : '말씀 카드 복사'}
                  </button>

                  <button
                    onClick={() => {
                      const randomV = MEMORIZE_VERSES[Math.floor(Math.random() * MEMORIZE_VERSES.length)];
                      handleSelectVerse(randomV);
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'var(--accent-gold)',
                      border: 'none',
                      color: '#111',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    다음 말씀 암송하기 🚀
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. 암송 구절집 탭 (60개 마스터팩) ── */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 카테고리 필터 바 */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
            {MEMORIZE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${activeCategory === cat.id ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                  background: activeCategory === cat.id ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                  color: activeCategory === cat.id ? '#111' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 구절 목록 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {filteredVerses.map(v => {
              const isMemorized = memorized[v.ref];
              const isCurrent = selectedVerse.ref === v.ref;

              return (
                <motion.div
                  key={v.id}
                  whileHover={{ y: -2 }}
                  onClick={() => handleSelectVerse(v)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: isCurrent ? 'rgba(212, 175, 55, 0.12)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${isCurrent ? 'var(--accent-gold)' : isMemorized ? 'rgba(212, 175, 55, 0.4)' : 'var(--glass-border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        {v.ref}
                      </span>
                      {isMemorized && (
                        <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                          ✓ 암송완료
                        </span>
                      )}
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.84rem',
                      lineHeight: '1.55',
                      color: 'var(--text-primary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {v.text}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>🏷️ {v.topic}</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>훈련하기 👉</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. 나의 기록 탭 ── */}
      {activeTab === 'records' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {currentLevel.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                총 {records.length}개의 말씀 암송 완료 기록
              </div>
            </div>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--accent-gold)'
            }}>
              🏆 {records.length}회 완주
            </span>
          </div>

          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Trophy size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>아직 암송 완료 기록이 없습니다.</p>
              <button
                onClick={() => setActiveTab('train')}
                style={{
                  marginTop: '10px',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: 'var(--accent-gold)',
                  border: 'none',
                  color: '#111',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                첫 암송 훈련 시작하기
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {records.map(r => (
                <div
                  key={r.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        {r.ref}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                        {r.stage}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {r.text.length > 55 ? r.text.slice(0, 55) + '...' : r.text}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                      {r.date} {r.time}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const updated = records.filter(item => item.id !== r.id);
                      setRecords(updated);
                      saveRecords(updated);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. 암송 팁 탭 ── */}
      {activeTab === 'tips' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { emoji: '💡', title: '초성 암송법 (최고의 뇌 자극)', desc: '글자의 초성(예: ㅎㄴㄴㅇ ㅅㅅㅇ)만 보면서 단어를 입 밖으로 내뱉는 훈련은 뇌의 해마를 가장 강력하게 자극하여 3배 오래 기억됩니다.' },
            { emoji: '🔁', title: '에빙하우스 망각곡선 이기기', desc: '외운 직후 → 1일 후 → 3일 후 → 7일 후 1분씩만 복습하면 평생 잊혀지지 않는 장기 기억으로 저장됩니다.' },
            { emoji: '🎧', title: '귀로 듣는 핸즈프리 낭독', desc: '출퇴근길이나 잠들기 전 5~10회 반복 낭독 오디오를 켜두세요. 시각과 청각이 결합되면 암송 속도가 훨씬 빨라집니다.' },
            { emoji: '✍️', title: '손으로 백지 쓰기/타이핑', desc: '마지막 단계로 아무것도 보지 않고 타이핑하거나 손으로 적어보면 내가 완벽히 외웠는지 확실하게 점검할 수 있습니다.' }
          ].map((t, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start'
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{t.emoji}</span>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: 'var(--accent-gold)' }}>{t.title}</h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
