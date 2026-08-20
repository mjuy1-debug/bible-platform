import fs from 'fs';

async function test() {
  const res = await fetch('https://hbible.co.kr/hymn/view.php?hymn_no=1');
  const html = await res.text();
  fs.writeFileSync('scripts/sample_hymn.html', html, 'utf-8');
  console.log('Saved sample_hymn.html, size:', html.length);
}

test();
