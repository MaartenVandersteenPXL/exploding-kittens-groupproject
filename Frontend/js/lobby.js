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
//table -new
    const newTable = document.querySelector(".new-table");

    //HAMZA
    const players = parseInt(document.getElementById("numberOfPlayers").value);
    const ai = parseInt(document.getElementById("numberOfAIPlayers").value);
    const playersError = document.getElementById("numberOfPlayersError");
    const aiError = document.getElementById("numberOfAIPlayersError");
    //end HAMZA

//table-browser
    const lobbyBrowser = document.querySelector(".lobby-browser");
    const lobbyTable = document.querySelector(".lobby-table");
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
    createNewTableNav.style.display="";
    leaveTableNav.style.display="none"
    //LOGICA OM TAFEL TE VERLATEN
    toonSectie(lobbyBrowser, titles[0], intros[0]);
})

//BUTTON ACTIONS
createNewTableButton.addEventListener("click", async (event) => {
    event.preventDefault();
    ////LOGICA OM TAFEL AAN TE MAKEN OP BACKEND
    //HAMZA code
    //reset
    playersError.textContent = "";
    aiError.textContent = "";
    backendError.textContent = "";

    //build newTableData
    let hasError = false;
    if (players < 2 || players > 5) {
        playersError.textContent = "Aantal spelers moet tussen 2 en 5 liggen";
        hasError = true;
    }
    if (ai < 0 || ai > 4) {
        aiError.textContent = "Aantal AI spelers moet tussen 0 en 4 liggen";
        hasError = true;
    }
    if (players + ai > 5) {
        aiError.textContent = "Totaal aantal spelers mag max 5 zijn";
        hasError = true;
    }
    if (hasError) return;

    //create table backend
    const result = await createTable(players, ai);
    if (!result) return;
    // END HAMZA CODE
    createNewTableNav.style.display=""
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

//Fetch tables
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
        //END TEST DATA
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

//Fetch new table - HAMZA
async function createTable(players, ai){
    try{
        //REAL API CALL
        /*
        let response = await fetch("https://localhost:5051/api/Tables",{
            method: "POST",
            body: JSON.stringify({
                numberOfPlayers: players,
                numberOfArtificialPlayers: ai
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer" + Token.load(),
            }
        });
        */
        //TEST DATA
        const response = await fetch("http://localhost:3000/api/Tables", {
            method: "POST",
            body: JSON.stringify({
                numberOfPlayers: players,
                numberOfArtificialPlayers: ai
            }),
            headers: {
                'Content-type' : 'application/json',
            }
        })
        // END TEST DATA
        const createdTable = await response.json();
        if (!response.ok) {
            throw new Error(createdTable.message);
        }
        console.log("//INFO: Tafel gemaakt",createdTable);// voor mijn debug
    }catch(error){
        backendError.textContent = error.message;
        return null;
    }
}

