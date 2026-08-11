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
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : 'https://mjuy1-debug.github.io/bible-platform/default-thumbnail.jpg';
};

const SHARE_DIR = path.join(__dirname, '../public/share');

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

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sermon.title} - 화도벧엘교회</title>
    
    <!-- Open Graph for KakaoTalk / Social Media -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${sermon.title}" />
    <meta property="og:description" content="${sermon.scripture} | ${sermon.preacher}" />
    <meta property="og:image" content="${getThumbnail(sermon.videoUrl)}" />
    
    <!-- Redirect to App -->
    <script>
      // Replace location so the back button doesn't trap the user
      window.location.replace('/bible-platform/#/sermons?id=${sermon.id}');
    </script>
</head>
<body>
    <p style="text-align:center; padding-top: 50px; font-family: sans-serif;">앱으로 이동 중입니다...</p>
</body>
</html>`;

  fs.writeFileSync(path.join(sermonDir, 'index.html'), html);
  count++;
}

console.log(`✅ Generated ${count} share pages in public/share/`);
