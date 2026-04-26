import { User, Token } from "./Classes/userClasses.js";
import { GameModel, Card } from "./Classes/gameClasses.js";
import { ProblemDetails } from "./Classes/tableClasses.js";

////CLASSES
let user = User.load();
let titels = ["Game on"]
let intros = ["This is amazing! Prrt!",
    "Zoom zoom! Catch me if you can! Mrrrow!",
    "I got it! I got it! …wait—gone. Hmph!",
    "Best game ever! Pounce! Prrrp!",
    "You saw that, right? I’m incredible. Meow!"]

///// ELEMENTS
//header
const headerTitle = document.getElementById("headerTitle");
const headerIntro = document.getElementById("headerIntro");
//nav
const logout = document.getElementById("logout");
//game
const userDeskMessageBoard= document.getElementById("statusMessage");
/*
///Test id
//TODO - uncomment
const urlParams = new URLSearchParams(window.location.search);
const tableIdfromURL = urlParams.get("tableId");
*/
const tableIdfromURL = "a1b2c3d4-1234-5678-abcd-ef1234567890";
///End test id

//userCardDek
const userHandCardContainer = document.getElementById("userCardHand");

//DOM ON LOADING EVENT
document.addEventListener("DOMContentLoaded", async() => {
    /*
    if(!user){
        window.location.href="index.html";
    }
    */
    gameInit();
    await userCardsBuilder();
});

////FUNCTIES
function gameInit(){
    headerTitle.textContent=titels[0];
    headerIntro.textContent=intros[0];
    userDeskMessageBoard.textContent = "Het spel wordt geladen";
}

async function userCardsBuilder(){
    let gameModel = await fetchGame(tableIdfromURL);
    gameModel.players[0].cardsInHand.forEach(element => {
        let cardContainer = document.createElement("div");
        let cardName = document.createElement("p");
        let cardEnum = document.createElement("p");
        
        cardContainer.classList.add(`own-card`);
        cardName.classList.add(`card-name`);
        cardEnum.classList.add(`card-enum`);

        cardName.textContent = element.card.getName();
        cardEnum.textContent = element.card.typeNr;

        cardContainer.appendChild(cardName);
        cardContainer.appendChild(cardEnum);
        userHandCardContainer.appendChild(cardContainer);
    });
    userDeskMessageBoard.textContent="Klaar om te spelen!";
}



///// EVENTS
////ROUTES
//LogOut
logout.addEventListener("click", async (Event) => {
    Token.delete();
    User.delete();
})

///////// BACKEND CALLS
//Fetch Game
async function fetchGame(filterData){
    try {
        
        //REAL API CALL
        /*
        const params = new URLSearchParams(filterData)
        const response = await fetch(`https://localhost:5051/api/Games/${params}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer " + Token.load()
            }
        })
        */
        //TEST DATA
        //const params = new URLSearchParams(filterData)
        const response = await fetch(`http://localhost:3000/api/games/${filterData}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
            }
        })
        //END TEST DATA
        const dataGames = await response.json();
        if(!response.ok){
            const problemDetails = new ProblemDetails(dataGames)
            console.log("TROUBLES"+ problemDetails);
            throw new Error(dataGames.message );
        }
        const gameModel = new GameModel(
            dataGames.id,
            dataGames.players,
            dataGames.discardPile,
            dataGames.discardPileCouny,
            dataGames.playerToPlayId,
            dataGames.pendingAction,
            dataGames.hasEnded
            );
        return gameModel;

    }catch(error){
         backendError.textContent = error.message
    }
};

