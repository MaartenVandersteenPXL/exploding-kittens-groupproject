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


