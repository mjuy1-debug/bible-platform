import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
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
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

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
    if (!window.confirm('이 사용자를 거부하시겠습니까?')) return;
    await updateDoc(doc(db, 'memberProfiles', uid), {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
    });
  };

  const deleteUser = async (uid) => {
    if (!window.confirm('이 기록을 완전히 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'memberProfiles', uid));
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
                  <button onClick={() => deleteUser(user.id)} style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.4rem 0.6rem',
                    fontSize: '0.78rem', cursor: 'pointer',
                  }}>🗑️</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
