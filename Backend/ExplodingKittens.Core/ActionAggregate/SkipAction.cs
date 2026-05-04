using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>End your turn without drawing a card.</summary>
internal class SkipAction : ActionBase
{
    public SkipAction(IGame game, Guid playerId)
        : base(game, playerId, new List<Card> { Card.Skip } , true)
    {      
    }

    protected override void Execute()
    {
        if (CurrentGame.PendingDraws > 1)
        {
            CurrentGame.PendingDraws--;
        }
        else
        {
            CurrentGame.PendingDraws = 0;
            CurrentGame.AdvanceTurn();
        }
        
    }
}