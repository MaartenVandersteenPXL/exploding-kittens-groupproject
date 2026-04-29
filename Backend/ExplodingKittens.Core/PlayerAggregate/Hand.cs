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
        return _hand.Contains(card);


        //throw new NotImplementedException();
    }

    public void InsertCard(Card card)
    {
        int positie = 0;
        while(positie < _hand.Count && _hand[positie] < card)
        {
            positie++;
        }
        _hand.Insert(positie, card);
        
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
            int index = Random.Shared.Next(_hand.Count);
            Card randomCard = _hand[index];
            _hand.RemoveAt(index);
            return randomCard;
        }
        //throw new NotImplementedException();
    }

    public Card? PickSpecificCard(Card card)
    {
        if(_hand.Contains(card))
        {
            _hand.Remove(card);
            return card;
        }
        else { return null; }
        
        //throw new NotImplementedException();
    }
}