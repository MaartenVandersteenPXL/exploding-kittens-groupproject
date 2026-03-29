// id in variabelen steken

const registrationForm = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const birthDateInput = document.getElementById("birthDate");

// hier ga ik de erros ook in een var steken zodat javascript da kan invullen moest er een fout zijn.

const emailError = document.getElementById("emailError");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const birthDateError = document.getElementById("birthDateError");
const backendError = document.getElementById("backendError");

// functie om als er een error is moet die eerst weg voor je opniuw kan invullen.

function clearError() {
    emailError.textContent = "";
    usernameError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    birthDateError.textContent = "";
    backendError.textContent = "";
}

// Hier wordt code uitgevoerd zodra je op registeer drukt.

registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const birthDate = birthDateInput.value;

    // controle var
    let hasError = false;

    if(!email){
        emailError.textContent = "Email is verplicht";
        hasError = true;
    }
    if(!username){
        usernameError.textContent = "Gebruikersnaam is verplicht";
        hasError = true;
    }
    if(!password){
        passwordError.textContent = "Wachtwoord is verplicht";
        hasError = true;
    }else if (password.length < 6){
        passwordError.textContent = "Wachtwoord moet minstens 6 characters zijn";
        hasError = true;
    }

    if(!confirmPassword){
        confirmPasswordError.textContent = "bevestig je wachtwoord";
        hasError = true;
    }else if (password !== confirmPassword){
        confirmPasswordError.textContent = "Wachtwoorden komen niet overeen";
        hasError = true;
    }

    if(!birthDate){
        birthDateError.textContent = "Geboortedatum is verplicht";
        hasError = true;
    }else {
        const selectedDate = new Date(birthDate);
        const today = new Date();

        selectedDate.setHours(0);
        today.setHours(0);

        if (selectedDate > today){
            birthDateError.textContent = "Geboortedatum mag niet in de toekomst zijn";
            hasError = true;
        }
    }
if (hasError){
    return;
}

console.log("Formulier is geldig");

});


