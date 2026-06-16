/**
 * KRV.txt → public/bible/*.json 변환 스크립트
 * 형식: "Gen 1:1 태초에 하나님이 천지를 창조하시니라"
 * 출력: public/bible/gen.json → {"1": [{verse:1, text:"..."}, ...], "2": [...]}
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 책 약어 매핑 (KRV.txt → 앱 내부 bookId)
const BOOK_MAP = {
  Gen: 'gen', Exo: 'exo', Lev: 'lev', Num: 'num', Deu: 'deu',
  Jos: 'jos', Jdg: 'jdg', Rut: 'rut', '1Sa': '1sa', '2Sa': '2sa',
  '1Ki': '1ki', '2Ki': '2ki', '1Ch': '1ch', '2Ch': '2ch', Ezr: 'ezr',
  Neh: 'neh', Est: 'est', Job: 'job', Psa: 'psa', Pro: 'pro',
  Ecc: 'ecc', Sng: 'sng', Sol: 'sng', Isa: 'isa', Jer: 'jer', Lam: 'lam',
  Eze: 'eze', Dan: 'dan', Hos: 'hos', Joe: 'joe', Amo: 'amo',
  Oba: 'oba', Jon: 'jon', Mic: 'mic', Nah: 'nah', Hab: 'hab',
  Zep: 'zep', Hag: 'hag', Zec: 'zec', Mal: 'mal',
  Mat: 'mat', Mar: 'mar', Luk: 'luk', Joh: 'joh', Act: 'act',
  Rom: 'rom', '1Co': '1co', '2Co': '2co', Gal: 'gal', Eph: 'eph',
  Php: 'php', Phi: 'php', Col: 'col', '1Th': '1th', '2Th': '2th', '1Ti': '1ti',
  '2Ti': '2ti', Tit: 'tit', Phm: 'phm', Heb: 'heb', Jam: 'jam',
  '1Pe': '1pe', '2Pe': '2pe', '1Jo': '1jo', '2Jo': '2jo', '3Jo': '3jo',
  Jud: 'jud', Rev: 'rev',
};

const INPUT_FILE = path.join(__dirname, 'KRV.txt');
const OUTPUT_DIR = path.join(__dirname, 'public', 'bible');

// 출력 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// EUC-KR로 읽기
const raw = fs.readFileSync(INPUT_FILE);
const content = iconv.decode(raw, 'euc-kr');
const lines = content.split('\n');

// 책별로 데이터 수집
const books = {};
let skipped = 0;
let parsed = 0;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  // 형식: "Gen 1:1 태초에 하나님이..."
  const match = trimmed.match(/^(\w+)\s+(\d+):(\d+)\s+(.+)$/);
  if (!match) {
    skipped++;
    continue;
  }

  const [, bookCode, chapterStr, verseStr, text] = match;
  const bookId = BOOK_MAP[bookCode];

  if (!bookId) {
    console.warn(`알 수 없는 책 코드: ${bookCode}`);
    skipped++;
    continue;
  }

  const chapter = String(parseInt(chapterStr));
  const verse = parseInt(verseStr);

  if (!books[bookId]) books[bookId] = {};
  if (!books[bookId][chapter]) books[bookId][chapter] = [];

  books[bookId][chapter].push({ verse, text: text.trim() });
  parsed++;
}

// 각 책을 JSON 파일로 저장
let saved = 0;
for (const [bookId, chaptersData] of Object.entries(books)) {
  const outPath = path.join(OUTPUT_DIR, `${bookId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(chaptersData), 'utf8');
  saved++;
}

console.log(`✅ 변환 완료!`);
console.log(`   파싱된 절: ${parsed.toLocaleString()}개`);
console.log(`   저장된 책: ${saved}권`);
console.log(`   건너뜀: ${skipped}줄`);
console.log(`   출력 경로: ${OUTPUT_DIR}`);
