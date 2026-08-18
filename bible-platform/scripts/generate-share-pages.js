import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERMONS } from '../src/data/sermonData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extractId = (url) => {
  if (!url) return "";
  const r = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const m = url.match(r);
  return (m && m[2].length === 11) ? m[2] : "";
};

const getThumbnail = (url) => {
  const id = extractId(url);
  // hqdefault: 480×360 (카카오톡 미리보기에 충분한 고화질)
  return id
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : 'https://mjuy1-debug.github.io/bible-platform/og_image_v2.png';
};

const SHARE_DIR = path.join(__dirname, '../public/share');
const BASE_URL = 'https://mjuy1-debug.github.io/bible-platform';

// Ensure public/share exists
if (!fs.existsSync(SHARE_DIR)) {
  fs.mkdirSync(SHARE_DIR, { recursive: true });
}

let count = 0;
for (const sermon of SERMONS) {
  const sermonDir = path.join(SHARE_DIR, String(sermon.id));
  if (!fs.existsSync(sermonDir)) {
    fs.mkdirSync(sermonDir, { recursive: true });
  }

  const thumbnail = getThumbnail(sermon.videoUrl);
  const shareUrl  = `${BASE_URL}/share/${sermon.id}/`;
  const appUrl    = `${BASE_URL}/#/sermon?id=${sermon.id}`;
  const description = [sermon.scripture, sermon.preacher, '벧엘교회 주일 설교']
    .filter(Boolean).join(' | ');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sermon.title} - 벧엘교회</title>
    <meta name="description" content="${description}">

    <!-- Open Graph (KakaoTalk / Facebook / Instagram) -->
    <meta property="og:type"        content="article" />
    <meta property="og:site_name"   content="벧엘교회" />
    <meta property="og:title"       content="${sermon.title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url"         content="${shareUrl}" />
    <meta property="og:image"       content="${thumbnail}" />
    <meta property="og:image:width"  content="480" />
    <meta property="og:image:height" content="360" />
    <meta property="og:locale"      content="ko_KR" />

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="${sermon.title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image"       content="${thumbnail}" />

    <!-- Redirect to App -->
    <script>
      window.location.replace('${appUrl}');
    </script>
</head>
<body>
    <p style="text-align:center; padding-top: 50px; font-family: sans-serif; color:#888;">
      앱으로 이동 중입니다...
    </p>
</body>
</html>`;

  fs.writeFileSync(path.join(sermonDir, 'index.html'), html);
  count++;
}

console.log(`✅ Generated ${count} share pages in public/share/`);

