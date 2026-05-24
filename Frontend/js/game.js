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
let cardsToPlay = [];
let autoPassInProgress = false;
let isChoosingDefuseIndex = false;
let isChosingFavorPlayer = false;
let isGivingFavorCard = false;
let isChoosingCatTarget = false;

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
//table
const discardPile = document.getElementById("discardPile");
//game
const playButton = document.getElementById("playActionBtn");
const drawButton = document.getElementById("drawActionBtn");
const nopePrompt = document.getElementById("nopePrompt");
const nopeButton = document.getElementById("nopeBtn");
const passButton = document.getElementById("passBtn");
const gameState = document.getElementById("gameState");
const futureCardsPanel = document.getElementById("futureCardsPanel");
const futureCardsList = document.getElementById("futureCardsList");
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

        const previousGameModel = gameModel;
        const newGameModel = await fetchGame(gameIdfromURL);

        gameModel = newGameModel;
        userAsPlayer = gameModel.players.find(p => p.id === user.id);

        clearGameStateWhenTurnChanged(previousGameModel, gameModel);
        updateGameStateFromPlayedCard(previousGameModel, gameModel);
        updateGameStateFromNopeChanges(previousGameModel, gameModel);
        BuildGameTable();
    }
}

function BuildGameTable(){
    buildMyCards();
    buildOpponents();
    buildTableInfo();

    if(handleGameEndedOrEliminated()){
        return;
    }

    buildFutureCards();
    buildFavorAction();
    buildTurnControls();
    buildNopePrompt();
}
function buildMyCards(){
    userHandCardContainer.replaceChildren();
    userAsPlayer.cardsInHand.forEach((element, index) => {
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
        cardContainer.dataset.index = index;
        if(selectedUserPlayerCardsId.includes(index)){
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
    if(isChosingFavorPlayer){
        return;
    }
    if(isGivingFavorCard){
        return;
    }
    if(isChoosingCatTarget){
        return;
    }
    const myCards = document.querySelectorAll(".own-card");
    const isMyTurn = gameModel.playerToPlayId === user.id;

    if (isMyTurn) {

        if(selectedUserPlayerCardsId.length === 0){
            userDeskMessageBoard.textContent = getTurnText();
            playButton.disabled = false;
            playButton.classList.remove("disabled");
        } else {
            cardsToPlay = selectedUserPlayerCardsId.map(index => userAsPlayer.cardsInHand[index].card.typeNr);
            const allSame = cardsToPlay.every(c => c === cardsToPlay[0]);
            const allCats = cardsToPlay.every(c => c > 99);

            const isValid = (cardsToPlay.length === 1 && !allCats) || (cardsToPlay.length === 2 && allSame && allCats) || (cardsToPlay.length === 3 &&allCats && !allSame)
            if(isValid){
                const cardName = Object.keys(CardType).find(key => CardType[key] === cardsToPlay[0]);
                userDeskMessageBoard.textContent = cardsToPlay.length === 1? `${cardName} gekozen` : `${cardsToPlay.length} katkaarten gekozen`
                playButton.disabled = false;
                playButton.classList.remove("disabled");
            } else {
                userDeskMessageBoard.textContent = "foute combinatie, deselecteer een kaart";
                playButton.disabled = true;
                playButton.classList.add("disabled");
            }
        }


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

function buildFavorAction() {
    const hasPendingFavor = gameModel.pendingAction?.cards?.includes(CardType.Favor);
    const favorTargetIsMe = gameModel.pendingAction?.targetPlayerId?.toLowerCase() === user.id.toLowerCase();
    const isExecuted = gameModel.pendingAction?.isExecuted;


    if(hasPendingFavor && favorTargetIsMe && !isGivingFavorCard && !isExecuted){
        showGiveFavorCardQuestion();
    } else if(!hasPendingFavor || isExecuted){
        isGivingFavorCard = false;
    }
}

//// ACTIONS -> see events!!!
//PLAY-ACTIONS METHODS
async function defuseExplodingKitten(){
    showDefuseIndexQuestion();
}
async function playSkipCard(){
    //SKIP CARD - ONLY SEND CARD ENUM
    gameModel = await playAction(cardsToPlay)
    setGameState(`${userAsPlayer.name} IS A PUSSY, SKIPPING A CARD DRAW`)
    selectedUserPlayerCardsId = [];
    BuildGameTable();
}
async function playAttackCard(){
    gameModel = await playAction(cardsToPlay);
    selectedUserPlayerCardsId = [];
    setGameState(`${userAsPlayer.name} speelt Attack`);
    BuildGameTable();
}
async function playFavorCard(){
    isChosingFavorPlayer = true;
    userDeskMessageBoard.replaceChildren();

    const text = document.createElement("span");
    text.textContent = `welke speler kies je om een kaart van te krijgen?`;

    const select = document.createElement("select");

    gameModel.players.forEach(player => {
        if(player.id !== user.id) {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            select.appendChild(option);
        }
    });

    const button = document.createElement("button");
    button.textContent = 'kies speler';

    button.addEventListener("click", async () => {
        const targetPlayerId = select.value;
        gameModel = await playAction(cardsToPlay, targetPlayerId);
        isChosingFavorPlayer = false;
        selectedUserPlayerCardsId = [];
        setGameState(`${userAsPlayer.name} vraagt favor aan ${select.options[select.selectedIndex].text}`);
        BuildGameTable();
    });

    userDeskMessageBoard.appendChild(text);
    userDeskMessageBoard.appendChild(select);
    userDeskMessageBoard.appendChild(button);

}
async function playShuffleCard(){
    gameModel = await playAction(cardsToPlay);
    selectedUserPlayerCardsId = [];
    setGameState(`${userAsPlayer.name} speelt Shuffle`);
    BuildGameTable();
}
async function playSeeTheFutureCard(){
    gameModel = await playAction(cardsToPlay);
    selectedUserPlayerCardsId = [];
    setGameState(`${userAsPlayer.name} speelt See The Future`);
    BuildGameTable();
}

async function playCatPair() {
    isChoosingCatTarget = true;
    userDeskMessageBoard.replaceChildren();

    const text = document.createElement("span");
    text.textContent = `welke speler kies je om een kaart van te krijgen?`;

    const select = document.createElement("select");

    gameModel.players.forEach(player => {
        if(player.id !== user.id) {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            select.appendChild(option);
        }
    });

    const button = document.createElement("button");
    button.textContent = 'kies speler';

    button.addEventListener("click", async () => {
        const targetPlayerId = select.value;
        gameModel = await playAction(cardsToPlay, targetPlayerId);
        isChoosingCatTarget = false;
        selectedUserPlayerCardsId = [];
        setGameState(`${userAsPlayer.name} steelt een willekeurige kaart`);
        BuildGameTable();
    });

    userDeskMessageBoard.appendChild(text);
    userDeskMessageBoard.appendChild(select);
    userDeskMessageBoard.appendChild(button);
}
async function playCatTriple() {
    isChoosingCatTarget = true;
    userDeskMessageBoard.replaceChildren();

    const text = document.createElement("span");
    text.textContent = "welke speler kies je?";

    const selectPlayer = document.createElement("select");
    gameModel.players.forEach(player => {
        if(player.id !== user.id) {
            const option = document.createElement("option");
            option.value = player.id;
            option.textContent = player.name;
            selectPlayer.appendChild(option);
        }
    });

    const textCard = document.createElement("span");
    textCard.textContent = "welke kaart wil je stelen";

    const selectCard = document.createElement("select");
    Object.entries(CardType).forEach(([name, value]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = name;
        selectCard.appendChild(option);
    });

    const button = document.createElement("button");
    button.textContent = "steel kaart";

    button.addEventListener("click", async () => {
        const targetPlayerId = selectPlayer.value;
        const targetCard = parseInt(selectCard.value);
        const handSizeBefore = userAsPlayer.cardsInHand.length;
        gameModel = await playAction(cardsToPlay, targetPlayerId, targetCard);
        userAsPlayer = gameModel.players.find(p => p.id === user.id);
        const handSizeAfter = userAsPlayer.cardsInHand.length;

        if(handSizeAfter>handSizeBefore){
            setGameState(`${userAsPlayer.name} steelt een specifieke kaart`);
        } else { setGameState(`${userAsPlayer.name}, gekozen kaart niet aanwezig in hand van tegenspeler`);}
        isChoosingCatTarget = false;
        selectedUserPlayerCardsId = [];
        cardsToPlay = [];
        BuildGameTable();
    })

    userDeskMessageBoard.appendChild(text);
    userDeskMessageBoard.appendChild(selectPlayer);
    userDeskMessageBoard.appendChild(textCard);
    userDeskMessageBoard.appendChild(selectCard);
    userDeskMessageBoard.appendChild(button);
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
        const defuseIndex = userAsPlayer.cardsInHand.findIndex(c => c.card.typeNr === CardType.Defuse);
        selectedUserPlayerCardsId = [defuseIndex];
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
    return selectedUserPlayerCardsId.every(index => index < userAsPlayer.cardsInHand.length);}

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
function showGiveFavorCardQuestion(){
    isGivingFavorCard = true;
    userDeskMessageBoard.replaceChildren();

    const text = document.createElement("span");
    text.textContent = "kies een kaart om te geven:";

    const select = document.createElement("select");
    userAsPlayer.cardsInHand.forEach((element, index) => {
        const option = document.createElement("option");
        option.value = element.card.typeNr;
        option.textContent = element.card.getName();
        select.appendChild(option);
    });

    const button = document.createElement("button");
    button.textContent = "geef kaart";

    button.addEventListener("click", async () => {
        const cardTypeNr = parseInt(select.value);
        gameModel = await selectCardAsFavor(cardTypeNr);
        userAsPlayer = gameModel.players.find(p => p.id === user.id);
        isGivingFavorCard = false;
        setGameState(`${userAsPlayer.name} gaf een kaart als favor`);
        BuildGameTable();
    });

    userDeskMessageBoard.appendChild(text);
    userDeskMessageBoard.appendChild(select);
    userDeskMessageBoard.appendChild(button)
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
    cardsToPlay = selectedUserPlayerCardsId.map(index => userAsPlayer.cardsInHand[index].card.typeNr)

    if(selectedUserPlayerCardsId.length !== 0 && !selectedCardsAreStillInHand()){
        selectedUserPlayerCardsId = [];
        backendError.textContent = "Deze kaart zit niet meer in je hand.";
        BuildGameTable();
        return;
    }

    if(selectedUserPlayerCardsId.length !== 0){
        switch(cardsToPlay[0]){
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
                if(selectedUserPlayerCardsId.length === 2) {
                    await playCatPair(cardsToPlay);
                } else if(selectedUserPlayerCardsId.length === 3) {
                    await playCatTriple(cardsToPlay);
                } else {
                    // ongeldige combinatie
                    backendError.textContent = "ongeldige kaart combinatie";
                }
                break;
        }
    } else {
        await drawCardFromPile();
    }

    buildDiscardPile(selectedUserPlayerCardsId);
});drawButton.addEventListener("click", async () => {
    drawCardFromPile();
})
userHandCardContainer.addEventListener('click', (event) => {
    const selectedCardDiv = event.target.closest('.own-card');
    if(selectedCardDiv === null){return}
    if(!selectedCardDiv.classList.contains("clickable")){return}
    //let selectedCardId = selectedCardDiv.querySelector(".card-enum").textContent;
    let selectedCardIndex = parseInt(selectedCardDiv.dataset.index);
    let selectedCardName = selectedCardDiv.querySelector(".card-name").textContent;

    if(selectedUserPlayerCardsId.includes(selectedCardIndex)) {
        selectedUserPlayerCardsId = selectedUserPlayerCardsId.filter(c => c !== selectedCardIndex);
        selectedCardDiv.classList.remove("highlight_me")
    } else {
        selectedUserPlayerCardsId.push(selectedCardIndex);
        selectedCardDiv.classList.add("highlight_me");
        userDeskMessageBoard.textContent = (`${selectedCardName} gekozen`)
    }

    /*if(selectedUserPlayerCardsId.includes(parseInt(selectedCardId))){
        selectedUserPlayerCardsId = selectedUserPlayerCardsId.filter(
            card => card !== parseInt(selectedCardId)
        );
        selectedCardDiv.classList.remove("highlight_me");

    }else{
        selectedUserPlayerCardsId.push(parseInt(selectedCardId));
        selectedCardDiv.classList.add("highlight_me");
        userDeskMessageBoard.textContent = (`${selectedCardName} gekozen`)
    }*/

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

        const response = await fetch(`https://localhost:5051/api/Games/${gameModel.id}/select-card-to-give-as-a-favor`, {
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
