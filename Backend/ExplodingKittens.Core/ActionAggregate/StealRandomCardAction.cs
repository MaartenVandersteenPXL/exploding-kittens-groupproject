using ExplodingKittens.Core.ActionAggregate.Contracts;
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
    protected override void Execute()
    {
        if (TargetPlayerId == null)
        {
            throw new InvalidOperationException("TargetPlayerId and TargetCard must be specified");
        }
        IPlayer targetPlayer = CurrentGame.GetPlayerById(TargetPlayerId.Value);
        Card? randomCard = targetPlayer.Hand.PickRandomCard();
        IPlayer actionPlayer = CurrentGame.GetPlayerById(PlayerId);
        if(randomCard == null)
        {
            throw new InvalidOperationException("speler is uitgeschakeld");
        } else
        {
            actionPlayer.Hand.InsertCard(randomCard.Value);
        }
       
    }
}