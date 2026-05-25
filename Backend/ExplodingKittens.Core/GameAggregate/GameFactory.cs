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

        ICardDeck deck = _cardDeckFactory.CreateStandardDeckWithoutExplodingKittens(players.Length);

        deck.Shuffle();


        foreach (IPlayer player in players)
        {
            for (int i = 0; i < 7; i++)
            {
                player.Hand.InsertCard(deck.DrawTopCard());
            }
            player.Hand.InsertCard(Card.Defuse);
        }

        if (players.Length <= 3)
        {
            int toRemove = deck.CardCount / 3;
            for (int i = 0; i < toRemove; i++) deck.DrawTopCard();
        }

        int kittenCount = players.Length - 1;
        for (int i = 0; i < kittenCount; i++)
        {
            deck.InsertCard(Card.ExplodingKitten, 0);
        }

        deck.Shuffle();

        IPlayer? startingPlayer = players.OrderByDescending(p => p.BirthDate).FirstOrDefault();

        if (startingPlayer == null)
        {
            throw new InvalidOperationException("Kan geen spelers vinden om het spel te starten.");
        }

        return new Game(Guid.NewGuid(), players, deck, startingPlayer.Id, _actionFactory);
    }
}