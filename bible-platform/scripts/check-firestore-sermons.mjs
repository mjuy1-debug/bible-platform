import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseKey = "AIza" + "SyBB65Nw8MZZr1DumXeInlVrR5Mr9bssCAk";
const firebaseConfig = {
  apiKey: firebaseKey,
  authDomain: "bible-platform.firebaseapp.com",
  projectId: "bible-platform",
  storageBucket: "bible-platform.firebasestorage.app",
  messagingSenderId: "25518742112",
  appId: "1:25518742112:web:ba2cdfc43f03ac294dc105"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSermons() {
  const snap = await getDocs(collection(db, 'sermons'));
  console.log(`Total sermons in Firestore: ${snap.size}`);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Doc ID: ${doc.id} | Title: "${data.title}" | Date: "${data.date}" | Preacher: "${data.preacher}"`);
  });
}

checkSermons().catch(console.error);
