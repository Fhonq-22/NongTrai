import { database } from "./firebase-config.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Kiểm tra xem tên người dùng đã tồn tại chưa
    const userRef = ref(database, 'Users/' + username);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            // Nếu tên người dùng đã tồn tại, thông báo lỗi
            alert('Tên người dùng đã tồn tại!');
        } else {
            // Nếu tên người dùng chưa tồn tại, thêm người dùng vào Firebase
            set(ref(database, 'Users/' + username), {
                password: password // Lưu mật khẩu (nên mã hóa trước khi lưu vào DB)
            })
            .then(() => {
                alert('Đăng ký thành công!');
                
                // Chuyển hướng đến trang đăng nhập (login.html)
                window.location.href = "login.html";
            })
            .catch((error) => {
                alert(`Có lỗi xảy ra: ${error.message}`);
                console.error(error);
            });
        }
    }).catch((error) => {
        alert(`Có lỗi xảy ra khi kiểm tra tên người dùng: ${error.message}`);
        console.error(error);
    });
});
