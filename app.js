import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "REPLACE",
  authDomain: "REPLACE",
  projectId: "REPLACE",
  storageBucket: "REPLACE",
  messagingSenderId: "REPLACE",
  appId: "REPLACE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("addTaskBtn").onclick = async () => {
  const ref = doc(db, "tasks", "default");
  await setDoc(ref, { lastAdded: Date.now() });
  alert("Task saved to Firebase!");
};
