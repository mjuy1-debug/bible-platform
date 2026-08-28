import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, X, Check, Sparkles, Printer, FileText, Star, Trophy, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CertificateModal({ isOpen, onClose, userProfile, currentUser, completedWeeksCount = 52, totalScore = 780 }) {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const certNumber = `BETHEL-52W-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const memberName = userProfile?.name || userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '성도';
  const memberPosition = userProfile?.position ? ` ${userProfile.position}` : ' 성도';
  const memberDistrict = userProfile?.district ? `[${userProfile.district}] ` : '';

  // 1. 이미지 (PNG) 다운로드
  const handleDownloadImage = async () => {
    if (!certificateRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // 고해상도 출력
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
      
      // A4 가로 (Landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const posY = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', 10, Math.max(posY, 10), imgWidth, Math.min(imgHeight, pageHeight - 20));
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
          {/* 상단 컨트롤 바 */}
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

          {/* 수료증 렌더링 캔버스 영역 */}
          <div style={{ padding: '20px', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <div
              ref={certificateRef}
              style={{
                width: '760px',
                minHeight: '520px',
                background: 'linear-gradient(135deg, #0e0e14 0%, #171620 50%, #0d0d12 100%)',
                borderRadius: '16px',
                padding: '36px 44px',
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
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '24px', height: '24px', borderTop: '2px solid #d4af37', borderLeft: '2px solid #d4af37' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', borderTop: '2px solid #d4af37', borderRight: '2px solid #d4af37' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '24px', height: '24px', borderBottom: '2px solid #d4af37', borderLeft: '2px solid #d4af37' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '24px', height: '24px', borderBottom: '2px solid #d4af37', borderRight: '2px solid #d4af37' }} />

              {/* 1. 상단 증서 번호 & 교회 엠블럼 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px', fontFamily: 'sans-serif' }}>
                    증서 제 {certNumber} 호
                  </span>
                  <span style={{ fontSize: '11px', color: '#d4af37', fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'sans-serif' }}>
                    HWADO BETHEL PRESBYTERIAN CHURCH
                  </span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#d4af37', marginBottom: '4px' }}>
                    <Sparkles size={16} />
                    <span style={{ fontSize: '14px', letterSpacing: '4px', fontWeight: 600 }}>2026 말씀의 사람</span>
                    <Sparkles size={16} />
                  </div>
                  <h1 style={{
                    fontSize: '2.4rem',
                    fontWeight: 900,
                    margin: '4px 0',
                    letterSpacing: '6px',
                    background: 'linear-gradient(to bottom, #fff6d1 0%, #d4af37 60%, #aa820a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 10px rgba(212,175,55,0.3)'
                  }}>
                    수 료 증 서
                  </h1>
                  <span style={{ fontSize: '12px', color: '#bfa15f', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                    Certificate of 52-Week Bible Mastery
                  </span>
                </div>
              </div>

              {/* 2. 수여 대상자 */}
              <div style={{ textAlign: 'center', margin: '14px 0' }}>
                <div style={{
                  display: 'inline-block',
                  borderBottom: '2px solid #d4af37',
                  paddingBottom: '4px',
                  paddingLeft: '30px',
                  paddingRight: '30px'
                }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '2px' }}>
                    {memberDistrict}{memberName}
                  </span>
                  <span style={{ fontSize: '1.2rem', color: '#d4af37', marginLeft: '6px' }}>
                    {memberPosition}
                  </span>
                </div>
              </div>

              {/* 3. 수여 본문 문구 */}
              <div style={{
                textAlign: 'center',
                margin: '12px auto',
                maxWidth: '620px',
                lineHeight: 1.85,
                fontSize: '15px',
                color: '#e5e7eb',
                wordBreak: 'keep-all'
              }}>
                위 사람은 2026년도 화도벧엘교회 <strong style={{ color: '#d4af37' }}>52주 성경 전권 통독 및 말씀 골든벨 퀴즈 과정</strong>을 
                우수한 성적으로 성실히 완주하고, 성경 말씀을 심비에 새겨 하나님 나라의 신실한 청지기로 무장하였으므로 
                이 증서를 수여하여 축복합니다.
              </div>

              {/* 4. 기념 성경 말씀 */}
              <div style={{
                margin: '10px auto 14px',
                maxWidth: '580px',
                padding: '8px 16px',
                background: 'rgba(212,175,55,0.06)',
                borderRadius: '8px',
                borderLeft: '3px solid #d4af37',
                fontSize: '12.5px',
                color: '#cbd5e1',
                lineHeight: 1.6,
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                “모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니”
                <div style={{ fontSize: '11.5px', color: '#d4af37', fontStyle: 'normal', marginTop: '2px', fontWeight: 600 }}>
                  — 디모데후서 3장 16절 —
                </div>
              </div>

              {/* 5. 하단 발행일 및 직인 & 서명 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(212,175,55,0.25)' }}>
                {/* 골든벨 리본 뱃지 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
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
                    border: '2px solid #fff'
                  }}>
                    <Star size={14} fill="#2d1f00" />
                    <span>52W PASS</span>
                    <span style={{ fontSize: '7px' }}>GOLDEN BELL</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#d4af37' }}>화도벧엘교회 공인</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>52주 전권 마스터 ({totalScore}점 완주)</div>
                  </div>
                </div>

                {/* 날짜 및 목사님 서명 직인 */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', letterSpacing: '1px' }}>
                    {dateStr}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '2px' }}>
                      화도벧엘교회 담임목사 김 석 주
                    </span>

                    {/* 빨간색 교회 직인 */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      border: '2px solid #ef4444',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                      fontSize: '10px',
                      fontWeight: 900,
                      lineHeight: 1.1,
                      textAlign: 'center',
                      padding: '2px',
                      boxShadow: '0 0 8px rgba(239,68,68,0.3)',
                      transform: 'rotate(-5deg)'
                    }}>
                      벧엘<br/>교회<br/>직인
                    </div>
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
              disabled={isGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4af37, #f3e5ab)',
                color: '#1a1400',
                fontSize: '0.9rem',
                fontWeight: 800,
                border: 'none',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(212,175,55,0.3)'
              }}
            >
              <Download size={16} /> {isGenerating ? '생성 중...' : '📸 이미지 저장 (PNG)'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              <Printer size={16} /> 📄 PDF 발급 / 다운로드
            </button>

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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
