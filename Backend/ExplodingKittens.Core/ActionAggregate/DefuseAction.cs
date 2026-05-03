using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>
/// Defuse an Exploding Kitten: place it back in the draw pile at the chosen index.
/// The turn is over after playing this card
/// </summary>
internal class DefuseAction: IAction
{
    public DefuseAction(IGame game, Guid playerId, int drawPileIndex)
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

    public void Nope(Guid nopingPlayerId)
    {
        throw new NotImplementedException();
    }
}
