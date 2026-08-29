// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 페이지 이동 시 항상 화면의 최상단(0, 0)으로 스크롤을 즉시 리셋하는 컴포넌트
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // 해시 앵커(#)가 없는 경우
    if (!hash) {
      // /read 페이지로 돌아가는 경우이고 대상 구절(target_verse)이 있으면 Read 컴포넌트의 구절 스크롤에 위임
      const targetVerse = sessionStorage.getItem('last_read_target_verse');
      if (pathname === '/read' && targetVerse) {
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } else {
      // 해시 앵커가 있는 경우 해당 요소로 스크롤
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, search, hash]);

  return null;
}
