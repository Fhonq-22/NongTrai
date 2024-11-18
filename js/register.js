// Import đối tượng database từ firebase-config.js
import { database } from "./firebase-config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Lắng nghe sự kiện form submit để đăng ký người dùng
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Thêm người dùng mới vào Firebase Realtime Database
    set(ref(database, 'Users/' + username), {
        password: password // Lưu mật khẩu (nên mã hóa trước khi lưu vào DB)
    })
    .then(() => {
        alert('Đăng ký thành công!');
    })
    .catch((error) => {
        alert(`Có lỗi xảy ra: ${error.message}`);
        console.error(error);
    });
});
