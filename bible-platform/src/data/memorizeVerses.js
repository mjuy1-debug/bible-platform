// src/data/memorizeVerses.js
// 성경 필수 암송 100구절 주제별 마스터팩 데이터베이스 (100% 100구절 완비)

export const MEMORIZE_CATEGORIES = [
  { id: 'all', name: '전체 (100구절)', icon: '🌟' },
  { id: 'essential', name: '🌟 필수 핵심 20구절', icon: '⭐' },
  { id: 'victory', name: '🛡️ 믿음과 승리 (18)', icon: '⚔️' },
  { id: 'comfort', name: '💖 위로와 평안 (18)', icon: '🕊️' },
  { id: 'prayer', name: '🙏 기도와 축복 (16)', icon: '✨' },
  { id: 'love', name: '🌿 사랑과 성화 (14)', icon: '❤️' },
  { id: 'word', name: '📖 말씀과 지혜 (14)', icon: '💡' }
];

export const MEMORIZE_VERSES = [
  // ── 1. 필수 핵심 (Essential: 20구절) ──
  {
    id: 'm_01',
    category: 'essential',
    ref: '요한복음 3:16',
    text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라',
    topic: '구원의 복음'
  ,    engText: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'
},
  {
    id: 'm_02',
    category: 'essential',
    ref: '빌립보서 4:13',
    text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
    topic: '그리스도의 능력'
  ,    engText: 'I can do all this through him who gives me strength.'
},
  {
    id: 'm_03',
    category: 'essential',
    ref: '시편 23:1',
    text: '[다윗의 시] 여호와는 나의 목자시니 내가 부족함이 없으리로다',
    topic: '목자 되신 하나님'
  ,    engText: 'The LORD is my shepherd, I lack nothing.'
},
  {
    id: 'm_04',
    category: 'essential',
    ref: '창세기 1:1',
    text: '태초에 하나님이 천지를 창조하시니라',
    topic: '창조 신앙'
  ,    engText: 'In the beginning God created the heavens and the earth.'
},
  {
    id: 'm_05',
    category: 'essential',
    ref: '사도행전 1:8',
    text: '오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라',
    topic: '선교 지상명령'
  ,    engText: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.'
},
  {
    id: 'm_06',
    category: 'essential',
    ref: '로마서 8:28',
    text: '우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라',
    topic: '하나님의 선하신 섭리'
  ,    engText: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.'
},
  {
    id: 'm_07',
    category: 'essential',
    ref: '이사야 41:10',
    text: '두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라 참으로 너를 도와주리라 참으로 나의 의로운 오른손으로 너를 붙들리라',
    topic: '임마누엘의 확신'
  ,    engText: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.'
},
  {
    id: 'm_08',
    category: 'essential',
    ref: '잠언 3:5-6',
    text: '너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라',
    topic: '인도하심의 확신'
  ,    engText: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.'
},
  {
    id: 'm_09',
    category: 'essential',
    ref: '마태복음 6:33',
    text: '너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라',
    topic: '삶의 우선순위'
  ,    engText: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.'
},
  {
    id: 'm_10',
    category: 'essential',
    ref: '갈라디아서 2:20',
    text: '내가 그리스도와 함께 십자가에 못 박혔나니 그런즉 이제는 내가 산 것이 아니요 오직 내 안에 그리스도께서 사신 것이라 이제 내가 육체 가운데 사는 것은 나를 사랑하사 나를 위하여 자기 몸을 버리신 하나님의 아들을 믿는 믿음 안에서 사는 것이라',
    topic: '그리스도와의 연합'
  ,    engText: 'I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.'
},
  {
    id: 'm_11',
    category: 'essential',
    ref: '요한복음 14:6',
    text: '예수께서 가라사대 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라',
    topic: '유일한 구원의 길'
  ,    engText: 'Jesus answered, “I am the way and the truth and the life. No one comes to the Father except through me.”'
},
  {
    id: 'm_12',
    category: 'essential',
    ref: '로마서 12:1-2',
    text: '그러므로 형제들아 내가 하나님의 모든 자비하심으로 너희를 권하노니 너희 몸을 하나님이 기뻐하시는 거룩한 산 제사로 드리라 이는 너희의 드릴 영적 예배니라 너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라',
    topic: '삶의 거룩한 예배'
  ,    engText: 'Living Sacrifices Therefore, I urge you, brothers, in view of God’s mercy, to offer your bodies as living sacrifices, holy and pleasing to God—this is your spiritual act of worship. Do not conform any longer to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God’s will is—his good, pleasing and perfect will.'
},
  {
    id: 'm_13',
    category: 'essential',
    ref: '고린도후서 5:17',
    text: '그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다',
    topic: '새로운 피조물'
  ,    engText: 'Therefore, if anyone is in Christ, he is a new creation; the old has gone, the new has come!'
},
  {
    id: 'm_14',
    category: 'essential',
    ref: '데살로니가전서 5:16-18',
    text: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이는 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라',
    topic: '그리스도인의 생활 수칙'
  ,    engText: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.'
},
  {
    id: 'm_15',
    category: 'essential',
    ref: '에베소서 2:8-9',
    text: '너희가 그 은혜를 인하여 믿음으로 말미암아 구원을 얻었나니 이것이 너희에게서 난 것이 아니요 하나님의 선물이라 행위에서 난 것이 아니니 이는 누구든지 자랑치 못하게 함이니라',
    topic: '은혜로 받는 구원'
  ,    engText: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.'
},
  {
    id: 'm_16',
    category: 'essential',
    ref: '로마서 10:9-10',
    text: '네가 만일 네 입으로 예수를 주로 시인하며 또 하나님께서 그를 죽은 자 가운데서 살리신 것을 네 마음에 믿으면 구원을 얻으리니 사람이 마음으로 믿어 의에 이르고 입으로 시인하여 구원에 이르느니라',
    topic: '구원의 입술 시인'
  ,    engText: 'That if you confess with your mouth, “Jesus is Lord,” and believe in your heart that God raised him from the dead, you will be saved. For it is with your heart that you believe and are justified, and it is with your mouth that you confess and are saved.'
},
  {
    id: 'm_17',
    category: 'essential',
    ref: '요한일서 1:9',
    text: '만일 우리가 우리 죄를 자백하면 저는 미쁘시고 의로우사 우리 죄를 사하시며 모든 불의에서 우리를 깨끗케 하실 것이요',
    topic: '죄 사함과 정결'
  ,    engText: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.'
},
  {
    id: 'm_18',
    category: 'essential',
    ref: '마태복음 28:19-20',
    text: '그러므로 너희는 가서 모든 족속으로 제자를 삼아 아버지와 아들과 성령의 이름으로 세례를 주고 내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라 볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라 하시니라',
    topic: '대사명(Great Commission)'
  ,    engText: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.”'
},
  {
    id: 'm_19',
    category: 'essential',
    ref: '요한복음 1:12',
    text: '영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니',
    topic: '하나님 자녀의 권세'
  ,    engText: 'Yet to all who received him, to those who believed in his name, he gave the right to become children of God—'
},
  {
    id: 'm_20',
    category: 'essential',
    ref: '로마서 1:16',
    text: '내가 복음을 부끄러워하지 아니하노니 이 복음은 모든 믿는 자에게 구원을 주시는 하나님의 능력이 됨이라 첫째는 유대인에게요 또한 헬라인에게로다',
    topic: '복음의 능력'
  ,    engText: 'I am not ashamed of the gospel, because it is the power of God for the salvation of everyone who believes: first for the Jew, then for the Gentile.'
},

  // ── 2. 믿음과 승리 (Victory & Faith: 18구절) ──
  {
    id: 'm_21',
    category: 'victory',
    ref: '여호수아 1:9',
    text: '내가 네게 명한 것이 아니냐 마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라',
    topic: '강하고 담대한 믿음'
  ,    engText: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.'
},
  {
    id: 'm_22',
    category: 'victory',
    ref: '히브리서 11:1',
    text: '믿음은 바라는 것들의 실상이요 보지 못하는 것들의 증거니',
    topic: '믿음의 본질'
  ,    engText: 'Now faith is confidence in what we hope for and assurance about what we do not see.'
},
  {
    id: 'm_23',
    category: 'victory',
    ref: '히브리서 12:2',
    text: '믿음의 주요 또 온전케 하시는 이인 예수를 바라보자 저는 그 앞에 있는 즐거움을 위하여 십자가를 참으사 부끄러움을 개의치 아니하시더니 하나님 보좌 우편에 앉으셨느니라',
    topic: '예수님을 바라보는 신앙'
  ,    engText: 'Let us fix our eyes on Jesus, the author and perfecter of our faith, who for the joy set before him endured the cross, scorning its shame, and sat down at the right hand of the throne of God.'
},
  {
    id: 'm_24',
    category: 'victory',
    ref: '에베소서 6:10-11',
    text: '종말로 너희가 주 안에서와 그 힘의 능력으로 강건하여지고 마귀의 궤계를 능히 대적하기 위하여 하나님의 전신 갑주를 입으라',
    topic: '영적 전쟁과 전신갑주'
  ,    engText: 'The Armor of God Finally, be strong in the Lord and in his mighty power. Put on the full armor of God so that you can take your stand against the devil’s schemes.'
},
  {
    id: 'm_25',
    category: 'victory',
    ref: '고린도전서 10:13',
    text: '사람이 감당할 시험 밖에는 너희에게 당한 것이 없나니 오직 하나님은 미쁘사 너희가 감당치 못할 시험 당함을 허락지 아니하시고 시험 당할 즈음에 또한 피할 길을 내사 너희로 능히 감당하게 하시느니라',
    topic: '시험을 이기는 능력'
  ,    engText: 'No temptation has seized you except what is common to man. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can stand up under it.'
},
  {
    id: 'm_26',
    category: 'victory',
    ref: '로마서 8:37',
    text: '그러나 이 모든 일에 우리를 사랑하시는 이로 말미암아 우리가 넉넉히 이기느니라',
    topic: '넉넉히 이기는 승리'
  ,    engText: 'No, in all these things we are more than conquerors through him who loved us.'
},
  {
    id: 'm_27',
    category: 'victory',
    ref: '디모데후서 4:7-8',
    text: '내가 선한 싸움을 싸우고 나의 달려갈 길을 마치고 믿음을 지켰으니 이제 후로는 나를 위하여 의의 면류관이 예비되었으므로 주 곧 의로우신 재판장이 그 날에 내게 주실 것이니 내게만 아니라 주의 나타나심을 사모하는 모든 자에게니라',
    topic: '믿음의 선한 완주'
  ,    engText: 'I have fought the good fight, I have finished the race, I have kept the faith. Now there is in store for me the crown of righteousness, which the Lord, the righteous Judge, will award to me on that day—and not only to me, but also to all who have longed for his appearing.'
},
  {
    id: 'm_28',
    category: 'victory',
    ref: '야고보서 4:7',
    text: '그런즉 너희는 하나님께 순복할지어다 마귀를 대적하라 그리하면 너희를 피하리라',
    topic: '마귀 대적과 순복'
  ,    engText: 'Submit yourselves, then, to God. Resist the devil, and he will flee from you.'
},
  {
    id: 'm_29',
    category: 'victory',
    ref: '시편 18:1-2',
    text: '[여호와의 종 다윗의 시, 영장으로 한 노래, 여호와께서 다윗을 그 모든 원수와 사울의 손에서 구원하신 날에 다윗이 이 노래의 말로 여호와께 아뢰어 가로되] 나의 힘이 되신 여호와여 내가 주를 사랑하나이다 여호와는 나의 반석이시요 나의 요새시요 나를 건지시는 자시요 나의 하나님이시요 나의 피할 바위시요 나의 방패시요 나의 구원의 뿔이시요 나의 산성이시로다',
    topic: '나의 힘이신 하나님'
  ,    engText: 'Psalm 18 For the director of music. Of David the servant of the Lord. He sang to the Lord the words of this song when the Lord delivered him from the hand of all his enemies and from the hand of Saul. He said: I love you, O Lord, my strength. The Lord is my rock, my fortress and my deliverer; my God is my rock, in whom I take refuge. He is my shield and the horn of my salvation, my stronghold.'
},
  {
    id: 'm_30',
    category: 'victory',
    ref: '하박국 3:17-18',
    text: '비록 무화과나무가 무성치 못하며 포도나무에 열매가 없으며 감람나무에 소출이 없으며 밭에 식물이 없으며 우리에 양이 없으며 외양간에 소가 없을지라도 나는 여호와를 인하여 즐거워하며 나의 구원의 하나님을 인하여 기뻐하리로다',
    topic: '환경을 초월한 기쁨'
  ,    engText: 'Though the fig tree does not bud and there are no grapes on the vines, though the olive crop fails and the fields produce no food, though there are no sheep in the pen and no cattle in the stalls, yet I will rejoice in the Lord, I will be joyful in God my Savior.'
},
  {
    id: 'm_31',
    category: 'victory',
    ref: '스가랴 4:6',
    text: '그가 내게 일러 가로되 여호와께서 스룹바벨에게 하신 말씀이 이러하니라 만군의 여호와께서 말씀하시되 이는 힘으로 되지 아니하며 능으로 되지 아니하고 오직 나의 신으로 되느니라',
    topic: '성령의 권능으로 승리'
  ,    engText: 'So he said to me, “This is the word of the Lord to Zerubbabel: ‘Not by might nor by power, but by my Spirit,’ says the Lord Almighty.'
},
  {
    id: 'm_32',
    category: 'victory',
    ref: '요한일서 5:4',
    text: '대저 하나님께로서 난 자마다 세상을 이기느니라 세상을 이긴 이김은 이것이니 우리의 믿음이니라',
    topic: '세상을 이기는 믿음'
  ,    engText: 'for everyone born of God overcomes the world. This is the victory that has overcome the world, even our faith.'
},
  {
    id: 'm_33',
    category: 'victory',
    ref: '시편 27:1',
    text: '[다윗의 시] 여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요 여호와는 내 생명의 능력이시니 내가 누구를 무서워하리요',
    topic: '빛과 구원되신 주'
  ,    engText: 'Psalm 27 Of David. The Lord is my light and my salvation— whom shall I fear? The Lord is the stronghold of my life— of whom shall I be afraid?'
},
  {
    id: 'm_34',
    category: 'victory',
    ref: '이사야 54:17',
    text: '무릇 너를 치려고 제조된 기계가 날카롭지 못할 것이라 무릇 일어나 너를 대적하여 송사하는 혀는 네게 정죄를 당하리니 이는 여호와의 종들의 기업이요 이는 그들이 내게서 얻은 의니라 여호와의 말이니라',
    topic: '원수의 공격 무력화'
  ,    engText: 'no weapon forged against you will prevail, and you will refute every tongue that accuses you. This is the heritage of the servants of the Lord, and this is their vindication from me,” declares the Lord.'
},
  {
    id: 'm_35',
    category: 'victory',
    ref: '고린도전서 15:57',
    text: '우리 주 예수 그리스도로 말미암아 우리에게 이김을 주시는 하나님께 감사하노니',
    topic: '부활 승리의 찬송'
  ,    engText: 'But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
},
  {
    id: 'm_36',
    category: 'victory',
    ref: '디모데전서 6:12',
    text: '믿음의 선한 싸움을 싸우라 영생을 취하라 이를 위하여 네가 부르심을 입었고 많은 증인 앞에서 선한 증거를 증거하였도다',
    topic: '믿음의 선한 싸움'
  ,    engText: 'Fight the good fight of the faith. Take hold of the eternal life to which you were called when you made your good confession in the presence of many witnesses.'
},
  {
    id: 'm_37',
    category: 'victory',
    ref: '시편 91:1-2',
    text: '지존자의 은밀한 곳에 거하는 자는 전능하신 자의 그늘 아래 거하리로다 내가 여호와를 가리켜 말하기를 저는 나의 피난처요 나의 요새요 나의 의뢰하는 하나님이라 하리니',
    topic: '전능자의 그늘 아래 보호'
  ,    engText: 'Psalm 91 He who dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, “He is my refuge and my fortress, my God, in whom I trust.”'
},
  {
    id: 'm_38',
    category: 'victory',
    ref: '사무엘상 17:45',
    text: '다윗이 블레셋 사람에게 이르되 너는 칼과 창과 단창으로 내게 오거니와 나는 만군의 여호와의 이름 곧 네가 모욕하는 이스라엘 군대의 하나님의 이름으로 네게 가노라',
    topic: '여호와의 이름의 권세'
  ,    engText: 'David said to the Philistine, “You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty, the God of the armies of Israel, whom you have defied.'
},

  // ── 3. 위로와 평안 (Comfort & Peace: 18구절) ──
  {
    id: 'm_39',
    category: 'comfort',
    ref: '마태복음 11:28',
    text: '수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라',
    topic: '참된 쉼과 안식'
  ,    engText: '“Come to me, all you who are weary and burdened, and I will give you rest.'
},
  {
    id: 'm_40',
    category: 'comfort',
    ref: '빌립보서 4:6-7',
    text: '아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라',
    topic: '염려를 이기는 평강'
  ,    engText: 'Do not be anxious about anything, but in everything, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.'
},
  {
    id: 'm_41',
    category: 'comfort',
    ref: '요한복음 14:27',
    text: '평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것 같지 아니하니라 너희는 마음에 근심도 말고 두려워하지도 말라',
    topic: '세상이 줄 수 없는 평안'
  ,    engText: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.'
},
  {
    id: 'm_42',
    category: 'comfort',
    ref: '베드로전서 5:7',
    text: '너희 염려를 다 주께 맡겨 버리라 이는 저가 너희를 권고하심이니라',
    topic: '염려를 주께 맡김'
  ,    engText: 'Cast all your anxiety on him because he cares for you.'
},
  {
    id: 'm_43',
    category: 'comfort',
    ref: '시편 46:1',
    text: '[고라 자손의 시, 영장으로 알라못에 맞춘 노래] 하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라',
    topic: '환난 날의 피난처'
  ,    engText: 'Psalm 46 For the director of music. Of the Sons of Korah. According to alamoth. A song. God is our refuge and strength, an ever-present help in trouble.'
},
  {
    id: 'm_44',
    category: 'comfort',
    ref: '이사야 40:31',
    text: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리의 날개치며 올라감 같을 것이요 달음박질하여도 곤비치 아니하겠고 걸어가도 피곤치 아니하리로다',
    topic: '독수리 같은 새 힘'
  ,    engText: 'but those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.'
},
  {
    id: 'm_45',
    category: 'comfort',
    ref: '예레미야애가 3:22-23',
    text: '여호와의 자비와 긍휼이 무궁하시므로 우리가 진멸되지 아니함이니이다 이것이 아침마다 새로우니 주의 성실이 크도소이다',
    topic: '아침마다 새로운 자비'
  ,    engText: 'Because of the Lord’s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.'
},
  {
    id: 'm_46',
    category: 'comfort',
    ref: '시편 121:1-2',
    text: '[성전에 올라가는 노래] 내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올꼬 나의 도움이 천지를 지으신 여호와에게서로다',
    topic: '천지를 지으신 도움'
  ,    engText: 'Psalm 121 A song of ascents. I lift up my eyes to the hills— where does my help come from? My help comes from the Lord, the Maker of heaven and earth.'
},
  {
    id: 'm_47',
    category: 'comfort',
    ref: '시편 34:18',
    text: '여호와는 마음이 상한 자에게 가까이 하시고 중심에 통회하는 자를 구원하시는도다',
    topic: '상한 마음의 치유'
  ,    engText: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'
},
  {
    id: 'm_48',
    category: 'comfort',
    ref: '요한계시록 21:4',
    text: '모든 눈물을 그 눈에서 씻기시매 다시 사망이 없고 애통하는 것이나 곡하는 것이나 아픈 것이 다시 있지 아니하리니 처음 것들이 다 지나갔음이러라',
    topic: '영원한 위로와 천국'
  ,    engText: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.”'
},
  {
    id: 'm_49',
    category: 'comfort',
    ref: '이사야 43:1-2',
    text: '야곱아 너를 창조하신 여호와께서 이제 말씀하시느니라 이스라엘아 너를 조성하신 자가 이제 말씀하시느니라 너는 두려워 말라 내가 너를 구속하였고 내가 너를 지명하여 불렀나니 너는 내 것이라 네가 물 가운데로 지날 때에 내가 함께할 것이라 강을 건널 때에 물이 너를 침몰치 못할 것이며 네가 불 가운데로 행할 때에 타지도 아니할 것이요 불꽃이 너를 사르지도 못하리니',
    topic: '지명하여 부르신 보배'
  ,    engText: 'Israel’s Only Savior But now, this is what the Lord says— he who created you, O Jacob, he who formed you, O Israel: “Fear not, for I have redeemed you; I have summoned you by name; you are mine. When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you. When you walk through the fire, you will not be burned; the flames will not set you ablaze.'
},
  {
    id: 'm_50',
    category: 'comfort',
    ref: '시편 42:5',
    text: '내 영혼아 네가 어찌하여 낙망하며 어찌하여 내 속에서 불안하여 하는고 너는 하나님을 바라라 그 얼굴의 도우심을 인하여 내가 오히려 찬송하리로다',
    topic: '낙심을 이기는 소망'
  ,    engText: 'Why are you downcast, O my soul? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and'
},
  {
    id: 'm_51',
    category: 'comfort',
    ref: '로마서 8:38-39',
    text: '내가 확신하노니 사망이나 생명이나 천사들이나 권세자들이나 현재 일이나 장래 일이나 능력이나 높음이나 깊음이나 다른 아무 피조물이라도 우리를 우리 주 그리스도 예수 안에 있는 하나님의 사랑에서 끊을 수 없으리라',
    topic: '끊을 수 없는 사랑'
  ,    engText: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.'
},
  {
    id: 'm_52',
    category: 'comfort',
    ref: '이사야 26:3',
    text: '주께서 심지가 견고한 자를 평강에 평강으로 지키시리니 이는 그가 주를 의뢰함이니이다',
    topic: '완전한 평강(샬롬)'
  ,    engText: 'You will keep in perfect peace him whose mind is steadfast, because he trusts in you.'
},
  {
    id: 'm_53',
    category: 'comfort',
    ref: '시편 103:2-3',
    text: '내 영혼아 여호와를 송축하며 그 모든 은택을 잊지 말지어다 저가 네 모든 죄악을 사하시며 네 모든 병을 고치시며',
    topic: '치유와 사죄의 은택'
  ,    engText: 'Praise the Lord, O my soul, and forget not all his benefits— who forgives all your sins and heals all your diseases,'
},
  {
    id: 'm_54',
    category: 'comfort',
    ref: '고린도후서 1:3-4',
    text: '찬송하리로다 그는 우리 주 예수 그리스도의 하나님이시요 자비의 아버지시요 모든 위로의 하나님이시며 우리의 모든 환난 중에서 우리를 위로하사 우리로 하여금 하나님께 받는 위로로써 모든 환난 중에 있는 자들을 능히 위로하게 하시는 이시로다',
    topic: '모든 위로의 하나님'
  ,    engText: 'The God of All Comfort Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves have received from God.'
},
  {
    id: 'm_55',
    category: 'comfort',
    ref: '시편 62:1-2',
    text: '[다윗의 시, 영장으로 여두둔의 법칙을 의지하여 한 노래] 나의 영혼이 잠잠히 하나님만 바람이여 나의 구원이 그에게서 나는도다 오직 저만 나의 반석이시요 나의 구원이시요 나의 산성이시니 내가 크게 요동치 아니하리로다',
    topic: '잠잠히 하나님만 바람'
  ,    engText: 'Psalm 62 For the director of music. For Jeduthun. A psalm of David. My soul finds rest in God alone; my salvation comes from him. He alone is my rock and my salvation; he is my fortress, I will never be shaken.'
},
  {
    id: 'm_56',
    category: 'comfort',
    ref: '마태복음 28:20',
    text: '내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라 볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라 하시니라',
    topic: '영원한 임재의 약속'
  ,    engText: 'and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.”'
},

  // ── 4. 기도와 축복 (Prayer & Blessing: 16구절) ──
  {
    id: 'm_57',
    category: 'prayer',
    ref: '예레미야 33:3',
    text: '너는 내게 부르짖으라 내가 네게 응답하겠고 네가 알지 못하는 크고 비밀한 일을 네게 보이리라',
    topic: '응답받는 부르짖음'
  ,    engText: '‘Call to me and I will answer you and tell you great and unsearchable things you do not know.’'
},
  {
    id: 'm_58',
    category: 'prayer',
    ref: '마가복음 11:24',
    text: '그러므로 내가 너희에게 말하노니 무엇이든지 기도하고 구하는 것은 받은 줄로 믿으라 그리하면 너희에게 그대로 되리라',
    topic: '믿음의 기도'
  ,    engText: 'Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.'
},
  {
    id: 'm_59',
    category: 'prayer',
    ref: '민수기 6:24-26',
    text: '여호와는 네게 복을 주시고 너를 지키시기를 원하며 여호와는 그 얼굴로 네게 비취사 은혜 베푸시기를 원하며 여호와는 그 얼굴을 네게로 향하여 드사 평강주시기를 원하노라 할지니라 하라',
    topic: '아론의 대제사장적 축복'
  ,    engText: '“‘“The Lord bless you and keep you; the Lord make his face shine upon you and be gracious to you; the Lord turn his face toward you and give you peace.”’'
},
  {
    id: 'm_60',
    category: 'prayer',
    ref: '마태복음 7:7-8',
    text: '구하라 그러면 너희에게 주실 것이요 찾으라 그러면 찾을 것이요 문을 두드리라 그러면 너희에게 열릴 것이니 구하는 이마다 얻을 것이요 찾는 이가 찾을 것이요 두드리는 이에게 열릴 것이니라',
    topic: '간구와 찾음의 약속'
  ,    engText: 'Ask, Seek, Knock “Ask and it will be given to you; seek and you will find; knock and the door will be opened to you. For everyone who asks receives; he who seeks finds; and to him who knocks, the door will be opened.'
},
  {
    id: 'm_61',
    category: 'prayer',
    ref: '요한일서 5:14-15',
    text: '그를 향하여 우리의 가진 바 담대한 것이 이것이니 그의 뜻대로 무엇을 구하면 들으심이라 우리가 무엇이든지 구하는 바를 들으시는 줄을 안즉 우리가 그에게 구한 그것을 얻은 줄을 또한 아느니라',
    topic: '뜻대로 구하는 확신'
  ,    engText: 'This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us. And if we know that he hears us—whatever we ask—we know that we have what we asked of him.'
},
  {
    id: 'm_62',
    category: 'prayer',
    ref: '시편 37:4-5',
    text: '또 여호와를 기뻐하라 저가 네 마음의 소원을 이루어 주시리로다 너의 길을 여호와께 맡기라 저를 의지하면 저가 이루시고',
    topic: '마음의 소원 성취'
  ,    engText: 'Delight yourself in the Lord and he will give you the desires of your heart. Commit your way to the Lord; trust in him and he will do this:'
},
  {
    id: 'm_63',
    category: 'prayer',
    ref: '야고보서 5:16',
    text: '이러므로 너희 죄를 서로 고하며 병 낫기를 위하여 서로 기도하라 의인의 간구는 역사하는 힘이 많으니라',
    topic: '의인의 역사하는 기도'
  ,    engText: 'Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous man is powerful and effective.'
},
  {
    id: 'm_64',
    category: 'prayer',
    ref: '역대상 4:10',
    text: '야베스가 이스라엘 하나님께 아뢰어 가로되 원컨대 주께서 내게 복에 복을 더하사 나의 지경을 넓히시고 주의 손으로 나를 도우사 나로 환난을 벗어나 근심이 없게 하옵소서 하였더니 하나님이 그 구하는 것을 허락하셨더라',
    topic: '야베스의 역전 기도'
  ,    engText: 'Jabez cried out to the God of Israel, “Oh, that you would bless me and enlarge my territory! Let your hand be with me, and keep me from harm so that I will be free from pain.” And God granted his request.'
},
  {
    id: 'm_65',
    category: 'prayer',
    ref: '빌립보서 4:19',
    text: '나의 하나님이 그리스도 예수 안에서 영광 가운게 그 풍성한 대로 너희 모든 쓸 것을 채우시리라',
    topic: '풍성한 공급의 약속'
  ,    engText: 'And my God will meet all your needs according to his glorious riches in Christ Jesus.'
},
  {
    id: 'm_66',
    category: 'prayer',
    ref: '야고보서 1:5',
    text: '너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 그리하면 주시리라',
    topic: '후히 주시는 지혜 간구'
  ,    engText: 'If any of you lacks wisdom, he should ask God, who gives generously to all without finding fault, and it will be given to him.'
},
  {
    id: 'm_67',
    category: 'prayer',
    ref: '시편 145:18',
    text: '여호와께서는 자기에게 간구하는 모든 자 곧 진실하게 간구하는 모든 자에게 가까이 하시는도다',
    topic: '진실한 간구와 가까이하심'
  ,    engText: 'The Lord is near to all who call on him, to all who call on him in truth.'
},
  {
    id: 'm_68',
    category: 'prayer',
    ref: '요한복음 15:7',
    text: '너희가 내 안에 거하고 내 말이 너희 안에 거하면 무엇이든지 원하는 대로 구하라 그리하면 이루리라',
    topic: '말씀 안에 거하는 기도'
  ,    engText: 'If you remain in me and my words remain in you, ask whatever you wish, and it will be given you.'
},
  {
    id: 'm_69',
    category: 'prayer',
    ref: '누가복음 18:1',
    text: '항상 기도하고 낙망치 말아야 될 것을 저희에게 비유로 하여',
    topic: '낙심치 않는 끈기 기도'
  ,    engText: 'The Parable of the Persistent Widow Then Jesus told his disciples a parable to show them that they should always pray and not give up.'
},
  {
    id: 'm_70',
    category: 'prayer',
    ref: '골로새서 4:2',
    text: '기도를 항상 힘쓰고 기도에 감사함으로 깨어 있으라',
    topic: '감사로 깨어있는 기도'
  ,    engText: 'Further Instructions Devote yourselves to prayer, being watchful and thankful.'
},
  {
    id: 'm_71',
    category: 'prayer',
    ref: '에베소서 3:20',
    text: '우리 가운데서 역사하시는 능력대로 우리의 온갖 구하는 것이나 생각하는 것에 더 넘치도록 능히 하실 이에게',
    topic: '넘치도록 주시는 하나님'
  ,    engText: 'Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us,'
},

  // ── 5. 사랑과 성화 (Love & Sanctification: 14구절) ──
  {
    id: 'm_72',
    category: 'love',
    ref: '요한복음 13:34-35',
    text: '새 계명을 너희에게 주노니 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라 너희가 서로 사랑하면 이로써 모든 사람이 너희가 내 제자인 줄 알리라',
    topic: '서로 사랑의 새 계명'
  ,    engText: '“A new command I give you: Love one another. As I have loved you, so you must love one another. By this all men will know that you are my disciples, if you love one another.”'
},
  {
    id: 'm_73',
    category: 'love',
    ref: '고린도전서 13:13',
    text: '그런즉 믿음, 소망, 사랑, 이 세가지는 항상 있을 것인데 그 중에 제일은 사랑이라',
    topic: '제일 되는 사랑'
  ,    engText: 'And now these three remain: faith, hope and love. But the greatest of these is love.'
},
  {
    id: 'm_74',
    category: 'love',
    ref: '갈라디아서 5:22-23',
    text: '오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과 온유와 절제니 이같은 것을 금지할 법이 없느니라',
    topic: '성령의 9가지 열매'
  ,    engText: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.'
},
  {
    id: 'm_75',
    category: 'love',
    ref: '요한일서 4:7-8',
    text: '사랑하는 자들아 우리가 서로 사랑하자 사랑은 하나님께 속한 것이니 사랑하는 자마다 하나님께로 나서 하나님을 알고 사랑하지 아니하는 자는 하나님을 알지 못하나니 이는 하나님은 사랑이심이라',
    topic: '하나님은 사랑이심이라'
  ,    engText: 'God’s Love and Ours Dear friends, let us love one another, for love comes from God. Everyone who loves has been born of God and knows God. Whoever does not love does not know God, because God is love.'
},
  {
    id: 'm_76',
    category: 'love',
    ref: '미가 6:8',
    text: '사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것이 오직 공의를 행하며 인자를 사랑하며 겸손히 네 하나님과 함께 행하는 것이 아니냐',
    topic: '하나님이 구하시는 도리'
  ,    engText: 'He has showed you, O man, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.'
},
  {
    id: 'm_77',
    category: 'love',
    ref: '베드로전서 4:8',
    text: '무엇보다도 열심으로 서로 사랑할지니 사랑은 허다한 죄를 덮느니라',
    topic: '허물을 덮는 사랑'
  ,    engText: 'Above all, love each other deeply, because love covers over a multitude of sins.'
},
  {
    id: 'm_78',
    category: 'love',
    ref: '로마서 13:8',
    text: '피차 사랑의 빚 외에는 아무에게든지 아무 빚도 지지 말라 남을 사랑하는 자는 율법을 다 이루었느니라',
    topic: '사랑의 빚'
  ,    engText: 'Love, for the Day Is Near Let no debt remain outstanding, except the continuing debt to love one another, for he who loves his fellowman has fulfilled the law.'
},
  {
    id: 'm_79',
    category: 'love',
    ref: '마태복음 22:37-39',
    text: '예수께서 가라사대 네 마음을 다하고 목숨을 다하고 뜻을 다하여 주 너의 하나님을 사랑하라 하셨으니 이것이 크고 첫째 되는 계명이요 둘째는 그와 같으니 네 이웃을 네 몸과 같이 사랑하라 하셨으니',
    topic: '가장 큰 두 계명'
  ,    engText: 'Jesus replied: “‘Love the Lord your God with all your heart and with all your soul and with all your mind.’ This is the first and greatest commandment. And the second is like it: ‘Love your neighbor as yourself.’'
},
  {
    id: 'm_80',
    category: 'love',
    ref: '고린도전서 13:4-7',
    text: '사랑은 오래 참고 사랑은 온유하며 투기하는 자가 되지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며 무례히 행치 아니하며 자기의 유익을 구치 아니하며 성내지 아니하며 악한 것을 생각지 아니하며 불의를 기뻐하지 아니하며 진리와 함께 기뻐하고 모든 것을 참으며 모든 것을 믿으며 모든 것을 바라며 모든 것을 견디느니라',
    topic: '사랑의 성품'
  ,    engText: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It is not rude, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.'
},
  {
    id: 'm_81',
    category: 'love',
    ref: '에베소서 4:32',
    text: '서로 인자하게 하며 불쌍히 여기며 서로 용서하기를 하나님이 그리스도 안에서 너희를 용서하심과 같이 하라',
    topic: '그리스도인의 용서'
  ,    engText: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.'
},
  {
    id: 'm_82',
    category: 'love',
    ref: '로마서 12:9-10',
    text: '사랑엔 거짓이 없나니 악을 미워하고 선에 속하라 형제를 사랑하여 서로 우애하고 존경하기를 서로 먼저 하며',
    topic: '진실한 형제 사랑'
  ,    engText: 'Love Love must be sincere. Hate what is evil; cling to what is good. Be devoted to one another in brotherly love. Honor one another above yourselves.'
},
  {
    id: 'm_83',
    category: 'love',
    ref: '골로새서 3:12-14',
    text: '그러므로 너희는 하나님의 택하신 거룩하고 사랑하신 자처럼 긍휼과 자비와 겸손과 온유와 오래 참음을 옷입고 누가 뉘게 혐의가 있거든 서로 용납하여 피차 용서하되 주께서 너희를 용서하신 것과 같이 너희도 그리하고 이 모든 것 위에 사랑을 더하라 이는 온전하게 매는 띠니라',
    topic: '온전하게 매는 띠 사랑'
  ,    engText: 'Therefore, as God’s chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience. Bear with each other and forgive whatever grievances you may have against one another. Forgive as the Lord forgave you. And over all these virtues put on love, which binds them all together in perfect unity.'
},
  {
    id: 'm_84',
    category: 'love',
    ref: '빌립보서 2:3-4',
    text: '아무 일에든지 다툼이나 허영으로 하지 말고 오직 겸손한 마음으로 각각 자기보다 남을 낫게 여기고 각각 자기 일을 돌아볼 뿐더러 또한 각각 다른 사람들의 일을 돌아보아 나의 기쁨을 충만케 하라',
    topic: '겸손과 배려'
  ,    engText: 'Do nothing out of selfish ambition or vain conceit, but in humility consider others better than yourselves. Each of you should look not only to your own interests, but also to the interests of others.'
},
  {
    id: 'm_85',
    category: 'love',
    ref: '베드로전서 1:15-16',
    text: '오직 너희를 부르신 거룩한 자처럼 너희도 모든 행실에 거룩한 자가 되라 기록하였으되 내가 거룩하니 너희도 거룩할지어다 하셨느니라',
    topic: '거룩한 행실의 성화'
  ,    engText: 'But just as he who called you is holy, so be holy in all you do; for it is written: “Be holy, because I am holy.”'
},

  // ── 6. 말씀과 지혜 (Word & Wisdom: 15구절) ──
  {
    id: 'm_86',
    category: 'word',
    ref: '시편 119:105',
    text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다',
    topic: '내 발의 등, 내 길의 빛'
  ,    engText: 'Your word is a lamp for my feet, a light on my path.'
},
  {
    id: 'm_87',
    category: 'word',
    ref: '디모데후서 3:16-17',
    text: '모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니 이는 하나님의 사람으로 온전케 하며 모든 선한 일을 행하기에 온전케 하려 함이니라',
    topic: '성경의 영감과 유익'
  ,    engText: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the man of God may be thoroughly equipped for every good work.'
},
  {
    id: 'm_88',
    category: 'word',
    ref: '히브리서 4:12',
    text: '하나님의 말씀은 살았고 운동력이 있어 죄우에 날선 어떤 검보다도 예리하여 혼과 영과 및 관절과 골수를 찔러 쪼개기까지 하며 또 마음의 생각과 뜻을 감찰하나니',
    topic: '살아있는 말씀의 능력'
  ,    engText: 'For the word of God is living and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.'
},
  {
    id: 'm_89',
    category: 'word',
    ref: '잠언 1:7',
    text: '여호와를 경외하는 것이 지식의 근본이어늘 미련한 자는 지혜와 훈계를 멸시하느니라',
    topic: '지혜의 근본 여호와 경외'
  ,    engText: 'The fear of the Lord is the beginning of knowledge, but fools despise wisdom and discipline.'
},
  {
    id: 'm_90',
    category: 'word',
    ref: '이사야 40:8',
    text: '풀은 마르고 꽃은 시드나 우리 하나님의 말씀은 영영히 서리라 하라',
    topic: '영원히 서는 하나님 말씀'
  ,    engText: 'The grass withers and the flowers fall, but the word of our God stands forever.”'
},
  {
    id: 'm_91',
    category: 'word',
    ref: '여호수아 1:8',
    text: '이 율법책을 네 입에서 떠나지 말게 하며 주야로 그것을 묵상하여 그 가운데 기록한대로 다 지켜 행하라 그리하면 네 길이 평탄하게 될 것이라 네가 형통하리라',
    topic: '말씀 묵상과 형통의 길'
  ,    engText: 'Do not let this Book of the Law depart from your mouth; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful.'
},
  {
    id: 'm_92',
    category: 'word',
    ref: '시편 1:1-2',
    text: '복 있는 사람은 악인의 꾀를 좇지 아니하며 죄인의 길에 서지 아니하며 오만한 자의 자리에 앉지 아니하고 오직 여호와의 율법을 즐거워하여 그 율법을 주야로 묵상하는 자로다',
    topic: '복 있는 사람'
  ,    engText: 'BOOK I Psalms 1–41 Psalm 1 Blessed is the man who does not walk in the counsel of the wicked or stand in the way of sinners or sit in the seat of mockers. But his delight is in the law of the Lord, and on his law he meditates day and night.'
},
  {
    id: 'm_93',
    category: 'word',
    ref: '잠언 4:23',
    text: '무릇 지킬만한 것보다 더욱 네 마음을 지키라 생명의 근원이 이에서 남이니라',
    topic: '마음을 지키는 지혜'
  ,    engText: 'Above all else, guard your heart, for it is the wellspring of life.'
},
  {
    id: 'm_94',
    category: 'word',
    ref: '야고보서 1:22',
    text: '너희는 도를 행하는 자가 되고 듣기만 하여 자신을 속이는 자가 되지 말라',
    topic: '말씀의 순종과 실천'
  ,    engText: 'Do not merely listen to the word, and so deceive yourselves. Do what it says.'
},
  {
    id: 'm_95',
    category: 'word',
    ref: '골로새서 3:16',
    text: '그리스도의 말씀이 너희 속에 풍성히 거하여 모든 지혜로 피차 가르치며 권면하고 시와 찬미와 신령한 노래를 부르며 마음에 감사함으로 하나님을 찬양하고',
    topic: '풍성히 거하는 말씀'
  ,    engText: 'Let the word of Christ dwell in you richly as you teach and admonish one another with all wisdom, and as you sing psalms, hymns and spiritual songs with gratitude in your hearts to God.'
},
  {
    id: 'm_96',
    category: 'word',
    ref: '시편 119:9',
    text: '청년이 무엇으로 그 행실을 깨끗케 하리이까 주의 말씀을 따라 삼갈 것이니이다',
    topic: '말씀으로 정결케 함'
  ,    engText: 'ב Beth How can a young man keep his way pure? By living according to your word.'
},
  {
    id: 'm_97',
    category: 'word',
    ref: '시편 119:11',
    text: '내가 주께 범죄치 아니하려 하여 주의 말씀을 내 마음에 두었나이다',
    topic: '마음에 두는 말씀 암송'
  ,    engText: 'I have hidden your word in my heart that I might not sin against you.'
},
  {
    id: 'm_98',
    category: 'word',
    ref: '잠언 9:10',
    text: '여호와를 경외하는 것이 지혜의 근본이요 거룩하신 자를 아는 것이 명철이니라',
    topic: '거룩하신 자를 아는 명철'
  ,    engText: '“The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.'
},
  {
    id: 'm_99',
    category: 'word',
    ref: '시편 19:7-8',
    text: '여호와의 율법은 완전하여 영혼을 소성케 하고 여호와의 증거는 확실하여 우둔한 자로 지혜롭게 하며 여호와의 교훈은 정직하여 마음을 기쁘게 하고 여호와의 계명은 순결하여 눈을 밝게 하도다',
    topic: '영혼을 소성케 하는 율법'
  ,    engText: 'The law of the Lord is perfect, reviving the soul. The statutes of the Lord are trustworthy, making wise the simple. The precepts of the Lord are right, giving joy to the heart. The commands of the Lord are radiant, giving light to the eyes.'
},
  {
    id: 'm_100',
    category: 'word',
    ref: '신명기 6:5-7',
    text: '너는 마음을 다하고 성품을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라 오늘날 내가 네게 명하는 이 말씀을 너는 마음에 새기고 네 자녀에게 부지런히 가르치며 집에 앉았을 때에든지 길에 행할 때에든지 누웠을 때에든지 일어날 때에든지 이 말씀을 강론할 것이며',
    topic: '쉐마(Shema) 신앙 교육'
  ,    engText: 'Love the Lord your God with all your heart and with all your soul and with all your strength. These commandments that I give you today are to be upon your hearts. Impress them on your children. Talk about them when you sit at home and when you walk along the road, when you lie down and when you get up.'
}
];

// 한글 음절을 초성으로 변환하는 유틸리티 함수
export function getInitialConsonants(text) {
  const CHO_SUNG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const choIndex = Math.floor((code - 0xAC00) / 588);
      result += CHO_SUNG[choIndex];
    } else {
      result += text[i];
    }
  }
  return result;
}
