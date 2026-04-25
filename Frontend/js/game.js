///// ELEMENTS
//nav
const logout = document.getElementById("logout");

///// EVENTS
////ROUTES
//LogOut
logout.addEventListener("click", async (Event) => {
    Token.delete();
    User.delete();
})