// 바이블프로젝트 (BibleProject - Korean) 공식 채널 및 말씀 영상 데이터베이스
// 공식 채널: https://www.youtube.com/@BibleProjectKorean
// 공식 웹사이트: https://bibleproject.com/korean/

export const BP_CHANNEL_URL = 'https://www.youtube.com/@BibleProjectKorean';
export const BP_OFFICIAL_HOME = 'https://bibleproject.com/korean/';

// 실제 검증된 바이블프로젝트 한국어 공식 대표 영상 ID
export const BP_FEATURED_VIDEOS = {
  'righteousness': { videoId: 'n_2HzBuoMWM', title: '성경에서 말하는 참된 의(Righteousness)' },
  'kingdom': { videoId: '9btp7VMvjR4', title: '바실레이아: 하나님의 영원한 왕국' },
  'mammon': { videoId: 'Njsb4LqREJ0', title: '예수님이 말씀하신 맘몬과 하나님 나라' },
  'fruit': { videoId: 'xT4wB3W0hU4', title: '좋은 열매와 나쁜 열매의 분별' },
  'torah': { videoId: 'nBjpcg610TI', title: '토라: 하나님의 거룩한 가르침' }
};

export const BIBLE_PROJECT_VIDEOS = {
  // === 구약 주요 인물 ===
  'hero_char_1': {
    characterName: '아담',
    title: '창세기 개요 (창조와 타락, 구속사의 시작)',
    searchKeyword: '창세기',
    defaultVideoId: 'nBjpcg610TI',
    description: '하나님의 형상으로 지음 받은 첫 사람 아담과 에덴에서의 타락, 그리고 구속사의 시작을 다룹니다.',
    duration: '약 7~9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_2': {
    characterName: '하와',
    title: '창세기 개요 (하와와 뱀의 유혹, 원시 복음)',
    searchKeyword: '창세기',
    defaultVideoId: 'nBjpcg610TI',
    description: '모든 산 자의 어머니 하와와 죄의 시작, 원시 복음(창 3:15)의 언약을 배웁니다.',
    duration: '약 7~9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_3': {
    characterName: '아벨',
    title: '창세기 개요 (가인과 아벨의 제사)',
    searchKeyword: '창세기',
    defaultVideoId: 'n_2HzBuoMWM',
    description: '믿음으로 더 나은 제사를 드린 의인 아벨과 하나님을 기쁘시게 하는 참된 예배를 조명합니다.',
    duration: '약 7~9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_4': {
    characterName: '에녹',
    title: '창세기 (하나님과 동행한 삶)',
    searchKeyword: '창세기',
    defaultVideoId: 'n_2HzBuoMWM',
    description: '죽음을 보지 않고 하나님과 300년간 동행한 믿음의 사람 에녹의 영적 비밀을 배웁니다.',
    duration: '약 7~9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_5': {
    characterName: '노아',
    title: '창세기 (노아의 방주와 무지개 언약)',
    searchKeyword: '노아',
    defaultVideoId: 'n_2HzBuoMWM',
    description: '죄악이 가득한 세상 속에서 의인 노아를 통해 인류를 구원하시고 무지개 언약을 맺으신 하나님의 은혜를 봅니다.',
    duration: '약 7~9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_7': {
    characterName: '아브라함',
    title: '창세기 (아브라함의 부르심과 언약)',
    searchKeyword: '아브라함',
    defaultVideoId: 'nBjpcg610TI',
    description: '본토 친척 아비 집을 떠나 믿음의 조상이 된 아브라함과 하나님이 맺으신 횃불 언약을 조명합니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_8': {
    characterName: '사라',
    title: '창세기 (약속의 어머니 사라)',
    searchKeyword: '창세기',
    defaultVideoId: 'nBjpcg610TI',
    description: '불가능 속에서 웃음(이삭)을 선물로 받으며 열국의 어머니가 된 사라의 믿음의 여정을 다룹니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_10': {
    characterName: '이삭',
    title: '창세기 (모리아 산의 순종과 이삭)',
    searchKeyword: '창세기',
    defaultVideoId: 'nBjpcg610TI',
    description: '모리아 산에서 묵묵히 순종하여 번제단에 오른 이삭과 여호와 이레의 예비하심을 배웁니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_12': {
    characterName: '야곱',
    title: '창세기 (벧엘에서 브니엘까지, 야곱)',
    searchKeyword: '야곱',
    defaultVideoId: 'n_2HzBuoMWM',
    description: '속이는 자에서 하나님과 겨루어 이긴 이스라엘로 변화되는 야곱의 인생 역전을 그립니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_14': {
    characterName: '요셉',
    title: '창세기 (꿈의 사람 요셉과 하나님의 섭리)',
    searchKeyword: '요셉',
    defaultVideoId: '9btp7VMvjR4',
    description: '노예와 죄수에서 애굽의 총리가 되어 민족을 구원한 요셉의 용서와 하나님의 놀라운 섭리입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_16': {
    characterName: '모세',
    title: '출애굽기 개요 (부르심과 홍해의 기적, 율법)',
    searchKeyword: '출애굽기',
    defaultVideoId: 'nBjpcg610TI',
    description: '불타는 떨기나무에서 부르심을 받아 출애굽의 영도자가 된 모세의 삶과 하나님의 놀라운 구원을 보여줍니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_21': {
    characterName: '여호수아',
    title: '여호수아 개요 (강하고 담대하라)',
    searchKeyword: '여호수아',
    defaultVideoId: '9btp7VMvjR4',
    description: '모세의 뒤를 이어 가나안 땅을 정복하고 하나님 나라의 유업을 나눈 여호수아의 순종입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_26': {
    characterName: '룻',
    title: '룻기 개요 (신실한 사랑 헤세드)',
    searchKeyword: '룻기',
    defaultVideoId: 'xT4wB3W0hU4',
    description: '이방 여인 룻이 시어머니 나오미를 따라 약속의 땅으로 와서 기업 무를 자 보아스를 만나 다윗의 조상이 된 감동의 역사입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_33': {
    characterName: '다윗 왕',
    title: '사무엘서 개요 (하나님 마음에 합한 왕 다윗)',
    searchKeyword: '다윗',
    defaultVideoId: '9btp7VMvjR4',
    description: '목동에서 왕이 되어 통일 이스라엘을 이루고 영원한 다윗 언약을 받은 메시아 왕권의 예표입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_36': {
    characterName: '솔로몬 왕',
    title: '열왕기 개요 (성전 건축과 솔로몬의 지혜)',
    searchKeyword: '솔로몬',
    defaultVideoId: '9btp7VMvjR4',
    description: '하나님께 듣는 마음(지혜)을 구하여 성전을 짓고 번영을 누렸으나 우상숭배로 분열의 빌미를 준 솔로몬의 일대기입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_42': {
    characterName: '욥',
    title: '욥기 개요 (고난의 신비와 하나님의 지혜)',
    searchKeyword: '욥기',
    defaultVideoId: 'n_2HzBuoMWM',
    description: '이해할 수 없는 극심한 고난 속에서도 믿음의 줄을 놓지 않고 마침내 귀로만 듣던 하나님을 눈으로 뵈옵게 된 욥의 신앙입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_43': {
    characterName: '이사야 선지자',
    title: '이사야 개요 (고난받는 종과 새 하늘 새 땅)',
    searchKeyword: '이사야',
    defaultVideoId: '9btp7VMvjR4',
    description: '보좌에 앉으신 거룩하신 하나님을 뵙고 고난받는 종 메시아의 십자가 대속과 영원한 새 예루살렘을 예언한 선지자입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_46': {
    characterName: '다니엘',
    title: '다니엘 개요 (풀무불과 사자굴, 영원한 하나님 나라)',
    searchKeyword: '다니엘',
    defaultVideoId: '9btp7VMvjR4',
    description: '이방 바벨론 제국 한복판에서 뜻을 정하여 타협하지 않고 역사의 주관자이신 하나님의 영원한 나라를 바라본 선지자입니다.',
    duration: '약 9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_53': {
    characterName: '요나 선지자',
    title: '요나 개요 (물고기 배 속과 하나님의 자비)',
    searchKeyword: '요나',
    defaultVideoId: 'n_2HzBuoMWM',
    description: '원수의 도시 니느웨까지도 불쌍히 여기시는 하나님의 무한한 사랑과 은혜를 반어법으로 폭로하는 요나서입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },

  // === 신약 주요 인물 ===
  'hero_char_56': {
    characterName: '세례 요한',
    title: '마태복음 (주의 길을 예비한 광야의 소리 세례 요한)',
    searchKeyword: '마태복음',
    defaultVideoId: '9btp7VMvjR4',
    description: '예수 그리스도의 오심을 선포하며 회개의 세례를 베풀고 어린 양을 증거한 마지막 구약 선지자 세례 요한입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_57': {
    characterName: '마리아',
    title: '누가복음 (예수님의 탄생과 주의 여종 마리아)',
    searchKeyword: '누가복음',
    defaultVideoId: '9btp7VMvjR4',
    description: '동정녀의 몸으로 성령으로 잉태될 것을 믿음으로 순종하여 인류 구원의 통로가 된 마리아의 순종입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_59': {
    characterName: '예수 그리스도',
    title: '복음서 (만왕의 왕 예수 그리스도와 하나님 나라)',
    searchKeyword: '예수',
    defaultVideoId: '9btp7VMvjR4',
    description: '만왕의 왕이자 참 구원자이신 예수 그리스도의 성육신, 십자가 대속, 부활과 승천의 복음입니다.',
    duration: '약 9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_60': {
    characterName: '사도 베드로',
    title: '사도행전 (오순절 성령과 베드로 사도)',
    searchKeyword: '사도행전',
    defaultVideoId: 'xT4wB3W0hU4',
    description: '실패와 배신을 딛고 다시 부활 예수님을 만나 오순절 성령으로 초대교회를 세운 수제자 베드로의 변화입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_61': {
    characterName: '사도 요한',
    title: '요한복음 (사랑의 사도 요한과 말씀의 은혜)',
    searchKeyword: '요한복음',
    defaultVideoId: 'xT4wB3W0hU4',
    description: '예수님의 품에 기대어 사랑을 증거하고 말씀이 육신이 되심을 밝힌 사도 요한입니다.',
    duration: '약 9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_73': {
    characterName: '스데반 집사',
    title: '사도행전 (첫 순교자 스데반과 하늘 영광)',
    searchKeyword: '사도행전',
    defaultVideoId: 'xT4wB3W0hU4',
    description: '은혜와 권능이 충만하여 담대히 복음을 전하고 돌에 맞으면서도 원수를 위해 기도한 첫 순교자 스데반입니다.',
    duration: '약 8분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  },
  'hero_char_77': {
    characterName: '사도 바울',
    title: '사도행전 & 서신서 (이방인의 사도 바울)',
    searchKeyword: '바울',
    defaultVideoId: 'n_2HzBuoMWM',
    description: '다메섹 도상에서 부활의 주님을 만난 후 로마 제국 전역에 복음을 전하고 신약 서신 13권을 기록한 위대한 사도 바울입니다.',
    duration: '약 9분',
    channel: '바이블프로젝트 (BibleProject - Korean)'
  }
};

// 헬퍼 함수
export function getBibleProjectVideo(quiz) {
  if (!quiz) return null;

  // 1. 직접 매핑
  if (BIBLE_PROJECT_VIDEOS[quiz.id]) {
    const item = BIBLE_PROJECT_VIDEOS[quiz.id];
    return {
      ...item,
      channelUrl: BP_CHANNEL_URL,
      officialHome: BP_OFFICIAL_HOME,
      searchUrl: `${BP_CHANNEL_URL}/search?query=${encodeURIComponent(item.searchKeyword || item.characterName)}`
    };
  }

  // 2. 인물 이름 매칭
  if (quiz.category === '👑 성경 인물 열전') {
    const rawName = quiz.roundTitle.replace(/^\[.*?\]\s*/, '').trim();
    const found = Object.values(BIBLE_PROJECT_VIDEOS).find(v => 
      rawName.includes(v.characterName) || v.characterName.includes(rawName)
    );
    if (found) {
      return {
        ...found,
        channelUrl: BP_CHANNEL_URL,
        officialHome: BP_OFFICIAL_HOME,
        searchUrl: `${BP_CHANNEL_URL}/search?query=${encodeURIComponent(found.searchKeyword || found.characterName)}`
      };
    }
    return {
      characterName: rawName,
      title: `${rawName} 말씀 탐구`,
      searchKeyword: rawName,
      defaultVideoId: '9btp7VMvjR4',
      description: `바이블프로젝트의 깊이 있는 애니메이션으로 ${rawName}의 신앙과 구속사적 의미를 묵상해보세요.`,
      duration: '약 7~9분',
      channel: '바이블프로젝트 (BibleProject - Korean)',
      channelUrl: BP_CHANNEL_URL,
      officialHome: BP_OFFICIAL_HOME,
      searchUrl: `${BP_CHANNEL_URL}/search?query=${encodeURIComponent(rawName)}`
    };
  }

  // 3. 책 이름 매칭
  const bookName = quiz.bookName || '성경';
  return {
    characterName: '',
    title: `${bookName} 말씀 개요`,
    searchKeyword: bookName,
    defaultVideoId: 'nBjpcg610TI',
    description: `${bookName}의 전체 구조와 핵심 구속사 메시지를 바이블프로젝트 애니메이션으로 함께 묵상합니다.`,
    duration: '약 7~9분',
    channel: '바이블프로젝트 (BibleProject - Korean)',
    channelUrl: BP_CHANNEL_URL,
    officialHome: BP_OFFICIAL_HOME,
    searchUrl: `${BP_CHANNEL_URL}/search?query=${encodeURIComponent(bookName)}`
  };
}
