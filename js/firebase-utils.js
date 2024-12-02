// firebase-utils.js
import { database } from "./firebase-config.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Hàm hiển thị dữ liệu lên giao diện
export async function displayData(path, property, elementId) {
    const snapshot = await get(ref(database, path));

    if (snapshot.exists()) {
        const data = snapshot.val();
        const value = data[property] || "0";
        document.getElementById(elementId).textContent = value;
    } else {
        console.error("Dữ liệu không tồn tại tại path:", path);
    }
}


// Hàm lấy dữ liệu từ Firebase
export async function getData(path) {
    const dataRef = ref(database, path);
    const snapshot = await get(dataRef);
    
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        console.log("Không có sẵn dữ liệu!");
        return null;
    }
}

// Hàm cập nhật dữ liệu vào Firebase
export async function updateData(path, data) {
    const dataRef = ref(database, path);
    await update(dataRef, data);
}
