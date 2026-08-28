import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, X, Check, Sparkles, Printer, FileText, Star, Trophy, ShieldCheck, Lock, AlertCircle, Eye, ArrowRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CertificateModal({ isOpen, onClose, userProfile, currentUser, completedWeeksCount = 0, totalScore = 0 }) {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreviewAnyway, setShowPreviewAnyway] = useState(false);

  if (!isOpen) return null;

  const isCompleted = completedWeeksCount >= 52 || userProfile?.is52WCertified;
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const certNumber = `BETHEL-52W-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const memberName = userProfile?.name || userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '성도';
  const memberPosition = userProfile?.position ? ` ${userProfile.position}` : ' 성도';
  const memberDistrict = userProfile?.district || '';
  const progressPercent = Math.min(100, Math.round((completedWeeksCount / 52) * 100));

  // 1. 이미지 (PNG) 다운로드
  const handleDownloadImage = async () => {
    if (!isCompleted) {
      alert('🔒 52주차 골든벨 과정을 모두 완주하셔야 정식 공인 수료증을 다운로드하실 수 있습니다.');
      return;
    }
    if (!certificateRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#0d0d11',
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `화도벧엘교회_52주_성경통독_골든벨_수료증_${memberName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('수료증 이미지 생성 실패:', err);
      alert('수료증 이미지 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. PDF 다운로드
  const handleDownloadPDF = async () => {
    if (!isCompleted) {
      alert('🔒 52주차 골든벨 과정을 모두 완주하셔야 정식 공인 수료증을 다운로드하실 수 있습니다.');
      return;
    }
    if (!certificateRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#0d0d11',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const posY = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', 15, Math.max(posY, 15), imgWidth, Math.min(imgHeight, pageHeight - 30));
      pdf.save(`화도벧엘교회_52주_성경통독_골든벨_수료증_${memberName}.pdf`);
    } catch (err) {
      console.error('수료증 PDF 생성 실패:', err);
      alert('수료증 PDF 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. 공유하기
  const handleShare = async () => {
    if (!isCompleted) {
      alert('🔒 52주차 골든벨 완주 후 축하 공유가 가능합니다.');
      return;
    }
    const shareText = `📜 [화도벧엘교회] ${memberName}${memberPosition}님이 2026년도 52주 성경 전권 통독 및 골든벨 퀴즈 과정을 완주하여 공인 수료증을 수여받았습니다! 🎉\n\n함께 말씀 통독에 동참하세요! ✝️`;
    const shareUrl = window.location.origin + window.location.pathname;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '화도벧엘교회 52주 성경통독 골든벨 공인 수료증',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('공유 실패:', e);
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('수료증 링크가 복사되었습니다!');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(10px)',
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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{
            maxWidth: '850px',
            width: '100%',
            background: '#121218',
            borderRadius: '24px',
            border: '1px solid rgba(212,175,55,0.4)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* 상단 헤더 바 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: 'rgba(20,20,28,0.95)',
            borderBottom: '1px solid rgba(212,175,55,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="var(--accent-gold)" />
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                52주 완주 골든벨 공인 디지털 수료증
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* 🔒 미완주 시 잠금 화면 (showPreviewAnyway가 아닐 때) */}
          {!isCompleted && !showPreviewAnyway ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(20,20,28,0.9))',
                border: '2px solid rgba(234,179,8,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(234,179,8,0.2)'
              }}>
                <Lock size={36} color="#eab308" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
                  52주 말씀 골든벨 완주 도전 중!
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, wordBreak: 'keep-all', maxWidth: '480px' }}>
                  공인 수료증은 <strong>52주차 골든벨 퀴즈를 모두 완주</strong>하셨을 때 담임목사님의 직인이 날인되어 정식 발급됩니다.
                </p>
              </div>

              {/* 진행률 게이지 */}
              <div style={{ width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px 20px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>나의 통독 퀴즈 진행률</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', fontWeight: 900 }}>
                    {completedWeeksCount} / 52주 ({progressPercent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #d4af37, #fef08a)', borderRadius: '5px' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '8px' }}>
                  앞으로 <strong>{Math.max(0, 52 - completedWeeksCount)}주차</strong>만 더 완주하시면 공인 수료증이 수여됩니다! 🔥
                </div>
              </div>

              {/* 액션 버튼 */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '12px 24px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                    color: '#1a1400', fontSize: '0.92rem', fontWeight: 800, border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                  }}
                >
                  <ArrowRight size={16} /> 52주 골든벨 퀴즈 풀러 가기
                </button>
                <button
                  onClick={() => setShowPreviewAnyway(true)}
                  style={{
                    padding: '12px 18px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Eye size={15} /> 수료증 양식 미리보기
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* 상단 완주 알림바 */}
              <div style={{
                margin: '14px 20px 0',
                padding: '10px 16px',
                borderRadius: '12px',
                background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(234,179,8,0.15)',
                border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.4)' : 'rgba(234,179,8,0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isCompleted ? (
                    <ShieldCheck size={18} color="#10b981" />
                  ) : (
                    <Lock size={18} color="#eab308" />
                  )}
                  <span style={{ fontSize: '0.84rem', color: isCompleted ? '#6ee7b7' : '#fef08a', fontWeight: 600 }}>
                    {isCompleted
                      ? '🎉 52주 말씀 골든벨 과정을 우수한 성적으로 완주하여 공인 수료증이 정식 수여되었습니다!'
                      : `🔒 현재 미리보기 모드입니다 (진행률: ${completedWeeksCount}/52주 완료). 52주 완주 시 정식 발급됩니다.`}
                  </span>
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => setShowPreviewAnyway(false)}
                    style={{
                      background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.5)',
                      color: '#fef08a', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    잠금 화면으로 돌아가기
                  </button>
                )}
              </div>

              {/* 수료증 렌더링 캔버스 영역 (스마트폰 세로 9:16 ~ 9:19.5 최적화 규격) */}
              <div style={{ padding: '16px 12px 20px', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div
                  ref={certificateRef}
                  style={{
                    width: '420px',
                    minWidth: '380px',
                    maxWidth: '430px',
                    minHeight: '840px',
                    background: 'linear-gradient(145deg, #0e0e14 0%, #161520 50%, #0d0d12 100%)',
                    borderRadius: '20px',
                    padding: '32px 26px',
                    position: 'relative',
                    boxSizing: 'border-box',
                    border: '3px double #d4af37',
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.2)',
                    color: '#f3e5ab',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: 'serif'
                  }}
                >
                  {/* 테두리 장식 골드 코너 */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', width: '22px', height: '22px', borderTop: '2px solid #d4af37', borderLeft: '2px solid #d4af37' }} />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', width: '22px', height: '22px', borderTop: '2px solid #d4af37', borderRight: '2px solid #d4af37' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '22px', height: '22px', borderBottom: '2px solid #d4af37', borderLeft: '2px solid #d4af37' }} />
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '22px', height: '22px', borderBottom: '2px solid #d4af37', borderRight: '2px solid #d4af37' }} />

                  {/* 1. 상단 증서 번호 & 교회 영문명 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.5px', fontFamily: 'sans-serif' }}>
                        증서 제 {certNumber} 호
                      </span>
                      <span style={{ fontSize: '10px', color: '#d4af37', fontWeight: 700, letterSpacing: '1px', fontFamily: 'sans-serif' }}>
                        BETHEL CHURCH
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '8px', marginBottom: '14px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d4af37', marginBottom: '2px' }}>
                        <Sparkles size={14} />
                        <span style={{ fontSize: '13px', letterSpacing: '3px', fontWeight: 600 }}>2026 말씀의 사람</span>
                        <Sparkles size={14} />
                      </div>
                      <h1 style={{
                        fontSize: '2.4rem',
                        fontWeight: 900,
                        margin: '6px 0',
                        letterSpacing: '8px',
                        background: 'linear-gradient(to bottom, #fff6d1 0%, #d4af37 60%, #aa820a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 10px rgba(212,175,55,0.3)'
                      }}>
                        수 료 증 서
                      </h1>
                      <span style={{ fontSize: '10.5px', color: '#bfa15f', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'sans-serif', display: 'block' }}>
                        CERTIFICATE OF 52-WEEK BIBLE MASTERY
                      </span>
                    </div>
                  </div>

                  {/* 2. 수여 대상자 (기관명 위에 깔끔하게 배치, 이름/직분 절대 줄바꿈 없음) */}
                  <div style={{ textAlign: 'center', margin: '8px 0' }}>
                    {memberDistrict && (
                      <div style={{ fontSize: '1.05rem', color: '#d4af37', fontWeight: 700, marginBottom: '6px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                        [{memberDistrict}]
                      </div>
                    )}
                    <div style={{
                      display: 'inline-block',
                      borderBottom: '2px solid #d4af37',
                      paddingBottom: '4px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      whiteSpace: 'nowrap'
                    }}>
                      <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', letterSpacing: '3px', whiteSpace: 'nowrap' }}>
                        {memberName}
                      </span>
                      <span style={{ fontSize: '1.25rem', color: '#d4af37', marginLeft: '8px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {memberPosition}
                      </span>
                    </div>
                  </div>

                  {/* 3. 수여 본문 문구 */}
                  <div style={{
                    textAlign: 'center',
                    margin: '12px auto',
                    lineHeight: 1.9,
                    fontSize: '14px',
                    color: '#e5e7eb',
                    wordBreak: 'keep-all',
                    padding: '0 6px'
                  }}>
                    위 사람은 2026년도 화도벧엘교회 <strong style={{ color: '#d4af37' }}>52주 성경 전권 통독 및 말씀 골든벨 퀴즈 과정</strong>을 
                    우수한 성적으로 성실히 완주하고, 성경 말씀을 심비에 새겨 하나님 나라의 신실한 청지기로 무장하였으므로 
                    이 증서를 수여하여 축복합니다.
                  </div>

                  {/* 4. 기념 성경 말씀 */}
                  <div style={{
                    margin: '8px auto 14px',
                    padding: '10px 14px',
                    background: 'rgba(212,175,55,0.06)',
                    borderRadius: '10px',
                    borderLeft: '3px solid #d4af37',
                    fontSize: '12px',
                    color: '#cbd5e1',
                    lineHeight: 1.65,
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    “모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니”
                    <div style={{ fontSize: '11px', color: '#d4af37', fontStyle: 'normal', marginTop: '4px', fontWeight: 600 }}>
                      — 디모데후서 3장 16절 —
                    </div>
                  </div>

                  {/* 5. 날짜 */}
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#cbd5e1', letterSpacing: '1px', marginBottom: '6px' }}>
                    {dateStr}
                  </div>

                  {/* 6. 하단 직인 & 서명 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed rgba(212,175,55,0.25)' }}>
                    {/* 골든벨 리본 뱃지 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #ffe28a 0%, #d4af37 60%, #856100 100%)',
                        boxShadow: '0 4px 15px rgba(212,175,55,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2d1f00',
                        fontWeight: 900,
                        fontSize: '9px',
                        textAlign: 'center',
                        border: '2px solid #fff',
                        flexShrink: 0
                      }}>
                        <Star size={12} fill="#2d1f00" />
                        <span>52W PASS</span>
                        <span style={{ fontSize: '6.5px' }}>GOLDEN BELL</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#d4af37', whiteSpace: 'nowrap' }}>화도벧엘교회 공인</div>
                        <div style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap' }}>52주 전권 마스터 ({totalScore || 780}점)</div>
                      </div>
                    </div>

                    {/* 목사님 서명 & 빨간색 직인 (whiteSpace: nowrap) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 700 }}>화도벧엘교회</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', letterSpacing: '1.5px' }}>담임목사 김 석 주</div>
                      </div>

                      {/* 빨간색 직인 */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '2px solid #ef4444',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        fontSize: '9.5px',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        textAlign: 'center',
                        padding: '2px',
                        boxShadow: '0 0 8px rgba(239,68,68,0.3)',
                        transform: 'rotate(-5deg)',
                        flexShrink: 0
                      }}>
                        벧엘<br/>교회<br/>직인
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 액션 버튼 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '16px 24px',
                background: 'rgba(16,16,22,0.98)',
                borderTop: '1px solid rgba(212,175,55,0.2)'
              }}>
                <button
                  onClick={handleDownloadImage}
                  disabled={isGenerating || !isCompleted}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: isCompleted ? 'linear-gradient(135deg, #d4af37, #f3e5ab)' : 'rgba(255,255,255,0.06)',
                    color: isCompleted ? '#1a1400' : 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    border: isCompleted ? 'none' : '1px solid var(--glass-border)',
                    cursor: (!isCompleted || isGenerating) ? 'not-allowed' : 'pointer',
                    boxShadow: isCompleted ? '0 4px 14px rgba(212,175,55,0.3)' : 'none',
                    opacity: isCompleted ? 1 : 0.6
                  }}
                >
                  <Download size={16} /> {isGenerating ? '생성 중...' : isCompleted ? '📸 이미지 저장 (PNG)' : '🔒 52주 완주 후 발급'}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating || !isCompleted}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: isCompleted ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--glass-border)',
                    color: isCompleted ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: (!isCompleted || isGenerating) ? 'not-allowed' : 'pointer',
                    opacity: isCompleted ? 1 : 0.6
                  }}
                >
                  <Printer size={16} /> 📄 PDF 발급 / 다운로드
                </button>

                {isCompleted && (
                  <button
                    onClick={handleShare}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.12)',
                      border: `1px solid ${copied ? '#10b981' : 'rgba(212,175,55,0.35)'}`,
                      color: copied ? '#10b981' : 'var(--accent-gold)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? <><Check size={16} /> 복사 완료!</> : <><Share2 size={16} /> 🔗 축하 공유하기</>}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
