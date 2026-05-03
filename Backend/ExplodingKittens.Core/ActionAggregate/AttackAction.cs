using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>
/// Player can skip turn and the next player must draw twice as many cards as the current player did.
/// </summary>
internal class AttackAction : ActionBase
{
    public AttackAction(IGame game, Guid playerId) : base(game, playerId, new List<Card> { Card.Attack }, canBeNoped: true)
    {
    }
    protected override void Execute()
    {
        int penaltyDraws = Game.PendingDraws * 2;

        Game.PendingDraws = 0;
        Game.AdvanceTurn();
        Game.PendingDraws = penaltyDraws;

    }
}
