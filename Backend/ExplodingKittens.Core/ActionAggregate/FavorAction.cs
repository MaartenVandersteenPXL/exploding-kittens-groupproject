using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>Target player gives you a card of their choice. Target chooses which card to give.</summary>
internal class FavorAction: ActionBase
{
    public FavorAction(IGame game, Guid playerId, Guid targetPlayerId): 
        base (game, playerId, new List<Card> { Card.Favor }, canBeNoped: true, targetCard: null, targetPlayerId: targetPlayerId, drawPileIndex: null )
    {}

    protected override void Execute()
    {
        IPlayer targetPlayer = CurrentGame.GetPlayerById(TargetPlayerId!.Value);
        IPlayer player = CurrentGame.GetPlayerById(PlayerId);
        Card? targetPlayerPickedCard;
        if (targetPlayer.Hand.Cards.Count == 0)
        {
            //throw new InvalidOperationException("A target player must have cards available");
            return;
        }
        if (targetPlayer.Hand.Contains(TargetCard!.Value))
        {
            targetPlayerPickedCard = targetPlayer.Hand.PickSpecificCard(TargetCard!.Value);
        }else
        {
            targetPlayerPickedCard = targetPlayer.Hand.PickRandomCard();
        }
        //Card? targetPlayerPickedCard = targetPlayer.Hand.PickSpecificCard((Card)TargetCard);
        player.Hand.InsertCard((Card)targetPlayerPickedCard);
    }

}
