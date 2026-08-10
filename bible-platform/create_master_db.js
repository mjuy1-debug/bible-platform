import fs from 'fs';
import readline from 'readline';

const koreanNames = {
  "Jerusalem": "예루살렘", "Bethlehem": "베들레헴", "Capernaum": "가버나움", "Nazareth": "나사렛", "Sea of Galilee": "갈릴리 바다", "Galilee": "갈릴리", "Jordan River": "요단 강", "Mount Sinai": "시내 산", "Sinai": "시내", "Jericho": "여리고", "Dead Sea": "사해", "Salt Sea": "염해(사해)", "Samaria": "사마리아", "Tyre": "두로", "Sidon": "시돈", "Damascus": "다메섹", "Antioch": "안디옥", "Ephesus": "에베소", "Corinth": "고린도", "Rome": "로마", "Athens": "아덴", "Philippi": "빌립보", "Thessalonica": "데살로니가", "Colossae": "골로새", "Galatia": "갈라디아", "Babylon": "바벨론", "Nineveh": "니느웨", "Egypt": "애굽(이집트)", "Sodom": "소돔", "Gomorrah": "고모라", "Hebron": "헤브론", "Shechem": "세겜", "Bethel": "벧엘", "Gilgal": "길갈", "Shiloh": "실로", "Gibeon": "기브온", "Beersheba": "브엘세바", "Mount Carmel": "갈멜 산", "Carmel": "갈멜", "Mount Hermon": "헐몬 산", "Mount Tabor": "다볼 산", "Mount of Olives": "감람 산", "Gethsemane": "겟세마네", "Golgotha": "골고다", "Zion": "시온", "Macedonia": "마게도냐", "Cyprus": "구브로", "Crete": "그레데", "Patmos": "밧모 섬", "Cana": "가나", "Bethany": "베다니", "Emmaus": "엠마오", "Susa": "수산", "Persia": "바사", "Joppa": "욥바", "Caesarea": "가이사랴", "Caesarea Philippi": "가이사랴 빌립보", "Berea": "베뢰아", "Lystra": "루스드라", "Derbe": "더베", "Iconium": "이고니온", "Pergamum": "버가모", "Thyatira": "두아디라", "Sardis": "사데", "Philadelphia": "빌라델비아", "Laodicea": "라오디게아", "Ur": "우르", "Haran": "하란", "Gaza": "가사", "Ashkelon": "아스글론", "Ashdod": "아스돗", "Ekron": "에그론", "Gath": "가드", "Moab": "모압", "Ammon": "암몬", "Edom": "에돔", "Midian": "미디안", "Assyria": "앗수르", "Syria": "아람(수리아)", "Lebanon": "레바논", "Arabia": "아라비아", "Ethiopia": "구스(에티오피아)", "Tarshish": "다시스", "Ophir": "오빌", "Gilead": "길르앗", "Bashan": "바산", "Negev": "네겝", "Arabah": "아라바", "Kidron Valley": "기드론 골짜기", "Hinnom Valley": "힌놈의 골짜기", "Megiddo": "므깃도", "Jezreel": "이스르엘", "Dan": "단", "Ephraim": "에브라임", "Judah": "유다", "Benjamin": "베냐민", "Manasseh": "므낫세", "Reuben": "르우벤", "Gad": "갓", "Asher": "아셀", "Naphtali": "납달리", "Zebulun": "스불론", "Issachar": "잇사갈", "Simeon": "시므온", "Levi": "레위"
};

const bibleBooks = {
  "Gen": "창세기", "Exod": "출애굽기", "Lev": "레위기", "Num": "민수기", "Deut": "신명기", "Josh": "여호수아", "Judg": "사사기", "Ruth": "룻기",
  "1Sam": "사무엘상", "2Sam": "사무엘하", "1Kgs": "열왕기상", "2Kgs": "열왕기하", "1Chr": "역대상", "2Chr": "역대하", "Ezra": "에스라", "Neh": "느헤미야",
  "Esth": "에스더", "Job": "욥기", "Ps": "시편", "Prov": "잠언", "Eccl": "전도서", "Song": "아가", "Isa": "이사야", "Jer": "예레미야", "Lam": "예레미야애가",
  "Ezek": "에스겔", "Dan": "다니엘", "Hos": "호세아", "Joel": "요엘", "Amos": "아모스", "Obad": "오바댜", "Jonah": "요나", "Mic": "미가", "Nah": "나훔",
  "Hab": "하박국", "Zeph": "스바냐", "Hag": "학개", "Zech": "스가랴", "Mal": "말라기",
  "Matt": "마태복음", "Mark": "마가복음", "Luke": "누가복음", "John": "요한복음", "Acts": "사도행전", "Rom": "로마서", "1Cor": "고린도전서", "2Cor": "고린도후서",
  "Gal": "갈라디아서", "Eph": "에베소서", "Phil": "빌립보서", "Col": "골로새서", "1Thess": "데살로니가전서", "2Thess": "데살로니가후서", "1Tim": "디모데전서",
  "2Tim": "디모데후서", "Titus": "디도서", "Phlm": "빌레몬서", "Heb": "히브리서", "Jas": "야고보서", "1Pet": "베드로전서", "2Pet": "베드로후서",
  "1John": "요한1서", "2John": "요한2서", "3John": "요한3서", "Jude": "유다서", "Rev": "요한계시록"
};

const translateVerse = (verseStr) => {
  let result = verseStr.replace(/([1-3]?\s?[A-Za-z]+)\s(\d+:\d+)/, (match, book, chapVerse) => {
    let cleanBook = book.replace(/\s/g, '');
    const krBook = bibleBooks[cleanBook];
    if (krBook) return `${krBook} ${chapVerse}`;
    return match;
  });
  return result;
};

const escapeCSV = (str) => {
  if (str === null || str === undefined) return '';
  const strVal = String(str);
  if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
    return '"' + strVal.replace(/"/g, '""') + '"';
  }
  return strVal;
};

const inputFile = '../Bible-Geocoding-Data/data/ancient.jsonl';
const outputFile = './bible_places_master.csv';

async function processData() {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const headers = ['id', 'name_en', 'name_ko', 'name_ko_alt', 'type', 'lat', 'lng', 'verses', 'status'];
  let csvContent = headers.join(',') + '\n';
  let count = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      
      const englishName = data.friendly_id;
      let koreanName = '';
      let status = '';

      if (koreanNames[englishName]) {
        koreanName = koreanNames[englishName];
        status = '공식 성경 표기';
      } else {
        koreanName = englishName; // 임시로 영어
        status = '확인 필요';
      }
      
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
      
      if (lat === null || lng === null) continue;
      
      const type = data.types && data.types.length > 0 ? data.types[0] : 'region';
      const typeKr = {
        'settlement': '도시', 'mountain': '산', 'mountain range': '산맥', 'river': '강', 'lake': '호수', 'sea': '바다',
        'region': '지역', 'island': '섬', 'spring': '샘', 'valley': '골짜기', 'plain': '평야', 'cave': '동굴'
      }[type] || type;

      const verses = [];
      if (data.verses && data.verses.length > 0) {
        for (let i = 0; i < Math.min(5, data.verses.length); i++) {
          if (data.verses[i].readable) {
            verses.push(translateVerse(data.verses[i].readable));
          }
        }
      }

      const row = [
        data.id,
        englishName,
        koreanName,
        '', // name_ko_alt
        typeKr,
        lat,
        lng,
        verses.join('; '),
        status
      ].map(escapeCSV).join(',');

      csvContent += row + '\n';
      count++;
    } catch (e) {
      console.error('Error parsing line', e);
    }
  }

  fs.writeFileSync(outputFile, csvContent, 'utf-8');
  console.log(`Successfully created ${outputFile} with ${count} records.`);
}

processData();
