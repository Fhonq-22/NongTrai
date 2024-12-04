import { displayData, getData, updateData } from './firebase-utils.js';

window.onload = async function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');

    if (!isLoggedIn || !userId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userData = await getData('UserProfiles/' + userId);
        if (userData) {
            document.getElementById('username').textContent = userId;
            displayLevel(userData.level || 1);
            displayData('UserProfiles/' + userId, 'xp', 'xp');
            displayData('UserProfiles/' + userId, 'coins', 'coins');
            showNotification('Đăng nhập thành công!', 'success');
            displayFarmPlots(userData.level || 1, userId);
        } else {
            showNotification('Không tìm thấy dữ liệu người dùng!', 'warning');
        }
    } catch {
        showNotification('Không thể tải thông tin người dùng!', 'error');
    }
};

function displayLevel(level) {
    document.getElementById('level').innerHTML = Array.from({ length: level }, (_, i) =>
        `<span class="material-symbols-outlined">counter_${i + 1}</span>`
    ).join('');
}

async function displayFarmPlots(level, userId) {
    const plotsContainer = document.querySelector('.plots-container');
    plotsContainer.innerHTML = '';
    try {
        const farmPlots = await getData(`UserLand/${userId}/plots`);
        if (farmPlots) {
            for (let i = 0; i < 12; i++) {
                plotsContainer.appendChild(renderPlot(farmPlots[i], i, level, userId));
            }
        } else {
            showNotification('Không có dữ liệu về các ô đất!', 'error');
        }
    } catch {
        showNotification('Có lỗi xảy ra khi tải thông tin ô đất!', 'error');
    }
}

function renderPlot(plotData, index, level, userId) {
    const plot = document.createElement('div');
    plot.classList.add('plot', index < level ? 'unlocked' : 'locked');
    if (index < level) {
        if (plotData) {
            const renderers = {
                'empty': () => renderEmptyPlot(plot, index),
                'growing': () => renderGrowingPlot(plot, plotData, index, userId),
                'Ready to harvest': () => renderReadyToHarvestPlot(plot, index, plotData.plantId),
                'harvested': () => renderHarvestedPlot(plot, index, userId),
            };
            (renderers[plotData.growthStatus] || (() => (plot.innerHTML = `<i class="material-icons">error</i>`)))();
        } else {
            plot.innerHTML = `<i class="material-icons">error</i>`;
        }
    } else {
        plot.innerHTML = `<i class="material-icons">lock</i>`;
    }
    return plot;
}

function renderEmptyPlot(plot, index) {
    plot.innerHTML = `<i class="material-icons">add</i>`;
    plot.onclick = () => openShop(index);
}

function renderGrowingPlot(plot, plotData, index, userId) {
    const img = document.createElement('img');
    img.src = 'img/Cay-con.png';
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('time-remaining');
    plot.append(img, timeDiv);

    const updateTime = async () => {
        timeDiv.textContent = `[${await calculateRemainingTime(
            plotData.plantId,
            plotData.growthStartDate,
            plotData.harvestDate,
            userId,
            index
        )}]`;
    };

    updateTime();
    const interval = setInterval(async () => {
        if (plotData.growthStatus === 'Ready to harvest') clearInterval(interval);
        await updateTime();
    }, 1000);

    plot.onclick = () => (timeDiv.style.display = 'block');
}

async function renderReadyToHarvestPlot(plot, index, plantId) {
    const img = document.createElement('img');
    const plantData = await getData("Plants/"+plantId);
    img.src = plantData.imgLink || 'img/Cay-truong-thanh.png';
    plot.append(img);
    const button = document.createElement('button');
    button.className = 'harvest-button';
    button.innerHTML = '<i class="material-icons">spa</i>';
    button.onclick = () => harvestCrop(index, plantId);
    plot.append(button);
}

async function renderHarvestedPlot(plot, index, userId) {
    const img = document.createElement('img');
    img.src = 'img/Cay-heo.png'; 
    plot.append(img);
    const button = document.createElement('button');
    button.className = 'shovel-button';
    button.innerHTML = `<i class="material-icons">delete</i>`;
    button.onclick = async () => {
        try {
            await updateData(`UserLand/${userId}/plots/${index}`, {
                growthStatus: 'empty',
                harvestDate: null,
                growthStartDate: null,
                plantId: null,
            });
            const userData = await getData(`UserProfiles/${userId}`);
            displayFarmPlots(userData.level || 1, userId);
            showNotification(`Ô đất ${index + 1} đã được làm sạch!`, 'success');
        } catch {
            showNotification('Lỗi khi làm sạch ô đất!', 'error');
        }
    };
    plot.append(button);
}

async function calculateRemainingTime(plantId, startDate, harvestDate, userId, plotId) {
    const currentTime = Date.now();
    let remaining = 0;

    if (!harvestDate) {
        const plantData = await getData(`Plants/${plantId}`);
        if (plantData) {
            const growthTime = plantData.growthTime * 3600000;
            remaining = growthTime - (currentTime - startDate);
        } else return "Không hợp lệ";
    }

    if (remaining <= 0) {
        await updateData(`UserLand/${userId}/plots/${plotId}`, { growthStatus: 'Ready to harvest', harvestDate: new Date().toISOString() });
        return "Đợi thu hoạch";
    }

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${hours}:${minutes}:${seconds}`;
}

async function openShop(plotId) {
    const shop = document.getElementById('shop-container');
    shop.style.display = 'block';
    try {
        const plants = await getData('Plants');
        const list = document.getElementById('plant-list');
        list.innerHTML = '';

        Object.entries(plants).forEach(([name, data]) => {
            const item = document.createElement('div');
            item.className = 'plant-item';
            item.innerHTML = `
                <h3>${name}</h3>
                <p>Giá: ${data.seedCost} xu</p>
                <p>Thời gian: ${data.growthTime} giờ</p>
                <p>Phần thưởng: ${data.expReward} EXP, ${data.coinsReward} xu</p>
                <button onclick="buySeed('${name}', ${data.seedCost}, ${plotId})">Mua</button>`;
            list.append(item);
        });

        document.getElementById('close-shop').onclick = closeShop;
    } catch {
        showNotification('Lỗi khi tải dữ liệu cây trồng!', 'error');
    }
}

function closeShop() {
    document.getElementById('shop-container').style.display = 'none';
}

window.buySeed = async function (plantName, cost, plotId) {
    const userId = localStorage.getItem('userId');
    try {
        const userData = await getData(`UserProfiles/${userId}`);
        if (userData && userData.coins >= cost) {
            await updateData(`UserLand/${userId}/plots/${plotId}`, { growthStatus: 'growing', growthStartDate: Date.now(), plantId: plantName });
            await updateData(`UserProfiles/${userId}`, { coins: userData.coins - cost });
            displayData(`UserProfiles/${userId}`, 'coins', 'coins');
            showNotification(`Mua ${plantName} thành công!`, 'success');
            closeShop();
            displayFarmPlots(userData.level, userId);
        } else showNotification('Không đủ xu!', 'warning');
    } catch {
        showNotification('Lỗi khi mua hạt giống!', 'error');
    }
};

async function harvestCrop(plotId, plantId) {
    const userId = localStorage.getItem('userId');
    try {
        const userData = await getData(`UserProfiles/${userId}`);
        const plantData = await getData(`Plants/${plantId}`);
        await updateData(`UserLand/${userId}/plots/${plotId}`, {
            growthStatus: 'harvested',
            plantId: null,
            growthStartDate: null,
            harvestDate: new Date().toISOString(),
        });
        await updateData(`UserProfiles/${userId}`, { 
            coins: (userData.coins || 0) + plantData.coinsReward, 
            xp: (userData.xp || 0) + plantData.expReward,
        });
        displayFarmPlots(userData.level || 1, userId);
        displayData(`UserProfiles/${userId}`, 'coins', 'coins');
        displayData(`UserProfiles/${userId}`, 'xp', 'xp');
        showNotification(`Thu hoạch ${plantId} thành công!`, 'success');
    } catch {
        showNotification('Lỗi khi thu hoạch!', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const spinWheelContainer = document.getElementById('spin-wheel-container');
    const spinWheelOverlay = document.getElementById('spin-wheel-overlay');
    const spinButton = document.getElementById('spin-button');
    const closeWheelButton = document.getElementById('close-wheel');
    const spinWheelButton = document.getElementById('spin-wheel-button');
    const wheel = document.getElementById('wheel');

    // Hiển thị vòng quay và overlay
    spinWheelButton.onclick = () => {
        spinWheelContainer.style.display = 'block';
        spinWheelOverlay.style.display = 'block';
    };

    // Đóng vòng quay và overlay
    closeWheelButton.onclick = () => {
        spinWheelContainer.style.display = 'none';
        spinWheelOverlay.style.display = 'none';
    };

    const ranges = ["0-59", "60-119", "120-179", "180-239", "240-299", "300-359"];
    const weights = [100-12, 100-5, 100-22, 100-50, 100-10, 100-1];
    // Xử lý quay vòng
    spinButton.onclick = async () => {
        const userId = localStorage.getItem('userId');
        let userData = await getData(`UserProfiles/${userId}`);
        await updateData(`UserProfiles/${userId}`, { 
            coins: (userData.coins || 0) - 10
        });
        displayData(`UserProfiles/${userId}`, 'coins', 'coins');

        const randomDegree = getRandomFromRanges(ranges, weights);
        const soVong = Math.floor(Math.random() * 22*2) + 1;
        wheel.style.transition = 'transform 5s ease-out';
        wheel.style.transform = `rotate(${360*soVong + randomDegree}deg)`; // Quay nhiều vòng + góc ngẫu nhiên

        // Hiển thị thông báo sau khi dừng
        setTimeout(async () => {
            const normalizedDegree = (3600 + randomDegree) % 360;
            const prize = getPrize(normalizedDegree);
            showNotification(`Chúc mừng! Bạn nhận được: ${prize} xu`, 'succes');
            userData = await getData(`UserProfiles/${userId}`);
            await updateData(`UserProfiles/${userId}`, { 
                coins: (userData.coins || 0) + prize
            });
            displayData(`UserProfiles/${userId}`, 'coins', 'coins');
        }, 5000); // Trùng với thời gian quay        
    };

    // Hàm tính giải thưởng dựa trên góc quay
    function getPrize(degree) {
        if (degree >= 0 && degree < 60) return 12;
        if (degree >= 60 && degree < 120) return 5;
        if (degree >= 120 && degree < 180) return 22;
        if (degree >= 180 && degree < 240) return 50;
        if (degree >= 240 && degree < 300) return 10;
        return 1;
    }

    function getRandomFromRanges(ranges, weights) {
        if (ranges.length !== weights.length) {
            throw new Error("Hai mảng ranges và weights phải có cùng số phần tử.");
        }

        const expandedRanges = ranges.flatMap((range, index) =>
            Array(weights[index]).fill(range)
        );

        if (expandedRanges.length === 0) {
            throw new Error("Không có khoảng giá trị nào để chọn.");
        }

        const [min, max] = expandedRanges[
            Math.floor(Math.random() * expandedRanges.length)
        ]
            .split('-')
            .map(Number);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

});
