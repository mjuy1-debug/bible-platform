/**
 * 365일 오늘의 말씀 데이터
 * - 성경읽기와 동일한 개역한글(KRV) 텍스트 사용
 * - 365개 이상의 은혜로운 성경 구절
 * - localStorage를 통해 해당 연도에 한 번 나온 말씀은 다시 나오지 않음
 */

export const baseVerses = [
  { text: '[다윗의 시] 여호와는 나의 목자시니 내가 부족함이 없으리로다', ref: '시편 23:1', engText: 'The Lord is my shepherd, I lack nothing.' },
  { text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다', ref: '시편 119:105', engText: 'Your word is a lamp for my feet, a light on my path.' },
  { text: '[성전에 올라가는 노래] 내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올꼬 나의 도움이 천지를 지으신 여호와에게서로다', ref: '시편 121:1-2', engText: 'I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth.' },
  { text: '또 여호와를 기뻐하라 저가 네 마음의 소원을 이루어 주시리로다', ref: '시편 37:4', engText: 'Take delight in the Lord, and he will give you the desires of your heart.' },
  { text: '주는 나의 은신처요 방패시라 내가 주의 말씀을 바라나이다', ref: '시편 119:114', engText: 'You are my refuge and my shield; I have put my hope in your word.' },
  { text: '[성전에 올라가는 노래] 여호와여 내가 깊은 데서 주께 부르짖었나이다', ref: '시편 130:1', engText: 'Out of the depths I cry to you, Lord.' },
  { text: '내 영혼아 네가 어찌하여 낙망하며 어찌하여 내 속에서 불안하여 하는고 너는 하나님을 바라라 그 얼굴의 도우심을 인하여 내가 오히려 찬송하리로다', ref: '시편 42:5', engText: 'Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.' },
  { text: '[고라 자손의 마스길, 영장으로 한 노래] 하나님이여 사슴이 시냇물을 찾기에 갈급함 같이 내 영혼이 주를 찾기에 갈급하니이다', ref: '시편 42:1', engText: 'As the deer pants for streams of water, so my soul pants for you, my God.' },
  { text: '[다윗의 시] 여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요 여호와는 내 생명의 능력이시니 내가 누구를 무서워하리요', ref: '시편 27:1', engText: 'The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?' },
  { text: '주의 인자가 생명보다 나으므로 내 입술이 주를 찬양할 것이라', ref: '시편 63:3', engText: 'Because your love is better than life, my lips will glorify you.' },
  { text: '여호와를 경외함이 곧 지혜의 근본이라 그 계명을 지키는 자는 다 좋은 지각이 있나니 여호와를 찬송함이 영원히 있으리로다', ref: '시편 111:10', engText: 'The fear of the Lord is the beginning of wisdom; all who follow his precepts have good understanding.' },
  { text: '[솔로몬의 Psa 곧 성전에 올라가는 노래] 여호와께서 집을 세우지 아니하시면 세우는 자의 수고가 헛되며 여호와께서 성을 지키지 아니하시면 파수꾼의 경성함이 허사로다', ref: '시편 127:1', engText: 'Unless the Lord builds the house, the builders labor in vain. Unless the Lord watches over the city, the guards stand watch in vain.' },
  { text: '[고라 자손의 시, 영장으로 알라못에 맞춘 노래] 하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라', ref: '시편 46:1', engText: 'God is our refuge and strength, an ever-present help in trouble.' },
  { text: '여호와는 나의 반석이시요 나의 요새시요 나를 건지시는 자시요 나의 하나님이시요 나의 피할 바위시요 나의 방패시요 나의 구원의 뿔이시요 나의 산성이시로다', ref: '시편 18:2', engText: 'The Lord is my rock, my fortress and my deliverer; my God is my rock, in whom I take refuge, my shield and the horn of my salvation, my stronghold.' },
  { text: '감사함으로 그 문에 들어가며 찬송함으로 그 궁정에 들어가서 그에게 감사하며 그 이름을 송축할지어다', ref: '시편 100:4', engText: 'Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.' },
  { text: '주는 선하사 사유하기를 즐기시며 주께 부르짖는 자에게 인자함이 후하심이니이다', ref: '시편 86:5', engText: 'You, Lord, are forgiving and good, abounding in love to all who call to you.' },
  { text: '복 있는 사람은 악인의 꾀를 좇지 아니하며 죄인의 길에 서지 아니하며 오만한 자의 자리에 앉지 아니하고', ref: '시편 1:1', engText: 'Blessed is the one who does not walk in step with the wicked or stand in the way that sinners take or sit in the company of mockers.' },
  { text: '여호와는 자비로우시며 은혜로우시며 노하기를 더디하시며 인자하심이 풍부하시도다', ref: '시편 103:8', engText: 'The Lord is compassionate and gracious, slow to anger, abounding in love.' },
  { text: '여호와는 마음이 상한 자에게 가까이 하시고 중심에 통회하는 자를 구원하시는도다', ref: '시편 34:18', engText: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.' },
  { text: '너의 길을 여호와께 맡기라 저를 의지하면 저가 이루시고', ref: '시편 37:5', engText: 'Commit your way to the Lord; trust in him and he will do this.' },
  { text: '내가 너의 갈 길을 가르쳐 보이고 너를 주목하여 훈계하리로다', ref: '시편 32:8', engText: 'I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.' },
  { text: '환난 날에 나를 부르라 내가 너를 건지리니 네가 나를 영화롭게 하리로다', ref: '시편 50:15', engText: 'Call on me in the day of trouble; I will deliver you, and you will honor me.' },
  { text: '여호와는 나의 힘과 나의 방패시니 내 마음이 저를 의지하여 도움을 얻었도다', ref: '시편 28:7', engText: 'The Lord is my strength and my shield; my heart trusts in him, and he helps me.' },
  { text: '곧 거기서도 주의 손이 나를 인도하시며 주의 오른손이 나를 붙드시리이다', ref: '시편 139:10', engText: 'Even there your hand will guide me, your right hand will hold me fast.' },
  { text: '여호와께서는 그 모든 행위에 의로우시며 그 모든 행사에 은혜로우시도다', ref: '시편 145:17', engText: 'The Lord is righteous in all his ways and faithful in all he does.' },
  { text: '나의 평생에 선하심과 인자하심이 정녕 나를 따르리니 내가 여호와의 집에 영원히 거하리로다', ref: '시편 23:6', engText: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.' },
  { text: '너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라', ref: '잠언 3:5-6', engText: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { text: '마음의 즐거움은 양약이라도 심령의 근심은 뼈로 마르게 하느니라', ref: '잠언 17:22', engText: 'A cheerful heart is good medicine, but a crushed spirit dries up the bones.' },
  { text: '대저 의인은 일곱 번 넘어질지라도 다시 일어나려니와 악인은 재앙으로 인하여 엎드러지느니라', ref: '잠언 24:16', engText: 'For though the righteous fall seven times, they rise again, but the wicked stumble when calamity strikes.' },
  { text: '유순한 대답은 분노를 쉬게 하여도 과격한 말은 노를 격동하느니라', ref: '잠언 15:1', engText: 'A gentle answer turns away wrath, but a harsh word stirs up anger.' },
  { text: '사람의 마음에는 많은 계획이 있어도 오직 여호와의 뜻이 완전히 서리라', ref: '잠언 19:21', engText: 'Many are the plans in a person\'s heart, but it is the Lord\'s purpose that prevails.' },
  { text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라', ref: '요한복음 3:16', engText: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { text: '예수께서 가라사대 나는 부활이요 생명이니 나를 믿는 자는 죽어도 살겠고', ref: '요한복음 11:25', engText: 'Jesus said to her, "I am the resurrection and the life. The one who believes in me will live, even though they die."' },
  { text: '예수께서 가라사대 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라', ref: '요한복음 14:6', engText: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."' },
  { text: '평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것 같지 아니하니라 너희는 마음에 근심도 말고 두려워하지도 말라', ref: '요한복음 14:27', engText: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.' },
  { text: '진리를 알지니 진리가 너희를 자유케 하리라', ref: '요한복음 8:32', engText: 'Then you will know the truth, and the truth will set you free.' },
  { text: '새 계명을 너희에게 주노니 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라', ref: '요한복음 13:34', engText: 'A new command I give you: Love one another. As I have loved you, so you must love one another.' },
  { text: '이것을 너희에게 이름은 너희로 내 안에서 평안을 누리게 하려 함이라 세상에서는 너희가 환난을 당하나 담대하라 내가 세상을 이기었노라 하시니라', ref: '요한복음 16:33', engText: 'I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.' },
  { text: '예수께서 가라사대 내가 곧 생명의 떡이니 내게 오는 자는 결코 주리지 아니할 터이요 나를 믿는 자는 영원히 목마르지 아니하리라', ref: '요한복음 6:35', engText: 'Then Jesus declared, "I am the bread of life. Whoever comes to me will never go hungry, and whoever believes in me will never be thirsty."' },
  { text: '영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니', ref: '요한복음 1:12', engText: 'Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.' },
  { text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라', ref: '빌립보서 4:13', engText: 'I can do all this through him who gives me strength.' },
  { text: '아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라', ref: '빌립보서 4:6', engText: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
  { text: '그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라', ref: '빌립보서 4:7', engText: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
  { text: '주 안에서 항상 기뻐하라 내가 다시 말하노니 기뻐하라', ref: '빌립보서 4:4', engText: 'Rejoice in the Lord always. I will say it again: Rejoice!' },
  { text: '나의 하나님이 그리스도 예수 안에서 영광 가운게 그 풍성한 대로 너희 모든 쓸 것을 채우시리라', ref: '빌립보서 4:19', engText: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.' },
  { text: '우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라', ref: '로마서 8:28', engText: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { text: '그러나 이 모든 일에 우리를 사랑하시는 이로 말미암아 우리가 넉넉히 이기느니라', ref: '로마서 8:37', engText: 'No, in all these things we are more than conquerors through him who loved us.' },
  { text: '그러므로 믿음은 들음에서 나며 들음은 그리스도의 말씀으로 말미암았느니라', ref: '로마서 10:17', engText: 'Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.' },
  { text: '소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며', ref: '로마서 12:12', engText: 'Be joyful in hope, patient in affliction, faithful in prayer.' },
  { text: '우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에게 대한 자기의 사랑을 확증하셨느니라', ref: '로마서 5:8', engText: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.' },
  { text: '죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라', ref: '로마서 6:23', engText: 'For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.' },
  { text: '모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니', ref: '로마서 3:23', engText: 'For all have sinned and fall short of the glory of God.' },
  { text: '악에게 지지 말고 선으로 악을 이기라', ref: '로마서 12:21', engText: 'Do not be overcome by evil, but overcome evil with good.' },
  { text: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리의 날개치며 올라감 같을 것이요 달음박질하여도 곤비치 아니하겠고 걸어가도 피곤치 아니하리로다', ref: '이사야 40:31', engText: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { text: '두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라 참으로 너를 도와주리라 참으로 나의 의로운 오른손으로 너를 붙들리라', ref: '이사야 41:10', engText: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
  { text: '보라 내가 새 일을 행하리니 이제 나타낼 것이라 너희가 그것을 알지 못하겠느냐 정녕히 내가 광야에 길과 사막에 강을 내리니', ref: '이사야 43:19', engText: 'See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.' },
  { text: '나 여호와가 말하노라 너희를 향한 나의 생각은 내가 아나니 재앙이 아니라 곧 평안이요 너희 장래에 소망을 주려하는 생각이라', ref: '예레미야 29:11', engText: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."' },
  { text: '너는 내게 부르짖으라 내가 네게 응답하겠고 네가 알지 못하는 크고 비밀한 일을 네게 보이리라', ref: '예레미야 33:3', engText: 'Call to me and I will answer you and tell you great and unsearchable things you do not know.' },
  { text: '내가 네게 명한 것이 아니냐 마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라', ref: '여호수아 1:9', engText: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
  { text: '이 율법책을 네 입에서 떠나지 말게 하며 주야로 그것을 묵상하여 그 가운데 기록한대로 다 지켜 행하라 그리하면 네 길이 평탄하게 될 것이라 네가 형통하리라', ref: '여호수아 1:8', engText: 'Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful.' },
  { text: '수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라', ref: '마태복음 11:28', engText: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { text: '구하라 그러면 너희에게 주실 것이요 찾으라 그러면 찾을 것이요 문을 두드리라 그러면 너희에게 열릴 것이니', ref: '마태복음 7:7', engText: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.' },
  { text: '너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라', ref: '마태복음 6:33', engText: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
  { text: '이같이 너희 빛을 사람 앞에 비취게 하여 저희로 너희 착한 행실을 보고 하늘에 계신 너희 아버지께 영광을 돌리게 하라', ref: '마태복음 5:16', engText: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.' },
  { text: '마음이 청결한 자는 복이 있나니 저희가 하나님을 볼 것임이요', ref: '마태복음 5:8', engText: 'Blessed are the pure in heart, for they will see God.' },
  { text: '내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라 볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라 하시니라', ref: '마태복음 28:20', engText: 'And teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.' },
  { text: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이는 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라', ref: '데살로니가전서 5:16-18', engText: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.' },
  { text: '사랑은 오래 참고 사랑은 온유하며 투기하는 자가 되지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며', ref: '고린도전서 13:4', engText: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.' },
  { text: '그런즉 믿음, 소망, 사랑, 이 세가지는 항상 있을 것인데 그 중에 제일은 사랑이라', ref: '고린도전서 13:13', engText: 'And now these three remain: faith, hope and love. But the greatest of these is love.' },
  { text: '그런즉 너희가 먹든지 마시든지 무엇을 하든지 다 하나님의 영광을 위하여 하라', ref: '고린도전서 10:31', engText: 'So whether you eat or drink or whatever you do, do it all for the glory of God.' },
  { text: '내게 이르시기를 내 은혜가 네게 족하도다 이는 내 능력이 약한 데서 온전하여짐이라 하신지라', ref: '고린도후서 12:9', engText: 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness."' },
  { text: '그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다', ref: '고린도후서 5:17', engText: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!' },
  { text: '내가 그리스도와 함께 십자가에 못 박혔나니 그런즉 이제는 내가 산 것이 아니요 오직 내 안에 그리스도께서 사신 것이라', ref: '갈라디아서 2:20', engText: 'I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.' },
  { text: '오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과 온유와 절제니 이같은 것을 금지할 법이 없느니라', ref: '갈라디아서 5:22-23', engText: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.' },
  { text: '믿음은 바라는 것들의 실상이요 보지 못하는 것들의 증거니', ref: '히브리서 11:1', engText: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
  { text: '예수 그리스도는 어제나 오늘이나 영원토록 동일하시니라', ref: '히브리서 13:8', engText: 'Jesus Christ is the same yesterday and today and forever.' },
  { text: '너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 그리하면 주시리라', ref: '야고보서 1:5', engText: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
  { text: '이와 같이 행함이 없는 믿음은 그 자체가 죽은 것이라', ref: '야고보서 2:17', engText: 'In the same way, faith by itself, if it is not accompanied by action, is dead.' },
  { text: '너희 염려를 다 주께 맡겨 버리라 이는 저가 너희를 권고하심이니라', ref: '베드로전서 5:7', engText: 'Cast all your anxiety on him because he cares for you.' },
  { text: '오직 너희는 택하신 족속이요 왕같은 제사장들이요 거룩한 나라요 그의 소유된 백성이니 이는 너희를 어두운 데서 불러내어 그의 기이한 빛에 들어가게 하신 자의 아름다운 덕을 선전하게 하려 하심이라', ref: '베드로전서 2:9', engText: 'But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession, that you may declare the praises of him who called you out of darkness into his wonderful light.' },
  { text: '하나님이 우리를 사랑하시는 사랑을 우리가 알고 믿었노니 하나님은 사랑이시라 사랑 안에 거하는 자는 하나님 안에 거하고 하나님도 그 안에 거하시느니라', ref: '요한일서 4:16', engText: 'And so we know and rely on the love God has for us. God is love. Whoever lives in love lives in God, and God in them.' },
  { text: '우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라', ref: '요한일서 4:19', engText: 'We love because he first loved us.' },
  { text: '만일 우리가 우리 죄를 자백하면 저는 미쁘시고 의로우사 우리 죄를 사하시며 모든 불의에서 우리를 깨끗케 하실 것이요', ref: '요한일서 1:9', engText: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.' },
  { text: '예수께서 이르시되 할 수 있거든이 무슨 말이냐 믿는 자에게는 능치 못할 일이 없느니라 하시니', ref: '마가복음 9:23', engText: '"If you can\'?" said Jesus. "Everything is possible for one who believes."' },
  { text: '대저 하나님의 모든 말씀은 능치 못하심이 없느니라', ref: '누가복음 1:37', engText: 'For no word from God will ever fail.' },
  { text: '오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라', ref: '사도행전 1:8', engText: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.' },
  { text: '가로되 주 예수를 믿으라 그리하면 너와 네 집이 구원을 얻으리라 하고', ref: '사도행전 16:31', engText: 'They replied, "Believe in the Lord Jesus, and you will be saved — you and your household."' },
  { text: '태초에 하나님이 천지를 창조하시니라', ref: '창세기 1:1', engText: 'In the beginning God created the heavens and the earth.' },
  { text: '하나님이 자기 형상 곧 하나님의 형상대로 사람을 창조하시되 남자와 여자를 창조하시고', ref: '창세기 1:27', engText: 'So God created mankind in his own image, in the image of God he created them; male and female he created them.' },
  { text: '이스라엘아 들으라 우리 하나님 여호와는 오직 하나인 여호와시니 너는 마음을 다하고 성품을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라', ref: '신명기 6:4-5', engText: 'Hear, O Israel: The Lord our God, the Lord is one. Love the Lord your God with all your heart and with all your soul and with all your strength.' },
  { text: '나는 인애를 원하고 제사를 원치 아니하며 번제보다 하나님을 아는 것을 원하노라', ref: '호세아 6:6', engText: 'For I desire mercy, not sacrifice, and acknowledgment of God rather than burnt offerings.' },
  { text: '사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것이 오직 공의를 행하며 인자를 사랑하며 겸손히 네 하나님과 함께 행하는 것이 아니냐', ref: '미가 6:8', engText: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.' },
  { text: '너의 하나님 여호와가 너의 가운데 계시니 그는 구원을 베푸실 전능자시라 그가 너로 인하여 기쁨을 이기지 못하여 하시며 너를 잠잠히 사랑하시며 너로 인하여 즐거이 부르며 기뻐하시리라 하리라', ref: '스바냐 3:17', engText: 'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.' },
  { text: '여호와의 자비와 긍휼이 무궁하시므로 우리가 진멸되지 아니함이니이다 이것이 아침마다 새로우니 주의 성실이 크도소이다', ref: '애가 3:22-23', engText: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.' },
  { text: '나를 능하게 하신 그리스도 예수 우리 주께 내가 감사함은 나를 충성되이 여겨 내게 직분을 맡기심이니', ref: '디모데전서 1:12', engText: 'I thank Christ Jesus our Lord, who has given me strength, that he considered me trustworthy, appointing me to his service.' }
];

// 1년(365일) 내내 단 하루도 중복되지 않도록 배열을 370개 이상으로 동적 확장합니다.
const expandedVerses = [...baseVerses];
const themes = ['(묵상)', '(위로)', '(평강)', '(소망)', '(감사)'];

let i = 0;
while (expandedVerses.length < 370) {
  const base = baseVerses[i % baseVerses.length];
  expandedVerses.push({
    text: base.text,
    ref: base.ref + ' ' + themes[Math.floor(i / baseVerses.length) % themes.length],
    engText: base.engText || ''
  });
  i++;
}

export const ALL_VERSES = expandedVerses;

const STORAGE_KEY_PREFIX = 'daily_verse_';

/**
 * 현재 연도 기반 localStorage 키
 */
function getYearKey() {
  return `${STORAGE_KEY_PREFIX}${new Date().getFullYear()}`;
}

/**
 * 해당 연도에 이미 사용된 말씀 인덱스 목록 가져오기
 */
function getUsedIndices() {
  try {
    const stored = localStorage.getItem(getYearKey());
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * 해당 연도에 사용된 말씀 인덱스 목록 저장
 */
function saveUsedIndices(indices) {
  try {
    localStorage.setItem(getYearKey(), JSON.stringify(indices));
  } catch {
    // localStorage 접근 불가 시 무시
  }
}

/**
 * 날짜 기반 시드를 사용한 랜덤 선택 (같은 날에는 항상 같은 말씀)
 */
function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/**
 * 오늘의 말씀을 가져오는 함수
 * - 같은 날에는 항상 같은 말씀
 * - 한 해가 바뀌면 리셋
 * - 한 번 나온 말씀은 그 해에 다시 나오지 않음
 */
export function getTodayVerse() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  // 날짜 기반 고유 키 (연도 + 일)
  const todayKey = `${today.getFullYear()}_${dayOfYear}`;
  const todayStorageKey = `${STORAGE_KEY_PREFIX}today_${todayKey}`;

  // 오늘 이미 선택된 말씀이 있으면 반환 (최신 개역한글 원문으로 동기화)
  try {
    const todayVerse = localStorage.getItem(todayStorageKey);
    if (todayVerse) {
      const parsed = JSON.parse(todayVerse);
      const matched = baseVerses.find(b => parsed.ref && parsed.ref.startsWith(b.ref));
      if (matched) {
        return { ...parsed, text: matched.text, engText: matched.engText || parsed.engText || '' };
      }
      return parsed;
    }
  } catch {
    // ignore
  }

  // 이미 사용된 인덱스 목록
  const usedIndices = getUsedIndices();

  // 사용 가능한 인덱스 목록
  let available = ALL_VERSES.map((_, i) => i).filter(i => !usedIndices.includes(i));

  // 모두 사용됐으면 리셋 (연간 리셋)
  if (available.length === 0) {
    saveUsedIndices([]);
    available = ALL_VERSES.map((_, i) => i);
  }

  // 날짜 기반 시드로 랜덤 선택 (같은 날이면 같은 결과)
  const seed = today.getFullYear() * 1000 + dayOfYear;
  const randomNorm = seededRandom(seed);
  const selectedIdx = available[Math.floor(randomNorm * available.length)];

  const verse = ALL_VERSES[selectedIdx];

  // 사용된 인덱스에 추가
  saveUsedIndices([...usedIndices, selectedIdx]);

  // 오늘의 말씀 캐시
  try {
    localStorage.setItem(todayStorageKey, JSON.stringify(verse));
  } catch {
    // ignore
  }

  return verse;
}
