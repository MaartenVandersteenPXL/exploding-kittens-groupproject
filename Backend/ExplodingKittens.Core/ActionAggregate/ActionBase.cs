using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <inheritdoc cref="IAction"/>
public abstract class ActionBase : IAction
{
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


    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped)
    {
        
    }

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped, Card? targetCard, Guid? targetPlayerId, int? drawPileIndex) : this(game, playerId, cards, canBeNoped)
    {
        
    }

    /// <summary>
    /// Classes that inherit from ActionBase should implement this method to execute the specific logic of the action.
    /// </summary>
    protected abstract void Execute();
}