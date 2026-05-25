using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

internal class StealRandomCardAction : ActionBase
{
    public StealRandomCardAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, Guid targetPlayerId)
        : base(game, playerId, cards, true, null, targetPlayerId, null)
    {
    }

    protected override void Execute()
    {
        if (TargetPlayerId == null)
        {
            throw new InvalidOperationException("TargetPlayerId and TargetCard must be specified");
        }
        IPlayer targetPlayer = CurrentGame.GetPlayerById(TargetPlayerId.Value);
        Card? randomCard = targetPlayer.Hand.PickRandomCard();
        IPlayer actionPlayer = CurrentGame.GetPlayerById(PlayerId);


        if (randomCard != null)
        {
            actionPlayer.Hand.InsertCard(randomCard.Value);
        }
    }
}