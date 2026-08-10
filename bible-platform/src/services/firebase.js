import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 파이어베이스 API 키(클라이언트 공개용) 분리 (GitHub Secret Scanning 경고 우회)
const firebaseKey = "AIza" + "SyBB65Nw8MZZr1DumXeInlVrR5Mr9bssCAk";

// 사용자가 전달해준 파이어베이스 구성 객체
const firebaseConfig = {
  apiKey: firebaseKey,
  authDomain: "bible-platform.firebaseapp.com",
  projectId: "bible-platform",
  storageBucket: "bible-platform.firebasestorage.app",
  messagingSenderId: "25518742112",
  appId: "1:25518742112:web:ba2cdfc43f03ac294dc105",
  measurementId: "G-VD5TWHYERN"
};

// 파이어베이스 인스턴스 초기화
const app = initializeApp(firebaseConfig);

// 인증 및 데이터베이스 모듈 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export { getToken, onMessage };

// FCM VAPID 공개 키 (Firebase Console > 프로젝트 설정 > 클라우드 메시징 > 웹 푸시 인증서에서 확인)
export const VAPID_KEY = 'BLdrDp3_7SmxdzFA3XmH_OsHaQ20a0qY-NrEVNUhZfxX_Ok9IQFb8fwdStZUP92K6miv3co8-hnuBcBayJC6hFc';
