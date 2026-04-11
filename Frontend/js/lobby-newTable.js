// user is ingelogd check en user pakken
document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html";
    }

    const userString = sessionStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    const userNameElement = document.getElementById("userName");
    userNameElement.textContent = user.userName;
    // dit gaat zoviezo voor merge conflict zorgen:

    function toonSectie(sectie) {
        document.querySelectorAll(".newTable, .lobbyBrowser, .lobbyTable")
            .forEach(s => s.style.display = "none");

        sectie.style.display = "block";
    }

    const createNewTableButton = document.getElementById("createNewTableButton");

    createNewTableButton.addEventListener("click", async function (event) {
        event.preventDefault();

        const players = parseInt(document.getElementById("numberOfPlayers").value);
        const ai = parseInt(document.getElementById("numberOfAIPlayers").value);

        const playersError = document.getElementById("numberOfPlayersError");
        const aiError = document.getElementById("numberOfAIPlayersError");
        const backendError = document.getElementById("backendError");

        //reset
        playersError.textContent = "";
        aiError.textContent = "";
        backendError.textContent = "";

        let hasError = false;

        if (players < 2 || players > 5) {
            playersError.textContent = "Aantal spelers moet tussen 2 en 5 liggen";
            hasError = true;
        }

        if (ai < 0 || ai > 4) {
            aiError.textContent = "Aantal AI spelers moet tussen 0 en 4 liggen";
            hasError = true;
        }

        if (players + ai > 5) {
            aiError.textContent = "Totaal aantal spelers mag max 5 zijn";
            hasError = true;
        }

        if (hasError) return;

        try {
            let response = await fetch("https://localhost:5051/api/Tables",
                {
                    method: "POST",
                    body: JSON.stringify({
                        numberOfPlayers: players,
                        numberOfArtificialPlayers: ai
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem("token"),
                    }
                });

            if (response.ok) {
                const createdTable = await response.json();
                console.log("tafel gemaakt",createdTable);// voor mijn debug
                toonSectie(document.querySelector(".lobbyTable"));
            } else {
                let errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }

        } catch (error) {
            backendError.textContent = error.message;
        }
    });
});