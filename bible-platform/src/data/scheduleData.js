// 여호수아 남전도회 & 교회 전체 일정 샘플 데이터
// category: 'joshua' (남전도회) | 'church' (교회 전체) | 'personal' (개인)

export const CATEGORY_LABELS = {
  joshua: '여호수아 남전도회',
  church: '교회 전체',
  personal: '개인',
};

export const CATEGORY_COLORS = {
  joshua: { bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.4)', text: '#D4AF37', dot: '#D4AF37' },
  church: { bg: 'rgba(79,134,198,0.15)', border: 'rgba(79,134,198,0.4)', text: '#4f86c6', dot: '#4f86c6' },
  personal: { bg: 'rgba(91,191,110,0.15)', border: 'rgba(91,191,110,0.4)', text: '#5bbf6e', dot: '#5bbf6e' },
};

// 2026년 기준 샘플 일정
export const SAMPLE_EVENTS = [
  // ─── 1월 ───
  { id: 1, title: '신년감사예배', date: '2026-01-04', time: '11:00', category: 'church', description: '2026년 신년 감사예배' },
  { id: 2, title: '남전도회 신년 모임', date: '2026-01-10', time: '19:00', category: 'joshua', description: '2026년 남전도회 활동 계획 수립' },
  { id: 3, title: '성경통독 시작', date: '2026-01-01', time: '06:00', category: 'joshua', description: '1년 성경통독 시작일' },
  // ─── 2월 ───
  { id: 4, title: '남전도회 정기 모임', date: '2026-02-14', time: '19:00', category: 'joshua', description: '2월 정기 모임 및 기도회' },
  { id: 5, title: '동계 수련회', date: '2026-02-21', time: '14:00', endDate: '2026-02-22', category: 'church', description: '교회 전체 동계 수련회' },
  // ─── 3월 ───
  { id: 6, title: '남전도회 정기 모임', date: '2026-03-14', time: '19:00', category: 'joshua', description: '3월 정기 모임' },
  { id: 7, title: '삼일절 특별기도회', date: '2026-03-01', time: '06:00', category: 'church', description: '나라를 위한 특별 기도회' },
  // ─── 4월 ───
  { id: 8, title: '부활절 감사예배', date: '2026-04-05', time: '11:00', category: 'church', description: '부활절 특별 감사예배 및 세례식' },
  { id: 9, title: '남전도회 정기 모임', date: '2026-04-11', time: '19:00', category: 'joshua', description: '4월 정기 모임' },
  { id: 10, title: '부활절 전교인 야유회', date: '2026-04-12', time: '10:00', category: 'church', description: '부활절 기념 전교인 친교 행사' },
  { id: 11, title: '남전도회 새벽기도', date: '2026-04-18', time: '05:30', category: 'joshua', description: '특별 새벽기도 주간' },
  // ─── 5월 ───
  { id: 12, title: '어린이 주일', date: '2026-05-03', time: '11:00', category: 'church', description: '어린이 주일 특별예배' },
  { id: 13, title: '어버이 주일', date: '2026-05-10', time: '11:00', category: 'church', description: '어버이 주일 감사예배' },
  { id: 14, title: '남전도회 봄 수련회', date: '2026-05-16', time: '14:00', endDate: '2026-05-17', category: 'joshua', description: '1박 2일 수련회 (기도원)' },
  { id: 15, title: '남전도회 정기 모임', date: '2026-05-09', time: '19:00', category: 'joshua', description: '5월 정기 모임' },
  // ─── 6월 ───
  { id: 16, title: '남전도회 정기 모임', date: '2026-06-13', time: '19:00', category: 'joshua', description: '6월 정기 모임' },
  { id: 17, title: '성령강림절', date: '2026-05-24', time: '11:00', category: 'church', description: '성령강림절 특별예배' },
  { id: 18, title: '현충일 기도회', date: '2026-06-06', time: '11:00', category: 'church', description: '호국영령을 위한 기도회' },
  // ─── 7월 ───
  { id: 19, title: '맥추감사절 예배', date: '2026-07-05', time: '11:00', category: 'church', description: '맥추감사절 특별 감사예배' },
  { id: 20, title: '남전도회 정기 모임', date: '2026-07-11', time: '19:00', category: 'joshua', description: '7월 정기 모임' },
  { id: 21, title: '여름 성경학교', date: '2026-07-27', time: '09:00', endDate: '2026-07-31', category: 'church', description: '여름 어린이 성경학교' },
  // ─── 8월 ───
  { id: 22, title: '남전도회 여름 봉사', date: '2026-08-08', time: '08:00', endDate: '2026-08-09', category: 'joshua', description: '지역사회 봉사활동' },
  { id: 23, title: '남전도회 정기 모임', date: '2026-08-08', time: '19:00', category: 'joshua', description: '8월 정기 모임' },
  { id: 24, title: '광복절 기도회', date: '2026-08-15', time: '11:00', category: 'church', description: '광복절 기념 기도회' },
  // ─── 9월 ───
  { id: 25, title: '남전도회 정기 모임', date: '2026-09-12', time: '19:00', category: 'joshua', description: '9월 정기 모임' },
  { id: 26, title: '추석 감사예배', date: '2026-09-25', time: '11:00', category: 'church', description: '추석 감사예배' },
  // ─── 10월 ───
  { id: 27, title: '남전도회 가을 수련회', date: '2026-10-17', time: '14:00', endDate: '2026-10-18', category: 'joshua', description: '가을 수련회 (1박 2일)' },
  { id: 28, title: '남전도회 정기 모임', date: '2026-10-10', time: '19:00', category: 'joshua', description: '10월 정기 모임' },
  { id: 29, title: '종교개혁주일', date: '2026-10-25', time: '11:00', category: 'church', description: '종교개혁주일 기념 예배' },
  // ─── 11월 ───
  { id: 30, title: '추수감사절 예배', date: '2026-11-15', time: '11:00', category: 'church', description: '추수감사절 감사예배 및 바자회' },
  { id: 31, title: '남전도회 정기 모임', date: '2026-11-14', time: '19:00', category: 'joshua', description: '11월 정기 모임' },
  { id: 32, title: '전교인 체육대회', date: '2026-11-08', time: '10:00', category: 'church', description: '가을 전교인 체육대회' },
  // ─── 12월 ───
  { id: 33, title: '대림절 시작', date: '2026-11-29', time: '11:00', category: 'church', description: '대림절 첫째 주일' },
  { id: 34, title: '남전도회 송년 모임', date: '2026-12-12', time: '18:00', category: 'joshua', description: '남전도회 송년회 및 감사의 밤' },
  { id: 35, title: '성탄절 예배', date: '2026-12-25', time: '11:00', category: 'church', description: '성탄 축하 예배 및 성극' },
  { id: 36, title: '송년 감사예배', date: '2026-12-27', time: '11:00', category: 'church', description: '2026년 송년 감사예배' },
  { id: 37, title: '송구영신예배', date: '2026-12-31', time: '23:00', category: 'church', description: '송구영신 예배' },
];

/**
 * 특정 날짜의 이벤트 반환
 * @param {object[]} events
 * @param {string} dateStr - 'YYYY-MM-DD'
 */
export const getEventsForDate = (events, dateStr) => {
  return events.filter((e) => {
    if (e.date === dateStr) return true;
    // 기간 이벤트 처리
    if (e.endDate) {
      return dateStr >= e.date && dateStr <= e.endDate;
    }
    return false;
  });
};

/**
 * 특정 월의 이벤트 반환
 * @param {object[]} events
 * @param {number} year
 * @param {number} month - 0-indexed
 */
export const getEventsForMonth = (events, year, month) => {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return events.filter((e) => e.date.startsWith(prefix));
};

/**
 * 다가오는 N개의 이벤트 반환
 */
export const getUpcomingEvents = (events, count = 5) => {
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
};
