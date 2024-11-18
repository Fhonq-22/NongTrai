import { database } from "./firebase-config.js";
import { ref, get, set, remove, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Lấy các bảng dữ liệu từ Firebase
const usersRef = ref(database, 'Users');
const plantsRef = ref(database, 'Plants');
const levelsRef = ref(database, 'Levels');

// Hiển thị danh sách người dùng
function displayUsers() {
    get(usersRef).then((snapshot) => {
        const usersTableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
        usersTableBody.innerHTML = ''; // Xóa dữ liệu cũ

        if (snapshot.exists()) {
            const users = snapshot.val();
            Object.keys(users).forEach((username) => {
                const row = usersTableBody.insertRow();
                row.insertCell(0).innerText = username;
                const actionsCell = row.insertCell(1);
                if(username !== "Admin") {
                    actionsCell.innerHTML = `<button onclick="deleteUser('${username}')">Xóa</button>`;
                }
            });
        }
    }).catch((error) => {
        console.error("Có lỗi xảy ra khi lấy dữ liệu người dùng:", error);
    });
}

// Hiển thị danh sách cây trồng
function displayPlants() {
    get(plantsRef).then((snapshot) => {
        const plantsTableBody = document.getElementById('plantsTable').getElementsByTagName('tbody')[0];
        plantsTableBody.innerHTML = ''; // Xóa dữ liệu cũ

        if (snapshot.exists()) {
            const plants = snapshot.val();
            Object.keys(plants).forEach((plantId) => {
                const row = plantsTableBody.insertRow();
                row.insertCell(0).innerText = plants[plantId].name;
                row.insertCell(1).innerText = plants[plantId].growthTime;
                row.insertCell(2).innerText = plants[plantId].expReward;
                row.insertCell(3).innerText = plants[plantId].coinsReward;
                row.insertCell(4).innerText = plants[plantId].seedCost;
                const actionsCell = row.insertCell(5);
                actionsCell.innerHTML = `<button onclick="deletePlant('${plantId}')">Xóa</button>`;
            });
        }
    }).catch((error) => {
        console.error("Có lỗi xảy ra khi lấy dữ liệu cây trồng:", error);
    });
}

// Hiển thị danh sách cấp độ
function displayLevels() {
    get(levelsRef).then((snapshot) => {
        const levelsTableBody = document.getElementById('levelsTable').getElementsByTagName('tbody')[0];
        levelsTableBody.innerHTML = ''; // Xóa dữ liệu cũ

        if (snapshot.exists()) {
            const levels = snapshot.val();
            Object.keys(levels).forEach((level) => {
                const row = levelsTableBody.insertRow();
                row.insertCell(0).innerText = level;
                row.insertCell(1).innerText = levels[level].plotsUnlocked;
                row.insertCell(2).innerText = levels[level].xpRequired;
                row.insertCell(3).innerText = levels[level].coinsReward;
                const actionsCell = row.insertCell(4);
                actionsCell.innerHTML = `<button onclick="deleteLevel('${level}')">Xóa</button>`;
            });
        }
    }).catch((error) => {
        console.error("Có lỗi xảy ra khi lấy dữ liệu cấp độ:", error);
    });
}

// Hàm xóa người dùng
window.deleteUser = function(userId) {
    const userRef = ref(database, 'Users/' + userId); // Lấy tham chiếu đến người dùng cần xóa
    remove(userRef).then(() => {
        alert('Người dùng đã bị xóa!');
        displayUsers(); // Cập nhật lại danh sách người dùng sau khi xóa
    }).catch((error) => {
        console.error("Có lỗi khi xóa người dùng: ", error);
        alert('Có lỗi xảy ra khi xóa người dùng!');
    });
};

// Hàm xóa cây trồng
window.deletePlant = function(plantId) {
    const plantRef = ref(database, 'Plants/' + plantId); // Lấy tham chiếu đến cây trồng cần xóa
    remove(plantRef).then(() => {
        alert('Cây trồng đã bị xóa!');
        displayPlants(); // Cập nhật lại danh sách cây trồng sau khi xóa
    }).catch((error) => {
        console.error("Có lỗi khi xóa cây trồng: ", error);
        alert('Có lỗi xảy ra khi xóa cây trồng!');
    });
};

// Hàm xóa cấp độ
window.deleteLevel = function(levelName) {
    const levelRef = ref(database, 'Levels/' + levelName); // Lấy tham chiếu đến cấp độ cần xóa
    remove(levelRef).then(() => {
        alert('Cấp độ đã bị xóa!');
        displayLevels(); // Cập nhật lại danh sách cấp độ sau khi xóa
    }).catch((error) => {
        console.error("Có lỗi khi xóa cấp độ: ", error);
        alert('Có lỗi xảy ra khi xóa cấp độ!');
    });
};
// Thêm người dùng
document.getElementById('addUserBtn').addEventListener('click', () => {
    const username = prompt('Nhập tên người dùng mới:');
    if (username) {
        set(ref(database, 'Users/' + username), {
            username: username
        }).then(() => {
            displayUsers();
            alert('Đã thêm người dùng!');
        }).catch((error) => {
            alert('Có lỗi xảy ra khi thêm người dùng: ' + error.message);
        });
    }
});

// Thêm cây trồng
document.getElementById('addPlantBtn').addEventListener('click', () => {
    const plantName = prompt('Nhập tên cây trồng mới:');
    const growthTime = prompt('Nhập thời gian sinh trưởng cây (tính bằng ngày):');
    const expReward = prompt('Nhập số kinh nghiệm khi thu hoạch cây:');
    const coinsReward = prompt('Nhập số xu khi thu hoạch cây:');
    const seedCost = prompt('Nhập chi phí hạt giống cây:');

    if (plantName && growthTime && expReward && coinsReward && seedCost) {
        const newPlantRef = push(plantsRef);  // Sử dụng push để tạo ID ngẫu nhiên cho cây trồng
        set(newPlantRef, {
            name: plantName,
            growthTime: parseInt(growthTime),
            expReward: parseInt(expReward),
            coinsReward: parseInt(coinsReward),
            seedCost: parseInt(seedCost)
        }).then(() => {
            displayPlants();
            alert('Đã thêm cây trồng!');
        }).catch((error) => {
            alert('Có lỗi xảy ra khi thêm cây trồng: ' + error.message);
        });
    }
});

// Thêm cấp độ
document.getElementById('addLevelBtn').addEventListener('click', () => {
    const level = prompt('Nhập cấp độ mới:');
    const plotsUnlocked = prompt('Nhập số ô đất mở cho cấp độ này:');
    const xpRequired = prompt('Nhập kinh nghiệm yêu cầu cho cấp độ này:');
    const coinsReward = prompt('Nhập phần thưởng xu khi đạt cấp độ này:');

    if (level && plotsUnlocked && xpRequired && coinsReward) {
        const newLevelRef = push(levelsRef);  // Sử dụng push để tạo ID ngẫu nhiên cho cấp độ
        set(newLevelRef, {
            level: parseInt(level),
            plotsUnlocked: parseInt(plotsUnlocked),
            xpRequired: parseInt(xpRequired),
            coinsReward: parseInt(coinsReward)
        }).then(() => {
            displayLevels();
            alert('Đã thêm cấp độ!');
        }).catch((error) => {
            alert('Có lỗi xảy ra khi thêm cấp độ: ' + error.message);
        });
    }
});

// Hiển thị tất cả các bảng ngay khi trang được tải
window.onload = () => {
    displayUsers();
    displayPlants();
    displayLevels();
};
