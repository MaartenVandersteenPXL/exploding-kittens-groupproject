//IMPORTS
import { User } from "./classes.js";

//classes
    let user = User.load();
    let titles = ["lobby browser", "lobby tafel", "nieuwe tafel"];
    let intros = ["Miauwkes, ", "Hiiiisssss, ", "Purrrrr, " ];

///// elements
//header
    const headerTitle = document.getElementById("headerTitle")
    const headerIntro = document.getElementById("headerIntro")
// nav
    const createNewTableNav = document.getElementById("nieuweTafel")
//table
    const newTable = document.querySelector(".newTable");
    const lobbyBrowser = document.querySelector(".lobbyBrowser");
    const lobbyTable = document.querySelector(".lobbyTable");
    const createNewTableButton = document.getElementById("createNewTableButton");
    const goToTableButton = document.querySelector(".go-to-table");
    const leaveTableButton = document.querySelector(".leave-table");

//DOM on loading event - first page after redirect
document.addEventListener("DOMContentLoaded", () => {
    //first page after redirect
    toonSectie(lobbyBrowser,titles[0], intros[0] );
});

///// Events
//routes
createNewTableNav.addEventListener("click", (event) => {
    event.preventDefault();
    createNewTableNav.style.display="none"
    toonSectie(newTable,titles[2], intros[2])
});

createNewTableButton.addEventListener("click", (event) => {
        createNewTableNav.style.display=""
        event.preventDefault();
        toonSectie(lobbyBrowser, titles[0], intros[0]);
    });

goToTableButton.addEventListener("click", () => {
    toonSectie(lobbyTable, titles[1], intros[1]);
});

leaveTableButton.addEventListener("click", () => {
    toonSectie(newTable, titles[2], intros[2]);
    //LOGICA VOOR NEW TABLE AAN TE MAKEN OP BACKEND
});


///// Functions
//Page view - Secties wisselen
function toonSectie(sectie, title, intro) {
    [newTable, lobbyBrowser, lobbyTable].forEach(s => s.style.display = "none");
    sectie.style.display = "";
    headerTitle.textContent = title
    headerIntro.textContent = intro + user.userName
}  