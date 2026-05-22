import { User, Token } from "./Classes/userClasses.js";
import { GameModel, Player, Card } from "./Classes/gameClasses.js";
import { ProblemDetails } from "./Classes/tableClasses.js";
import { CardType } from "./Enums/cardEnums.js";
import { CardImage } from "./Enums/cardEnums.js";
////CLASSES
let user = User.load();
let gameModel = {};
let titels = ["Game on"];
let intros = ["This is amazing! Prrt!",
    "Zoom zoom! Catch me if you can! Mrrrow!",
    "I got it! I got it! …wait—gone. Hmph!",
    "Best game ever! Pounce! Prrrp!",
    "You saw that, right? Im incredible. Meow!"];
let userAsPlayer;
let selectedUserPlayerCardsId = [];

///// ELEMENTS
//header
const headerTitle = document.getElementById("headerTitle");
const headerIntro = document.getElementById("headerIntro");
//nav
const logout = document.getElementById("logout");
//game
const playButton = document.getElementById("playActionBtn");
const nopePrompt = document.getElementById("nopePrompt");
const nopeButton = document.getElementById("nopeBtn");
const passButton = document.getElementById("passBtn");
const gameState = document.getElementById("gameState");
//Error
const backendError = document.getElementById("backendError");
/*
///Test id
const gameIdfromURL = "a1b2c3d4-1234-5678-abcd-ef1234567890";
*/
const urlParams = new URLSearchParams(window.location.search);
let gameIdfromURL = urlParams.get("gameId");
///End test id

//userCardDek
const userHandCardContainer = document.getElementById("userCardHand");
const userDeskMessageBoard= document.getElementById("statusMessage");

//DOM ON LOADING EVENT
document.addEventListener("DOMContentLoaded", async() => {

    if(!user){
        window.location.href="index.html";
    }
    await gameInit();
    BuildGameTable();
    await startGameLoop();
});

////FUNCTIES
async function gameInit(){
    gameModel = await fetchGame(gameIdfromURL);
    headerTitle.textContent=titels[0];
    headerIntro.textContent=intros[0];
    userDeskMessageBoard.textContent = "Het spel wordt geladen";
    userAsPlayer = gameModel.players.find(p => p.id === user.id);
}

async function startGameLoop(){
    while(!gameModel.hasEnded){
        await new Promise(resolve => setTimeout(resolve, 3000));
        gameModel = await fetchGame(gameIdfromURL);
        BuildGameTable();
    }
}

function BuildGameTable(){
    buildMyCards();
    buildOpponents();
    buildTableInfo()
    buildTurnControls();
    buildNopePrompt();
}

function buildMyCards(){
    userHandCardContainer.replaceChildren();
    userAsPlayer.cardsInHand.forEach(element => {
        let cardContainer = document.createElement("div");
        let cardName = document.createElement("p");
        let cardEnum = document.createElement("p");
        let cardImg = document.createElement("img");

        cardContainer.classList.add(`own-card`, `${element.card.getName()}`);
        cardName.classList.add(`card-name`);
        cardEnum.classList.add(`card-enum`);
        cardImg.classList.add("card-img");

        //Background card
        //cardContainer.style.backgroundImage= `url('${element.card.getImage()}')`;
        //cardImg.alt=`${element.card.getName()}-img`;

        cardName.textContent = element.card.getName();
        cardEnum.textContent = element.card.typeNr;

        cardContainer.appendChild(cardName);
        cardContainer.appendChild(cardEnum);
        //cardContainer.appendChild(cardImg);
        userHandCardContainer.appendChild(cardContainer);
        cardContainer.addEventListener("click", () => {
            if(cardContainer.classList.contains("clickable")) {
                cardContainer.classList.toggle("selected")
            }
        });
    });
}

function buildOpponents() {
    const opponentDivs = document.querySelectorAll(".opponent");
    let opponentIndex = 0;
    gameModel.players.forEach(player => {
        if (player.id !== user.id) {
            const opponentDiv = opponentDivs[opponentIndex];
            opponentDiv.querySelector("span").textContent = player.name;
            opponentDiv.querySelector(".nr-cards-opponents").textContent = player.cardsInHandCount;

            opponentIndex++;
        }
    });
    while(opponentIndex < opponentDivs.length){
        const opponentDiv = opponentDivs[opponentIndex];
        opponentDiv.style.display = "none";
        opponentIndex++;
    }
}

function buildTableInfo(){
    const drawPileCountNow = document.querySelector(".nr-cards-left-deck");
    drawPileCountNow.textContent= gameModel.drawPileCount;

    const lastDiscardedCard = document.getElementById("lastDiscardedCard");
    if (gameModel.discardPile.length === 0) {
        lastDiscardedCard.textContent = "LEEG";
    } else {
        const lastCard = gameModel.discardPile[gameModel.discardPile.length - 1];
        lastDiscardedCard.textContent = lastCard.discardPile.getName();
    }
}

function buildNopePrompt(){
    const hasPendingAction = gameModel.pendingAction != null;
    const isMyAction = gameModel.pendingAction?.playerId === user.id;

    if(hasPendingAction && !isMyAction){
        nopePrompt.style.display = "block";
        userDeskMessageBoard.textContent = "Een speler speelde:" + gameModel.pendingAction.cards.map(c => c.getName()).join(", ") + "wil je NOPE spelen?";

    }else {
        nopePrompt.style.display = "none";
    }
}

function buildTurnControls(){
    //dynamische gebouwd - hier pas asignen
    const myCards = document.querySelectorAll(".own-card");
    const isMyTurn = gameModel.playerToPlayId === user.id;

    if (isMyTurn) {

        userDeskMessageBoard.textContent = "jouw beurt"
        playButton.disabled = false;
        playButton.classList.remove("disabled");

        myCards.forEach(card => {
            // Nog af te wachten waar de "clickable" class selector naar toe gaat
            card.classList.add("clickable");
        });

        ///INCOMMING REQUEST
        //WANNEER FAVOR VRAAG KOMT -> KAART SELECTEREN -> selectCardAsFavor(cardId)
        // setGameState(`${user.name} IS CHOOSING A CARD TO FAVOR`)
        //WANNEER DOUBLE KOMT -> ...
        // setGameState(`${user.name} ???`)
        //WANNEER TRIPLE KOMT -> ...
        // setGameState(`${user.name} ???`)
        //WANNNER EEN NOPE KOMT
        // setGameState(`${user.name} IS THINKING ABOUT NOPPING THE NOPE CARD`)


    } else {
        userDeskMessageBoard.textContent = "wachten op andere spelers"
        playButton.disabled = true;
        playButton.classList.add("disabled");
        myCards.forEach(card => {
            // Nog af te wachten waar de "clickable" / "selected" class selector naar toe gaat
            card.classList.remove("clickable");
            card.classList.remove("selected"); // also deselect if it was your turn before
        });
    }
}

function buildSelectedCards(){
    selectedUserPlayerCardsId = [];
    const selectedUserPlayerCardsContainer = userHandCardContainer.querySelectorAll(".selected");
    selectedUserPlayerCardsContainer.forEach(cardElement => {
        let cardTypeNr = parseInt(cardElement.querySelector(".card-enum").textContent);
        selectedUserPlayerCardsId.push(cardTypeNr);
    });
}

//// ACTIONS -> see events!!!
//PLAY-ACTIONS METHODS
async function defuseExplodingKitten(){
    //DEFUSE A EXPLODING KITTEN - ONLY SEND CARD ENUM
    gameModel = await playAction(selectedUserPlayerCardsId)
    setGameState(`${user.name} DEFUSED THA BOMB`)
}
async function playSkipCard(){
    //SKIP CARD - ONLY SEND CARD ENUM
    gameModel = await playAction(selectedUserPlayerCardsId)
    setGameState(`${user.name} IS A PUSSY, SKIPPING A CARD DRAW`)
}
async function playAttackCard(){
    //ENDS TURN - NEW PLAYER 2 CARDS
    let targetPlayer = 0 // NEEDS TO BE SET???
    gameModel = await playAction(selectedUserPlayerCardsId, targetPlayer )
    setGameState(`${user.name} ATTACKS`)
}
async function playFavorCard(){
    //playerID SELECT ELEMENT WITH PLAYER ID
    /*while(PLAYER ID == null){
        userDeskMessageBoard.textContent = "Kies een speler"
        setGameState(`${user.name} NEEDS TO ASK A FAVOR CARD - WHO WILL BE CHOOSEN?`)
    }
    setGameState(`${user.name} ASKS A FAVOR OF ....`)
    //gameModel = await playAction(selectedUserPlayerCardsId, PLAYER ID)*/
}

//playShuffleCard()
//playSeeTheFutureCard()
//...

//INCOMMING-ACTION METHODS
//giveFavorCard()
//NOPE A NOPING CARD()
//...

//DRAW CARD
async function drawCardFromPile(){
    /*gameModel = await drawAction();
    //WANNNEER WEET JE DAT JE EEN EXPLODING KITTEN HEBT GETROKKEN ?
    if(explodingkitten){
        userHandCardContainer.forEach( cardElement => {
            if ((parseInt(cardElement.querySelector(".card-enum").textContent) === 1)){
                defuseExplodingKitten();
                setGameState(`${user.name} ENDED PLAY ROUND`)
                //END PLAYER ROUND
                return;
            }
        });
        setGameState(`${user.name} EXPLODED IN 100 BLOODY MEATY PIECES`)
    }*/
}

///HELPERS
function setGameState(newText){
    //HOW TO FEDERATE TO OTHER USER? WITH GAMEMODEL? WITCH GAMEMODEL PARAMETER?
    gameState.textContent = gameState.textContent.replace(
        gameState.textContent,
        newText);
}

///// EVENTS
nopeButton.addEventListener("click", async() => {
    gameModel = await nopeAction();
    userDeskMessageBoard.textContent = "Nope gespeeld";
    setGameState(`${user.name} heeft genoped!`)
    nopePrompt.style.display ="none";
});
passButton.addEventListener("click", async() => {
    gameModel = await confirmNotNoppingPlay();
    userDeskMessageBoard.textContent = "Pass gespeeld";
    setGameState(`${user.name} doet niet mee aan de nope vraag`)
    nopePrompt.style.display ="none";
});

playButton.addEventListener("click", async () => {
    buildSelectedCards()
    if(selectedUserPlayerCardsId.length !== 0){
        switch(selectedUserPlayerCardsId[0]){
            case CardType.Defuse:
                await defuseExplodingKitten();
                break;
            case CardType.Skip:
                await playSkipCard();
                break
            case CardType.Attack:
                await playAttackCard();
                break
            case CardType.Favor:
                await playFavorCard();
                break
            case CardType.Shuffle:
                await playShuffleCard();
                break
            case CardType.SeeTheFuture:
                await playSeeTheFutureCard();
                break
            default:
                //kattenpaar, meer dan 1 kaart
                await playAction(selectedUserPlayerCardsId);
                break;
        }
    } else {
        drawCardFromPile();
    }

    //selectedCardDivs.forEach(card => card.classList.remove("selected"));
});

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
        //const params = new URLSearchParams(filterData)
        //console.log(filterData)
        const response = await fetch(`https://localhost:5051/api/Games/${filterData}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer " + Token.load()
            }
        })
        /*
        //TEST DATA
        //const params = new URLSearchParams(filterData)
        const response = await fetch(`http://localhost:3000/api/games/${filterData}`, {
            method: "GET",
            headers: {
                'Content-type' : 'Application/json',
            }
        })
        //END TEST DATA
        */
        const dataGames = await response.json();
        if(!response.ok){
            const problemDetails = new ProblemDetails(dataGames)
            console.log("TROUBLES"+ problemDetails);
            throw new Error(dataGames.message );
        }
        return new GameModel(
            dataGames.id,
            dataGames.players,
            dataGames.discardPile,
            dataGames.drawPileCount,
            dataGames.playerToPlayId,
            dataGames.pendingDraws,
            dataGames.pendingAction,
            dataGames.hasEnded
        );

    }catch(error){
        backendError.textContent = error.message
    }
}

async function nopeAction(){
    try{
        const response = await fetch(`https://localhost:5051/api/Games/${gameModel.id}/nope`, {
            method: "POST",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer " + Token.load()
            }
        });

        const nopePlay = await response.json();
        if(!response.ok){
            throw new Error(nopePlay.message );
        }
        return new GameModel(
            nopePlay.id,
            nopePlay.players,
            nopePlay.discardPile,
            nopePlay.drawPileCount,
            nopePlay.playerToPlayId,
            nopePlay.pendingDraws,
            nopePlay.pendingAction,
            nopePlay.hasEnded
        )
    }catch(error){
        backendError.textContent = error.message
    }
}

async function confirmNotNoppingPlay(){
    try{
        const response = await fetch(`https://localhost:5051/api/Games/${gameModel.id}/confirm-not-nopin`, {
            method: "POST",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer " + Token.load()
            }
        });

        const confirmNotNopping = await response.json();
        if(!response.ok){
            throw new Error(confirmNotNopping.message);
        }
        return new GameModel(
            confirmNotNopping.id,
            confirmNotNopping.players,
            confirmNotNopping.discardPile,
            confirmNotNopping.drawPileCount,
            confirmNotNopping.playerToPlayId,
            confirmNotNopping.pendingDraws,
            confirmNotNopping.pendingAction,
            confirmNotNopping.hasEnded
        )
    }catch(error){
        backendError.textContent = error.message
    }
}

async function playAction(selectedCards, targetPlayer = null, targetCard = null, drawPileIndex = 0){
    try{
        const body = {
            cards: selectedCards,
            targetPlayerId: targetPlayer,
            targetCard: targetCard,
            drawPileIndex: drawPileIndex
        };

        const response = await fetch(`https://localhost:5051/api/Games/${gameModel.id}/play-action`, {
            method: "POST",
            headers: {
                'Content-type': 'Application/json',
                "Authorization": "Bearer " + Token.load()
            },
            body: JSON.stringify(body)
        });

        const playActionData = await response.json();
        if(!response.ok){
            throw new Error(data.message);
        }

        return new GameModel(
            playActionData.id,
            playActionData.players,
            playActionData.discardPile,
            playActionData.drawPileCount,
            playActionData.playerToPlayId,
            playActionData.pendingDraws,
            playActionData.pendingAction,
            playActionData.hasEnded
        );

    }catch(error){
        backendError.textContent = error.message;
    }
}

async function drawAction(){
    try{
        const response = await fetch(`https://localhost:5051/api/Games/${gameModel.id}/draw-card`, {
            method: "POST",
            headers: {
                'Content-type' : 'Application/json',
                "Authorization": "Bearer " + Token.load()
            }
        });

        const drawPlay = await response.json();
        if(!response.ok){
            throw new Error(drawPlay.message );
        }
        return new GameModel(
            drawPlay.id,
            drawPlay.players,
            drawPlay.discardPile,
            drawPlay.drawPileCount,
            drawPlay.playerToPlayId,
            drawPlay.pendingDraws,
            drawPlay.pendingAction,
            drawPlay.hasEnded
        )
    }catch(error){
        backendError.textContent = error.message
    }
}

async function selectCardAsFavor(cardId){
    try{
        const body = {
            card: cardId,
        };

        const response = await fetch(`https://localhost:5051/api/Games/${gameModel.id}/select-card-to-give-as-favor`, {
            method: "POST",
            headers: {
                'Content-type': 'Application/json',
                "Authorization": "Bearer " + Token.load()
            },
            body: JSON.stringify(body)
        });

        const playSelectFavorData = await response.json();
        if(!response.ok){
            throw new Error(playSelectFavorData.message);
        }

        return new GameModel(
            playSelectFavorData.id,
            playSelectFavorData.players,
            playSelectFavorData.discardPile,
            playSelectFavorData.drawPileCount,
            playSelectFavorData.playerToPlayId,
            playSelectFavorData.pendingDraws,
            playSelectFavorData.pendingAction,
            playSelectFavorData.hasEnded
        );

    }catch(error){
        backendError.textContent = error.message;
    }
}
