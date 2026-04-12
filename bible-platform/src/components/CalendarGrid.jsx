import React from 'react';
import { CATEGORY_COLORS, getDateLabel } from '../data/scheduleData';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 재사용 가능한 월별 캘린더 그리드
 * - 공휴일/절기 라벨을 날짜 아래에 표시
 * - 이벤트 카테고리별 색상 dot 표시
 */
const CalendarGrid = ({ year, month, events = [], selectedDate, onDateClick }) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const totalDaysInMonth = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const totalCells = 42;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startDow;
    let dayNum, dateStr, isCurrentMonth;

    if (dayOffset < 0) {
      dayNum = prevMonthLastDay + dayOffset + 1;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      dateStr = `${py}-${String(pm + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      isCurrentMonth = false;
    } else if (dayOffset >= totalDaysInMonth) {
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

    // 공휴일/절기 라벨
    const label = isCurrentMonth ? getDateLabel(dateStr) : null;

    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const isSunday = i % 7 === 0;
    const isHoliday = label?.type === 'holiday';

    cells.push(
      <div
        key={i}
        onClick={() => isCurrentMonth && onDateClick && onDateClick(dateStr)}
        style={{
          position: 'relative',
          padding: 'clamp(0.2rem, 0.6vw, 0.35rem) clamp(0.15rem, 0.4vw, 0.25rem)',
          minHeight: 'clamp(52px, 12vw, 76px)',
          borderRadius: '8px',
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
          opacity: isCurrentMonth ? 1 : 0.25,
          transition: 'all 0.15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* 날짜 숫자 */}
        <span style={{
          fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
          fontWeight: isToday ? 700 : 400,
          color: isToday
            ? 'var(--accent-gold)'
            : (isSunday || isHoliday)
              ? '#e53e3e'
              : 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          {dayNum}
        </span>

        {/* 공휴일 / 절기 라벨 */}
        {label && (
          <span style={{
            fontSize: 'clamp(0.42rem, 1.1vw, 0.58rem)',
            color: label.color,
            fontWeight: 600,
            lineHeight: 1.1,
            marginTop: '1px',
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
          }}>
            {label.text}
          </span>
        )}

        {/* 이벤트 카테고리 dot (공휴일/절기 제외한 일정만) */}
        {(() => {
          const nonLabelEvents = dayEvents.filter(e => e.category !== 'holiday' && e.category !== 'liturgy');
          const cats = [...new Set(nonLabelEvents.map(e => e.category))];
          if (cats.length === 0) return null;
          return (
            <div style={{
              display: 'flex',
              gap: '2px',
              marginTop: 'auto',
              paddingTop: '1px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {cats.map((cat) => (
                <span
                  key={cat}
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: CATEGORY_COLORS[cat]?.dot || 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          );
        })()}
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

      {/* 범례 */}
      <div style={{
        display: 'flex',
        gap: '0.8rem',
        marginTop: '0.8rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
        color: 'var(--text-secondary)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.holiday.dot }} />
          공휴일
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.liturgy.dot }} />
          교회 절기
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.joshua.dot }} />
          남전도회
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CATEGORY_COLORS.church.dot }} />
          교회 전체
        </span>
      </div>
    </div>
  );
};

export default CalendarGrid;
