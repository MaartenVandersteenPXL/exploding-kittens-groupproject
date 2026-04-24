using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.PlayerAggregate;

/// <inheritdoc cref="IHand"/>
internal class Hand : IHand
{
    private readonly List<Card> _hand = new();

    public IReadOnlyList<Card> Cards
    {
        
        get
        {
            _hand.Sort();
            return _hand.AsReadOnly();
        }
    }
        
        
        //=> throw new NotImplementedException();

    public bool Contains(Card card)
    {
        foreach (Card c in _hand) 
        {
            if (c == card)
            {
                return true;
            }
            
        }
        return false;


        //throw new NotImplementedException();
    }

    public void InsertCard(Card card)
    {
        _hand.Add(card);
        _hand.Sort();
        
        
        //throw new NotImplementedException();
    }

    public Card? PickRandomCard()
    {
        if (_hand.Count == 0)
        {
            return null;
        }
        else
        {
            int random = Random.Shared.Next(_hand.Count);
            Card randomKaart = _hand[random];
            _hand.RemoveAt(random);
            return randomKaart;
        }
        //throw new NotImplementedException();
    }

    public Card? PickSpecificCard(Card card)
    {
        if(_hand.Contains(card))
        {
            int x = _hand.IndexOf(card);
            _hand.RemoveAt(x);
            return card;
        }
        else { return null; }
        
        //throw new NotImplementedException();
    }
}