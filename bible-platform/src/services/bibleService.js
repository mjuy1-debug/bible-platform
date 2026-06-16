// 성경 API 서비스
// 로컬 JSON 파일 우선 로드 (public/bible/{bookId}.json)
// 로컬 파일 없을 시 bolls.life API (KRV 개역한글) 폴백

const BASE_URL = 'https://bolls.life';
const TRANSLATION = 'KRV'; // 개역한글판 (폴백용)

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

// 메모리 캐시: 한번 받아온 데이터는 저장
const cache = {};

// 로컬 JSON 파일에서 책 전체를 로드하는 캐시
const bookCache = {};

/**
 * 로컬 JSON에서 특정 책 데이터를 로드
 * public/bible/{bookId}.json 형식
 */
const loadLocalBook = async (bookId) => {
  if (bookCache[bookId] !== undefined) return bookCache[bookId];

  try {
    const res = await fetch(`/bible/${bookId}.json`);
    if (!res.ok) {
      bookCache[bookId] = null;
      return null;
    }
    const data = await res.json();
    bookCache[bookId] = data;
    return data;
  } catch {
    bookCache[bookId] = null;
    return null;
  }
};

/**
 * 특정 책/장의 성경 구절 배열을 반환
 * 로컬 JSON 우선 → bolls.life API 폴백
 * @returns {Promise<Array<{verse: number, text: string}>>}
 */
export const fetchChapter = async (bookId, chapter) => {
  const cacheKey = `${bookId}-${chapter}`;
  if (cache[cacheKey]) return cache[cacheKey];

  // 1. 로컬 JSON 파일에서 시도
  const bookData = await loadLocalBook(bookId);
  if (bookData && bookData[String(chapter)] && bookData[String(chapter)].length > 0) {
    const verses = bookData[String(chapter)];
    cache[cacheKey] = verses;
    return verses;
  }

  // 2. 폴백: bolls.life API 호출
  const bookNum = BOOK_NUMBER_MAP[bookId];
  if (!bookNum) throw new Error(`알 수 없는 책 ID: ${bookId}`);

  const url = `${BASE_URL}/get-chapter/${TRANSLATION}/${bookNum}/${chapter}/`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`API 오류 ${res.status}: ${bookId} ${chapter}장`);
  }

  const raw = await res.json();

  const verses = raw.map((v) => ({
    verse: v.verse,
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
  Object.keys(bookCache).forEach((k) => delete bookCache[k]);
};
