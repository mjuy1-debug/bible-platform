const fs = require('fs');
let content = fs.readFileSync('bible-platform/src/data/dailyVerses.js', 'utf8');

// The first ALL_VERSES export ends here
const marker1 = 'export const ALL_VERSES = expandedVerses;\r\n';
const firstAVEnd = content.indexOf(marker1) + marker1.length;

// The second const STORAGE_KEY_PREFIX is what we want to keep
const marker2 = 'const STORAGE_KEY_PREFIX';
const storageKeyStart = content.indexOf(marker2, firstAVEnd);

// Remove everything between firstAVEnd and storageKeyStart
const fixed = content.slice(0, firstAVEnd) + '\r\n' + content.slice(storageKeyStart);
fs.writeFileSync('bible-platform/src/data/dailyVerses.js', fixed, 'utf8');
console.log('Done. New length:', fixed.split('\n').length, 'lines');
