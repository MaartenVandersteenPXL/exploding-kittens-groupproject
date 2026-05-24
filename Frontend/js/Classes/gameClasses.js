import { CardType, CardImage } from '../Enums/cardEnums.js';

//Game Model
export class Card {
    constructor(typeNr){
        this.typeNr = typeNr;
    }
    getName(){
        return Object.keys(CardType).find(key => CardType[key] == this.typeNr);
    }
    getImage(){
        return CardImage[this.typeNr];
    }
}

class FutureCard{
    constructor(typeNr){
        this.futureCard = new Card(typeNr);
    }
}

class CardsInHand{
    constructor(typeNr){
        this.card = new Card(typeNr);
    }
}

export class Player{
    constructor(id, name, birthDate, hasExplodingKitten, eliminated, futureCards, cardsInHandCount, cardsInHand){
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.hasExplodingKitten = hasExplodingKitten;
        this.eliminated = eliminated;
        this.futureCards = futureCards.map(f => new FutureCard(f));
        this.cardsInHandCount = cardsInHandCount;
        this.cardsInHand = cardsInHand.map(f => new CardsInHand(f));
    }
}

class DiscardPile{
    constructor (typeNr){
        this.discardPile = new Card(typeNr)
    }
}

class PendingAction{
    constructor(playerId, cards, canBeNoped, targetPlayerId, targetCard, drawPileIndex, playerNopeDecisions, isExecuted){
        this.playerId = playerId;
        this.cards = cards.map(f => new CardsInHand(f));
        this.canBeNoped = canBeNoped;
        this.targetPlayerId = targetPlayerId;
        this.targetCard = targetCard?.map(f => new Card(f));
        this.drawPileIndex = drawPileIndex;
        this.playerNopeDecisions = playerNopeDecisions;
        this.isExecuted = isExecuted;
    }
}

export class GameModel {
    constructor(id, players, discardPile, drawPileCount, playerToPlayId, pendingDraws, pendingAction, hasEnded){
        this.id = id;
        this.players = players.map(p => new Player(p.id, p.name, p.birthDate, p.hasExplodingKitten, p.eliminated, p.futureCards, p.cardsInHandCount, p.cardsInHand));
        this.discardPile = discardPile.map(d => new DiscardPile(d));
        this.drawPileCount = drawPileCount;
        this.playerToPlayId = playerToPlayId;
        this.pendingDraws = pendingDraws;
        this.pendingAction = pendingAction
        this.hasEnded = hasEnded;
    }
}

