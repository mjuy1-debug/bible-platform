import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Plan = () => {
  const { planProgress, togglePlanDay } = useContext(UserContext);
  const { totalDays, completedDays, dailySchedule } = planProgress;
  const pct = ((completedDays.length / totalDays) * 100).toFixed(1);
  const today = completedDays.length + 1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="serif-font" style={{ fontSize: '2.5rem', color: 'var(--accent-gold)' }}>성경 통독 플랜</h2>
        <p style={{ color: 'var(--text-secondary)' }}>매일 꾸준하게 말씀과 동행하는 습관을 만들어보세요.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
              <Calendar size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'bottom', color: 'var(--accent-gold)' }} />
              1년 전체 통독 챌린지
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {completedDays.length > 0 ? `오늘: Day ${Math.min(today, totalDays)} — ${dailySchedule.find(d => d.day === Math.min(today, totalDays))?.range || '완료'}` : '아직 시작 전입니다. 첫 날을 시작해보세요!'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{pct}%</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{completedDays.length} / {totalDays} 일차</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid var(--glass-border)' }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-gold), #FFF8DC)', borderRadius: '5px' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }} />
        </div>

        {/* Daily Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {dailySchedule.map((item) => {
            const done = completedDays.includes(item.day);
            const isToday = item.day === Math.min(today, totalDays) && !completedDays.includes(totalDays);

            return (
              <div key={item.day}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.2rem', borderRadius: '12px',
                  background: isToday ? 'rgba(196,164,132,0.12)' : 'transparent',
                  border: isToday ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                  transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => togglePlanDay(item.day)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    {done ? <CheckCircle2 color="var(--accent-gold)" size={26} /> : <Circle color="var(--text-secondary)" size={26} />}
                  </button>
                  <div>
                    <h4 style={{ fontWeight: 600, color: isToday ? 'var(--accent-gold)' : done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                      Day {item.day}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{item.range}</p>
                  </div>
                </div>
                {isToday && !done && (
                  <button onClick={() => window.location.href='/read'} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                    읽기 →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Plan;
