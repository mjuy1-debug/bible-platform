import fs from 'fs';
import readline from 'readline';

// 자주 등장하는 주요 지명 영-한 매핑 사전
const koreanNames = {
  "Jerusalem": "예루살렘",
  "Bethlehem": "베들레헴",
  "Capernaum": "가버나움",
  "Nazareth": "나사렛",
  "Sea of Galilee": "갈릴리 호수",
  "Galilee": "갈릴리",
  "Jordan River": "요단 강",
  "Mount Sinai": "시내 산",
  "Sinai": "시내 산",
  "Jericho": "여리고",
  "Dead Sea": "사해",
  "Salt Sea": "사해",
  "Samaria": "사마리아",
  "Tyre": "두로",
  "Sidon": "시돈",
  "Damascus": "다메섹",
  "Antioch": "안디옥",
  "Ephesus": "에베소",
  "Corinth": "고린도",
  "Rome": "로마",
  "Athens": "아덴 (아테네)",
  "Philippi": "빌립보",
  "Thessalonica": "데살로니가",
  "Colossae": "골로새",
  "Galatia": "갈라디아",
  "Babylon": "바벨론",
  "Nineveh": "니느웨",
  "Egypt": "애굽 (이집트)",
  "Sodom": "소돔",
  "Gomorrah": "고모라",
  "Hebron": "헤브론",
  "Shechem": "세겜",
  "Bethel": "벧엘",
  "Gilgal": "길갈",
  "Shiloh": "실로",
  "Gibeon": "기브온",
  "Beersheba": "브엘세바",
  "Mount Carmel": "갈멜 산",
  "Carmel": "갈멜 산",
  "Mount Hermon": "헐몬 산",
  "Mount Tabor": "다볼 산",
  "Mount of Olives": "감람 산",
  "Gethsemane": "겟세마네",
  "Golgotha": "골고다",
  "Zion": "시온",
  "Macedonia": "마게도냐",
  "Cyprus": "구브로",
  "Crete": "그레데",
  "Patmos": "밧모 섬",
  "Cana": "가나",
  "Bethany": "베다니",
  "Emmaus": "엠마오",
  "Susa": "수산",
  "Persia": "바사 (페르시아)",
  "Joppa": "욥바",
  "Caesarea": "가이사랴",
  "Caesarea Philippi": "가이사랴 빌립보",
  "Berea": "베뢰아",
  "Lystra": "루스드라",
  "Derbe": "더베",
  "Iconium": "이고니온",
  "Pergamum": "버가모",
  "Thyatira": "두아디라",
  "Sardis": "사데",
  "Philadelphia": "빌라델비아",
  "Laodicea": "라오디게아",
  "Ur": "우르",
  "Haran": "하란",
  "Gaza": "가사",
  "Ashkelon": "아스글론",
  "Ashdod": "아스돗",
  "Ekron": "에그론",
  "Gath": "가드",
  "Moab": "모압",
  "Ammon": "암몬",
  "Edom": "에돔",
  "Midian": "미디안"
};

const inputFile = '../Bible-Geocoding-Data/data/ancient.jsonl';
const outputFile = './src/data/locations.json';

async function processData() {
  const locations = [];
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      
      const englishName = data.friendly_id;
      // 한글 이름이 사전에 없으면 영문 이름 그대로 사용
      const koreanName = koreanNames[englishName] || englishName;
      
      // 좌표 추출 (첫 번째 identification의 첫 번째 resolution)
      let lat = null, lng = null;
      if (data.identifications && data.identifications.length > 0) {
        const iden = data.identifications[0];
        if (iden.resolutions && iden.resolutions.length > 0) {
          const lonlatStr = iden.resolutions[0].lonlat;
          if (lonlatStr) {
            const parts = lonlatStr.split(',');
            lng = parseFloat(parts[0]);
            lat = parseFloat(parts[1]);
          }
        }
      }
      
      // 좌표가 없으면 건너뜀
      if (lat === null || lng === null) continue;
      
      const type = data.types && data.types.length > 0 ? data.types[0] : 'region';
      const typeKr = {
        'settlement': '도시/마을',
        'mountain': '산',
        'mountain range': '산맥',
        'river': '강',
        'lake': '호수',
        'sea': '바다',
        'region': '지역',
        'island': '섬',
        'spring': '샘',
        'valley': '골짜기',
        'plain': '평야',
        'cave': '동굴'
      }[type] || type;

      // 성경 구절 최대 3개 추출
      const verses = [];
      if (data.verses && data.verses.length > 0) {
        for (let i = 0; i < Math.min(3, data.verses.length); i++) {
          if (data.verses[i].readable) {
            verses.push(data.verses[i].readable);
          }
        }
      }

      locations.push({
        id: data.id,
        name: koreanName,
        englishName: englishName,
        lat: lat,
        lng: lng,
        type: typeKr,
        verses: verses
      });
      
    } catch (e) {
      console.error('Error parsing line', e);
    }
  }

  // 폴더가 없으면 생성
  if (!fs.existsSync('./src/data')){
      fs.mkdirSync('./src/data');
  }

  // JSON 저장
  fs.writeFileSync(outputFile, JSON.stringify(locations, null, 2));
  console.log(`Successfully processed ${locations.length} locations into ${outputFile}`);
}

processData();
