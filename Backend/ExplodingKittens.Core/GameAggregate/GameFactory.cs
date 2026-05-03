using System.Linq;
using ExplodingKittens.Core.ActionAggregate;
using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;

namespace ExplodingKittens.Core.GameAggregate;

internal class GameFactory : IGameFactory
{
    // 1. Definieer de private fields (deze houden de fabrieken vast)
    private readonly ICardDeckFactory _cardDeckFactory;
    private readonly IActionFactory _actionFactory;

    // 2. Sla de parameters uit de constructor op in de fields
    public GameFactory(ICardDeckFactory cardDeckFactory, IActionFactory actionFactory)
    {
        _cardDeckFactory = cardDeckFactory;
        _actionFactory = actionFactory;
    }

    public IGame CreateNewForTable(ITable table)
    {
        IPlayer[] players = table.SeatedPlayers.ToArray();

        // 1. Maak het deck
        ICardDeck deck = _cardDeckFactory.CreateStandardDeckWithoutExplodingKittens(players.Length);

        // 2. Het dek een eerste keer schudden
        deck.Shuffle();
        

        // 3. Deel kaarten uit (7 per persoon + 1 Defuse)
        foreach (IPlayer player in players)
        {
            for (int i = 0; i < 7; i++)
            {
                player.Hand.InsertCard(deck.DrawTopCard());
            }
            player.Hand.InsertCard(Card.Defuse);
        }

        // 4. Verwijder 1/3 van de kaarten (bij 2 of 3 spelers)
        if (players.Length <= 3)
        {
            int toRemove = deck.CardCount / 3;
            for (int i = 0; i < toRemove; i++) deck.DrawTopCard();
        }

        // 5. Kittens toevoegen (Aantal spelers - 1)
        int kittenCount = players.Length - 1;
        for (int i = 0; i < kittenCount; i++)
        {
            deck.InsertCard(Card.ExplodingKitten, 0);
        }

        // 6. Schudden (voor de tweede keer, nadat de kittens erin zitten)
        deck.Shuffle();

        // 7. Jongste speler bepalen
        IPlayer? startingPlayer = players.OrderByDescending(p => p.BirthDate).FirstOrDefault();

        if (startingPlayer == null)
        {
            throw new InvalidOperationException("Kan geen spelers vinden om het spel te starten.");
        }

        // 8. Maak het spel aan
        return null;
        //return new Game(Guid.NewGuid(), players, deck, startingPlayer.Id, _actionFactory);
    }
}