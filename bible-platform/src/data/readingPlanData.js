// 성경 통독 플랜 데이터 생성기
// 66권 1,189장을 365일(또는 커스텀)로 균등 배분

import { BIBLE_BOOKS } from './bibleData';

/**
 * 성경 책 목록으로부터 (book, chapter) 쌍의 배열을 생성
 */
const expandChapters = (books) => {
  const chapters = [];
  books.forEach((book) => {
    for (let ch = 1; ch <= book.chapters; ch++) {
      chapters.push({ bookId: book.id, bookName: book.name, shortName: book.shortName, chapter: ch });
    }
  });
  return chapters;
};

/**
 * 장 배열을 N일로 균등 배분하여 dailySchedule 생성
 */
const distributeChapters = (chapters, totalDays) => {
  const schedule = [];
  const perDay = chapters.length / totalDays;

  for (let day = 0; day < totalDays; day++) {
    const start = Math.floor(day * perDay);
    const end = Math.floor((day + 1) * perDay);
    const dayChapters = chapters.slice(start, end);

    if (dayChapters.length === 0) continue;

    // 범위 문자열 생성
    const first = dayChapters[0];
    const last = dayChapters[dayChapters.length - 1];

    let range = '';
    let ref = '';

    if (first.bookId === last.bookId) {
      // 같은 책
      if (first.chapter === last.chapter) {
        range = `${first.bookName} ${first.chapter}장`;
        ref = `${first.shortName} ${first.chapter}`;
      } else {
        range = `${first.bookName} ${first.chapter}~${last.chapter}장`;
        ref = `${first.shortName} ${first.chapter}-${last.chapter}`;
      }
    } else {
      // 다른 책
      range = `${first.bookName} ${first.chapter}장 ~ ${last.bookName} ${last.chapter}장`;
      ref = `${first.shortName} ${first.chapter} - ${last.shortName} ${last.chapter}`;
    }

    schedule.push({
      day: day + 1,
      range,
      ref,
      bookId: first.bookId,
      chapter: first.chapter,
      chapters: dayChapters,
    });
  }

  return schedule;
};

/**
 * 플랜 타입별 일정 생성
 * @param {'full-year'|'old-testament'|'new-testament'|'custom'} type
 * @param {string[]} selectedBookIds - custom일 때 선택한 책 ID 배열
 * @returns {{ type, totalDays, dailySchedule, selectedBooks }}
 */
export const generatePlan = (type, selectedBookIds = []) => {
  let books;

  switch (type) {
    case 'old-testament':
      books = BIBLE_BOOKS.filter((b) => b.testament === 'old');
      break;
    case 'new-testament':
      books = BIBLE_BOOKS.filter((b) => b.testament === 'new');
      break;
    case 'custom':
      books = BIBLE_BOOKS.filter((b) => selectedBookIds.includes(b.id));
      break;
    case 'full-year':
    default:
      books = [...BIBLE_BOOKS];
      break;
  }

  if (books.length === 0) books = [...BIBLE_BOOKS];

  const chapters = expandChapters(books);
  const totalChapters = chapters.length;

  // 하루 3~4장 읽는 것을 기준으로 일수 결정
  let totalDays;
  if (type === 'full-year') {
    totalDays = 365;
  } else {
    // 하루 평균 3.25장 기준
    totalDays = Math.max(7, Math.ceil(totalChapters / 3.25));
  }

  const dailySchedule = distributeChapters(chapters, totalDays);

  return {
    type,
    totalDays: dailySchedule.length,
    dailySchedule,
    selectedBooks: books.map((b) => b.id),
  };
};

/**
 * 기본 365일 통독 플랜 (앱 초기화용)
 */
export const DEFAULT_PLAN = generatePlan('full-year');

/**
 * 플랜 타입 라벨
 */
export const PLAN_TYPE_LABELS = {
  'full-year': '전체 성경 1년 통독',
  'old-testament': '구약 통독',
  'new-testament': '신약 통독',
  'custom': '사용자 선택 플랜',
};

/**
 * 월 이름 (한국어)
 */
export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

/**
 * dailySchedule을 월별로 그룹핑 (30일 단위)
 */
export const groupByMonth = (schedule) => {
  const groups = [];
  for (let m = 0; m < 12; m++) {
    const startDay = m === 0 ? 1 : Math.floor((m / 12) * schedule.length) + 1;
    const endDay = m === 11 ? schedule.length : Math.floor(((m + 1) / 12) * schedule.length);
    const items = schedule.filter((s) => s.day >= startDay && s.day <= endDay);
    if (items.length > 0) {
      groups.push({ month: m, label: MONTH_NAMES[m], items });
    }
  }
  return groups;
};
