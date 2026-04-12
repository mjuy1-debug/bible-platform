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
app.use(express.json({ limit: '10mb' }));

// CORS (Vite 개발 서버에서 호출 허용)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const SCHEDULE_DATA_PATH = path.join(__dirname, 'src', 'data', 'scheduleData.js');

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
    const userEvents = events.filter(e => !['holiday', 'liturgy'].includes(e.category));

    const eventLines = userEvents.map((e, idx) => {
      const timeStr = e.time ? `, time: '${e.time}'` : '';
      const endStr = e.endDate ? `, endDate: '${e.endDate}'` : '';
      const descStr = e.description ? `, description: '${e.description.replace(/'/g, "\\'")}'` : '';
      return `  { id: ${idx + 1}, title: '${e.title}', date: '${e.date}'${timeStr}${endStr}, category: '${e.category}'${descStr} },`;
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

    res.json({ ok: true, message: '✅ 저장 및 GitHub 배포가 완료되었습니다!' });
  } catch (err) {
    console.error('❌ 오류:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🛠️  관리자 API 서버 실행 중: http://localhost:${PORT}`);
  console.log('   일정 저장 및 GitHub 자동 배포 준비 완료!\n');
});
