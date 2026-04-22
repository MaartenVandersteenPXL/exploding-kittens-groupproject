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
            return _cards.FirstOrDefault();
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
            return (IReadOnlyList<Card>)_cards.Take(numberOfCards);
        }
        return (IReadOnlyList<Card>)_cards.Take(_cards.Count);
    }

    public void Shuffle()
    {
        _cards.Shuffle();
    }
}