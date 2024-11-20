// popup.js
function showPopup(promptText, defaultValue) {
    return new Promise((resolve, reject) => {
        const popup = document.createElement("div");
        popup.classList.add("popup");

        const content = `
            <div class="popup-content">
                <h2>${promptText}</h2>
                <input type="text" id="popup-input" value="${defaultValue}" />
                <button id="popup-ok">OK</button>
                <button id="popup-cancel">Cancel</button>
            </div>
        `;

        popup.innerHTML = content;
        document.body.appendChild(popup);

        const input = document.getElementById("popup-input");
        const btnOk = document.getElementById("popup-ok");
        const btnCancel = document.getElementById("popup-cancel");

        // Khi nhấn OK
        btnOk.addEventListener("click", function() {
            const newValue = input.value;
            closePopup();
            resolve(newValue); // Trả về giá trị người dùng nhập
        });

        // Khi nhấn Cancel
        btnCancel.addEventListener("click", function() {
            closePopup();
            resolve(null); // Trả về null nếu người dùng hủy bỏ
        });

        // Đóng popup
        function closePopup() {
            document.body.removeChild(popup);
        }
    });
}
