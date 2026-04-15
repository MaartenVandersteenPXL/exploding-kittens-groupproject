using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class PlayerBase : IPlayer
{
    //Constructor
    protected PlayerBase(Guid id, string name, DateOnly birthDate)
    {
        Id = id;
        Name = name;
        BirthDate = birthDate;
    }

    //Public properties  - player info
    public Guid Id { get; }
    public string Name { get; }
    public DateOnly BirthDate { get; }

    //Public properties - Hand info and logic
    public IHand Hand => throw new NotImplementedException();
    public IReadOnlyList<Card> FutureCards { get; set; } = [];

    //Public propeties - Game state
    public bool HasExplodingKitten => throw new NotImplementedException();
    public bool Eliminated => throw new NotImplementedException();

    //TIP: kijk naar de uitleg van de interface.
}