import fs from 'fs';

async function fetchFull() {
  const res = await fetch('https://hbible.co.kr/hb/hymn/view/1050/?ptype_e=union');
  const html = await res.text();
  fs.writeFileSync('scripts/hymn_1050.html', html, 'utf-8');
  console.log('Saved hymn_1050.html');
}

fetchFull();
