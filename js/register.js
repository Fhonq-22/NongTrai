// Import the shared Firebase configuration
import { database } from "./firebase-config.js";
import { ref, set } from "firebase/database"; // Dùng nếu bạn sử dụng Realtime Database

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Thêm người dùng mới vào Realtime Database
    set(ref(database, 'Users/' + username), {
        password: password // Nên mã hóa mật khẩu trước khi lưu
    })
    .then(() => {
        alert('Registration successful!');
    })
    .catch((error) => {
        alert(`Error: ${error.message}`);
        console.error(error);
    });
});
