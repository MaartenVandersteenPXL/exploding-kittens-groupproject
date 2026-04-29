using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>

internal abstract class PlayerBase : IPlayer
{
    private Guid _id;
    private string _name;
    private DateOnly _birthDate;
    private readonly IHand _hand;
    private List<Card> _futureCards = new();
    protected PlayerBase(Guid id, string name, DateOnly birthDate)
    {
        _id = id;
        _name = name;
        _birthDate = birthDate;
        _hand = new Hand();
        _futureCards = new List<Card>();
    }

    public Guid Id
    {
        get
        {
            return _id;
        }
    }
        //throw new NotImplementedException();

    public string Name
    {
        get
        {
            return _name;
        }
    } 
        //throw new NotImplementedException();

    public DateOnly BirthDate
    {
        get
        {
            return _birthDate;
        }
    }
        //throw new NotImplementedException();

    public IHand Hand
    {
        get
        {
            return _hand;
        }
    }
    //throw new NotImplementedException();

    public bool HasExplodingKitten
    {
        get
        {
            return Hand.Contains(Card.ExplodingKitten);
        }
    }


    //=> throw new NotImplementedException();

    public bool Eliminated
    {
        get
        {
            return Hand.Contains(Card.ExplodingKitten) && !Hand.Contains(Card.Defuse);
        } 
        
    }
        //=> throw new NotImplementedException();

    public IReadOnlyList<Card> FutureCards
    {
        get
        {
            return _futureCards.AsReadOnly();
        }
        set
        {

        }
    }

    IReadOnlyList<Card> IPlayer.FutureCards
    {
        get
        {
            return _futureCards.AsReadOnly();
        }
        set
        {
            _futureCards = value.ToList();
        }
    }
}