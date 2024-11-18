// Import đối tượng database từ firebase-config.js
import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Lắng nghe sự kiện form submit để đăng nhập
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();  // Loại bỏ khoảng trắng
    const password = document.getElementById('password').value.trim();  // Loại bỏ khoảng trắng

    // Kiểm tra nếu tên người dùng và mật khẩu không rỗng
    if (!username || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Kiểm tra người dùng từ Firebase Realtime Database
    get(ref(database, 'Users/' + username)).then((snapshot) => {
        // Kiểm tra nếu người dùng tồn tại và mật khẩu đúng
        if (snapshot.exists() && snapshot.val().password === password) {
            console.log("Tên người dùng hợp lệ");

            // Nếu người dùng là Admin, chuyển đến trang settings
            if (username === "Admin") {
                console.log("Chuyển đến settings.html");
                window.location.href = "settings.html";
            } else {
                // Nếu không phải Admin, chuyển đến Dashboard
                console.log("Chuyển đến dashboard.html");
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
