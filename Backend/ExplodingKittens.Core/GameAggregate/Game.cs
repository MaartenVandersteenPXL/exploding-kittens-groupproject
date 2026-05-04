using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.GameAggregate;

/// <inheritdoc cref="IGame"/>
internal class Game : IGame
{
    /// <summary>
    /// Creates a new game. Does not deal cards or set first player; use <see cref="IGameFactory"/> for full setup.
    /// </summary>
    private Guid _id;
    private IPlayer[] _players;
    private ICardDeck _drawPile;
    private Guid _playerToPlayId;
    private IActionFactory _actionFactory;
    private IList<Card> _discardPile = new List<Card>();
    private int _pendingDraws = 1;
    private IAction? _pendingAction = null;

    public Game(Guid id, IPlayer[] players, ICardDeck drawPile, Guid startingPlayerId, IActionFactory actionFactory)
    {
        _id = id;
        _players = players;
        _drawPile = drawPile;
        _playerToPlayId = startingPlayerId;
        _actionFactory = actionFactory;
    }

    public Guid Id => _id;

    public IPlayer[] Players => _players;

    public Guid PlayerToPlayId => _playerToPlayId;

    public IList<Card> DiscardPile => _discardPile;

    public ICardDeck DrawPile => _drawPile;

    public int PendingDraws { get => _pendingDraws; set => _pendingDraws = value; }

    public IAction? PendingAction => _pendingAction;

    public bool HasEnded => _players.Count(p => !p.Eliminated) <= 1;

    public void AdvanceTurn()
    {
        if (_pendingDraws > 0)
        {
            throw new InvalidOperationException("Je moet eert de kaarten trekken.");
        }
        // FutureCards resetten voor alle spelers zodat oude informatie niet blijft hangen als er een nieuwe 'See the Future' kaart gespeeld wordt
        foreach (IPlayer player in _players)
        {
            player.FutureCards = new List<Card>();
        }
        {
            // Beurt wisselen naar de volgende speler die nog niet is geëlimineerd
            int currentPlayerIndex = Array.FindIndex(_players, player => player.Id == _playerToPlayId);
            int nextPlayerIndex = (currentPlayerIndex + 1) % _players.Length;
            while (_players[nextPlayerIndex].Eliminated)
            {
                nextPlayerIndex = (nextPlayerIndex + 1) % _players.Length;
            }
            _playerToPlayId = _players[nextPlayerIndex].Id;

            _pendingDraws = 1;
        }
    }

    public void ConfirmNotNopingPendingAction(Guid playerId)
    {
        if (_pendingAction == null)
        {
            throw new InvalidOperationException("Er is geen actie in behandeling.");
        }
        _pendingAction.ConfirmNotNoping(playerId);
    }

    public void DrawCard(Guid playerId)
    {
        // 1. Validatie: Is de juiste speler aan de beurt?
        if (playerId != _playerToPlayId)
        {
            throw new InvalidOperationException("Het is niet jouw beurt.");
        }

        // 2. Validatie: Is er een actie bezig?
        if (_pendingAction != null && !_pendingAction.IsExecuted)
        {
            throw new InvalidOperationException("Er is nog een actie bezig. Behandel deze eerst.");
        }
        // 3. De speler trekt een kaart van de trekstapel
        IPlayer currentPlayer = GetPlayerById(playerId);
        Card drawnCard = _drawPile.DrawTopCard();

        // 4. Speciale afhandeling als het een Exploding Kitten is
        if (drawnCard == Card.ExplodingKitten)
        {
            currentPlayer.Hand.InsertCard(drawnCard);
            _pendingDraws = 0; // Beurt stopt sowieso na een Exploding Kitteb

            // Check of de speler direct geëlimineerd is (geen defuse in hand)
            if (currentPlayer.Eliminated)
            {
                // Speler is dood, nu mag de beurt WEL naar de volgende
                AdvanceTurn();
            }
            // Als currentPlayer.Eliminated FALSE is, doen we NIETS.
            // De speler blijft aan de beurt en MOET nu een DefuseAction spelen.
        }
        else
        {
            // Normale kaart getrokken
            _pendingDraws--;
            currentPlayer.Hand.InsertCard(drawnCard);
            if (_pendingDraws <= 0)
            {
                AdvanceTurn();
            }
        }
    }

    public IPlayer GetPlayerById(Guid playerId)
    {
        //Zoekt de speler met de gegeven ID en retourneert deze. Gooi een fout als er geen speler is met die ID.
        foreach (IPlayer player in _players)
        {
            if (player.Id == playerId)
            {
                return player;
            }
        }
        throw new InvalidOperationException("Speler niet gevonden");
    }

    public void NopePendingAction(Guid playerId)
    {
        if (_pendingAction == null)
        {
            throw new InvalidOperationException("Er is geen actie in behandeling.");
        }

        Card? nopeCard = GetPlayerById(playerId).Hand.PickSpecificCard(Card.Nope);
        if (nopeCard == null)
        {
            throw new InvalidOperationException("Je hebt geen 'Nope' kaart in je hand.");
        }

        _discardPile.Add(Card.Nope);
        _pendingAction.Nope(playerId);
    }

    public void PlayAction(Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex)
    {
        // 1. Validatie: Is de juiste speler aan de beurt?
        if (playerId != _playerToPlayId)
        {
            throw new InvalidOperationException("Het is niet jouw beurt.");
        }
        // 2. Validatie: Is er een actie bezig?
        if (_pendingAction != null && !_pendingAction.IsExecuted)
        {
            throw new InvalidOperationException("Er is nog een actie bezig. Je moet deze eerst bevestigen of nopen voordat je een kaart kunt spelen.");
        }
        // 3. Haalt de kaart uit de hand van de speler en legt deze op de aflegstapel. 
        foreach (Card playedCard in cards)
        {
            GetPlayerById(playerId).Hand.PickSpecificCard(playedCard);
            _discardPile.Add(playedCard);
        }
        // 6. De actie aanmaken
        IAction action = _actionFactory.Create(this, playerId, cards, targetPlayerId, targetCard, drawPileIndex);

        // 7. Als de actie genoped kan worden, blijft deze in behandeling totdat alle spelers hebben bevestigd dat ze niet nopen of totdat iemand nopt
        if (action.CanBeNoped)
        {
            _pendingAction = action;
            if (!action.Cards.Contains(Card.Favor))
            {
                action.ConfirmNotNoping(playerId);
            }
        }
        else
        {
            // 8. Direct uitvoeren voor alle spelers (nodig voor o.a. Defuse)
            foreach (IPlayer player in _players)
            {
                action.ConfirmNotNoping(player.Id);
            }
        }
        _pendingAction = action;
    }

    public void SelectCardToGiveAsAFavor(Guid playerId, Card card)
    {

        if (_pendingAction == null)
        {
            throw new InvalidOperationException("Er is geen actie in behandeling.");
        }

        if (_pendingAction.Cards[0] != Card.Favor)
        {
            throw new InvalidOperationException("De action is geen Favor.");
        }

        _pendingAction.TargetCard = card;
        Guid actingPlayerId = _pendingAction.PlayerId;
        _pendingAction.ConfirmNotNoping(playerId);
        _pendingAction.ConfirmNotNoping(actingPlayerId);
    }
}