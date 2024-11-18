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
                        alert('Đăng ký thành công!');
                        
                        // Chuyển hướng đến trang đăng nhập (login.html)
                        window.location.href = "login.html";
                    })
                    .catch((error) => {
                        alert(`Có lỗi xảy ra khi tạo UserLand: ${error.message}`);
                        console.error(error);
                    });
                })
                .catch((error) => {
                    alert(`Có lỗi xảy ra khi tạo UserProfiles: ${error.message}`);
                    console.error(error);
                });
            })
            .catch((error) => {
                alert(`Có lỗi xảy ra khi đăng ký: ${error.message}`);
                console.error(error);
            });
        }
    }).catch((error) => {
        alert(`Có lỗi xảy ra khi kiểm tra tên người dùng: ${error.message}`);
        console.error(error);
    });
});
