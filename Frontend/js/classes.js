export class User {
    constructor(id, email, userName, birthdate){
        this.id = id;
        this.email = email;
        this.userName = userName;
        this.birthdate = birthdate
    }

    save(){
        sessionStorage.setItem("user", JSON.stringify(this))
    }

    static load(){
        return JSON.parse(sessionStorage.getItem("user"));
    }
}