import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, Play, Settings, X, Save, Radio, Check, Power, 
  ExternalLink, Bell, BellRing, Image as ImageIcon, Eye, EyeOff, Upload, Sparkles,
  Plus, Trash2, Music
} from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import LivePlayerTabs, { DEFAULT_CCM_TRACKS } from './LivePlayerTabs';

// 기본 벧엘교회(유정파파) 유튜브 채널 고정 라이브 URL
const DEFAULT_YOUTUBE_LIVE_URL = 'https://www.youtube.com/@유정파파-n6e/live';

const PRESET_SERVICES = [
  { title: '🔴 주일 대예배 생방송 중', subtitle: '지금 벧엘교회 주일 대예배가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 주일 오후 찬양예배 생방송 중', subtitle: '지금 주일 오후 찬양예배가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 수요 저녁예배 생방송 중', subtitle: '지금 수요 저녁 예배가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 금요 심야기도회 생방송 중', subtitle: '지금 금요 심야 은혜기도회가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 CCM 찬양듣기 생방송 중', subtitle: '지금 은혜로운 CCM 찬양이 실시간으로 연속 방송되고 있습니다. 함께 찬양해요!' },
  { title: '🔴 특별 부흥 성회 생방송 중', subtitle: '지금 특별 부흥 성회가 실시간으로 방송되고 있습니다.' },
];

// 대기/대체 화면 추천 프리셋
const COVER_PRESETS = [
  {
    name: '🖼️ 문구 없음 (이미지만 깔끔하게)',
    text: '',
  },
  {
    name: '🎵 CCM 찬양 대기',
    text: '지금은 은혜로운 CCM 찬양을 듣는 시간입니다 🎵',
  },
  {
    name: '🙏 예배 준비 대기',
    text: '잠시 후 은혜로운 예배가 시작됩니다.\n마음과 정성을 다해 기도로 준비합니다.',
  },
  {
    name: '⚙️ 방송 점검 안내',
    text: '원활한 실시간 방송 송출을 위해 잠시 점검 중입니다 ⚙️',
  },
];

// 유튜브 Video ID 추출 함수 (watch?v=, youtu.be/, /live/, /embed/ 모두 지원)
function extractYouTubeVideoId(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// 모바일 및 웹에서 가장 안정적인 유튜브 이동 URL 가공
function formatYouTubeUrl(url) {
  if (!url) return DEFAULT_YOUTUBE_LIVE_URL;
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  // 채널 URL일 경우 /streams(실시간 탭) 또는 /live로 자동 정규화
  if (url.includes('youtube.com/@') && !url.includes('/live') && !url.includes('/streams')) {
    return `${url.replace(/\/$/, '')}/streams`;
  }
  return url;
}

// 클라이언트 측 고성능 이미지 자동 압축 (Firestore 1MB 용량 제한 완벽 해결)
async function compressImageToSafeDataUrl(file, maxWidth = 1200, maxHeight = 675, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // 500KB를 넘으면 2차 경량화 압축
        if (dataUrl.length > 500000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function LiveBanner() {
  const { currentUser, showToast } = useContext(UserContext);
  const [isLive, setIsLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState('🔴 실시간 예배 생방송 중');
  const [liveSubtitle, setLiveSubtitle] = useState('지금 실시간 예배가 방송되고 있습니다.');
  const [liveUrl, setLiveUrl] = useState(DEFAULT_YOUTUBE_LIVE_URL);
  
  // 대체/대기 화면 상태
  const [isCoverActive, setIsCoverActive] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverNoticeText, setCoverNoticeText] = useState('잠시 후 은혜로운 예배가 시작됩니다.\n마음과 정성을 다해 기도로 준비합니다.');

  // 인앱 유튜브 플레이어 모달 상태
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // 모달 폼 상태
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(DEFAULT_YOUTUBE_LIVE_URL);
  const [inputTitle, setInputTitle] = useState('🔴 주일 대예배 생방송 중');
  const [inputSubtitle, setInputSubtitle] = useState('지금 벧엘교회 주일 대예배가 실시간으로 방송되고 있습니다.');
  const [inputIsLive, setInputIsLive] = useState(false);
  const [sendNotificationCheck, setSendNotificationCheck] = useState(false);
  const [inputCoverActive, setInputCoverActive] = useState(false);
  const [inputCoverImageUrl, setInputCoverImageUrl] = useState('');
  const [inputCoverNoticeText, setInputCoverNoticeText] = useState('잠시 후 은혜로운 예배가 시작됩니다.\n마음과 정성을 다해 기도로 준비합니다.');
  const [isCompressing, setIsCompressing] = useState(false);
  const [showAdNotice, setShowAdNotice] = useState(true);
  const [isPeekVideo, setIsPeekVideo] = useState(false); // 커버 이미지 덮여있을 때 광고 스킵을 위한 임시 영상 보기 모드

  // CCM 찬양곡 링크 리스트 관리 상태
  const [ccmPlaylists, setCcmPlaylists] = useState(DEFAULT_CCM_TRACKS);
  const [inputCcmPlaylists, setInputCcmPlaylists] = useState(DEFAULT_CCM_TRACKS);
  const [newCcmTitle, setNewCcmTitle] = useState('');
  const [newCcmUrl, setNewCcmUrl] = useState('');
  const [newCcmCategory, setNewCcmCategory] = useState('은혜/워십');

  const fileInputRef = useRef(null);

  // 플레이어를 열었을 때 상태 초기화 및 광고 안내 문구 12초 후 자동 숨김 (초반 안내 후 빠르게 사라짐)
  useEffect(() => {
    if (isPlayerOpen) {
      setShowAdNotice(true);
      setIsPeekVideo(false);
      const timer = setTimeout(() => {
        setShowAdNotice(false);
      }, 12 * 1000); // 12초 후 부드럽게 자동 숨김
      return () => clearTimeout(timer);
    }
  }, [isPlayerOpen]);

  // 광고 건너뛰기를 누르기 위해 영상을 열었을 때, 7초 후 자동으로 커버 사진으로 복귀! (5초 스킵 누른 직후 바로 복귀)
  useEffect(() => {
    if (isPeekVideo) {
      const peekTimer = setTimeout(() => {
        setIsPeekVideo(false);
      }, 7 * 1000); // 7초 후 커버 사진 자동 복귀
      return () => clearTimeout(peekTimer);
    }
  }, [isPeekVideo]);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.email?.includes('admin') || 
      currentUser.displayName?.includes('유정파파') ||
      currentUser.displayName?.includes('관리자')
    )
  );

  // Firestore에서 실시간 라이브 설정 동기화 (수동 제어)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'liveStream'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const active = Boolean(data.isLive || data.forceLive);
        setIsLive(active);
        setInputIsLive(active);

        if (data.url) {
          setLiveUrl(data.url);
          setInputUrl(data.url);
        }
        if (data.title) {
          setLiveTitle(data.title);
          setInputTitle(data.title);
        }
        if (data.subtitle) {
          setLiveSubtitle(data.subtitle);
          setInputSubtitle(data.subtitle);
        }

        // 대체화면 설정
        const coverOn = Boolean(data.isCoverActive);
        setIsCoverActive(coverOn);
        setInputCoverActive(coverOn);
        if (data.coverImageUrl !== undefined) {
          setCoverImageUrl(data.coverImageUrl);
          setInputCoverImageUrl(data.coverImageUrl);
        }
        if (data.coverNoticeText !== undefined) {
          setCoverNoticeText(data.coverNoticeText);
          setInputCoverNoticeText(data.coverNoticeText);
        }

        // CCM 찬양곡 리스트 설정
        if (data.ccmPlaylists && Array.isArray(data.ccmPlaylists) && data.ccmPlaylists.length > 0) {
          setCcmPlaylists(data.ccmPlaylists);
          setInputCcmPlaylists(data.ccmPlaylists);
        }
      } else {
        setIsLive(false);
        setInputIsLive(false);
        setInputUrl(DEFAULT_YOUTUBE_LIVE_URL);
      }
    }, (err) => {
      console.warn('라이브 설정 불러오기:', err);
    });

    return () => unsub();
  }, []);

  // 1. 빠른 배너 ON / OFF (알림 없이 조용히 배너만 켜기/끄기)
  const handleQuickToggle = async () => {
    const nextState = !isLive;
    try {
      await setDoc(doc(db, 'settings', 'liveStream'), {
        isLive: nextState,
        forceLive: nextState,
        url: liveUrl,
        title: liveTitle,
        subtitle: liveSubtitle,
        isCoverActive: isCoverActive,
        coverImageUrl: coverImageUrl,
        coverNoticeText: coverNoticeText,
        updatedBy: currentUser?.displayName || '관리자',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsLive(nextState);
      setInputIsLive(nextState);
      if (showToast) {
        showToast(nextState ? '🔴 배너를 켰습니다 (알림 없이 조용히 켜짐).' : '⏹️ 실시간 방송 배너를 껐습니다.');
      }
    } catch (err) {
      console.error('라이브 토글 오류:', err);
      if (showToast) showToast(`오류: ${err.message}`, 'error');
    }
  };

  // 2. 알림과 함께 배너 켜기 / 전교인 알림 즉시 발송
  const handleToggleWithNotification = async () => {
    try {
      const notifId = Date.now().toString();
      await setDoc(doc(db, 'settings', 'liveStream'), {
        isLive: true,
        forceLive: true,
        notificationId: notifId,
        notificationTriggeredAt: Date.now(),
        url: liveUrl,
        title: liveTitle,
        subtitle: liveSubtitle,
        isCoverActive: isCoverActive,
        coverImageUrl: coverImageUrl,
        coverNoticeText: coverNoticeText,
        updatedBy: currentUser?.displayName || '관리자',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsLive(true);
      setInputIsLive(true);
      if (showToast) {
        showToast('🔔 실시간 생방송 시작 알림이 모든 성도들에게 발송되었습니다!');
      }
    } catch (err) {
      console.error('알림 발송 오류:', err);
      if (showToast) showToast(`알림 발송 오류: ${err.message}`, 'error');
    }
  };

  // 3. 1초 대기화면 빠른 ON / OFF 토글
  const handleQuickCoverToggle = async () => {
    const nextCover = !isCoverActive;
    try {
      await setDoc(doc(db, 'settings', 'liveStream'), {
        isCoverActive: nextCover,
        updatedBy: currentUser?.displayName || '관리자',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsCoverActive(nextCover);
      setInputCoverActive(nextCover);
      if (showToast) {
        showToast(nextCover ? '🖼️ 대체 대기화면을 띄웠습니다 (성도 화면에 대기 이미지 노출)' : '🎬 실시간 생방송 영상을 송출합니다!');
      }
    } catch (err) {
      console.error('대체화면 토글 오류:', err);
      if (showToast) showToast(`오류: ${err.message}`, 'error');
    }
  };

  // 프리셋 선택
  const handleSelectPreset = (preset) => {
    setInputTitle(preset.title);
    setInputSubtitle(preset.subtitle);
  };

  // 대기화면 프리셋 적용
  const handleSelectCoverPreset = (preset) => {
    setInputCoverNoticeText(preset.text);
    setInputCoverImageUrl(''); // 텍스트/스타일 기반으로 복구
  };

  // 이미지 파일 로컬 업로드 처리 (자동 리사이즈 & 초경량 압축)
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      if (showToast) showToast('이미지를 최적화 압축 중입니다...');
      const compressedBase64 = await compressImageToSafeDataUrl(file, 1200, 675, 0.72);
      setInputCoverImageUrl(compressedBase64);
      if (showToast) showToast('✅ 대체 대기 이미지가 안전하게 최적화되었습니다!');
    } catch (err) {
      console.error('이미지 압축 오류:', err);
      if (showToast) showToast('이미지 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  // CCM 찬양곡 추가 핸들러
  const handleAddCcmTrack = () => {
    if (!newCcmTitle.trim() || !newCcmUrl.trim()) {
      if (showToast) showToast('찬양 제목과 유튜브 링크를 모두 입력해주세요.', 'warning');
      return;
    }
    const newTrack = {
      id: Date.now().toString(),
      title: newCcmTitle.trim(),
      url: newCcmUrl.trim(),
      category: newCcmCategory.trim() || '은혜/워십',
      artist: '벧엘 추천'
    };
    setInputCcmPlaylists(prev => [...prev, newTrack]);
    setNewCcmTitle('');
    setNewCcmUrl('');
    if (showToast) showToast('곡이 목록에 추가되었습니다. 하단의 [설정 저장하기]를 눌러 완료하세요.');
  };

  // CCM 찬양곡 삭제 핸들러
  const handleDeleteCcmTrack = (id) => {
    setInputCcmPlaylists(prev => prev.filter(t => t.id !== id));
  };

  // 관리자 설정 전체 저장 (Firestore)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    try {
      const payload = {
        url: inputUrl.trim(),
        title: inputTitle.trim() || '🔴 실시간 예배 생방송 중',
        subtitle: inputSubtitle.trim() || '지금 실시간 예배가 방송되고 있습니다.',
        isLive: inputIsLive,
        forceLive: inputIsLive,
        isCoverActive: inputCoverActive,
        coverImageUrl: inputCoverImageUrl,
        coverNoticeText: inputCoverNoticeText,
        ccmPlaylists: inputCcmPlaylists,
        updatedBy: currentUser?.displayName || '관리자',
        updatedAt: new Date().toISOString()
      };

      if (inputIsLive && sendNotificationCheck) {
        payload.notificationId = Date.now().toString();
        payload.notificationTriggeredAt = Date.now();
      }

      await setDoc(doc(db, 'settings', 'liveStream'), payload, { merge: true });

      setLiveUrl(inputUrl.trim());
      setLiveTitle(inputTitle.trim());
      setLiveSubtitle(inputSubtitle.trim());
      setIsLive(inputIsLive);
      setIsCoverActive(inputCoverActive);
      setCoverImageUrl(inputCoverImageUrl);
      setCoverNoticeText(inputCoverNoticeText);
      setCcmPlaylists(inputCcmPlaylists);
      setIsSettingOpen(false);
      setSendNotificationCheck(false);

      if (showToast) {
        if (inputIsLive && sendNotificationCheck) {
          showToast('✅ 설정 저장 완료 및 전교인 생방송 푸시 알림이 발송되었습니다!');
        } else {
          showToast('✅ 실시간 방송 및 찬양 목록 설정이 저장되었습니다!');
        }
      }
    } catch (err) {
      console.error('라이브 설정 저장 오류:', err);
      if (showToast) showToast(`저장 오류: ${err.message}`, 'error');
    }
  };

  // 비디오 ID 추출 여부
  const activeVideoId = extractYouTubeVideoId(liveUrl);
  const formattedExternalUrl = formatYouTubeUrl(liveUrl);

  const handleBannerClick = () => {
    // 플레이어 모달 열기 (비디오 ID가 있거나 대체 이미지가 켜져 있으면 모달에서 바로 확인)
    setIsPlayerOpen(true);
  };

  return (
    <>
      {/* 1. 관리자 전용 수동 제어 바 (관리자 로그인 시 항상 노출) */}
      {isAdmin && (
        <div style={{
          maxWidth: '960px',
          margin: '0 auto 1rem',
          padding: '10px 14px',
          borderRadius: '14px',
          background: isLive ? 'rgba(220, 38, 38, 0.12)' : 'rgba(212, 175, 55, 0.08)',
          border: isLive ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Radio size={15} color={isLive ? '#ef4444' : 'var(--accent-gold)'} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: isLive ? '#f87171' : 'var(--accent-gold)' }}>
              실시간 방송 관리:
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '99px',
              background: isLive ? '#dc2626' : 'rgba(255,255,255,0.1)',
              color: isLive ? '#fff' : 'var(--text-secondary)'
            }}>
              {isLive ? '🔴 방송 중 (배너 켜짐)' : '⚫ 방송 종료 (배너 숨김)'}
            </span>

            {/* 대체 대기화면 송출 중 배지 */}
            {isLive && isCoverActive && (
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'rgba(212,175,55,0.25)',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)'
              }}>
                🖼️ 대체 대기화면 송출 중
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* 방송 중일 때 대체 대기화면 1초 토글 버튼 */}
            {isLive && (
              <button
                onClick={handleQuickCoverToggle}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  background: isCoverActive ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.08)',
                  border: isCoverActive ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                  color: isCoverActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title={isCoverActive ? '대체 이미지를 내리고 실시간 영상을 송출합니다' : '실시간 영상 대신 임시 대기화면을 띄웁니다'}
              >
                <ImageIcon size={13} />
                {isCoverActive ? '🎬 영상으로 전환' : '🖼️ 임시 대기화면 띄우기'}
              </button>
            )}

            {!isLive ? (
              <>
                {/* 1) 알림 없이 배너만 켜기 */}
                <button
                  onClick={handleQuickToggle}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="알림 발송 없이 조용히 배너만 켭니다"
                >
                  <Power size={13} /> 배너만 켜기
                </button>

                {/* 2) 전교인 알림과 함께 배너 켜기 */}
                <button
                  onClick={handleToggleWithNotification}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#dc2626',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
                  }}
                  title="배너를 켜고 전교인에게 즉시 생방송 시작 푸시 알림을 발송합니다"
                >
                  <BellRing size={13} /> 🔔 알림 보내며 켜기
                </button>
              </>
            ) : (
              <>
                {/* 배너 끄기 */}
                <button
                  onClick={handleQuickToggle}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#4b5563',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Power size={13} /> 배너 끄기
                </button>

                {/* 방송 중 알림 재발송 */}
                <button
                  onClick={handleToggleWithNotification}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(220, 38, 38, 0.25)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="현재 방송 중인 알림을 성도들에게 다시 전송합니다"
                >
                  <Bell size={13} /> 🔔 알림 다시 보내기
                </button>
              </>
            )}

            {/* 상세 설정 버튼 */}
            <button
              onClick={() => setIsSettingOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="예배 제목, 유튜브 링크 및 대체 화면 설정"
            >
              <Settings size={13} /> 설정
            </button>
          </div>
        </div>
      )}

      {/* 2. 실시간 예배 배너 (관리자가 수동으로 켰을 때만 모든 성도에게 표시) */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15 }}
            style={{
              maxWidth: '960px',
              margin: '0 auto 1.5rem',
              padding: 'clamp(0.85rem, 2.5vw, 1.15rem) clamp(1rem, 3vw, 1.4rem)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(185, 28, 28, 0.12) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 280px', minWidth: 0 }}>
              <div style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)'
              }}>
                <Tv size={18} />
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid #fff',
                }} />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                {/* 배지 행: 화도벧엘교회 → LIVE ON → 대기 중 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '5px' }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
                    fontSize: '10px', fontWeight: 800,
                    padding: '2px 8px', borderRadius: '99px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    letterSpacing: '0.3px', flexShrink: 0
                  }}>
                    ⛪ 화도벧엘교회
                  </span>
                  <span style={{
                    background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800,
                    padding: '2px 7px', borderRadius: '99px', letterSpacing: '0.5px', flexShrink: 0
                  }}>
                    LIVE ON
                  </span>
                  {isCoverActive && (
                    <span style={{
                      background: 'rgba(212,175,55,0.2)', color: 'var(--accent-gold)', fontSize: '10px', fontWeight: 700,
                      padding: '2px 7px', borderRadius: '99px', border: '1px solid rgba(212,175,55,0.4)', flexShrink: 0
                    }}>
                      대기 중
                    </span>
                  )}
                </div>
                {/* 예배 제목 */}
                <h3 style={{ margin: '0 0 3px 0', fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', fontWeight: 800, color: '#fff', wordBreak: 'keep-all', overflowWrap: 'break-word', lineHeight: 1.35 }}>
                  {liveTitle}
                </h3>
                <p style={{ margin: 0, fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', color: 'rgba(255, 255, 255, 0.80)', lineHeight: 1.45, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                  {liveSubtitle}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {isAdmin && (
                <button
                  onClick={() => setIsSettingOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex'
                  }}
                  title="라이브 방송 내용 수정"
                >
                  <Settings size={15} />
                </button>
              )}
              
              {/* 참여 버튼 */}
              <button
                onClick={handleBannerClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#dc2626',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
              >
                <Play size={15} fill="#fff" /> 실시간 예배 참여하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 인앱 유튜브 실시간 플레이어 모달 (제일 상단에 최적화된 위치) */}
      <AnimatePresence>
        {isPlayerOpen && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', 
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.88)', 
              zIndex: 2100,
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 'clamp(0px, 1.5vw, 16px)',
              overflow: 'hidden'
            }}
            onClick={() => setIsPlayerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.96, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#141416', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 'clamp(0px, 2vw, 16px)', width: '100%', maxWidth: '820px',
                height: '100%', maxHeight: '100dvh',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
              }}
            >
              {/* 플레이어 상단 헤더 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 18px)',
                background: '#1c1c1e',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 200px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                  <span style={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 'clamp(0.85rem, 2.5vw, 0.98rem)',
                    lineHeight: 1.35,
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word'
                  }}>
                    {liveTitle}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
                  {/* 관리자인 경우 플레이어 내부에서도 1클릭 대기화면 전환 버튼 제공 */}
                  {isAdmin && (
                    <button
                      onClick={handleQuickCoverToggle}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '8px',
                        background: isCoverActive ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.1)',
                        border: isCoverActive ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.2)',
                        color: isCoverActive ? 'var(--accent-gold)' : '#fff',
                        cursor: 'pointer'
                      }}
                      title="관리자: 실시간 영상 ↔ 대체 대기화면 전환"
                    >
                      <ImageIcon size={12} />
                      {isCoverActive ? '영상 송출하기' : '대기화면 띄우기'}
                    </button>
                  )}

                  <a
                    href={formattedExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: 'var(--accent-gold)', fontSize: '12px', textDecoration: 'none',
                      padding: '5px 11px', borderRadius: '8px', background: 'rgba(212,175,55,0.12)',
                      border: '1px solid rgba(212,175,55,0.35)', fontWeight: 600, whiteSpace: 'nowrap'
                    }}
                  >
                    <ExternalLink size={13} /> 유튜브 앱에서 열기
                  </a>
                  <button
                    onClick={() => setIsPlayerOpen(false)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="닫기"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* 플레이어 본체 구역 (16:9 비율 고정) */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000', overflow: 'hidden', flexShrink: 0 }}>
                {/* 1. 유튜브 실시간 스트림 영상 (광고 최소화 및 엉뚱한 곡 재생 방지 playlist lock) */}
                {activeVideoId && (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${activeVideoId}`}
                    title="실시간 예배 방송"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none'
                    }}
                  />
                )}

                {/* 2. 관리자 설정 대체/대기 화면 오버레이 (isCoverActive && !isPeekVideo 일 때만 렌더링) */}
                <AnimatePresence>
                  {isCoverActive && !isPeekVideo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        zIndex: 10,
                        background: coverImageUrl 
                          ? `url(${coverImageUrl}) center / cover no-repeat` 
                          : 'linear-gradient(135deg, #181512 0%, #262016 50%, #110f0d 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '24px',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* 텍스트가 있을 때만 반투명 백드롭 표시 (문구 없으면 순수 원본 이미지 100% 선명하게 표시) */}
                      {Boolean(coverNoticeText?.trim()) && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: coverImageUrl ? 'rgba(0,0,0,0.55)' : 'transparent',
                          zIndex: 1
                        }} />
                      )}

                      {/* 텍스트가 작성되어 있을 때만 문구 레이어 표시 */}
                      {Boolean(coverNoticeText?.trim()) && (
                        <div style={{ position: 'relative', zIndex: 2, maxWidth: '85%' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 12px', borderRadius: '99px',
                            background: 'rgba(212,175,55,0.2)', border: '1px solid var(--accent-gold)',
                            color: 'var(--accent-gold)', fontSize: '11px', fontWeight: 800,
                            marginBottom: '12px'
                          }}>
                            <Sparkles size={13} /> 안내
                          </div>

                          <h4 style={{
                            margin: '0 0 10px 0',
                            color: '#fff',
                            fontSize: 'clamp(1rem, 3.5vw, 1.35rem)',
                            fontWeight: 800,
                            lineHeight: 1.4,
                            whiteSpace: 'pre-line',
                            wordBreak: 'keep-all',
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                          }}>
                            {coverNoticeText}
                          </h4>

                          <p style={{
                            margin: 0,
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: 'clamp(0.75rem, 2vw, 0.88rem)',
                            wordBreak: 'keep-all'
                          }}>
                            벧엘교회 온라인 실시간 방송
                          </p>
                        </div>
                      )}

                      {/* 커버 화면 우측 하단: 광고 건너뛰기를 위한 임시 영상 열기 버튼 */}
                      {activeVideoId && (
                        <button
                          onClick={() => setIsPeekVideo(true)}
                          style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            zIndex: 5,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: 'rgba(0,0,0,0.75)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backdropFilter: 'blur(6px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            transition: 'all 0.2s'
                          }}
                          title="광고 건너뛰기를 누르거나 영상을 조작하기 위해 화면을 엽니다"
                        >
                          ⚡ 광고 건너뛰기 / 영상 보기
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. 임시 영상 보기 모드일 때: 다시 커버 이미지로 덮기 플로팅 버튼 (12초 후 자동 복귀) */}
                {isCoverActive && isPeekVideo && (
                  <button
                    onClick={() => setIsPeekVideo(false)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 20,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 13px',
                      borderRadius: '20px',
                      background: 'rgba(0,0,0,0.85)',
                      border: '1px solid var(--accent-gold)',
                      color: 'var(--accent-gold)',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      backdropFilter: 'blur(6px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.7)'
                    }}
                    title="클릭하거나 7초 후 자동으로 커버 사진으로 복귀합니다"
                  >
                    🖼️ 커버 사진 복귀 (잠시 후 자동 복귀)
                  </button>
                )}

                {/* 영상 ID가 없고 대체화면도 꺼진 경우 안내 */}
                {!activeVideoId && !isCoverActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    background: '#18181b', color: '#fff', padding: '20px', textAlign: 'center'
                  }}>
                    <Tv size={36} color="var(--accent-gold)" style={{ marginBottom: '10px' }} />
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }}>
                      유튜브 채널 생방송으로 연결됩니다
                    </p>
                    <a
                      href={formattedExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 20px', borderRadius: '24px', background: '#dc2626', color: '#fff',
                        textDecoration: 'none', fontWeight: 700, fontSize: '13px'
                      }}
                    >
                      생방송 시청하러 가기
                    </a>
                  </div>
                )}
              </div>

              {/* 4. 광고 대기 슬림 안내 배너 (12초 후 자동 숨김) */}
              <AnimatePresence>
                {showAdNotice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 12px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                      color: 'var(--accent-gold)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    <span>⏳</span>
                    <span style={{ wordBreak: 'keep-all', flex: 1, lineHeight: 1.35 }}>
                      광고가 나올 수 있으니 잠시만 기다려 주세요 (우측 하단 ⚡버튼으로 [광고 건너뛰기] 가능)
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 5. 분할 하단 탭 콘텐츠 패널 (성경 / 찬송가 / 주보 / 검색 / CCM찬양) */}
              <LivePlayerTabs 
                db={db} 
                liveTitle={liveTitle} 
                liveUrl={liveUrl} 
                onSelectVideo={(url, title) => {
                  setLiveUrl(url);
                  if (title) setLiveTitle(title);
                }} 
                customTracks={ccmPlaylists} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. 관리자 라이브 링크 & 방송 설정 모달 */}
      <AnimatePresence>
        {isSettingOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1200,
              display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '16px',
              paddingTop: 'clamp(16px, 4vh, 32px)',
              overflowY: 'auto'
            }}
            onClick={() => setIsSettingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '540px',
                marginBottom: '40px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
                  <Tv size={20} /> 실시간 방송 관리 (수동 제어)
                </h3>
                <button onClick={() => setIsSettingOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. 수동 라이브 켜기 / 끄기 토글 */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                  borderRadius: '12px', background: inputIsLive ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.03)',
                  border: inputIsLive ? '1px solid rgba(220,38,38,0.5)' : '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={inputIsLive}
                    onChange={(e) => setInputIsLive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#dc2626' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: inputIsLive ? '#f87171' : 'var(--text-primary)' }}>
                      {inputIsLive ? '🔴 실시간 방송 배너 켜기 (ON)' : '⚫ 실시간 방송 배너 끄기 (OFF)'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      체크하면 홈 화면에 즉시 생방송 배너가 노출됩니다.
                    </p>
                  </div>
                </label>

                {/* 2. 전교인 알림 발송 체크박스 */}
                {inputIsLive && (
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                    borderRadius: '12px', background: sendNotificationCheck ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                    border: sendNotificationCheck ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={sendNotificationCheck}
                      onChange={(e) => setSendNotificationCheck(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                    />
                    <div>
                      <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: sendNotificationCheck ? 'var(--accent-gold)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BellRing size={16} /> 🔔 전교인에게 실시간 생방송 시작 푸시 알림 발송하기
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        체크하고 저장 시 모든 성도님들의 스마트폰으로 <strong>생방송 알림과 차임벨</strong>이 즉시 발송됩니다.
                      </p>
                    </div>
                  </label>
                )}

                {/* 3. [신규] 임시 대체/대기 화면 설정 구역 */}
                <div style={{
                  padding: '14px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                  display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={inputCoverActive}
                        onChange={(e) => setInputCoverActive(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: inputCoverActive ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        🖼️ 임시 대체 대기화면 띄우기 (ON/OFF)
                      </span>
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {inputCoverActive ? '현재 대기화면 송출 중' : '영상 정상 송출 중'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    방송 시작 전후 또는 잠시 대기가 필요할 때, 인앱 플레이어에 원하는 안내 문구나 이미지를 띄워놓고 언제든 해제할 수 있습니다.
                  </p>

                  {/* 빠른 대기 문구 선택 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      추천 대기 문구 선택:
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {COVER_PRESETS.map((cp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCoverPreset(cp)}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '11px',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)', cursor: 'pointer'
                          }}
                        >
                          {cp.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 대기 문구 직접 작성 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      대기화면 안내 문구:
                    </label>
                    <textarea
                      rows={2}
                      value={inputCoverNoticeText}
                      onChange={(e) => setInputCoverNoticeText(e.target.value)}
                      placeholder="예: 잠시 후 은혜로운 예배가 시작됩니다."
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: '8px',
                        background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* 이미지 직접 업로드 또는 URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      배경 이미지 첨부 (선택):
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 12px', borderRadius: '8px',
                          background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent-gold)',
                          color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        <Upload size={13} /> 내 기기에서 사진 선택
                      </button>
                      {inputCoverImageUrl && (
                        <button
                          type="button"
                          onClick={() => setInputCoverImageUrl('')}
                          style={{
                            padding: '6px 10px', borderRadius: '8px',
                            background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
                            color: '#f87171', fontSize: '11px', cursor: 'pointer'
                          }}
                        >
                          이미지 삭제
                        </button>
                      )}
                    </div>
                    {inputCoverImageUrl && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={inputCoverImageUrl}
                          alt="미리보기"
                          style={{ width: '48px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
                        />
                        <span style={{ fontSize: '11px', color: '#4ade80' }}>✓ 맞춤 이미지가 적용되었습니다</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. 빠른 예배 프리셋 선택 */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    빠른 예배 제목 선택
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {PRESET_SERVICES.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '8px',
                          background: inputTitle === p.title ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                          border: inputTitle === p.title ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                          color: inputTitle === p.title ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {p.title.replace('🔴 ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. 배너 제목 직접 수정 */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    배너 타이틀
                  </label>
                  <input
                    type="text"
                    required
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="예: 🔴 주일 대예배 생방송 중"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 6. 배너 설명 */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    배너 안내 문구
                  </label>
                  <input
                    type="text"
                    required
                    value={inputSubtitle}
                    onChange={(e) => setInputSubtitle(e.target.value)}
                    placeholder="예: 지금 벧엘교회 주일 대예배가 실시간으로 방송되고 있습니다."
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 7. 유튜브 라이브 URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    유튜브 라이브 스트리밍 주소
                  </label>
                  <input
                    type="url"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://www.youtube.com/@유정파파-n6e/live"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    💡 <code>https://www.youtube.com/@유정파파-n6e/live</code> 고정 주소를 사용하시면 매번 바꾸지 않아도 방송 시 자동 연결됩니다.
                  </p>
                </div>

                {/* 8. CCM 찬양곡 링크 리스트 관리 (추가/삭제) */}
                <div style={{
                  padding: '14px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                  display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Music size={16} /> 🎵 CCM 찬양곡/플레이리스트 링크 목록 ({inputCcmPlaylists.length}곡)
                    </p>
                  </div>

                  <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    성도님들이 CCM 찬양 모드에서 자유롭게 선택하여 들을 수 있는 찬양곡 리스트입니다.
                  </p>

                  {/* 새 찬양곡 추가 입력 폼 */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#fff' }}>+ 새로운 찬양곡 추가</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="찬양 제목 (예: 은혜 - 손경민)"
                        value={newCcmTitle}
                        onChange={(e) => setNewCcmTitle(e.target.value)}
                        style={{ flex: '1 1 180px', padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '12px' }}
                      />
                      <select
                        value={newCcmCategory}
                        onChange={(e) => setNewCcmCategory(e.target.value)}
                        style={{ padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '12px' }}
                      >
                        <option value="은혜/워십">은혜/워십</option>
                        <option value="기도/묵상">기도/묵상</option>
                        <option value="위로/평안">위로/평안</option>
                        <option value="베스트">베스트</option>
                        <option value="아침/새벽">아침/새벽</option>
                        <option value="수면/평안">수면/평안</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        placeholder="유튜브 링크 (https://www.youtube.com/watch?v=...)"
                        value={newCcmUrl}
                        onChange={(e) => setNewCcmUrl(e.target.value)}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCcmTrack}
                        style={{ padding: '7px 14px', borderRadius: '6px', background: 'var(--accent-gold)', border: 'none', color: '#111', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> 추가
                      </button>
                    </div>
                  </div>

                  {/* 등록된 찬양곡 목록 */}
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                    {inputCcmPlaylists.map((track, i) => (
                      <div key={track.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', fontSize: '12px', gap: '8px' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '10px', color: 'var(--accent-gold)', marginRight: '6px', fontWeight: 700 }}>[{track.category || '찬양'}]</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{track.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCcmTrack(track.id)}
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSettingOpen(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'var(--accent-gold)', border: 'none', color: '#111', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Save size={16} /> 설정 저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
