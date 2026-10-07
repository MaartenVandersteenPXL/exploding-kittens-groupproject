# Exploding Kittens – Webversie

Digitale versie van het kaartspel **Exploding Kittens**, gebouwd als groepsproject in het eerste jaar
Toegepaste Informatica aan **Hogeschool PXL** (2025-2026).

Het project is volledig in team uitgewerkt: elk teamlid werkte zowel aan de backend als aan de frontend.

<!-- Tip: voeg hier een screenshot van het spel toe, bv. ![Spelbord](docs/screenshot.png) -->

## Functionaliteiten

- Registreren en inloggen met een beveiligd account (JWT-authenticatie)
- Lobby om een speltafel aan te maken of aan te sluiten bij een tafel met vrije plaatsen
- Spelen tegen andere spelers aan dezelfde tafel
- Volledige spelregels, met onder meer de kaarten Attack, Skip, Favor, Shuffle, See the Future, Nope en Defuse

## Technologieën

**Backend**
- C# / ASP.NET Core Web API (.NET 10)
- Entity Framework Core met SQL Server en ASP.NET Core Identity
- JWT-authenticatie
- Swagger voor API-documentatie
- Unit- en integratietests met NUnit en Moq
- Docker-ondersteuning

**Frontend**
- HTML, CSS en JavaScript (zonder framework)
- Communicatie met de backend via de REST API

**Werkwijze**
- Git en GitHub met feature branches, pull requests en issues
- Vaste afspraken voor branch- en commitnamen (zie onderaan)

## Architectuur

De backend is opgedeeld in lagen, zodat de spellogica los staat van de API en de opslag:

| Project | Rol |
|---|---|
| `ExplodingKittens.Core` | Spellogica: spelers, kaarten, acties, tafels en spelverloop |
| `ExplodingKittens.Infrastructure` | Opslag van gegevens (database en in-memory) |
| `ExplodingKittens.Api` | REST API met controllers voor authenticatie, tafels en spellen |
| `ExplodingKittens.Bootstrapper` | Configuratie en dependency injection |
| `*.Tests` | Automatische tests per laag |

## Project lokaal starten

**Vereisten:** Visual Studio of JetBrains Rider met de .NET 10 SDK en SQL Server LocalDB, en WebStorm voor de frontend.

1. Clone de repository:
   ```
   git clone https://github.com/MaartenVandersteenPXL/exploding-kittens-groupproject.git
   ```
2. **Backend:** open `Backend/ExplodingKittens.slnx` in Visual Studio of Rider en start het project
   `ExplodingKittens.Api`. De API draait op `https://localhost:5051`.
3. **Frontend:** open de map `Frontend` in WebStorm, open `index.html` en start de pagina via de
   ingebouwde lokale server (browsericoon rechtsboven in de editor).

## Werkafspraken

### Branches
Naamgeving: `<type>/<scope>-<subject>`, bv. `feat/0001-vue-setup`
([bron](https://gist.github.com/seunggabi/87f8c722d35cd07deb3f649d45a31082)).

- **type:** `feat` (nieuwe functionaliteit), `fix` (bugfix), `docs` (documentatie),
  `style` (opmaak, geen codewijziging), `refactor` (code herschrijven),
  `test` (tests toevoegen of aanpassen), `chore` (onderhoud, geen productiecode)
- **scope:** het nummer van de bijhorende issue
- **subject:** korte beschrijving in de tegenwoordige tijd, woorden gescheiden door koppeltekens

### Commits
Naamgeving: `<type>(#<scope>): <subject>`, bv. `feat(#0001): vue setup`

- **type:** `feat`, `hotfix`, `fix`, `refactor`, `chore`
- **scope:** het nummer van de bijhorende issue, **inclusief het hekje (#)**
- **subject:** korte beschrijving in de tegenwoordige tijd, als gewone zin met spaties
