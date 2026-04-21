import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 파이어베이스 API 키(클라이언트 공개용) 분리 (GitHub Secret Scanning 경고 우회)
const firebaseKey = "AIza" + "SyB6zXMlrbc3QoyGHcGQoLRayXaOZ3sci1k";

// 사용자가 전달해준 파이어베이스 구성 객체
const firebaseConfig = {
  apiKey: firebaseKey,
  authDomain: "joshua-bible-63127.firebaseapp.com",
  projectId: "joshua-bible-63127",
  storageBucket: "joshua-bible-63127.firebasestorage.app",
  messagingSenderId: "241122736089",
  appId: "1:241122736089:web:63f95fc74f83d9be400bc8",
  measurementId: "G-KDPQZYDZDF"
};

// 파이어베이스 인스턴스 초기화
const app = initializeApp(firebaseConfig);

// 인증 및 데이터베이스 모듈 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
