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
    public Game(Guid id, IPlayer[] players, ICardDeck drawPile, Guid startingPlayerId, IActionFactory actionFactory)
    {
        _id = id;
        _players = players;
        _drawPile = drawPile;
        _playerToPlayId = startingPlayerId;
        _actionFactory = actionFactory;
    }

    public Guid Id => throw new NotImplementedException();

    public IPlayer[] Players => throw new NotImplementedException();

    public Guid PlayerToPlayId => throw new NotImplementedException();

    public IList<Card> DiscardPile => throw new NotImplementedException();

    public ICardDeck DrawPile => throw new NotImplementedException();

    public int PendingDraws { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public IAction? PendingAction => throw new NotImplementedException();

    public bool HasEnded => throw new NotImplementedException();

    public void AdvanceTurn()
    {
        throw new NotImplementedException();
    }

    public void ConfirmNotNopingPendingAction(Guid playerId)
    {
        throw new NotImplementedException();
    }

    public void DrawCard(Guid playerId)
    {
        throw new NotImplementedException();
    }

    public IPlayer GetPlayerById(Guid playerId)
    {
        throw new NotImplementedException();
    }

    public void NopePendingAction(Guid playerId)
    {
        throw new NotImplementedException();
    }

    public void PlayAction(Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex)
    {
        throw new NotImplementedException();
    }

    public void SelectCardToGiveAsAFavor(Guid playerId, Card card)
    {
        throw new NotImplementedException();
    }
}