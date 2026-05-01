using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>End your turn without drawing a card.</summary>
internal class SkipAction : ActionBase
{
    public SkipAction(IGame game, Guid playerId,IReadOnlyList<Card> cards)
        : base(game, playerId, cards, true)
    {
      
    }

    protected override void Execute()
    {
        throw new NotImplementedException();
    }
}