using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

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
            throw new InvalidOperationException("doelspeler en doelkaart moeten aangeduid worden");
        }
        IPlayer targetPlayer = CurrentGame.GetPlayerById(TargetPlayerId.Value);
        Card? stolenCard = targetPlayer.Hand.PickSpecificCard(TargetCard.Value);
        IPlayer actionPlayer = CurrentGame.GetPlayerById(PlayerId);
        if (stolenCard != null)
        {
            
            actionPlayer.Hand.InsertCard(stolenCard.Value);
        }
        //else er gebeurt niets
       
        
    }
}