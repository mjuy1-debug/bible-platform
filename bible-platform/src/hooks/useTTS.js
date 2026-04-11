import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Web Speech API 기반 TTS 훅 (무료, 인증 불필요, 한국어 지원)
 */
export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [rate, setRate] = useState(0.9);          // 읽기 속도 (0.5 ~ 2.0)
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);
  const verseQueueRef = useRef([]);
  const verseIndexRef = useRef(0);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const getKoreanVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    // 한국어 음성 우선 선택
    return (
      voices.find(v => v.lang === 'ko-KR' && v.name.includes('Google')) ||
      voices.find(v => v.lang === 'ko-KR') ||
      voices.find(v => v.lang.startsWith('ko')) ||
      null
    );
  }, []);

  const speakVerse = useCallback((verse, onEnd) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `${verse.verse}절. ${verse.text}`
    );
    utterance.lang = 'ko-KR';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // 크롬에서 음성이 로드된 후 설정
    const voice = getKoreanVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentVerse(verse.verse);
    };
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentVerse(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [rate, getKoreanVoice]);

  /** 전체 장 읽기 */
  const playAll = useCallback((verses) => {
    if (!supported || !verses?.length) return;
    verseQueueRef.current = verses;
    verseIndexRef.current = 0;

    const playNext = () => {
      const idx = verseIndexRef.current;
      if (idx >= verseQueueRef.current.length) {
        setIsPlaying(false);
        setCurrentVerse(null);
        return;
      }
      speakVerse(verseQueueRef.current[idx], () => {
        verseIndexRef.current += 1;
        playNext();
      });
    };
    playNext();
  }, [supported, speakVerse]);

  /** 특정 절부터 읽기 */
  const playFrom = useCallback((verses, fromVerse) => {
    if (!supported || !verses?.length) return;
    const idx = verses.findIndex(v => v.verse === fromVerse);
    verseQueueRef.current = verses;
    verseIndexRef.current = idx >= 0 ? idx : 0;

    const playNext = () => {
      const i = verseIndexRef.current;
      if (i >= verseQueueRef.current.length) {
        setIsPlaying(false);
        setCurrentVerse(null);
        return;
      }
      speakVerse(verseQueueRef.current[i], () => {
        verseIndexRef.current += 1;
        playNext();
      });
    };
    playNext();
  }, [supported, speakVerse]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerse(null);
    verseIndexRef.current = 0;
  }, []);

  return {
    supported, isPlaying, isPaused, currentVerse, rate, setRate,
    playAll, playFrom, pause, resume, stop,
  };
};
