import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, Upload, Calendar, ZoomIn, X, ChevronLeft } from 'lucide-react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserContext } from '../context/UserContext';

export default function Bulletin() {
  const { currentUser, showToast } = useContext(UserContext);
  const [bulletins, setBulletins] = useState([]);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Upload Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isAdmin = currentUser?.email?.includes('admin') || currentUser?.uid === 'ADMIN_HARDCODED_UID';

  useEffect(() => {
    const q = query(collection(db, 'bulletins'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBulletins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !date || !file) return;
    
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `bulletins/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      
      await addDoc(collection(db, 'bulletins'), {
        title,
        date,
        imageUrl,
        uploadedBy: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      setTitle('');
      setDate('');
      setFile(null);
      setIsUploadMode(false);
      if (showToast) showToast('주보가 업로드되었습니다.');
    } catch (error) {
      console.error(error);
      if (showToast) showToast('업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileImage color="var(--accent-gold)" /> 교회 주보
        </h1>
        {isAdmin && (
          <button 
            onClick={() => setIsUploadMode(!isUploadMode)}
            style={{ background: isUploadMode ? 'transparent' : 'var(--accent-gold)', color: isUploadMode ? 'var(--text-primary)' : '#fff', border: isUploadMode ? '1px solid var(--glass-border)' : 'none', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isUploadMode ? '목록으로' : <><Upload size={18} /> 업로드</>}
          </button>
        )}
      </div>

      {isUploadMode && isAdmin ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>새 주보 등록</h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>주보 제목</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 2026년 8월 2주차 주보" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>날짜</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>이미지 파일</label>
              <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
            </div>
            <button type="submit" disabled={isUploading} style={{ padding: '14px', background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isUploading ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: isUploading ? 0.7 : 1 }}>
              {isUploading ? '업로드 중...' : '등록하기'}
            </button>
          </form>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {bulletins.map(bulletin => (
            <motion.div 
              key={bulletin.id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setSelectedImage(bulletin.imageUrl)}
            >
              <div style={{ height: '350px', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                <img src={bulletin.imageUrl} alt={bulletin.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '50%' }}>
                  <ZoomIn size={18} color="#fff" />
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{bulletin.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <Calendar size={14} /> {bulletin.date}
                </div>
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
                <ChevronLeft />
              </button>
              <button onClick={() => setSelectedImage(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                <X />
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
    </div>
  );
}
