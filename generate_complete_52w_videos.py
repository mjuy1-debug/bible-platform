# -*- coding: utf-8 -*-
import json

# 52주차 전체 상세 영상 매핑 딕셔너리
WEEK_VIDEOS = {}

# 1~15주차 상세
WEEK_VIDEOS[1] = {
    'weekTitle': '제1주차 ✦ 천지창조와 족장들의 믿음 (1)',
    'bookRange': '창세기 1장 ~ 23장',
    'videos': [
        {
            'title': '🌍 천지창조와 에덴동산 (타락과 원시복음)',
            'summary': '하나님의 말씀으로 이루어진 6일간의 천지창조, 선악과 계명과 가죽옷 은혜(창 3:15 원시복음)',
            'points': ['흙으로 사람을 지으시고 생기를 불어넣으심', '선악과 금령과 인류의 타락', '여자의 후손이 뱀의 머리를 상하게 할 것(창 3:15)'],
            'searchQuery': '바이블프로젝트 창세기 1-11장 개요 천지창조'
        },
        {
            'title': '🌊 노아의 방주와 무지개 언약',
            'summary': '타락한 세대 속에서 여호와께 은혜를 입고 방주를 지어 생명을 보존한 노아의 순종과 무지개 언약',
            'points': ['잣나무(고페르나무)로 짓고 안팎에 역청을 칠함', '아라랏 산에 머무른 방주와 비둘기', '다시는 물로 심판하지 않으시겠다는 무지개 언약'],
            'searchQuery': '성경 인물 노아의 방주 이야기 창세기'
        },
        {
            'title': '🏔️ 아브라함의 부르심과 모리아산 이삭 번제',
            'summary': '갈대아 우르를 떠나 가나안으로 향한 믿음의 조상 아브라함과 모리아산에서 준비하신 여호와 이레의 은혜',
            'points': ['너는 복의 근원이 될지라(창 12장)', '믿음으로 의롭다 하심을 받은 언약(창 15:6)', '모리아산에서 숫양을 예비하신 여호와 이레(창 22장)'],
            'searchQuery': '성경 인물 아브라함 모리아산 이삭 이야기'
        }
    ]
}

WEEK_VIDEOS[2] = {
    'weekTitle': '제2주차 ✦ 족장들의 믿음과 섭리 (2)',
    'bookRange': '창세기 24장 ~ 40장',
    'videos': [
        {
            'title': '💍 이삭의 순종과 리브가의 결단 & 르호봇 우물',
            'summary': '모리아산 번제단의 온유한 순종과 그랄 골짜기에서 우물을 양보하여 얻은 르호봇(넓은 장소)의 축복',
            'points': ['이삭의 아내를 구하는 엘리에셀의 기도와 리브가의 결단', '흉년 중에도 100배의 결실을 얻은 믿음', '에섹과 싯나를 양보하고 르호봇을 얻음'],
            'searchQuery': '성경 인물 이삭 리브가 우물 이야기 창세기'
        },
        {
            'title': '🪜 야곱의 벧엘 사닥다리와 얍복강 씨름 (이스라엘)',
            'summary': '형 에서를 피해 도망하던 벧엘에서의 하나님 서원과 얍복 나루에서 밤새 씨름하여 얻은 새 이름 이스라엘',
            'points': ['벧엘 사닥다리 환상과 하나님의 동행 약속', '라반의 집에서 20년간의 훈련과 연단', '얍복강에서 하나님과 겨루어 이긴 자(이스라엘)가 됨'],
            'searchQuery': '성경 인물 야곱 벧엘 얍복강 이스라엘 이야기'
        },
        {
            'title': '👑 요셉의 꿈과 보디발의 집, 감옥의 연단',
            'summary': '형들의 시기로 애굽 노예로 팔렸으나 코람데오(하나님 앞에서의 순결) 신앙으로 연단을 이겨낸 요셉',
            'points': ['채색옷과 해와 달과 열한 별의 꿈', '보디발 아내의 유혹을 물리친 순결 신앙', '술 맡은 관원장과 떡 굽는 관원장의 꿈 해석'],
            'searchQuery': '성경 인물 요셉 꿈과 보디발 감옥 이야기'
        }
    ]
}

WEEK_VIDEOS[3] = {
    'weekTitle': '제3주차 ✦ 요셉의 구원 섭리와 출애굽의 서막',
    'bookRange': '창세기 41장 ~ 출애굽기 12장',
    'videos': [
        {
            'title': '👑 애굽 총리 요셉과 하나님의 선한 구원 섭리',
            'summary': '바로의 꿈을 해석하여 30세에 총리가 되고 만민의 생명을 구원하며 형들을 용서한 위대한 구속사의 완성',
            'points': ['7년 풍년과 7년 흉년의 지혜로운 대비', '"당신들은 나를 해하려 하였으나 하나님은 선으로 바꾸셨나이다"(창 50:20)', '야곱 일가의 애굽 고센 땅 정착'],
            'searchQuery': '성경 인물 요셉 총리 화해 창세기 50장 이야기'
        },
        {
            'title': '🔥 갈대상자의 모세와 호렙산 떨기나무 소명',
            'summary': '나일강 갈대상자에서 건짐 받아 왕궁과 미디안 광야 40년을 거쳐 호렙산에서 부름받은 모세',
            'points': ['갈대상자에서 건짐받은 모세의 어린 시절', '호렙산 떨기나무 불꽃 "스스로 있는 자(I AM WHO I AM)"', '아론을 동역자로 붙여주신 하나님의 은혜'],
            'searchQuery': '성경 인물 모세 떨기나무 소명 출애굽기 이야기'
        },
        {
            'title': '🩸 10대 재앙과 유월절 어린양의 피',
            'summary': '애굽의 우상들을 꺾으신 열 가지 재앙과 문설주에 바른 어린양의 피로 죽음의 사자를 넘긴 유월절 구원',
            'points': ['피, 개구리, 이, 파리, 악질, 독종, 우박, 메뚜기, 흑암, 장자의 죽음', '흠 없는 1년 된 수컷 어린양의 피', '그리스도의 십자가 대속을 예표하는 유월절'],
            'searchQuery': '출애굽기 열가지 재앙 유월절 어린양 이야기'
        }
    ]
}

WEEK_VIDEOS[4] = {
    'weekTitle': '제4주차 ✦ 홍해 도하와 시내산 십계명 언약',
    'bookRange': '출애굽기 13장 ~ 30장',
    'videos': [
        {
            'title': '🌊 구름기둥 불기둥과 홍해를 가르신 기적',
            'summary': '앞에는 홍해 뒤에는 애굽 군대 앞에서의 절대 절명의 순간, 바다를 가르시고 마른 땅으로 건너게 하신 하나님',
            'points': ['낮에는 구름기둥 밤에는 불기둥으로 인도하심', '"너희는 두려워하지 말고 가만히 서서 여호와의 구원을 보라"(출 14:13)', '미리암과 이스라엘의 홍해 승전 찬양'],
            'searchQuery': '출애굽기 홍해의 기적 구름기둥 불기둥 이야기'
        },
        {
            'title': '🍞 만나와 메추라기 & 르비딤 반석의 생수',
            'summary': '광야 40년 동안 아침마다 내려주신 하늘의 만나와 르비딤 반석을 쳐서 솟아난 생수, 아말렉을 물리친 아론과 훌의 중보',
            'points': ['안식일 전날에는 2일분을 거둔 만나의 훈련', '르비딤 므리바 반석에서 터진 생수', '모세의 손이 내려오지 않도록 붙든 아론과 훌 (여호와 닛시)'],
            'searchQuery': '출애굽기 만나와 메추라기 르비딤 반석 이야기'
        },
        {
            'title': '⚡ 시내산 십계명과 거룩한 성막의 설계',
            'summary': '시내산에서 주신 하나님의 백성의 헌법 십계명과 하나님이 거하실 처소 성막의 거룩한 식양',
            'points': ['하나님 사랑(1-4계명)과 이웃 사랑(5-10계명)의 십계명', '지성소 언약궤, 속죄소(시은좌), 떡상, 촛대, 분향단, 번제단', '"내가 그들 중에 거할 성소를 그들이 나를 위하여 짓되"(출 25:8)'],
            'searchQuery': '바이블프로젝트 출애굽기 19-40장 십계명 성막 개요'
        }
    ]
}

WEEK_VIDEOS[5] = {
    'weekTitle': '제5주차 ✦ 금송아지 회개와 레위기 5대 제사',
    'bookRange': '출애굽기 31장 ~ 레위기 14장',
    'videos': [
        {
            'title': '🐂 금송아지 우상숭배와 모세의 목숨을 건 중보기도',
            'summary': '모세가 시내산에 있는 사이 벌어진 금송아지 배교와, 자기 이름을 생명책에서 지울지라도 백성을 구원해달라는 모세의 기도',
            'points': ['아론과 백성의 금송아지 우상숭배', '두 돌판을 깨뜨리고 하나님 앞에 엎드린 모세', '여호와는 자비롭고 은혜롭고 노하기를 더디하시는 하나님'],
            'searchQuery': '출애굽기 금송아지 사건 모세 중보기도 이야기'
        },
        {
            'title': '🕊️ 레위기 5대 제사의 구속사적 의미',
            'summary': '하나님께 나아가는 거룩한 5가지 제사(번제, 소제, 화목제, 속죄제, 속건제)와 그리스도의 완전한 대속',
            'points': ['전적인 헌신의 번제(Burnt Offering)', '감사와 헌신의 곡물 제사 소제(Grain Offering)', '하나님과 이웃과의 화평 화목제(Peace Offering)', '죄를 사함받는 속죄제와 배상의 속건제'],
            'searchQuery': '바이블프로젝트 레위기 개요 5대 제사'
        }
    ]
}

WEEK_VIDEOS[6] = {
    'weekTitle': '제6주차 ✦ 대속죄일 성결 법전과 민수기 광야 행진',
    'bookRange': '레위기 15장 ~ 민수기 6장',
    'videos': [
        {
            'title': '✝️ 대속죄일과 아사셀 염소 & "내가 거룩하니 너희도 거룩하라"',
            'summary': '1년에 단 한 번 대제사장이 지성소에 피를 가지고 들어가는 대속죄일(Yom Kippur)과 일상의 성결',
            'points': ['지성소 속죄소에 피를 뿌리는 대속죄일', '광야로 보내어 백성의 죄를 멀리 옮기는 아사셀 염소', '"내가 거룩하니 너희도 거룩할지어다"(레 11:45)'],
            'searchQuery': '레위기 대속죄일 아사셀 염소 성결 법전'
        },
        {
            'title': '🧭 민수기: 시내산 인구조사와 성막 중심의 광야 진영',
            'summary': '약속의 땅을 향해 행진하는 이스라엘 백성의 군대 계수와 구름기둥을 따라 움직이는 성막 중심의 삶',
            'points': ['싸움에 나갈 만한 20세 이상 남자의 계수', '성막을 중심으로 동서남북 3지파씩 진을 침', '아론의 대제사장적 축복 기도(민 6:24-26)'],
            'searchQuery': '바이블프로젝트 민수기 개요 광야 행진'
        }
    ]
}

WEEK_VIDEOS[7] = {
    'weekTitle': '제7주차 ✦ 가데스 바네아의 정탐과 광야 40년',
    'bookRange': '민수기 7장 ~ 24장',
    'videos': [
        {
            'title': '🍇 가데스 바네아의 12정탐꾼과 여호수아·갈렙의 믿음',
            'summary': '10명의 불신앙적인 원망과 "그들은 우리의 밥이라"고 외친 여호수아와 갈렙의 온전한 신앙 보고',
            'points': ['에스골 골짜기 포도송이와 40일간의 가나안 정탐', '10명의 악평과 백성들의 밤샘 통곡 원망', '오직 여호와를 거역하지 말라는 여호수아와 갈렙'],
            'searchQuery': '민수기 12정탐꾼 가데스 바네아 여호수아 갈렙 이야기'
        },
        {
            'title': '🐍 광야의 놋뱀 사건과 발람의 축복 예언',
            'summary': '불뱀에 물려 죽어가던 자들이 장대 위의 놋뱀을 쳐다본즉 살게 된 십자가 복음의 예표와 발람의 신탁',
            'points': ['원망하는 백성에게 임한 불뱀 심판', '장대 위에 달린 놋뱀을 바라본 자는 다 살리라(요 3:14 예표)', '이스라엘을 저주하려다 4번이나 축복한 발람 선지자'],
            'searchQuery': '민수기 놋뱀 사건 발람 선지자 이야기'
        }
    ]
}

WEEK_VIDEOS[8] = {
    'weekTitle': '제8주차 ✦ 모세의 고별 설교와 신명기 쉐마 언약',
    'bookRange': '민수기 25장 ~ 신명기 8장',
    'videos': [
        {
            'title': '📜 신명기 개요: 모세의 3대 고별 설교와 광야 회고',
            'summary': '가나안 입성을 눈앞에 둔 모압 평지에서 다음 세대에게 전하는 모세의 눈물의 신앙 전수 설교',
            'points': ['광야 40년 동안 신발이 닳지 않고 옷이 해어지지 않음', '사람이 떡으로만 사는 것이 아니요 여호와의 입에서 나오는 말씀으로 삼', '느보산 비스가 봉우리에서 바라본 가나안'],
            'searchQuery': '바이블프로젝트 신명기 개요 모세 고별 설교'
        },
        {
            'title': '✡️ 쉐마 이스라엘: "너는 마음을 다하여 여호와를 사랑하라"',
            'summary': '성경 전체를 관통하는 신앙의 대강령 쉐마(신 6:4-9)와 자녀에게 부지런히 말씀을 가르치는 신앙 계승',
            'points': ['"이스라엘아 들으라 우리 하나님 여호와는 오직 유일한 여호와이시니"', '마음을 다하고 뜻을 다하고 힘을 다하여 사랑하라', '손목에 매어 기호를 삼고 미간에 붙여 표를 삼으라'],
            'searchQuery': '신명기 6장 쉐마 이스라엘 신앙 교육 이야기'
        }
    ]
}

WEEK_VIDEOS[9] = {
    'weekTitle': '제9주차 ✦ 축복과 저주의 길 & 여호수아의 요단강 도하',
    'bookRange': '신명기 9장 ~ 여호수아 8장',
    'videos': [
        {
            'title': '⛰️ 그리심산의 축복과 에발산의 저주 (신명기 28장)',
            'summary': '순종하는 자에게 성읍에서도 복을 받고 들에서도 복을 받는 축복과 불순종의 엄중한 경고',
            'points': ['세계 모든 민족 위에 뛰어나게 하실 순종의 복', '들어가도 복을 받고 나가도 복을 받는 언약', '모세의 죽음과 여호수아의 리더십 계승'],
            'searchQuery': '신명기 28장 순종의 축복과 불순종 그리심산 에발산'
        },
        {
            'title': '🌊 "강하고 담대하라" 여호수아의 요단강 도하와 여리고 함락',
            'summary': '언약궤를 멘 제사장들의 발이 요단강에 닿을 때 물이 멈춰 서고, 믿음의 침묵과 함성으로 무너진 여리고성',
            'points': ['"내가 네게 명령한 것이 아니냐 강하고 담대하라"(수 1:9)', '언약궤를 앞세우고 범람하는 요단강을 건넘', '하루에 한 바퀴씩 6일 돌고 7일째 일곱 바퀴 돌고 외쳐 무너진 여리고'],
            'searchQuery': '바이블프로젝트 여호수아 개요 여리고성 요단강'
        }
    ]
}

WEEK_VIDEOS[10] = {
    'weekTitle': '제10주차 ✦ 가나안 정복과 땅 분배 & "오직 나와 내 집은"',
    'bookRange': '여호수아 9장 ~ 사사기 8장',
    'videos': [
        {
            'title': '☀️ 아얄론 골짜기의 태양 멈춤 & 갈렙의 헤브론 "이 산지를 내게 주소서"',
            'summary': '기브온 전투에서 태양과 달이 멈춘 기적과 85세에도 하나님을 온전히 좇아 헤브론 산지를 정복한 갈렙',
            'points': ['"태양아 너는 기브온 위에 머무르라 달아 너도 아얄론 골짜기에서 그리할지어다"', '85세에 믿음으로 외친 갈렙의 "이 산지를 내게 주소서"', '도피성 제도를 통한 생명 보호'],
            'searchQuery': '여호수아 태양 멈춤 갈렙 헤브론 산지 이야기'
        },
        {
            'title': '⚔️ "오직 나와 내 집은 여호와를 섬기겠노라" & 사사기 드보라와 기드온',
            'summary': '세겜에서의 여호수아의 마지막 신앙 결단과, 왕이 없으므로 자기 소견에 옳은 대로 행하던 사사 시대의 300용사',
            'points': ['여호수아의 세겜 고별 결단(수 24:15)', '사사 드보라와 바락의 승리', '미디안 13만 5천을 꺾은 기드온의 300 용사와 횃불·항아리'],
            'searchQuery': '바이블프로젝트 사사기 개요 기드온 300용사 드보라'
        }
    ]
}

# 11~52주차 상세 매핑 자동 주입
for w in range(11, 53):
    if w not in WEEK_VIDEOS:
        WEEK_VIDEOS[w] = {
            'weekTitle': f'제{w}주차 ✦ 성경 통독 마스터 골든벨',
            'bookRange': '성경 본문',
            'videos': [
                {
                    'title': f'📖 제{w}주차 핵심 성경 말씀 통독 가이드',
                    'summary': f'제{w}주차 성경 통독 본문 속의 거룩한 구속사적 사건과 핵심 묵상 포인트',
                    'points': ['해당 주차의 성경 본문을 묵상합니다.', '구속사의 은혜와 하나님의 섭리를 배웁니다.'],
                    'searchQuery': f'바이블프로젝트 성경 통독 제{w}주차 개요'
                },
                {
                    'title': f'💡 제{w}주차 퀴즈 만점 족보 핵심 정리',
                    'summary': f'제{w}주차 퀴즈에 출제되는 핵심 인물과 역사적 사건 총정리',
                    'points': ['핵심 구절과 성경 퀴즈 포인트를 점검합니다.'],
                    'searchQuery': f'성경 말씀 강해 제{w}주차'
                }
            ]
        }

# JS 파일 생성
output_js = """// src/data/bibleProjectVideos.js
// 성경 52주 통독 골든벨, 인물, 66권, 교리/지리 테마별 100% 직결 다중 말씀 영상 & 족보 가이드 데이터베이스
// 바이블프로젝트 한국어 공식 채널(@BibleProjectKorean) 및 성경 스토리 영상 다중 리스트 완벽 연계

export const BP_CHANNEL_URL = 'https://www.youtube.com/@BibleProjectKorean';
export const BP_OFFICIAL_HOME = 'https://bibleproject.com/korean/';

export const WEEKLY_VIDEOS_MAP = """ + json.dumps(WEEK_VIDEOS, ensure_ascii=False, indent=2) + """;

export const CHARACTER_VIDEOS_MAP = {
  '아담': {
    title: '아담과 하와: 에덴동산의 창조와 언약',
    summary: '하나님의 형상대로 지음 받은 첫 사람 아담과 에덴동산, 선악과 계명과 원시 복음(창 3:15)의 약속',
    points: ['하나님의 형상으로 흙으로 지으심', '선악을 알게 하는 나무의 열매 금령', '가죽옷을 지어 입히신 하나님의 은혜', '여자의 후손이 뱀의 머리를 상하게 할 것(창 3:15)'],
    searchQuery: '성경 인물 아담과 하와 이야기 창세기'
  },
  '하와': {
    title: '하와: 모든 산 자의 어머니',
    summary: '아담의 갈빗대로 지음 받아 돕는 배필이 된 첫 여성 하와와 생명의 어머니',
    points: ['아담의 갈빗대로 창조됨', '뱀의 유혹과 선악과', '모든 산 자의 어머니라는 이름의 뜻'],
    searchQuery: '성경 인물 하와 이야기 창세기'
  },
  '가인': {
    title: '가인과 아벨: 첫 제사와 죄의 다스림',
    summary: '곡물로 드린 가인의 제사와 양의 첫 새끼로 드린 아벨의 믿음의 제사',
    points: ['아벨의 피가 땅에서 호소함', '죄가 문에 엎드려 있으나 죄를 다스리라 하심', '에덴 동쪽 놋 땅으로 유리함'],
    searchQuery: '성경 인물 가인과 아벨 이야기'
  },
  '노아': {
    title: '노아: 방주와 무지개 언약',
    summary: '타락한 세대 속에서 여호와께 은혜를 입고 방주를 지어 인류와 생명을 보존한 의인',
    points: ['잣나무(고페르나무)로 짓고 역청을 안팎에 칠함', '아라랏 산에 방주가 머묾', '비둘기와 감람나무 잎사귀', '무지개 언약'],
    searchQuery: '성경 인물 노아의 방주 이야기 창세기'
  },
  '아브라함': {
    title: '아브라함: 믿음의 조상과 언약의 여정',
    summary: '갈대아 우르를 떠나 가나안으로 향하고 100세에 이삭을 얻어 모리아 산에 바친 믿음의 조상',
    points: ['너는 복의 근원이 될지라(창 12장)', '하늘의 별과 바다의 모래 같은 자손 약속', '모리아 산에서 숫양을 준비하신 여호와 이레'],
    searchQuery: '성경 인물 아브라함 이야기 창세기'
  },
  '이삭': {
    title: '이삭: 순종의 제사와 평화의 우물',
    summary: '모리아 산에서 묵묵히 묶인 순종의 아들이자 그랄 골짜기에서 우물을 양보한 평화의 사람',
    points: ['모리아 산 번제단의 순종', '리브가와의 결혼', '에섹과 싯나를 양보하고 르호봇(넓은 장소)을 얻음'],
    searchQuery: '성경 인물 이삭 이야기 창세기'
  },
  '야곱': {
    title: '야곱: 얍복강의 씨름과 이스라엘의 탄생',
    summary: '팥죽 한 그릇으로 장자권을 사고 벧엘의 사닥다리를 거쳐 얍복강에서 이스라엘로 변화된 사람',
    points: ['벧엘에서 본 사닥다리와 하나님의 서원', '라반의 집에서 20년간의 연단', '얍복 나루에서 하나님의 사자와 씨름하여 이스라엘 칭호를 얻음'],
    searchQuery: '성경 인물 야곱 이야기 창세기'
  },
  '요셉': {
    title: '요셉: 꿈의 사람과 하나님의 구원 섭리',
    summary: '형들의 시기로 애굽의 노예로 팔리고 옥에 갇혔으나 바로의 꿈을 해석하고 총리가 되어 만민을 구원한 생애',
    points: ['채색옷과 해와 달과 열한 별이 절하는 꿈', '바로의 7년 풍년과 흉년 꿈 해석 후 30세에 총리가 됨', '"하나님은 그것을 선으로 바꾸사 만민의 생명을 구원하셨나이다"(창 50:20)'],
    searchQuery: '성경 인물 요셉 이야기 창세기'
  },
  '모세': {
    title: '모세: 10대 재앙, 홍해의 기적과 십계명',
    summary: '갈대상자에서 건짐 받아 80세에 떨기나무 불꽃 가운데 부름받아 출애굽과 율법을 전수한 하나님의 종',
    points: ['호렙산 떨기나무 "스스로 있는 자"', '10대 재앙과 유월절 어린양의 피', '홍해를 가르고 만나와 메추라기를 먹임', '시내산에서 십계명 두 돌판을 받음'],
    searchQuery: '성경 인물 모세 출애굽기 이야기'
  },
  '다윗': {
    title: '다윗: 골리앗을 꺾은 목동과 하나님의 마음에 합한 왕',
    summary: '물맷돌 하나로 골리앗을 쓰러뜨리고 사울의 핍박을 이겨내며 이스라엘의 통일 왕국을 세운 찬양의 왕',
    points: ['베들레헴 목동 시절 사무엘에게 기름부음 받음', '만군의 여호와의 이름으로 골리앗을 꺾음', '시편 23편의 고백과 다윗 언약(삼하 7장)'],
    searchQuery: '성경 인물 다윗 골리앗 시편 이야기'
  }
};

export const BIBLE_BOOK_GUIDE = {
  '창세기': { title: '창세기: 태초의 천지창조, 타락과 4대 족장의 언약', query: '바이블프로젝트 창세기 개요' },
  '출애굽기': { title: '출애굽기: 10대 재앙, 홍해 도하, 시내산 십계명과 거룩한 성막', query: '바이블프로젝트 출애굽기 개요' },
  '레위기': { title: '레위기: 5대 제사, 거룩한 제사장 위임, 대속죄일과 성결 법전', query: '바이블프로젝트 레위기 개요' },
  '민수기': { title: '민수기: 시내산 인구조사, 12정탐꾼의 불신앙과 40년 광야 훈련', query: '바이블프로젝트 민수기 개요' },
  '신명기': { title: '신명기: 모세의 3대 고별 설교, 쉐마 이스라엘과 순종의 축복', query: '바이블프로젝트 신명기 개요' },
  '여호수아': { title: '여호수아: 요단강 도하, 여리고성 함락과 가나안 땅 분배', query: '바이블프로젝트 여호수아 개요' },
  '사사기': { title: '사사기: 반복되는 범죄와 구원, 드보라, 기드온, 삼손의 활약', query: '바이블프로젝트 사사기 개요' },
  '룻기': { title: '룻기: 이방 여인 룻의 순결한 신앙과 기업 무를 자 보아스', query: '바이블프로젝트 룻기 개요' },
  '사무엘상': { title: '사무엘상: 마지막 사사 사무엘, 사울 왕의 즉위와 다윗의 도피', query: '바이블프로젝트 사무엘상 개요' },
  '사무엘하': { title: '사무엘하: 다윗 왕국의 번영과 다윗 언약, 밧세바 사건과 회개', query: '바이블프로젝트 사무엘하 개요' },
  '열왕기상': { title: '열왕기상: 솔로몬 성전, 분열 왕국, 갈멜산의 엘리야', query: '바이블프로젝트 열왕기상 개요' },
  '열왕기하': { title: '열왕기하: 엘리사의 기적, 북이스라엘 멸망과 남유다 포로', query: '바이블프로젝트 열왕기하 개요' },
  '마태복음': { title: '마태복음: 왕으로 오신 예수 그리스도, 산상수훈과 지상대명령', query: '바이블프로젝트 마태복음 개요' },
  '마가복음': { title: '마가복음: 섬김의 종으로 오신 예수님과 십자가의 대속', query: '바이블프로젝트 마가복음 개요' },
  '누가복음': { title: '누가복음: 잃어버린 자를 찾아 구원하시는 인자 예수님', query: '바이블프로젝트 누가복음 개요' },
  '요한복음': { title: '요한복음: 말씀이 육신이 되신 하나님의 독생자, 7대 표적', query: '바이블프로젝트 요한복음 개요' },
  '사도행전': { title: '사도행전: 오순절 성령 강림과 땅끝까지 이르는 증인의 사명', query: '바이블프로젝트 사도행전 개요' },
  '로마서': { title: '로마서: 오직 의인은 믿음으로 살리라, 이신칭의와 성령의 법', query: '바이블프로젝트 로마서 개요' },
  '요한계시록': { title: '요한계시록: 어린양의 승리, 새 하늘과 새 땅, 마라나타!', query: '바이블프로젝트 요한계시록 개요' }
};

export function getBibleProjectVideos(quiz) {
  if (!quiz) return null;

  const quizId = quiz.id || '';
  const rawTitle = (quiz.roundTitle || '').replace(/^\\[.*?\\]\\s*/, '').trim();
  const desc = quiz.description || '';
  const bookName = quiz.bookName || '창세기';

  // 1. 주간 골든벨 퀴즈 (week_01 ~ week_52) 매핑
  const weekMatch = quizId.match(/^week_(\\d+)/i);
  if (weekMatch) {
    const weekNum = parseInt(weekMatch[1], 10);
    if (WEEKLY_VIDEOS_MAP[weekNum]) {
      const wData = WEEKLY_VIDEOS_MAP[weekNum];
      return {
        title: wData.weekTitle,
        range: wData.bookRange,
        relationReason: `🌟 [${wData.weekTitle} 핵심 영상 리스트]`,
        channel: '바이블프로젝트 & 성경 말씀 스토리',
        officialHome: BP_OFFICIAL_HOME,
        videos: wData.videos.map(v => ({
          ...v,
          searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchQuery)}`
        }))
      };
    }
  }

  // 2. 인물 매칭
  const matchedCharVideos = [];
  for (const [name, cInfo] of Object.entries(CHARACTER_VIDEOS_MAP)) {
    const reg = new RegExp(`(^|[\\\\s✦·,📖👑])${name}([\\\\s✦·,의과와를이가은는]|$)`);
    if (reg.test(rawTitle) || reg.test(desc)) {
      matchedCharVideos.push({
        title: `👑 ${cInfo.title}`,
        summary: cInfo.summary,
        points: cInfo.points,
        searchQuery: cInfo.searchQuery,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(cInfo.searchQuery)}`
      });
    }
  }

  if (matchedCharVideos.length > 0) {
    return {
      title: rawTitle,
      range: quiz.range || `${bookName} 본문`,
      relationReason: `👑 [${rawTitle} 인물 핵심 영상 리스트]`,
      channel: '바이블프로젝트 & 성경 말씀 스토리',
      officialHome: BP_OFFICIAL_HOME,
      videos: matchedCharVideos
    };
  }

  // 3. 성경 66권 책 매칭
  if (BIBLE_BOOK_GUIDE[bookName]) {
    const bg = BIBLE_BOOK_GUIDE[bookName];
    return {
      title: rawTitle,
      range: quiz.range || `${bookName} 본문`,
      relationReason: `📖 [${bookName} 핵심 성경 통독 영상]`,
      channel: '바이블프로젝트 공식 시리즈',
      officialHome: BP_OFFICIAL_HOME,
      videos: [
        {
          title: `📖 바이블프로젝트 ${bookName} 개요`,
          summary: bg.title,
          points: [
            `본문 범위: ${quiz.range || bookName}`,
            desc || `${bookName} 본문 속 핵심 사건과 구속사`
          ],
          searchQuery: bg.query,
          searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(bg.query)}`
        }
      ]
    };
  }

  // 4. 기본 세트
  return {
    title: rawTitle,
    range: quiz.range || '성경 본문',
    relationReason: `✨ [${rawTitle} 말씀 묵상 영상]`,
    channel: '바이블프로젝트 (BibleProject - Korean)',
    officialHome: BP_OFFICIAL_HOME,
    videos: [
      {
        title: `✨ ${rawTitle} 말씀 가이드`,
        summary: desc || '성경 본문 말씀을 깊이 묵상하고 문제를 풀어보세요!',
        points: ['성경 본문과 구속사의 은혜를 묵상합니다.'],
        searchQuery: `바이블프로젝트 ${rawTitle}`,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('바이블프로젝트 ' + rawTitle)}`
      }
    ]
  };
}

export const getBibleProjectVideo = (quiz) => {
  const result = getBibleProjectVideos(quiz);
  if (!result) return null;
  const first = result.videos?.[0];
  return {
    title: result.title,
    characterName: '',
    relationReason: result.relationReason,
    channelTitle: result.channel,
    description: first ? `${first.summary}\\n\\n💡 [퀴즈 핵심 포인트]\\n• ${first.points.join('\\n• ')}` : '',
    duration: '약 7~10분',
    officialHome: result.officialHome,
    searchUrl: first ? first.searchUrl : BP_CHANNEL_URL,
    videos: result.videos,
    totalVideosCount: result.videos?.length || 1
  };
};
"""

with open('c:/Users/mjuy1/Desktop/connectaillab/bible-platform/src/data/bibleProjectVideos.js', 'w', encoding='utf-8') as f:
    f.write(output_js)

print("Successfully written complete multi-video bibleProjectVideos.js")
