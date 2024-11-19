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
                if(username === "Admin") {
                    actionsCell.innerHTML = `<button onclick="editUserPassword('${username}')">Sửa mật khẩu</button>`;
                }
                else{
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
                row.insertCell(0).innerText = plantId;  // Hiển thị tên cây trồng
                row.insertCell(1).innerText = plants[plantId].growthTime;
                row.insertCell(2).innerText = plants[plantId].expReward;
                row.insertCell(3).innerText = plants[plantId].coinsReward;  // Hiển thị coinsReward
                row.insertCell(4).innerText = plants[plantId].seedCost;
                const actionsCell = row.insertCell(5);
                actionsCell.innerHTML = `<button onclick="deletePlant('${plantId}')">Xóa</button>
                                         <button onclick="editPlant('${plantId}')">Sửa</button>`;
            });
        } else {
            const row = plantsTableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6;
            cell.innerText = 'Không có cây trồng nào!';
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
            Object.keys(levels).forEach((levelName) => {
                const row = levelsTableBody.insertRow();
                row.insertCell(0).innerText = levelName;
                row.insertCell(1).innerText = levels[levelName].plotsUnlocked;
                row.insertCell(2).innerText = levels[levelName].xpRequired;
                row.insertCell(3).innerText = levels[levelName].coinsReward;
                const actionsCell = row.insertCell(4);
                actionsCell.innerHTML = `<button onclick="deleteLevel('${levelName}')">Xóa</button>
                                         <button onclick="editLevel('${levelName}')">Sửa</button>`;
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

// Hàm sửa mật khẩu người dùng
window.editUserPassword = function(username) {
    const newPassword = prompt("Nhập mật khẩu mới cho người dùng " + username + ":");
    
    if (newPassword) {
        const userRef = ref(database, 'Users/' + username);
        set(userRef, {
            username: username,
            password: newPassword  // Cập nhật mật khẩu mới
        }).then(() => {
            alert('Mật khẩu đã được sửa thành công!');
            displayUsers(); // Cập nhật lại danh sách người dùng
        }).catch((error) => {
            console.error("Có lỗi khi sửa mật khẩu người dùng: ", error);
            alert('Có lỗi xảy ra khi sửa mật khẩu người dùng!');
        });
    }
}

// Hàm sửa thông tin cây trồng
window.editPlant = function(plantId) {
    const plantRef = ref(database, 'Plants/' + plantId); // 'plantId' chính là tên cây trồng

    // Lấy thông tin hiện tại của cây trồng
    get(plantRef).then((snapshot) => {
        if (snapshot.exists()) {
            const plant = snapshot.val();
            const newGrowthTime = prompt("Sửa thời gian sinh trưởng:", plant.growthTime);
            const newExpReward = prompt("Sửa phần thưởng kinh nghiệm:", plant.expReward);
            const newCoinsReward = prompt("Sửa phần thưởng xu:", plant.coinsReward);
            const newSeedCost = prompt("Sửa chi phí hạt giống:", plant.seedCost);

            // Cập nhật lại thông tin cây trồng
            set(plantRef, {
                growthTime: newGrowthTime ? parseInt(newGrowthTime) : plant.growthTime,
                expReward: newExpReward ? parseInt(newExpReward) : plant.expReward,
                coinsReward: newCoinsReward ? parseInt(newCoinsReward) : plant.coinsReward,
                seedCost: newSeedCost ? parseInt(newSeedCost) : plant.seedCost
            }).then(() => {
                alert('Cây trồng đã được sửa thành công!');
                displayPlants(); // Cập nhật lại danh sách cây trồng
            }).catch((error) => {
                console.error("Có lỗi khi sửa cây trồng: ", error);
                alert('Có lỗi xảy ra khi sửa cây trồng!');
            });
        }
    }).catch((error) => {
        console.error("Có lỗi khi lấy thông tin cây trồng: ", error);
    });
}

// Hàm sửa thông tin cấp độ
window.editLevel = function(levelId) {
    const levelRef = ref(database, 'Levels/' + levelName);

    // Lấy thông tin hiện tại của cấp độ
    get(levelRef).then((snapshot) => {
        if (snapshot.exists()) {
            const level = snapshot.val();
            const newPlotsUnlocked = prompt("Sửa số ô đất mở:", level.plotsUnlocked);
            const newXpRequired = prompt("Sửa kinh nghiệm yêu cầu:", level.xpRequired);
            const newCoinsReward = prompt("Sửa phần thưởng xu:", level.coinsReward);

            // Cập nhật lại thông tin cấp độ
            set(levelRef, {
                plotsUnlocked: newPlotsUnlocked ? parseInt(newPlotsUnlocked) : level.plotsUnlocked,
                xpRequired: newXpRequired ? parseInt(newXpRequired) : level.xpRequired,
                coinsReward: newCoinsReward ? parseInt(newCoinsReward) : level.coinsReward
            }).then(() => {
                alert('Cấp độ đã được sửa thành công!');
                displayLevels(); // Cập nhật lại danh sách cấp độ
            }).catch((error) => {
                console.error("Có lỗi khi sửa cấp độ: ", error);
                alert('Có lỗi xảy ra khi sửa cấp độ!');
            });
        }
    }).catch((error) => {
        console.error("Có lỗi khi lấy thông tin cấp độ: ", error);
    });
}

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
    const coinsReward = prompt('Nhập số tiền thưởng khi thu hoạch cây:');  // Thêm coinsReward
    const seedCost = prompt('Nhập chi phí hạt giống cây:');

    if (plantName && growthTime && expReward && seedCost && coinsReward) {
        // Tạo tham chiếu đến bảng Plants và dùng tên cây làm khóa
        const newPlantRef = ref(database, `Plants/${plantName}`);  // Lưu trong bảng Plants, với tên cây làm ID
        
        // Lưu dữ liệu cây trồng
        set(newPlantRef, {
            expReward: parseInt(expReward),
            growthTime: parseInt(growthTime),
            seedCost: parseInt(seedCost),
            coinsReward: parseInt(coinsReward)  // Lưu coinsReward
        }).then(() => {
            displayPlants();  // Hiển thị lại các cây trồng
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
        // Sử dụng level làm ID để tạo một đường dẫn cố định cho cấp độ này
        const newLevelRef = ref(database, 'Levels/' + level);  // 'levels' là tên bảng, và level là ID cố định
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
