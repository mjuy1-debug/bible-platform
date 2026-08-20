import fs from 'fs';

async function testScoreFull() {
  const res = await fetch('http://www.holybible.or.kr/HYMN/cgi/hymnnote.php?VR=HYMN&DN=405');
  const html = await res.text();
  fs.writeFileSync('scripts/holybible_405.html', html, 'utf-8');
  console.log('Saved holybible_405.html');
}

testScoreFull();
