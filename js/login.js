// Import the shared Firebase configuration
import { database } from "./firebase-config.js";
import { ref, get, child } from "firebase/database"; // Dùng nếu bạn sử dụng Realtime Database

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Kiểm tra thông tin người dùng trong Realtime Database
    const dbRef = ref(database);
    get(child(dbRef, `Users/${username}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                alert('Login successful!');
            } else {
                alert('Invalid password!');
            }
        } else {
            alert('User not found!');
        }
    }).catch((error) => {
        alert(`Error: ${error.message}`);
        console.error(error);
    });
});
