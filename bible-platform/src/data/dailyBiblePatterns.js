// src/data/dailyBiblePatterns.js
// '하루 1패턴' 영어 성경 묵상 데이터베이스

export const DAILY_BIBLE_PATTERNS = [
  {
    id: 'pat_01',
    ref: '이사야 41:10',
    korVerse: '두려워하지 말라 내가 너와 함께 함이라',
    engVerse: 'Do not fear, for I am with you; do not be dismayed, for I am your God.',
    pattern: 'Do not + [동사원형], for + [주어] + [동사]',
    meaning: '~하지 마라, 왜냐하면 ~이기 때문이다',
    explanation: '하나님의 언약과 동행을 확신할 때 가장 자주 쓰이는 위로와 명령의 핵심 패턴입니다. "for"는 여기서 이유를 나타내는 접속사(~때문에)로 쓰였습니다.',
    exampleSentence: 'Do not be afraid, for the Lord is on your side.',
    exampleMeaning: '두려워하지 마라, 왜냐하면 주께서 네 편이시기 때문이다.'
  },
  {
    id: 'pat_02',
    ref: '빌립보서 4:13',
    korVerse: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
    engVerse: 'I can do all this through him who gives me strength.',
    pattern: 'I can + [동사원형] + through + [대상] + who + [동사]',
    meaning: '나에게 ~해주시는 그분을 통하여 나는 ~할 수 있다',
    explanation: '나의 연약함을 넘어 그리스도 안에서의 승리와 확신을 선포하는 대표적인 관계대명사(who) 수식 구문입니다.',
    exampleSentence: 'I can overcome all hardships through Christ who loves me.',
    exampleMeaning: '나를 사랑하시는 그리스도를 통해 나는 모든 고난을 이겨낼 수 있다.'
  },
  {
    id: 'pat_03',
    ref: '마태복음 6:33',
    korVerse: '너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라',
    engVerse: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    pattern: 'Seek first + [목적어], and + [결과절] (명령문 + and)',
    meaning: '먼저 ~을 구하라, 그리하면 ~할 것이다',
    explanation: '신앙의 우선순위를 정할 때 사용되는 황금 패턴으로, 명령문 뒤에 "and"가 오면 "~하라, 그러면 ..."의 인과관계를 나타냅니다.',
    exampleSentence: 'Seek first God’s wisdom, and peace will fill your heart.',
    exampleMeaning: '먼저 하나님의 지혜를 구하라, 그리하면 평안이 네 마음에 가득할 것이다.'
  },
  {
    id: 'pat_04',
    ref: '요한복음 3:16',
    korVerse: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니',
    engVerse: 'For God so loved the world that he gave his one and only Son.',
    pattern: 'So + [형용사/부사/동사] + that + [결과절]',
    meaning: '너무나도 ~하여 그 결과 ~하다 (so... that 구문)',
    explanation: '하나님의 무한한 사랑의 깊이와 그로 말미암은 구원의 결실을 강조하는 대표적인 원인-결과 강조 구문입니다.',
    exampleSentence: 'God is so faithful that He never forgets His promises.',
    exampleMeaning: '하나님은 너무나 신실하셔서 그분의 약속을 결코 잊지 않으신다.'
  },
  {
    id: 'pat_05',
    ref: '로마서 8:28',
    korVerse: '우리가 알거니와 하나님을 사랑하는 자들에게는 모든 것이 합력하여 선을 이루느니라',
    engVerse: 'And we know that in all things God works for the good of those who love him.',
    pattern: 'We know that + [주어] + works for the good of + [대상]',
    meaning: '우리는 ~가 ~을 위하여 선하게 역사하심을 알고 있다',
    explanation: '어떤 역경 속에서도 하나님의 섭리를 굳게 신뢰하는 믿음의 고백 패턴입니다.',
    exampleSentence: 'We know that God works for the good of His children in every trial.',
    exampleMeaning: '우리는 모든 시련 속에서도 하나님께서 자녀들을 위해 선하게 일하심을 알고 있다.'
  },
  {
    id: 'pat_06',
    ref: '잠언 3:5',
    korVerse: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라',
    engVerse: 'Trust in the LORD with all your heart and lean not on your own understanding.',
    pattern: 'Trust in + [대상] + with all your [마음/힘] and lean not on + [피할 대상]',
    meaning: '온 마음을 다해 ~를 신뢰하고, 결코 ~에 기대지 말라',
    explanation: '내 생각과 지혜를 내려놓고 주님만을 전적으로 의지하는 결단의 표현입니다.',
    exampleSentence: 'Trust in the Lord with all your soul and do not lean on worldly wisdom.',
    exampleMeaning: '온 영혼으로 주님을 신뢰하고 세상의 지혜에 의지하지 말라.'
  },
  {
    id: 'pat_07',
    ref: '시편 119:105',
    korVerse: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
    engVerse: 'Your word is a lamp for my feet, a light on my path.',
    pattern: '[A] is a lamp for [B], a light on [C]',
    meaning: 'A는 B를 위한 등불이요, C를 비추는 빛이다',
    explanation: '인생의 어둠을 밝혀주는 하나님의 말씀을 은유적으로 찬양하는 아름다운 성경적 비유 패턴입니다.',
    exampleSentence: 'God’s truth is a guiding light for our family on every journey.',
    exampleMeaning: '하나님의 진리는 모든 여정 속에서 우리 가정을 인도하는 빛이다.'
  },
  {
    id: 'pat_08',
    ref: '에베소서 2:8',
    korVerse: '너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니',
    engVerse: 'For it is by grace you have been saved, through faith.',
    pattern: 'It is by + [수단A] + [주어+동사], through + [수단B]',
    meaning: '바로 ~에 의하여, ~를 통하여 우리가 ~함을 받았다',
    explanation: '구원이 인간의 공로가 아닌 오직 하나님의 은혜(Grace)와 믿음(Faith)임을 강조하는 구문입니다.',
    exampleSentence: 'It is by God’s mercy we live each day, through His unending love.',
    exampleMeaning: '그분의 끝없는 사랑을 통해, 바로 하나님의 자비로 우리가 매일을 살아간다.'
  },
  {
    id: 'pat_09',
    ref: '데살로니가전서 5:16-18',
    korVerse: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라',
    engVerse: 'Rejoice always, pray continually, give thanks in all circumstances.',
    pattern: '[동사원형] + always, [동사원형] + continually, [동사원형] in all circumstances',
    meaning: '항상 ~하라, 끊임없이 ~하라, 모든 상황 속에서 ~하라',
    explanation: '그리스도인 삶의 매일의 태도를 결정짓는 3대 명령 패턴입니다.',
    exampleSentence: 'Praise God always, seek Him continually, and love others in all situations.',
    exampleMeaning: '항상 하나님을 찬양하고, 끊임없이 그분을 구하며, 모든 상황에서 이웃을 사랑하라.'
  },
  {
    id: 'pat_10',
    ref: '베드로전서 5:7',
    korVerse: '너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라',
    engVerse: 'Cast all your anxiety on him because he cares for you.',
    pattern: 'Cast all your [걱정/짐] on + [대상] because + [이유]',
    meaning: '네 모든 ~를 ~에게 맡겨라, 왜냐하면 그분이 너를 돌보시기 때문이다',
    explanation: '마음의 무거운 짐과 불안을 하나님께 온전히 내어맡기는 치유와 평안의 구문입니다.',
    exampleSentence: 'Cast all your burdens on the Lord because He sustains you.',
    exampleMeaning: '네 모든 짐을 주께 맡겨라, 왜냐하면 그분이 너를 붙드시기 때문이다.'
  }
];

/**
 * 오늘 날짜(KST 자정 기준)에 맞는 오늘의 영어 성경 패턴 반환
 */
export function getTodayBiblePattern(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % DAILY_BIBLE_PATTERNS.length;
  return DAILY_BIBLE_PATTERNS[index];
}
