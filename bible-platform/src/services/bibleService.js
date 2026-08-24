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

// 영어 성경 번역본 옵션
export const ENGLISH_TRANSLATIONS = [
  { id: 'NIV', name: 'NIV (표준 영어)', desc: '가장 널리 읽히는 현대 표준 번역본' },
  { id: 'NLT', name: 'NLT (쉬운 현대 영어)', desc: '자연스럽고 쉬운 일상 구어체' },
  { id: 'ESV', name: 'ESV (정밀 직역)', desc: '원어에 가까운 정밀하고 품격 있는 문체' },
  { id: 'KJV', name: 'KJV (고전 흠정역)', desc: '역사적인 고전 영어 성경' }
];

// 영어 책 이름 매핑 (bible-api.com 및 폴백용)
const ENGLISH_BOOK_NAMES = {
  gen: 'genesis', exo: 'exodus', lev: 'leviticus', num: 'numbers', deu: 'deuteronomy',
  jos: 'joshua', jdg: 'judges', rut: 'ruth', '1sa': '1samuel', '2sa': '2samuel',
  '1ki': '1kings', '2ki': '2kings', '1ch': '1chronicles', '2ch': '2chronicles', ezr: 'ezra',
  neh: 'nehemiah', est: 'esther', job: 'job', psa: 'psalms', pro: 'proverbs',
  ecc: 'ecclesiastes', sng: 'songofsolomon', isa: 'isaiah', jer: 'jeremiah', lam: 'lamentations',
  eze: 'ezekiel', dan: 'daniel', hos: 'hosea', joe: 'joel', amo: 'amos',
  oba: 'obadiah', jon: 'jonah', mic: 'micah', nah: 'nahum', hab: 'habakkuk',
  zep: 'zephaniah', hag: 'haggai', zec: 'zechariah', mal: 'malachi',
  mat: 'matthew', mar: 'mark', luk: 'luke', joh: 'john', act: 'acts',
  rom: 'romans', '1co': '1corinthians', '2co': '2corinthians', gal: 'galatians', eph: 'ephesians',
  php: 'philippians', col: 'colossians', '1th': '1thessalonians', '2th': '2thessalonians', '1ti': '1timothy',
  '2ti': '2timothy', tit: 'titus', phm: 'philemon', heb: 'hebrews', jam: 'james',
  '1pe': '1peter', '2pe': '2peter', '1jo': '1john', '2jo': '2john', '3jo': '3john',
  jud: 'jude', rev: 'revelation',
};

/**
 * 특정 책/장의 영어 성경 구절 배열을 반환 (다단계 글로벌 API 폴백 지원)
 * 1차: bolls.life (NIV, ESV, KJV, NLT)
 * 2차: bible-api.com (KJV, WEB)
 * @param {string} bookId - 책 코드 (예: 'joh', 'gen')
 * @param {number} chapter - 장 번호
 * @param {string} translation - 'NIV' | 'NLT' | 'ESV' | 'KJV'
 * @returns {Promise<Array<{verse: number, text: string}>>}
 */
export const fetchEnglishChapter = async (bookId, chapter, translation = 'NIV') => {
  const cacheKey = `eng-${translation}-${bookId}-${chapter}`;
  if (cache[cacheKey] && cache[cacheKey].length > 0) return cache[cacheKey];

  const bookNum = BOOK_NUMBER_MAP[bookId];
  if (!bookNum) return [];

  // 1차: bolls.life 시도
  try {
    const url = `${BASE_URL}/get-chapter/${translation}/${bookNum}/${chapter}/`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw) && raw.length > 0) {
        const verses = raw.map((v) => {
          let cleanText = (v.text || '')
            .replace(/<h\d?[^>]*>.*?<\/h\d?>/gi, ' ') // 소제목 헤딩 태그 제거
            .replace(/<[^>]+>/g, ' ') // 모든 HTML 태그 공백 치환
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();

          // 첫 부분 소제목 중복 정제
          cleanText = cleanText
            .replace(/^The\s+Beginning\s+(In\s+the\s+beginning)/i, '$1')
            .replace(/^The\s+Beginning\s+/i, '')
            .replace(/^The\s+Creation\s+/i, '')
            .trim();

          return {
            verse: v.verse,
            text: cleanText,
          };
        });

        if (verses.length > 0) {
          cache[cacheKey] = verses;
          return verses;
        }
      }
    }
  } catch (err) {
    console.warn(`bolls.life (${translation}) 호출 실패, 폴백 시도:`, err.message);
  }

  // 2차: bolls.life 내 KJV / ESV 시도
  if (translation !== 'KJV') {
    try {
      const altTrans = translation === 'NIV' ? 'ESV' : 'KJV';
      const altUrl = `${BASE_URL}/get-chapter/${altTrans}/${bookNum}/${chapter}/`;
      const res = await fetch(altUrl, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const verses = raw.map(v => ({
            verse: v.verse,
            text: (v.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          }));
          cache[cacheKey] = verses;
          return verses;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3차: bible-api.com 공개 고속 API 폴백
  try {
    const engBook = ENGLISH_BOOK_NAMES[bookId] || bookId;
    const bibleApiUrl = `https://bible-api.com/${engBook}+${chapter}?translation=kjv`;
    const res = await fetch(bibleApiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.verses && data.verses.length > 0) {
        const verses = data.verses.map(v => ({
          verse: v.verse,
          text: (v.text || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
        }));
        cache[cacheKey] = verses;
        return verses;
      }
    }
  } catch (err) {
    console.warn(`bible-api.com 폴백 실패:`, err.message);
  }

  return [];
};

/**
 * 한글(개역한글)과 영어 성경을 1:1 절 단위로 결합하여 반환
 */
export const fetchParallelChapter = async (bookId, chapter, engTranslation = 'NIV') => {
  const [koreanVerses, englishVerses] = await Promise.all([
    fetchChapter(bookId, chapter),
    fetchEnglishChapter(bookId, chapter, engTranslation)
  ]);

  const engMap = {};
  englishVerses.forEach(v => {
    engMap[v.verse] = v.text;
  });

  return koreanVerses.map(kv => ({
    verse: kv.verse,
    korean: kv.text,
    english: engMap[kv.verse] || ''
  }));
};

export const clearCache = () => {
  Object.keys(cache).forEach((k) => delete cache[k]);
  Object.keys(bookCache).forEach((k) => delete bookCache[k]);
};
