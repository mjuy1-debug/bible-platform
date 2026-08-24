// src/data/bibleDictionary.js
// 성경 영어 어휘 대사전 & 비동기 스마트 영한 사전 엔진

export const BIBLE_VOCABULARY = {
  // ── A ──
  'abide': { mean: '머무르다, 거하다', pos: '동사', phon: '[əˈbaɪd]', desc: '주님 안에 깊이 거하고 연합함을 뜻함 (요 15:4)' },
  'abound': { mean: '풍성하다, 넘치다', pos: '동사', phon: '[əˈbaʊnd]', desc: '하나님의 은혜가 넘치도록 풍성함' },
  'abundant': { mean: '풍성한, 넉넉한', pos: '형용사', phon: '[əˈbʌndənt]', desc: '더욱 풍성한 생명을 얻게 하심 (요 10:10)' },
  'afraid': { mean: '두려워하는', pos: '형용사', phon: '[əˈfreɪd]', desc: '두려워하지 말라 내가 너와 함께 함이라 (사 41:10)' },
  'almighty': { mean: '전능하신', pos: '형용사', phon: '[ɔːlˈmaɪti]', desc: '모든 것을 주관하시는 하나님의 전능하심 (엘 샤다이)' },
  'altar': { mean: '제단', pos: '명사', phon: '[ˈɔːltər]', desc: '하나님께 희생 제물을 바치며 예배하는 거룩한 단' },
  'angel': { mean: '천사, 사자', pos: '명사', phon: '[ˈeɪndʒl]', desc: '하나님의 뜻을 전하고 성도를 돕는 하늘의 사자' },
  'anoint': { mean: '기름을 붓다', pos: '동사', phon: '[əˈnɔɪnt]', desc: '성령의 임재와 특별한 왕/제사장/선지자 사명을 부여함' },
  'anointed': { mean: '기름 부음 받은 자 (메시아)', pos: '형용사/명사', phon: '[əˈnɔɪntɪd]', desc: '그리스도(메시아)를 가리킴' },
  'apostle': { mean: '사도', pos: '명사', phon: '[əˈpɑːsl]', desc: '예수 그리스도께 직접 보냄을 받은 12제자와 바울' },
  'ark': { mean: '방주, 언약궤', pos: '명사', phon: '[ɑːrk]', desc: '노아의 방주 또는 하나님의 임재를 상징하는 언약궤' },
  'armor': { mean: '갑옷, 전신갑주', pos: '명사', phon: '[ˈɑːrmər]', desc: '영적 전쟁에서 승리하기 위한 하나님의 전신갑주 (엡 6:11)' },
  'ascend': { mean: '올라가다, 승천하다', pos: '동사', phon: '[əˈsend]', desc: '예수님이 부활 후 하나님 보좌 우편으로 오르심' },
  'ask': { mean: '구하다, 청하다', pos: '동사', phon: '[æsk]', desc: '구하라 그리하면 너희에게 주실 것이요 (마 7:7)' },
  'assurance': { mean: '확신, 보증', pos: '명사', phon: '[əˈʃʊrəns]', desc: '구원과 하나님의 약속에 대한 흔들림 없는 믿음' },
  'astonished': { mean: '크게 놀란, 경탄한', pos: '형용사', phon: '[əˈstɑːnɪʃt]', desc: '예수님의 권세 있는 가르침과 기적에 경탄함' },
  'atonement': { mean: '속죄, 대속', pos: '명사', phon: '[əˈtoʊnmənt]', desc: '그리스도의 보혈로 죄를 덮고 하나님과 화목케 됨' },
  'authority': { mean: '권세, 권위', pos: '명사', phon: '[əˈθɔːrəti]', desc: '하늘과 땅의 모든 권세를 내게 주셨으니 (마 28:18)' },

  // ── B ──
  'baptize': { mean: '세례를 베풀다', pos: '동사', phon: '[ˈbæptaɪz]', desc: '그리스도와 함께 죽고 다시 살아남을 상징하는 거룩한 예식' },
  'baptism': { mean: '세례', pos: '명사', phon: '[ˈbæptɪzəm]', desc: '죄 씻음과 그리스도와의 연합' },
  'bear': { mean: '열매를 맺다, 견디다, 짊어지다', pos: '동사', phon: '[ber]', desc: '성령의 열매를 맺으며(Bear fruit), 십자가를 짊어짐' },
  'beginning': { mean: '태초, 시작', pos: '명사', phon: '[bɪˈɡɪnɪŋ]', desc: '창조의 위대한 시작 (창 1:1, 요 1:1)' },
  'begotten': { mean: '독생(獨生)한, 낳은', pos: '형용사', phon: '[bɪˈɡɑːtn]', desc: '하나님의 유일하신 독생자 (Only begotten Son)' },
  'behold': { mean: '보라, 주목하라', pos: '동사/감탄사', phon: '[bɪˈhoʊld]', desc: '중요한 하나님의 진리나 계시를 주목하게 함' },
  'believe': { mean: '믿다, 신뢰하다', pos: '동사', phon: '[bɪˈliːv]', desc: '예수 그리스도를 구주로 마음에 받아들임' },
  'believer': { mean: '성도, 믿는 자', pos: '명사', phon: '[bɪˈliːvər]', desc: '그리스도를 믿고 따르는 사람' },
  'beloved': { mean: '사랑하는, 총애를 받는', pos: '형용사/명사', phon: '[bɪˈlʌvɪd]', desc: '하나님의 극진한 사랑을 받는 자녀' },
  'blameless': { mean: '흠이 없는, 책망할 것 없는', pos: '형용사', phon: '[ˈbleɪmləs]', desc: '하나님 앞에서 의롭고 순결한 삶' },
  'bless': { mean: '축복하다, 은혜를 베풀다', pos: '동사', phon: '[bles]', desc: '하나님이 생명과 번성을 부어주심' },
  'blessed': { mean: '복 있는, 축복받은', pos: '형용사', phon: '[ˈblesɪd]', desc: '하나님의 은혜와 평강 안에 거하는 거룩한 행복 (시 1:1)' },
  'blessing': { mean: '복, 축복', pos: '명사', phon: '[ˈblesɪŋ]', desc: '하나님께로부터 임하는 모든 영육 간의 선물' },
  'blind': { mean: '눈먼, 맹인', pos: '형용사/명사', phon: '[blaɪnd]', desc: '육체적·영적 어둠에서 눈을 뜨게 하심' },
  'blood': { mean: '피, 보혈', pos: '명사', phon: '[blʌd]', desc: '죄 사함과 새 언약을 세우신 예수 그리스도의 보혈' },
  'boast': { mean: '자랑하다', pos: '동사/명사', phon: '[boʊst]', desc: '오직 십자가 외에는 결코 자랑할 것이 없음 (갈 6:14)' },
  'body': { mean: '몸, 그리스도의 몸(교회)', pos: '명사', phon: '[ˈbɑːdi]', desc: '성령이 거하시는 성전이자 교회의 지체' },
  'bondage': { mean: '속박, 종살이, 굴레', pos: '명사', phon: '[ˈbɑːndɪdʒ]', desc: '죄와 사망의 종노릇에서 해방됨' },
  'bow': { mean: '절하다, 엎드리다', pos: '동사', phon: '[baʊ]', desc: '모든 무릎이 예수의 이름에 꿇게 하심 (빌 2:10)' },
  'bread': { mean: '떡, 생명의 빵', pos: '명사', phon: '[bred]', desc: '하늘에서 내려온 생명의 떡이신 예수님 (요 6:35)' },
  'broken': { mean: '상한, 깨어진', pos: '형용사', phon: '[ˈbroʊkən]', desc: '하나님이 기뻐하시는 제사는 상한 심령이라 (시 51:17)' },
  'brother': { mean: '형제', pos: '명사', phon: '[ˈbrʌðər]', desc: '그리스도 안에서 한 피 받아 한 몸 이룬 믿음의 가족' },
  'burden': { mean: '짐, 고난', pos: '명사/동사', phon: '[ˈbɜːrdn]', desc: '수고하고 무거운 짐을 주께 맡김 (마 11:28)' },

  // ── C ──
  'call': { mean: '부르다, 소명하다', pos: '동사/명사', phon: '[kɔːl]', desc: '하나님의 은혜로운 부르심 (Calling)' },
  'calm': { mean: '잔잔한, 평온하게 하다', pos: '형용사/동사', phon: '[kɑːm]', desc: '바람과 바다를 꾸짖어 잔잔케 하심' },
  'captive': { mean: '포로 된 자', pos: '명사/형용사', phon: '[ˈkæptɪv]', desc: '포로 된 자에게 자유를 선포하심 (눅 4:18)' },
  'care': { mean: '돌보시다, 염려', pos: '동사/명사', phon: '[ker]', desc: '너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라 (벧전 5:7)' },
  'cast': { mean: '던지다, 맡기다', pos: '동사', phon: '[kæst]', desc: '모든 근심과 염려를 주님께 내어던짐' },
  'chosen': { mean: '택하심을 받은', pos: '형용사', phon: '[ˈtʃoʊzn]', desc: '너희는 택하신 족속이요 왕 같은 제사장들이요 (벧전 2:9)' },
  'christ': { mean: '그리스도 (기름 부음 받은 자)', pos: '명사', phon: '[kraɪst]', desc: '인류의 유일한 구원자 예수님' },
  'church': { mean: '교회 (에클레시아)', pos: '명사', phon: '[tʃɜːrtʃ]', desc: '세상에서 불러냄을 받은 성도들의 공동체' },
  'cleanse': { mean: '깨끗하게 하다, 정결케 하다', pos: '동사', phon: '[klenz]', desc: '그 아들 예수의 피가 우리를 모든 죄에서 깨끗하게 하실 것임' },
  'comfort': { mean: '위로하다, 안위', pos: '동사/명사', phon: '[ˈkʌmfərt]', desc: '모든 환난 중에서 우리를 위로하시는 위로의 하나님' },
  'command': { mean: '명령하다, 계명', pos: '동사/명사', phon: '[kəˈmænd]', desc: '하나님의 거룩한 말씀의 계명' },
  'commandment': { mean: '계명, 율법', pos: '명사', phon: '[kəˈmændmənt]', desc: '십계명과 하나님 사랑, 이웃 사랑의 대계명' },
  'compassion': { mean: '긍휼, 자비, 측은히 여김', pos: '명사', phon: '[kəmˈpæʃn]', desc: '고통받는 영혼을 향한 예수님의 애틋한 사랑' },
  'condemn': { mean: '정죄하다, 유죄를 선고하다', pos: '동사', phon: '[kənˈdem]', desc: '그리스도 예수 안에 있는 자에게는 결코 정죄함이 없음' },
  'condemnation': { mean: '정죄, 심판', pos: '명사', phon: '[ˌkɑːndemˈneɪʃn]', desc: '죄에 대한 형벌과 선고' },
  'confess': { mean: '자백하다, 시인하다', pos: '동사', phon: '[kənˈfes]', desc: '죄를 털어놓고 예수를 주님으로 고백함 (요일 1:9, 롬 10:9)' },
  'confidence': { mean: '확신, 담대함', pos: '명사', phon: '[ˈkɑːnfɪdəns]', desc: '은혜의 보좌 앞에 담대히 나아가는 믿음 (히 4:16)' },
  'conquer': { mean: '정복하다, 이기다', pos: '동사', phon: '[ˈkɑːŋkər]', desc: '우리를 사랑하시는 이로 말미암아 우리가 넉넉히 이기느니라 (롬 8:37)' },
  'consecrate': { mean: '성별하다, 거룩히 구별하다', pos: '동사', phon: '[ˈkɑːnsɪkreɪt]', desc: '하나님께 온전히 헌신하여 바침' },
  'counsel': { mean: '권고, 모략, 조언', pos: '명사/동사', phon: '[ˈkaʊnsl]', desc: '기묘자라, 모사라 (Wonderful Counselor - 사 9:6)' },
  'courage': { mean: '용기, 담대함', pos: '명사', phon: '[ˈkɜːrɪdʒ]', desc: '강하고 담대하라 두려워하지 말라 (수 1:9)' },
  'covenant': { mean: '언약, 계약', pos: '명사', phon: '[ˈkʌvənənt]', desc: '하나님이 자기 백성과 맺으신 불변의 거룩한 약속' },
  'create': { mean: '창조하다', pos: '동사', phon: '[kriˈeɪt]', desc: '무(無)에서 유(有)를 만드신 하나님의 바라(Bara) 역사' },
  'created': { mean: '창조된, 창조하셨다', pos: '동사(과거)/형용사', phon: '[kriˈeɪtɪd]', desc: '태초에 하나님이 천지를 창조하시니라 (창 1:1)' },
  'creation': { mean: '창조, 피조물', pos: '명사', phon: '[kriˈeɪʃn]', desc: '하나님이 지으신 온 우주 만물' },
  'creature': { mean: '피조물, 생물', pos: '명사', phon: '[ˈkriːtʃər]', desc: '그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 (고후 5:17)' },
  'cross': { mean: '십자가', pos: '명사', phon: '[krɔːs]', desc: '인류의 모든 죄를 대속하신 희생과 사랑의 상징' },
  'crown': { mean: '면류관, 왕관', pos: '명사', phon: '[kraʊn]', desc: '충성된 자에게 주시는 생명의 면류관, 의의 면류관' },
  'crucify': { mean: '십자가에 못 박다', pos: '동사', phon: '[ˈkruːsɪfaɪ]', desc: '내가 그리스도와 함께 십자가에 못 박혔나니 (갈 2:20)' },

  // ── D ──
  'darkness': { mean: '어둠, 흑암', pos: '명사', phon: '[ˈdɑːrknəs]', desc: '빛이 어둠에 비치되 어둠이 깨닫지 못하더라 (요 1:5)' },
  'day': { mean: '날, 낮, 주의 날', pos: '명사', phon: '[deɪ]', desc: '빛을 낮이라 칭하시고 (창 1:5)' },
  'death': { mean: '죽음, 사망', pos: '명사', phon: '[deθ]', desc: '사망의 음침한 골짜기를 다닐지라도 해를 두려워하지 않음' },
  'declare': { mean: '선포하다, 밝히 알리다', pos: '동사', phon: '[dɪˈkler]', desc: '하늘이 하나님의 영광을 선포하고 (시 19:1)' },
  'decree': { mean: '규례, 칙령, 명령', pos: '명사/동사', phon: '[dɪˈkriː]', desc: '변치 않는 하나님의 주권적 명령' },
  'deep': { mean: '깊음, 깊은 곳', pos: '형용사/명사', phon: '[diːp]', desc: '흑암이 깊음 위에 있고 (창 1:2)' },
  'deliver': { mean: '구원하다, 건져내다', pos: '동사', phon: '[dɪˈlɪvər]', desc: '다만 악에서 구하옵소서 (마 6:13)' },
  'deliverance': { mean: '구원, 해방', pos: '명사', phon: '[dɪˈlɪvərəns]', desc: '원수의 손과 억압에서 풀어주심' },
  'disciple': { mean: '제자', pos: '명사', phon: '[dɪˈsaɪpl]', desc: '스승이신 예수님을 따르며 삶을 배우는 자' },
  'discipline': { mean: '징계, 훈련', pos: '명사/동사', phon: '[ˈdɪsəplɪn]', desc: '사랑하시는 자를 징계하사 거룩함에 참예케 하심' },
  'divide': { mean: '나누다, 가르다', pos: '동사', phon: '[dɪˈvaɪd]', desc: '빛과 어둠을 나누사 (창 1:4)' },
  'dove': { mean: '비둘기', pos: '명사', phon: '[dʌv]', desc: '성령의 평화롭고 순결한 임재의 상징' },
  'dwelling': { mean: '처소, 거처', pos: '명사', phon: '[ˈdwelɪŋ]', desc: '하나님이 거하시는 거룩한 성전' },

  // ── E ──
  'earth': { mean: '땅, 세상, 지구', pos: '명사', phon: '[ɜːrθ]', desc: '하나님이 창조하신 땅 (창 1:1), 온 땅이여 여호와를 찬양하라' },
  'empty': { mean: '비어 있는, 공허한', pos: '형용사', phon: '[ˈempti]', desc: '땅이 혼돈하고 공허하며 (창 1:2)' },
  'endure': { mean: '견디다, 참다, 영구하다', pos: '동사', phon: '[ɪnˈdʊr]', desc: '그 인자하심이 영원함이로다 (His love endures forever)' },
  'enemy': { mean: '원수, 대적', pos: '명사', phon: '[ˈenəmi]', desc: '너희 원수를 사랑하며 너희를 핍박하는 자를 위해 기도하라' },
  'eternal': { mean: '영원한', pos: '형용사', phon: '[ɪˈtɜːrnl]', desc: '영생(Eternal Life)과 영원하신 하나님' },
  'everlasting': { mean: '영원한, 무궁한', pos: '형용사', phon: '[ˌevərˈlæstɪŋ]', desc: '영원하신 팔이 네 아래에 있도다 (신 33:27)' },
  'evil': { mean: '악, 악한', pos: '명사/형용사', phon: '[ˈiːvl]', desc: '악에게 지지 말고 선으로 악을 이기라 (롬 12:21)' },
  'exalt': { mean: '높이다, 찬양하다', pos: '동사', phon: '[ɪɡˈzɔːlt]', desc: '스스로를 낮추는 자는 높아지리라' },

  // ── F ──
  'faith': { mean: '믿음, 신앙', pos: '명사', phon: '[feɪθ]', desc: '바라는 것들의 실상이요 보이지 않는 것들의 증거 (히 11:1)' },
  'faithful': { mean: '신실한, 충성된', pos: '형용사', phon: '[ˈfeɪθfl]', desc: '미쁘시다(신실하시다) 우리 하나님은 (God is faithful)' },
  'faithfulness': { mean: '신실하심, 성실', pos: '명사', phon: '[ˈfeɪθflnəs]', desc: '주의 성실하심이 아침마다 새로우니 (애 3:23)' },
  'father': { mean: '아버지, 하나님 아버지', pos: '명사', phon: '[ˈfɑːðər]', desc: '하늘에 계신 우리 아버지 (마 6:9)' },
  'fear': { mean: '경외하다, 두려워하다', pos: '동사/명사', phon: '[fɪr]', desc: '여호와를 경외함이 지혜의 근본이라 (잠 9:10)' },
  'fellowship': { mean: '교제, 성도의 사귐', pos: '명사', phon: '[ˈfeloʊʃɪp]', desc: '성령 안에서 나누는 성도의 거룩한 연합' },
  'fill': { mean: '채우다, 충만케 하다', pos: '동사', phon: '[fɪl]', desc: '오직 성령으로 충만함을 받으라 (엡 5:18)' },
  'flesh': { mean: '육체, 육신', pos: '명사', phon: '[fleʃ]', desc: '말씀이 육신이 되어 우리 가운데 거하시매 (요 1:14)' },
  'flock': { mean: '양 떼, 무리', pos: '명사', phon: '[flɑːk]', desc: '우리는 그의 기르시는 양이요 그의 백성이로다' },
  'forgive': { mean: '용서하다, 사하다', pos: '동사', phon: '[fərˈɡɪv]', desc: '우리가 우리에게 죄 지은 자를 사하여 준 것 같이' },
  'forgiveness': { mean: '용서, 죄 사함', pos: '명사', phon: '[fərˈɡɪvnəs]', desc: '그리스도의 피로 말미암은 완전한 속죄' },
  'formless': { mean: '모양이 없는, 혼돈된', pos: '형용사', phon: '[ˈfɔːrmləs]', desc: '땅이 혼돈하고(formless) 공허하며 (창 1:2)' },
  'foundation': { mean: '터, 기초, 반석', pos: '명사', phon: '[faʊnˈdeɪʃn]', desc: '반석 위에 세운 굳건한 집' },
  'fruit': { mean: '열매, 결실', pos: '명사', phon: '[fruːt]', desc: '오직 성령의 열매는 사랑과 희락과 화평과... (갈 5:22)' },

  // ── G ──
  'gather': { mean: '모으다, 모이다', pos: '동사', phon: '[ˈɡæðər]', desc: '두세 사람이 내 이름으로 모인 곳에 (마 18:20)' },
  'gentle': { mean: '온유한, 부드러운', pos: '형용사', phon: '[ˈdʒentl]', desc: '나는 마음이 온유하고 겸손하니 (마 11:29)' },
  'gift': { mean: '은사, 선물', pos: '명사', phon: '[ɡɪft]', desc: '구원은 하나님의 값없는 선물이라 (엡 2:8)' },
  'glorify': { mean: '영광을 돌리다', pos: '동사', phon: '[ˈɡlɔːrɪfaɪ]', desc: '먹든지 마시든지 다 하나님의 영광을 위하여 하라' },
  'glory': { mean: '영광', pos: '명사', phon: '[ˈɡlɔːri]', desc: '하나님의 찬란한 위엄과 거룩한 광채' },
  'god': { mean: '하나님', pos: '명사', phon: '[ɡɑːd]', desc: '천지를 창조하시고 우리를 구원하시는 유일하신 참 신' },
  'good': { mean: '좋은, 선하신, 보시기에 좋았더라', pos: '형용사', phon: '[ɡʊd]', desc: '하나님이 보시기에 심히 좋았더라 (창 1:31)' },
  'goodness': { mean: '선하심, 인자하심', pos: '명사', phon: '[ˈɡʊdnəs]', desc: '여호와의 선하심을 맛보아 알지어다' },
  'gospel': { mean: '복음, 기쁜 소식', pos: '명사', phon: '[ˈɡɑːspl]', desc: '예수 그리스도를 통한 인류 구원의 복된 소식' },
  'grace': { mean: '은혜 (자격 없는 자에게 주시는 선물)', pos: '명사', phon: '[ɡreɪs]', desc: '너희는 그 은혜에 의하여 믿음으로 구원을 받았으니 (엡 2:8)' },
  'gracious': { mean: '은혜로우신, 자비로운', pos: '형용사', phon: '[ˈɡreɪʃəs]', desc: '여호와는 은혜로우시며 자비로우시도다' },
  'guide': { mean: '인도하다, 안내자', pos: '동사/명사', phon: '[ɡaɪd]', desc: '주의 진리로 나를 지도하시고 가르치소서' },

  // ── H ──
  'heal': { mean: '고치다, 치료하다', pos: '동사', phon: '[hiːl]', desc: '그가 채찍에 맞음으로 우리는 나음을 받았도다 (사 53:5)' },
  'hear': { mean: '듣다, 청종하다', pos: '동사', phon: '[hɪr]', desc: '이스라엘아 들으라 (쉐마 - 신 6:4)' },
  'heart': { mean: '마음, 심령, 중심', pos: '명사', phon: '[hɑːrt]', desc: '무릇 지킬만한 것보다 더욱 네 마음을 지키라 (잠 4:23)' },
  'heaven': { mean: '하늘, 천국', pos: '명사', phon: '[ˈhevn]', desc: '하나님의 보좌가 있는 거룩한 하늘' },
  'heavens': { mean: '하늘들, 우주', pos: '명사(복수)', phon: '[ˈhevnz]', desc: '태초에 하나님이 천지(the heavens and the earth)를 창조하시니라' },
  'helper': { mean: '돕는 자, 보혜사', pos: '명사', phon: '[ˈhelpər]', desc: '진리의 성령, 보혜사 (The Counselor/Helper)' },
  'holiness': { mean: '거룩함, 성결', pos: '명사', phon: '[ˈhoʊlinəs]', desc: '내가 거룩하니 너희도 거룩할지어다 (레 11:45)' },
  'holy': { mean: '거룩한, 성스러운', pos: '형용사', phon: '[ˈhoʊli]', desc: '성령(Holy Spirit), 거룩한 성전' },
  'hope': { mean: '소망, 희망, 바라다', pos: '명사/동사', phon: '[hoʊp]', desc: '너는 하나님께 소망을 두라 (시 42:5)' },
  'hover': { mean: '운행하다, 맴돌다', pos: '동사', phon: '[ˈhʌvər]', desc: '하나님의 영은 수면 위에 운행하시니라 (창 1:2)' },
  'hovering': { mean: '운행하시는, 감싸 도는', pos: '동사(현재분사)', phon: '[ˈhʌvərɪŋ]', desc: '성령이 깊은 물 위를 품고 계심' },
  'humble': { mean: '겸손한, 낮추다', pos: '형용사/동사', phon: '[ˈhʌmbl]', desc: '하나님은 교만한 자를 대적하시되 겸손한 자에게 은혜를 주심' },

  // ── I, J, K ──
  'image': { mean: '형상, 모습', pos: '명사', phon: '[ˈɪmɪdʒ]', desc: '하나님의 형상대로 사람을 창조하시되 (창 1:27)' },
  'increase': { mean: '번성하다, 자라나다', pos: '동사/명사', phon: '[ɪnˈkriːs]', desc: '생육하고 번성하여 땅에 충만하라 (창 1:28)' },
  'inheritance': { mean: '기업, 유업', pos: '명사', phon: '[ɪnˈherɪtəns]', desc: '하늘에 간직하신 썩지 않고 쇠하지 않는 유업' },
  'jesus': { mean: '예수 (자기 백성을 죄에서 구원할 자)', pos: '명사', phon: '[ˈdʒiːzəs]', desc: '우리의 구주이자 주님이신 예수 그리스도' },
  'joy': { mean: '기쁨, 희락', pos: '명사', phon: '[dʒɔɪ]', desc: '주 안에서 항상 기뻐하라 (빌 4:4)' },
  'judge': { mean: '심판하다, 재판장', pos: '동사/명사', phon: '[dʒʌdʒ]', desc: '의로우신 재판장이신 하나님' },
  'judgment': { mean: '심판, 판결', pos: '명사', phon: '[ˈdʒʌdʒmənt]', desc: '공의로운 하나님의 최종 심판' },
  'justice': { mean: '공의, 정의', pos: '명사', phon: '[ˈdʒʌstɪs]', desc: '오직 정의를 물 같이, 공의를 마르지 않는 강 같이 (암 5:24)' },
  'justification': { mean: '칭의 (의롭다 하심)', pos: '명사', phon: '[ˌdʒʌstɪfɪˈkeɪʃn]', desc: '예수 그리스도를 믿음으로 의롭다고 인정받음' },
  'king': { mean: '왕, 군왕', pos: '명사', phon: '[kɪŋ]', desc: '만왕의 왕이신 예수 그리스도' },
  'kingdom': { mean: '하나님 나라, 왕국', pos: '명사', phon: '[ˈkɪŋdəm]', desc: '하나님의 통치와 의와 평강이 다스리는 나라' },

  // ── L ──
  'lamb': { mean: '어린 양', pos: '명사', phon: '[læm]', desc: '세상 죄를 지고 가는 하나님의 어린 양 (요 1:29)' },
  'lamp': { mean: '등불, 등', pos: '명사', phon: '[læmp]', desc: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시 119:105)' },
  'law': { mean: '율법, 법', pos: '명사', phon: '[lɔː]', desc: '하나님의 거룩하신 뜻을 담은 계명' },
  'lead': { mean: '인도하다, 이끄시다', pos: '동사', phon: '[liːd]', desc: '푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다' },
  'life': { mean: '생명, 삶, 영생', pos: '명사', phon: '[laɪf]', desc: '내가 곧 길이요 진리요 생명이니 (요 14:6)' },
  'light': { mean: '빛', pos: '명사/형용사', phon: '[laɪt]', desc: '빛이 있으라 하시매 빛이 있었고 (창 1:3)' },
  'likeness': { mean: '모양, 닮음', pos: '명사', phon: '[ˈlaɪknəs]', desc: '우리의 형상을 따라 우리의 모양대로 (창 1:26)' },
  'lord': { mean: '주(主), 여호와', pos: '명사', phon: '[lɔːrd]', desc: '만유의 주인이시며 구원자이신 하나님/예수님' },
  'love': { mean: '사랑, 아가페', pos: '명사/동사', phon: '[lʌv]', desc: '하나님은 사랑이시라 (God is love - 요일 4:8)' },
  'lovingkindness': { mean: '인애, 인자하심, 헤세드', pos: '명사', phon: '[ˈlʌvɪŋˈkaɪndnəs]', desc: '변치 않는 하나님의 언약적 자비와 긍휼' },

  // ── M, N, O ──
  'mercy': { mean: '자비, 긍휼', pos: '명사', phon: '[ˈmɜːrsi]', desc: '형벌을 면제하시고 품어주시는 하나님의 은혜' },
  'mighty': { mean: '능력 있는, 강하신', pos: '형용사', phon: '[ˈmaɪti]', desc: '전능하신 하나님 (Mighty God)' },
  'morning': { mean: '아침', pos: '명사', phon: '[ˈmɔːrnɪŋ]', desc: '저녁이 되고 아침이 되니 이는 첫째 날이니라 (창 1:5)' },
  'name': { mean: '이름, 권세', pos: '명사', phon: '[neɪm]', desc: '예수 그리스도의 이름의 권세' },
  'night': { mean: '밤, 어둠', pos: '명사', phon: '[naɪt]', desc: '어두움을 밤이라 칭하시니라 (창 1:5)' },
  'obey': { mean: '순종하다, 따르다', pos: '동사', phon: '[əˈbeɪ]', desc: '순종이 제사보다 낫고 (삼상 15:22)' },
  'offering': { mean: '제물, 헌금, 제사', pos: '명사', phon: '[ˈɔːfərɪŋ]', desc: '하나님께 향기로운 제물로 바쳐짐' },
  'overcome': { mean: '이기다, 극복하다', pos: '동사', phon: '[ˌoʊvərˈkʌm]', desc: '세상에서는 너희가 환난을 당하나 담대하라 내가 세상을 이기었노라 (요 16:33)' },

  // ── P, Q, R ──
  'path': { mean: '길, 첩경, 행로', pos: '명사', phon: '[pæθ]', desc: '내 길에 빛이니이다 (시 119:105)' },
  'peace': { mean: '평강, 평안 (샬롬)', pos: '명사', phon: '[piːs]', desc: '평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 (요 14:27)' },
  'perish': { mean: '멸망하다, 쇠잔하다', pos: '동사', phon: '[ˈperɪʃ]', desc: '저를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라 (요 3:16)' },
  'power': { mean: '능력, 권능', pos: '명사', phon: '[ˈpaʊər]', desc: '오직 성령이 너희에게 임하시면 너희가 권능을 받고 (행 1:8)' },
  'praise': { mean: '찬양하다, 송축', pos: '동사/명사', phon: '[preɪz]', desc: '호흡이 있는 자마다 여호와를 찬양할지어다 (시 150:6)' },
  'pray': { mean: '기도하다, 간구하다', pos: '동사', phon: '[preɪ]', desc: '쉬지 말고 기도하라 (살전 5:17)' },
  'prayer': { mean: '기도', pos: '명사', phon: '[prer]', desc: '하나님 아버지와의 거룩한 호흡이자 대화' },
  'promise': { mean: '약속, 언약', pos: '명사/동사', phon: '[ˈprɑːmɪs]', desc: '신실하게 성취하시는 하나님의 약속' },
  'pure': { mean: '순결한, 정결한', pos: '형용사', phon: '[pjʊr]', desc: '마음이 청결한 자는 복이 있나니 저희가 하나님을 볼 것임이요 (마 5:8)' },
  'redeem': { mean: '구속하다, 값을 치르고 사다', pos: '동사', phon: '[rɪˈdiːm]', desc: '예수님의 피값으로 우리를 죄에서 사심' },
  'redemption': { mean: '구속, 대속', pos: '명사', phon: '[rɪˈdempʃn]', desc: '죄의 종 되었던 우리를 해방하심' },
  'rejoice': { mean: '기뻐하다, 즐거워하다', pos: '동사', phon: '[rɪˈdʒɔɪs]', desc: '주 안에서 항상 기뻐하라 (살전 5:16)' },
  'repent': { mean: '회개하다, 뉘우치다', pos: '동사', phon: '[rɪˈpent]', desc: '회개하라 천국이 가까이 왔느니라 (마 4:17)' },
  'repentance': { mean: '회개', pos: '명사', phon: '[rɪˈpentəns]', desc: '죄의 길에서 돌이켜 하나님께로 향함' },
  'rest': { mean: '안식, 쉼, 쉬다', pos: '명사/동사', phon: '[rest]', desc: '일곱째 날에 안식하시니라 (창 2:2), 수고하고 무거운 짐진 자들아 다 내게로 오라' },
  'resurrection': { mean: '부활', pos: '명사', phon: '[ˌrezəˈrekʃn]', desc: '사망 권세를 깨뜨리고 다시 살아나신 승리' },
  'righteous': { mean: '의로운, 의인', pos: '형용사/명사', phon: '[ˈraɪtʃəs]', desc: '의인은 믿음으로 말미암아 살리라 (롬 1:17)' },
  'righteousness': { mean: '의(義), 하나님의 공의', pos: '명사', phon: '[ˈraɪtʃəsnəs]', desc: '하나님의 거룩한 기준에 합당한 온전한 의' },

  // ── S ──
  'salvation': { mean: '구원', pos: '명사', phon: '[sælˈveɪʃn]', desc: '죄와 사망에서 건짐 받아 누리는 영원한 생명' },
  'sanctification': { mean: '성화 (거룩해짐)', pos: '명사', phon: '[ˌsæŋktɪfɪˈkeɪʃn]', desc: '예수 그리스도를 닮아 거룩해져 가는 평생의 과정' },
  'save': { mean: '구원하다, 건지다', pos: '동사', phon: '[seɪv]', desc: '주 예수를 믿으라 그리하면 너와 네 집이 구원을 받으리라 (행 16:31)' },
  'savior': { mean: '구주, 구원자', pos: '명사', phon: '[ˈseɪvjər]', desc: '온 세상의 구주 예수 그리스도' },
  'scripture': { mean: '성경, 거룩한 말씀', pos: '명사', phon: '[ˈskrɪptʃər]', desc: '모든 성경은 하나님의 감동으로 된 것으로 (딤후 3:16)' },
  'sea': { mean: '바다', pos: '명사', phon: '[siː]', desc: '모인 물을 바다라 칭하시니라 (창 1:10)' },
  'seek': { mean: '찾다, 구하다', pos: '동사', phon: '[siːk]', desc: '너희는 먼저 그의 나라와 그의 의를 구하라 (마 6:33)' },
  'separate': { mean: '나누다, 구별하다', pos: '동사', phon: '[ˈsepəreɪt]', desc: '빛과 어둠을 나누사 (창 1:4)' },
  'servant': { mean: '종, 사역자', pos: '명사', phon: '[ˈsɜːrvənt]', desc: '착하고 충성된 종아 (마 25:21)' },
  'serve': { mean: '섬기다, 예배하다', pos: '동사', phon: '[sɜːrv]', desc: '오직 나와 내 집은 여호와를 섬기겠노라 (수 24:15)' },
  'shepherd': { mean: '목자', pos: '명사', phon: '[ˈʃepərd]', desc: '여호와는 나의 목자시니 내게 부족함이 없으리로다 (시 23:1)' },
  'sin': { mean: '죄', pos: '명사/동사', phon: '[sɪn]', desc: '모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니 (롬 3:23)' },
  'son': { mean: '아들, 독생자', pos: '명사', phon: '[sʌn]', desc: '하나님의 아들 예수 그리스도' },
  'soul': { mean: '영혼, 심령', pos: '명사', phon: '[soʊl]', desc: '내 영혼을 소생시키시고 (시 23:3)' },
  'spirit': { mean: '영, 성령, 마음', pos: '명사', phon: '[ˈspɪrɪt]', desc: '하나님의 영(성령)은 수면 위에 운행하시니라 (창 1:2)' },
  'strength': { mean: '힘, 능력', pos: '명사', phon: '[streŋθ]', desc: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라 (빌 4:13)' },
  'strengthen': { mean: '강하게 하다, 굳세게 하다', pos: '동사', phon: '[ˈstreŋθn]', desc: '내가 너를 굳세게 하리라 참으로 너를 도와주리라 (사 41:10)' },
  'surface': { mean: '수면, 표면', pos: '명사', phon: '[ˈsɜːrfɪs]', desc: '깊음의 표면 위에 (창 1:2)' },

  // ── T, U, V, W ──
  'temple': { mean: '성전', pos: '명사', phon: '[ˈtempl]', desc: '하나님이 거하시는 거룩한 처소이자 성도의 몸' },
  'testimony': { mean: '증거, 간증', pos: '명사', phon: '[ˈtestɪmoʊni]', desc: '예수 그리스도를 증거함' },
  'thanks': { mean: '감사', pos: '명사', phon: '[θæŋks]', desc: '범사에 감사하라 (살전 5:18)' },
  'throne': { mean: '보좌', pos: '명사', phon: '[θroʊn]', desc: '하나님의 거룩한 은혜의 보좌' },
  'transgression': { mean: '허물, 과오, 범죄', pos: '명사', phon: '[trænzˈɡreʃn]', desc: '그가 찔림은 우리의 허물을 인함이요 (사 53:5)' },
  'trust': { mean: '신뢰하다, 의지하다', pos: '동사/명사', phon: '[trʌst]', desc: '너는 마음을 다하여 여호와를 신뢰하라 (잠 3:5)' },
  'truth': { mean: '진리, 진실', pos: '명사', phon: '[truːθ]', desc: '진리를 알지니 진리가 너희를 자유롭게 하리라 (요 8:32)' },
  'victory': { mean: '승리', pos: '명사', phon: '[ˈvɪktəri]', desc: '우리 주 예수 그리스도로 말미암아 우리에게 승리를 주시는 하나님 (고전 15:57)' },
  'walk': { mean: '동행하다, 행하다', pos: '동사', phon: '[wɔːk]', desc: '에녹이 하나님과 동행하더니 (창 5:24)' },
  'water': { mean: '물, 생수', pos: '명사', phon: '[ˈwɔːtər]', desc: '내가 주는 물을 마시는 자는 영원히 목마르지 아니하리니 (요 4:14)' },
  'waters': { mean: '물들, 수면', pos: '명사(복수)', phon: '[ˈwɔːtərz]', desc: '하나님의 신은 수면에 운행하시니라 (창 1:2)' },
  'way': { mean: '길, 도(道)', pos: '명사', phon: '[weɪ]', desc: '내가 곧 길이요 진리요 생명이니 (요 14:6)' },
  'wisdom': { mean: '지혜', pos: '명사', phon: '[ˈwɪzdəm]', desc: '여호와를 경외하는 것이 지혜의 근본이요 (잠 9:10)' },
  'word': { mean: '말씀, 로고스', pos: '명사', phon: '[wɜːrd]', desc: '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 (요 1:1)' },
  'worship': { mean: '예배하다, 경배', pos: '동사/명사', phon: '[ˈwɜːrʃɪp]', desc: '아버지께 참되게 예배하는 자들은 영과 진리로 예배할 때가 오나니 (요 4:23)' }
};

/**
 * 텍스트에서 단어를 정제하고 오프라인 사전에 매칭
 */
export function lookupBibleWord(word) {
  if (!word) return null;
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return null;

  // 1. 직접 일치
  if (BIBLE_VOCABULARY[clean]) {
    return { word: clean, ...BIBLE_VOCABULARY[clean] };
  }
  
  // 2. 복수형 stem (-s, -es, -ies)
  if (clean.endsWith('ies') && BIBLE_VOCABULARY[clean.slice(0, -3) + 'y']) {
    return { word: clean, ...BIBLE_VOCABULARY[clean.slice(0, -3) + 'y'] };
  }
  if (clean.endsWith('es') && BIBLE_VOCABULARY[clean.slice(0, -2)]) {
    return { word: clean, ...BIBLE_VOCABULARY[clean.slice(0, -2)] };
  }
  if (clean.endsWith('s') && BIBLE_VOCABULARY[clean.slice(0, -1)]) {
    return { word: clean, ...BIBLE_VOCABULARY[clean.slice(0, -1)] };
  }

  // 3. 과거형 stem (-ed, -d)
  if (clean.endsWith('ed') && BIBLE_VOCABULARY[clean.slice(0, -2)]) {
    return { word: clean, ...BIBLE_VOCABULARY[clean.slice(0, -2)] };
  }
  if (clean.endsWith('d') && BIBLE_VOCABULARY[clean.slice(0, -1)]) {
    return { word: clean, ...BIBLE_VOCABULARY[clean.slice(0, -1)] };
  }

  // 4. 진행형 stem (-ing)
  if (clean.endsWith('ing') && BIBLE_VOCABULARY[clean.slice(0, -3)]) {
    return { word: clean, ...BIBLE_VOCABULARY[clean.slice(0, -3)] };
  }
  if (clean.endsWith('ing') && BIBLE_VOCABULARY[clean.slice(0, -3) + 'e']) {
    return { word: clean, ...BIBLE_VOCABULARY[clean.slice(0, -3) + 'e'] };
  }

  return null;
}

/**
 * 실시간 스마트 영한 사전 조회 (오프라인 사전 + 온라인 번역 API 폴백)
 */
export async function lookupWordSmart(rawWord) {
  const offlineMatch = lookupBibleWord(rawWord);
  if (offlineMatch) {
    return offlineMatch;
  }

  const clean = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return null;

  try {
    // 무료 오픈 사전/번역 API를 통해 단어 뜻 조회 (1초 타임아웃)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|ko`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && translated.toLowerCase() !== clean) {
        return {
          word: clean,
          mean: translated,
          pos: '어휘',
          phon: `[${clean}]`,
          desc: `영어 성경 본문에 등장하는 단어입니다.`
        };
      }
    }
  } catch (err) {
    // API 실패 시 기본 객체 반환
  }

  return {
    word: clean,
    mean: '성경 본문 단어',
    pos: '어휘',
    phon: `[${clean}]`,
    desc: `영어 성경 본문 어휘입니다.`
  };
}
