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
        this.id = id,
        this.name = name,
        this.birthDate = birthDate
    }
}

class Preference {
    constructor(numberOfPlayers, numerOfAiPlayers){
        this.numberOfPlayers = numberOfPlayers,
        this.numerOfAiPlayers = numerOfAiPlayers
    }
}

export class Table {
    constructor(id, preference, seatedPlayers, hasAvailableSeats, gameId){
        this.id = id;
        this.preference = new Preference(preference.numberOfPlayers, preference.numerOfAiPlayers),
        this.seatedPlayers = seatedPlayers.map(p => new SeatedPlayer(p.id, p.name, p.birthDate))
        this.hasAvailableSeats = hasAvailableSeats;
        this.gameId = gameId;
    }
}

export class Tables {
    constructor(dataTables){
        this.tables = dataTables.map(t => new Table(t.id, t.preference, t.seatedPlayers, t.hasAvailableSeats, t.gameId))
    }
}