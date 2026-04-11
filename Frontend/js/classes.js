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