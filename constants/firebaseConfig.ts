import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-AvMEx_33Zk8-ZVb4cbD1sIUrb9tsUAw",
  authDomain: "est-app-87736.firebaseapp.com",
  databaseURL: "https://est-app-87736-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "est-app-87736",
  storageBucket: "est-app-87736.firebasestorage.app",
  messagingSenderId: "570404300161",
  appId: "1:570404300161:web:9c8870292e33d84858b480",
  measurementId: "G-XQPQP0TTRL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
