//IMPORTS
import { User, Token, Tables, Table, ProblemDetails} from "./classes.js";

//classes
    let user = User.load();
    let titles = ["lobby browser", "lobby tafel", "nieuwe tafel"];
    let intros = ["Miauwkes, ", "Hiiiisssss, ", "Purrrrr, " ];
    let tableTicker = true;

//VARIABLES
    let playerTableCandidateId;

///// elements
//header
    const headerTitle = document.getElementById("headerTitle");
    const headerIntro = document.getElementById("headerIntro");
//nav
    const lobbyNav = document.getElementById("lobby");
    const createNewTableNav = document.getElementById("nieuweTafel");
    const leaveTableNav = document.getElementById("verlaatTafel");
    const logout = document.getElementById("logout");
//filter
    const filterForm = document.getElementById("filterForm");
    const numberOfPlayers = document.getElementById("aantalSpelers");
    const numberOfArtificialPlayers = document.getElementById("aiSpelers");
//table -new
    const newTable = document.querySelector(".new-table");

    //HAMZA
    const numberOfNewPlayers =document.getElementById("numberOfNewPlayers");
    const numberOfNewAiPlayers = document.getElementById("numberOfNewAIPlayers");
    const newPlayersError = document.getElementById("numberOfNewPlayersError");
    const newAiError = document.getElementById("numberOfNewAIPlayersError");
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
    const backendErrorPlayersTabel = document.getElementById("backendErrorPlayersTable")

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

///////// Events
////ROUTES
//newTable
createNewTableNav.addEventListener("click", (event) => {
    event.preventDefault();
    //TODO reset css clicked candidate table
    createNewTableNav.style.display="none"
    leaveTableNav.style.display="none"
    toonSectie(newTable,titles[2], intros[2])
});

//leavePlayersTable
leaveTableNav.addEventListener("click", async (event) => {
    await playerLeaveTable(playerTableCandidateId)
    document.querySelectorAll('[class^="tableCandidate-"].active').forEach(x => x.classList.remove('active'))
    tableTicker = false;
    playerTableCandidateId = "";
    createNewTableNav.style.display="";
    leaveTableNav.style.display="none";
    lobbyTableList.replaceChildren();
    lobbyTableList.appendChild(lobbyTablePlaceholder);
    startTableButton.innerText="Wachten op spelers";
    backendErrorPlayersTabel.textContent="";
    backendError.textContent="";
    toonSectie(lobbyBrowser, titles[0], intros[0]);
})

//LogOut
logout.addEventListener("click", async (Event) => {
    Token.delete();
    User.delete();
})

////BUTTON ACTIONS
//newTable
createNewTableButton.addEventListener("click", async (event) => {
    event.preventDefault();
    ////LOGICA OM TAFEL AAN TE MAKEN OP BACKEND
    //reset
    newPlayersError.textContent = "";
    newAiError.textContent = "";
    backendError.textContent = "";

    //build newTableData
    let hasError = false;
    if (numberOfNewPlayers.value < 2 || numberOfNewPlayers.value > 5) {
        newPlayersError.textContent = "Aantal spelers moet tussen 2 en 5 liggen";
        hasError = true;
    }
    if (numberOfNewAiPlayers.value < 0 || numberOfNewAiPlayers.value > 4) {
        newAiError.textContent = "Aantal AI spelers moet tussen 0 en 4 liggen";
        hasError = true;
    }
    let telling = parseInt(numberOfNewPlayers.value) + parseInt(numberOfNewAiPlayers.value);
    if (telling > 5) {
        newAiError.textContent = "Totaal aantal spelers mag max 5 zijn";
        hasError = true;
    }
    if (hasError) return;

    //create table backend
    const result = await createTable(numberOfNewPlayers.value, numberOfNewAiPlayers.value);
    if (!result) return;
    // END HAMZA CODE
    createNewTableNav.style.display=""
    toonSectie(lobbyBrowser, titles[0], intros[0]);
});
//selectPlayersTable
goToTableButton.addEventListener("click", async (event) => {
    tableTicker = true;
    event.preventDefault();
    //check playerTableId
    if(!playerTableCandidateId){
        backendError.textContent = "Gelieve een tafel te selecteren";
        return;
    }
    lobbyNav.style.display="none";
    createNewTableNav.style.display="none";
    leaveTableNav.style.display="";
    backendErrorPlayersTabel.textContent="";
    //BUILD Players table
    await playerJoinTable(playerTableCandidateId)
    let playersTable = await fetchPlayerTable(playerTableCandidateId);
    let playersTotal = playersTable.preferences.numberOfPlayers;
    let playerTableListOutput = document.querySelector(".table-player-output")
    playerTableListOutput.replaceChildren();
        for(let player = 0; player < playersTotal; player++ ){
            let row = document.createElement("tr");
            let tdSeatedPlayerSlot = document.createElement("td");
            if( player < playersTable.seatedPlayers.length){
                tdSeatedPlayerSlot.textContent = playersTable.seatedPlayers[player].name;
            }else{
                tdSeatedPlayerSlot.textContent="Wachten op speler";
            }
            row.appendChild(tdSeatedPlayerSlot)
            playerTableListOutput.appendChild(row);
        }
    toonSectie(lobbyTable, titles[1], intros[1]);
    while(playersTable.hasAvailableSeat && tableTicker){
        playersTable = await fetchPlayerTable(playerTableCandidateId);
        playerTableListOutput.replaceChildren();
        for(let player = 0; player < playersTotal; player++ ){
            let row = document.createElement("tr");
            let tdSeatedPlayerSlot = document.createElement("td");
            if( player < playersTable.seatedPlayers.length){
                tdSeatedPlayerSlot.textContent = playersTable.seatedPlayers[player].name;
            }else{
                tdSeatedPlayerSlot.textContent="Wachten op speler";}
            row.appendChild(tdSeatedPlayerSlot)
            playerTableListOutput.appendChild(row);
        }
        await new Promise(t=> setTimeout(t, 10000));
    }
    startTableButton.innerText="Tafel wordt gestart";
    await new Promise(t=> setTimeout(t, 3000));
    startTableButton.click();
});

//startPlayersTable
startTableButton.addEventListener("click", () => {
    if(startTableButton.textContent != "Start tafel"){
        backendErrorPlayersTabel.textContent="Kan tafel nog niet starten. Wachten op andere spelers";
        return;
    }
    tableTicker = false;
    window.location.href = "game.html?gameId=" + encodeURIComponent(playerTableCandidateId);
});

////FORMS
//browser filter - submit fiter
filterForm.addEventListener("submit", async (event) => {
        playerTableCandidateId == "";
        event.preventDefault()
        const filterData = {
            NumberOfPlayers : numberOfPlayers.value,
            NumberOfArtificialPlayers: numberOfArtificialPlayers.value,
        }
        
        let tableList = await fetchTables(filterData)
        
        if(tableList.tables.length === 0){
            lobbyTablePlaceholder.textContent="Geen tafels beschikbaar met deze filter"
            return;
        }
        lobbyTableList.replaceChildren();
        tableList.tables.forEach((table , index) => {
            let row = document.createElement("tr");
            let tdTableId = document.createElement("td");
            let tdSeatedPlayers = document.createElement("td");
            let tdNumberOfPlayers = document.createElement("td");
            let tdSeatAvailable = document.createElement("td");
            
            row.classList.add(`tableCandidate-${index}`);
            tdTableId.classList.add("tableId", `candidateElement-${index}`);
            tdSeatedPlayers.classList.add("seatedPlayers", `candidateElement-${index}`);
            tdNumberOfPlayers.classList.add("numberOfPlayers", `candidateElement-${index}`);
            tdSeatAvailable.classList.add("seatAvailable", `candidateElement-${index}`);

            tdTableId.textContent = table.id;
            tdSeatedPlayers.textContent = table.seatedPlayers.length;
            tdNumberOfPlayers.textContent = String(table.preferences.numberOfPlayers + table.preferences.numberOfArtificialPlayers);
            tdSeatAvailable.textContent = table.hasAvailableSeat ? "ja": "nee"

            row.appendChild(tdTableId);
            row.appendChild(tdSeatedPlayers);
            row.appendChild(tdNumberOfPlayers);
            row.appendChild(tdSeatAvailable);

            lobbyTableList.appendChild(row);
        });
});

//browser filter - reset filter
filterForm.addEventListener("reset", async (event) =>{
    event.preventDefault();
    playerTableCandidateId = "";
    backendError.textContent="";
    lobbyTableList.replaceChildren();
    lobbyTablePlaceholder.style.display="";
    lobbyTablePlaceholder.textContent="Gelieve de tafels te filteren";
    lobbyTableList.appendChild(lobbyTablePlaceholder);
    numberOfPlayers.selectedIndex = 0;
    numberOfArtificialPlayers.selectedIndex = 0;

})

/////ACTIONS
//tableCandidate
lobbyTableList.addEventListener('click', (event) => {
    backendError.textContent="";
    const row = event.target.closest('[class^="tableCandidate-"]');
    if(!row) return;
    document.querySelectorAll('[class^="tableCandidate-"].active').forEach(x => x.classList.remove('active'))
    row.classList.add('active');
    const tdTableId = row.querySelector(".tableId");
    playerTableCandidateId = tdTableId.innerText;
    console.log("playerTableCandidate:", playerTableCandidateId);
});

///////// FUNCTIONS
//Page view - Secties wisselen
function toonSectie(sectie, title, intro) {
    [newTable, lobbyBrowser, lobbyTable].forEach(s => s.style.display = "none");
    sectie.style.display = "";
    headerTitle.textContent = title
    headerIntro.textContent = intro + user.userName
}

///////// BACKEND CALLS
//Fetch tables
async function fetchTables(filterData){
    try {
        
        //REAL API CALL
        const params = new URLSearchParams(filterData)
        const response = await fetch(`https://localhost:5051/api/Tables/with-available-seats?${params}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer " + Token.load()
            }
        })
        /*
        //TEST DATA
        const response = await fetch("http://localhost:3000/api/tables/with-available-seats", {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
            }
        })
        //END TEST DATA
        */
        const dataTables = await response.json();
        if(!response.ok){
            const problemDetails = new ProblemDetails(dataTables)
            console.log("TROUBLES"+ problemDetails);
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
        
        let response = await fetch("https://localhost:5051/api/Tables",{
            method: "POST",
            body: JSON.stringify({
                numberOfPlayers: players,
                numberOfArtificialPlayers: ai
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + Token.load(),
            }
        });
        /*
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
        */
        const createdTable = await response.json();
        if (!response.ok) {
            throw new Error(createdTable.message);
        }
        return createTable;
        console.log("//INFO: Tafel gemaakt",createdTable);// voor mijn debug
    }catch(error){
        backendError.textContent = error.message;
        return null;
    }
}

//Fetch player table list
async function fetchPlayerTable(tableId){
    try {
        //REAL API CALL
        
        const response = await fetch(`https://localhost:5051/api/Tables/${tableId}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer " + Token.load()
            }
        });
        /*
        //TEST DATA
        let testGameId = "00000000-6828-5673-c4gd-3d074g77bgb7"
        const response = await fetch(`http://localhost:3000/api/tables/${testGameId}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
            }
        })
        //END TEST DATA
        */
        const dataPlayerTable = await response.json();
        if(!response.ok){
            const problemDetails = new ProblemDetails(dataPlayerTable)
            console.log("TROUBLES"+ problemDetails);
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
async function playerJoinTable(tableId){
       try{
        //REAL API CALL
        const response = await fetch(`https://localhost:5051/api/tables/${tableId}/join`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + Token.load(),
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
async function playerLeaveTable(tableId){
       try{
        //REAL API CALL
        const response = await fetch(`https://localhost:5051/api/tables/${tableId}/leave`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + Token.load(),
            }
        });
        //TEST DATA
        // Geen test endpoint
        // END TEST DATA
        if(!response.ok){
            const dataLeavedTable = await response.json();
            const problemDetails = new ProblemDetails(dataLeavedTable)
            console.log("TROUBLES"+ toString(problemDetails));
            throw new Error(dataLeavedTable.message );
        }
    }catch(error){
        backendError.textContent = error.message;
    }
}
