import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, Star } from 'lucide-react';

const VERSES = [
  "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
  "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라",
  "여호와는 나의 목자시니 내게 부족함이 없으리로다",
  "태초에 하나님이 천지를 창조하시니라",
  "오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라"
];

export default function Memorize() {
  const [verse, setVerse] = useState("");
  const [difficulty, setDifficulty] = useState(0.25);
  const [trainingMode, setTrainingMode] = useState(false);
  const [words, setWords] = useState([]);
  const [blanks, setBlanks] = useState([]); // indices of blanked words
  const [wordBank, setWordBank] = useState([]); // shuffled words
  const [filledBlanks, setFilledBlanks] = useState({}); // { index: word }
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0); // index in blanks array
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadRandomVerse = () => {
    const random = VERSES[Math.floor(Math.random() * VERSES.length)];
    setVerse(random);
  };

  const startTraining = () => {
    if (!verse.trim()) return;
    const splitWords = verse.split(' ');
    setWords(splitWords);
    
    // Choose blanks based on difficulty
    const numBlanks = Math.max(1, Math.floor(splitWords.length * difficulty));
    const indices = Array.from({ length: splitWords.length }, (_, i) => i);
    // Shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const selectedBlanks = indices.slice(0, numBlanks).sort((a, b) => a - b);
    setBlanks(selectedBlanks);
    
    const bank = selectedBlanks.map(i => splitWords[i]);
    // Shuffle bank
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

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'sans-serif' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Brain size={32} color="var(--accent-gold)" />
          <h1 style={{ margin: 0, color: 'var(--accent-gold)' }}>말씀 암송 훈련</h1>
        </div>

        {!trainingMode ? (
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '2rem', 
            borderRadius: '16px',
            border: '1px solid var(--glass-border)'
          }}>
            <textarea
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="여기에 암송할 말씀을 입력하거나 붙여넣으세요..."
              style={{
                width: '100%',
                height: '120px',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                marginBottom: '1rem',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={loadRandomVerse}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={18} /> 랜덤 말씀
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>난이도 선택</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[
                  { label: '초급', val: 0.25 },
                  { label: '중급', val: 0.50 },
                  { label: '고급', val: 0.75 }
                ].map(level => (
                  <button
                    key={level.label}
                    onClick={() => setDifficulty(level.val)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: difficulty === level.val ? 'var(--accent-gold)' : 'var(--bg-primary)',
                      color: difficulty === level.val ? '#000' : 'var(--text-primary)',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {level.label} ({level.val * 100}% 빈칸)
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startTraining}
              disabled={!verse.trim()}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-gold)',
                color: '#000',
                border: 'none',
                cursor: verse.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                opacity: verse.trim() ? 1 : 0.5
              }}
            >
              훈련 시작하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                진행도: {currentBlankIndex} / {blanks.length}
              </span>
              <button 
                onClick={reset}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                다시 설정
              </button>
            </div>

            <motion.div 
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '3rem 2rem',
                borderRadius: '16px',
                border: shake ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                lineHeight: '2.5',
                fontSize: '1.2rem',
                textAlign: 'center'
              }}
            >
              {words.map((word, i) => {
                const isBlank = blanks.includes(i);
                const isFilled = filledBlanks[i] !== undefined;
                const isCurrent = blanks[currentBlankIndex] === i;

                if (!isBlank || isFilled) {
                  return (
                    <span key={i} style={{ 
                      marginRight: '0.5rem',
                      color: isFilled ? 'var(--accent-gold)' : 'var(--text-primary)',
                      fontWeight: isFilled ? 'bold' : 'normal',
                      transition: 'color 0.3s'
                    }}>
                      {isFilled ? filledBlanks[i] : word}
                    </span>
                  );
                }

                return (
                  <span key={i} style={{
                    display: 'inline-block',
                    minWidth: '60px',
                    marginRight: '0.5rem',
                    padding: '0 0.5rem',
                    borderBottom: `2px solid ${isCurrent ? 'var(--accent-gold)' : 'var(--text-secondary)'}`,
                    backgroundColor: isCurrent ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    height: '1.5rem',
                    verticalAlign: 'bottom',
                    transition: 'all 0.3s'
                  }}></span>
                );
              })}
            </motion.div>

            {!success ? (
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>단어 은행 (알맞은 단어를 선택하세요)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <AnimatePresence>
                    {wordBank.map((word, i) => (
                      <motion.button
                        key={`${word}-${i}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => handleBankClick(word, i)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  border: '2px solid var(--accent-gold)',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
                }}
              >
                <Star size={64} color="var(--accent-gold)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <h2 style={{ color: 'var(--accent-gold)', fontSize: '2rem', margin: '0 0 1rem 0' }}>🎉 암송 완료!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>말씀을 완벽하게 암송하셨습니다.</p>
                <button
                  onClick={reset}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  새로운 말씀 훈련하기
                </button>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
