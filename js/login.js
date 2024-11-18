// Import đối tượng database từ firebase-config.js
import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Lắng nghe sự kiện form submit để đăng nhập người dùng
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Kiểm tra thông tin đăng nhập từ Firebase Realtime Database
    const userRef = ref(database, 'Users/' + username);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                alert('Đăng nhập thành công!');
                // Chuyển hướng đến trang chính (hoặc dashboard)
                window.location.href = "dashboard.html";  // Thay đổi URL trang bạn muốn chuyển đến
            } else {
                alert('Mật khẩu không đúng!');
            }
        } else {
            alert('Tên người dùng không tồn tại!');
        }
    }).catch((error) => {
        alert(`Có lỗi xảy ra: ${error.message}`);
        console.error(error);
    });
});
