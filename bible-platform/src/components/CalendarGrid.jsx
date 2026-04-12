import React from 'react';
import { CATEGORY_COLORS } from '../data/scheduleData';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 재사용 가능한 월별 캘린더 그리드
 * @param {number} year
 * @param {number} month - 0-indexed (0=1월)
 * @param {object[]} events
 * @param {string|null} selectedDate - 'YYYY-MM-DD'
 * @param {function} onDateClick - (dateStr) => void
 */
const CalendarGrid = ({ year, month, events = [], selectedDate, onDateClick }) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // 해당 월의 첫 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=일
  const totalDaysInMonth = lastDay.getDate();

  // 이전 달 여백
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // 전체 셀 수 (6주 고정)
  const totalCells = 42;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startDow;
    let dayNum, dateStr, isCurrentMonth;

    if (dayOffset < 0) {
      // 이전 달
      dayNum = prevMonthLastDay + dayOffset + 1;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      dateStr = `${py}-${String(pm + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      isCurrentMonth = false;
    } else if (dayOffset >= totalDaysInMonth) {
      // 다음 달
      dayNum = dayOffset - totalDaysInMonth + 1;
      const nm = month === 11 ? 0 : month + 1;
      const ny = month === 11 ? year + 1 : year;
      dateStr = `${ny}-${String(nm + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      isCurrentMonth = false;
    } else {
      dayNum = dayOffset + 1;
      dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      isCurrentMonth = true;
    }

    // 해당 날짜의 이벤트
    const dayEvents = events.filter(e => {
      if (e.date === dateStr) return true;
      if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
      return false;
    });

    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const isSunday = i % 7 === 0;

    cells.push(
      <div
        key={i}
        onClick={() => isCurrentMonth && onDateClick && onDateClick(dateStr)}
        style={{
          position: 'relative',
          padding: 'clamp(0.25rem, 1vw, 0.4rem)',
          minHeight: 'clamp(44px, 10vw, 64px)',
          borderRadius: '10px',
          cursor: isCurrentMonth ? 'pointer' : 'default',
          background: isSelected
            ? 'rgba(196,164,132,0.18)'
            : isToday
              ? 'rgba(212,175,55,0.08)'
              : 'transparent',
          border: isSelected
            ? '1.5px solid var(--accent-gold)'
            : isToday
              ? '1.5px solid rgba(212,175,55,0.3)'
              : '1px solid transparent',
          opacity: isCurrentMonth ? 1 : 0.3,
          transition: 'all 0.15s',
        }}
      >
        <span style={{
          fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
          fontWeight: isToday ? 700 : 400,
          color: isToday
            ? 'var(--accent-gold)'
            : isSunday
              ? '#e53e3e'
              : 'var(--text-primary)',
        }}>
          {dayNum}
        </span>

        {/* 이벤트 점 표시 */}
        {dayEvents.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '2px',
            marginTop: '2px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {[...new Set(dayEvents.map(e => e.category))].map((cat) => (
              <span
                key={cat}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[cat]?.dot || 'var(--text-secondary)',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* 요일 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '0.3rem',
      }}>
        {DAYS_OF_WEEK.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 'clamp(0.65rem, 1.8vw, 0.78rem)',
            fontWeight: 600,
            color: i === 0 ? '#e53e3e' : 'var(--text-secondary)',
            padding: '0.3rem 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
      }}>
        {cells}
      </div>
    </div>
  );
};

export default CalendarGrid;
