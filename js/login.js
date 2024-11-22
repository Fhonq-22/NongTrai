// Import đối tượng database từ firebase-config.js
import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Lắng nghe sự kiện form submit để đăng nhập
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim(); // Loại bỏ khoảng trắng
    const password = document.getElementById('password').value.trim(); // Loại bỏ khoảng trắng

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

const images = [
    "Ca-chua.png",
    "Ca-rot.png",
    "Cam.png",
    "Dau-tay.png",
    "Dua-hau.png",
    "Khoai-lang.png",
    "Lua.png",
    "Mia.png",
    "Ngo.png",
    "Rau-cai.png"
];

const container = document.getElementById("randomImageContainer");

function showRandomImage() {
    // Tạo phần tử ảnh
    const img = document.createElement("img");
    img.src = `img/${images[Math.floor(Math.random() * images.length)]}`; // Chọn ảnh ngẫu nhiên
    img.classList.add('show');  // Áp dụng hiệu ứng khi ảnh xuất hiện

    // Đảm bảo hình ảnh nằm hoàn toàn trong màn hình
    const imgWidth = 150; // Chiều rộng tối đa của ảnh
    const imgHeight = 150; // Chiều cao tối đa của ảnh
    const maxTop = window.innerHeight - imgHeight; // Vùng top hợp lệ
    const maxLeft = window.innerWidth - imgWidth; // Vùng left hợp lệ

    // Tính toán vị trí của ảnh sao cho nó có thể xuất hiện cả ở trên và dưới form
    const formHeight = document.querySelector('.container').offsetHeight; // Chiều cao form
    const formTop = document.querySelector('.container').getBoundingClientRect().top; // Vị trí của form trên trang

    // Random ảnh xuất hiện trên hoặc dưới form
    const safeTop = Math.random() < 0.5
        ? Math.random() * formTop // Xuất hiện ở phía trên form
        : Math.random() * (maxTop - formHeight) + formTop + formHeight; // Xuất hiện ở phía dưới form

    img.style.top = `${safeTop}px`;
    img.style.left = `${Math.random() * maxLeft}px`;

    // Thêm ảnh vào container
    container.appendChild(img);

    // Xóa ảnh sau 4 giây với hiệu ứng
    setTimeout(() => {
        img.remove(); // Xóa ảnh khi nó hoàn thành hiệu ứng
    }, 4000); // Chờ 4 giây
}

// Hiển thị ảnh mới mỗi giây
setInterval(showRandomImage, 1000);
