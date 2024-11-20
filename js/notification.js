// Hàm hiển thị thông báo
function showNotification(message, type = 'success', duration = 3000) {
    const notificationContainer = document.getElementById('notification-container');
    
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.classList.add('notification', type); // Thêm class để xác định kiểu thông báo (success, error)
    notification.textContent = message;

    // Thêm thông báo vào container
    notificationContainer.appendChild(notification);

    // Hiển thị thông báo
    setTimeout(() => {
        notification.classList.add('show'); // Hiển thị thông báo
    }, 10); // Delay nhỏ để có hiệu ứng chuyển động

    // Tự động ẩn sau thời gian nhất định
    setTimeout(() => {
        notification.classList.remove('show'); // Ẩn thông báo
        // Xóa thông báo sau khi ẩn hoàn toàn
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300); // Thời gian để loại bỏ sau khi ẩn (để hiệu ứng diễn ra)
    }, duration);
}
