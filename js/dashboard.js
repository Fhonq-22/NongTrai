import { displayData, getData, updateData } from './firebase-utils.js';

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
        const userData = await getData('UserProfiles/'+userId);  // Gọi hàm getData để lấy dữ liệu người dùng

        if (userData) {
            // Cập nhật thông tin người dùng vào HTML
            document.getElementById('username').textContent = userId;

            // Hiển thị số level bằng các icon
            displayLevel(userData.level || 1);
            displayData('UserProfiles/'+userId, 'xp', 'xp');
            displayData('UserProfiles/'+userId, 'coins', 'coins');

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
        // Lấy thông tin về các ô đất của người dùng từ Firebase thông qua hàm getData
        const farmPlots = await getData(`UserLand/${userId}/plots`);

        if (farmPlots) {
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
                            // Nếu cây đang phát triển, hiển thị hình ảnh cây
                            const img = document.createElement('img');
                            img.src = 'img/Cay-con.png'; // Đường dẫn tới hình ảnh cây
                            img.alt = 'Cây đang phát triển';
                            plot.appendChild(img);

                            // Tạo một div con ẩn để chứa thời gian còn lại
                            const timeRemainingDiv = document.createElement('div');
                            timeRemainingDiv.classList.add('time-remaining');
                            timeRemainingDiv.style.display = 'none'; // Ẩn thời gian ban đầu
                            plot.appendChild(timeRemainingDiv);

                            // Cập nhật thời gian liên tục mỗi giây
                            const updateTimeRemaining = async () => {
                                const remainingTime = await calculateRemainingTime(plotData.plantId ,plotData.growthStartDate, plotData.harvestDate);
                                timeRemainingDiv.innerHTML = `Thời gian còn lại: ${remainingTime}`;

                                // Nếu thời gian còn lại bằng 0, tạo nút thu hoạch
                                if (remainingTime === "Cây đã thu hoạch" && !plot.querySelector('.harvest-button')) {
                                    const harvestButton = document.createElement('button');
                                    harvestButton.classList.add('harvest-button');
                                    harvestButton.innerText = 'Thu hoạch';
                                    harvestButton.onclick = () => harvestCrop(i, plotData.plantName);
                                    plot.appendChild(harvestButton);
                                }
                            };

                            // Cập nhật ngay khi ô đất được hiển thị
                            updateTimeRemaining();

                            // Thiết lập setInterval để cập nhật thời gian mỗi giây
                            const intervalId = setInterval(async () => {
                                if (plotData.growthStatus === 'harvested') {
                                    clearInterval(intervalId); // Dừng cập nhật nếu đã thu hoạch
                                } else {
                                    await updateTimeRemaining();
                                }
                            }, 1000); // Cập nhật mỗi giây

                            // Khi nhấn vào ô đất, hiển thị thời gian
                            plot.onclick = () => {
                                timeRemainingDiv.style.display = 'block'; // Hiện thời gian khi nhấn vào ô đất
                            };

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

// Hàm thu hoạch cây trồng
async function harvestCrop(plotId, plantName) {
    const userId = 'User001'; // Thay bằng ID người dùng thực tế
    try {
        // Lấy thông tin người dùng từ Firebase thông qua hàm getData
        const userData = await getData(`UserProfiles/${userId}`);

        if (userData) {
            const currentCoins = userData.coins || 0; // Đảm bảo giá trị 'coins' không phải NaN

            // Kiểm tra xem giá trị coins có hợp lệ không
            if (isNaN(currentCoins)) {
                console.error("Giá trị coins không hợp lệ:", currentCoins);
                return; // Không tiếp tục nếu coins không hợp lệ
            }

            // Giả sử bạn thu hoạch cây và cộng thêm coins
            const harvestReward = 10; // Phần thưởng thu hoạch
            const newCoins = currentCoins + harvestReward;

            // Cập nhật thông tin người dùng (bao gồm coins) vào Firebase
            await updateData(`UserProfiles/${userId}`, { coins: newCoins });

            // Cập nhật trạng thái của ô đất sau khi thu hoạch
            await updateData(`UserLand/${userId}/plots/${plotId}`, {
                growthStatus: 'harvested',
                harvestDate: new Date().toISOString()
            });

            console.log(`Thu hoạch thành công! Bạn đã nhận ${harvestReward} coins. Tổng số coins: ${newCoins}`);

            // Cập nhật dữ liệu XP và coins hiển thị
            displayData('UserProfiles/'+userId, 'xp', 'xp');
            displayData('UserProfiles/'+userId, 'coins', 'coins');
        } else {
            console.error("Không tìm thấy dữ liệu người dùng.");
        }
    } catch (error) {
        console.error("Có lỗi khi thu hoạch cây:", error);
    }
}

// Hàm tính toán thời gian còn lại của cây trồng
async function calculateRemainingTime(plantId, growthStartDate, harvestDate) {
    const currentTime = Date.now(); // Lấy thời gian hiện tại
    let remainingTime = 0;

    // Nếu chưa có ngày thu hoạch, tính toán từ thời gian bắt đầu trồng
    if (!harvestDate) {
        const plantData = await getData(`Plants/${plantId}`); // Lấy thông tin cây trồng từ Firebase
        if (plantData) {
            const growthTime = plantData.growthTime * 60 * 60 * 1000; // Chuyển thời gian phát triển từ giờ sang mili giây
            remainingTime = growthTime - (currentTime - growthStartDate); // Tính thời gian còn lại
        } else {
            console.error("Cây trồng không tồn tại trong cơ sở dữ liệu");
            return "Cây không hợp lệ"; // Nếu cây không tồn tại
        }
    }

    // Nếu cây đã thu hoạch, không có thời gian còn lại
    if (remainingTime <= 0) {
        return "Cây đã thu hoạch";
    }

    // Tính toán giờ, phút, giây từ thời gian còn lại
    const hours = Math.floor(remainingTime / (1000 * 60 * 60)); // Giờ
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60)); // Phút
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000); // Giây

    // Trả về thời gian còn lại theo định dạng xxh xxm xx s
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Hàm mở cửa hàng để người dùng mua hạt giống
async function openShop(plotId) {
    // Mở cửa sổ cửa hàng
    const shopContainer = document.getElementById('shop-container');
    shopContainer.style.display = 'block';

    try {
        // Lấy dữ liệu cây trồng từ Firebase
        const plantsData = await getData('Plants'); // Sử dụng hàm getData để lấy dữ liệu

        if (plantsData) {
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

            // Thiết lập nút đóng cửa hàng
            const closeShopbtn = document.getElementById('close-shop');
            closeShopbtn.onclick = closeShop;
        } else {
            alert("Không có dữ liệu cây trồng.");
        }
    } catch (error) {
        console.error("Có lỗi xảy ra khi tải dữ liệu cây trồng:", error);
        alert("Có lỗi xảy ra khi tải dữ liệu cây trồng.");
    }
}

// Hàm đóng cửa hàng
function closeShop() {
    const shopContainer = document.getElementById('shop-container');
    shopContainer.style.display = 'none'; // Ẩn cửa sổ cửa hàng
}

// Hàm mua hạt giống
window.buySeed = async function(plantName, seedCost, plotId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');

    // Kiểm tra nếu người dùng chưa đăng nhập
    if (!isLoggedIn || !userId) {
        alert("Bạn cần đăng nhập để mua hạt giống.");
        return;
    }

    try {
        // Lấy dữ liệu người dùng từ Firebase (UserProfiles)
        const userData = await getData(`UserProfiles/${userId}`);
        
        if (userData) {
            const currentCoins = userData.coins || 0;

            // Kiểm tra nếu người dùng có đủ xu để mua hạt giống
            if (currentCoins >= seedCost) {
                // Trừ xu và cập nhật dữ liệu
                const newCoins = currentCoins - seedCost;

                // Cập nhật thông tin ô đất vào UserLand
                const plotData = {
                    growthStatus: 'growing',
                    growthStartDate: Date.now(),
                    plantId: plantName
                };

                // Cập nhật
                await updateData(`UserLand/${userId}/plots/${plotId}`, plotData);
                await updateData(`UserProfiles/${userId}`, { coins: newCoins });

                displayData('UserProfiles/'+userId, 'coins', 'coins');

                // Thông báo thành công
                alert(`Mua hạt giống ${plantName} thành công!`);

                // Đóng cửa hàng
                closeShop();

                // Cập nhật lại giao diện ô đất (có thể là một hàm khác)
                displayFarmPlots(userData.level, userId);
            } else {
                alert("Bạn không đủ xu để mua hạt giống.");
            }
        } else {
            alert("Không tìm thấy thông tin người dùng.");
        }
    } catch (error) {
        console.error("Có lỗi xảy ra khi mua hạt giống:", error);
    }
};
