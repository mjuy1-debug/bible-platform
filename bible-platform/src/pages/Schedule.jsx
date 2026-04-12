import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  Filter, Eye, EyeOff, Trash2, Edit3, CalendarDays, List, LayoutGrid
} from 'lucide-react';
import { UserContext } from '../context/UserContext';
import {
  CATEGORY_LABELS, CATEGORY_COLORS,
  getEventsForDate, getEventsForMonth,
} from '../data/scheduleData';
import CalendarGrid from '../components/CalendarGrid';

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const Schedule = () => {
  const { events, addEvent, deleteEvent } = useContext(UserContext);
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly'); // 'annual' | 'monthly' | 'weekly' | 'add'
  const [categoryFilter, setCategoryFilter] = useState({ joshua: true, church: true, holiday: true, liturgy: true });
  const [showAddForm, setShowAddForm] = useState(false);

  // 새 일정 폼
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', endDate: '', category: 'joshua', description: '',
  });

  const filteredEvents = useMemo(() => {
    return events.filter(e => categoryFilter[e.category]);
  }, [events, categoryFilter]);

  const monthEvents = useMemo(() => {
    return getEventsForMonth(filteredEvents, currentYear, currentMonth);
  }, [filteredEvents, currentYear, currentMonth]);

  const selectedDateEvents = useMemo(() => {
    return selectedDate ? getEventsForDate(filteredEvents, selectedDate) : [];
  }, [filteredEvents, selectedDate]);

  // 주간 뷰용
  const weekDates = useMemo(() => {
    const today = new Date();
    const dow = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dow);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const navMonth = (dir) => {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCurrentMonth(m);
    setCurrentYear(y);
    setSelectedDate(null);
  };

  const toggleCategory = (cat) => {
    setCategoryFilter(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    addEvent({
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time || undefined,
      endDate: newEvent.endDate || undefined,
      category: newEvent.category,
      description: newEvent.description.trim() || undefined,
    });
    setNewEvent({ title: '', date: '', time: '', endDate: '', category: 'joshua', description: '' });
    setShowAddForm(false);
  };

  const TABS = [
    { id: 'annual', label: '연간', icon: LayoutGrid },
    { id: 'monthly', label: '월별', icon: CalendarDays },
    { id: 'weekly', label: '주간', icon: List },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: 'var(--accent-gold)' }}>
          여호수아 일정 & 계획
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          남전도회 · 교회 전체 일정을 한눈에 확인하세요
        </p>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 1.2rem', borderRadius: '30px',
              border: `1px solid ${activeTab === id ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
              background: activeTab === id ? 'var(--accent-gold)' : 'var(--glass-bg)',
              color: activeTab === id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
        <button onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.2rem', borderRadius: '30px',
            border: '1px solid rgba(91,191,110,0.3)',
            background: 'rgba(91,191,110,0.1)',
            color: '#5bbf6e', fontWeight: 600, fontSize: '0.88rem',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 'auto',
          }}>
          <Plus size={15} /> 일정 추가
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Filter size={14} style={{ color: 'var(--text-secondary)', alignSelf: 'center' }} />
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const active = categoryFilter[key];
          const colors = CATEGORY_COLORS[key];
          return (
            <button key={key} onClick={() => toggleCategory(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.9rem', borderRadius: '20px',
                border: `1px solid ${active ? colors.border : 'var(--glass-border)'}`,
                background: active ? colors.bg : 'transparent',
                color: active ? colors.text : 'var(--text-secondary)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: active ? colors.dot : 'var(--text-secondary)' }} />
              {label}
              {active ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          );
        })}
      </div>

      {/* ═══ Annual View ═══ */}
      {activeTab === 'annual' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setCurrentYear(y => y - 1)} style={{ display: 'flex', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="serif-font" style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>{currentYear}년</h3>
            <button onClick={() => setCurrentYear(y => y + 1)} style={{ display: 'flex', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1rem' }}>
            {MONTH_NAMES.map((name, m) => {
              const mEvents = getEventsForMonth(filteredEvents, currentYear, m);
              const joshuaCount = mEvents.filter(e => e.category === 'joshua').length;
              const churchCount = mEvents.filter(e => e.category === 'church').length;
              const holidayCount = mEvents.filter(e => e.category === 'holiday').length;
              const liturgyCount = mEvents.filter(e => e.category === 'liturgy').length;
              const isCurrentMonth = currentYear === now.getFullYear() && m === now.getMonth();

              return (
                <motion.div key={m}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: m * 0.03 }}
                  className="glass-card"
                  onClick={() => { setCurrentMonth(m); setActiveTab('monthly'); }}
                  style={{
                    padding: '1.2rem', cursor: 'pointer',
                    border: isCurrentMonth ? '1.5px solid var(--accent-gold)' : undefined,
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h4 style={{
                      fontWeight: 700, fontSize: '1.1rem',
                      color: isCurrentMonth ? 'var(--accent-gold)' : 'var(--text-primary)',
                    }}>
                      {name}
                    </h4>
                    {isCurrentMonth && (
                      <span style={{
                        padding: '0.15rem 0.6rem', borderRadius: '12px',
                        background: 'rgba(196,164,132,0.15)', color: 'var(--accent-gold)',
                        fontSize: '0.7rem', fontWeight: 600,
                      }}>
                        이번 달
                      </span>
                    )}
                  </div>

                  {mEvents.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>일정 없음</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {joshuaCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.joshua.dot }} />
                          <span style={{ color: CATEGORY_COLORS.joshua.text }}>남전도회 {joshuaCount}건</span>
                        </div>
                      )}
                      {churchCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.church.dot }} />
                          <span style={{ color: CATEGORY_COLORS.church.text }}>교회 전체 {churchCount}건</span>
                        </div>
                      )}
                      {holidayCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.holiday.dot }} />
                          <span style={{ color: CATEGORY_COLORS.holiday.text }}>공휴일 {holidayCount}건</span>
                        </div>
                      )}
                      {liturgyCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.liturgy.dot }} />
                          <span style={{ color: CATEGORY_COLORS.liturgy.text }}>교회 절기 {liturgyCount}건</span>
                        </div>
                      )}
                      {/* 주요 일정 미리보기 */}
                      <div style={{ marginTop: '0.3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.4rem' }}>
                        {mEvents.slice(0, 2).map(e => (
                          <p key={e.id} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {e.date.slice(5)} · {e.title}
                          </p>
                        ))}
                        {mEvents.length > 2 && (
                          <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>+{mEvents.length - 2}건 더보기</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Monthly View ═══ */}
      {activeTab === 'monthly' && (
        <div>
          {/* Month Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
            <button onClick={() => navMonth(-1)} style={{ display: 'flex', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="serif-font" style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', minWidth: '120px', textAlign: 'center' }}>
              {currentYear}년 {MONTH_NAMES[currentMonth]}
            </h3>
            <button onClick={() => navMonth(1)} style={{ display: 'flex', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              events={filteredEvents}
              selectedDate={selectedDate}
              onDateClick={(dateStr) => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
            />
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ marginBottom: '1.5rem' }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--accent-gold)" />
                {selectedDate.replace(/-/g, '.')} ({DAY_NAMES[new Date(selectedDate).getDay()]})
              </h4>

              {selectedDateEvents.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>이 날에는 일정이 없습니다.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {selectedDateEvents.map(e => (
                    <EventCard key={e.id} event={e} onDelete={deleteEvent} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Month Event List */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-secondary)' }}>
              {MONTH_NAMES[currentMonth]} 전체 일정 ({monthEvents.length}건)
            </h4>
            {monthEvents.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>이번 달에는 일정이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {monthEvents.sort((a, b) => a.date.localeCompare(b.date)).map(e => (
                  <EventCard key={e.id} event={e} onDelete={deleteEvent} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Weekly View ═══ */}
      {activeTab === 'weekly' && (
        <div>
          <h3 className="serif-font" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', textAlign: 'center', marginBottom: '1.2rem' }}>
            이번 주 일정
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {weekDates.map((date, i) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(filteredEvents, dateStr);
              const isToday = date.toDateString() === now.toDateString();

              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card"
                  style={{
                    padding: '1rem 1.2rem',
                    border: isToday ? '1.5px solid var(--accent-gold)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: dayEvents.length > 0 ? '0.6rem' : 0 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: isToday ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isToday ? '#fff' : 'var(--text-secondary)' }}>
                        {DAY_NAMES[i]}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: isToday ? '#fff' : 'var(--text-primary)', lineHeight: 1 }}>
                        {date.getDate()}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontWeight: isToday ? 700 : 500, fontSize: '0.9rem',
                        color: isToday ? 'var(--accent-gold)' : 'var(--text-primary)',
                      }}>
                        {date.getMonth() + 1}월 {date.getDate()}일 ({DAY_NAMES[i]})
                        {isToday && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>오늘</span>}
                      </p>
                      {dayEvents.length === 0 && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>일정 없음</p>
                      )}
                    </div>
                  </div>

                  {dayEvents.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '3.4rem' }}>
                      {dayEvents.map(e => (
                        <EventCard key={e.id} event={e} onDelete={deleteEvent} compact />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Add Event Modal ═══ */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} color="var(--accent-gold)" /> 새 일정 추가
                </h3>
                <button onClick={() => setShowAddForm(false)} style={{ display: 'flex', padding: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Category */}
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>카테고리</label>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {Object.entries(CATEGORY_LABELS)
                  .filter(([key]) => !['holiday', 'liturgy'].includes(key))
                  .map(([key, label]) => {
                  const colors = CATEGORY_COLORS[key];
                  return (
                    <button key={key} onClick={() => setNewEvent(p => ({ ...p, category: key }))}
                      style={{
                        padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${newEvent.category === key ? colors.border : 'var(--glass-border)'}`,
                        background: newEvent.category === key ? colors.bg : 'transparent',
                        color: newEvent.category === key ? colors.text : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Title */}
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>제목 *</label>
              <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                placeholder="일정 제목"
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' }} />

              {/* Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>날짜 *</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>시간</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
                </div>
              </div>

              {/* End Date */}
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>종료일 (기간 일정인 경우)</label>
              <input type="date" value={newEvent.endDate} onChange={e => setNewEvent(p => ({ ...p, endDate: e.target.value }))}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' }} />

              {/* Description */}
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>설명</label>
              <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                placeholder="상세 내용을 입력하세요"
                rows={3}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', marginBottom: '1.2rem', fontFamily: 'inherit' }} />

              {/* Submit */}
              <button onClick={handleAddEvent}
                disabled={!newEvent.title.trim() || !newEvent.date}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}>
                <Plus size={16} /> 일정 추가하기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 이벤트 카드 컴포넌트
const EventCard = ({ event, onDelete, compact = false }) => {
  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.personal;
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
      padding: compact ? '0.6rem 0.8rem' : '0.8rem 1rem',
      borderRadius: '12px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      transition: 'all 0.15s',
    }}>
      {/* Category dot */}
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: colors.dot, flexShrink: 0, marginTop: '0.35rem',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: compact ? '0.85rem' : '0.95rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
          {event.title}
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.75rem', color: colors.text }}>
          {compact && <span>{event.date.slice(5).replace('-', '/')}</span>}
          {event.time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={10} /> {event.time}
            </span>
          )}
          {event.endDate && <span>~ {event.endDate.slice(5).replace('-', '/')}</span>}
          <span style={{
            padding: '0.1rem 0.4rem', borderRadius: '8px',
            background: colors.bg, fontSize: '0.7rem', fontWeight: 600,
          }}>
            {CATEGORY_LABELS[event.category]}
          </span>
        </div>
        {!compact && event.description && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.5 }}>
            {event.description}
          </p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => {
          if (showConfirm) { onDelete(event.id); } else { setShowConfirm(true); setTimeout(() => setShowConfirm(false), 2000); }
        }}
        style={{
          display: 'flex', padding: '0.3rem', borderRadius: '6px', flexShrink: 0, cursor: 'pointer',
          color: showConfirm ? '#e53e3e' : 'var(--text-secondary)',
          background: showConfirm ? 'rgba(229,62,62,0.1)' : 'transparent',
          transition: 'all 0.2s',
        }}
        title={showConfirm ? '다시 클릭하면 삭제됩니다' : '삭제'}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default Schedule;
