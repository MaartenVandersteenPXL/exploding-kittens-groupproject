using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class SeeTheFutureAction: ActionBase
{
    private readonly IGame _game;
    private Guid _playerId;
    
    public SeeTheFutureAction(IGame game, Guid playerId) : base(game, playerId, cards: [], true)
    {

        _game = game;
        _playerId = playerId;
    }

    protected override void Execute()
    {
        if (IsNoped) return;
        IReadOnlyList<Card> top3Cards = _game.DrawPile.PeekTopCards(3).ToList();
        IPlayer player = _game.GetPlayerById(_playerId);
        player.FutureCards = top3Cards;
    }
}