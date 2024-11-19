// Import đối tượng database từ firebase-config.js
import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Lắng nghe sự kiện form submit để đăng nhập
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();  // Loại bỏ khoảng trắng
    const password = document.getElementById('password').value.trim();  // Loại bỏ khoảng trắng

    // Kiểm tra nếu tên người dùng và mật khẩu không rỗng
    if (!username || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    try {
        // Kiểm tra người dùng từ Firebase Realtime Database
        const userRef = ref(database, `Users/${username}`);
        const snapshot = await get(userRef);

        // Kiểm tra nếu người dùng tồn tại và mật khẩu đúng
        if (snapshot.exists() && snapshot.val().password === password) {
            console.log("Tên người dùng hợp lệ");

            // Lưu trạng thái đăng nhập và userId vào localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', username);

            // Điều hướng dựa trên loại người dùng
            if (username === "Admin") {
                window.location.href = "settings.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } else {
            alert('Tên người dùng hoặc mật khẩu không đúng!');
        }
    } catch (error) {
        alert(`Có lỗi xảy ra: ${error.message}`);
        console.error(error);
    }
});
