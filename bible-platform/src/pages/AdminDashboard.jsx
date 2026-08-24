import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { UserContext } from '../context/UserContext';
import { Globe, Lock, ShieldCheck } from 'lucide-react';
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';

// 관리자 UID 목록 (Firebase Console → Authentication에서 확인)
const ADMIN_UIDS = ['mjuy1AdminUID']; // TODO: 실제 관리자 UID로 교체

const POSITIONS = ['성도', '집사', '권사', '장로', '전도사', '목사', '사모', '청년', '어린이/청소년'];

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: '⏳ 대기', color: '#ffd700', bg: 'rgba(255,215,0,0.12)' },
    approved: { label: '✅ 승인', color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
    rejected: { label: '🚫 거부', color: '#f44336', bg: 'rgba(244,67,54,0.12)' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 600 }}>
      {s.label}
    </span>
  );
};

const AdminDashboard = ({ currentUser }) => {
  const { isOpenAccessMode, toggleOpenAccessMode } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'memberProfiles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(list);
      setStats({
        total: list.length,
        pending: list.filter(u => u.status === 'pending').length,
        approved: list.filter(u => u.status === 'approved').length,
        rejected: list.filter(u => u.status === 'rejected').length,
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const approve = async (uid) => {
    await updateDoc(doc(db, 'memberProfiles', uid), {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: currentUser.uid,
    });
  };

  const reject = async (uid) => {
    if (!window.confirm('이 성도님의 가입을 거부(차단) 상태로 변경하시겠습니까?')) return;
    await updateDoc(doc(db, 'memberProfiles', uid), {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
    });
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'memberProfiles', userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const setAdmin = async (uid, isAdmin) => {
    await updateDoc(doc(db, 'memberProfiles', uid), { isAdmin });
  };

  const filtered = users.filter(u => {
    const matchFilter = filter === 'all' || u.status === filter;
    const matchSearch = !search || (u.displayName || '').includes(search) || (u.email || '').includes(search);
    return matchFilter && matchSearch;
  });

  const cardStyle = {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: '14px', padding: '1.25rem', backdropFilter: 'blur(10px)',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '2rem' }}>👑</span>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-gold)', margin: 0 }}>성도 가입 승인 관리</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>관리자 전용 대시보드</p>
        </div>
      </div>

      {/* 🌐 전체 공개(자유 입장) / 교인 승인제 모드 원터치 전환 카드 */}
      <div style={{
        background: isOpenAccessMode
          ? 'linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(20,40,20,0.4) 100%)'
          : 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(30,30,20,0.4) 100%)',
        border: isOpenAccessMode ? '1px solid rgba(76,175,80,0.5)' : '1px solid rgba(212,175,55,0.35)',
        borderRadius: '16px', padding: '1.2rem 1.4rem', marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        boxShadow: isOpenAccessMode ? '0 4px 20px rgba(76,175,80,0.15)' : '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.3rem' }}>{isOpenAccessMode ? '🌐' : '🔒'}</span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isOpenAccessMode ? '#4ade80' : 'var(--accent-gold)' }}>
              {isOpenAccessMode ? '전체 공개(자유 입장) 모드 ON' : '교인 승인제 모드 운영 중'}
            </h3>
            <span style={{
              fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
              background: isOpenAccessMode ? '#4caf50' : 'rgba(255,255,255,0.1)',
              color: isOpenAccessMode ? '#fff' : 'var(--text-secondary)'
            }}>
              {isOpenAccessMode ? '누구나 즉시 접속 가능' : '승인된 교인만 접속'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.83rem', color: '#d1d5db', lineHeight: 1.5, wordBreak: 'keep-all' }}>
            {isOpenAccessMode
              ? '✨ 현재 새신자 초청/전도 축제 등 관리자 승인 없이 누구나 자유롭게 모든 기능을 이용할 수 있는 상태입니다.'
              : '🛡️ 현재 승인제 상태입니다. 신규 가입자는 관리자가 승인하기 전까지 승인 대기 화면이 표시됩니다.'}
          </p>
        </div>

        <button
          onClick={() => toggleOpenAccessMode(!isOpenAccessMode)}
          style={{
            padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '0.88rem',
            background: isOpenAccessMode ? '#ef4444' : '#10b981',
            color: '#fff', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)', transition: 'all 0.2s', flexShrink: 0
          }}
        >
          {isOpenAccessMode ? (
            <>
              <Lock size={15} /> 🔒 승인제로 원위치 (OFF)
            </>
          ) : (
            <>
              <Globe size={15} /> 🌐 전체 공개 모드 켜기 (ON)
            </>
          )}
        </button>
      </div>

      {/* 🔔 관리자 실시간 알림 상태 & 즉시 테스트 패널 */}
      <div style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1.1rem 1.3rem',
        marginBottom: '1.5rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              가입 승인 실시간 알림 & 백그라운드 푸시 설정
            </h4>
          </div>
          <span style={{
            fontSize: '0.75rem',
            padding: '3px 9px',
            borderRadius: '10px',
            background: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
              ? 'rgba(76,175,80,0.15)'
              : 'rgba(239,68,68,0.15)',
            color: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
              ? '#4caf50'
              : '#ef4444',
            fontWeight: 700,
            border: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
              ? '1px solid rgba(76,175,80,0.3)'
              : '1px solid rgba(239,68,68,0.3)'
          }}>
            {typeof window !== 'undefined' && 'Notification' in window
              ? (Notification.permission === 'granted' ? '✅ 브라우저 알림 허용됨' : '⚠️ 알림 권한 필요')
              : '❌ 알림 미지원 브라우저'}
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.85rem 0', wordBreak: 'keep-all' }}>
          새 성도님이 가입을 신청하면 즉시 <strong>‘딩동’ 차임벨 소리</strong>와 <strong>시스템 팝업 알림</strong>이 전송됩니다.<br />
          스마트폰에서 <strong>[홈 화면에 추가]</strong>(PWA 앱 설치)를 해두시면 브라우저가 백그라운드에 있어도 더 안정적으로 알림을 수신할 수 있습니다.
        </p>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
            <button
              onClick={async () => {
                const res = await Notification.requestPermission();
                if (res === 'granted') alert('✅ 알림 권한이 정상적으로 허용되었습니다!');
                else alert('알림 권한이 허용되지 않았습니다. 브라우저 주소창 왼쪽 자물쇠 아이콘에서 알림을 허용해주세요.');
              }}
              style={{
                padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
                background: 'var(--accent-gold)', color: '#000', border: 'none', cursor: 'pointer'
              }}
            >
              🔔 알림 권한 허용하기
            </button>
          )}

          <button
            onClick={() => {
              // 1. 소리 재생
              try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                  const ctx = new AudioCtx();
                  const now = ctx.currentTime;
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = 'sine';
                  osc.frequency.setValueAtTime(523.25, now);
                  osc.frequency.setValueAtTime(659.25, now + 0.12);
                  osc.frequency.setValueAtTime(783.99, now + 0.24);
                  osc.frequency.setValueAtTime(1046.50, now + 0.36);
                  gain.gain.setValueAtTime(0.4, now);
                  gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start(now);
                  osc.stop(now + 1.2);
                }
              } catch (e) {}

              // 2. 알림 발송
              if ('Notification' in window && Notification.permission === 'granted') {
                const opt = {
                  body: '홍길동 성도님이 가입 승인을 요청했습니다. (테스트 알림)',
                  icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
                  badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
                  vibrate: [300, 150, 300, 150, 400],
                  tag: 'test-admin-notif',
                  requireInteraction: true
                };
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(reg => reg.showNotification('👑 [새 성도 가입 신청] 홍길동 (성도)', opt));
                } else {
                  new Notification('👑 [새 성도 가입 신청] 홍길동 (성도)', opt);
                }
              } else {
                alert('⚠️ 브라우저 알림 권한이 허용되어 있지 않습니다. 먼저 [알림 권한 허용하기]를 눌러주세요.');
              }
            }}
            style={{
              padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
              background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', cursor: 'pointer'
            }}
          >
            🔊 알림 & 차임벨 즉시 테스트
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: '전체', value: stats.total, color: 'var(--text-primary)' },
          { label: '대기', value: stats.pending, color: '#ffd700' },
          { label: '승인', value: stats.approved, color: '#4caf50' },
          { label: '거부', value: stats.rejected, color: '#f44336' },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 필터 & 검색 */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
          {[['pending','⏳ 대기'],['approved','✅ 승인'],['rejected','🚫 거부'],['all','전체']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '0.5rem 0.9rem', fontSize: '0.82rem', fontWeight: filter === val ? 700 : 400,
              background: filter === val ? 'rgba(212,175,55,0.2)' : 'transparent',
              color: filter === val ? 'var(--accent-gold)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer',
            }}>
              {label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 이메일 검색..."
          style={{
            flex: 1, minWidth: '180px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: '10px', padding: '0.5rem 1rem', color: 'var(--text-primary)', fontSize: '0.88rem',
          }}
        />
      </div>

      {/* 사용자 목록 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          해당 항목이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {filtered.map(user => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  ...cardStyle,
                  display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                  borderLeft: user.status === 'pending' ? '3px solid #ffd700' :
                               user.status === 'approved' ? '3px solid #4caf50' : '3px solid #f44336',
                }}
              >
                <img
                  src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || '?')}
                  alt="avatar"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {user.displayName || '이름 없음'}
                    </span>
                    {user.isAdmin && <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.2)', color: 'var(--accent-gold)', borderRadius: '999px', padding: '0.1rem 0.5rem' }}>관리자</span>}
                    <StatusBadge status={user.status} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {user.email} | {user.position || '직분 미설정'} {user.district ? `| ${user.district}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '0.1rem' }}>
                    신청일: {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('ko-KR') : '알 수 없음'}
                    {user.approvedAt?.toDate && ` | 승인일: ${user.approvedAt.toDate().toLocaleDateString('ko-KR')}`}
                  </div>
                </div>
                {/* 액션 버튼 */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {user.status !== 'approved' && (
                    <button onClick={() => approve(user.id)} style={{
                      background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)',
                      color: '#4caf50', borderRadius: '8px', padding: '0.4rem 0.9rem',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    }}>✅ 승인</button>
                  )}
                  {user.status !== 'rejected' && (
                    <button onClick={() => reject(user.id)} style={{
                      background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.35)',
                      color: '#f44336', borderRadius: '8px', padding: '0.4rem 0.9rem',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    }}>🚫 거부</button>
                  )}
                  <button onClick={() => setAdmin(user.id, !user.isAdmin)} style={{
                    background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                    color: 'var(--accent-gold)', borderRadius: '8px', padding: '0.4rem 0.7rem',
                    fontSize: '0.78rem', cursor: 'pointer',
                  }}>
                    {user.isAdmin ? '👑 관리자 해제' : '👑 관리자 지정'}
                  </button>
                  <button
                    onClick={() => setUserToDelete(user)}
                    title="기록 영구 삭제"
                    style={{
                      background: 'rgba(244,67,54,0.08)',
                      border: '1px solid rgba(244,67,54,0.25)',
                      color: '#f44336', borderRadius: '8px', padding: '0.4rem 0.65rem',
                      fontSize: '0.82rem', cursor: 'pointer',
                    }}
                  >
                    🗑️ 삭제
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ⚠️ 2중 안전 삭제 확인 모달 */}
      {userToDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(244,67,54,0.4)',
              borderRadius: '20px',
              padding: '2rem 1.75rem',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              textAlign: 'center',
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.4)',
              color: '#f44336', fontSize: '1.8rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              ⚠️
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              성도 가입 기록 영구 삭제
            </h3>

            <div style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', textAlign: 'left',
            }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {userToDelete.displayName || '이름 없음'} ({userToDelete.position || '직분 미설정'})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {userToDelete.email}
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#ff8a80', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              정말로 이 성도님의 가입 기록을 완전히 삭제하시겠습니까?<br />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ※ 삭제 시 해당 성도님은 앱을 다시 이용하기 위해 재가입 신청을 해야 합니다.
              </span>
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? '삭제 진행 중...' : '🗑️ 네, 영구 삭제합니다'}
              </button>
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  padding: '0.85rem 1.25rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
