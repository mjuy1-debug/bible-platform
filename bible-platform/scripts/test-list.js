import fs from 'fs';

async function testList() {
  const res = await fetch('https://hbible.co.kr/hb/hymn/list/');
  const html = await res.text();
  fs.writeFileSync('scripts/hymn_list.html', html, 'utf-8');
  console.log('Saved hymn_list.html');
}

testList();
