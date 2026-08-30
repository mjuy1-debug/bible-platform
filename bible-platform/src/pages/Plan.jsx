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
  const { planProgress, togglePlanDay, resetPlan, setCompletedUpToDay } = useContext(UserContext);
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
  const [quickDayInput, setQuickDayInput] = useState('');

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

  // 플랜 타입 변경 시 로컬 선택 상태 동기화
  useEffect(() => {
    if (type) {
      setSelectedType(type);
    }
  }, [type]);

  const handleApplyPlan = (targetType) => {
    if (targetType === 'custom' && customBooks.length === 0) {
      return;
    }
    resetPlan(targetType, targetType === 'custom' ? customBooks : []);
    setShowSettings(false);
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
              padding: '0.45rem 0.9rem', borderRadius: '20px',
              border: `1px solid ${showSettings ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
              background: showSettings ? 'rgba(196,164,132,0.18)' : 'transparent',
              color: showSettings ? 'var(--accent-gold)' : 'var(--text-primary)',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}>
            <Settings size={15} /> {showSettings ? '설정 닫기' : '플랜 설정'}
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
            <div className="glass-card" style={{ border: '1px solid rgba(212,175,55,0.35)', padding: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                  <Settings size={18} /> 통독 플랜 선택 및 설정
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}
                >
                  닫기 ✕
                </button>
              </div>

              {/* 플랜 타입 선택 카드 그리드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem', marginBottom: '1.2rem' }}>
                {[
                  {
                    id: 'full-year',
                    name: '전체 성경 1년 통독',
                    badge: '66권 1,189장 • 365일 코스',
                    desc: '창세기~요한계시록 전체를 1년 동안 매일 3~4장씩 완독하는 정석 코스',
                    icon: '📖'
                  },
                  {
                    id: 'old-testament',
                    name: '구약 통독',
                    badge: '구약 39권 929장 • 286일 코스',
                    desc: '창세기부터 말라기까지 구약 전체를 집중적으로 통독하는 코스',
                    icon: '📜'
                  },
                  {
                    id: 'new-testament',
                    name: '신약 통독',
                    badge: '신약 27권 260장 • 79일 코스',
                    desc: '마태복음부터 요한계시록까지 신약 27권을 약 79일 만에 빠르게 완독',
                    icon: '✝️'
                  },
                  {
                    id: 'custom',
                    name: '사용자 맞춤 통독',
                    badge: `${customBooks.length}권 선택됨`,
                    desc: '원하는 성경 책만 직접 골라 나만의 맞춤 일정으로 통독',
                    icon: '🎯'
                  }
                ].map((item) => {
                  const isCurrent = type === item.id;
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '14px',
                        background: isCurrent ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                        border: isCurrent ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                        boxShadow: isCurrent ? '0 4px 16px rgba(212,175,55,0.18)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                            <span style={{ fontWeight: 800, fontSize: '0.96rem', color: isCurrent ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                              {item.name}
                            </span>
                          </div>
                          {isCurrent && (
                            <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '6px', background: '#5bbf6e', color: '#111', fontWeight: 800 }}>
                              진행중
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '5px' }}>
                          {item.badge}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {item.desc}
                        </div>
                      </div>

                      {/* 카드 내 즉시 적용 버튼 */}
                      {item.id !== 'custom' ? (
                        <button
                          type="button"
                          onClick={() => handleApplyPlan(item.id)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: isCurrent ? 'rgba(255,255,255,0.08)' : 'var(--accent-gold)',
                            color: isCurrent ? 'var(--text-primary)' : '#111',
                            border: isCurrent ? '1px solid var(--glass-border)' : 'none',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <RotateCcw size={14} />
                          {isCurrent ? 'Day 1부터 다시 시작' : `${item.name} 시작 ➔`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedType('custom')}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: selectedType === 'custom' ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.08)',
                            color: selectedType === 'custom' ? 'var(--accent-gold)' : 'var(--text-primary)',
                            border: '1px solid var(--glass-border)',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            cursor: 'pointer'
                          }}
                        >
                          {selectedType === 'custom' ? '성경 책 선택 중...' : '맞춤 책 선택하기'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 커스텀 책 선택 서브패널 */}
              <AnimatePresence>
                {selectedType === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: '1.2rem', overflow: 'hidden', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        읽고 싶은 성경 책을 선택하세요 ({customBooks.length}권 선택됨)
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setCustomBooks(BIBLE_BOOKS.map(b => b.id))}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          전체 선택
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomBooks([])}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          전체 해제
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.8rem' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>📜 구약 (39권)</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {BIBLE_BOOKS.filter(b => b.testament === 'old').map(book => (
                          <button key={book.id} onClick={() => toggleCustomBook(book.id)}
                            style={{
                              padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                              border: `1px solid ${customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                              background: customBooks.includes(book.id) ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.03)',
                              color: customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--text-secondary)',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                            {book.shortName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>✝️ 신약 (27권)</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {BIBLE_BOOKS.filter(b => b.testament === 'new').map(book => (
                          <button key={book.id} onClick={() => toggleCustomBook(book.id)}
                            style={{
                              padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                              border: `1px solid ${customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
                              background: customBooks.includes(book.id) ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.03)',
                              color: customBooks.includes(book.id) ? 'var(--accent-gold)' : 'var(--text-secondary)',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                            {book.shortName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPlan('custom')}
                      disabled={customBooks.length === 0}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'var(--accent-gold)',
                        color: '#111',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: customBooks.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: customBooks.length === 0 ? 0.5 : 1
                      }}
                    >
                      🚀 선택한 {customBooks.length}권으로 맞춤 플랜 시작하기 ➔
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ⚡ 진행 일차 빠른 복구 섹션 */}
              <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(212,175,55,0.08)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.25)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-gold)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} /> ⚡ 읽던 진행 일차 빠른 복구
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  이전에 읽으셨던 일차 번호를 입력하시면 해당 일차까지 한 번에 완료 체크로 복구됩니다.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    min="1"
                    max={totalDays}
                    placeholder={`1 ~ ${totalDays}`}
                    value={quickDayInput}
                    onChange={(e) => setQuickDayInput(e.target.value)}
                    style={{
                      width: '110px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!quickDayInput) return;
                      setCompletedUpToDay(quickDayInput);
                      setShowSettings(false);
                      setQuickDayInput('');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'var(--accent-gold)',
                      color: '#111',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {quickDayInput ? `Day ${quickDayInput}까지 일괄 완료 복구` : '일괄 완료 복구'}
                  </button>
                </div>
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

      {/* 52주 말씀 퀴즈 배너 (하단 배치) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(20,20,24,0.85) 100%)',
        border: '1px solid rgba(212,175,55,0.35)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginTop: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={24} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              오늘의 통독을 마치셨나요? 52주 말씀 퀴즈에 도전해보세요!
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              읽은 성경 말씀을 퀴즈로 풀고 말씀 달란트와 칭호를 획득하세요.
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/quiz', { state: { category: '🌟 주간 골든벨 (52주)' } })}
          style={{
            padding: '9px 16px',
            borderRadius: '10px',
            background: 'var(--accent-gold)',
            color: '#111',
            fontWeight: 800,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          🎯 말씀 퀴즈 풀기 ➔
        </button>
      </div>
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
