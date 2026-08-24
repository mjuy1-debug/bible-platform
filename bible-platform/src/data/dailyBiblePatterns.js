// src/data/dailyBiblePatterns.js
// '하루 1패턴' 영어 성경 묵상 데이터베이스 & 지능형 구문 분석 엔진

export const DAILY_BIBLE_PATTERNS = [
  {
    id: 'pat_hos_0606',
    ref: '호세아 6:6',
    korVerse: '나는 인애를 원하고 제사를 원치 아니하며 번제보다 하나님을 아는 것을 원하노라',
    engVerse: 'For I desire mercy, not sacrifice, and acknowledgment of God rather than burnt offerings.',
    pattern: '[주어] + desire [A], not [B], and [C] rather than [D]',
    meaning: 'B보다 A를 원하고, D라기보다는 차라리 C를 원한다 (대조와 본질 강조)',
    explanation: '"rather than"은 두 대상 중 덜 중요한 것을 뒤로하고 본질적인 것을 선택할 때 쓰이는 핵심 비교 표현입니다. 겉치레 의식(제사, 번제)보다 내면의 진실한 긍휼과 하나님을 깊이 아는 친밀함을 하나님이 기뻐하심을 역설합니다.',
    exampleSentence: 'God desires sincere humility rather than outward religious displays.',
    exampleMeaning: '하나님은 외적인 종교적 과시보다 진실한 겸손을 원하신다.'
  },
  {
    id: 'pat_psa_02301',
    ref: '시편 23:1',
    korVerse: '여호와는 나의 목자시니 내가 부족함이 없으리로다',
    engVerse: 'The Lord is my shepherd, I lack nothing.',
    pattern: '[주어] is my [역할], I lack [아무것도 부족함 없음]',
    meaning: '주님은 나의 ~이시니, 내게 부족함이 전혀 없다 (완전한 신뢰와 자족)',
    explanation: '"lack nothing"은 단순히 가진 것이 많다는 뜻이 아니라, 목자 되신 하나님 한 분만으로 영적·삶의 모든 필요가 채워져 완전한 자족과 평안을 누린다는 절대 신뢰의 선포 구문입니다.',
    exampleSentence: 'When Christ is our guide, we lack no good thing in life.',
    exampleMeaning: '그리스도께서 우리의 인도자이실 때, 우리는 삶에서 어떤 좋은 것도 부족함이 없다.'
  },
  {
    id: 'pat_psa_119105',
    ref: '시편 119:105',
    korVerse: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
    engVerse: 'Your word is a lamp for my feet, a light on my path.',
    pattern: '[A] is a lamp for [B], a light on [C]',
    meaning: 'A는 B를 비추는 등불이요, C를 밝히는 빛이다 (은유적 인도 패턴)',
    explanation: '어두운 밤길에 발 바로 앞을 비추는 등불처럼, 하나님의 말씀이 매 순간 신자의 걸음과 인생 행로를 실족하지 않게 인도함을 비유적으로 찬양하는 대표 패턴입니다.',
    exampleSentence: 'God’s wisdom is a true compass for my decisions and a light on my future.',
    exampleMeaning: '하나님의 지혜는 내 결정의 참된 나침반이며 내 미래를 비추는 빛이다.'
  },
  {
    id: 'pat_psa_12101',
    ref: '시편 121:1-2',
    korVerse: '내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올꼬 나의 도움이 천지를 지으신 여호와에게서로다',
    engVerse: 'I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth.',
    pattern: 'Where does [A] come from? My [A] comes from [공급원]',
    meaning: '나의 ~가 어디서 오는가? 나의 ~는 바로 ...에게서 온다 (문답식 신앙 고백)',
    explanation: '질문과 답변 형식을 통해 인간적인 해결책을 넘어 천지를 지으신 창조주 하나님만이 유일하고 절대적인 도움의 원천임을 확고히 선언하는 시적 수사 패턴입니다.',
    exampleSentence: 'Where does our true peace come from? Our peace comes from the Prince of Peace.',
    exampleMeaning: '우리의 참된 평안은 어디서 오는가? 우리의 평안은 평강의 왕에게서 온다.'
  },
  {
    id: 'pat_psa_03704',
    ref: '시편 37:4',
    korVerse: '또 여호와를 기뻐하라 저가 네 마음의 소원을 이루어 주시리로다',
    engVerse: 'Take delight in the Lord, and he will give you the desires of your heart.',
    pattern: 'Take delight in [대상], and [주어] will give you [선물] (명령문 + and)',
    meaning: '~ 안에서 기뻐하라, 그리하면 그분이 ~를 너에게 주실 것이다',
    explanation: '"Take delight in"은 감정의 문제를 넘어 하나님과의 교제 자체를 최고의 기쁨으로 삼는 능동적 결단을 뜻합니다. 명령문 뒤의 "and"는 "~하라, 그러면 축복이 임하리라"는 언약적 인과관계를 나타냅니다.',
    exampleSentence: 'Take delight in God’s holy presence, and He will fill your soul with joy.',
    exampleMeaning: '하나님의 거룩한 임재 안에서 기뻐하라, 그리하면 그분이 네 영혼을 기쁨으로 채우실 것이다.'
  },
  {
    id: 'pat_psa_04205',
    ref: '시편 42:5',
    korVerse: '내 영혼아 네가 어찌하여 낙망하며 어찌하여 내 속에서 불안하여 하는고 너는 하나님을 바라라',
    engVerse: 'Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.',
    pattern: 'Why are you [부정적 감정]? Put your hope in [대상], for [확신의 찬양]',
    meaning: '어찌하여 낙심하는가? 하나님께 소망을 두어라, 왜냐하면 내가 여전히 그분을 찬양할 것이기 때문이다',
    explanation: '자신의 흔들리는 마음에 직접 영적인 질문을 던지며 하나님께 소망을 두도록 결단하는 자기 권면(Self-Exhortation) 패턴입니다. "Put your hope in"은 적극적인 신뢰의 위탁을 뜻합니다.',
    exampleSentence: 'Why be afraid of tomorrow? Put your hope in Jesus, for He holds all eternity.',
    exampleMeaning: '어찌하여 내일을 두려워하는가? 예수님께 소망을 두라, 그분이 모든 영원을 붙들고 계시기 때문이다.'
  },
  {
    id: 'pat_psa_02701',
    ref: '시편 27:1',
    korVerse: '여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요',
    engVerse: 'The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?',
    pattern: '[주어] is my [방패/구원] — whom shall I [두려워하다]?',
    meaning: '주님이 나의 ~이시니, 내가 누구를 두려워하겠는가? (반어적 담대함)',
    explanation: '하나님이 빛과 구원, 생명의 요새이심을 고백한 후 "내가 누구를 무서워하리요?"라는 반어 의문문(Rhetorical Question)을 통해 어떤 대적이나 위협 앞에서도 두려움이 없음을 강력하게 선언합니다.',
    exampleSentence: 'Christ is our eternal protector — of what circumstance shall we be afraid?',
    exampleMeaning: '그리스도께서 우리의 영원한 보호자이시니, 우리가 어떤 상황을 무서워하겠는가?'
  },
  {
    id: 'pat_psa_06303',
    ref: '시편 63:3',
    korVerse: '주의 인자가 생명보다 나으므로 내 입술이 주를 찬양할 것이라',
    engVerse: 'Because your love is better than life, my lips will glorify you.',
    pattern: 'Because [A] is better than [B], [주어] will [행동]',
    meaning: 'A가 B보다 더 낫기 때문에, 나는 ~할 것이다 (가치 비교와 찬양 결단)',
    explanation: '"better than"은 비교급 구문으로, 세상에서 가장 귀한 육신의 목숨(life)보다 하나님의 변함없는 언약적 사랑(Covenant Love)이 훨씬 더 값지고 영원함을 고백하는 최상급 가치관을 보여줍니다.',
    exampleSentence: 'Because God’s grace is sweeter than worldly success, my heart rejoices in Him.',
    exampleMeaning: '하나님의 은혜가 세상의 성공보다 달콤하기에, 내 마음은 주님 안에서 기뻐한다.'
  },
  {
    id: 'pat_pro_00305',
    ref: '잠언 3:5-6',
    korVerse: '너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라',
    engVerse: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    pattern: 'Trust in [대상] and lean not on [자기 확신]; submit to [대상], and [결과]',
    meaning: '온 마음으로 ~를 신뢰하고 네 자신의 명철에 기대지 말라. 모든 길에서 그분을 인정하라, 그리하면 네 길을 곧게 펴시리라',
    explanation: '"lean not on"은 스스로의 지혜나 계산에 기대지 말라는 엄중한 경고이며, "make your paths straight"는 장애물을 치우고 하나님이 기뻐하시는 형통과 의의 길로 인도하신다는 축복의 관용구입니다.',
    exampleSentence: 'Trust in the Father in all decisions, and He will guide your future securely.',
    exampleMeaning: '모든 결정 속에서 아버지를 신뢰하라, 그리하면 그분이 네 미래를 안전하게 인도하실 것이다.'
  },
  {
    id: 'pat_jhn_00316',
    ref: '요한복음 3:16',
    korVerse: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라',
    engVerse: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    pattern: 'God so [동사] that [결과절], that whoever [조건] shall not [A] but [B]',
    meaning: '너무나도 ~하여 그 결과 ...하셨으니, 누구든지 ~하는 자는 A하지 않고 B를 얻으리라',
    explanation: '영어 구문의 정수인 "so... that (너무 ~해서 ...하다)" 강조 원인-결과절과 "not A but B (A가 아니라 B)" 대조 구조가 결합되어 복음의 절대적인 사랑과 구원의 약속을 선포합니다.',
    exampleSentence: 'Jesus so loved us that He gave His life, that whoever follows Him shall walk in light.',
    exampleMeaning: '예수님이 우리를 너무나 사랑하사 목숨을 주셨으니, 누구든지 그분을 따르는 자는 빛 가운데 걸을 것이다.'
  },
  {
    id: 'pat_jhn_01427',
    ref: '요한복음 14:27',
    korVerse: '평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것 같지 아니하니라 너희는 마음에 근심도 말고 두려워하지도 말라',
    engVerse: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    pattern: 'I do not [동사] as [비교 대상] does. Do not let your heart be [형용사]',
    meaning: '세상이 주는 방식과 같이 주지 아니하노라. 너희 마음이 근심하지 않게 하라',
    explanation: '"as the world gives"는 세상의 일시적이고 조건적인 평안과 그리스도께서 주시는 영원하고 무조건적인 평강의 질적 차이를 대조하며, "Do not let your hearts be troubled"는 마음에 평안을 지키라는 명령적 권면입니다.',
    exampleSentence: 'Christ loves us not as the world loves, but with an unfailing and eternal bond.',
    exampleMeaning: '그리스도께서는 세상이 사랑하는 방식이 아니라, 결코 끊어지지 않는 영원한 끈으로 우리를 사랑하신다.'
  },
  {
    id: 'pat_php_00413',
    ref: '빌립보서 4:13',
    korVerse: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
    engVerse: 'I can do all this through him who gives me strength.',
    pattern: 'I can do [모든 일] through [대상] who gives me [필요한 은혜]',
    meaning: '나에게 ~를 주시는 그분을 통하여 나는 이 모든 것을 감당할 수 있다',
    explanation: '"through him who..."는 신자의 능력이 스스로에게서 나오는 것이 아니라 은혜와 능력을 끊임없이 부어주시는 그리스도를 통로로 삼을 때 어떤 환경에서도 자족하고 이겨낼 수 있음을 고백하는 관계사 수식 패턴입니다.',
    exampleSentence: 'We can overcome every trial through the Savior who loves us unconditionally.',
    exampleMeaning: '우리를 무조건적으로 사랑하시는 구주를 통하여 우리는 모든 시련을 이겨낼 수 있다.'
  },
  {
    id: 'pat_php_00406',
    ref: '빌립보서 4:6-7',
    korVerse: '아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라',
    engVerse: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    pattern: 'Do not be anxious about [A], but in every situation, by [기도] with thanksgiving, present [요구] to God',
    meaning: '어떤 것도 염려하지 말고, 모든 상황에서 감사함과 기도로 너희의 간구를 하나님께 올려드리라',
    explanation: '"Do not... but..."의 완벽한 대조 구조입니다. 염려(Anxiety)를 기도로 전환하되 불평이 아닌 이미 받은 은혜에 대한 "감사(with thanksgiving)"를 동반하여 하나님께 아뢰는 영적 승리의 공식입니다.',
    exampleSentence: 'Do not worry about the unknown future, but in deep prayer, place your burdens before the Lord.',
    exampleMeaning: '알지 못하는 미래에 대해 걱정하지 말고, 깊은 기도 가운데 네 모든 짐을 주님 앞에 내려놓으라.'
  },
  {
    id: 'pat_rom_00828',
    ref: '로마서 8:28',
    korVerse: '우리가 알거니와 하나님을 사랑하는 자들에게는 모든 것이 합력하여 선을 이루느니라',
    engVerse: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    pattern: 'We know that in all things God works for the good of those who [조건절]',
    meaning: '우리는 모든 일 속에서 하나님이 ~하는 자들의 유익(선)을 위하여 역사하심을 확신한다',
    explanation: '"work for the good of..."는 현재 겪는 고난과 시련까지도 합력하여 궁극적인 영적 승리와 구원의 선을 이루어내시는 하나님의 절대 주권과 섭리를 굳게 믿는 지식과 확신의 고백입니다.',
    exampleSentence: 'We know that through every storm, God is preparing a greater blessing for His faithful children.',
    exampleMeaning: '우리는 모든 폭풍을 통하여, 하나님께서 신실한 자녀들을 위해 더 큰 축복을 준비하고 계심을 알고 있다.'
  },
  {
    id: 'pat_isa_04110',
    ref: '이사야 41:10',
    korVerse: '두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라',
    engVerse: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    pattern: 'Do not fear, for I am with you; I will [도우심1] and [도우심2]; I will uphold you with [수단]',
    meaning: '두려워하지 마라, 내가 너와 함께함이라. 내가 너를 강하게 하고 도울 것이며 나의 오른손으로 너를 붙들리라',
    explanation: '이유를 나타내는 "for"절과 하나님의 신실한 약속을 나타내는 3중 "I will" 선포가 결합되어, 신자가 어떤 절망 속에서도 결코 혼자가 아니며 하나님의 전능하신 손에 붙들려 있음을 보증합니다.',
    exampleSentence: 'Do not lose heart in the dark, for the Lord will strengthen your spirit and guide your steps.',
    exampleMeaning: '어둠 속에서 낙심하지 말라, 주께서 네 영혼을 강건케 하시고 네 걸음을 인도하실 것이기 때문이다.'
  },
  {
    id: 'pat_mic_00608',
    ref: '미가 6:8',
    korVerse: '사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것이 오직 공의를 행하며 인자를 사랑하며 겸손히 네 하나님과 함께 행하는 것이 아니냐',
    engVerse: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.',
    pattern: 'What does [주어] require of you? To [행동1], to [행동2], and to [행동3]',
    meaning: '주님께서 너에게 요구하시는 것이 무엇인가? 바로 공의를 행하고, 긍휼을 사랑하며, 겸손히 동행하는 것이다',
    explanation: '수사의문문 뒤에 3개의 to 부정사 병렬구조(To act... to love... to walk...)를 사용하여, 하나님과의 올바른 관계에서 흘러나오는 신앙의 3대 핵심 실천 덕목을 선명하게 제시합니다.',
    exampleSentence: 'What does true love require of us? To forgive patiently and to serve others with a pure heart.',
    exampleMeaning: '참된 사랑이 우리에게 요구하는 것은 무엇인가? 오래 참고 용서하며 순전한 마음으로 이웃을 섬기는 것이다.'
  },
  {
    id: 'pat_gal_00220',
    ref: '갈라디아서 2:20',
    korVerse: '내가 그리스도와 함께 십자가에 못 박혔나니 그런즉 이제는 내가 산 것이 아니요 오직 내 안에 그리스도께서 사신 것이라',
    engVerse: 'I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.',
    pattern: 'I no longer [동사1], but [주어] lives in me. The life I now live, I live by faith in [대상]',
    meaning: '이제는 내가 사는 것이 아니요 오직 내 안에 ~께서 사시는 것이라. 내가 이제 사는 삶은 ~를 믿는 믿음 안에서 사는 것이라',
    explanation: '"no longer A, but B (더 이상 A가 아니라 B이다)" 대조 구문과 "live by faith in (~을 믿는 믿음으로 살아가다)" 표현을 통해 옛 자아의 죽음과 부활하신 그리스도와 연합된 새로운 생명의 정체성을 선포합니다.',
    exampleSentence: 'We no longer walk in darkness, but Christ shines through our lives every day.',
    exampleMeaning: '우리는 더 이상 어둠 속을 걷지 아니하며, 오직 그리스도께서 매일 우리의 삶을 통해 빛을 비추신다.'
  },
  {
    id: 'pat_mat_01128',
    ref: '마태복음 11:28',
    korVerse: '수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라',
    engVerse: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    pattern: 'Come to [초대자], all you who are [형용사/분사], and I will give you [선물]',
    meaning: '~하여 지치고 짐 진 자들아 모두 내게로 오라, 그리하면 내가 너희에게 참된 쉼을 주리라',
    explanation: '"Come to me... and I will..."은 예수님의 가장 따뜻한 초대의 패턴입니다. 관계대명사절 "all you who are..."가 지치고 곤고한 모든 영혼을 부르시는 주님의 무조건적인 자비를 나타냅니다.',
    exampleSentence: 'Come to the Savior, all you who thirst for righteousness, and He will satisfy your heart.',
    exampleMeaning: '의에 주리고 목마른 자들아 모두 구주께 나아오라, 그리하면 그분이 네 마음을 만족케 하시리라.'
  },
  {
    id: 'pat_1co_01304',
    ref: '고린도전서 13:4',
    korVerse: '사랑은 오래 참고 사랑은 온유하며 투기하는 자가 되지 아니하며',
    engVerse: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
    pattern: 'Love is [긍정적 성품], it does not [부정적 행위]',
    meaning: '사랑은 ~하고 ~하다. 사랑은 결코 ~하지 아니한다 (사랑의 본질 정의)',
    explanation: '단순한 be동사 서술어와 부정 조동사(does not, is not)의 리드미컬한 반복을 통해 아가페 사랑의 본질을 가장 명확하고 웅장하게 규정하는 성경 최고의 문학적 패턴입니다.',
    exampleSentence: 'True kindness is selfless; it does not seek personal recognition or reward.',
    exampleMeaning: '참된 친절은 이타적이며, 개인적인 인정이나 보상을 구하지 않는다.'
  },
  {
    id: 'pat_gen_00101',
    ref: '창세기 1:1',
    korVerse: '태초에 하나님이 천지를 창조하시니라',
    engVerse: 'In the beginning God created the heavens and the earth.',
    pattern: 'In the beginning [주어] created [목적어]',
    meaning: '태초에 ~께서 온 세상을 창조하셨느니라 (기원과 창조의 대선언)',
    explanation: '"In the beginning"은 성경 전체의 문을 여는 시공간의 기원 구문이며, 하나님(God)이 모든 존재하는 것들의 유일한 시작이자 절대 창조주이심을 선포하는 장엄한 패턴입니다.',
    exampleSentence: 'In the beginning of every single day, dedicate your thoughts to God.',
    exampleMeaning: '매일의 시작마다 네 모든 생각을 하나님께 구별하여 올려드리라.'
  },
  {
    id: 'pat_ecc_01213',
    ref: '전도서 12:13',
    korVerse: '일의 결국을 다 들었으니 하나님을 경외하고 그의 명령들을 지킬지어다 이것이 모든 사람의 본분이니라',
    engVerse: 'Fear God and keep his commandments, for this is the duty of all mankind.',
    pattern: 'Fear [A] and keep [B], for this is [C] (인생 본분 선포)',
    meaning: 'A를 경외하고 B를 지키라, 왜냐하면 이것이 C이기 때문이다',
    explanation: '전도서 전체의 최종 결론으로, 명령문 뒤에 "for(왜냐하면)" 이유 부사절이 결합되어 하나님을 경외하고 순종하는 삶이야말로 인간 존재의 가장 본질적인 사명이자 마땅한 도리임을 선포하는 장엄한 패턴입니다.',
    exampleSentence: 'Love the Lord and walk in His truth, for this is the true joy of believers.',
    exampleMeaning: '주님을 사랑하고 그분의 진리 안에서 걸으라, 왜냐하면 이것이 성도의 참된 기쁨이기 때문이다.'
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

/**
 * 특정 구절 ref에 맞는 패턴을 찾아 반환.
 * 없으면 NIV 영어 문장에서 지능적으로 고급 문법 패턴과 예문을 자동 추출.
 * @param {string} ref - 예: '시편 23:1', '전도서 12:13 (묵상)'
 * @param {string} engText - 해당 구절의 NIV 영어 텍스트
 */
export function getPatternForVerse(ref, engText = '') {
  const cleanRef = (ref || '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();

  // 1) 정확히 매칭되는 패턴 검색 (ref 앞부분 일치)
  const found = DAILY_BIBLE_PATTERNS.find(p => cleanRef && (cleanRef.startsWith(p.ref) || p.ref.startsWith(cleanRef)));
  if (found) return found;

  // 2) 없으면 NIV 영어 문장에서 심층 자동 패턴 분석 추출
  return derivePatternFromVerse(cleanRef, engText);
}

/**
 * NIV 영어 구절 텍스트에서 핵심 문법 패턴과 실전 응용 예문을 지능적으로 추출
 */
function derivePatternFromVerse(ref, engText) {
  const text = (engText || '').trim();

  // 1. rather than (비교 및 본질 선택 구문)
  if (/rather than/i.test(text)) {
    return {
      pattern: `[주어] + [동사] + [A] rather than [B] (차라리 ~보다)`,
      meaning: 'B라기보다는 차라리 A를 선택하다 (더 가치 있는 본질 강조)',
      explanation: '"rather than"은 덜 중요한 대상(B)을 배제하고 훨씬 더 본질적이고 귀한 가치(A)를 우선시할 때 쓰이는 대표 비교 구문입니다.',
      exampleSentence: 'Seek God’s lasting peace rather than temporary worldly comfort.',
      exampleMeaning: '일시적인 세상의 안락함보다는 하나님의 영원한 평안을 구하라.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 2. not A but B / not A, but B
  if (/not.+but/i.test(text)) {
    return {
      pattern: `not [A], but [B] (A가 아니라 B이다)`,
      meaning: 'A가 아니라 오직 B이다 (명확한 대조와 전환)',
      explanation: '인간의 한계나 겉치레(A)를 부정하고, 하나님께서 원하시는 진실한 뜻이나 은혜(B)를 강조하는 가장 강력한 대조 패턴입니다.',
      exampleSentence: 'True strength is not found in our own pride, but in Christ’s humble grace.',
      exampleMeaning: '참된 힘은 우리 자신의 교만에 있지 않고, 그리스도의 겸손한 은혜 안에 있다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 3. better than (비교급 우위 표현)
  if (/better than/i.test(text)) {
    return {
      pattern: `[A] is better than [B] (A가 B보다 훨씬 낫다)`,
      meaning: 'A가 B보다 영적으로 훨씬 더 귀하고 가치 있다',
      explanation: '"better than" 비교급을 통해 세상의 헛된 재물이나 쾌락보다 하나님의 인자와 지혜가 비교할 수 없이 소중함을 노래하는 패턴입니다.',
      exampleSentence: 'One moment in God’s presence is better than a thousand days elsewhere.',
      exampleMeaning: '하나님의 임재 안에서의 한순간이 다른 곳에서의 천 날보다 훨씬 더 낫다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 4. so that / in order that (목적을 나타내는 부사절)
  if (/so that|in order that/i.test(text)) {
    return {
      pattern: `[주절] + so that + [주어] + may/shall [목적절] (~하도록)`,
      meaning: '~로 하여금 ~하게 하려 하심이라 (하나님의 거룩한 목적)',
      explanation: '하나님께서 행하시는 모든 사역과 구원의 섭리가 어떤 목적을 향하고 있는지를 명확히 밝히는 목적절 패턴입니다.',
      exampleSentence: 'Christ died for our sins so that we might live in righteousness.',
      exampleMeaning: '그리스도께서 우리의 죄를 위해 죽으심은 우리로 하여금 의 안에서 살게 하려 하심이다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 5. whoever / everyone who (보편적 구원 및 축복 조건절)
  if (/whoever|everyone who|those who/i.test(text)) {
    return {
      pattern: `Whoever [동사조건] shall [약속/결과] (~하는 자마다 누구나)`,
      meaning: '누구든지 ~하는 사람은 ~을 얻으리라 (차별 없는 은혜의 약속)',
      explanation: '신분, 인종, 과거에 상관없이 오직 믿음으로 주님께 나아오는 모든 자에게 열려 있는 구원과 축복의 보편적 약속 패턴입니다.',
      exampleSentence: 'Whoever calls on the name of the Lord will never be put to shame.',
      exampleMeaning: '누구든지 주의 이름을 부르는 자는 결코 수치를 당하지 아니하리라.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 6. unless (조건과 절대적 필요성)
  if (/who|unless/i.test(text) && /unless/i.test(text)) {
    return {
      pattern: `Unless [주어] [동사], [결과절] (~하지 아니하면 ~할 수 없다)`,
      meaning: '만일 ~하지 아니하면, 결코 ~할 수 없다 (필수 조건 강조)',
      explanation: '하나님의 은혜와 역사 없이는 인간의 모든 수고가 헛됨을 일깨우는 절대적 의존의 패턴입니다.',
      exampleSentence: 'Unless the Lord guides our path, our footsteps will wander in vain.',
      exampleMeaning: '주께서 우리의 길을 인도하지 아니하시면, 우리의 발걸음은 헛되이 방황할 뿐이다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 7. Do not ~ for / because (부정 명령 + 확신의 이유)
  if (/^Do not /i.test(text)) {
    return {
      pattern: `Do not [동사원형], for/because [주어] [이유절] (~하지 말라, 왜냐하면)`,
      meaning: '~하지 마라, 왜냐하면 주께서 ~하시기 때문이다 (위로와 담대함)',
      explanation: '두려움이나 염려를 금지하는 명령 뒤에 하나님이 함께하시고 보호하신다는 확실한 근거를 제시하여 마음을 평안케 하는 성경의 대표 위로 패턴입니다.',
      exampleSentence: 'Do not be anxious about tomorrow, for God already holds your future in His hands.',
      exampleMeaning: '내일에 대해 염려하지 말라, 하나님께서 이미 네 미래를 그분의 손에 쥐고 계시기 때문이다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 8. The Lord is ~ (하나님의 성품과 주권 선포)
  if (/^The Lord is/i.test(text)) {
    return {
      pattern: `The Lord is + [명사/형용사] (주님의 성품 및 구원 선언)`,
      meaning: '여호와는 나의 ~이시다 (절대적인 신앙 고백)',
      explanation: '하나님이 어떤 분이시며 신자의 삶에서 어떤 반석과 방패가 되어 주시는지를 직설적으로 당당하게 고백하는 찬양의 핵심 문형입니다.',
      exampleSentence: 'The Lord is our faithful helper and an eternal fortress in times of trouble.',
      exampleMeaning: '여호와는 환난 날에 우리의 신실한 도우심이시요 영원한 요새이시다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 9. 명령문 (Rejoice, Seek, Trust, Cast, Pray, Enter...)
  if (/^(Rejoice|Pray|Give|Seek|Ask|Come|Trust|Cast|Call|Enter|Commit|Hear|Love|Believe|Keep|Stand|Be )/i.test(text)) {
    const firstWord = text.split(' ')[0];
    return {
      pattern: `${firstWord} + [목적어/부사구] (신앙의 행동 촉구 명령문)`,
      meaning: `${firstWord}하라! — 하나님을 향해 나아가는 믿음의 결단과 실천`,
      explanation: '동사원형으로 시작하여 머뭇거림 없이 즉각 믿음의 순종을 결단하고 하나님을 향해 나아가도록 권면하는 강력한 성경적 명령 패턴입니다.',
      exampleSentence: `${firstWord} with all your heart upon the living God who never forsakes you.`,
      exampleMeaning: '너를 결코 버리지 않으시는 살아계신 하나님을 향해 온 마음으로 나아가라.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 10. will (하나님의 신실한 미래 언약/선포)
  if (/will/i.test(text)) {
    return {
      pattern: `[주어] + will + [동사원형] (변함없는 언약과 미래 축복)`,
      meaning: '~께서 반드시 ~하실 것이다 (확실한 성취의 약속)',
      explanation: '조동사 "will"은 단순한 미래 추측이 아니라, 하나님께서 택하신 백성을 반드시 지키시고 인도하시겠다는 강력하고 신실한 의지를 담고 있습니다.',
      exampleSentence: 'The faithful God will sustain you through every season of difficulty.',
      exampleMeaning: '신실하신 하나님께서 모든 어려움의 계절 속에서도 너를 굳건히 붙들어 주실 것이다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 11. I am / I can / I have (1인칭 확신 선포)
  if (/^I (am|can|have|lift|thank)/i.test(text)) {
    return {
      pattern: `I [동사/조동사] + [고백 내용] (1인칭 감사와 확신의 선포)`,
      meaning: '내가 ~하나이다 / 나는 ~할 수 있도다 (인격적 고백)',
      explanation: '신자가 하나님과 1:1로 마주하여 자신의 굳건한 신앙과 감사를 인격적으로 토로하는 살아있는 고백의 패턴입니다.',
      exampleSentence: 'I praise the Lord with joyful lips, for His mercy endures forever.',
      exampleMeaning: '주의 인자하심이 영원하시기에, 내가 기쁜 입술로 주를 찬양하나이다.',
      ref, engVerse: text, korVerse: ''
    };
  }

  // 기본 품격 있는 성경 문장 패턴
  return {
    pattern: `[주어] + [서술동사] + [목적어/전치사구] (은혜의 성경 문장)`,
    meaning: '하나님의 진리와 뜻을 단정하고 명확하게 전달하는 구문',
    explanation: '영어 성경의 정제된 기본 문형으로, 하나님의 성품과 역사하심을 명확한 질서 속에 전달하는 아름다운 표현입니다.',
    exampleSentence: 'God’s unfailing grace surrounds all those who place their trust in Him.',
    exampleMeaning: '하나님의 한결같은 은혜가 그분을 신뢰하는 모든 자를 따뜻하게 감싸 안으신다.',
    ref, engVerse: text, korVerse: ''
  };
}
