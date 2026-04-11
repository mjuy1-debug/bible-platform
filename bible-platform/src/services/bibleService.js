// 성경 API 서비스 (bolls.life - 무료, 인증 불필요)
// 한국어 개역개정(RNKRV) 번역 사용
// API 문서: https://bolls.life/api/

const BASE_URL = 'https://bolls.life';
const TRANSLATION = 'KRV'; // 개역한글판 (bolls.life 지원 한국어 번역)

// bolls.life 책 번호 매핑 (1-39 구약, 40-66 신약)
export const BOOK_NUMBER_MAP = {
  gen: 1, exo: 2, lev: 3, num: 4, deu: 5,
  jos: 6, jdg: 7, rut: 8, '1sa': 9, '2sa': 10,
  '1ki': 11, '2ki': 12, '1ch': 13, '2ch': 14, ezr: 15,
  neh: 16, est: 17, job: 18, psa: 19, pro: 20,
  ecc: 21, sng: 22, isa: 23, jer: 24, lam: 25,
  eze: 26, dan: 27, hos: 28, joe: 29, amo: 30,
  oba: 31, jon: 32, mic: 33, nah: 34, hab: 35,
  zep: 36, hag: 37, zec: 38, mal: 39,
  mat: 40, mar: 41, luk: 42, joh: 43, act: 44,
  rom: 45, '1co': 46, '2co': 47, gal: 48, eph: 49,
  php: 50, col: 51, '1th': 52, '2th': 53, '1ti': 54,
  '2ti': 55, tit: 56, phm: 57, heb: 58, jam: 59,
  '1pe': 60, '2pe': 61, '1jo': 62, '2jo': 63, '3jo': 64,
  jud: 65, rev: 66,
};

// 캐시: 한번 받아온 데이터는 메모리에 저장
const cache = {};

/**
 * 특정 책/장의 성경 구절 배열을 반환
 * @returns {Promise<Array<{verse: number, text: string}>>}
 */
export const fetchChapter = async (bookId, chapter) => {
  const cacheKey = `${bookId}-${chapter}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const bookNum = BOOK_NUMBER_MAP[bookId];
  if (!bookNum) throw new Error(`알 수 없는 책 ID: ${bookId}`);

  const url = `${BASE_URL}/get-chapter/${TRANSLATION}/${bookNum}/${chapter}/`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`API 오류 ${res.status}: ${bookId} ${chapter}장`);
  }

  // bolls.life 응답 형식: [{pk, verse, text}, ...]
  const raw = await res.json();

  const verses = raw.map((v) => ({
    verse: v.verse,
    // HTML 태그 제거 및 텍스트 정리
    text: v.text
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim(),
  }));

  cache[cacheKey] = verses;
  return verses;
};

export const clearCache = () => {
  Object.keys(cache).forEach((k) => delete cache[k]);
};
