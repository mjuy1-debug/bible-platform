const { execSync } = require('child_process');
const fs = require('fs');

const playlists = {
  gen: 'PLVcVykBcFZTSLj_RY9qI3POOhXis3sIjl',
  exo: 'PLVcVykBcFZTSOMqb3zzkCJxApAQkkZFzx',
  lev: 'PLVcVykBcFZTSixzelasf-bHxtyoAEXwkx',
  num: 'PLVcVykBcFZTRnt-mlIDDzpDu7IA5bzJNH',
  deu: 'PLVcVykBcFZTQY446Ly0Gm9yjVHEbwhe7y',
  jos: 'PLVcVykBcFZTTbd5VxIVBPhovWtk_kNRcR',
  jdg: 'PLVcVykBcFZTSVlIivEzeryQKftNt1TqAZ',
  rut: 'PLVcVykBcFZTSjt5AOFvERdjn6of9NG5tX',
  '1sa': 'PLVcVykBcFZTT0WcqXi2INqLzK_3bfzfNf',
  '2sa': 'PLVcVykBcFZTSyNyRs04UMnAEwfuXqnwgy',
  '1ki': 'PLVcVykBcFZTRtp1N60IeJxNq9mmiYYk3o',
  '2ki': 'PLVcVykBcFZTQ4DAYRcmregW3ddGd-FUzO',
  '1ch': 'PLVcVykBcFZTTXEcV3eQL9er7X7JwkP5GJ',
  '2ch': 'PLVcVykBcFZTSJ3TqJKwK6Z_JGxWVh-4uE',
  ezr: 'PLVcVykBcFZTTO2SZNoLAXvDGdrvS0beq9',
  neh: 'PLVcVykBcFZTRs1EXOW3cyKqLazLRMmJ6Q',
  est: 'PLVcVykBcFZTSBj4OXaHf8Nh-dCzlMuppz',
  job: 'PLVcVykBcFZTQwB6_h2e9mygcTtubKoql_',
  psa: 'PLVcVykBcFZTTDNtQJsc4j_sU3Op0WKcO-',
  pro: 'PLVcVykBcFZTTVEcfdIn4Nmm2weYGTrM43',
  ecc: 'PLVcVykBcFZTRs1yjX3JHiKU21RppvXb3u',
  sng: 'PLVcVykBcFZTRNG9NeIQzO4nHS-fKUBy0J',
  isa: 'PLVcVykBcFZTTS_ks2ZOZDP6PVeFYtS6Cc',
  jer: 'PLVcVykBcFZTQvSOwGfuRHbD8yNoYr7HAa',
  lam: 'PLVcVykBcFZTR1EGiHqgLPfj6AyXcfWbBL',
  eze: 'PLVcVykBcFZTSq07123PZaJPudnsrDapAe',
  dan: 'PLVcVykBcFZTTEZJPjOr5rT1WOWpF3OlLj',
  hos: 'PLVcVykBcFZTTIVMdnToC-jVJELeptSLPy',
  joe: 'PLVcVykBcFZTTQ0hVYMS5BZmiTSJAnj96I',
  amo: 'PLVcVykBcFZTSVeHpG4e7hllr9bBXwjjfu',
  oba: 'PLVcVykBcFZTTLAN9MCeMZxMv3ly-dI9cH',
  jon: 'PLVcVykBcFZTTIjqUlGR4pNoc70C-R6EoW',
  mic: 'PLVcVykBcFZTR1RkHliIhSL-hqUoV60GAL',
  nah: 'PLVcVykBcFZTSAkFZsm28AEi1Xl8VJ2-Np',
  hab: 'PLVcVykBcFZTR3nSmke2FimiM5WafHGm2q',
  zep: 'PLVcVykBcFZTTaGo-Y6n91nLYSv1AC4Vxu',
  hag: 'PLVcVykBcFZTSHAhuKuEtRdBxDTj6sVHAA',
  zec: 'PLVcVykBcFZTRCuyBk7qbvfGKGd32AqF-S',
  mal: 'PLVcVykBcFZTRzky6aS2v1D1P5t66b6nMI',
};

const result = {};

for (const [bookId, playlistId] of Object.entries(playlists)) {
  console.log(`Processing ${bookId}...`);
  try {
    const raw = execSync(
      `yt-dlp "https://www.youtube.com/playlist?list=${playlistId}" --flat-playlist --dump-json`,
      { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );
    const lines = raw.trim().split('\n').filter(Boolean);
    const chapters = {};
    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        const match = item.title.match(/(\d+)장/);
        if (match) {
          const ch = parseInt(match[1]);
          chapters[ch] = item.id;
        }
      } catch (e) { /* skip */ }
    }
    result[bookId] = chapters;
    console.log(`  -> ${Object.keys(chapters).length} chapters mapped`);
  } catch (e) {
    console.error(`  ERROR: ${e.message.slice(0, 100)}`);
    result[bookId] = {};
  }
}

// JS output
let js = '// 공동체성경읽기 YouTube 구약 장별 영상 ID 전체 매핑\n\n';
js += 'export const OT_VIDEO_MAP = {\n';
for (const [bookId, chapters] of Object.entries(result)) {
  const entries = Object.entries(chapters).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  if (entries.length === 0) {
    js += `  // ${bookId}: (no data)\n`;
    continue;
  }
  js += `  ${bookId}: {\n`;
  for (const [ch, id] of entries) {
    js += `    ${ch}: '${id}',\n`;
  }
  js += '  },\n';
}
js += '};\n';

fs.writeFileSync('video_map_ot.js', js, 'utf8');
console.log('\nDone! video_map_ot.js written.');
