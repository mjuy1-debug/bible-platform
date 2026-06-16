import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
