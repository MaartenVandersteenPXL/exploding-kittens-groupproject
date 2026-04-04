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
            const response = await fetch("https://localhost:5051/api/Authentication/login", {
                method: "POST",
                body: JSON.stringify(loginData),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (response.ok) {
                window.location.href = "lobby.html"; //Naar lobbypagina?
            } else {
                const errorData = await response.json();
                backendError.textContent = errorData.message || "Login mislukt";
            }

        } catch (error) {
                backendError.textContent = "Kan geen verbinding maken met de server. Probeer later opnieuw.";

        }
    });
