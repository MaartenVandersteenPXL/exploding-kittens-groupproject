//IMPORTS
import { User, Token, Tables} from "./classes.js";

//classes
    let user = User.load();
    let titles = ["lobby browser", "lobby tafel", "nieuwe tafel"];
    let intros = ["Miauwkes, ", "Hiiiisssss, ", "Purrrrr, " ];

///// elements
//header
    const headerTitle = document.getElementById("headerTitle")
    const headerIntro = document.getElementById("headerIntro")
//nav
    const createNewTableNav = document.getElementById("nieuweTafel")
    const leaveTableNav = document.getElementById("verlaatTafel")
//filter
    const filterForm = document.getElementById("filterForm")
    const numberOfPlayers = document.getElementById("aantalSpelers")
    const numberOfArtificialPlayers = document.getElementById("aiSpelers")
//table
    const newTable = document.querySelector(".newTable");
    const lobbyBrowser = document.querySelector(".lobby-browser");
    const lobbyTable = document.querySelector(".lobbyTable");
    const lobbyTablePlaceholder = document.querySelector(".table-list-placeholder")
//Button
    const createNewTableButton = document.getElementById("createNewTableButton");
    const goToTableButton = document.querySelector(".go-to-table");
    const startTableButton = document.querySelector(".start-table");
//error
    const backendError = document.getElementById("backendError");

//DOM on loading event - first page after redirect
document.addEventListener("DOMContentLoaded", () => {
    
    //LOGICA IF USER IS NOT LOGGED IN -> REDIRECT TO LOGIN
    if(!user){
        window.location.href="index.html";
    }

    //first page after redirect
    leaveTableNav.style.display="none"
    toonSectie(lobbyBrowser,titles[0], intros[0] );
});

///// Events
//ROUTES
createNewTableNav.addEventListener("click", (event) => {
    event.preventDefault();
    createNewTableNav.style.display="none"
    leaveTableNav.style.display="none"
    toonSectie(newTable,titles[2], intros[2])
});

leaveTableNav.addEventListener("click", (event) => {
    createNewTableNav.style.display="none";
    //LOGICA OM TAFEL TE VERLATEN
    toonSectie(lobbyBrowser, titles[0], intros[0]);
})

//BUTTON ACTIONS
createNewTableButton.addEventListener("click", (event) => {
    event.preventDefault();
    createNewTableNav.style.display=""
    //LOGICA OM TAFEL AAN TE MAKEN OP BACKEND
    toonSectie(lobbyBrowser, titles[0], intros[0]);
});

goToTableButton.addEventListener("click", (event) => {
    event.preventDefault();
    createNewTableNav.style.display="none"
    leaveTableNav.style.display=""
    //LOGICA OM TAFEL TE JOINEN
    toonSectie(lobbyTable, titles[1], intros[1]);
});

startTableButton.addEventListener("click", () => {
    //LOGICA voor een game te starten
});

///// Functions
//Page view - Secties wisselen
function toonSectie(sectie, title, intro) {
    [newTable, lobbyBrowser, lobbyTable].forEach(s => s.style.display = "none");
    sectie.style.display = "";
    headerTitle.textContent = title
    headerIntro.textContent = intro + user.userName
}

//Fetch filter
filterForm.addEventListener("submit", async (event) => {
        lobbyTablePlaceholder.style.display="none"
        event.preventDefault()
        //dummy data
        const filterData = {
            NumberOfPlayers : numberOfPlayers,
            NumberOfArtificialPlayers: numberOfArtificialPlayers,
        }
        
        let tableList = await fetchTables(filterData)
        let lobbyListOutput = document.querySelector(".table-list-output")
        for(const table of tableList.tables){
            let row = document.createElement("tr");
            let tdGameId = document.createElement("td");
            let tdSeatedPlayers = document.createElement("td");
            let tdNumberOfPlayers = document.createElement("td");
            let tdSeatAvailable = document.createElement("td");
            
            tdGameId.textContent = table.gameId.substring(0,5);
            tdSeatedPlayers.textContent = table.seatedPlayers.length;
            tdNumberOfPlayers.textContent = String(table.preferences.numberOfPlayers + table.preferences.numberOfArtificialPlayers);
            tdSeatAvailable.textContent = table.hasAvailableSeat ? "ja": "nee"

            row.appendChild(tdGameId);
            row.appendChild(tdSeatedPlayers);
            row.appendChild(tdNumberOfPlayers);
            row.appendChild(tdSeatAvailable);

            lobbyListOutput.appendChild(row);
        }
});

async function fetchTables(filterData){
    try {
        
        //REAL API CALL
        /*
        const params = new URLSearchParams(filterData)
        const response = await fetch(`https://localhost:3000/api/Tables/with-available-seats?{params}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer" + Token.load()
            }
        })*/

        //TEST DATA
        const response = await fetch("http://localhost:3000/api/tables/with-available-seats", {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
            }
        })
        const dataTables = await response.json();
        if(!response.ok){
            throw new Error(dataTables.message );
        }
        const tables = new Tables(dataTables);
        if(!tables){
            throw new Error("Geen tafels beschikbaar")
        }
        return tables;

    }catch(error){
         backendError.textContent = error.message
    }
}

