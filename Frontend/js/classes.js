//User
export class User {
    constructor(id, email, userName, birthdate){
        this.id = id;
        this.email = email;
        this.userName = userName;
        this.birthdate = birthdate;
    }

    save(){
        sessionStorage.setItem("user", JSON.stringify(this));
    }

    static load(){
        return JSON.parse(sessionStorage.getItem("user"));
    }

    delete(){
        sessionStorage.removeItem("user");
    }
}

//Token
export class Token {
    constructor (token){
        this.token = token;
    }

    save(){
        sessionStorage.setItem("token", this);
    }

    static load(){
        return sessionStorage.getItem("token");
    }

    delete(){
        sessionStorage.removeItem("token");
    }
}

//Table
class SeatedPlayer {
    constructor(id, name, birthDate){
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
    }
}

class Preferences {
    constructor(numberOfPlayers, numberOfArtificialPlayers){
        this.numberOfPlayers = numberOfPlayers;
        this.numberOfArtificialPlayers = numberOfArtificialPlayers;
    }
}

export class Table {
    constructor(id, preferences, seatedPlayers, hasAvailableSeat, gameId){
        this.id = id;
        this.preferences = new Preferences(preferences.numberOfPlayers, preferences.numberOfArtificialPlayers);
        this.seatedPlayers = seatedPlayers.map(p => new SeatedPlayer(p.id, p.name, p.birthDate));
        this.hasAvailableSeat = hasAvailableSeat;
        this.gameId = gameId;
    }
}

export class Tables {
    constructor(dataTables){
        this.tables = dataTables.map(t => new Table(t.id, t.preferences, t.seatedPlayers, t.hasAvailableSeat, t.gameId));
    }
}

//ProblemDetails
export class ProblemDetails{
    constructor(type, title,status,detail,instanse){
        this.type = type,
        this.title = title,
        this.status = status,
        this.detail = detail,
        this.instanse = instanse
    }
}


//Game Model
class futureCard{
    constructor(item){
        this.item = item;
    }
}

class cardsInHand{
    constructor(item){
        this.item = item;
    }
}

class Player{
    constructor(id, name, birthDate, hasExplodingKitten, eliminated, futureCards, cardsInHandCount, cardsInHand){
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.hasExplodingKitten = hasExplodingKitten;
        this.eliminated = eliminated;
        this.futureCards = futureCards.map(f => new futureCard(f.item));
        this.cardsInHandCount = cardsInHandCount;
        this.cardsInHand = cardsInHand.map(f => new cardInHand(f.item));
    }
}

class DiscardPile{
    constructor (item){
        this.item = item
    }
}

export class GameModel {
    constructor(id, players, discardPile, drawPileCount, playerToPlayId, pendingDraws, pendingAction, hasEnded){
        this.id = id;
        this.players = players.map(p => new Player(p.id, p.name, p.birthDate, p.hasExplodingKitten, p.eliminated, p.futureCards, p.cardsInHandCount, p.cardsInHand));
        this.discardPile = discardPile.map(d => new discardPile(d.item));
        this.drawPileCount = this.drawPileCount;
        this.playerToPlayId = playerToPlayId;
        this.pendingDraws = pendingDraws;
        this.pendingAction = pendingAction;
        this.hasEnded = hasEnded;
    }
}