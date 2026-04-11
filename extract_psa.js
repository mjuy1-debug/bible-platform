const { execSync } = require('child_process');
const fs = require('fs');

console.log('Extracting Psalms...');
const raw = execSync(
  'yt-dlp "https://www.youtube.com/playlist?list=PLVcVykBcFZTTDNtQJsc4j_sU3Op0WKcO-" --flat-playlist --dump-json',
  { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
);
const lines = raw.trim().split('\n').filter(Boolean);
const chapters = {};
for (const line of lines) {
  try {
    const item = JSON.parse(line);
    // 시편은 '편' 사용
    const match = item.title.match(/(\d+)편/) || item.title.match(/(\d+)장/);
    if (match) { chapters[parseInt(match[1])] = item.id; }
  } catch(e) {}
}
const sorted = Object.entries(chapters).sort((a,b)=>parseInt(a[0])-parseInt(b[0]));
console.log('총 ' + sorted.length + '편 추출');
const js = sorted.map(([ch,id]) => `    ${ch}: '${id}',`).join('\n');
fs.writeFileSync('psa_map.txt', js, 'utf8');
console.log('Done!');
