import { database } from "./firebase-config.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'warning');
        return;
    }

    // Kiểm tra xem tên người dùng đã tồn tại chưa
    const userRef = ref(database, 'Users/' + username);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            // Nếu tên người dùng đã tồn tại, thông báo lỗi
            showNotification('Tên người dùng đã tồn tại!', 'warning');
        } else {
            // Nếu tên người dùng chưa tồn tại, thêm người dùng vào Firebase
            set(ref(database, 'Users/' + username), {
                password: password // Lưu mật khẩu (nên mã hóa trước khi lưu vào DB)
            })
            .then(() => {
                // Thêm thông tin mặc định vào bảng UserProfiles
                set(ref(database, 'UserProfiles/' + username), {
                    xp: 0,                // Kinh nghiệm ban đầu
                    level: 1,             // Cấp độ ban đầu
                    coins: 100,           // Xu ban đầu
                    plotsUnlocked: 1      // Số ô đất ban đầu
                })
                .then(() => {
                    // Thêm ô đất mặc định vào UserLand
                    set(ref(database, 'UserLand/' + username), {
                        plots: [
                            { 
                                plantId: null,           // Chưa có cây trồng
                                growthStatus: "empty",   // Trạng thái trống
                                watered: false,          // Chưa tưới nước
                                growthStartDate: null,   // Không có ngày sinh trưởng
                                harvestDate: null       // Không có ngày thu hoạch
                            }
                        ]
                    })
                    .then(() => {
                        showNotification('Đăng ký thành công!', 'succes');
                        
                        // Chuyển hướng đến trang đăng nhập (login.html)
                        window.location.href = "login.html";
                    })
                    .catch((error) => {
                        showNotification(`Có lỗi xảy ra khi tạo UserLand: ${error.message}`, 'error');
                        console.error(error);
                    });
                })
                .catch((error) => {
                    showNotification(`Có lỗi xảy ra khi tạo UserProfiles: ${error.message}`, 'error');
                    console.error(error);
                });
            })
            .catch((error) => {
                showNotification(`Có lỗi xảy ra khi đăng ký: ${error.message}`, 'error');
                console.error(error);
            });
        }
    }).catch((error) => {
        showNotification(`Có lỗi xảy ra khi kiểm tra tên người dùng: ${error.message}`, 'error');
        console.error(error);
    });
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

    // Xóa ảnh sau 5 giây với hiệu ứng
    setTimeout(() => {
        img.remove(); // Xóa ảnh khi nó hoàn thành hiệu ứng
    }, 5000); // Chờ 5 giây
}

// Hiển thị ảnh mới mỗi giây
setInterval(showRandomImage, 1000);
