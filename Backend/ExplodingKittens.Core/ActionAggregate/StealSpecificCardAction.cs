using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using Microsoft.AspNetCore.Identity;
using System.Xml.Linq;

namespace ExplodingKittens.Core.ActionAggregate;

internal class StealSpecificCardAction : ActionBase
{

    public StealSpecificCardAction(IGame game, Guid playerId, IReadOnlyList<Card> cards, Card targetCard, Guid targetPlayerId) 
        : base(game, playerId, cards,true, targetCard, targetPlayerId,null) 
        
    {
        
    }
    protected override void Execute()
    {
        if(TargetPlayerId == null || TargetCard == null)
        {
            throw new InvalidOperationException("doelspeler and doelkaart moeten aangeduid worden");
        }
        IPlayer targetPlayer = Game.GetPlayerById(TargetPlayerId.Value);
        Card? stolenCard = targetPlayer.Hand.PickSpecificCard(TargetCard.Value);
        IPlayer actionPlayer = Game.GetPlayerById(PlayerId);
        if (stolenCard != null)
        {
            
            actionPlayer.Hand.InsertCard(stolenCard.Value);
        }
        else
        {
            Card? randomCard = targetPlayer.Hand.PickRandomCard();
            if (randomCard == null)
            {
                throw new InvalidOperationException("speler is reeds uitgeschakeld");
            }
            else
            {
                actionPlayer.Hand.InsertCard(randomCard.Value);
            }
        }
        
    }
}