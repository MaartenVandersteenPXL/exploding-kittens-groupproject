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