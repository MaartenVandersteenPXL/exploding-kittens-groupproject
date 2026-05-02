using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.GameAggregate;

/// <inheritdoc cref="IGameService"/>
internal class GameService : IGameService
{
    private readonly IGameRepository _gameRepository;

    public GameService(IGameRepository gameRepository)
    {
        _gameRepository = gameRepository;
    }

    public IGame GetGame(Guid gameId)
    {
        return _gameRepository.GetById(gameId);
    }

    public IGame PlayAction(Guid gameId, Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex)
    {
        //TODO (EXTRA): computer players should automatically decide whether to nope the action or not.
        //TODO (EXTRA): Also, if the action is a 'Favor' action, the computer player receiving the favor should automatically decide which card to give as a favor

        IGame game = _gameRepository.GetById(gameId);
        game.PlayAction(playerId, cards, targetPlayerId, targetCard, drawPileIndex);
        return game;
    }

    public IGame DrawCard(Guid gameId, Guid playerId)
    {
        //TODO (EXTRA): if the player at turn is a computer player, the computer player should decide its action automatically

        IGame game = _gameRepository.GetById(gameId);
        game.DrawCard(playerId);
        return game;
    }

    public IGame NopePendingAction(Guid gameId, Guid playerId)
    {
        //TODO (EXTRA): computer players should automatically decide whether to counter the nope or not

        IGame game = _gameRepository.GetById(gameId);
        game.NopePendingAction(playerId);
        return game;
    }

    public IGame ConfirmNotNopingPendingAction(Guid gameId, Guid playerId)
    {
        IGame game = _gameRepository.GetById(gameId);
        game.ConfirmNotNopingPendingAction(playerId);
        return game;
    }

    public IGame SelectCardToGiveAsAFavor(Guid gameId, Guid playerId, Card card)
    {
        IGame game = _gameRepository.GetById(gameId);
        game.SelectCardToGiveAsAFavor(playerId, card);
        return game;
    }
}