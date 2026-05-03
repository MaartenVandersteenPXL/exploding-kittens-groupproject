using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class SeeTheFutureAction: ActionBase
{

    public SeeTheFutureAction(IGame game, Guid playerId) : base(game, playerId, new List<Card> { Card.SeeTheFuture }, true)
    { }

    protected override void Execute()
    {
        IReadOnlyList<Card> top3Cards = CurrentGame.DrawPile.PeekTopCards(3).ToList();
        IPlayer player = CurrentGame.GetPlayerById(PlayerId);
        player.FutureCards = top3Cards;
    }
}