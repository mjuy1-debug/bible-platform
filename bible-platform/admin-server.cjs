/**
 * 관리자 전용 로컬 API 서버
 * - npm run dev:admin 으로 실행
 * - 일정 저장, git commit, git push 자동화
 */
const express = require('express');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

// CORS (Vite 개발 서버에서 호출 허용) - 에러 발생 시에도 CORS 헤더가 포함되도록 최상단에 배치
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 파일 크기 제한을 50mb로 넉넉하게 늘림 (PDF 업로드용)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const SCHEDULE_DATA_PATH = path.join(__dirname, 'src', 'data', 'scheduleData.js');
const SERMON_DATA_PATH = path.join(__dirname, 'src', 'data', 'sermonData.js');

// ── 현재 scheduleData.js 내용 확인용 (선택적) ──
app.get('/api/admin/status', (req, res) => {
  res.json({ ok: true, message: '관리자 서버 정상 작동 중' });
});

// ── 핵심: 일정 저장 + git commit + push ──
app.post('/api/admin/save-and-deploy', (req, res) => {
  const { events, commitMessage } = req.body;

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ ok: false, error: '유효한 events 배열이 필요합니다.' });
  }

  try {
    // 1. scheduleData.js 파일의 SAMPLE_EVENTS 부분만 교체
    const currentContent = fs.readFileSync(SCHEDULE_DATA_PATH, 'utf-8');

    // 교회 일정/여호수아 일정만 추출 (공휴일/절기 제외)
    const userEvents = events.filter(e => {
      const cats = Array.isArray(e.category) ? e.category : [e.category];
      return !cats.some(c => ['holiday', 'liturgy'].includes(c));
    });

    const eventLines = userEvents.map((e, idx) => {
      const timeStr = e.time ? `, time: '${e.time}'` : '';
      const endStr = e.endDate ? `, endDate: '${e.endDate}'` : '';
      const safeTitle = e.title ? e.title.replace(/'/g, "\\'") : '';
      const safeDesc = e.description ? e.description.replace(/`/g, "\\`").replace(/\$/g, "\\$") : '';
      const descStr = safeDesc ? `, description: \`${safeDesc}\`` : '';
      let catStr;
      if (Array.isArray(e.category)) {
        catStr = `[${e.category.map(c => `'${c}'`).join(', ')}]`;
      } else {
        catStr = `'${e.category}'`;
      }
      return `  { id: ${idx + 1}, title: '${safeTitle}', date: '${e.date}'${timeStr}${endStr}, category: ${catStr}${descStr} },`;
    }).join('\n');

    const newEventsBlock = `  // ── 사용자/교회 일정 ──\n${eventLines}`;

    // SAMPLE_EVENTS 배열 내용을 정규식으로 교체
    const updatedContent = currentContent.replace(
      /(export const SAMPLE_EVENTS = \[\s*\/\/ ── 공휴일 \+ 교회 절기 자동 포함 ──\s*\.\.\.HOLIDAYS_2026,\s*\.\.\.LITURGY_2026,\s*\n)([\s\S]*?)(\];)/,
      `$1\n${newEventsBlock}\n$3`
    );

    fs.writeFileSync(SCHEDULE_DATA_PATH, updatedContent, 'utf-8');
    console.log('✅ scheduleData.js 파일 저장 완료');

    // 2. git add
    execSync('git add src/data/scheduleData.js', {
      cwd: __dirname,
      encoding: 'utf-8',
    });

    // 3. git commit
    const msg = commitMessage || '관리자: 일정 업데이트';
    execSync(`git commit -m "${msg}"`, {
      cwd: __dirname,
      encoding: 'utf-8',
    });
    console.log('✅ git commit 완료');

    // 4. git push
    execSync('git push origin main', {
      cwd: __dirname,
      encoding: 'utf-8',
    });
    console.log('✅ git push 완료');

    // 5. GitHub Pages 실제 배포 (gh-pages) - 백그라운드로 실행하여 응답 지연 방지
    console.log('⏳ 실제 앱(GitHub Pages)에 배포 중입니다... (1~2분 소요)');
    const { exec } = require('child_process');
    // gh-pages 캐시 디렉토리 제거 후 배포 (구버전 캐시 방지)
    const os = require('os');
    const tmpDir = os.tmpdir();
    const clearAndDeploy = `
      powershell -Command "Get-ChildItem '${tmpDir}' -Filter 'gh-pages*' -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue"
    `.trim();
    exec(clearAndDeploy, { cwd: __dirname }, () => {
      exec('npx gh-pages -d dist', { cwd: __dirname, encoding: 'utf-8' }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ 배포 중 오류 발생:', error);
        } else {
          console.log('✅ GitHub Pages 배포 완료');
        }
      });
    });

    res.json({ ok: true, message: '✅ 저장 및 GitHub 푸시 완료!\n(실제 웹사이트 반영에는 1~2분 정도 소요될 수 있습니다.)' });
  } catch (err) {
    console.error('❌ 오류:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── 설교 저장 + git commit + push ──
app.post('/api/admin/save-sermons', (req, res) => {
  const { sermons, commitMessage } = req.body;

  if (!sermons || !Array.isArray(sermons)) {
    return res.status(400).json({ ok: false, error: '유효한 sermons 배열이 필요합니다.' });
  }

  try {
    const fileContent = `export const SERMONS = ${JSON.stringify(sermons, null, 2)};\n`;

    fs.writeFileSync(SERMON_DATA_PATH, fileContent, 'utf-8');
    console.log('✅ sermonData.js 파일 저장 완료');

    // git add
    execSync('git add src/data/sermonData.js', { cwd: __dirname, encoding: 'utf-8' });

    // git commit
    const msg = commitMessage || '관리자: 말씀 업데이트';
    execSync(`git commit -m "${msg}"`, { cwd: __dirname, encoding: 'utf-8' });
    console.log('✅ git commit 완료');

    // git push
    execSync('git push origin main', { cwd: __dirname, encoding: 'utf-8' });
    console.log('✅ git push 완료');

    // GitHub Pages 배포
    console.log('⏳ 실제 앱(GitHub Pages)에 배포 중입니다... (1~2분 소요)');
    execSync('npm run deploy', { cwd: __dirname, encoding: 'utf-8' });
    console.log('✅ GitHub Pages 배포 완료');

    res.json({ ok: true, message: '✅ 저장 및 GitHub 배포가 완료되었습니다!' });
  } catch (err) {
    console.error('❌ 오류:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/admin/upload-pdf', (req, res) => {
  const { fileName, fileData } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ ok: false, error: '파일명과 데이터가 필요합니다.' });
  }

  try {
    const publicPdfsPath = path.join(__dirname, 'public', 'pdfs');
    if (!fs.existsSync(publicPdfsPath)) {
      fs.mkdirSync(publicPdfsPath, { recursive: true });
    }

    const filePath = path.join(publicPdfsPath, fileName);
    // base64 decoding
    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    // git add (배포에 포함되도록)
    execSync(`git add public/pdfs/${fileName}`, { cwd: __dirname, encoding: 'utf-8' });

    console.log(`✅ PDF 파일 업로드 완료: ${fileName}`);
    res.json({ ok: true, fileUrl: `/pdfs/${fileName}` });
  } catch (err) {
    console.error('❌ 업로드 오류:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🛠️  관리자 API 서버 실행 중: http://localhost:${PORT}`);
  console.log('   일정 저장 및 GitHub 자동 배포 준비 완료!\n');
});
