import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, Upload, Calendar, ZoomIn, X, ChevronLeft, Edit, Plus, Trash2, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserContext } from '../context/UserContext';

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

const DEFAULT_AFTERNOON_ORDER = [
  { type: "속도믵기도", content: "", leader: "다같이" },
  { type: "사례", content: "", leader: "사회자" },
  { type: "창송", content: "", leader: "다같이" },
  { type: "기도", content: "", leader: "" },
  { type: "성경 봉독", content: "", leader: "사회자" },
  { type: "창송", content: "", leader: "다같이" },
  { type: "말씀 선포", content: "", leader: "김석주 목사" },
  { type: "헌금", content: "", leader: "헌금 위원" },
  { type: "광고", content: "", leader: "사회자" },
  { type: "※ 송영", content: "\"1\"", leader: "다같이" },
  { type: "※ 축도", content: "", leader: "김석주 목사" }
];

export default function Bulletin() {
  const { currentUser, showToast } = useContext(UserContext);
  const [bulletins, setBulletins] = useState([]);
  
  // UI State
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null); // Digital view
  const [selectedImage, setSelectedImage] = useState(null); // Legacy image view
  const [bulletinZoom, setBulletinZoom] = useState(0.4); // Zoom control (default: smallest = 0.4)
  
  // New Bulletin Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [worshipOrder, setWorshipOrder] = useState([...DEFAULT_WORSHIP_ORDER]);
  const [news, setNews] = useState([...DEFAULT_NEWS]);
  const [newsSubtitle, setNewsSubtitle] = useState(''); // 교회 소식 부제목/공지 문구
  const [newsImageFile, setNewsImageFile] = useState(null); // 교회 소식 이미지
  const [includeAfternoon, setIncludeAfternoon] = useState(false); // 오후 예배 포함 여부
  const [afternoonOrder, setAfternoonOrder] = useState([...DEFAULT_AFTERNOON_ORDER]); // 주일 오후 예배 순서
  const [isUploading, setIsUploading] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState(null); // 수정 중인 주보 ID

  const isAdmin = currentUser && (
    currentUser.email?.includes('admin') || 
    currentUser.displayName?.includes('관리자') || 
    currentUser.displayName?.includes('유정파파')
  );

  useEffect(() => {
    const q = query(collection(db, 'bulletins'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBulletins(
        snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(b => !b.isSermon && (b.isDigital || b.imageUrl || b.worshipOrder))
      );
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
        newsSubtitle: newsSubtitle.trim(),
        newsImageUrl,
        includeAfternoon,
        afternoonOrder: includeAfternoon ? afternoonOrder.filter(w => w.type || w.content || w.leader) : [],
        isDigital: true,
        uploadedBy: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      setTitle('');
      setWorshipOrder([...DEFAULT_WORSHIP_ORDER]);
      setNews([...DEFAULT_NEWS]);
      setNewsSubtitle('');
      setIncludeAfternoon(false);
      setAfternoonOrder([...DEFAULT_AFTERNOON_ORDER]);
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
        newsSubtitle: newsSubtitle.trim(),
        newsImageUrl,
        includeAfternoon,
        afternoonOrder: includeAfternoon ? afternoonOrder.filter(w => w.type || w.content || w.leader) : [],
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
      setNewsSubtitle(lastDigital.newsSubtitle || '');
      setIncludeAfternoon(lastDigital.includeAfternoon || false);
      setAfternoonOrder(lastDigital.afternoonOrder?.length ? lastDigital.afternoonOrder : [...DEFAULT_AFTERNOON_ORDER]);
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
    setNewsSubtitle(bulletin.newsSubtitle || '');
    setIncludeAfternoon(bulletin.includeAfternoon || false);
    setAfternoonOrder(bulletin.afternoonOrder?.length ? bulletin.afternoonOrder : [...DEFAULT_AFTERNOON_ORDER]);
    setNewsImageFile(null);
    setIsUploadMode(true);
  };

  // --- Rendering Helpers ---
  const renderDigitalBulletin = (bulletin) => (
    <div style={{ margin: '0 auto', maxWidth: '800px', padding: '10px 0 30px' }}>
      <div style={{ background: '#fff', color: '#333', padding: '24px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ textAlign: 'center', color: '#1a365d', fontSize: '1.5rem', borderBottom: '2px solid #1a365d', paddingBottom: '16px', marginBottom: '24px', fontFamily: 'var(--font-serif)', lineHeight: '1.4' }}>
          {bulletin.title} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666', display: 'block', marginTop: '6px' }}>{bulletin.date}</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: 주일 예배 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {/* 오전 예배 */}
            <div style={{ flex: '1 1 300px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#4a148c', borderBottom: '2px solid #4a148c', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#4a148c', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✞</span>
                주일 오전 예배
              </h2>
              <div style={{ marginBottom: '16px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                <table style={{ width: '100%', fontSize: '0.95rem', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <tbody>
                    {bulletin.worshipOrder?.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px dashed #eee' }}>
                        <td style={{ padding: '10px 4px', width: '28%', fontWeight: item.type.includes('※') ? 'bold' : 'normal', verticalAlign: 'top' }}>{item.type}</td>
                        <td style={{ padding: '10px 4px', width: '44%', textAlign: 'center', verticalAlign: 'top' }}>{item.content}</td>
                        <td style={{ padding: '10px 4px', width: '28%', textAlign: 'right', color: '#555', verticalAlign: 'top' }}>{item.leader}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>※ 표는 일어나 주세요</div>
            </div>

            {/* 오후 예배 (선택적) */}
            {bulletin.includeAfternoon && bulletin.afternoonOrder?.length > 0 && (
              <div style={{ flex: '1 1 300px' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#6b21a8', borderBottom: '2px solid #6b21a8', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#6b21a8', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✞</span>
                  주일 오후 예배
                </h2>
                <div style={{ marginBottom: '16px', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                  <table style={{ width: '100%', fontSize: '0.95rem', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <tbody>
                      {bulletin.afternoonOrder.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px dashed #eee' }}>
                          <td style={{ padding: '10px 4px', width: '28%', fontWeight: item.type.includes('※') ? 'bold' : 'normal', verticalAlign: 'top' }}>{item.type}</td>
                          <td style={{ padding: '10px 4px', width: '44%', textAlign: 'center', verticalAlign: 'top' }}>{item.content}</td>
                          <td style={{ padding: '10px 4px', width: '28%', textAlign: 'right', color: '#555', verticalAlign: 'top' }}>{item.leader}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>※ 표는 일어나 주세요</div>
              </div>
            )}
          </div>

          {/* Section 2: 교회 소식 */}
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#2b6cb0', borderBottom: '2px solid #2b6cb0', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#2b6cb0', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>ℹ</span>
              교회 소식
            </h2>

            {bulletin.newsSubtitle && (
              <div style={{ background: '#eef6ff', border: '1px solid #bee3f8', borderRadius: '12px', padding: '16px', marginBottom: '20px', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', fontSize: '0.95rem', color: '#2b4a70', lineHeight: 1.7 }}>
                {bulletin.newsSubtitle}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.7 }}>
              {bulletin.news?.map((newsItem, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#fff', background: '#2b6cb0', borderRadius: '50%', width: '24px', height: '24px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', marginTop: '3px', fontWeight: 'bold' }}>{idx + 1}</span>
                  <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', flex: 1 }}>
                    {newsItem}
                  </span>
                </div>
              ))}
            </div>

            {bulletin.newsImageUrl && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img src={bulletin.newsImageUrl} alt="교회 소식 첨부 이미지" style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
              </div>
            )}
          </div>

          {/* Section 3: 기타 정보 (3열 그리드) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '16px', border: '1px solid #e9d8fd' }}>
              <h3 style={{ textAlign: 'center', color: '#4a148c', marginBottom: '16px', fontSize: '1rem', fontWeight: 'bold' }}>✿ 성도의 기본생활 ✿</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#444' }}>
                {STATIC_INFO.basicLife.map((life, i) => (
                  <div key={i}>• {life}</div>
                ))}
              </div>
            </div>

            <div style={{ background: '#ebf8ff', padding: '20px', borderRadius: '16px', border: '1px solid #bee3f8' }}>
              <h3 style={{ textAlign: 'center', color: '#2b6cb0', marginBottom: '16px', fontSize: '1rem', fontWeight: 'bold' }}>벧엘교회 기도 제목</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#444' }}>
                {STATIC_INFO.prayers.map((prayer, i) => (
                  <div key={i}>{prayer}</div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '16px', border: '1px solid #fde68a' }}>
              <h3 style={{ textAlign: 'center', color: '#92400e', marginBottom: '16px', fontSize: '1rem', fontWeight: 'bold' }}>♥ 필리핀 지교회 ♥</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
                {STATIC_INFO.branches.map((branch, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                    <span>👤</span> {branch.name} : {branch.pastor}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 예배 시간 안내 */}
          <div style={{ background: '#f0fdf4', padding: '20px 16px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ textAlign: 'center', color: '#14532d', marginBottom: '16px', fontSize: '1.1rem', fontWeight: 'bold' }}>🕒 예배 시간 안내</h3>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '320px', fontSize: '0.82rem', borderCollapse: 'collapse', textAlign: 'center', background: '#fff', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '36%' }} />
                  <col style={{ width: '36%' }} />
                  <col style={{ width: '28%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#dcfce7', color: '#14532d' }}>
                    <th style={{ padding: '10px 6px', border: '1px solid #bbf7d0', wordBreak: 'keep-all' }}>일시</th>
                    <th style={{ padding: '10px 6px', border: '1px solid #bbf7d0', wordBreak: 'keep-all' }}>예배종류</th>
                    <th style={{ padding: '10px 6px', border: '1px solid #bbf7d0', wordBreak: 'keep-all' }}>장소</th>
                  </tr>
                </thead>
                <tbody>
                  {STATIC_INFO.schedule.map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fefb' }}>
                      <td style={{ padding: '9px 6px', border: '1px solid #bbf7d0', wordBreak: 'keep-all', overflowWrap: 'break-word', lineHeight: 1.4 }}>{item.time}</td>
                      <td style={{ padding: '9px 6px', border: '1px solid #bbf7d0', fontWeight: 'bold', color: '#166534', wordBreak: 'keep-all', overflowWrap: 'break-word', lineHeight: 1.4 }}>{item.name}</td>
                      <td style={{ padding: '9px 6px', border: '1px solid #bbf7d0', wordBreak: 'keep-all', overflowWrap: 'break-word', lineHeight: 1.4 }}>{item.place}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', background: '#166534', color: '#fff', padding: '12px', borderRadius: '12px', marginTop: '16px', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'keep-all' }}>
              날마다 마음을 같이하여 성전에 모이기를 힘쓰고... (행 2:46)
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.6rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            <FileText color="var(--accent-gold)" /> 교회 주보
          </h1>
          <p style={{ fontSize: 'clamp(0.82rem, 2.5vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word', margin: '6px 0 0 0' }}>
            벧엘교회의 주간 예배 순서, 교회 소식 및 나눔을 확인하실 수 있습니다.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsUploadMode(!isUploadMode)}
            style={{ background: isUploadMode ? 'transparent' : 'var(--accent-gold)', color: isUploadMode ? 'var(--text-primary)' : '#fff', border: isUploadMode ? '1px solid var(--glass-border)' : 'none', borderRadius: '20px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}
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

              {/* 교회 소식 부제목/공지 문구 */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  📢 소식 부제목 / 환영 · 공지 문구 <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(선택 · 줄바꿈 가능, 번호 항목 위에 표시됩니다)</span>
                </label>
                <textarea
                  value={newsSubtitle}
                  onChange={(e) => setNewsSubtitle(e.target.value)}
                  placeholder={'예)\n[환 영] 우리 교회에 처음 나오신 분들은 진심으로 환영합니다.\n* 전도하는 교회, 전도하는 성도, 전도하는 기관이 됩시다.\nP/s" 김애라님, 화도벧엘교회 교우 되심을 축하합니다. "'}
                  rows={5}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--accent-gold)', color: 'var(--text-primary)', resize: 'vertical', fontSize: '14px', lineHeight: 1.6 }}
                />
              </div>

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
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: '420px' }}>
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
                </div>
              </div>
              <button type="button" onClick={addWorship} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--glass-bg)', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '8px' }}>
                <Plus size={16} /> 순서 추가
              </button>
            </div>

            {/* 주일 오후 예배 순서 (선택) */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={includeAfternoon}
                    onChange={(e) => setIncludeAfternoon(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#6b21a8', cursor: 'pointer' }}
                  />
                  <h3 style={{ fontSize: '18px', color: includeAfternoon ? '#6b21a8' : 'var(--text-secondary)', margin: 0, transition: 'color 0.2s' }}>
                    주일 오후 예배 순서 <span style={{ fontSize: '13px', fontWeight: 'normal' }}>(이번 주 오후 예배가 있을 경우 체크)</span>
                  </h3>
                </label>
              </div>

              {includeAfternoon && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 40px', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <div>구분 (※기립)</div>
                    <div>내용 (찬송가, 성경 등)</div>
                    <div>담당자</div>
                    <div></div>
                  </div>
                  {afternoonOrder.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 40px', gap: '8px', marginBottom: '8px' }}>
                      <input type="text" value={item.type} onChange={(e) => { const n = [...afternoonOrder]; n[idx].type = e.target.value; setAfternoonOrder(n); }} placeholder="찬송, 기도..." style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                      <input type="text" value={item.content} onChange={(e) => { const n = [...afternoonOrder]; n[idx].content = e.target.value; setAfternoonOrder(n); }} placeholder="내용" style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                      <input type="text" value={item.leader} onChange={(e) => { const n = [...afternoonOrder]; n[idx].leader = e.target.value; setAfternoonOrder(n); }} placeholder="담당" style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                      <button type="button" onClick={() => setAfternoonOrder(afternoonOrder.filter((_, i) => i !== idx))} style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4f', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setAfternoonOrder([...afternoonOrder, { type: '', content: '', leader: '' }])} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--glass-bg)', border: '1px dashed #6b21a8', color: '#6b21a8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginTop: '8px' }}>
                    <Plus size={16} /> 순서 추가
                  </button>
                </>
              )}
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
                <div style={{
                  height: '180px', width: '100%', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(135deg, #0f1c3f 0%, #1a3a6e 50%, #0f2a5a 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  borderBottom: '1px solid var(--glass-border)',
                }}>
                  {/* 배경 장식 원 */}
                  <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212,175,55,0.06)' }} />
                  {/* 십자가 */}
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <div style={{ width: '4px', height: '36px', background: 'var(--accent-gold)', borderRadius: '2px', margin: '0 auto' }} />
                    <div style={{ width: '24px', height: '4px', background: 'var(--accent-gold)', borderRadius: '2px', position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)' }} />
                  </div>
                  {/* 교회명 */}
                  <div style={{ color: 'var(--accent-gold)', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'var(--font-serif)' }}>
                    BethelChurch
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', letterSpacing: '0.15em', marginTop: '4px' }}>
                    WEEKLY BULLETIN
                  </div>
                  {/* 날짜 */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(212,175,55,0.7)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                    {bulletin.date}
                  </div>
                  {/* 스마트 주보 뱃지 */}
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-gold)', color: '#0f1c3f', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: 800, letterSpacing: '0.03em' }}>스마트 주보</span>
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
