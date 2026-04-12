import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle2, Circle, ChevronDown, ChevronUp,
  BookOpen, Settings, RotateCcw, Filter, Search, Trophy, Flame
} from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { BIBLE_BOOKS } from '../data/bibleData';
import { PLAN_TYPE_LABELS, MONTH_NAMES } from '../data/readingPlanData';

const Plan = () => {
  const { planProgress, togglePlanDay, resetPlan } = useContext(UserContext);
  const { type, totalDays, completedDays, dailySchedule, selectedBooks } = planProgress;
  const navigate = useNavigate();

  const pct = totalDays > 0 ? ((completedDays.length / totalDays) * 100).toFixed(1) : '0.0';
  const today = completedDays.length + 1;

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [selectedType, setSelectedType] = useState(type || 'full-year');
  const [customBooks, setCustomBooks] = useState(selectedBooks || []);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [searchDay, setSearchDay] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const currentDayRef = useRef(null);

  // 현재 진행 월을 자동 펼치기
  useEffect(() => {
    if (dailySchedule.length > 0) {
      const currentDay = Math.min(today, totalDays);
      const monthIdx = getMonthForDay(currentDay);
      setExpandedMonths(prev => ({ ...prev, [monthIdx]: true }));
    }
  }, []); // eslint-disable-line

  // 현재 날짜로 스크롤
  useEffect(() => {
    setTimeout(() => {
      currentDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []); // eslint-disable-line

  // 월별 그룹핑
  const monthGroups = useMemo(() => {
    const groups = [];
    const daysPerMonth = Math.ceil(dailySchedule.length / 12);

    for (let m = 0; m < 12; m++) {
      const start = m * daysPerMonth;
      const end = Math.min((m + 1) * daysPerMonth, dailySchedule.length);
      const items = dailySchedule.slice(start, end);
      if (items.length > 0) {
        const completedInMonth = items.filter(s => completedDays.includes(s.day)).length;
        groups.push({
          month: m,
          label: MONTH_NAMES[m],
          items,
          completedCount: completedInMonth,
          totalCount: items.length,
        });
      }
    }
    return groups;
  }, [dailySchedule, completedDays]);

  const getMonthForDay = (day) => {
    const daysPerMonth = Math.ceil(dailySchedule.length / 12);
    return Math.floor((day - 1) / daysPerMonth);
  };

  const toggleMonth = (monthIdx) => {
    setExpandedMonths(prev => ({ ...prev, [monthIdx]: !prev[monthIdx] }));
  };

  const handleResetPlan = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetPlan(selectedType, selectedType === 'custom' ? customBooks : []);
    setShowSettings(false);
    setConfirmReset(false);
  };

  const toggleCustomBook = (bookId) => {
    setCustomBooks(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const handleReadClick = (item) => {
    navigate('/read', { state: { bookId: item.bookId, chapter: item.chapter } });
  };

  // 연속 읽기 일수 계산
  const streak = useMemo(() => {
    if (completedDays.length === 0) return 0;
    const sorted = [...completedDays].sort((a, b) => b - a);
    let count = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i] - sorted[i + 1] === 1) count++;
      else break;
    }
    return count;
  }, [completedDays]);

  // 검색 필터
  const filteredSchedule = searchDay.trim()
    ? dailySchedule.filter(s =>
      s.range.includes(searchDay) ||
      s.day.toString() === searchDay.trim() ||
      s.ref.includes(searchDay)
    )
    : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: 'var(--accent-gold)' }}>성경 통독 플랜</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{PLAN_TYPE_LABELS[type] || '전체 성경 1년 통독'}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>매일 꾸준하게 말씀과 동행하는 습관을 만들어보세요.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
          <Trophy size={20} color="var(--accent-gold)" style={{ margin: '0 auto 0.4rem' }} />
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{pct}%</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>진행률</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
          <Flame size={20} color="#e85b72" style={{ margin: '0 auto 0.4rem' }} />
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e85b72' }}>{streak}일</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>연속 읽기</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
          <CheckCircle2 size={20} color="#5bbf6e" style={{ margin: '0 auto 0.4rem' }} />
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#5bbf6e' }}>{completedDays.length}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/ {totalDays}일</p>
        </div>
      </div>

      {/* Progress Bar + Settings Toggle */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={18} color="var(--accent-gold)" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {completedDays.length > 0
                ? `Day ${Math.min(today, totalDays)} — ${dailySchedule.find(d => d.day === Math.min(today, totalDays))?.range || '완료!'}`
                : '아직 시작 전입니다. 첫 날을 시작해보세요!'}
            </span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.8rem', borderRadius: '20px',
              border: `1px solid ${showSettings ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
              background: showSettings ? 'rgba(196,164,132,0.12)' : 'transparent',
              color: showSettings ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
            }}>
            <Settings size={14} /> 설정
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-gold), #FFF8DC)', borderRadius: '5px' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
          >
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={16} color="var(--accent-gold)" /> 플랜 설정
              </h3>

              {/* 플랜 타입 선택 */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {Object.entries(PLAN_TYPE_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => setSelectedType(key)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '20px',
                      border: `1px solid ${selectedType === key ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                      background: selectedType === key ? 'rgba(196,164,132,0.15)' : 'transparent',
                      color: selectedType === key ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* 커스텀 책 선택 */}
              <AnimatePresence>
                {selectedType === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: '1rem', overflow: 'hidden' }}
                  >
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                      읽고 싶은 성경 책을 선택하세요 ({customBooks.length}권 선택됨)
                    </p>

                    <div style={{ marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>📜 구약</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.8rem' }}>
                        {BIBLE_BOOKS.filter(b => b.testament === 'old').map(book => (
                          <button key={book.id} onClick={() => toggleCustomBook(book.id)}
                            style={{
                              padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem',
                              border: `1px solid ${customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                              background: customBooks.includes(book.id) ? 'rgba(196,164,132,0.18)' : 'transparent',
                              color: customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--text-secondary)',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                            {book.shortName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>✝️ 신약</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {BIBLE_BOOKS.filter(b => b.testament === 'new').map(book => (
                          <button key={book.id} onClick={() => toggleCustomBook(book.id)}
                            style={{
                              padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem',
                              border: `1px solid ${customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                              background: customBooks.includes(book.id) ? 'rgba(196,164,132,0.18)' : 'transparent',
                              color: customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--text-secondary)',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                            {book.shortName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 적용 버튼 */}
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <button onClick={handleResetPlan}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.6rem 1.5rem', borderRadius: '30px',
                    background: confirmReset ? '#e53e3e' : 'var(--accent-gold)',
                    color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  <RotateCcw size={14} />
                  {confirmReset ? '정말 변경하시겠습니까?' : '플랜 적용하기'}
                </button>
                {confirmReset && (
                  <span style={{ fontSize: '0.78rem', color: '#e53e3e' }}>
                    ⚠️ 진행률이 초기화됩니다
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          value={searchDay}
          onChange={e => setSearchDay(e.target.value)}
          placeholder="일차 또는 성경 이름 검색 (예: 30, 시편, 마태)"
          style={{
            width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '30px',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
            color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem',
          }}
        />
      </div>

      {/* Filtered results */}
      {filteredSchedule && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
            검색 결과: {filteredSchedule.length}건
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {filteredSchedule.map(item => {
              const done = completedDays.includes(item.day);
              return (
                <DayRow key={item.day} item={item} done={done}
                  isToday={false} onToggle={togglePlanDay} onRead={handleReadClick} />
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Accordion */}
      {!filteredSchedule && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {monthGroups.map(group => {
            const isExpanded = expandedMonths[group.month];
            const monthPct = group.totalCount > 0 ? ((group.completedCount / group.totalCount) * 100).toFixed(0) : 0;

            return (
              <div key={group.month} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(group.month)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.5rem', cursor: 'pointer', background: 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: Number(monthPct) === 100 ? 'rgba(91,191,110,0.15)' : 'rgba(196,164,132,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                      color: Number(monthPct) === 100 ? '#5bbf6e' : 'var(--accent-gold)',
                    }}>
                      {group.label}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', textAlign: 'left' }}>
                        Day {group.items[0].day} ~ {group.items[group.items.length - 1].day}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {group.items[0].range.split(' ')[0]} ~ {group.items[group.items.length - 1].range.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: Number(monthPct) === 100 ? '#5bbf6e' : 'var(--accent-gold)' }}>
                        {monthPct}%
                      </span>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {group.completedCount}/{group.totalCount}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                  </div>
                </button>

                {/* Month progress mini bar */}
                <div style={{ height: '3px', background: 'var(--bg-secondary)', margin: '0 1.5rem' }}>
                  <div style={{ height: '100%', width: `${monthPct}%`, background: Number(monthPct) === 100 ? '#5bbf6e' : 'var(--accent-gold)', borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>

                {/* Expanded days */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {group.items.map(item => {
                          const done = completedDays.includes(item.day);
                          const isCurrent = item.day === Math.min(today, totalDays) && !completedDays.includes(totalDays);
                          return (
                            <div key={item.day} ref={isCurrent ? currentDayRef : null}>
                              <DayRow item={item} done={done} isToday={isCurrent}
                                onToggle={togglePlanDay} onRead={handleReadClick} />
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// 일차별 Row 컴포넌트
const DayRow = ({ item, done, isToday, onToggle, onRead }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.8rem 1rem', borderRadius: '12px',
    background: isToday ? 'rgba(196,164,132,0.12)' : 'transparent',
    border: isToday ? '1px solid var(--accent-gold)' : '1px solid transparent',
    transition: 'all 0.2s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, minWidth: 0 }}>
      <button onClick={() => onToggle(item.day)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}>
        {done
          ? <CheckCircle2 color="var(--accent-gold)" size={22} />
          : <Circle color="var(--text-secondary)" size={22} />}
      </button>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontWeight: 600, fontSize: '0.88rem',
          color: isToday ? 'var(--accent-gold)' : done ? 'var(--text-secondary)' : 'var(--text-primary)',
          textDecoration: done ? 'line-through' : 'none',
        }}>
          Day {item.day}
        </p>
        <p style={{
          fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.range}
        </p>
      </div>
    </div>
    {isToday && !done && (
      <button onClick={() => onRead(item)} className="btn-primary"
        style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
        <BookOpen size={14} /> 읽기
      </button>
    )}
  </div>
);

export default Plan;
