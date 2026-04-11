const fs = require('fs');
const content = fs.readFileSync('./bible-platform/src/data/youtubeLinks.js', 'utf8');

const checks = {
  'OT (gen)': content.includes('gen: {'),
  'OT (mal)': content.includes('mal: {'),
  'Psalm (psa)': content.includes('psa: {'),
  'NT (mat)': content.includes('mat: {'),
  'NT (rev)': content.includes('rev: {'),
  'PLAYLIST_MAP': content.includes('export const PLAYLIST_MAP'),
  'getYouTubeUrl': content.includes('export const getYouTubeUrl'),
};

console.log('=== youtubeLinks.js integrity check ===');
for (const [k, v] of Object.entries(checks)) {
  console.log((v ? '✅' : '❌') + ' ' + k);
}

const psaIdx = content.indexOf('psa: {');
if (psaIdx >= 0) {
  console.log('\npsa preview:', content.slice(psaIdx, psaIdx + 80).replace(/\n/g, ' '));
}
console.log('\nFile size:', content.length, 'chars');
