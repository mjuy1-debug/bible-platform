import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBB65Nw8MZZr1DumXeInlVrR5Mr9bssCAk",
  authDomain: "bible-platform.firebaseapp.com",
  projectId: "bible-platform",
  storageBucket: "bible-platform.firebasestorage.app",
  messagingSenderId: "25518742112",
  appId: "1:25518742112:web:ba2cdfc43f03ac294dc105"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log('Checking Firestore quizzes collection...');
  try {
    const snap = await getDocs(collection(db, 'quizzes'));
    console.log(`Firestore 'quizzes' collection has ${snap.docs.length} documents.`);
    snap.docs.forEach((docSnap, idx) => {
      const data = docSnap.data();
      console.log(`[${idx+1}] ID: ${docSnap.id} | category: ${data.category} | title: ${data.roundTitle || data.title}`);
      if (data.questions && data.questions.length > 0) {
        console.log(`   Q1: ${data.questions[0].question} (total ${data.questions.length} questions)`);
      }
    });
  } catch (e) {
    console.error('Error fetching Firestore quizzes:', e);
  }
}

check();
