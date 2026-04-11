using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class PlayerBase: IPlayer
{
    protected PlayerBase(Guid id, string name, DateOnly birthDate)
    {
        
    }

    public Guid Id => throw new NotImplementedException();

    public string Name => throw new NotImplementedException();

    public DateOnly BirthDate => throw new NotImplementedException();

    public IHand Hand => throw new NotImplementedException();

    public bool HasExplodingKitten => throw new NotImplementedException();

    public bool Eliminated => throw new NotImplementedException();

    public IReadOnlyList<Card> FutureCards { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
}