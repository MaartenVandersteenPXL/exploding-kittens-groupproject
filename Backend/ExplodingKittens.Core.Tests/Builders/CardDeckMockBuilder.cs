using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.Tests.Extensions;
using Moq;

namespace ExplodingKittens.Core.Tests.Builders;

public class CardDeckMockBuilder : MockBuilder<ICardDeck>
{
    private int _cardCount = 48;

    public CardDeckMockBuilder()
    {
        Mock.SetupGet(cd => cd.CardCount).Returns(() => _cardCount);

        Mock.Setup(cd => cd.DrawTopCard()).Returns(() =>
        {
            _cardCount--;
            return Random.Shared.NextCard();
        });

        Mock.Setup(cd => cd.InsertCard(It.IsAny<Card>())).Callback(() =>
        {
            _cardCount++;
        });

        Mock.Setup(cd => cd.PeekTopCards(It.IsAny<int>())).Returns((int count) =>
        {
            return Enumerable.Range(0, count).Select(_ => Random.Shared.NextCard()).ToList();
        });
    }

    public void WithDrawTopCardReturns(Card card)
    {
        //Use mock to return the specified card once, then revert to the default behavior
        Mock.SetupSequence(cd => cd.DrawTopCard())
            .Returns(card)
            .Returns(() =>
            {
                _cardCount--;
                return Random.Shared.NextCard();
            });
    }
}