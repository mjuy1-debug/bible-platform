import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, Star, BookOpen, Trophy, Trash2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const VERSES = [
  { text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라", ref: "요한복음 3:16" },
  { text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13" },
  { text: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1" },
  { text: "태초에 하나님이 천지를 창조하시니라", ref: "창세기 1:1" },
  { text: "오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라", ref: "사도행전 1:8" },
  { text: "주 너의 하나님을 사랑하고 또한 네 이웃을 네 자신 같이 사랑하라", ref: "마태복음 22:37-39" },
  { text: "여호와를 경외하는 것이 지식의 근본이거늘 미련한 자는 지혜와 훈계를 멸시하느니라", ref: "잠언 1:7" },
  { text: "모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니라", ref: "디모데후서 3:16" },
];

const TIPS = [
  { emoji: "🔁", title: "반복이 핵심", desc: "같은 구절을 하루에 최소 7번 소리 내어 읽으세요. 귀로도 외워집니다." },
  { emoji: "✍️", title: "손으로 쓰기", desc: "말씀을 손으로 직접 써보세요. 쓰는 행위 자체가 기억력을 강화합니다." },
  { emoji: "🎵", title: "리듬/멜로디", desc: "말씀에 간단한 리듬이나 멜로디를 붙여 노래처럼 외우면 훨씬 오래 기억됩니다." },
  { emoji: "🌅", title: "아침 첫 시간", desc: "잠에서 깬 직후 5분이 기억력이 가장 높은 황금 시간입니다." },
  { emoji: "🔗", title: "이미지로 연상", desc: "말씀의 장면을 머릿속에 생생한 이미지로 그려보세요. 스토리텔링이 암기를 돕습니다." },
  { emoji: "📅", title: "복습 주기", desc: "당일 → 다음날 → 3일 후 → 1주 후 → 1달 후 복습. 망각 곡선을 이기세요!" },
];

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
  const [verse, setVerse] = useState("");
  const [reference, setReference] = useState("");
  const [difficulty, setDifficulty] = useState(0.25);
  const [trainingMode, setTrainingMode] = useState(false);
  const [words, setWords] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [wordBank, setWordBank] = useState([]);
  const [filledBlanks, setFilledBlanks] = useState({});
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [records, setRecords] = useState(loadRecords);
  const [activeTab, setActiveTab] = useState('train'); // 'train' | 'records' | 'tips'
  const [showTipIndex, setShowTipIndex] = useState(null);

  useEffect(() => {
    if (location.state?.verse) {
      setVerse(location.state.verse);
      if (location.state.reference) setReference(location.state.reference);
    }
  }, [location]);

  const loadRandomVerse = () => {
    const v = VERSES[Math.floor(Math.random() * VERSES.length)];
    setVerse(v.text);
    setReference(v.ref);
  };

  const startTraining = () => {
    if (!verse.trim()) return;
    const splitWords = verse.split(' ');
    setWords(splitWords);
    const numBlanks = Math.max(1, Math.floor(splitWords.length * difficulty));
    const indices = Array.from({ length: splitWords.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const selectedBlanks = indices.slice(0, numBlanks).sort((a, b) => a - b);
    setBlanks(selectedBlanks);
    const bank = selectedBlanks.map(i => splitWords[i]);
    for (let i = bank.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bank[i], bank[j]] = [bank[j], bank[i]];
    }
    setWordBank(bank);
    setFilledBlanks({});
    setCurrentBlankIndex(0);
    setSuccess(false);
    setTrainingMode(true);
  };

  const handleBankClick = (word, bankIndex) => {
    if (success) return;
    const expectedWord = words[blanks[currentBlankIndex]];
    if (word === expectedWord) {
      setFilledBlanks(prev => ({ ...prev, [blanks[currentBlankIndex]]: word }));
      const newBank = [...wordBank];
      newBank.splice(bankIndex, 1);
      setWordBank(newBank);
      if (currentBlankIndex + 1 === blanks.length) {
        setSuccess(true);
        // Save record
        const newRecord = {
          id: Date.now(),
          text: verse,
          ref: reference,
          difficulty: difficulty === 0.25 ? '초급' : difficulty === 0.5 ? '중급' : '고급',
          date: new Date().toLocaleDateString('ko-KR'),
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };
        const updated = [newRecord, ...records].slice(0, 30);
        setRecords(updated);
        saveRecords(updated);
      } else {
        setCurrentBlankIndex(prev => prev + 1);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const reset = () => {
    setTrainingMode(false);
    setSuccess(false);
  };

  const deleteRecord = (id) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveRecords(updated);
  };

  const diffLabel = difficulty === 0.25 ? '초급' : difficulty === 0.5 ? '중급' : '고급';

  return (
    <div style={{ paddingBottom: '2rem', color: 'var(--text-primary)', fontFamily: 'sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '820px', margin: '0 auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Brain size={32} color="var(--accent-gold)" />
          <h1 style={{ margin: 0, color: 'var(--accent-gold)' }}>말씀 암송 훈련</h1>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
          {[
            { key: 'train', icon: <Brain size={16} />, label: '훈련' },
            { key: 'records', icon: <Trophy size={16} />, label: `완료 기록 (${records.length})` },
            { key: 'tips', icon: <Lightbulb size={16} />, label: '암송 팁' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                backgroundColor: activeTab === tab.key ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                color: activeTab === tab.key ? '#000' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── 훈련 탭 ── */}
        {activeTab === 'train' && (
          <>
            {!trainingMode ? (
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="말씀 구절 (예: 요한복음 3:16) - 선택사항"
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', marginBottom: '1rem', boxSizing: 'border-box', fontSize: '1rem' }}
                />
                <textarea
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  placeholder="여기에 암송할 말씀을 입력하거나 붙여넣으세요..."
                  style={{ width: '100%', height: '120px', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', marginBottom: '1rem', resize: 'none', boxSizing: 'border-box', fontSize: '1rem', lineHeight: '1.7', wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                />
                <button
                  onClick={loadRandomVerse}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', cursor: 'pointer', marginBottom: '2rem' }}
                >
                  <RefreshCw size={16} /> 추천 말씀 불러오기
                </button>

                <h3 style={{ margin: '0 0 1rem 0' }}>난이도 선택</h3>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                  {[
                    { label: '🌱 초급', desc: '25% 빈칸', val: 0.25 },
                    { label: '🔥 중급', desc: '50% 빈칸', val: 0.50 },
                    { label: '⚡ 고급', desc: '75% 빈칸', val: 0.75 },
                  ].map(level => (
                    <button
                      key={level.val}
                      onClick={() => setDifficulty(level.val)}
                      style={{
                        flex: 1, padding: '1rem 0.5rem', borderRadius: '10px',
                        backgroundColor: difficulty === level.val ? 'var(--accent-gold)' : 'var(--bg-primary)',
                        color: difficulty === level.val ? '#000' : 'var(--text-primary)',
                        border: `2px solid ${difficulty === level.val ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                        cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{level.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{level.desc}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={startTraining}
                  disabled={!verse.trim()}
                  style={{ width: '100%', padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--accent-gold)', color: '#000', border: 'none', cursor: verse.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1.1rem', opacity: verse.trim() ? 1 : 0.5 }}
                >
                  🚀 훈련 시작하기
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {success ? '✅ 완료!' : `진행 ${currentBlankIndex} / ${blanks.length}`} · {diffLabel}
                      {reference ? ` · ${reference}` : ''}
                    </span>
                    <button onClick={reset} style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: '0.85rem' }}>
                      다시 설정
                    </button>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', backgroundColor: 'var(--accent-gold)', borderRadius: '3px' }}
                      animate={{ width: `${(currentBlankIndex / blanks.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Verse display — word-wrap fixed */}
                <motion.div
                  animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '2rem 1.5rem',
                    borderRadius: '16px',
                    border: shake ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                    fontSize: '1.15rem',
                    lineHeight: '2.8',
                    position: 'relative',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                  }}
                >
                  {reference && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1.2rem', fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                      {reference}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0', alignItems: 'baseline' }}>
                    {words.map((word, i) => {
                      const isBlank = blanks.includes(i);
                      const isFilled = filledBlanks[i] !== undefined;
                      const isCurrent = blanks[currentBlankIndex] === i;

                      if (!isBlank || isFilled) {
                        return (
                          <span key={i} style={{
                            marginRight: '0.4rem',
                            color: isFilled ? 'var(--accent-gold)' : 'var(--text-primary)',
                            fontWeight: isFilled ? 'bold' : 'normal',
                            transition: 'color 0.3s',
                            whiteSpace: 'nowrap',
                          }}>
                            {isFilled ? filledBlanks[i] : word}
                          </span>
                        );
                      }

                      return (
                        <span key={i} style={{
                          display: 'inline-block',
                          minWidth: `${word.length * 0.7 + 1}rem`,
                          marginRight: '0.4rem',
                          borderBottom: `2px solid ${isCurrent ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)'}`,
                          backgroundColor: isCurrent ? 'rgba(212,175,55,0.12)' : 'transparent',
                          height: '1.6rem',
                          verticalAlign: 'middle',
                          borderRadius: '3px',
                          transition: 'all 0.3s',
                          whiteSpace: 'nowrap',
                        }} />
                      );
                    })}
                  </div>
                </motion.div>

                {/* Word bank or success */}
                {!success ? (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📝 알맞은 단어를 선택하세요</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <AnimatePresence>
                        {wordBank.map((word, i) => (
                          <motion.button
                            key={`${word}-${i}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => handleBankClick(word, i)}
                            style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}
                            whileHover={{ scale: 1.05, borderColor: 'var(--accent-gold)' }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {word}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '2px solid var(--accent-gold)', boxShadow: '0 0 40px rgba(212,175,55,0.25)' }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                      style={{ fontSize: '4rem', marginBottom: '1rem' }}
                    >
                      🎉
                    </motion.div>
                    <h2 style={{ color: 'var(--accent-gold)', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>암송 완료!</h2>
                    {reference && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>{reference}</p>}
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>말씀을 완벽하게 암송하셨습니다! 기록에 저장되었습니다. ✨</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={reset} style={{ padding: '0.8rem 1.8rem', borderRadius: '8px', backgroundColor: 'var(--accent-gold)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        새 말씀 훈련하기
                      </button>
                      <button onClick={() => { reset(); setActiveTab('records'); }} style={{ padding: '0.8rem 1.8rem', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        기록 보기 📜
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── 완료 기록 탭 ── */}
        {activeTab === 'records' && (
          <div>
            {records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <Trophy size={48} color="var(--glass-border)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <p>아직 암송 완료 기록이 없습니다.</p>
                <p style={{ fontSize: '0.9rem' }}>훈련을 완료하면 여기에 자동으로 저장됩니다! 💪</p>
                <button onClick={() => setActiveTab('train')} style={{ marginTop: '1.5rem', padding: '0.7rem 1.5rem', borderRadius: '8px', backgroundColor: 'var(--accent-gold)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  훈련 시작하기
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>총 {records.length}개의 암송 기록</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--accent-gold)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      🏆 {records.length}회 완료
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <AnimatePresence>
                    {records.map((rec, idx) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.04 }}
                        style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '1rem 1.2rem', border: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                      >
                        <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                          {rec.difficulty === '초급' ? '🌱' : rec.difficulty === '중급' ? '🔥' : '⚡'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {rec.ref && <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{rec.ref}</div>}
                          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', lineHeight: '1.6', wordBreak: 'keep-all', color: 'var(--text-primary)' }}>
                            {rec.text.length > 60 ? rec.text.slice(0, 60) + '...' : rec.text}
                          </p>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.date} {rec.time}</span>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>{rec.difficulty}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteRecord(rec.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0, padding: '0.25rem', borderRadius: '6px' }} title="기록 삭제">
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 암송 팁 탭 ── */}
        {activeTab === 'tips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>효과적인 말씀 암송을 위한 검증된 방법들입니다 ✨</p>
            {TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}
              >
                <button
                  onClick={() => setShowTipIndex(showTipIndex === i ? null : i)}
                  style={{ width: '100%', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{tip.emoji}</span>
                  <span style={{ fontWeight: 'bold', flex: 1 }}>{tip.title}</span>
                  {showTipIndex === i ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                </button>
                <AnimatePresence>
                  {showTipIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', color: 'var(--text-secondary)', lineHeight: '1.7', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                        {tip.desc}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            <div style={{ marginTop: '0.5rem', padding: '1.2rem', borderRadius: '12px', backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
              <p style={{ color: 'var(--accent-gold)', fontWeight: 'bold', margin: '0 0 0.3rem 0' }}>📖 추천 암송 횟수</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>하루 1구절, 주 5회 꾸준히 반복하면 1년에 약 260구절을 암송할 수 있습니다!</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
