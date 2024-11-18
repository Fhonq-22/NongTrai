import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Kiểm tra người dùng từ Firebase Realtime Database
    get(ref(database, 'Users/' + username)).then((snapshot) => {
        if (snapshot.exists() && snapshot.val().password === password) {
            // Nếu người dùng là Admin, chuyển đến trang settings
            if (username === "Admin") {
                window.location.href = "settings.html";
            } else {
                // Nếu không phải Admin, chuyển đến Dashboard
                window.location.href = "dashboard.html";
            }

            // Lưu trạng thái đăng nhập vào localStorage
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            alert('Tên người dùng hoặc mật khẩu không đúng!');
        }
    }).catch((error) => {
        alert(`Có lỗi xảy ra: ${error.message}`);
        console.error(error);
    });
});
