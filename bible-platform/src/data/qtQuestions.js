/**
 * QT (Quiet Time) 묵상 질문 자동 생성기
 *
 * 성경구절 입력 시 책 종류에 따라 적합한 QT 질문 세트를 반환합니다.
 */

// 책 ID → 장르(type) 분류
const BOOK_TYPE_MAP = {
  // 율법서
  gen: 'torah', exo: 'torah', lev: 'torah', num: 'torah', deu: 'torah',
  // 역사서
  jos: 'history', jdg: 'history', rut: 'history',
  '1sa': 'history', '2sa': 'history', '1ki': 'history', '2ki': 'history',
  '1ch': 'history', '2ch': 'history', ezr: 'history', neh: 'history', est: 'history',
  // 시가서
  job: 'poetry', psa: 'psalm', pro: 'wisdom', ecc: 'wisdom', sng: 'poetry',
  // 선지서
  isa: 'prophecy', jer: 'prophecy', lam: 'lament',
  eze: 'prophecy', dan: 'prophecy',
  hos: 'prophecy', joe: 'prophecy', amo: 'prophecy', oba: 'prophecy',
  jon: 'prophecy', mic: 'prophecy', nah: 'prophecy', hab: 'prophecy',
  zep: 'prophecy', hag: 'prophecy', zec: 'prophecy', mal: 'prophecy',
  // 복음서
  mat: 'gospel', mar: 'gospel', luk: 'gospel', joh: 'gospel',
  // 역사서(신약)
  act: 'acts',
  // 서신서
  rom: 'epistle', '1co': 'epistle', '2co': 'epistle',
  gal: 'epistle', eph: 'epistle', php: 'epistle', col: 'epistle',
  '1th': 'epistle', '2th': 'epistle', '1ti': 'epistle', '2ti': 'epistle',
  tit: 'epistle', phm: 'epistle', heb: 'epistle',
  jam: 'epistle', '1pe': 'epistle', '2pe': 'epistle',
  '1jo': 'epistle', '2jo': 'epistle', '3jo': 'epistle', jud: 'epistle',
  // 계시록
  rev: 'revelation',
};

// 장르별 QT 질문 세트
const QT_QUESTIONS = {
  torah: [
    '이 말씀에서 하나님은 어떤 분으로 나타나시나요? 그분의 성품 중 가장 인상 깊은 것은 무엇인가요?',
    '하나님의 명령이나 약속 중에서 오늘 내게 특별히 적용되는 것이 있나요?',
    '이 본문에서의 사건이나 인물을 통해 나는 무엇을 배울 수 있나요?',
    '이 말씀을 통해 "순종"에 대해 어떤 새로운 깨달음을 얻었나요?',
  ],
  history: [
    '이 이야기에 등장하는 인물 중 떠오르는 사람이 있나요? 왜 그 사람이 마음에 남나요?',
    '하나님이 이 역사적 상황 속에서 어떻게 역사하셨나요? 내 삶에서도 비슷한 경험이 있었나요?',
    '이 인물의 믿음이나 실패에서 내가 배울 수 있는 교훈은 무엇인가요?',
    '이 상황에서 내가 그 인물이었다면 어떻게 했을까요?',
  ],
  psalm: [
    '이 시편은 어떤 감정을 담고 있나요? 지금 나의 마음과 어떻게 연결되나요?',
    '시편 기자가 하나님께 무엇을 구하고, 무엇을 고백하나요?',
    '이 시편에서 하나님의 어떤 성품이 드러나나요? 그것이 나에게 어떤 위로가 되나요?',
    '이 말씀을 가지고 오늘 나만의 기도시를 짧게 써볼 수 있을까요?',
  ],
  wisdom: [
    '이 말씀이 제안하는 지혜는 무엇인가요? 오늘 내 상황에 어떻게 적용할 수 있나요?',
    '"지혜로운 삶"과 "어리석은 삶"의 차이를 이 본문에서 어떻게 보여주나요?',
    '이 가르침을 내 가정, 직장, 관계 속에서 어떻게 실천할 수 있을까요?',
    '이 말씀이 현대 사회의 가치관과 어떻게 다른가요? 그 차이에서 무엇을 느끼나요?',
  ],
  poetry: [
    '이 말씀의 이미지나 비유 중 마음에 깊이 들어오는 것은 무엇인가요?',
    '이 말씀이 표현하는 감정이나 갈망을 나는 어떻게 경험해 보았나요?',
    '이 말씀 속에서 하나님과의 관계가 어떻게 표현되고 있나요?',
    '이 말씀을 통해 하나님께 전하고 싶은 나의 마음은 무엇인가요?',
  ],
  prophecy: [
    '이 선지서 말씀에서 하나님은 그 백성에게 무엇을 말씀하시나요? 오늘 나에게는 무슨 의미인가요?',
    '이 말씀에 담긴 경고나 위로 중 지금 내게 더 필요한 것은 무엇인가요?',
    '하나님이 이 말씀에서 어떤 비전을 제시하시나요? 그 비전이 나를 어떻게 이끄나요?',
    '이 말씀이 예수님과 어떻게 연결될 수 있나요?',
  ],
  lament: [
    '이 애가서 말씀에서 어떤 아픔이 표현되나요? 나의 삶에서 비슷한 슬픔이 있었나요?',
    '고통 속에서도 하나님을 향한 신뢰가 어떻게 표현되나요?',
    '"슬픔도 하나님 앞에 가져갈 수 있다"는 것이 나에게 어떤 의미가 있나요?',
    '이 말씀을 통해 지금 품고 있는 무거운 마음을 하나님께 어떻게 드릴 수 있을까요?',
  ],
  gospel: [
    '이 본문에서 예수님은 어떤 모습으로 나타나시나요? 그분의 어떤 점이 가장 마음에 남나요?',
    '예수님의 말씀이나 행동 중 오늘 나에게 도전이 되는 것은 무엇인가요?',
    '이 이야기에 등장하는 사람들 중 나와 가장 비슷한 사람은 누구인가요? 그 이유는?',
    '예수님이 나에게 직접 이 말씀을 하신다면, 어떤 마음으로 듣게 될까요?',
  ],
  acts: [
    '초대교회 성도들의 모습 중 오늘 나에게 도전이 되는 것은 무엇인가요?',
    '이 본문에서 성령님은 어떻게 역사하시나요? 내 삶에서도 그런 경험이 있나요?',
    '복음이 전파되는 과정에서 어떤 어려움이 있었나요? 그것을 어떻게 극복했나요?',
    '오늘 내 주변에서 복음을 나눌 수 있는 기회는 어떤 것이 있을까요?',
  ],
  epistle: [
    '이 편지에서 저자가 가장 강조하는 신앙의 핵심은 무엇인가요?',
    '이 말씀이 내 신앙생활에서 바꾸어야 할 태도나 습관을 보여주나요?',
    '이 말씀이 내가 속한 공동체(가정, 교회, 직장)에 어떻게 적용될 수 있나요?',
    '"그리스도 안에서의 정체성"이 이 본문에서 어떻게 표현되나요? 나는 그 정체성을 얼마나 체감하고 있나요?',
  ],
  revelation: [
    '이 말씀에서 하나님의 통치와 최후 승리가 어떻게 묘사되나요? 그것이 내게 위로가 되나요?',
    '"어린 양이 이기셨다"는 진리가 오늘 내가 마주하는 두려움에 어떤 빛을 비추나요?',
    '이 말씀에서 교회(나)에게 주어진 경고나 격려는 무엇인가요?',
    '영원한 것과 일시적인 것 사이에서, 이 말씀은 내가 무엇에 집중하도록 이끄나요?',
  ],
};

// 공통 QT 질문 (어떤 책이든 쓸 수 있는 보편적 질문)
const COMMON_QUESTIONS = [
  '오늘 말씀에서 가장 마음에 와닿은 단어나 구절은 무엇인가요?',
  '이 말씀이 오늘 나의 상황 또는 감정과 어떻게 연결되나요?',
  '이 말씀을 통해 하나님이 내게 무엇을 보여주시려는 것 같나요?',
  '이 말씀을 삶에 적용한다면 오늘 구체적으로 어떻게 행동할 수 있을까요?',
];

/**
 * 성경책 ID와 선택적 키워드를 기반으로 QT 질문 3~4개를 반환
 * @param {string} bookId - 성경 책 ID (ex: 'gen', 'joh', 'psa')
 * @returns {string[]} QT 질문 배열
 */
export const getQTQuestions = (bookId) => {
  if (!bookId) return COMMON_QUESTIONS.slice(0, 4);

  const type = BOOK_TYPE_MAP[bookId?.toLowerCase()] || 'epistle';
  const specific = QT_QUESTIONS[type] || [];

  // 장르별 질문 3개 + 공통 질문 1개
  return [
    ...specific.slice(0, 3),
    COMMON_QUESTIONS[3], // "오늘 구체적으로 어떻게 행동할까요?"는 항상 포함
  ];
};

/**
 * 성경구절 입력 문자열에서 책 ID를 추출
 * 예: "요한복음 3:16" → 'joh', "시편 23편" → 'psa'
 */
export const inferBookIdFromVerse = (verseStr) => {
  if (!verseStr) return null;
  const map = [
    { keywords: ['창세기', '창'], id: 'gen' },
    { keywords: ['출애굽기', '출'], id: 'exo' },
    { keywords: ['레위기', '레'], id: 'lev' },
    { keywords: ['민수기', '민'], id: 'num' },
    { keywords: ['신명기', '신'], id: 'deu' },
    { keywords: ['여호수아', '수'], id: 'jos' },
    { keywords: ['사사기', '삿'], id: 'jdg' },
    { keywords: ['룻기', '룻'], id: 'rut' },
    { keywords: ['사무엘상', '삼상'], id: '1sa' },
    { keywords: ['사무엘하', '삼하'], id: '2sa' },
    { keywords: ['열왕기상', '왕상'], id: '1ki' },
    { keywords: ['열왕기하', '왕하'], id: '2ki' },
    { keywords: ['역대상', '대상'], id: '1ch' },
    { keywords: ['역대하', '대하'], id: '2ch' },
    { keywords: ['에스라', '스'], id: 'ezr' },
    { keywords: ['느헤미야', '느'], id: 'neh' },
    { keywords: ['에스더', '에'], id: 'est' },
    { keywords: ['욥기', '욥'], id: 'job' },
    { keywords: ['시편', '시'], id: 'psa' },
    { keywords: ['잠언', '잠'], id: 'pro' },
    { keywords: ['전도서', '전'], id: 'ecc' },
    { keywords: ['아가', '아'], id: 'sng' },
    { keywords: ['이사야', '사'], id: 'isa' },
    { keywords: ['예레미야', '렘'], id: 'jer' },
    { keywords: ['예레미야애가', '애가', '애'], id: 'lam' },
    { keywords: ['에스겔', '겔'], id: 'eze' },
    { keywords: ['다니엘', '단'], id: 'dan' },
    { keywords: ['호세아', '호'], id: 'hos' },
    { keywords: ['요엘', '욜'], id: 'joe' },
    { keywords: ['아모스', '암'], id: 'amo' },
    { keywords: ['오바댜', '옵'], id: 'oba' },
    { keywords: ['요나', '욘'], id: 'jon' },
    { keywords: ['미가', '미'], id: 'mic' },
    { keywords: ['나훔', '나'], id: 'nah' },
    { keywords: ['하박국', '합'], id: 'hab' },
    { keywords: ['스바냐', '습'], id: 'zep' },
    { keywords: ['학개', '학'], id: 'hag' },
    { keywords: ['스가랴', '슥'], id: 'zec' },
    { keywords: ['말라기', '말'], id: 'mal' },
    { keywords: ['마태복음', '마태', '마'], id: 'mat' },
    { keywords: ['마가복음', '마가', '막'], id: 'mar' },
    { keywords: ['누가복음', '누가', '눅'], id: 'luk' },
    { keywords: ['요한복음', '요한'], id: 'joh' },
    { keywords: ['사도행전', '행'], id: 'act' },
    { keywords: ['로마서', '롬'], id: 'rom' },
    { keywords: ['고린도전서', '고전'], id: '1co' },
    { keywords: ['고린도후서', '고후'], id: '2co' },
    { keywords: ['갈라디아서', '갈'], id: 'gal' },
    { keywords: ['에베소서', '엡'], id: 'eph' },
    { keywords: ['빌립보서', '빌'], id: 'php' },
    { keywords: ['골로새서', '골'], id: 'col' },
    { keywords: ['데살로니가전서', '살전'], id: '1th' },
    { keywords: ['데살로니가후서', '살후'], id: '2th' },
    { keywords: ['디모데전서', '딤전'], id: '1ti' },
    { keywords: ['디모데후서', '딤후'], id: '2ti' },
    { keywords: ['디도서', '딛'], id: 'tit' },
    { keywords: ['빌레몬서', '몬'], id: 'phm' },
    { keywords: ['히브리서', '히'], id: 'heb' },
    { keywords: ['야고보서', '약'], id: 'jam' },
    { keywords: ['베드로전서', '벧전'], id: '1pe' },
    { keywords: ['베드로후서', '벧후'], id: '2pe' },
    { keywords: ['요한일서', '요일'], id: '1jo' },
    { keywords: ['요한이서', '요이'], id: '2jo' },
    { keywords: ['요한삼서', '요삼'], id: '3jo' },
    { keywords: ['유다서', '유'], id: 'jud' },
    { keywords: ['요한계시록', '계시록', '계'], id: 'rev' },
  ];

  for (const entry of map) {
    for (const kw of entry.keywords) {
      if (verseStr.includes(kw)) return entry.id;
    }
  }
  return null;
};
