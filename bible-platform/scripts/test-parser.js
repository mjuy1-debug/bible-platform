import fs from 'fs';

async function fetchHymn(num) {
  const url = `https://hbible.co.kr/hb/hymn/view/${num}/?ptype_e=union`;
  const res = await fetch(url);
  const html = await res.text();

  // 제목 추출
  const titleMatch = html.match(/id="id_hymn_title"[^>]*>[\s\S]*?<h4>[\s\S]*?<\/span>\s*(\d+장\s+[^<\n]+)/i);
  let rawTitle = titleMatch ? titleMatch[1].trim() : `통일찬송가 ${num}장`;
  // "1장 만복의 근원 하나님" -> "만복의 근원 하나님"
  let title = rawTitle.replace(/^\d+장\s*/, '').trim();

  // 가사 추출 (textSpacing 클래스 내부)
  const lyricsMatch = html.match(/<div class="textSpacing">([\s\S]*?)<\/div>/i);
  let lyricsText = '';
  if (lyricsMatch) {
    lyricsText = lyricsMatch[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  // 줄바꿈 정리 및 절(verse) 분리
  const verses = lyricsText
    .split(/\n\s*\n+/)
    .map(v => v.replace(/\s+/g, ' ').trim())
    .filter(v => v.length > 0);

  // 새찬송가 번호 추출 (옵션)
  // 대조표 매핑 찾기
  const newMatch = html.match(/\[새찬송가\]\s*(\d+)장/i) || html.match(/새찬송가\s*(\d+)장/i);
  let newNum = newMatch ? parseInt(newMatch[1], 10) : num;

  return {
    num,
    newNum,
    title,
    lyrics: verses.length > 0 ? verses : [lyricsText]
  };
}

async function test() {
  const testNums = [1, 28, 88, 405, 558];
  for (const n of testNums) {
    const data = await fetchHymn(n);
    console.log(`\n=== 통일찬송가 ${data.num}장 ===`);
    console.log('제목:', data.title);
    console.log('가사 절 수:', data.lyrics.length);
    console.log('가사 첫 절:', data.lyrics[0]);
  }
}

test();
