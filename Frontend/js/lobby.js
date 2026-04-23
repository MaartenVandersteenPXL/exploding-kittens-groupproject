//IMPORTS
import { User, Token, Tables, Table} from "./classes.js";

//classes
    let user = User.load();
    let titles = ["lobby browser", "lobby tafel", "nieuwe tafel"];
    let intros = ["Miauwkes, ", "Hiiiisssss, ", "Purrrrr, " ];

//VARIABLES
    let playerTableCandidateId;

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
    const lobbyTablePlaceholder = document.querySelector(".table-list-placeholder");
    const lobbyTableList = document.querySelector(".table-list-output");

//Button
    const createNewTableButton = document.getElementById("createNewTableButton");
    const goToTableButton = document.getElementById("goToTable");
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
    //TODO reset css clicked candidate table
    createNewTableNav.style.display="none"
    leaveTableNav.style.display="none"
    toonSectie(newTable,titles[2], intros[2])
});

//leavePlayersTable
leaveTableNav.addEventListener("click", async (event) => {
    playerTableCandidateId = "";
    createNewTableNav.style.display="";
    leaveTableNav.style.display="none"
    //TODO - leaveResult - WAIT FOR BACKEND
    console.log("TOFIX: leave user from player table L76")
    //let leaveResult = await playerLeaveTable(playerTableCandidateId)
    //if(!result) return
    toonSectie(lobbyBrowser, titles[0], intros[0]);
})

//////BUTTON ACTIONS
//newTable
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
//selectPlayersTable
goToTableButton.addEventListener("click", async (event) => {
    event.preventDefault();
    createNewTableNav.style.display="none"
    leaveTableNav.style.display=""
    //LOGICA OM TAFEL TE JOINEN
    
    //check playerTableId
    console.log("TAFEL ID GEKLIKT:", playerTableCandidateId)
    if(!playerTableCandidateId){
        backendError = "Gelieve een tafel te selecteren";
        //TODO reset css clicked candidate table
    }
    //TODO - JOIN TABLE WAIT FOR BE
    console.log("TOFIX: join user on player table L131")
    /*
    //join table
    let joinedResult = await playerJoinTable(playerTableCandidateId);
    if(!joinedResult){
        return;
    }
        */
    //BUILD Players table
    let playersTable = await fetchPlayerTable(playerTableCandidateId);
    let playersTotal = playersTable.preferences.numberOfArtificialPlayers + playersTable.preferences.numberOfPlayers;
    let playerTableListOutput = document.querySelector(".table-player-output")
    for(let player = 0; player < playersTotal; player++ ){
         let row = document.createElement("tr");
         let tdSeatedPlayerSlot = document.createElement("td");
         if( player < playersTable.seatedPlayers.length){
            tdSeatedPlayerSlot.textContent = playersTable.seatedPlayers[player].name;
         }else{
            tdSeatedPlayerSlot.textContent="AI COMPUTERRRRRR";
         }
         row.appendChild(tdSeatedPlayerSlot)
         playerTableListOutput.appendChild(row);
    }
    toonSectie(lobbyTable, titles[1], intros[1]);
});
//startPlayersTable
startTableButton.addEventListener("click", () => {
    //TODO LOGICA voor een game te starten
    console.log("TOFIX: start players table - L158");
});

///// Functions
//Page view - Secties wisselen
function toonSectie(sectie, title, intro) {
    [newTable, lobbyBrowser, lobbyTable].forEach(s => s.style.display = "none");
    sectie.style.display = "";
    headerTitle.textContent = title
    headerIntro.textContent = intro + user.userName
}

//EVENT - browser filter - submit fiter
filterForm.addEventListener("submit", async (event) => {

        lobbyTableList.replaceChildren();
        lobbyTablePlaceholder.style.display="none"
        event.preventDefault()
        //dummy data
        const filterData = {
            NumberOfPlayers : numberOfPlayers.value,
            NumberOfArtificialPlayers: numberOfArtificialPlayers.value,
        }
        
        let tableList = await fetchTables(filterData)
        
        tableList.tables.forEach((table , index) => {
            let row = document.createElement("tr");
            let tdGameId = document.createElement("td");
            let tdSeatedPlayers = document.createElement("td");
            let tdNumberOfPlayers = document.createElement("td");
            let tdSeatAvailable = document.createElement("td");
            
            row.classList.add(`tableCandidate-${index}`);
            tdGameId.classList.add("gameId", `tableCandidate-${index}`);
            tdSeatedPlayers.classList.add("seatedPlayers", `tableCandidate-${index}`);
            tdNumberOfPlayers.classList.add("numberOfPlayers", `tableCandidate-${index}`);
            tdSeatAvailable.classList.add("seatAvailable", `tableCandidate-${index}`);

            //TODO id in full length for select
            tdGameId.textContent = table.gameId;
            tdSeatedPlayers.textContent = table.seatedPlayers.length;
            tdNumberOfPlayers.textContent = String(table.preferences.numberOfPlayers + table.preferences.numberOfArtificialPlayers);
            tdSeatAvailable.textContent = table.hasAvailableSeat ? "ja": "nee"

            row.appendChild(tdGameId);
            row.appendChild(tdSeatedPlayers);
            row.appendChild(tdNumberOfPlayers);
            row.appendChild(tdSeatAvailable);

            lobbyTableList.appendChild(row);
        });
});

filterForm.addEventListener("reset", async (event) =>{
    event.preventDefault();
    lobbyTableList.replaceChildren();
    lobbyTablePlaceholder.style.display=""
    lobbyTableList.appendChild(lobbyTablePlaceholder);
    numberOfPlayers.selectedIndex = 0;
    numberOfArtificialPlayers.selectedIndex = 0;

})

//Event tableCandidate
lobbyTableList.addEventListener('click', (event) => {
    const row = event.target.closest('[class^="tableCandidate-"]');
    if(!row) return;
    const tdGameId = row.querySelector(".gameId");
    playerTableCandidateId = tdGameId.innerText;
});

//////BACKEND CALLS
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

//Fetch player table list
async function fetchPlayerTable(gameId){
    try {
        //REAL API CALL
        /*
        const response = await fetch(`https://localhost:3000/api/Tables/${gameId}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer" + Token.load()
            }
        });
        */
        //TEST DATA
        let testGameId = "00000000-6828-5673-c4gd-3d074g77bgb7"
        const response = await fetch(`http://localhost:3000/api/tables/${testGameId}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
            }
        })
        //END TEST DATA
        const dataPlayerTable = await response.json();
        if(!response.ok){
            throw new Error(dataPlayerTable.message );
        }
        const playerTable = new Table(
            dataPlayerTable.id,
            dataPlayerTable.preferences,
            dataPlayerTable.seatedPlayers,
            dataPlayerTable.hasAvailableSeat,
            dataPlayerTable.gameId);
        return playerTable;

    }catch(error){
         backendError.textContent = error.message
    }
}

//Fetch player table join
async function playerJoinTable(gameId){
       try{
        //REAL API CALL
        const response = await fetch(`https://localhost:5051/api/tables/${gamiId}/join`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer" + Token.load(),
            }
        });
        //TEST DATA
        // Geen test endpoint
        // END TEST DATA
        
        const dataJoinedTable = await response.json();
        if(!response.ok){
            throw new Error(dataJoinedTable.message );
        }
        const joinedTable = new Table(
            dataJoinedTable.id,
            dataJoinedTable.preferences,
            dataJoinedTable.seatedPlayers,
            dataJoinedTable.hasAvailableSeat,
            dataJoinedTable.gameId);
        return joinedTable;
    }catch(error){
        backendError.textContent = error.message;
    }
}

//Fetch player table leave
async function playerLeaveTable(gameId){
       try{
        //REAL API CALL
        const response = await fetch(`https://localhost:5051/api/tables/${gamiId}/leave`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer" + Token.load(),
            }
        });
        //TEST DATA
        // Geen test endpoint
        // END TEST DATA
        
        const dataLeavedTable = await response.json();
        if(!response.ok){
            throw new Error(dataJoinedTable.message );
        }
        return dataLeavedTable.message;
    }catch(error){
        backendError.textContent = error.message;
    }
}
