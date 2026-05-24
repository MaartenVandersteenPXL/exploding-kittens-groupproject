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
let autoPassInProgress = false;
let isChoosingDefuseIndex = false;
const NopeDecision = Object.freeze({
    NotDecided: 0,
    Nope: 1,
    NotNoping: 2
});
///// ELEMENTS
//header
const headerTitle = document.getElementById("headerTitle");
const headerIntro = document.getElementById("headerIntro");
//nav
const logout = document.getElementById("logout");
const leaveTableNav = document.getElementById("verlaatTafel");
//table
const discardPile = document.getElementById("discardPile");
//game
const playButton = document.getElementById("playActionBtn");
const drawButton = document.getElementById("drawActionBtn");
const nopePrompt = document.getElementById("nopePrompt");
const nopeButton = document.getElementById("nopeBtn");
const passButton = document.getElementById("passBtn");

const futureCardsPanel = document.getElementById("futureCardsPanel");
const futureCardsList = document.getElementById("futureCardsList");

//Gamestate
const gameState = document.getElementById("gameState");
let groupGameState = document.getElementById("groupGameState");
let playerCount = 0;

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
    playerCount = gameModel.players.length;
}
async function startGameLoop(){
    while(!gameModel.hasEnded){
        await new Promise(resolve => setTimeout(resolve, 3000));

        const previousGameModel = gameModel;
        const newGameModel = await fetchGame(gameIdfromURL);

        gameModel = newGameModel;
        userAsPlayer = gameModel.players.find(p => p.id === user.id);

        clearGameStateWhenTurnChanged(previousGameModel, gameModel);
        updateGameStateFromPlayedCard(previousGameModel, gameModel);
        updateGameStateFromNopeChanges(previousGameModel, gameModel);
        BuildGameTable();
        updateGroupGameState();
    }
}

function BuildGameTable(){
    buildMyCards();
    buildOpponents();
    buildTableInfo()

    if(handleGameEndedOrEliminated()){
        return;
    }

    buildFutureCards()
    buildTurnControls();
    buildNopePrompt();
}
function buildMyCards(){
    userHandCardContainer.replaceChildren();
    userAsPlayer.cardsInHand.forEach(element => {
        let cardContainer = document.createElement("div");
        let cardEnum = document.createElement("p");
        let cardName = document.createElement("p");

        cardContainer.classList.add(`own-card`, `${element.card.getName()}`);
        cardName.classList.add(`card-name`);
        cardEnum.classList.add(`card-enum`);

        //Background card
        cardContainer.style.backgroundImage= `url('${CardImage[element.card.typeNr]}')`;

        cardName.textContent = element.card.getName();
        cardEnum.textContent = element.card.typeNr;

        cardContainer.appendChild(cardName);
        cardContainer.appendChild(cardEnum);
        userHandCardContainer.appendChild(cardContainer);
        if(selectedUserPlayerCardsId.includes(element.card.typeNr)){
            cardContainer.classList.add("highlight_me");
        }
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
    }
    else {
    const lastCard = gameModel.discardPile[gameModel.discardPile.length - 1];
    lastDiscardedCard.textContent = "";
        console.log(lastCard.discardPile.typeNr, CardImage[lastCard.discardPile.typeNr]);
    lastDiscardedCard.style.backgroundImage = `url('${CardImage[lastCard.discardPile.typeNr]}')`;

    }
}
function buildNopePrompt(){
    const hasPendingAction = gameModel.pendingAction != null;

    if(!hasPendingAction){
        nopePrompt.style.display = "none";
        return;
    }

    const isMyAction = gameModel.pendingAction.playerId === user.id;
    const hasNopeCard = userAsPlayer.cardsInHand.some(c => c.card.typeNr === CardType.Nope);

    const nopeDecisions = gameModel.pendingAction.playerNopeDecisions ?? {};
    const myNopeDecision = Object.entries(nopeDecisions)
        .find(([playerId]) => playerId.toLowerCase() === user.id.toLowerCase())?.[1];

    const isMyDecisionPending =
        myNopeDecision === 0 ||
        myNopeDecision === "0" ||
        myNopeDecision === NopeDecision.NotDecided ||
        myNopeDecision === "NotDecided";

    const actionIsNoped = Object.values(nopeDecisions)
        .some(decision =>
            decision === 1 ||
            decision === "1" ||
            decision === NopeDecision.Nope ||
            decision === "Nope"
        );

    const canRespondToNope = !isMyAction || actionIsNoped;

    const shouldRespond =
        !gameModel.pendingAction.isExecuted &&
        isMyDecisionPending &&
        canRespondToNope;

    if(shouldRespond && !hasNopeCard){
        nopePrompt.style.display = "none";

        if(!autoPassInProgress){
            autoPassInProgress = true;

            confirmNotNoppingPlay()
                .then(updatedGame => {
                    if(updatedGame){
                        gameModel = updatedGame;
                        userAsPlayer = gameModel.players.find(p => p.id === user.id);
                        BuildGameTable();
                    }
                })
                .finally(() => {
                    autoPassInProgress = false;
                });
        }

        return;
    }

    const shouldShowNopePrompt = shouldRespond && hasNopeCard;

    if(shouldShowNopePrompt){
        nopePrompt.style.display = "block";
        nopeButton.disabled = false;

        const pendingCards = gameModel.pendingAction.cards
            .map(c => Object.keys(CardType).find(key => CardType[key] === c))
            .join(", ");

        userDeskMessageBoard.textContent = actionIsNoped
            ? `Er is een NOPE gespeeld op: ${pendingCards} - wil je terug NOPE spelen?`
            : `Een speler speelde: ${pendingCards} - wil je NOPE spelen?`;
    } else {
        nopePrompt.style.display = "none";
    }
}
function buildTurnControls(){
    //dynamische gebouwd - hier pas asignen
    if(isChoosingDefuseIndex){
        return;
    }
    const myCards = document.querySelectorAll(".own-card");
    const isMyTurn = gameModel.playerToPlayId === user.id;

    if (isMyTurn) {

        if(selectedUserPlayerCardsId.length === 0){
            userDeskMessageBoard.textContent = getTurnText();
        } else {
            const allSame = selectedUserPlayerCardsId.every(c => c === selectedUserPlayerCardsId[0]);
            if(selectedUserPlayerCardsId.length === 1 || (selectedUserPlayerCardsId.length >= 2 && allSame)){
                const cardName = Object.keys(CardType).find(key => CardType[key] === selectedUserPlayerCardsId[0]);
                userDeskMessageBoard.textContent = `${cardName} gekozen`;
            } else {
                userDeskMessageBoard.textContent = "foute combinatie";
            }
        }
        playButton.disabled = false;
        playButton.classList.remove("disabled");

        myCards.forEach(card => {
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
        userDeskMessageBoard.textContent = getTurnText()
        selectedUserPlayerCardsId = [];
        playButton.disabled = true;
        playButton.classList.add("disabled");
        myCards.forEach(card => {
            // Nog af te wachten waar de "clickable" / "selected" class selector naar toe gaat
            card.classList.remove("clickable");
            card.classList.remove("selected"); // also deselect if it was your turn before
            card.classList.remove("highlight_me")
        });
    }
}
function buildFutureCards(){
    futureCardsList.replaceChildren();

    if(!userAsPlayer.futureCards || userAsPlayer.futureCards.length === 0){
        futureCardsPanel.style.display = "none";
        return;
    }

    futureCardsPanel.style.display = "block";

    userAsPlayer.futureCards.forEach(element => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("future-card");

        const cardType = element.futureCard.typeNr;
        cardDiv.style.backgroundImage = `url('${CardImage[cardType]}')`;

        futureCardsList.appendChild(cardDiv);
    });
}

//// ACTIONS -> see events!!!
//PLAY-ACTIONS METHODS
async function defuseExplodingKitten(){
    showDefuseIndexQuestion();
}
async function playSkipCard(){
    //SKIP CARD - ONLY SEND CARD ENUM
    gameModel = await playAction(selectedUserPlayerCardsId)
    setGameState(`${userAsPlayer.name} IS A PUSSY, SKIPPING A CARD DRAW`)
    selectedUserPlayerCardsId = [];
    BuildGameTable();
}
async function playAttackCard(){
    gameModel = await playAction(selectedUserPlayerCardsId);
    selectedUserPlayerCardsId = [];
    setGameState(`${userAsPlayer.name} speelt Attack`);
    BuildGameTable();
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
async function playShuffleCard(){
    gameModel = await playAction(selectedUserPlayerCardsId);
    selectedUserPlayerCardsId = [];
    setGameState(`${userAsPlayer.name} speelt Shuffle`);
    BuildGameTable();
}
async function playSeeTheFutureCard(){
    gameModel = await playAction(selectedUserPlayerCardsId);
    selectedUserPlayerCardsId = [];
    setGameState(`${userAsPlayer.name} speelt See The Future`);
    BuildGameTable();
}

//INCOMMING-ACTION METHODS
//giveFavorCard()
//NOPE A NOPING CARD()
//...

//DRAW CARD
async function drawCardFromPile(){
    gameModel = await drawAction();
    userAsPlayer = gameModel.players.find(p => p.id === user.id);

    if(handleGameEndedOrEliminated()){
        BuildGameTable();
        return;
    }

    const hasExplodingKitten = userAsPlayer.cardsInHand.some(c => c.card.typeNr === CardType.ExplodingKitten);
    const hasDefuse = userAsPlayer.cardsInHand.some(c => c.card.typeNr === CardType.Defuse);

    if(hasExplodingKitten && hasDefuse){
        selectedUserPlayerCardsId = [CardType.Defuse];
        BuildGameTable();
        showDefuseIndexQuestion();
        return;
    }

    if(hasExplodingKitten && !hasDefuse){
        userDeskMessageBoard.textContent = "Je trok een Exploding Kitten en hebt geen Defuse.";
        BuildGameTable();
        return;
    }

    selectedUserPlayerCardsId = [];
    BuildGameTable();
}

///HELPERS
function setGameState(newText){
    //HOW TO FEDERATE TO OTHER USER? WITH GAMEMODEL? WITCH GAMEMODEL PARAMETER?
    gameState.textContent = gameState.textContent.replace(
        gameState.textContent,
        newText);
}
function updateGroupGameState(){
    if(gameModel.players.length === playerCount){
        groupGameState.textContent = "Een speler heeft de tafel verlaten";
    }
}
function showDefuseIndexQuestion(){
    isChoosingDefuseIndex = true;
    userDeskMessageBoard.replaceChildren();

    const text = document.createElement("span");
    text.textContent = `Waar wil je de Exploding Kitten terugleggen? Kies 0 tot ${gameModel.drawPileCount}. 0 = bovenaan. `;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = gameModel.drawPileCount;
    input.value = "0";

    const button = document.createElement("button");
    button.textContent = "Defuse";

    button.addEventListener("click", async () => {
        const drawPileIndex = parseInt(input.value);
        const maxIndex = gameModel.drawPileCount;

        if(isNaN(drawPileIndex) || drawPileIndex < 0 || drawPileIndex > maxIndex){
            backendError.textContent = `Kies een positie tussen 0 en ${maxIndex}.`;
            return;
        }

        gameModel = await playAction(
            [CardType.Defuse],
            null,
            CardType.ExplodingKitten,
            drawPileIndex
        );

        if(!gameModel){
            backendError.textContent = `Kies een positie tussen 0 en ${maxIndex}.`;
            return;
        }

        isChoosingDefuseIndex = false;
        selectedUserPlayerCardsId = [];
        setGameState(`${userAsPlayer.name} speelde Defuse`);
        BuildGameTable();
    });
    userDeskMessageBoard.appendChild(text);
    userDeskMessageBoard.appendChild(input);
    userDeskMessageBoard.appendChild(button);
}
function handleGameEndedOrEliminated(){
    if(gameModel.hasEnded){
        const winner = gameModel.players.find(p => !p.eliminated);

        playButton.disabled = true;
        drawButton.disabled = true;
        nopePrompt.style.display = "none";

        userDeskMessageBoard.textContent = winner
            ? `${winner.name} heeft gewonnen!`
            : "Het spel is afgelopen.";

        return true;
    }

    if(userAsPlayer?.eliminated){
        playButton.disabled = true;
        drawButton.disabled = true;
        nopePrompt.style.display = "none";
        userDeskMessageBoard.textContent = "Je bent ontploft en ligt uit het spel.";
        return true;
    }

    return false;
}
function buildDiscardPile(selectedUserPlayerCards){

    console.log("what is discardPile", gameModel.discardPile)
    let discaredPileLastEnum= gameModel.discardPile.at(-1);

    /*
    let cardDiscardPileContainer = document.createElement("div");
    let discardPileCardEnum = document.createElement("p");
    let discardPileCardName = document.createElement("p");

    cardDiscardPileContainer.classList.add(`own-card-discard`, `${discaredPileLastEnum}`);
    discardPileCardEnum.classList.add(`card-name-discard`);
    discardPileCardName.classList.add(`card-enum-discard`);

    //Background card
    cardDiscardPileContainer.style.backgroundImage= `url('${CardImage[discaredPileLastEnum]}')`;

    discardPileCardName.textContent = "NAAM NOG OP TE HALEN";
    discardPileCardEnum.textContent = discaredPileLastEnum.toString();

    discardPile.appendChild(discardPileCardName);
    discardPile.appendChild(discardPileCardEnum);
    */

}
function selectedCardsAreStillInHand(){
    const handCards = userAsPlayer.cardsInHand.map(c => c.card.typeNr);
    const selectedCards = [...selectedUserPlayerCardsId];

    for(const selectedCard of selectedCards){
        const handIndex = handCards.indexOf(selectedCard);

        if(handIndex === -1){
            return false;
        }

        handCards.splice(handIndex, 1);
    }

    return true;
}
function getTurnText(){
    const playerToPlay = gameModel.players.find(p => p.id === gameModel.playerToPlayId);

    if(!playerToPlay){
        return "";
    }

    const drawText = gameModel.pendingDraws === 1
        ? "1 kaart"
        : `${gameModel.pendingDraws} kaarten`;

    if(playerToPlay.id === user.id){
        return `Je moet nog ${drawText} nemen.`;
    }

    return `${playerToPlay.name} moet nog ${drawText} nemen.`;
}
function getPlayerNameById(playerId){
    if(playerId?.toLowerCase() === userAsPlayer?.id?.toLowerCase()){
        return "Je";
    }

    return gameModel.players.find(p => p.id === playerId)?.name ?? "Een speler";
}
function getCardName(cardType){
    return Object.keys(CardType).find(key => CardType[key] === cardType) ?? "kaart";
}
function updateGameStateFromPlayedCard(previousGame, newGame){
    if(!previousGame || !newGame){
        return;
    }

    if(newGame.discardPile.length <= previousGame.discardPile.length){
        return;
    }

    const playedCardObject = newGame.discardPile[newGame.discardPile.length - 1];
    const playedCardType = playedCardObject.discardPile?.typeNr ?? playedCardObject;
    const cardName = getCardName(playedCardType);

    const playerToPlay = newGame.players.find(p => p.id === previousGame.playerToPlayId);
    const playerName = playerToPlay?.id === userAsPlayer?.id
        ? "Je"
        : playerToPlay?.name ?? "Een speler";

    if(playedCardType === CardType.Defuse){
        setGameState(`${playerName} speelde Defuse`);
        return;
    }

    setGameState(`${playerName} speelde ${cardName}`);
}
function updateGameStateFromNopeChanges(previousGame, newGame){
    const oldDecisions = previousGame?.pendingAction?.playerNopeDecisions;
    const newDecisions = newGame?.pendingAction?.playerNopeDecisions;

    if(!oldDecisions || !newDecisions){
        return;
    }

    for(const [playerId, newDecision] of Object.entries(newDecisions)){
        const oldDecision = oldDecisions[playerId];

        if(oldDecision === newDecision){
            continue;
        }

        const playerName = getPlayerNameById(playerId);

        if(newDecision === 1 || newDecision === "1" || newDecision === "Nope"){
            setGameState(`${playerName} heeft genoped!`);
            return;
        }

        if(newDecision === 2 || newDecision === "2" || newDecision === "NotNoping"){
            setGameState(`${playerName} doet niet mee aan de nope vraag`);
            return;
        }
    }
}
function clearGameStateWhenTurnChanged(previousGame, newGame){
    if(!previousGame || !newGame){
        return;
    }

    if(previousGame.playerToPlayId !== newGame.playerToPlayId){
        setGameState("");
    }
}

///// EVENTS
nopeButton.addEventListener("click", async() => {
    gameModel = await nopeAction();
    userDeskMessageBoard.textContent = "Nope gespeeld";
    setGameState(`${userAsPlayer.name} heeft genoped!`)
    nopePrompt.style.display ="none";
    BuildGameTable();

});
passButton.addEventListener("click", async() => {
    gameModel = await confirmNotNoppingPlay();
    console.log("pendingAction na pass:", gameModel.pendingAction);
    userDeskMessageBoard.textContent = "Pass gespeeld";
    setGameState(`${userAsPlayer.name} doet niet mee aan de nope vraag`)
    nopePrompt.style.display = "none";
    BuildGameTable();
});
playButton.addEventListener("click", async () => {
    userAsPlayer = gameModel.players.find(p => p.id === user.id);
    console.log("Selected Array", selectedUserPlayerCardsId);

    if(selectedUserPlayerCardsId.length !== 0 && !selectedCardsAreStillInHand()){
        selectedUserPlayerCardsId = [];
        backendError.textContent = "Deze kaart zit niet meer in je hand.";
        BuildGameTable();
        return;
    }

    if(selectedUserPlayerCardsId.length !== 0){
        switch(selectedUserPlayerCardsId[0]){
            case CardType.Defuse:
                await defuseExplodingKitten();
                break;
            case CardType.Skip:
                await playSkipCard();
                break;
            case CardType.Attack:
                await playAttackCard();
                break;
            case CardType.Favor:
                await playFavorCard();
                break;
            case CardType.Shuffle:
                await playShuffleCard();
                break;
            case CardType.SeeTheFuture:
                await playSeeTheFutureCard();
                break;
            default:
                //kattenpaar, meer dan 1 kaart
                await playAction(selectedUserPlayerCardsId);
                selectedUserPlayerCardsId = [];
                BuildGameTable();
                break;
        }
    } else {
        await drawCardFromPile();
    }

    buildDiscardPile(selectedUserPlayerCardsId);
});drawButton.addEventListener("click", async () => {
    console.log("kaart trekken klik")
    drawCardFromPile();
})
userHandCardContainer.addEventListener('click', (event) => {
    console.log("state array begin", selectedUserPlayerCardsId);
    const selectedCardDiv = event.target.closest('.own-card');
    if(selectedCardDiv === null){return}
    if(!selectedCardDiv.classList.contains("clickable")){return}
    let selectedCardId = selectedCardDiv.querySelector(".card-enum").textContent;
    let selectedCardName = selectedCardDiv.querySelector(".card-name").textContent;

    if(selectedUserPlayerCardsId.includes(parseInt(selectedCardId))){
        selectedUserPlayerCardsId = selectedUserPlayerCardsId.filter(
            card => card !== parseInt(selectedCardId)
        );
        selectedCardDiv.classList.remove("highlight_me");

        console.log("card removed");
    }else{
        selectedUserPlayerCardsId.push(parseInt(selectedCardId));
        selectedCardDiv.classList.add("highlight_me");
        userDeskMessageBoard.textContent = (`${selectedCardName} gekozen`)
        console.log("card added");
    }
    console.log("state array end", selectedUserPlayerCardsId)

});


////ROUTES
//LogOut
logout.addEventListener("click", async (Event) => {
    Token.delete();
    User.delete();
})
leaveTableNav.addEventListener("click", async () => {
    await playerLeaveTable(userAsPlayer.id);
    window.location.href="lobby.html";
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
        const response = await fetch(`https://localhost:5051/api/Games/${gameModel.id}/confirm-not-noping`, {
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
            throw new Error(playActionData.message);
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
