const { execSync } = require('child_process');
const fs = require('fs');

const playlists = {
  mat: 'PLVcVykBcFZTSTXBhoJ7Vy8k3wme-WazWx',
  mar: 'PLVcVykBcFZTQ-DDhzFEe9VFNbIga8bsRu',
  luk: 'PLVcVykBcFZTRw2xviipQP_nSMwuIjrSdU',
  joh: 'PLVcVykBcFZTSVPCalzgtqeGgiDBI_l3uY',
  act: 'PLVcVykBcFZTRwKAucEvWGscP9_xo0z9Rm',
  rom: 'PLVcVykBcFZTQErCfBGIQxP8msUpTfnmPk',
  '1co': 'PLVcVykBcFZTR6hWiFEQcksQW0mZu1fHQS',
  '2co': 'PLVcVykBcFZTShgrluRh6vwcRUGRQ0QTY0',
  gal: 'PLVcVykBcFZTRLZaBZaPgI1JqlexuhFtlD',
  eph: 'PLVcVykBcFZTR3dtKvRgBQk3r0lTzUlITL',
  php: 'PLVcVykBcFZTQKPcF6BVLrmrBkWkNVq_lt',
  col: 'PLVcVykBcFZTRWCNKuQoMi9wP08LVPUy94',
  '1th': 'PLVcVykBcFZTS2Z_h8SSsMRYI5yesRZXVx',
  '2th': 'PLVcVykBcFZTTtDC6gxCWQounEL3OuBuNf',
  '1ti': 'PLVcVykBcFZTQz2XMSjpXSTaJnU0iog_ip',
  '2ti': 'PLVcVykBcFZTTvGsQb4HFyyuQJbGc0ethz',
  tit: 'PLVcVykBcFZTS4AiVsTwtm2mPqp4dne4WC',
  phm: 'PLVcVykBcFZTQzPG1SJjRhge1y1wtp1cso',
  heb: 'PLVcVykBcFZTRjPKsRKmc9oh6tAM4GqMVN',
  jam: 'PLVcVykBcFZTSc6pVweQMnjjNLA2ABTrzv',
  '1pe': 'PLVcVykBcFZTRC-7RuMXfGHS3fz0_UwHvx',
  '2pe': 'PLVcVykBcFZTSW5MJ9RaXIq82RShopBEZd',
  '1jo': 'PLVcVykBcFZTRYzvGCsEIeFbM5zLikXKlU',
  '2jo': 'PLVcVykBcFZTSadmVOtxjoRN1CvPW7ueCo',
  '3jo': 'PLVcVykBcFZTQ7k5thEDMAohYmV1nkwdDF',
  jud: 'PLVcVykBcFZTTgDnBM9vAFn62ShCwrgULi',
  rev: 'PLVcVykBcFZTQBSmAaWch8DXgd1T3Svx2z',
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
  }
}

// Generate JS output
let js = '// 공동체성경읽기 YouTube 장별 영상 ID 전체 매핑 (신약)\n';
js += '// 자동 생성됨 - yt-dlp로 추출\n\n';
js += 'export const VIDEO_MAP = {\n';
for (const [bookId, chapters] of Object.entries(result)) {
  js += `  '${bookId}': {\n`;
  for (const [ch, id] of Object.entries(chapters).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    js += `    ${ch}: '${id}',\n`;
  }
  js += '  },\n';
}
js += '};\n\n';
js += `export const getVideoId = (bookId, chapter) => VIDEO_MAP[bookId]?.[chapter] || null;\n`;

fs.writeFileSync('video_map_nt.js', js, 'utf8');
console.log('\nDone! video_map_nt.js written.');
