import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Flame, Users, Sparkles, X, ChevronRight, Heart, Award, Star, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import { collection, doc, onSnapshot, updateDoc, increment, setDoc, getDocs } from 'firebase/firestore';

import { CHURCH_DEPARTMENTS } from '../data/churchDepartments';

// 화도벧엘교회 공식 8대 기관/부서 초기 데이터 (순수 0점 초기화)
const INITIAL_DISTRICTS = CHURCH_DEPARTMENTS.map(dept => ({
  id: dept.id,
  name: dept.name,
  shortName: dept.shortName,
  category: dept.category,
  icon: dept.icon,
  leader: dept.category,
  membersCount: 0,
  totalTalents: 0,
  completedQuizzes: 0,
  cheers: 0
}));

export default function DistrictLeaderboardModal({ isOpen, onClose, userDistrict, userTalents = 0 }) {
  const { memberProfile, currentUser, showToast } = useContext(UserContext);
  const [districts, setDistricts] = useState(INITIAL_DISTRICTS);
  const [activeTab, setActiveTab] = useState('ranking'); // 'ranking' | 'feed' | 'myDistrict'
  const [myCheers, setMyCheers] = useState({});
  const [liveFeeds, setLiveFeeds] = useState([]);

  const currentDistrictName = memberProfile?.district || userDistrict || '소속 기관 미선택';

  // Firestore 실시간 기관 점수 및 소속 성도 수 동기화
  useEffect(() => {
    if (!isOpen) return;

    try {
      const unsubScores = onSnapshot(collection(db, 'districtScores'), (snap) => {
        const loadedScores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDistricts(prev => {
          const updated = prev.map(init => {
            const found = loadedScores.find(l => l.id === init.id || l.name === init.name);
            return found ? { ...init, ...found } : init;
          });
          updated.sort((a, b) => (b.totalTalents || 0) - (a.totalTalents || 0));
          return updated;
        });
      }, (err) => {
        console.warn('districtScores onSnapshot error:', err.code);
      });

      const unsubMembers = onSnapshot(collection(db, 'memberProfiles'), (snap) => {
        const counts = {};
        snap.docs.forEach(d => {
          const data = d.data();
          const dist = data.district;
          if (dist) {
            counts[dist] = (counts[dist] || 0) + 1;
          }
        });
        setDistricts(prev => prev.map(init => {
          const cnt = counts[init.name] || counts[init.shortName] || 0;
          return { ...init, membersCount: cnt };
        }));
      }, (err) => {
        console.warn('memberProfiles count error:', err.code);
      });

      return () => {
        unsubScores();
        unsubMembers();
      };
    } catch (e) {
      console.warn('구역 랭킹 초기화:', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 구역 응원하기 (+1)
  const handleCheerDistrict = async (districtId, districtName, e) => {
    e.stopPropagation();
    if (myCheers[districtId]) {
      if (showToast) showToast('오늘 이미 응원하셨습니다! ❤️');
      return;
    }

    setMyCheers(prev => ({ ...prev, [districtId]: true }));
    setDistricts(prev => prev.map(d => d.id === districtId ? { ...d, cheers: (d.cheers || 0) + 1 } : d));

    if (showToast) showToast(`🔥 [${districtName}]을 힘차게 응원했습니다! (+1 응원)`);

    try {
      await updateDoc(doc(db, 'districtScores', districtId), {
        cheers: increment(1)
      });
    } catch {
      // Create if not exists
      try {
        await setDoc(doc(db, 'districtScores', districtId), {
          cheers: increment(1),
          name: districtName
        }, { merge: true });
      } catch (err) {
        console.warn('Cheer sync error:', err);
      }
    }
  };

  const top3 = districts.slice(0, 3);
  const maxTalents = Math.max(...districts.map(d => d.totalTalents || 1));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            background: '#12121a',
            borderRadius: '24px',
            border: '1px solid rgba(212,175,55,0.4)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(20,20,30,0.95) 100%)',
            borderBottom: '1px solid rgba(212,175,55,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4af37, #f3e5ab)',
                color: '#1a1400', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Trophy size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  구역·교구 골든벨 대항전
                  <span style={{ fontSize: '10px', background: 'rgba(212,175,55,0.2)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>실시간 리그</span>
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  함께 읽고 함께 푸는 화도벧엘교회 말씀 공동체
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* 서브 탭 바 */}
          <div style={{
            display: 'flex',
            padding: '10px 20px',
            background: 'rgba(16,16,24,0.95)',
            borderBottom: '1px solid var(--glass-border)',
            gap: '8px'
          }}>
            <button
              onClick={() => setActiveTab('ranking')}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '12px',
                background: activeTab === 'ranking' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'ranking' ? '#111' : 'var(--text-secondary)',
                fontWeight: activeTab === 'ranking' ? 800 : 600,
                fontSize: '0.84rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              🏆 구역 순위 (대항전)
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '12px',
                background: activeTab === 'feed' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'feed' ? '#111' : 'var(--text-secondary)',
                fontWeight: activeTab === 'feed' ? 800 : 600,
                fontSize: '0.84rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              ⚡ 실시간 골든벨 피드
            </button>
          </div>

          {/* 본문 스크롤 영역 */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            {activeTab === 'ranking' && (
              <div>
                {/* 1. 명예의 전당 Top 3 포디움 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.15fr 1fr',
                  gap: '8px',
                  alignItems: 'flex-end',
                  marginBottom: '20px',
                  padding: '10px 0'
                }}>
                  {/* 2위 */}
                  {top3[1] && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      style={{
                        background: 'linear-gradient(180deg, rgba(156,163,175,0.2) 0%, rgba(20,20,28,0.9) 100%)',
                        border: '1px solid rgba(156,163,175,0.4)',
                        borderRadius: '16px',
                        padding: '12px 8px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '1.4rem', marginBottom: '2px' }}>🥈</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e5e7eb' }}>{top3[1].name}</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#e5e7eb', marginTop: '4px' }}>
                        {top3[1].totalTalents.toLocaleString()} <span style={{ fontSize: '10px' }}>달란트</span>
                      </span>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>{top3[1].membersCount}명 참여</span>
                    </motion.div>
                  )}

                  {/* 1위 (챔피언) */}
                  {top3[0] && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      style={{
                        background: 'linear-gradient(180deg, rgba(212,175,55,0.3) 0%, rgba(25,23,15,0.95) 100%)',
                        border: '2px solid rgba(212,175,55,0.7)',
                        borderRadius: '20px',
                        padding: '18px 10px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 8px 25px rgba(212,175,55,0.25)',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '-10px', background: 'var(--accent-gold)', color: '#111',
                        fontSize: '9px', fontWeight: 900, padding: '2px 8px', borderRadius: '10px'
                      }}>
                        👑 현재 1위
                      </div>
                      <span style={{ fontSize: '2rem', marginBottom: '2px' }}>🥇</span>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{top3[0].name}</span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-gold)', marginTop: '4px' }}>
                        {top3[0].totalTalents.toLocaleString()} <span style={{ fontSize: '11px' }}>달란트</span>
                      </span>
                      <span style={{ fontSize: '11px', color: '#f3e5ab' }}>{top3[0].membersCount}명 참여 / {top3[0].completedQuizzes}완주</span>
                    </motion.div>
                  )}

                  {/* 3위 */}
                  {top3[2] && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        background: 'linear-gradient(180deg, rgba(205,127,50,0.2) 0%, rgba(20,20,28,0.9) 100%)',
                        border: '1px solid rgba(205,127,50,0.4)',
                        borderRadius: '16px',
                        padding: '12px 8px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '1.4rem', marginBottom: '2px' }}>🥉</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fca5a5' }}>{top3[2].name}</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fca5a5', marginTop: '4px' }}>
                        {top3[2].totalTalents.toLocaleString()} <span style={{ fontSize: '10px' }}>달란트</span>
                      </span>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>{top3[2].membersCount}명 참여</span>
                    </motion.div>
                  )}
                </div>

                {/* 2. 전체 구역 랭킹 리스트 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {districts.map((d, index) => {
                    const isMyDistrict = currentDistrictName.includes(d.name.split(' ')[0]) || d.name.includes(currentDistrictName);
                    const percent = Math.min(100, Math.round((d.totalTalents / maxTalents) * 100));

                    return (
                      <div
                        key={d.id}
                        style={{
                          background: isMyDistrict ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(20,20,28,0.95) 100%)' : 'rgba(255,255,255,0.03)',
                          border: isMyDistrict ? '1.5px solid rgba(212,175,55,0.6)' : '1px solid var(--glass-border)',
                          borderRadius: '16px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: index === 0 ? '#d4af37' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.08)',
                              color: index < 3 ? '#111' : 'var(--text-secondary)',
                              fontWeight: 900, fontSize: '0.85rem',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {index + 1}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                  {d.name}
                                </span>
                                {isMyDistrict && (
                                  <span style={{
                                    fontSize: '10px', fontWeight: 800,
                                    background: 'var(--accent-gold)', color: '#111',
                                    padding: '1px 6px', borderRadius: '6px'
                                  }}>
                                    우리 구역 🏠
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                구역장: {d.leader} | {d.membersCount}명 동참
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                                {d.totalTalents.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>달란트</span>
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                총 {d.completedQuizzes}세트 완주
                              </div>
                            </div>

                            {/* 응원하기 버튼 */}
                            <button
                              onClick={(e) => handleCheerDistrict(d.id, d.name, e)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '6px 10px', borderRadius: '10px',
                                background: myCheers[d.id] ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${myCheers[d.id] ? '#ef4444' : 'var(--glass-border)'}`,
                                color: myCheers[d.id] ? '#ef4444' : 'var(--text-secondary)',
                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Flame size={13} fill={myCheers[d.id] ? '#ef4444' : 'none'} />
                              <span>{d.cheers || 0}</span>
                            </button>
                          </div>
                        </div>

                        {/* 달란트 진행 바 */}
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              background: isMyDistrict 
                                ? 'linear-gradient(90deg, #d4af37, #fef08a)' 
                                : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'feed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                  fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5
                }}>
                  💡 성도님들이 퀴즈를 풀고 달란트를 획득할 때마다 소속 구역의 점수가 실시간으로 누적됩니다!
                </div>

                {liveFeeds.map((feed) => (
                  <motion.div
                    key={feed.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '14px 16px', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Sparkles size={16} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                        {feed.text}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {feed.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 내 구역 독려 푸터 */}
          <div style={{
            padding: '14px 20px',
            background: 'rgba(14,14,20,0.98)',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                나의 소속: <strong style={{ color: '#fff' }}>{currentDistrictName}</strong> (기여도: {userTalents} 달란트)
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px 18px', borderRadius: '10px',
                background: 'var(--accent-gold)', color: '#1a1400',
                fontSize: '0.84rem', fontWeight: 800, border: 'none',
                cursor: 'pointer'
              }}
            >
              퀴즈 풀고 구역 점수 올리기 🚀
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
