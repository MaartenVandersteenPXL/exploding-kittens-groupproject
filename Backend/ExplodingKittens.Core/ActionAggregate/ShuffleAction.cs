using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class ShuffleAction : ActionBase
{
    public ShuffleAction(IGame game, Guid playerId) : base(game, playerId, new List<Card> { Card.Shuffle }, canBeNoped: true)
    {
    }

    protected override void Execute()
    {
        Game.DrawPile.Shuffle();
    }
}