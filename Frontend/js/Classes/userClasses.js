//User
export class User {
    constructor(id, email, userName, birthdate){
        this.id = id;
        this.email = email;
        this.userName = userName;
        this.birthdate = birthdate;
    }

    static save(){
        sessionStorage.setItem("user", JSON.stringify(this));
    }

    static load(){
        return JSON.parse(sessionStorage.getItem("user"));
    }

    static delete(){
        sessionStorage.removeItem("user");
    }
}

//Token
export class Token {
    constructor (token){
        this.token = token;
    }

    static save(){
        sessionStorage.setItem("token", this);
    }

    static load(){
        return sessionStorage.getItem("token");
    }

    static delete(){
        sessionStorage.removeItem("token");
    }
}