import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check, Trash2, Plus, Filter } from 'lucide-react';

const Prayer = () => {
  const [prayers, setPrayers] = useState(() => {
    const saved = localStorage.getItem('prayers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [newPrayerText, setNewPrayerText] = useState('');
  const [newPrayerVerse, setNewPrayerVerse] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'answered'

  useEffect(() => {
    localStorage.setItem('prayers', JSON.stringify(prayers));
  }, [prayers]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newPrayerText.trim()) return;
    
    const newPrayer = {
      id: Date.now().toString(),
      text: newPrayerText,
      verse: newPrayerVerse,
      dateAdded: new Date().toLocaleDateString(),
      answered: false,
      dateAnswered: null,
    };
    
    setPrayers([newPrayer, ...prayers]);
    setNewPrayerText('');
    setNewPrayerVerse('');
  };

  const toggleAnswered = (id) => {
    setPrayers(prayers.map(p => {
      if (p.id === id) {
        const isAnswered = !p.answered;
        return {
          ...p,
          answered: isAnswered,
          dateAnswered: isAnswered ? new Date().toLocaleDateString() : null
        };
      }
      return p;
    }));
  };

  const deletePrayer = (id) => {
    if(window.confirm('정말 삭제하시겠습니까?')) {
      setPrayers(prayers.filter(p => p.id !== id));
    }
  };

  const filteredPrayers = prayers.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !p.answered;
    if (filter === 'answered') return p.answered;
    return true;
  });

  const total = prayers.length;
  const answeredCount = prayers.filter(p => p.answered).length;
  const rate = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div style={{ padding: '2rem', maxWidth: '820px', margin: '0 auto', color: 'var(--text-primary, #fff)' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--accent-gold, #d4af37)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          기도 노트 🙏
        </h1>
      </header>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '1rem', borderRadius: '12px', flex: 1, textAlign: 'center', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)' }}>총 기도 제목</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{total}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '1rem', borderRadius: '12px', flex: 1, textAlign: 'center', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)' }}>응답된 기도</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>{answeredCount}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '1rem', borderRadius: '12px', flex: 1, textAlign: 'center', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)' }}>응답률</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold, #d4af37)' }}>{rate}%</div>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="기도 제목을 입력하세요..." 
            value={newPrayerText}
            onChange={(e) => setNewPrayerText(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border, rgba(255,255,255,0.2))', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="관련 말씀 (예: 시편 23:1) - 선택사항" 
              value={newPrayerVerse}
              onChange={(e) => setNewPrayerVerse(e.target.value)}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border, rgba(255,255,255,0.2))', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
            />
            <button type="submit" style={{ padding: '0 1.5rem', borderRadius: '8px', background: 'var(--accent-gold, #d4af37)', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> 추가
            </button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <Filter size={18} color="var(--text-secondary, #aaa)" />
        <button onClick={() => setFilter('all')} style={{ background: filter === 'all' ? 'var(--accent-gold, #d4af37)' : 'transparent', color: filter === 'all' ? '#000' : 'var(--text-secondary, #aaa)', border: '1px solid ' + (filter === 'all' ? 'transparent' : 'var(--glass-border, rgba(255,255,255,0.2))'), padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>전체</button>
        <button onClick={() => setFilter('pending')} style={{ background: filter === 'pending' ? 'var(--accent-gold, #d4af37)' : 'transparent', color: filter === 'pending' ? '#000' : 'var(--text-secondary, #aaa)', border: '1px solid ' + (filter === 'pending' ? 'transparent' : 'var(--glass-border, rgba(255,255,255,0.2))'), padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>응답 대기</button>
        <button onClick={() => setFilter('answered')} style={{ background: filter === 'answered' ? 'var(--accent-gold, #d4af37)' : 'transparent', color: filter === 'answered' ? '#000' : 'var(--text-secondary, #aaa)', border: '1px solid ' + (filter === 'answered' ? 'transparent' : 'var(--glass-border, rgba(255,255,255,0.2))'), padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>응답됨</button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {filteredPrayers.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary, #aaa)' }}>
              해당하는 기도 제목이 없습니다.
            </motion.div>
          ) : (
            filteredPrayers.map(prayer => (
              <motion.div 
                key={prayer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ 
                  background: prayer.answered ? 'rgba(74, 222, 128, 0.1)' : 'var(--bg-secondary, #1a1a1a)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: `1px solid ${prayer.answered ? 'rgba(74, 222, 128, 0.3)' : 'var(--glass-border, rgba(255,255,255,0.1))'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, textDecoration: prayer.answered ? 'line-through' : 'none', opacity: prayer.answered ? 0.7 : 1 }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{prayer.text}</div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary, #aaa)' }}>
                    <span>{prayer.dateAdded}</span>
                    {prayer.verse && <span style={{ color: 'var(--accent-gold, #d4af37)' }}>{prayer.verse}</span>}
                    {prayer.answered && <span style={{ color: '#4ade80' }}>응답일: {prayer.dateAnswered}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => toggleAnswered(prayer.id)} style={{ padding: '0.5rem', borderRadius: '50%', background: prayer.answered ? '#4ade80' : 'rgba(255,255,255,0.1)', color: prayer.answered ? '#000' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={20} />
                  </button>
                  <button onClick={() => deletePrayer(prayer.id)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--accent-gold, #d4af37)', fontStyle: 'italic', padding: '2rem', borderTop: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
        "주께서 내게 응답하시리로다 - 시편 86:7"
      </footer>
    </div>
  );
};

export default Prayer;
