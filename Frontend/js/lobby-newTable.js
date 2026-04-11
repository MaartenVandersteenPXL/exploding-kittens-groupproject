
// user is ingelogd check en user pakken
document.addEventListener("DOMContentLoaded", function ()  {
    const token = sessionStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
    }

    const userString = sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : user;

    const userNameElement = document.getElementById("userName");
    userNameElement.textContent = user.userName;

});