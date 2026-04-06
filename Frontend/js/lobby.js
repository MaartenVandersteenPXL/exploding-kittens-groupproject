document.addEventListener("DOMContentLoaded", () => {
    //elementen ophalen
    const newTable = document.querySelector(".newTable");
    const lobbyBrowser = document.querySelector(".lobbyBrowser");
    const lobbyTable = document.querySelector(".lobbyTable");
    const createNewTableButton = document.getElementById("createNewTableButton");
    const goToTableButton = document.querySelector(".go-to-table");
    const leaveTableButton = document.querySelector(".leave-table");

    //Secties wisselen
    function toonSectie(sectie) {
        [newTable, lobbyBrowser, lobbyTable].forEach(s => s.style.display = "none");
        sectie.style.display = "block";
    }

    toonSectie(newTable);
    //Bepalen wat welke knop doet
    createNewTableButton.addEventListener("click", (event) => {
        event.preventDefault();
        toonSectie(lobbyBrowser);
    });

    goToTableButton.addEventListener("click", () => {
        toonSectie(lobbyTable);
    });

    leaveTableButton.addEventListener("click", () => {
        toonSectie(newTable);
    });

});