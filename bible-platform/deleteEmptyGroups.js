import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseJs = fs.readFileSync(path.join(process.cwd(), 'src/services/firebase.js'), 'utf-8');
const configMatch = firebaseJs.match(/const firebaseConfig = ({[\s\S]*?});/);
if (!configMatch) {
  console.error("Could not find firebaseConfig");
  process.exit(1);
}
const firebaseConfig = eval('(' + configMatch[1] + ')');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanUp() {
  const snapshot = await getDocs(collection(db, 'groups'));
  let count = 0;
  for (const document of snapshot.docs) {
    const data = document.data();
    if (data.memberCount <= 0) {
      console.log(`Deleting empty group: ${data.name} (${document.id})`);
      await deleteDoc(doc(db, 'groups', document.id));
      count++;
    }
  }
  console.log(`Deleted ${count} empty groups.`);
  process.exit(0);
}

cleanUp().catch(console.error);
