import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

window.onload = async function () {
    // Kiểm tra người dùng có đăng nhập không
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');

    if (!isLoggedIn || !userId) {
        window.location.href = "login.html";  // Chuyển hướng đến trang đăng nhập nếu không đăng nhập
        return;
    }

    try {
        // Lấy dữ liệu người dùng từ Firebase
        const userRef = ref(database, `UserProfiles/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();

            // Cập nhật thông tin người dùng vào HTML
            document.getElementById('username').textContent = userId;

            // Hiển thị số level bằng các icon
            displayLevel(userData.level || 1);

            // Cập nhật số XP và số xu
            document.getElementById('xp').textContent = userData.xp || "0";
            document.getElementById('coins').textContent = userData.coins || "0";

            // Hiển thị các ô đất của người dùng
            displayFarmPlots(userData.level || 1);
        } else {
            alert("Không tìm thấy dữ liệu người dùng!");
        }
    } catch (error) {
        console.error("Có lỗi xảy ra:", error);
        alert("Không thể tải thông tin người dùng.");
    }
};

// Hàm hiển thị level dưới dạng các icon counter
function displayLevel(level) {
    const levelIcon = document.getElementById('level');
    let levelIcons = '';

    for (let i = 1; i <= level; i++) {
        levelIcons += `<span class="material-symbols-outlined">counter_${i}</span>`;
    }

    levelIcon.innerHTML = levelIcons;
}

// Hàm hiển thị các ô đất dựa trên cấp độ
function displayFarmPlots(level) {
    const plotsContainer = document.querySelector('.plots-container');
    plotsContainer.innerHTML = ''; // Xóa nội dung cũ nếu có

    for (let i = 1; i <= 12; i++) {
        const plot = document.createElement('div');
        plot.classList.add('plot');

        if (i <= level) {
            plot.classList.add('unlocked');
            plot.innerHTML = `<i class="material-icons">add</i>`;
            plot.onclick = () => alert(`Ô đất ${i} đã mở!`);
        } else {
            plot.classList.add('locked');
            plot.innerHTML = `<i class="material-icons">lock</i>`;
        }

        plotsContainer.appendChild(plot);
    }
}
