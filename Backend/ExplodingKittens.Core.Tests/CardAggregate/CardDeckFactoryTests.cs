using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.Tests.Extensions;
using Guts.Client.NUnit;

namespace ExplodingKittens.Core.Tests.CardAggregate;

[ProjectComponentTestFixture("1TINProject", "ExplodingKittens", "CardDeckFactory",
    @"ExplodingKittens.Core\CardAggregate\CardDeckFactory.cs")]
public class CardDeckFactoryTests
{
    private ICardDeckFactory _cardDeckFactory;

    [SetUp]
    public void SetUp()
    {
        _cardDeckFactory = new CardDeckFactory() as ICardDeckFactory;
    }

    [MonitoredTest]
    public void Class_ShouldBeInternal_SoThatItCanOnlyBeUsedInTheCoreProject()
    {
        Assert.That(typeof(CardDeckFactory).IsNotPublic, Is.True, "use 'internal class' instead of 'public class'");
    }

    [MonitoredTest]
    public void Class_ShouldImplement_ICardDeckFactory()
    {
        Assert.That(typeof(CardDeckFactory).IsAssignableTo(typeof(ICardDeckFactory)), Is.True);
    }

    [MonitoredTest]
    public void ICardDeckFactory_Interface_ShouldHaveCorrectMembers()
    {
        var type = typeof(ICardDeckFactory);
        type.AssertInterfaceMethod(nameof(ICardDeckFactory.CreateStandardDeckWithoutExplodingKittens), typeof(ICardDeck), typeof(int));
    }

    [MonitoredTest]
    public void CreateStandardDeckWithoutExplodingKittens_ShouldCreateADeckWithTheStandardGameCards()
    {
        // Act
        ICardDeck deck = _cardDeckFactory.CreateStandardDeckWithoutExplodingKittens(2);

        // Assert
        IReadOnlyList<Card> cards = deck.PeekTopCards(deck.CardCount);
        Assert.That(cards.Count, Is.GreaterThan(0), "The tests calls 'PeekTopCards' on the deck, passing in the 'CardCount' of the deck. " +
                                                    "This should return all cards in the deck.");

        Assert.That(cards.Count(c => c == Card.Attack), Is.EqualTo(4), "The deck should contain 4 Attack cards");
        Assert.That(cards.Count(c => c == Card.Favor), Is.EqualTo(4), "The deck should contain 4 Favor cards");
        Assert.That(cards.Count(c => c == Card.Skip), Is.EqualTo(4), "The deck should contain 4 Skip cards");
        Assert.That(cards.Count(c => c == Card.Shuffle), Is.EqualTo(4), "The deck should contain 4 Shuffle cards");
        Assert.That(cards.Count(c => c == Card.Nope), Is.EqualTo(5), "The deck should contain 5 Nope cards");

        Assert.That(cards.Count(c => c == Card.BeardCat), Is.EqualTo(4), "The deck should contain 4 BeardCat cards");
        Assert.That(cards.Count(c => c == Card.Cattermelon), Is.EqualTo(4), "The deck should contain 4 Cattermelon cards");
        Assert.That(cards.Count(c => c == Card.HairyPotatoCat), Is.EqualTo(4), "The deck should contain 4 HairyPotatoCat cards");
        Assert.That(cards.Count(c => c == Card.RainbowRalphingCat), Is.EqualTo(4), "The deck should contain 4 RainbowRalphingCat cards");
        Assert.That(cards.Count(c => c == Card.TacoCat), Is.EqualTo(4), "The deck should contain 4 TacoCat cards");

        Assert.That(cards.Count(c => c == Card.SeeTheFuture), Is.EqualTo(5), "The deck should contain 5 SeeTheFuture cards");
    }

    [MonitoredTest]
    [TestCase(2, 2)]
    [TestCase(3, 2)]
    [TestCase(4, 2)]
    [TestCase(5, 1)]
    public void CreateStandardDeckWithoutExplodingKittens_ShouldCreateADeckWithCorrectNumberOfDefuseCards(int numberOfPlayers, int expectedNumberOfDefuseCards)
    {
        // Act
        ICardDeck deck = _cardDeckFactory.CreateStandardDeckWithoutExplodingKittens(numberOfPlayers);

        // Assert
        IReadOnlyList<Card> cards = deck.PeekTopCards(deck.CardCount);
        Assert.That(cards.Count, Is.GreaterThan(0), "The tests calls 'PeekTopCards' on the deck, passing in the 'CardCount' of the deck. " +
                                                    "This should return all cards in the deck.");

        Assert.That(cards.Count(c => c == Card.Defuse), Is.EqualTo(expectedNumberOfDefuseCards),
            $"With {numberOfPlayers} players, the deck should contain {expectedNumberOfDefuseCards} 'Defuse' cards");
    }
}