using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.GameAggregate;

/// <inheritdoc cref="IGame"/>
internal class Game : IGame
{
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

        foreach (IPlayer player in _players)
        {
            player.FutureCards = new List<Card>();
        }
        {
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
        if (playerId != _playerToPlayId)
        {
            throw new InvalidOperationException("Het is niet jouw beurt.");
        }

        if (_pendingAction != null && !_pendingAction.IsExecuted)
        {
            throw new InvalidOperationException("Er is nog een actie bezig. Behandel deze eerst.");
        }

        IPlayer currentPlayer = GetPlayerById(playerId);
        Card drawnCard = _drawPile.DrawTopCard();

        if (drawnCard == Card.ExplodingKitten)
        {
            currentPlayer.Hand.InsertCard(drawnCard);
            _pendingDraws = 0;

            if (currentPlayer.Eliminated)
            {
                AdvanceTurn();
            }
        }
        else
        {
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
        if (playerId != _playerToPlayId)
        {
            throw new InvalidOperationException("Het is niet jouw beurt.");
        }

        if (_pendingAction != null && !_pendingAction.IsExecuted)
        {
            throw new InvalidOperationException("Er is nog een actie bezig. Je moet deze eerst bevestigen of nopen voordat je een kaart kunt spelen.");
        }

        foreach (Card playedCard in cards)
        {
            GetPlayerById(playerId).Hand.PickSpecificCard(playedCard);
            _discardPile.Add(playedCard);
        }

        IAction action = _actionFactory.Create(this, playerId, cards, targetPlayerId, targetCard, drawPileIndex);
        _pendingAction = action;

        if (action.CanBeNoped)
        {
            if (!action.Cards.Contains(Card.Favor))
            {
                action.ConfirmNotNoping(playerId);
            }
        }
        else
        {
            foreach (IPlayer player in _players)
            {
                action.ConfirmNotNoping(player.Id);
            }
        }
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