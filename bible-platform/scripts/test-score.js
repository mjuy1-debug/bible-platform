async function testScore() {
  const res = await fetch('http://www.holybible.or.kr/HYMN/cgi/hymnnote.php?VR=HYMN&DN=405');
  const html = await res.text();
  console.log('Score HTML length:', html.length);
  const imgMatches = html.match(/<img[^>]+src="([^">]+)"/gi);
  console.log('Images in hymnnote.php:', imgMatches);
}

testScore();
