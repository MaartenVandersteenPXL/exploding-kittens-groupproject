using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.Tests.Builders;
using ExplodingKittens.Core.Tests.Extensions;
using ExplodingKittens.Core.UserAggregate;
using Guts.Client.NUnit;
using Moq;

namespace ExplodingKittens.Core.Tests.GameAggregate;

[ProjectComponentTestFixture("1TINProject", "ExplodingKittens", "GameFactory",
    @"ExplodingKittens.Core\GameAggregate\GameFactory.cs")]
public class GameFactoryTests
{
    private GameFactory _gameFactory;
    private TableMockBuilder _tableMockBuilder;
    private CardDeckFactoryMockBuilder _cardDeckFactoryMockBuilder;
    private ActionFactoryMockBuilder _actionFactoryMockBuilder;
    private Guid _youngestPlayerId;

    [SetUp]
    public void SetUp()
    {
        DateOnly birthDateA = new DateOnly(1990, 10, 20);
        DateOnly birthDateB = birthDateA.AddMonths(Random.Shared.Next(-70, 71));
        User userA = new UserBuilder().WithUserName("UserA").WithBirthDate(birthDateA).Build();
        User userB = new UserBuilder().WithUserName("UserB").WithBirthDate(birthDateB).Build();
        _youngestPlayerId = userA.BirthDate > userB.BirthDate ? userA.Id : userB.Id;
        _tableMockBuilder = new TableMockBuilder().WithSeatedUsers([userA, userB]);

        _cardDeckFactoryMockBuilder = new CardDeckFactoryMockBuilder();
        _actionFactoryMockBuilder = new ActionFactoryMockBuilder();

        _gameFactory = new GameFactory(_cardDeckFactoryMockBuilder.Object, _actionFactoryMockBuilder.Object);
    }

    [MonitoredTest]
    public void Class_ShouldBeInternal_SoThatItCanOnlyBeUsedInTheCoreProject()
    {
        Assert.That(typeof(GameFactory).IsNotPublic, Is.True, "use 'internal class' instead of 'public class'");
    }

    [MonitoredTest]
    public void Class_ShouldImplement_IGameFactory()
    {
        Assert.That(typeof(GameFactory).IsAssignableTo(typeof(IGameFactory)), Is.True);
    }

    [MonitoredTest]
    public void IGameFactory_Interface_ShouldHaveCorrectMembers()
    {
        var type = typeof(IGameFactory);
        type.AssertInterfaceMethod(nameof(IGameFactory.CreateNewForTable), typeof(IGame), typeof(ITable));
    }

    [MonitoredTest]
    public void CreateNewForTable_ShouldCreateCardDeck_ShouldDealCards_ShouldSelectYoungestPlayerToStart()
    {
        //Arrange
        ITable table = _tableMockBuilder.Object;

        // Act
        IGame game = _gameFactory.CreateNewForTable(table);

        // Assert
        Assert.That(game.Id, Is.Not.EqualTo(Guid.Empty), "A non-empty Guid must be used for the id");

        _cardDeckFactoryMockBuilder.Mock.Verify(f => f.CreateStandardDeckWithoutExplodingKittens(table.SeatedPlayers.Count), Times.Once,
            "The game factory should use the card deck factory to create a card deck for the game (passing in the correct amount of players)");

        foreach (PlayerMockBuilder playerMockBuilder in _tableMockBuilder.SeatedPlayerMockBuilders)
        {
            IPlayer player = playerMockBuilder.Object;
            IPlayer? matchingPlayer = game.Players.FirstOrDefault(p => p.Id == player.Id);
            Assert.That(matchingPlayer, Is.Not.Null, "Each player in the game should be one of the players seated at the table");

            Assert.That(matchingPlayer.Hand, Is.Not.Null, "Each player in the game should have a hand of cards");
            Mock<IHand> playerHandMock = playerMockBuilder.HandMock;
            playerHandMock.Verify(h => h.InsertCard(It.IsAny<Card>()), Times.Exactly(8),
                "Each player in the game should have exactly 8 cards inserted into their hand");
            playerHandMock.Verify(h => h.InsertCard(Card.Defuse), Times.AtLeastOnce,
                "Each player in the game should have at least defuse card inserted into their hand");

        }

        Mock<ICardDeck> deckMock = _cardDeckFactoryMockBuilder.CardDeckMock;
        deckMock.Verify(d => d.Shuffle(), Times.AtLeast(2),
            "The deck created by the factory should be shuffled at least two times " +
            "(one time after creating the deck and one time after adding the exploding kittens)");

        deckMock.Verify(d => d.DrawTopCard(), Times.AtLeast(table.SeatedPlayers.Count * 7),
            "For each player, 7 cards must be drawn from the deck");

        int expectedNumberOfExplodingKittens = table.SeatedPlayers.Count - 1;
        deckMock.Verify(d => d.InsertCard(Card.ExplodingKitten), Times.Exactly(expectedNumberOfExplodingKittens),
            $"There should be exactly {expectedNumberOfExplodingKittens} exploding kitten card(s) in the deck");

        Assert.That(deckMock.Object.CardCount, Is.EqualTo(24),
            "After dealing and inserting defuse and exploding kitten cards, there should be exactly 24 cards in the deck in a 2-player game. " +
            "Remember to remove one third of the cards when there are 3 players or less");

        Assert.That(game.DrawPile, Is.SameAs(_cardDeckFactoryMockBuilder.CardDeckMock.Object),
            "The deck created by the carddeck factory should be used as the game's draw pile");

        Assert.That(game.PlayerToPlayId, Is.EqualTo(_youngestPlayerId),
            "The youngest player should be the first to play");
    }
}