import fs from 'fs';

async function testHymnView() {
  const res = await fetch('https://hbible.co.kr/hb/hymn/view/1/?ptype_e=union');
  const html = await res.text();
  fs.writeFileSync('scripts/hymn_view_1.html', html, 'utf-8');
  console.log('Saved hymn_view_1.html, length:', html.length);
}

testHymnView();
