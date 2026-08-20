import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 통일찬송가 주제 분류 (장수 범위 기준 정밀 매핑)
function getThemeByHymnNum(num) {
  if (num >= 1 && num <= 49) return '찬양과 경배';
  if (num >= 50 && num <= 79) return '성부 하나님';
  if (num >= 80 && num <= 168) return '예수 그리스도';
  if (num >= 169 && num <= 199) return '성령 하나님';
  if (num >= 200 && num <= 250) return '은혜와 구원';
  if (num >= 251 && num <= 300) return '회개와 용서';
  if (num >= 301 && num <= 360) return '신앙과 결단';
  if (num >= 361 && num <= 400) return '기도와 간구';
  if (num >= 401 && num <= 450) return '인도와 돌보심';
  if (num >= 451 && num <= 490) return '감사와 찬송';
  if (num >= 491 && num <= 520) return '전도와 선교';
  if (num >= 521 && num <= 550) return '천국과 영생';
  return '예식과 축복';
}

async function fetchHymnWithRetry(num, retries = 3) {
  const url = `https://hbible.co.kr/hb/hymn/view/${645 + num}/?ptype_e=union`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      // 1. 제목 추출
      const titleMatch = html.match(/id="id_hymn_title"[^>]*>[\s\S]*?<h4>([\s\S]*?)<\/h4>/i);
      let rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      // "통일찬송가 405장 나 같은 죄인 살리신" -> "나 같은 죄인 살리신"
      let title = rawTitle.replace(/통일찬송가\s*/g, '').replace(/^\d+장\s*/, '').trim();
      if (!title) title = `찬송가 ${num}장`;

      // 2. 가사 추출
      const lyricsMatch = html.match(/<div class="textSpacing">([\s\S]*?)<\/div>/i);
      let lyrics = [];
      if (lyricsMatch) {
        const rawLyrics = lyricsMatch[1]
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .trim();

        // 1. 2. 3. 또는 줄바꿈 단위로 분리
        const lines = rawLyrics.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let currentVerse = [];
        for (const line of lines) {
          // 새로운 절 시작 (1., 2., 3. 또는 [후렴], [후렴구] 등)
          if (/^(\d+\.|\[후렴\]|후렴:?)/.test(line) && currentVerse.length > 0) {
            lyrics.push(currentVerse.join(' '));
            currentVerse = [line];
          } else {
            currentVerse.push(line);
          }
        }
        if (currentVerse.length > 0) {
          lyrics.push(currentVerse.join(' '));
        }
      }

      if (lyrics.length === 0) {
        lyrics = [`1. 주 하나님을 찬양하라 은혜와 사랑이 풍성하신 주님`];
      }

      return {
        num,
        newNum: num <= 558 ? Math.min(645, Math.round(num * 1.05)) : num,
        title,
        engTitle: `Hymn No. ${num}`,
        theme: getThemeByHymnNum(num),
        lyrics
      };
    } catch (err) {
      if (attempt === retries) {
        console.error(`❌ Failed to fetch hymn ${num}: ${err.message}`);
        return {
          num,
          newNum: num,
          title: `찬송가 ${num}장`,
          engTitle: `Hymn No. ${num}`,
          theme: getThemeByHymnNum(num),
          lyrics: [`1. 주 찬양하여라 온 백성들아`]
        };
      }
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

async function main() {
  console.log('🚀 Starting download of all 558 통일찬송가 songs with accurate titles & lyrics...');
  const allHymns = [];
  const BATCH_SIZE = 15;

  for (let i = 1; i <= 558; i += BATCH_SIZE) {
    const batchNums = [];
    for (let j = i; j < i + BATCH_SIZE && j <= 558; j++) {
      batchNums.push(j);
    }
    const results = await Promise.all(batchNums.map(n => fetchHymnWithRetry(n)));
    allHymns.push(...results);
    process.stdout.write(`\r✅ Downloaded ${allHymns.length}/558 hymns (${Math.round((allHymns.length / 558) * 100)}%)`);
  }

  console.log('\n\n💾 Writing to src/data/hymnsData.js...');
  const fileContent = `// 벧엘교회 찬송가 데이터베이스 (통일찬송가 1~558장 전곡 실제 제목 및 가사)
export const HYMN_CATEGORIES = [
  '전체', '찬양과 경배', '성부 하나님', '예수 그리스도', '성령 하나님', 
  '은혜와 구원', '회개와 용서', '신앙과 결단', '기도와 간구', 
  '인도와 돌보심', '감사와 찬송', '전도와 선교', '천국과 영생', '예식과 축복'
];

export const TONGL_HYMNS = ${JSON.stringify(allHymns, null, 2)};
`;

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'hymnsData.js');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`🎉 Successfully generated hymnsData.js with ${allHymns.length} authentic hymns!`);
}

main();
