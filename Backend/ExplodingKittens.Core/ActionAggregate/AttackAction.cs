using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

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
        int penaltyDraws;
            
            if (CurrentGame.PendingDraws <= 1)
        {
            penaltyDraws = 2;
        }
        else
        {
            penaltyDraws = CurrentGame.PendingDraws + 2; 
        }

        CurrentGame.PendingDraws = 0;
        CurrentGame.AdvanceTurn();
        CurrentGame.PendingDraws = penaltyDraws;

    }
}
