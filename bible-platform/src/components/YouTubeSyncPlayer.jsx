// src/components/YouTubeSyncPlayer.jsx
// YouTube IFrame Player API 연동 컴포넌트 (실시간 재생시간 동기화 & 즉시 점프 지원)

import React, { useEffect, useRef } from 'react';

export default function YouTubeSyncPlayer({ videoId, onTimeUpdate, playerRef, initialStart = 0 }) {
  const containerRef = useRef(null);
  const internalPlayerRef = useRef(null);
  const timeIntervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // YouTube API 스크립트 로드 함수
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }
    };

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current) return;

      // 이전 인스턴스 정리
      if (internalPlayerRef.current) {
        try {
          internalPlayerRef.current.destroy();
        } catch (e) {}
      }

      internalPlayerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          start: Math.floor(initialStart || 0),
          playsinline: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            if (playerRef) playerRef.current = internalPlayerRef.current;
            if (initialStart > 0) {
              try { event.target.seekTo(initialStart, true); } catch (e) {}
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            // YT.PlayerState.PLAYING === 1
            if (event.data === 1) {
              if (!timeIntervalRef.current) {
                timeIntervalRef.current = setInterval(() => {
                  if (internalPlayerRef.current && typeof internalPlayerRef.current.getCurrentTime === 'function') {
                    const t = internalPlayerRef.current.getCurrentTime();
                    if (onTimeUpdate) onTimeUpdate(t);
                  }
                }, 500);
              }
            } else {
              // 일시정지, 종료 등에서도 현재 시간 한 번 캡처
              if (internalPlayerRef.current && typeof internalPlayerRef.current.getCurrentTime === 'function') {
                const t = internalPlayerRef.current.getCurrentTime();
                if (onTimeUpdate) onTimeUpdate(t);
              }
              if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
                timeIntervalRef.current = null;
              }
            }
          }
        }
      });
    };

    loadYouTubeAPI();

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        if (isMounted) initPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      if (internalPlayerRef.current) {
        try {
          internalPlayerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
