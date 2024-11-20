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
    // Tham chiếu đến các bảng liên quan
    const userRef = ref(database, 'Users/' + userId); // Bảng Users
    const profileRef = ref(database, 'UserProfiles/' + userId); // Bảng UserProfiles
    const landRef = ref(database, 'UserLand/' + userId); // Bảng UserLand

    // Xóa dữ liệu trong từng bảng
    Promise.all([
        remove(userRef),      // Xóa người dùng trong bảng Users
        remove(profileRef),   // Xóa thông tin trong UserProfiles
        remove(landRef)       // Xóa thông tin ô đất trong UserLand
    ])
    .then(() => {
        showNotification('Người dùng và dữ liệu liên quan đã bị xóa!', 'succes');
        displayUsers(); // Cập nhật lại danh sách người dùng sau khi xóa
    })
    .catch((error) => {
        console.error("Có lỗi khi xóa dữ liệu: ", error);
        showNotification('Có lỗi xảy ra khi xóa người dùng hoặc dữ liệu liên quan!', 'error');
    });
};

// Hàm xóa cây trồng
window.deletePlant = function(plantId) {
    const plantRef = ref(database, 'Plants/' + plantId); // Lấy tham chiếu đến cây trồng cần xóa
    remove(plantRef).then(() => {
        showNotification('Cây trồng đã bị xóa!', 'succes');
        displayPlants(); // Cập nhật lại danh sách cây trồng sau khi xóa
    }).catch((error) => {
        console.error("Có lỗi khi xóa cây trồng: ", error);
        showNotification('Có lỗi xảy ra khi xóa cây trồng!', 'error');
    });
};

// Hàm xóa cấp độ
window.deleteLevel = function(levelName) {
    const levelRef = ref(database, 'Levels/' + levelName); // Lấy tham chiếu đến cấp độ cần xóa
    remove(levelRef).then(() => {
        showNotification('Cấp độ đã bị xóa!', 'succes');
        displayLevels(); // Cập nhật lại danh sách cấp độ sau khi xóa
    }).catch((error) => {
        console.error("Có lỗi khi xóa cấp độ: ", error);
        showNotification('Có lỗi xảy ra khi xóa cấp độ!', 'error');
    });
};

// Hàm sửa mật khẩu người dùng
window.editUserPassword = async function(username) {
    const userRef = ref(database, 'Users/' + username);

    try {
        // Lấy thông tin người dùng từ cơ sở dữ liệu
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const user = snapshot.val();

            // Sử dụng showPopup để người dùng nhập mật khẩu mới, với mật khẩu cũ làm giá trị mặc định
            const newPassword = await showPopup("Nhập mật khẩu mới cho " + username + ":", user.password);

            if (newPassword) {
                // Cập nhật mật khẩu mới cho người dùng
                await set(userRef, {
                    username: username,
                    password: newPassword  // Cập nhật mật khẩu mới
                });

                showNotification('Mật khẩu đã được sửa thành công!', 'succes');
                displayUsers(); // Cập nhật lại danh sách người dùng
            } else {
                console.log('Không có mật khẩu mới được nhập.');
                showNotification('Không có mật khẩu mới được nhập!', 'info');
            }

        } else {
            console.log('Không tìm thấy người dùng với tên: ' + username);
            showNotification('Không tìm thấy người dùng với tên: ' + username, 'warning');
        }

    } catch (error) {
        console.error("Có lỗi khi sửa mật khẩu người dùng: ", error);
        showNotification('Có lỗi xảy ra khi sửa mật khẩu người dùng!', 'error');
    }
};


// Hàm sửa thông tin cây trồng
window.editPlant = async function(plantId) {
    const plantRef = ref(database, 'Plants/' + plantId); // 'plantId' chính là tên cây trồng

    try {
        // Lấy thông tin hiện tại của cây trồng
        const snapshot = await get(plantRef);

        if (snapshot.exists()) {
            const plant = snapshot.val();

            // Sửa thông tin từng cái một
            const newGrowthTime = await showPopup("Sửa thời gian sinh trưởng:", plant.growthTime);
            const newExpReward = await showPopup("Sửa phần thưởng kinh nghiệm:", plant.expReward);
            const newCoinsReward = await showPopup("Sửa phần thưởng xu:", plant.coinsReward);
            const newSeedCost = await showPopup("Sửa chi phí hạt giống:", plant.seedCost);

            // Cập nhật lại thông tin cây trồng
            await set(plantRef, {
                growthTime: newGrowthTime ? parseInt(newGrowthTime) : plant.growthTime,
                expReward: newExpReward ? parseInt(newExpReward) : plant.expReward,
                coinsReward: newCoinsReward ? parseInt(newCoinsReward) : plant.coinsReward,
                seedCost: newSeedCost ? parseInt(newSeedCost) : plant.seedCost
            });

            showNotification('Cây trồng đã được sửa thành công!', 'succes');
            displayPlants(); // Cập nhật lại danh sách cây trồng

        } else {
            console.log('Không tìm thấy cây trồng với ID:', plantId);
            showNotification('Không tìm thấy cây trồng với ID:'+ plantId, 'warning');
        }
    } catch (error) {
        console.error("Có lỗi khi sửa cây trồng: ", error);
        showNotification('Có lỗi xảy ra khi sửa cây trồng!', 'error');
    }
};

// Hàm sửa thông tin cấp độ
window.editLevel = async function(levelName) {
    const levelRef = ref(database, 'Levels/' + levelName);

    try {
        // Lấy thông tin hiện tại của cấp độ
        const snapshot = await get(levelRef);

        if (snapshot.exists()) {
            const level = snapshot.val();

            // Sử dụng showPopup thay cho prompt để lấy thông tin mới
            const newPlotsUnlocked = await showPopup("Sửa số ô đất mở:", level.plotsUnlocked);
            const newXpRequired = await showPopup("Sửa kinh nghiệm yêu cầu:", level.xpRequired);
            const newCoinsReward = await showPopup("Sửa phần thưởng xu:", level.coinsReward);

            // Cập nhật lại thông tin cấp độ
            await set(levelRef, {
                plotsUnlocked: newPlotsUnlocked ? parseInt(newPlotsUnlocked) : level.plotsUnlocked,
                xpRequired: newXpRequired ? parseInt(newXpRequired) : level.xpRequired,
                coinsReward: newCoinsReward ? parseInt(newCoinsReward) : level.coinsReward
            });

            showNotification('Cấp độ đã được sửa thành công!', 'succes');
            displayLevels(); // Cập nhật lại danh sách cấp độ

        } else {
            console.log('Không tìm thấy cấp độ với tên:', levelName);
            showNotification('Không tìm thấy cấp độ với tên:'+ levelName, 'warning');
        }
    } catch (error) {
        console.error("Có lỗi khi sửa cấp độ: ", error);
        showNotification('Có lỗi xảy ra khi sửa cấp độ!', 'error');
    }
};

// Thêm người dùng
document.getElementById('addUserBtn').addEventListener('click', async () => {
    const username = await showPopup("Nhập tên người dùng mới:", "");
    
    if (username) {
        // Kiểm tra xem tên người dùng đã tồn tại chưa
        const userRef = ref(database, 'Users/' + username);

        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                // Nếu tên người dùng đã tồn tại, thông báo lỗi
                showNotification('Tên người dùng đã tồn tại!', 'warning');
            } else {
                // Nếu tên người dùng chưa tồn tại, thêm người dùng vào Firebase
                set(ref(database, 'Users/' + username), {
                    username: username
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
                            showNotification('Đã thêm người dùng thành công!', 'succes');
                            // Tải lại danh sách người dùng
                            displayUsers();
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
                    showNotification(`Có lỗi xảy ra khi thêm người dùng: ${error.message}`, 'error');
                    console.error(error);
                });
            }
        }).catch((error) => {
            showNotification(`Có lỗi xảy ra khi kiểm tra tên người dùng: ${error.message}`, 'error');
            console.error(error);
        });
    }
});

// Hàm thêm cây trồng
document.getElementById('addPlantBtn').addEventListener('click', async () => {
    const plantName = await showPopup("Nhập tên cây trồng mới:", "");
    const growthTime = await showPopup("Nhập thời gian sinh trưởng cây (tính bằng ngày):", "");
    const expReward = await showPopup("Nhập số kinh nghiệm khi thu hoạch cây:", "");
    const coinsReward = await showPopup("Nhập số tiền thưởng khi thu hoạch cây:", "");
    const seedCost = await showPopup("Nhập chi phí hạt giống cây:", "");

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
            showNotification('Đã thêm cây trồng!', 'succes');
        }).catch((error) => {
            showNotification('Có lỗi xảy ra khi thêm cây trồng: ' + error.message, 'error');
        });
    } else {
        showNotification("Tất cả các trường thông tin đều phải được nhập!", 'warning');
    }
});

// Hàm thêm cấp độ
document.getElementById('addLevelBtn').addEventListener('click', async () => {
    const levelName = await showPopup("Nhập tên cấp độ mới:", "");
    const plotsUnlocked = await showPopup("Nhập số ô đất mở cho cấp độ này:", "");
    const xpRequired = await showPopup("Nhập kinh nghiệm yêu cầu cho cấp độ này:", "");
    const coinsReward = await showPopup("Nhập phần thưởng xu khi đạt cấp độ này:", "");

    if (levelName && plotsUnlocked && xpRequired && coinsReward) {
        // Sử dụng tên cấp độ làm ID để tạo một đường dẫn cố định cho cấp độ này
        const newLevelRef = ref(database, 'Levels/' + levelName);  // 'Levels' là tên bảng, và levelName là ID cố định
        
        // Lưu dữ liệu cấp độ
        set(newLevelRef, {
            level: parseInt(levelName),          // Dữ liệu cấp độ, có thể dùng levelName hoặc số tương ứng
            plotsUnlocked: parseInt(plotsUnlocked),
            xpRequired: parseInt(xpRequired),
            coinsReward: parseInt(coinsReward)
        }).then(() => {
            displayLevels();  // Hiển thị lại các cấp độ
            showNotification("Đã thêm cấp độ!", 'succes');
        }).catch((error) => {
            showNotification('Có lỗi xảy ra khi thêm cấp độ: ' + error.message, 'error');
        });
    } else {
        showNotification("Tất cả các trường thông tin đều phải được nhập!", 'warning');
    }
});

// Hiển thị tất cả các bảng ngay khi trang được tải
window.onload = () => {
    // Kiểm tra người dùng có đăng nhập không
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');

    if (!isLoggedIn || userId!=="Admin") {
        window.location.href = "login.html";  // Chuyển hướng đến trang đăng nhập nếu không đăng nhập
        return;
    }
    else{
        displayUsers();
        displayPlants();
        displayLevels();
        showNotification('Đăng nhập thành công!', 'succes');
    }
};
