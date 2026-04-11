using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class PlayerBase : IPlayer
{
    protected PlayerBase(Guid id, string name, DateOnly birthDate)
    {
        Id = id;
        Name = name;
        BirthDate = birthDate;
    }

    public Guid Id { get; }
    public string Name { get; }
    public DateOnly BirthDate { get; }
    public IHand Hand => throw new NotImplementedException();
    public bool HasExplodingKitten => throw new NotImplementedException();
    public bool Eliminated => throw new NotImplementedException();
    public IReadOnlyList<Card> FutureCards { get; set; } = [];
}