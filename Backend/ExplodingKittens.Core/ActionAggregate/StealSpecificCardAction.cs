using ExplodingKittens.Core.ActionAggregate.Contracts;
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
        IPlayer targetPlayer = CurrentGame.GetPlayerById(TargetPlayerId.Value);
        Card? stolenCard = targetPlayer.Hand.PickSpecificCard(TargetCard.Value);
        IPlayer actionPlayer = CurrentGame.GetPlayerById(PlayerId);
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

    public Guid PlayerId => throw new NotImplementedException();

    public IReadOnlyList<Card> Cards => throw new NotImplementedException();

    public bool CanBeNoped => throw new NotImplementedException();

    public Guid? TargetPlayerId => throw new NotImplementedException();

    public Card? TargetCard { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public int? DrawPileIndex => throw new NotImplementedException();

    public IReadOnlyDictionary<Guid, NopeDecision> PlayerNopeDecisions => throw new NotImplementedException();

    public bool IsNoped => throw new NotImplementedException();

    public bool IsExecuted => throw new NotImplementedException();

    public void ConfirmNotNoping(Guid notNopingPlayerId)
    {
        throw new NotImplementedException();
    }

    public void Nope(Guid nopingPlayerId)
    {
        throw new NotImplementedException();
    }
}