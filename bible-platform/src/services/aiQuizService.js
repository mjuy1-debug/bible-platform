import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const GEMINI_STORAGE_KEY = 'joshua_gemini_api_key';

// 1. API 키 가져오기 (localStorage 우선, 없으면 Firestore 전역 설정 확인)
export const getGeminiApiKey = async () => {
  // 로컬 스토리지 확인
  const localKey = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (localKey && localKey.trim()) return localKey.trim();

  // Firestore churchConfig 확인
  try {
    const configSnap = await getDoc(doc(db, 'churchConfig', 'aiSettings'));
    if (configSnap.exists()) {
      const remoteKey = configSnap.data()?.geminiApiKey;
      if (remoteKey && remoteKey.trim()) {
        localStorage.setItem(GEMINI_STORAGE_KEY, remoteKey.trim());
        return remoteKey.trim();
      }
    }
  } catch (err) {
    console.warn('Firestore AI 설정 조회 실패:', err);
  }
  return '';
};

// 2. API 키 저장하기 (로컬 + Firestore 동시 저장)
export const saveGeminiApiKey = async (key) => {
  if (!key) return;
  const cleanKey = key.trim();
  localStorage.setItem(GEMINI_STORAGE_KEY, cleanKey);
  try {
    await setDoc(doc(db, 'churchConfig', 'aiSettings'), {
      geminiApiKey: cleanKey,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore AI 키 저장 실패:', err);
  }
};

// 3. 설교 기반 10문항 퀴즈 자동 생성 함수
export const generateSermonQuiz = async (sermonInfo, explicitApiKey = '') => {
  const apiKey = explicitApiKey || await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const { title, scripture, preacher, date, summary } = sermonInfo;

  if (!title || !scripture) {
    throw new Error('설교 제목과 성경 본문은 필수 입력 사항입니다.');
  }

  const prompt = `당신은 성경 퀴즈 및 설교 복습 퀴즈 전문 출제 위원입니다.
다음 주일 설교 정보와 성경 본문을 깊이 분석하여 성도들의 은혜와 묵상을 돕는 4지선다형 성경 퀴즈 10문항을 출제해 주세요.

[설교 정보]
- 설교 제목: ${title}
- 설교 일자: ${date || new Date().toISOString().slice(0, 10)}
- 설교자: ${preacher || '김석주 목사님'}
- 성경 본문: ${scripture}
- 설교 요약/메시지:
${summary || '본문 말씀을 중심으로 설교 메시지와 연결하여 출제해주세요.'}

[출제 가이드라인]
1. 총 10문항을 출제하세요.
2. 성경 본문(${scripture})의 핵심 구절/사건/인물 내용과 설교 요약에 담긴 영적 교훈을 균형 있게 다루세요.
3. 난이도는 중급(성도들이 설교를 듣고 본문을 읽으면 기쁘게 풀 수 있는 수준)입니다.
4. 각 문제는 4개의 객관식 보기(options)를 가지며, 정답 인덱스(correct: 0, 1, 2, 3)가 한쪽으로 쏠리지 않고 0, 1, 2, 3번에 골고루 분산되도록 하세요.
5. 각 문제마다 성경 구절 근거(hintRef, hintText)와 따뜻하고 깊이 있는 복음적 해설(explanation)을 포함하세요.
6. 반드시 다른 설명 없이 오직 순수한 JSON 객체 하나만 출력하세요. 마크다운(\`\`\`json) 기호도 포함하지 마세요.

[출력 JSON 구조 규격]
{
  "bookName": "성경 책 이름 (예: 마태복음, 이사야 등)",
  "questions": [
    {
      "question": "문제 내용",
      "options": ["보기1", "보기2", "보기3", "보기4"],
      "correct": 0,
      "hintRef": "성경 구절 약칭 (예: 마 16:16)",
      "hintText": "힌트가 될 성경 구절 텍스트",
      "explanation": "정답 해설 및 영적 교훈 설명"
    }
  ]
}`;

  // 모델 호출 시도 (gemini-2.5-flash -> 실패 시 gemini-1.5-flash 폴백)
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const status = response.status;
        if (status === 400 || status === 403) {
          throw new Error('API_KEY_INVALID');
        }
        throw new Error(errorJson?.error?.message || `API 요청 실패 (HTTP ${status})`);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('AI 응답이 비어있습니다.');

      // JSON 파싱 (혹시 모를 마크다운 코드블록 제거)
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/i, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('문항 생성 형식이 올바르지 않습니다.');
      }

      // 최종 퀴즈 세트 데이터 포맷 완성
      return {
        category: "🎤 주일 설교 퀴즈",
        roundTitle: `🎤 설교 퀴즈 ✦ ${title}`,
        description: `${date || new Date().toISOString().slice(0, 10)} 설교 | 본문: ${scripture} | 설교: ${preacher || '김석주 목사님'}`,
        difficulty: "중급",
        bookName: parsed.bookName || scripture.split(' ')[0] || "성경",
        range: scripture,
        title: title,
        date: date || new Date().toISOString().slice(0, 10),
        questions: parsed.questions.map((q, idx) => ({
          question: q.question || `문제 ${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
          correct: typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3 ? q.correct : 0,
          hintRef: q.hintRef || scripture,
          hintText: q.hintText || "성경 본문 말씀을 묵상해 보세요.",
          explanation: q.explanation || "설교 말씀을 기억하며 바른 신앙으로 승리합시다."
        }))
      };
    } catch (err) {
      lastError = err;
      if (err.message === 'API_KEY_INVALID') throw err;
      console.warn(`모델 ${model} 실패, 다음 시도:`, err);
    }
  }

  throw lastError || new Error('퀴즈 생성에 실패했습니다.');
};
