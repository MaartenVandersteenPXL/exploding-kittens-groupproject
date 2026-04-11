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
//table
    const newTable = document.querySelector(".newTable");
    const lobbyBrowser = document.querySelector(".lobbyBrowser");
    const lobbyTable = document.querySelector(".lobbyTable");
//Button
    const createNewTableButton = document.getElementById("createNewTableButton");
    const goToTableButton = document.querySelector(".go-to-table");
    const startTableButton = document.querySelector(".start-table");
//error
    const backendError = document.getElementById("backendError");

//DOM on loading event - first page after redirect
document.addEventListener("DOMContentLoaded", () => {
    
    //LOGICA IF USER IS NOT LOGGED IN -> REDIRECT TO LOGIN
    
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
        event.preventDefault()
        //dummy data
        const filterData = {
            NumberOfPlayers : 2,
            NumberOfArtificialPlayers: 1,
        }
        
        let tableList = await fetchTables(filterData)
        let lobbyListOutput = document.getElementById("tableListOutput")
        for(const table of tableList.tables){
            let trRow = document.createElement("tr");
            let tdGameId = document.createElement("td");
            let tdSeatedPlayers = document.createElement("td");
            let tdNumberOfPlayers = document.createElement("td");
            let tdSeatAvailable = document.createElement("td");
            
            tdGameId.textContent = table.gameId.substring(0,5);
            tdSeatedPlayers.textContent = table.seatedPlayers.length;
            tdNumberOfPlayers.textContent = String(table.preferences.numberOfPlayers + table.preferences.numberOfArtificialPlayers);
            tdSeatAvailable.textContent = table.hasAvailableSeats

            trRow.appendChild(tdGameId);
            trRow.appendChild(tdSeatedPlayers);
            trRow.appendChild(tdNumberOfPlayers);
            trRow.appendChild(tdSeatAvailable);

            lobbyListOutput.appendChild(trRow);
        }
});

async function fetchTables(filterData){
    try {
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
        if(!response.ok){
            const errorMessage = await response.json();
            throw new Error(errorMessage.message );e
        }
        const dataTables = await response.json();
        const tables = new Tables(dataTables);
        if(!tables){
            throw new Error("Geen tafels beschikbaar")
        }
        return tables;

    }catch(error){
         backendError.textContent = error.message
    }
}

