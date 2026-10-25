import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const GITHUB_STORAGE_KEY = 'joshua_github_token';
export const GITHUB_OWNER = 'mjuy1-debug';
export const GITHUB_REPO = 'bible-platform';
export const GITHUB_PDF_FOLDER = 'bible-platform/public/pdfs';

// 1. GitHub 토큰 가져오기 (localStorage 우선, 없으면 Firestore 전역 설정 확인)
export const getGitHubToken = async () => {
  const localToken = localStorage.getItem(GITHUB_STORAGE_KEY);
  if (localToken && localToken.trim()) return localToken.trim();

  try {
    const docSnap = await getDoc(doc(db, 'churchConfig', 'githubSettings'));
    if (docSnap.exists()) {
      const remoteToken = docSnap.data()?.githubToken;
      if (remoteToken && remoteToken.trim()) {
        localStorage.setItem(GITHUB_STORAGE_KEY, remoteToken.trim());
        return remoteToken.trim();
      }
    }
  } catch (err) {
    console.warn('Firestore GitHub 설정 조회 실패:', err);
  }
  return '';
};

// 2. GitHub 토큰 저장하기 (로컬 + Firestore 동시 저장)
export const saveGitHubToken = async (token) => {
  if (!token) return;
  const cleanToken = token.trim();
  localStorage.setItem(GITHUB_STORAGE_KEY, cleanToken);
  try {
    await setDoc(doc(db, 'churchConfig', 'githubSettings'), {
      githubToken: cleanToken,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore GitHub 토큰 저장 실패:', err);
  }
};

// ArrayBuffer -> Base64 안전 변환 (대용량 파일 스택 오버플로우 방지)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB chunk
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, len)));
  }
  return btoa(binary);
}

// 3. GitHub Contents API로 PDF 파일 직접 업로드 및 자동 커밋
export const uploadPdfToGitHub = async (file, explicitToken = '') => {
  const token = explicitToken || await getGitHubToken();
  if (!token) {
    throw new Error('NO_GITHUB_TOKEN');
  }

  if (!file) {
    throw new Error('업로드할 PDF 파일이 없습니다.');
  }

  // 1. 파일을 ArrayBuffer로 읽은 후 Base64 변환
  const arrayBuffer = await file.arrayBuffer();
  const base64Content = arrayBufferToBase64(arrayBuffer);

  const safeFileName = `sermon_${Date.now()}.pdf`;
  const apiPath = `${GITHUB_PDF_FOLDER}/${safeFileName}`;
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${apiPath}`;

  const commitMessage = `docs(sermon): 설교 요약 PDF 자동 업로드 (${safeFileName})`;

  // 2. GitHub Contents API 호출 (PUT)
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      branch: 'main'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      throw new Error('GITHUB_TOKEN_INVALID');
    }
    throw new Error(errorData?.message || `GitHub 업로드 실패 (HTTP ${response.status})`);
  }

  const resultData = await response.json();
  console.log('✅ GitHub PDF 커밋 완료:', resultData);

  // 우리 플랫폼에서 사용할 정적 파일 경로 반환
  return {
    ok: true,
    fileName: safeFileName,
    fileUrl: `/pdfs/${safeFileName}`,
    downloadUrl: resultData.content?.download_url || '',
    commitSha: resultData.commit?.sha || ''
  };
};
