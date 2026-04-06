document.addEventListener("DOMContentLoaded", () => {

    function toonSectie(sectie) {
        document.querySelectorAll("main > section").forEach(s => s.style.display = "none");
        document.querySelector(sectie).style.display = "block";
    }

    toonSectie(".newTable");

    document.getElementById("createNewTableButton").addEventListener("click", (event) => {
        event.preventDefault();
        toonSectie(".lobbyBrowser");
    });

    document.querySelector(".go-to-table").addEventListener("click", () => {
        toonSectie(".lobbyTable");
    });

    document.querySelector(".leave-table").addEventListener("click", () => {
        toonSectie(".newTable");
    });

});