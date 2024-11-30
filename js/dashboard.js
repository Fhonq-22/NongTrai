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

            // Hiển thị các ô đất của người dùng, truyền userId vào hàm displayFarmPlots
            displayFarmPlots(userData.level || 1, userId); // Truyền userId vào đây
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

// Hàm hiển thị các ô đất dựa trên trạng thái cây trồng
async function displayFarmPlots(level, userId) {
    const plotsContainer = document.querySelector('.plots-container');
    plotsContainer.innerHTML = ''; // Xóa nội dung cũ nếu có

    try {
        // Lấy thông tin về các ô đất của người dùng từ Firebase
        const plotsRef = ref(database, `UserLand/${userId}/plots`);
        const snapshot = await get(plotsRef);

        if (snapshot.exists()) {
            const farmPlots = snapshot.val();

            for (let i = 0; i < 12; i++) {
                const plot = document.createElement('div');
                plot.classList.add('plot');

                // Kiểm tra xem ô đất đã mở chưa
                if (i < level) {
                    plot.classList.add('unlocked');

                    // Lấy thông tin ô đất
                    const plotData = farmPlots[i];

                    if (plotData) {
                        // Kiểm tra trạng thái của ô đất
                        if (plotData.growthStatus === 'empty') {
                            // Nếu ô đất chưa trồng cây
                            plot.innerHTML = `<i class="material-icons">add</i>`;
                            plot.onclick = () => openShop(i); // Mở cửa hàng khi nhấn vào ô đất
                        } else if (plotData.growthStatus === 'growing') {
                            // Nếu cây đang phát triển, tính toán thời gian còn lại
                            const remainingTime = calculateRemainingTime(plotData.growthStartDate, plotData.harvestDate);
                            plot.innerHTML = `\
                                <i class="material-icons">check_circle</i>\
                                <div>Thời gian còn lại: ${remainingTime} phút</div>\
                            `;
                        } else {
                            // Nếu cây đã thu hoạch xong
                            plot.innerHTML = `<i class="material-icons">crop_din</i>`;
                        }
                    } else {
                        plot.innerHTML = `<i class="material-icons">error</i>`;
                    }
                } else {
                    plot.classList.add('locked');
                    plot.innerHTML = `<i class="material-icons">lock</i>`;
                }

                plotsContainer.appendChild(plot);
            }
        } else {
            console.error("Không có dữ liệu về các ô đất.");
        }
    } catch (error) {
        console.error("Có lỗi xảy ra khi tải thông tin ô đất:", error);
    }
}

// Hàm tính toán thời gian còn lại của cây trồng
function calculateRemainingTime(growthStartDate, harvestDate) {
    const currentTime = Date.now();
    let remainingTime;

    // Nếu chưa có ngày thu hoạch, tính toán từ thời gian bắt đầu trồng
    if (!harvestDate) {
        const growthTime = 12 * 60 * 60 * 1000; // Giả sử thời gian phát triển là 12 giờ (theo mili giây)
        remainingTime = growthTime - (currentTime - growthStartDate);
    } else {
        // Nếu cây đã thu hoạch, không có thời gian còn lại
        remainingTime = 0;
    }

    return Math.max(remainingTime / 1000 / 60, 0).toFixed(2); // Đảm bảo không có giá trị âm và chuyển sang phút
}

// Hàm mở cửa hàng để người dùng mua hạt giống
async function openShop(plotId) {
    // Mở cửa sổ cửa hàng
    const shopContainer = document.getElementById('shop-container');
    shopContainer.style.display = 'block';

    try {
        // Lấy dữ liệu cây trồng từ Firebase
        const plantsRef = ref(database, 'Plants');
        const snapshot = await get(plantsRef);

        if (snapshot.exists()) {
            const plantsData = snapshot.val();
            const plantList = document.getElementById('plant-list');
            plantList.innerHTML = ''; // Xóa nội dung cũ

            // Duyệt qua các loại cây và tạo phần tử hiển thị cho từng loại
            for (const plantName in plantsData) {
                const plant = plantsData[plantName];
                const plantItem = document.createElement('div');
                plantItem.classList.add('plant-item');
                plantItem.innerHTML = `
                    <h3>${plantName}</h3>
                    <p>Giá hạt giống: ${plant.seedCost} xu</p>
                    <p>Thời gian phát triển: ${plant.growthTime} giờ</p>
                    <p>Phần thưởng: ${plant.expReward} EXP, ${plant.coinsReward} xu</p>
                    <button onclick="buySeed('${plantName}', ${plant.seedCost}, ${plotId})">Mua hạt giống</button>
                `;
                plantList.appendChild(plantItem);
            }
        } else {
            alert("Không có dữ liệu cây trồng.");
        }
    } catch (error) {
        console.error("Có lỗi xảy ra khi tải dữ liệu cây trồng:", error);
    }
}

// Hàm đóng cửa hàng
function closeShop() {
    const shopContainer = document.getElementById('shop-container');
    shopContainer.style.display = 'none'; // Ẩn cửa sổ cửa hàng
}



// Hàm mua hạt giống
async function buySeed(plantName, seedCost, plotId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    const xpElement = document.getElementById('xp');
    const coinsElement = document.getElementById('coins');

    if (!isLoggedIn || !userId) {
        alert("Bạn cần đăng nhập để mua hạt giống.");
        return;
    }

    try {
        // Lấy dữ liệu người dùng từ Firebase
        const userRef = ref(database, `UserProfiles/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            const currentCoins = userData.coins || 0;
            const currentXp = userData.xp || 0;

            // Kiểm tra nếu người dùng có đủ xu để mua hạt giống
            if (currentCoins >= seedCost) {
                // Trừ xu và thêm hạt giống vào ô đất
                const newCoins = currentCoins - seedCost;
                const updatedPlots = userData.plots || {};
                
                // Cập nhật ô đất với hạt giống mới
                updatedPlots[plotId] = {
                    growthStatus: 'growing',
                    growthStartDate: Date.now(),
                    plantName: plantName
                };

                // Cập nhật dữ liệu người dùng trong Firebase
                await set(ref(database, `UserProfiles/${userId}`), {
                    ...userData,
                    coins: newCoins,
                    plots: updatedPlots
                });

                // Cập nhật giao diện
                coinsElement.textContent = newCoins;
                alert(`Mua hạt giống ${plantName} thành công!`);

                // Đóng cửa hàng
                document.getElementById('shop-container').style.display = 'none';

                // Cập nhật ô đất (có thể là một hàm khác tùy vào cách bạn quản lý các ô đất trong giao diện)
                displayFarmPlots(userData.level);
            } else {
                alert("Bạn không đủ xu để mua hạt giống.");
            }
        } else {
            alert("Không tìm thấy thông tin người dùng.");
        }
    } catch (error) {
        console.error("Có lỗi xảy ra khi mua hạt giống:", error);
    }
}

