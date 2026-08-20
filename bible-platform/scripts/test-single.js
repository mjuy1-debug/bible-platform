async function test() {
  const res = await fetch('https://hbible.co.kr/hb/hymn/view/1050/?ptype_e=union');
  const html = await res.text();
  const titleMatch = html.match(/id="id_hymn_title"[^>]*>[\s\S]*?<h4>([\s\S]*?)<\/h4>/i);
  console.log('Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'none');
  const lyricsMatch = html.match(/<div class="textSpacing">([\s\S]*?)<\/div>/i);
  console.log('Lyrics:', lyricsMatch ? lyricsMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim().slice(0, 150) : 'none');
}

test();
