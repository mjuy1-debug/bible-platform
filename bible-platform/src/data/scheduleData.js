// 여호수아 남전도회 & 교회 전체 일정 + 교회 절기 + 법정공휴일
// category: 'joshua' | 'church' | 'personal' | 'holiday' | 'liturgy'

export const CATEGORY_LABELS = {
  joshua: '여호수아 남전도회',
  church: '교회 전체',
  holiday: '공휴일',
  liturgy: '교회 절기',
};

export const CATEGORY_COLORS = {
  joshua: { bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.4)', text: '#D4AF37', dot: '#D4AF37' },
  church: { bg: 'rgba(79,134,198,0.15)', border: 'rgba(79,134,198,0.4)', text: '#4f86c6', dot: '#4f86c6' },
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
// 2026년 교회 절기 (개신교 기준)
// ═══════════════════════════════════════════════════
export const LITURGY_2026 = [
  // ── 고난주간 / 부활절 ──
  { id: 'l01', title: '종려주일', date: '2026-03-29', category: 'liturgy', description: '예수님의 예루살렘 입성 기념 — 고난주간 시작' },
  { id: 'l02', title: '고난주간', date: '2026-03-30', endDate: '2026-04-04', category: 'liturgy', description: '예수님의 고난을 기억하는 한 주간' },
  { id: 'l04', title: '부활절', date: '2026-04-05', category: 'liturgy', description: '예수 그리스도의 부활 기념일' },

  // ── 성령강림절 ──
  { id: 'l05', title: '성령강림절', date: '2026-05-24', category: 'liturgy', description: '성령이 임하신 날 (오순절)' },

  // ── 개신교 절기 주일 ──
  { id: 'l06', title: '어린이주일', date: '2026-05-03', category: 'liturgy', description: '어린이들을 위한 축복 예배' },
  { id: 'l07', title: '어버이주일', date: '2026-05-10', category: 'liturgy', description: '부모님을 공경하는 감사 예배' },
  { id: 'l08', title: '맥추감사절', date: '2026-07-05', category: 'liturgy', description: '첫 열매 수확 감사 예배' },
  { id: 'l09', title: '종교개혁주일', date: '2026-10-25', category: 'liturgy', description: '1517년 루터의 95개조 반박문 기념' },
  { id: 'l10', title: '추수감사주일', date: '2026-11-15', category: 'liturgy', description: '한 해의 수확을 감사하는 예배' },

  // ── 대림절 / 성탄절 ──
  { id: 'l11', title: '대림절 첫째주', date: '2026-11-29', category: 'liturgy', description: '대림절 시작 — 소망의 촛불' },
  { id: 'l12', title: '대림절 둘째주', date: '2026-12-06', category: 'liturgy', description: '평화의 촛불' },
  { id: 'l13', title: '대림절 셋째주', date: '2026-12-13', category: 'liturgy', description: '기쁨의 촛불' },
  { id: 'l14', title: '대림절 넷째주', date: '2026-12-20', category: 'liturgy', description: '사랑의 촛불' },
  { id: 'l15', title: '성탄절', date: '2026-12-25', category: 'liturgy', description: '예수 그리스도의 탄생 기념일' },
  { id: 'l16', title: '송구영신예배', date: '2026-12-31', category: 'liturgy', description: '한 해를 보내고 새해를 맞이하는 예배' },
];

// ═══════════════════════════════════════════════════
// 교회 & 남전도회 일정 (기존)
// ═══════════════════════════════════════════════════
export const SAMPLE_EVENTS = [
  // ── 공휴일 + 교회 절기 자동 포함 ──
  ...HOLIDAYS_2026,
  ...LITURGY_2026,



  // ── 사용자/교회 일정 ──
  { id: 1, title: '신년감사예배', date: '2026-01-04', time: '11:00', category: 'church', description: '2026년 신년 감사예배' },
  { id: 2, title: '삼일절 특별기도회', date: '2026-03-01', time: '06:00', category: 'church', description: '나라를 위한 특별 기도회' },
  { id: 3, title: '부활절 감사예배', date: '2026-04-05', time: '11:00', category: 'church', description: '부활절 특별 감사예배 및 세례식' },
  { id: 4, title: '어린이 주일', date: '2026-05-03', time: '11:00', category: 'church', description: '어린이 주일 특별예배' },
  { id: 5, title: '어버이 주일', date: '2026-05-10', time: '11:00', category: 'church', description: '어버이 주일 감사예배' },
  { id: 6, title: '맥추감사절 예배', date: '2026-07-05', time: '11:00', category: 'church', description: '맥추감사절 특별 감사예배' },
  { id: 7, title: '추수감사절 예배', date: '2026-11-15', time: '11:00', category: 'church', description: '추수감사절 감사예배 및 바자회' },
  { id: 8, title: '전교인 체육대회', date: '2026-11-08', time: '10:00', category: 'church', description: '가을 전교인 체육대회' },
  { id: 9, title: '대림절 시작', date: '2026-11-29', time: '11:00', category: 'church', description: '대림절 첫째 주일' },
  { id: 10, title: '성탄절 예배', date: '2026-12-25', time: '11:00', category: 'church', description: '성탄 축하 예배 및 성극' },
  { id: 11, title: '송구헌신예배', date: '2026-12-31', time: '23:00', category: 'church', description: '2026년 송구헌신예배' },
  { id: 12, title: '송구영신예배', date: '2026-12-31', time: '23:00', category: 'church', description: '송구영신 예배' },
  { id: 13, title: '제 14차 필리핀선교지 방문', date: '2026-03-16', endDate: '2026-03-20', category: 'church', description: '제 14차 필리핀선교지 방문' },
  { id: 14, title: '1/4분기 선교헌신예배', date: '2026-03-22', category: 'church', description: '1/4분기 선교헌신예배' },
  { id: 15, title: '교회본당 대청소', date: '2026-03-28', category: 'church', description: '교회본당 대청소' },
  { id: 16, title: '수양관 밭갈이', date: '2026-03-29', category: 'joshua', description: '수양관 밭갈이' },
  { id: 17, title: '부활주일(계란전도대회)', date: '2026-04-05', category: 'church', description: '부활주일(계란전도대회)' },
  { id: 18, title: '주일학교일일수련회', date: '2026-04-18', category: 'joshua', description: '주일학교일일수련회,차량봉사' },
  { id: 19, title: '루디아나들이', date: '2026-04-26', category: 'joshua', description: '루디아나들이,차량봉사' },
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
 * 특정 월의 이벤트 반환 (걸쳐있는 연속 일정도 포함)
 */
export const getEventsForMonth = (events, year, month) => {
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  
  // get last day of the current month without timezone conversion issue
  const lastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return events.filter((e) => {
    const start = e.date;
    const end = e.endDate || e.date;
    return start <= monthEnd && end >= monthStart;
  });
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
