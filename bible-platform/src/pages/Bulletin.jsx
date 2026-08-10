import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, Upload, Calendar, ZoomIn, X, ChevronLeft, Edit, Plus, Trash2, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserContext } from '../context/UserContext';

// 우측 스크롤 힌트 컴포넌트
const ScrollHint = () => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'linear-gradient(90deg, #d4af37, #fde68a)',
    color: '#713f12',
    fontSize: '13px',
    fontWeight: '900',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    animation: 'scrollHintMove 1.5s ease-in-out infinite',
    userSelect: 'none',
    pointerEvents: 'none',
  }}>
    옆으로 밀어보기 <span style={{ letterSpacing: '-2px', fontSize: '14px' }}>❯❯</span>
    <style>{`
      @keyframes scrollHintMove {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(6px); }
      }
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
      }
    `}</style>
  </div>
);

const STATIC_INFO = {
  basicLife: [
    "온전한 주일 성수 (출 20:8 ~ 11)",
    "온전한 십일조 (말 3:7 ~ 10)",
    "매일 성경읽기 (행 17:11)",
    "매일 기도하기 (살전 5:17)",
    "매일 전도하기 (행 5:42)"
  ],
  prayers: [
    "① 목사님을 위해 기도하자",
    "② 전교인 주일 성수하기 위해 기도하자",
    "③ 전교인 십일조 생활하기 위해 기도하자",
    "④ 교회부흥과 영,혼의 성장을 위해 기도하자",
    "⑤ 세계선교 및 나라와 민족을 위해 기도하자"
  ],
  branches: [
    { name: "비난고난벧엘교회", pastor: "June Pastor" },
    { name: "팔라완벧엘교회", pastor: "Kenniel Pastor" },
    { name: "나보타스벧엘교회", pastor: "Predley Pastor" }
  ],
  schedule: [
    { type: "예배", time: "매일오전 5시", name: "새벽 기도회", place: "본당 예배실" },
    { type: "예배", time: "주일오전 9/30", name: "유치부 예배", place: "주일학교 기관실" },
    { type: "예배", time: "주일오전 9, 1시", name: "유,초등부예배", place: "주일학교 기관실" },
    { type: "예배", time: "주일오전 11시", name: "주일 낮 예배", place: "본당 예배실" },
    { type: "예배", time: "주일오후 1시", name: "주일 오후 예배", place: "본당 예배실" },
    { type: "예배", time: "화요일오후 2시", name: "여호와닛시기도회", place: "김남숙권사님가정" },
    { type: "모임", time: "수요일오전11시", name: "수요 기도회", place: "본당 예배실" },
    { type: "모임", time: "셋째주오전예배후", name: "권사특별기도회", place: "4층 친교실" },
    { type: "모임", time: "금요일오후 9시", name: "철야 기도회", place: "본당 예배실" },
    { type: "모임", time: "주일오전예배후", name: "요셉청년부 예배", place: "요셉 기관실" },
    { type: "모임", time: "주일오전에 예배후", name: "에스겔학생부 예배", place: "에스겔 기관실" }
  ]
};

const DEFAULT_WORSHIP_ORDER = [
  { type: "※ 목도", content: "", leader: "다같이" },
  { type: "경시 묵상", content: "", leader: "사회자" },
  { type: "기원", content: "", leader: "사회자" },
  { type: "※ 찬송", content: "27(27)", leader: "다같이" },
  { type: "※ 교독문", content: "24. 시편 100편", leader: "사회와 회중" },
  { type: "※ 신앙 고백", content: "사도신경", leader: "다같이" },
  { type: "찬송", content: "319(129)", leader: "다같이" },
  { type: "기도", content: "", leader: "다같이" },
  { type: "성경 봉독", content: "요 3:1-2-4", leader: "사회자" },
  { type: "찬송", content: "458(405)", leader: "다같이" },
  { type: "말씀 선포", content: "\"하나님의 관심\"", leader: "김석주 목사" },
  { type: "찬송", content: "427(191)", leader: "다같이" },
  { type: "헌금", content: "376(595)", leader: "헌금 위원" },
  { type: "헌금 기도", content: "", leader: "김석주 목사" },
  { type: "광고", content: "", leader: "사회자" },
  { type: "환영식", content: "", leader: "사회자" },
  { type: "※ 송영", content: "\"1\"", leader: "다같이" },
  { type: "※ 축도", content: "", leader: "김석주 목사" }
];

const DEFAULT_NEWS = [
  "환영 | 우리 교회에 처음 나오신 분들을 진심으로 환영합니다.",
  "\"전도하고, 전도하는 전도하는 전도하는 기쁨이 됩시다.\"",
  "8월은 \"영적수련의 달\"입니다. 기도와말씀으로 뜨겁게 지키바랍니다.",
  "이번주 \"나보타스밴드\" 정기기도회가 있습니다. (월:9일,10일)"
];

export default function Bulletin() {
  const { currentUser, showToast } = useContext(UserContext);
  const [bulletins, setBulletins] = useState([]);
  
  // UI State
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null); // Digital view
  const [selectedImage, setSelectedImage] = useState(null); // Legacy image view
  const [isZoomed, setIsZoomed] = useState(false);
  
  // New Bulletin Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [worshipOrder, setWorshipOrder] = useState([...DEFAULT_WORSHIP_ORDER]);
  const [news, setNews] = useState([...DEFAULT_NEWS]);
  const [newsImageFile, setNewsImageFile] = useState(null); // 교회 소식 이미지
  const [isUploading, setIsUploading] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState(null); // 수정 중인 주보 ID

  const isAdmin = !!currentUser;

  useEffect(() => {
    const q = query(collection(db, 'bulletins'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBulletins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleCreateDigital = async (e) => {
    e.preventDefault();
    if (!title || !date) return;
    
    setIsUploading(true);
    try {
      let newsImageUrl = null;
      
      if (newsImageFile) {
        const storageRef = ref(storage, `bulletins/news_${Date.now()}_${newsImageFile.name}`);
        await uploadBytes(storageRef, newsImageFile);
        newsImageUrl = await getDownloadURL(storageRef);
      }
      
      await addDoc(collection(db, 'bulletins'), {
        title,
        date,
        worshipOrder: worshipOrder.filter(w => w.type || w.content || w.leader),
        news: news.filter(n => n.trim() !== ''),
        newsImageUrl,
        isDigital: true,
        uploadedBy: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      setTitle('');
      setWorshipOrder([...DEFAULT_WORSHIP_ORDER]);
      setNews([...DEFAULT_NEWS]);
      setNewsImageFile(null);
      setIsUploadMode(false);
      if (showToast) showToast('스마트 주보가 발행되었습니다.');
    } catch (error) {
      console.error(error);
      if (showToast) showToast('발행 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDigital = async (e) => {
    e.preventDefault();
    if (!editingBulletin) return;
    setIsUploading(true);
    try {
      let newsImageUrl = editingBulletin.newsImageUrl || null;
      if (newsImageFile) {
        const storageRef = ref(storage, `bulletins/news_${Date.now()}_${newsImageFile.name}`);
        await uploadBytes(storageRef, newsImageFile);
        newsImageUrl = await getDownloadURL(storageRef);
      }
      await updateDoc(doc(db, 'bulletins', editingBulletin), {
        title,
        date,
        worshipOrder: worshipOrder.filter(w => w.type || w.content || w.leader),
        news: news.filter(n => n.trim() !== ''),
        newsImageUrl,
      });
      setEditingBulletin(null);
      setIsUploadMode(false);
      if (showToast) showToast('주보가 수정되었습니다.');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('수정 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNewsChange = (index, value) => {
    const newNews = [...news];
    newNews[index] = value;
    setNews(newNews);
  };
  
  const addNews = () => setNews([...news, ""]);
  const removeNews = (index) => setNews(news.filter((_, i) => i !== index));

  const handleWorshipChange = (index, field, value) => {
    const newOrder = [...worshipOrder];
    newOrder[index][field] = value;
    setWorshipOrder(newOrder);
  };

  const addWorship = () => setWorshipOrder([...worshipOrder, { type: "", content: "", leader: "" }]);
  const removeWorship = (index) => setWorshipOrder(worshipOrder.filter((_, i) => i !== index));

  const loadLastBulletin = () => {
    const lastDigital = bulletins.find(b => b.isDigital);
    if (lastDigital) {
      setWorshipOrder(lastDigital.worshipOrder || []);
      setNews(lastDigital.news || []);
      if (showToast) showToast('가장 최근 주보 내용을 불러왔습니다.');
    } else {
      if (showToast) showToast('불러올 스마트 주보가 없습니다.');
    }
  };

  const startEdit = (bulletin) => {
    setEditingBulletin(bulletin.id);
    setTitle(bulletin.title || '');
    setDate(bulletin.date || new Date().toISOString().split('T')[0]);
    setWorshipOrder(bulletin.worshipOrder?.length ? bulletin.worshipOrder : [...DEFAULT_WORSHIP_ORDER]);
    setNews(bulletin.news?.length ? bulletin.news : [...DEFAULT_NEWS]);
    setNewsImageFile(null);
    setIsUploadMode(true);
  };

  // --- Rendering Helpers ---
  const renderDigitalBulletin = (bulletin) => (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -20px', padding: '0 20px 20px 20px' }} className="hide-scrollbar">
      <div style={{ minWidth: '768px', maxWidth: '1000px', margin: '0 auto', background: '#fff', color: '#333', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ textAlign: 'center', color: '#1a365d', fontSize: '28px', borderBottom: '2px solid #1a365d', paddingBottom: '16px', marginBottom: '30px', fontFamily: 'var(--font-serif)' }}>
          {bulletin.title} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666', display: 'block', marginTop: '8px' }}>{bulletin.date}</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'stretch' }}>
          
          {/* Row 1, Left: 주일 오전 예배 */}
        <div>
          <h2 style={{ fontSize: '20px', color: '#4a148c', borderBottom: '2px solid #4a148c', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#4a148c', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✞</span>
            주일 오전 예배
          </h2>
          <div style={{ overflowX: 'auto', marginBottom: '20px', position: 'relative' }} className="hide-scrollbar">
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', whiteSpace: 'nowrap', minWidth: '320px' }}>
              <tbody>
                {bulletin.worshipOrder?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px dashed #eee' }}>
                    <td style={{ padding: '8px 0', width: '30%', fontWeight: item.type.includes('※') ? 'bold' : 'normal' }}>{item.type}</td>
                    <td style={{ padding: '8px 0', width: '45%', textAlign: 'center' }}>{item.content}</td>
                    <td style={{ padding: '8px 0', width: '25%', textAlign: 'right' }}>{item.leader}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ScrollHint />
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '30px' }}>※ 표는 일어나 주세요</div>
        </div>

        {/* Row 1, Right: 교회 소식, 지교회 */}
        <div>
          <h2 style={{ fontSize: '20px', color: '#2b6cb0', borderBottom: '2px solid #2b6cb0', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#2b6cb0', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>ℹ</span>
            교회 소식
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '15px' }}>
            {bulletin.news?.map((newsItem, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#fff', background: '#2b6cb0', borderRadius: '50%', width: '20px', height: '20px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginTop: '2px' }}>{idx + 1}</span>
                <span style={{ whiteSpace: 'pre-wrap' }}>{newsItem}</span>
              </div>
            ))}
          </div>

          {/* 교회 소식 첨부 이미지 */}
          {bulletin.newsImageUrl && (
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <img src={bulletin.newsImageUrl} alt="교회 소식 첨부 이미지" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
          )}
        </div>
        
        {/* Row 2, Left: 성도의 기본생활, 기도제목, 지교회 */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '12px', border: '1px solid #e9d8fd', marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#4a148c', marginBottom: '16px', fontSize: '16px' }}>✿ 성도의 기본생활 ✿</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', whiteSpace: 'nowrap', overflowX: 'auto', paddingBottom: '2px' }} className="hide-scrollbar">
              {STATIC_INFO.basicLife.map((life, i) => (
                <div key={i}>• {life}</div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ScrollHint />
              </div>
            </div>
          </div>

          <div style={{ background: '#ebf8ff', padding: '20px', borderRadius: '12px', border: '1px solid #bee3f8', marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#2b6cb0', marginBottom: '16px', fontSize: '16px' }}>벧엘교회 성도들의 기도 제목과 목표</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              {STATIC_INFO.prayers.map((prayer, i) => (
                <div key={i}>{prayer}</div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a', flex: 1 }}>
            <h3 style={{ textAlign: 'center', color: '#92400e', marginBottom: '16px', fontSize: '16px' }}>♥ 화도벧엘교회 필리핀지교회들 ♥</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px' }}>
              {STATIC_INFO.branches.map((branch, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                  <span>👤</span> {branch.name} : {branch.pastor}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2, Right: 예배 시간 안내 */}
        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ textAlign: 'center', color: '#14532d', marginBottom: '16px', fontSize: '16px' }}>🕒 예배 시간 안내</h3>
          <div style={{ overflowX: 'auto', flex: 1, paddingBottom: '4px' }} className="hide-scrollbar">
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', border: '1px solid #bbf7d0', textAlign: 'center', background: '#fff', whiteSpace: 'nowrap', minWidth: '300px' }}>
              <thead>
                <tr style={{ background: '#f0fdf4' }}>
                  <th style={{ padding: '8px', border: '1px solid #bbf7d0' }}>일시</th>
                  <th style={{ padding: '8px', border: '1px solid #bbf7d0' }}>예배종류</th>
                  <th style={{ padding: '8px', border: '1px solid #bbf7d0' }}>장소</th>
                </tr>
              </thead>
              <tbody>
                {STATIC_INFO.schedule.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px', border: '1px solid #bbf7d0' }}>{item.time}</td>
                    <td style={{ padding: '6px', border: '1px solid #bbf7d0' }}>{item.name}</td>
                    <td style={{ padding: '6px', border: '1px solid #bbf7d0' }}>{item.place}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ScrollHint />
            </div>
          </div>
          <div style={{ textAlign: 'center', background: '#dcfce7', padding: '10px', borderRadius: '20px', marginTop: '16px', color: '#14532d', fontWeight: 'bold' }}>
            날마다 마음을 같이하여 성전에 모이기를 힘쓰고... (행 2:46)
          </div>
        </div>

        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', paddingBottom: 'calc(var(--bottomnav-height, 64px) + 20px)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText color="var(--accent-gold)" /> 교회 주보
        </h1>
        {isAdmin && (
          <button 
            onClick={() => setIsUploadMode(!isUploadMode)}
            style={{ background: isUploadMode ? 'transparent' : 'var(--accent-gold)', color: isUploadMode ? 'var(--text-primary)' : '#fff', border: isUploadMode ? '1px solid var(--glass-border)' : 'none', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isUploadMode ? '목록으로' : <><Edit size={18} /> 새 주보 작성</>}
          </button>
        )}
      </div>

      {isUploadMode && isAdmin ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{editingBulletin ? '주보 수정' : '새 스마트 주보 작성'}</h2>
            <button type="button" onClick={loadLastBulletin} style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              지난주 주보 복사하기
            </button>
          </div>

          <form onSubmit={editingBulletin ? handleUpdateDigital : handleCreateDigital} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>주보 제목</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 2026년 8월 2주차 주보" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>날짜</label>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--accent-gold)' }}>교회 소식</h3>
              {news.map((n, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <textarea value={n} onChange={(e) => handleNewsChange(idx, e.target.value)} placeholder="소식을 입력하세요 (줄바꿈 가능)" rows={3} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', resize: 'vertical' }} />
                  <button type="button" onClick={() => removeNews(idx)} style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4f', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={addNews} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--glass-bg)', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  <Plus size={16} /> 텍스트 소식 추가
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--glass-bg)', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  <ImageIcon size={16} /> {newsImageFile ? '이미지 변경' : '소식 이미지 첨부'}
                  <input type="file" accept="image/*" onChange={(e) => setNewsImageFile(e.target.files[0])} style={{ display: 'none' }} />
                </label>
              </div>
              {newsImageFile && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  첨부된 이미지: {newsImageFile.name} 
                  <button type="button" onClick={() => setNewsImageFile(null)} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', textDecoration: 'underline' }}>삭제</button>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--accent-gold)' }}>주일 오전 예배 순서</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 40px', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <div>구분 (※기립)</div>
                <div>내용 (찬송가, 성경 등)</div>
                <div>담당자</div>
                <div></div>
              </div>
              {worshipOrder.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 40px', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={item.type} onChange={(e) => handleWorshipChange(idx, 'type', e.target.value)} placeholder="찬송, 기도..." style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                  <input type="text" value={item.content} onChange={(e) => handleWorshipChange(idx, 'content', e.target.value)} placeholder="내용" style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                  <input type="text" value={item.leader} onChange={(e) => handleWorshipChange(idx, 'leader', e.target.value)} placeholder="담당" style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                  <button type="button" onClick={() => removeWorship(idx)} style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4f', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={addWorship} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--glass-bg)', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '8px' }}>
                <Plus size={16} /> 순서 추가
              </button>
            </div>

            <button type="submit" disabled={isUploading} style={{ padding: '16px', background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: isUploading ? 'not-allowed' : 'pointer', marginTop: '16px', opacity: isUploading ? 0.7 : 1 }}>
              {isUploading ? '저장 중...' : editingBulletin ? '주보 수정 저장' : '스마트 주보 발행하기'}
            </button>
          </form>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
          {bulletins.map(bulletin => (
            <motion.div 
              key={bulletin.id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => bulletin.isDigital ? setSelectedBulletin(bulletin) : setSelectedImage(bulletin.imageUrl)}
            >
              {bulletin.isDigital ? (
                <div style={{ height: '180px', width: '100%', background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--glass-border)', position: 'relative' }}>
                  <FileText size={48} color="var(--accent-gold)" opacity={0.5} />
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-gold)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>스마트 주보</span>
                </div>
              ) : (
                <div style={{ height: '180px', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                  <img src={bulletin.imageUrl} alt={bulletin.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '12px' }}>이미지 주보</span>
                </div>
              )}
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{bulletin.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <Calendar size={14} /> {bulletin.date}
                  </div>
                </div>
                {isAdmin && bulletin.isDigital && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(bulletin); }}
                      style={{ background: 'rgba(212,175,55,0.15)', border: 'none', color: 'var(--accent-gold)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="수정"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('주보를 정말 삭제하시겠습니까?')) {
                          deleteDoc(doc(db, 'bulletins', bulletin.id));
                          if (showToast) showToast('주보가 삭제되었습니다.');
                        }
                      }}
                      style={{ background: 'rgba(255,0,0,0.1)', border: 'none', color: '#ff4d4f', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {bulletins.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              등록된 주보가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* Legacy Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 2001 }}>
              <button onClick={() => setSelectedImage(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                <ChevronLeft /> 뒤로 가기
              </button>
            </div>
            <motion.img 
              src={selectedImage} 
              alt="주보 상세"
              style={{ maxHeight: '90vh', maxWidth: '100%', objectFit: 'contain', cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
              animate={{ scale: isZoomed ? 1.5 : 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Digital Bulletin Modal */}
      <AnimatePresence>
        {selectedBulletin && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-primary)', zIndex: 2000, overflowY: 'auto' }}
          >
            <div style={{ position: 'sticky', top: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', zIndex: 10 }}>
              <button onClick={() => setSelectedBulletin(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <ChevronLeft /> 뒤로 가기
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {renderDigitalBulletin(selectedBulletin)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
