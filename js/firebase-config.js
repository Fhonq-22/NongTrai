// firebase-config.js

// Import các chức năng từ Firebase SDK qua CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js"; // Đúng đường dẫn để lấy Realtime Database

// Cấu hình Firebase của bạn
const firebaseConfig = {
    apiKey: "AIzaSyCzbGRryfLe9EnMYxh9hMoD5VfUZ9igOac",
    authDomain: "farmdb-57f93.firebaseapp.com",
    databaseURL: "https://farmdb-57f93-default-rtdb.firebaseio.com",
    projectId: "farmdb-57f93",
    storageBucket: "farmdb-57f93.firebasestorage.app",
    messagingSenderId: "84810548521",
    appId: "1:84810548521:web:37add9e61e9d26ff426338",
    measurementId: "G-VYWKPDMMR1"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Lấy đối tượng database từ Firebase
const database = getDatabase(app);

// Export đối tượng database để sử dụng trong các module khác
export { database };
