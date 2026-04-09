// elementen ophalen
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("userLogin");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const backendError = document.getElementById("backendError");

// errors resetten
function clearErrors() {
    emailError.textContent = "";
    passwordError.textContent = "";
    backendError.textContent = "";
}

// Email uit Register halen
const urlParams = new URLSearchParams(window.location.search);
const emailFromUrl = urlParams.get("email");

if (emailFromUrl) {
    emailInput.value = emailFromUrl;
}

// Code na druk op inloggen
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;

    // validatie
    if (!email) {
        emailError.textContent = "Email is verplicht";
        hasError = true;
    } else if (!email.includes("@")) {
        emailError.textContent = "Email is niet geldig";
        hasError = true;
    }

    if (!password) {
        passwordError.textContent = "Wachtwoord is verplicht";
        hasError = true;
    }

    if (hasError) return;

    // data voor backend
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch("https://localhost:5051/api/Authentication/token", {
            method: "POST",
            body: JSON.stringify(loginData),
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "lobby.html";
        } else {
            const backendErrorNumbers = {
                400: "Ongeldige aanvraag. Controleer uw gegevens.",
                401: "Ongeldige gebruikersnaam of wachtwoord.",
                403: "U heeft geen toegang.",
                404: "Pagina bestaat niet.",
                405: "Aanvraag niet ondersteund.",
                409: "Conflict, probeer opnieuw.",
                415: "Verkeerd formaat.",
                422: "Ongeldige gegevens.",
                500: "Serverfout. Probeer later opnieuw.",
                503: "Service tijdelijk niet beschikbaar."
            };

            backendError.textContent = backendErrorNumbers[response.status] || "Login mislukt";
        }

    } catch (error) {
        backendError.textContent = "Kan geen verbinding maken met de server. Probeer later opnieuw.";
    }})
                