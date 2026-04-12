// 여호수아 남전도회 & 교회 전체 일정 + 교회 절기 + 법정공휴일
// category: 'joshua' | 'church' | 'personal' | 'holiday' | 'liturgy'

export const CATEGORY_LABELS = {
  joshua: '여호수아 남전도회',
  church: '교회 전체',
  personal: '개인',
  holiday: '공휴일',
  liturgy: '교회 절기',
};

export const CATEGORY_COLORS = {
  joshua: { bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.4)', text: '#D4AF37', dot: '#D4AF37' },
  church: { bg: 'rgba(79,134,198,0.15)', border: 'rgba(79,134,198,0.4)', text: '#4f86c6', dot: '#4f86c6' },
  personal: { bg: 'rgba(91,191,110,0.15)', border: 'rgba(91,191,110,0.4)', text: '#5bbf6e', dot: '#5bbf6e' },
  holiday: { bg: 'rgba(229,62,62,0.12)', border: 'rgba(229,62,62,0.3)', text: '#e53e3e', dot: '#e53e3e' },
  liturgy: { bg: 'rgba(156,100,212,0.12)', border: 'rgba(156,100,212,0.35)', text: '#9c64d4', dot: '#9c64d4' },
};

// ═══════════════════════════════════════════════════
// 2026년 대한민국 법정공휴일
// ═══════════════════════════════════════════════════
export const HOLIDAYS_2026 = [
  { id: 'h01', title: '신정', date: '2026-01-01', category: 'holiday', description: '새해 첫날' },
  { id: 'h02', title: '설날 연휴', date: '2026-02-16', category: 'holiday', description: '설날 전날' },
  { id: 'h03', title: '설날', date: '2026-02-17', category: 'holiday', description: '음력 1월 1일' },
  { id: 'h04', title: '설날 연휴', date: '2026-02-18', category: 'holiday', description: '설날 다음날' },
  { id: 'h05', title: '삼일절', date: '2026-03-01', category: 'holiday', description: '3·1 독립운동 기념일' },
  { id: 'h06', title: '어린이날', date: '2026-05-05', category: 'holiday', description: '어린이날' },
  { id: 'h07', title: '부처님오신날', date: '2026-05-24', category: 'holiday', description: '음력 4월 8일' },
  { id: 'h08', title: '현충일', date: '2026-06-06', category: 'holiday', description: '호국영령 추모일' },
  { id: 'h09', title: '광복절', date: '2026-08-15', category: 'holiday', description: '광복 81주년' },
  { id: 'h10', title: '추석 연휴', date: '2026-09-24', category: 'holiday', description: '추석 전날' },
  { id: 'h11', title: '추석', date: '2026-09-25', category: 'holiday', description: '음력 8월 15일' },
  { id: 'h12', title: '추석 연휴', date: '2026-09-26', category: 'holiday', description: '추석 다음날' },
  { id: 'h13', title: '개천절', date: '2026-10-03', category: 'holiday', description: '단군 건국 기념일' },
  { id: 'h14', title: '한글날', date: '2026-10-09', category: 'holiday', description: '한글 반포 기념일' },
  { id: 'h15', title: '성탄절', date: '2026-12-25', category: 'holiday', description: '예수 그리스도 탄생 기념일' },
];

// ═══════════════════════════════════════════════════
// 2026년 교회 절기 (기독교 교회력)
// ═══════════════════════════════════════════════════
export const LITURGY_2026 = [
  // ── 사순절 / 고난주간 ──
  { id: 'l01', title: '재의 수요일', date: '2026-02-18', category: 'liturgy', description: '사순절 시작 — 회개와 금식의 40일' },
  { id: 'l02', title: '사순절 시작', date: '2026-02-18', category: 'liturgy', description: '부활절까지 40일간의 절기' },
  { id: 'l03', title: '종려주일', date: '2026-03-29', category: 'liturgy', description: '예수님의 예루살렘 입성 기념 — 고난주간 시작' },
  { id: 'l04', title: '고난주간', date: '2026-03-30', endDate: '2026-04-04', category: 'liturgy', description: '예수님의 고난을 기억하는 한 주간' },
  { id: 'l05', title: '세족 목요일', date: '2026-04-02', category: 'liturgy', description: '예수님이 제자들의 발을 씻기심' },
  { id: 'l06', title: '성금요일', date: '2026-04-03', category: 'liturgy', description: '예수 그리스도의 십자가 고난과 죽음' },
  { id: 'l07', title: '부활절', date: '2026-04-05', category: 'liturgy', description: '예수 그리스도의 부활 기념일' },

  // ── 부활절 이후 ──
  { id: 'l08', title: '승천일', date: '2026-05-14', category: 'liturgy', description: '예수님의 승천 기념일 (부활 후 40일)' },
  { id: 'l09', title: '성령강림절', date: '2026-05-24', category: 'liturgy', description: '성령이 임하신 날 (오순절)' },
  { id: 'l10', title: '삼위일체주일', date: '2026-05-31', category: 'liturgy', description: '성부·성자·성령 삼위일체 고백 주일' },

  // ── 절기 주일 ──
  { id: 'l11', title: '어린이주일', date: '2026-05-03', category: 'liturgy', description: '어린이들을 위한 축복 예배' },
  { id: 'l12', title: '어버이주일', date: '2026-05-10', category: 'liturgy', description: '부모님을 공경하는 감사 예배' },
  { id: 'l13', title: '맥추감사절', date: '2026-07-05', category: 'liturgy', description: '첫 열매 수확 감사 (초막절 유래)' },
  { id: 'l14', title: '종교개혁주일', date: '2026-10-25', category: 'liturgy', description: '1517년 루터의 95개조 반박문 기념' },
  { id: 'l15', title: '추수감사주일', date: '2026-11-15', category: 'liturgy', description: '한 해의 수확을 감사하는 예배' },

  // ── 대림절 / 성탄절 ──
  { id: 'l16', title: '대림절 첫째주', date: '2026-11-29', category: 'liturgy', description: '대림절 시작 — 소망의 촛불' },
  { id: 'l17', title: '대림절 둘째주', date: '2026-12-06', category: 'liturgy', description: '평화의 촛불' },
  { id: 'l18', title: '대림절 셋째주', date: '2026-12-13', category: 'liturgy', description: '기쁨의 촛불' },
  { id: 'l19', title: '대림절 넷째주', date: '2026-12-20', category: 'liturgy', description: '사랑의 촛불' },
  { id: 'l20', title: '성탄절', date: '2026-12-25', category: 'liturgy', description: '예수 그리스도의 탄생 기념일' },
  { id: 'l21', title: '송구영신예배', date: '2026-12-31', category: 'liturgy', description: '한 해를 보내고 새해를 맞이하는 예배' },
];

// ═══════════════════════════════════════════════════
// 교회 & 남전도회 일정 (기존)
// ═══════════════════════════════════════════════════
export const SAMPLE_EVENTS = [
  // ── 공휴일 + 교회 절기 자동 포함 ──
  ...HOLIDAYS_2026,
  ...LITURGY_2026,

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
  { id: 17, title: '성령강림절 예배', date: '2026-05-24', time: '11:00', category: 'church', description: '성령강림절 특별예배' },
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
  { id: 29, title: '종교개혁주일 예배', date: '2026-10-25', time: '11:00', category: 'church', description: '종교개혁주일 기념 예배' },
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
 */
export const getEventsForDate = (events, dateStr) => {
  return events.filter((e) => {
    if (e.date === dateStr) return true;
    if (e.endDate) return dateStr >= e.date && dateStr <= e.endDate;
    return false;
  });
};

/**
 * 특정 월의 이벤트 반환
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

/**
 * 특정 날짜의 공휴일/절기 라벨 반환 (캘린더 셀에 표시용)
 * 우선순위: holiday > liturgy
 */
export const getDateLabel = (dateStr) => {
  const holiday = HOLIDAYS_2026.find(h => h.date === dateStr);
  if (holiday) return { text: holiday.title, color: CATEGORY_COLORS.holiday.text, type: 'holiday' };

  const liturgy = LITURGY_2026.find(l => l.date === dateStr);
  if (liturgy) return { text: liturgy.title, color: CATEGORY_COLORS.liturgy.text, type: 'liturgy' };

  return null;
};
