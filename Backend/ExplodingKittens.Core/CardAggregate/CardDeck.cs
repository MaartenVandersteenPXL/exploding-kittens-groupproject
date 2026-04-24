using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.Util;

namespace ExplodingKittens.Core.CardAggregate;

/// <inheritdoc cref="ICardDeck"/>
internal class CardDeck: ICardDeck
{

    private readonly IList<Card> _cards;
    
    /// <summary>
    /// Creates the deck
    /// </summary>
    /// <param name="cards">The first card is the card on top, the last card is the bottom card</param>
    public CardDeck(IList<Card> cards)
    {
        _cards = cards;
    }

    public int CardCount
    {
        get { return _cards.Count; }
    }

    public Card DrawTopCard()
    {
        if(_cards.Count >= 1)
        {
            Card cardToReturn = _cards.FirstOrDefault();
            _cards.Remove(cardToReturn);
            return cardToReturn;
        }
        throw new DataNotFoundException();
    }

    public void InsertCard(Card card, int positionFromTop = 0)
    {
        _cards.Insert(positionFromTop, card);
    }

    public IReadOnlyList<Card> PeekTopCards(int numberOfCards)
    {
        if (_cards.Count >= numberOfCards)
        {
            return _cards.Take(numberOfCards).ToList();
        }
        return _cards.Take(_cards.Count).ToList();
    }

    public void Shuffle()
    {
        _cards.Shuffle();
    }
}