// Kiểm tra xem người dùng đã đăng nhập hay chưa
window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login.html
        window.location.href = "login.html";
    }
};
