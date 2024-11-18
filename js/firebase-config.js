// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Nếu bạn sử dụng Firestore
import { getDatabase } from "firebase/database"; // Nếu bạn sử dụng Realtime Database

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzbGRryfLe9EnMYxh9hMoD5VfUZ9igOac",
    authDomain: "farmdb-57f93.firebaseapp.com",
    projectId: "farmdb-57f93",
    storageBucket: "farmdb-57f93.appspot.com",
    messagingSenderId: "84810548521",
    appId: "1:84810548521:web:37add9e61e9d26ff426338",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const firestore = getFirestore(app); // Nếu bạn dùng Firestore
export const database = getDatabase(app); // Nếu bạn dùng Realtime Database
