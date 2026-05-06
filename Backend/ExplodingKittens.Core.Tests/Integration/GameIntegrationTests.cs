using ExplodingKittens.Core.ActionAggregate;
using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.Tests.Extensions;
using Guts.Client.NUnit;

namespace ExplodingKittens.Core.Tests.Integration;

[ProjectComponentTestFixture("1TINProject", "ExplodingKittens", "GameIntegration",
    @"ExplodingKittens.Core\GameAggregate\Game.cs")]
public class GameIntegrationTests
{
    private IPlayer _player1;
    private IPlayer _player2;
    private IPlayer _player3;
    private IPlayer[] _players;

    [SetUp]
    public void BeforeEachTest()
    {
        _player1 = new HumanPlayer(Guid.NewGuid(), "PlayerA", new DateOnly(2000, 1, 1)) as IPlayer;
        _player2 = new HumanPlayer(Guid.NewGuid(), "PlayerB", new DateOnly(2000, 1, 1)) as IPlayer;
        _player3 = new HumanPlayer(Guid.NewGuid(), "PlayerC", new DateOnly(2000, 1, 1)) as IPlayer;
        _players = [_player1, _player2, _player3];
    }

    [MonitoredTest]
    [TestCase("ExplodingKitten,Skip,Attack,Defuse,Shuffle,ExplodingKitten,Nope,BeardCat",
        "Defuse,Skip,Favor",
        "Defuse,TacoCat,TacoCat",
        "Defuse,Shuffle,SeeTheFuture")]
    public void ThreePlayerGame_OnlyPlayDefuseActions_PickCardsUntilSomebodyLoses(
        string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int maxNumberOfDraws = 12;
        int numberOfDraws = 0;

        while (numberOfDraws < maxNumberOfDraws && !game.HasEnded)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            if (game.PendingDraws > 0)
            {
                DrawCard(game, playerToPlay);
                numberOfDraws++;
            }

            if (playerToPlay.HasExplodingKitten && playerToPlay.Hand.Contains(Card.Defuse))
            {
                int drawPileIndex = Random.Shared.Next(0, game.DrawPile.CardCount);
                var defuseAction = PlayCardWithoutNoping<DefuseAction>(game, playerToPlay, Card.Defuse, null, Card.ExplodingKitten, drawPileIndex) as IAction;
                Assert.That(defuseAction.CanBeNoped, Is.False, "A 'Defuse' action should not be noppable");

                bool handContainsExplodingKitten = playerToPlay.Hand.Contains(Card.ExplodingKitten);
                Assert.That(handContainsExplodingKitten, Is.EqualTo(playerToPlay.HasExplodingKitten),
                    "The 'HasExplodingKitten' property of a player should only return true if the hand of the player as an 'Exploding Kitten' card");

                Assert.That(playerToPlay.HasExplodingKitten, Is.False,
                    "After successfully defusing an exploding kitten, the player's hand should no longer contain the exploding kitten");
                Assert.That(playerToPlay.Eliminated, Is.False,
                    "After successfully defusing an exploding kitten, the player should not be marked as eliminated");
            }
        }

        Assert.That(game.HasEnded, Is.True,
            "The game should have ended after drawing all cards from the draw pile and using all defuse cards");
        Assert.That(game.Players.Count(p => p.Eliminated), Is.EqualTo(2),
            "When the 3-player game has ended, there should be 2 eliminated players");
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("BeardCat,BeardCat,BeardCat,TacoCat,TacoCat,TacoCat,Shuffle,SeeTheFuture",
        "Attack,Favor",
        "Attack,Shuffle",
        "Attack,TacoCat")]
    public void ThreePlayerGame_PlayAttackActions_NoNoping(
        string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (game.DrawPile.CardCount > 0)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            TestContext.Out.WriteLine($"Player '{playerToPlay.Name}' has to draw {game.PendingDraws} cards");

            if (!playerToPlay.Hand.Contains(Card.Attack) || game.PendingDraws == 4)
            {
                DrawCard(game, playerToPlay);

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
            else
            {
                int pendingDrawsBeforeAttack = game.PendingDraws;
                var attackAction = PlayCardWithoutNoping<AttackAction>(game, playerToPlay, Card.Attack) as IAction;
                Assert.That(attackAction.CanBeNoped, Is.True, "An 'Attack' action should be nopable");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.True, "After playing an 'Attack' action, the turn should advance to the next player");

                int expectedPendingDraws = pendingDrawsBeforeAttack == 1 ? 2 : pendingDrawsBeforeAttack + 2;
                Assert.That(game.PendingDraws, Is.EqualTo(expectedPendingDraws),
                    "After playing an 'Attack' action, the number of pending draws should be incremented with 2");
            }
        }
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("Shuffle,BeardCat,TacoCat,BeardCat,TacoCat,SeeTheFuture",
        "Favor,Skip",
        "TacoCat,BeardCat",
        "Favor,Shuffle")]
    public void ThreePlayerGame_PlayFavorAction(
        string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < 3)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");


            if (playerToPlay.Hand.Contains(Card.Favor))
            {
                IPlayer targetPlayer = GetTargetPlayerForReceivingCardAction(game, playerToPlay.Id);
                var favorAction = PlayCardWithoutNoping<FavorAction>(game, playerToPlay, Card.Favor, targetPlayer, null, null, false) as IAction;
                Assert.That(favorAction.CanBeNoped, Is.True, "A 'Favor' action should be noppable");

                IAction? pendingFavorAction = game.PendingAction;
                Assert.That(pendingFavorAction, Is.Not.Null, "After playing a 'Favor' card, there should be a pending action");
                Assert.That(pendingFavorAction.IsExecuted, Is.False,
                    "After playing a 'Favor' card and all players confirming not noping, the action should not be executed yet " +
                    "(the target player has to give a card first");

                int numberOfCardsInTargetPlayerHandBeforeGivingCard = targetPlayer.Hand.Cards.Count;
                Card cardToGive = Random.Shared.NextItem(targetPlayer.Hand.Cards.Where(c => c != Card.Favor));
                game.SelectCardToGiveAsAFavor(targetPlayer.Id, cardToGive);
                TestContext.Out.WriteLine($"Player '{targetPlayer.Name}' gives card '{cardToGive}' as a favor to player '{playerToPlay.Name}'");

                Assert.That(pendingFavorAction.IsExecuted, Is.True,
                    $"When the target player has selected a card to give as favor, the pending action should be executed");
                Assert.That(playerToPlay.Hand.Contains(cardToGive), Is.True,
                    "After the 'Favor' action has been executed, the hand of the player who played the 'Favor' card should contain the card given by the target player");
                Assert.That(targetPlayer.Hand.Cards.Count, Is.EqualTo(numberOfCardsInTargetPlayerHandBeforeGivingCard - 1),
                    "After the 'Favor' action has been executed, the hand of the target player should contain one card less");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.False, "After playing a 'Favor' action, the turn should not advance to the next player");
                Assert.That(game.PendingDraws, Is.EqualTo(1),
                    "After playing a 'Favor' action, the number of pending draws should remain the same");
            }
            else
            {
                DrawCard(game, playerToPlay);
                numberOfTurns++;

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
        }
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("Shuffle,SeeTheFuture,Defuse",
       "Shuffle,Nope",
       "SeeTheFuture,Nope",
       "Shuffle,Nope")]
    public void ThreePlayerGame_PlayersNopeIfTheyCan_NopesAreNopedIfPossible_NopedActionsAreNotExecuted(
       string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < 3)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            Card? cardToPlay = playerToPlay.Hand.Cards.FirstOrDefault(c => c != Card.Nope);
            if (cardToPlay is not null)
            {
                TestContext.Out.WriteLine($"Player '{playerToPlay.Name}' is playing card '{cardToPlay.Value}'");
                game.PlayAction(playerToPlay.Id, [cardToPlay.Value], null, null, null);

                Assert.That(game.DiscardPile.Last(), Is.EqualTo(cardToPlay.Value),
                    $"After playing a '{cardToPlay.Value}' card, it should be the last card in the discard pile");

                Assert.That(game.PendingAction, Is.Not.Null,
                    $"After playing a {cardToPlay.Value} card, there should be a pending action");
                IAction pendingAction = game.PendingAction!;

                NopeThePendingAction(game, playerToPlay.Id);
                if (pendingAction.IsNoped)
                {
                    Assert.That(pendingAction.IsExecuted, Is.False,
                        $"When a pending action has been noped and not all players have decided whether to undo the nope, it should not be executed");

                    if (playerToPlay.Hand.Contains(Card.Nope))
                    {
                        game.NopePendingAction(playerToPlay.Id);
                        TestContext.Out.WriteLine(
                            $"Player '{playerToPlay.Name} (id: {playerToPlay.Id})' nopes the nope");

                        ConfirmNotNopingByOtherPlayers(game, playerToPlay.Id);

                        Assert.That(pendingAction.IsExecuted, Is.True,
                            $"When a pending action has been noped twice, it should be executed");
                    }
                    else
                    {
                        Guid nopingPlayerId = pendingAction.PlayerNopeDecisions.First(kv => kv.Value == NopeDecision.Nope).Key;
                        ConfirmNotNopingByOtherPlayers(game, nopingPlayerId);
                        TestContext.Out.WriteLine(
                            $"Player '{playerToPlay.Name} (id: {playerToPlay.Id})' does not undo the nope (by playing a second 'Nope' card).");

                        Assert.That(pendingAction.IsExecuted, Is.True,
                            $"When a pending action has been noped and all players have confirmed not noping, it should be marked as 'Executed'");
                        Assert.That(pendingAction.IsNoped, Is.True,
                            $"When a pending action has been noped and all players have confirmed not noping, it should be marked as 'Noped'");
                    }
                }
            }

            DrawCard(game, playerToPlay);
            numberOfTurns++;

            Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                "After drawing a card, the draw pile should have one less card");
            previousDrawPileCardCount = game.DrawPile.CardCount;
        }
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("Defuse,Skip,Attack,Favor,Shuffle,SeeTheFuture,Nope,BeardCat,Cattermelon,HairyPotatoCat,RainbowRalphingCat,TacoCat",
       "Shuffle,Shuffle",
       "Shuffle,Shuffle",
       "Shuffle,SeeTheFuture")]
    public void ThreePlayerGame_PlayShuffleAction(
       string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int maxNumberOfTurns = 6;
        int previousDrawPileCardCount = game.DrawPile.CardCount;
        double averageSimilarityPercentage = 0.0;

        while (numberOfTurns < maxNumberOfTurns)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            if (playerToPlay.Hand.Contains(Card.Shuffle))
            {
                IList<Card> drawPileCardsBeforeShuffle = game.DrawPile.PeekTopCards(game.DrawPile.CardCount).ToList();

                var shuffleAction = PlayCardWithoutNoping<ShuffleAction>(game, playerToPlay, Card.Shuffle, null, null, null, false) as IAction;
                Assert.That(shuffleAction.CanBeNoped, Is.True, "A 'Shuffle' action should be nope-able");
                IAction? pendingShuffleAction = game.PendingAction;
                Assert.That(pendingShuffleAction, Is.Not.Null, "After playing a 'Shuffle' card, there should be a pending action");
                Assert.That(pendingShuffleAction.IsExecuted, Is.True,
                    "After playing a 'Shuffle' card and all players confirming not noping, it should be executed");

                IList<Card> drawPileCardsAfterShuffle = game.DrawPile.PeekTopCards(game.DrawPile.CardCount).ToList();

                Assert.That(drawPileCardsAfterShuffle, Is.EquivalentTo(drawPileCardsBeforeShuffle),
                    "After playing a 'Shuffle' card, the draw pile should contain the same cards as before");
                //Check how much the order of the cards has changed by counting how many cards are in the same position as before
                int numberOfCardsInSamePosition = drawPileCardsAfterShuffle.Count(c => c == drawPileCardsBeforeShuffle[drawPileCardsAfterShuffle.IndexOf(c)]);
                double similarityPercentage = (double)numberOfCardsInSamePosition / drawPileCardsBeforeShuffle.Count;
                TestContext.Out.WriteLine(
                    $"{similarityPercentage * 100}% of the cards have the same position in the draw pile after the shuffle");
                averageSimilarityPercentage += similarityPercentage / maxNumberOfTurns;

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.False, "After playing a 'Shuffle' action, the turn should not advance to the next player");
                Assert.That(game.PendingDraws, Is.EqualTo(1),
                    "After playing a 'Shuffle' action, the number of pending draws should remain the same");
            }
            else
            {
                DrawCard(game, playerToPlay);
                numberOfTurns++;

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
        }

        TestContext.Out.WriteLine(
            $"On average {averageSimilarityPercentage * 100}% of the cards have the same position in the draw pile after the shuffle");
        Assert.That(averageSimilarityPercentage, Is.LessThan(0.5),
            "After playing a 'Shuffle' card, on average less than 50% of the cards in the draw pile should be in the same position as before (this is a simple check to see if the shuffle has actually changed the order of the cards)");
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("ExplodingKitten",
      "Skip",
      "Skip",
      "RainbowRalphingCat")]
    public void ThreePlayerGame_PlaySkipAction(
      string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int maxNumberOfTurns = 3;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < maxNumberOfTurns)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            if (playerToPlay.Hand.Contains(Card.Skip))
            {

                var skipAction = PlayCardWithoutNoping<SkipAction>(game, playerToPlay, Card.Skip, null, null, null, false) as IAction;
                Assert.That(skipAction.CanBeNoped, Is.True, "A 'Skip' action should be nope-able");
                IAction? pendingSkipAction = game.PendingAction;
                Assert.That(pendingSkipAction, Is.Not.Null, "After playing a 'Skip' card, there should be a pending action");
                Assert.That(pendingSkipAction.IsExecuted, Is.True,
                    "After playing a 'Skip' card and all players confirming not noping, it should be executed");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.True, "After playing a 'Skip' action, the turn should advance to the next player");
            }
            else
            {
                DrawCard(game, playerToPlay);

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
            numberOfTurns++;
        }
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("Cattermelon,ExplodingKitten",
        "Attack",
        "Skip",
        "RainbowRalphingCat")]
    public void ThreePlayerGame_PlaySkipActionAfterAttack(
        string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int maxNumberOfTurns = 3;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < maxNumberOfTurns)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            if (playerToPlay.Hand.Contains(Card.Attack))
            {

                var attackAction = PlayCardWithoutNoping<AttackAction>(game, playerToPlay, Card.Attack, null, null, null, false) as IAction;
                Assert.That(attackAction.CanBeNoped, Is.True, "An 'Attack' action should be nope-able");
                IAction? pendingAttackAction = game.PendingAction;
                Assert.That(pendingAttackAction, Is.Not.Null, "After playing an 'Attack' card, there should be a pending action");
                Assert.That(pendingAttackAction.IsExecuted, Is.True,
                    "After playing an 'Attack' card and all players confirming not noping, it should be executed");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.True, "After playing a 'Attack' action, the turn should advance to the next player");
                Assert.That(game.PendingDraws, Is.EqualTo(2),
                    "After playing an 'Attack' action, the number of pending draws should be 2");
                numberOfTurns++;
            }
            else if (playerToPlay.Hand.Contains(Card.Skip))
            {
                Assert.That(game.PendingDraws, Is.EqualTo(2), "Before playing a 'Skip' action after an attack, the number of pending draws should be 2");

                var skipAction = PlayCardWithoutNoping<SkipAction>(game, playerToPlay, Card.Skip, null, null, null, false) as IAction;
                Assert.That(skipAction.CanBeNoped, Is.True, "A 'Skip' action should be nope-able");
                IAction? pendingSkipAction = game.PendingAction;
                Assert.That(pendingSkipAction, Is.Not.Null, "After playing a 'Skip' card, there should be a pending action");
                Assert.That(pendingSkipAction.IsExecuted, Is.True,
                    "After playing a 'Skip' card and all players confirming not noping, it should be executed");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.False, "After playing a 'Skip' action and having 2 pending draws, the turn should not advance");
                Assert.That(game.PendingDraws, Is.EqualTo(1),
                    "After playing a 'Skip' action and having 2 pending draws, the number of pending draws should decrease to 1");
            }
            else
            {
                DrawCard(game, playerToPlay);

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
                numberOfTurns++;
            }
        }
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("ExplodingKitten,ExplodingKitten,BeardCat,Favor,TacoCat",
        "SeeTheFuture,Skip",
        "RainbowRalphingCat",
        "RainbowRalphingCat")]
    public void ThreePlayerGame_PlaySeeTheFutureAction(
        string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int maxNumberOfTurns = 3;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < maxNumberOfTurns)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            if (playerToPlay.Hand.Contains(Card.SeeTheFuture))
            {

                var seeTheFutureAction = PlayCardWithoutNoping<SeeTheFutureAction>(game, playerToPlay,
                    Card.SeeTheFuture, null, null, null, false) as IAction;
                Assert.That(seeTheFutureAction.CanBeNoped, Is.True, "A 'SeeTheFuture' action should be nope-able");
                IAction? pendingSeeTheFutureAction = game.PendingAction;
                Assert.That(pendingSeeTheFutureAction, Is.Not.Null,
                    "After playing a 'SeeTheFuture' card, there should be a pending action");
                Assert.That(pendingSeeTheFutureAction.IsExecuted, Is.True,
                    "After playing a 'SeeTheFuture' card and all players confirming not noping, it should be executed");

                IList<Card> expectedFutureCards = ParseCards(drawPileCards);
                Assert.That(playerToPlay.FutureCards, Is.EquivalentTo(expectedFutureCards.Take(3)),
                    "After playing a 'SeeTheFuture' card, the 'FutureCards' property of the player should contain the top 3 cards of the draw pile");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.False,
                    "After playing a 'SeeTheFuture' action, the turn should not advance to the next player");

                //play the skip card
                if (playerToPlay.Hand.Contains(Card.Skip))
                {
                    IAction skipAction =
                        PlayCardWithoutNoping<SkipAction>(game, playerToPlay, Card.Skip, null, null, null, false) as IAction;
                    Assert.That(skipAction.IsExecuted, Is.True,
                        "After playing a 'Skip' card and all players confirming not noping, it should be executed");
                    turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                    Assert.That(turnAdvanced, Is.True,
                        "After playing a 'Skip' action, the turn should advance to the next player");
                }
            }
            else
            {
                DrawCard(game, playerToPlay);

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
            numberOfTurns++;
        }
        Assert.That(game.HasEnded, Is.True, "The game should have ended after drawing the 2 exploding kittens");
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("Shuffle,BeardCat,TacoCat,BeardCat,TacoCat",
       "TacoCat,TacoCat",
       "SeeTheFuture,BeardCat",
       "Favor,Shuffle")]
    public void ThreePlayerGame_Play2IdenticalCatCards(
       string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < 3)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");


            if (playerToPlay.Hand.Contains(Card.TacoCat))
            {
                IPlayer targetPlayer = GetTargetPlayerForReceivingCardAction(game, playerToPlay.Id);
                var cardsBeforeSteal = new List<Card>(targetPlayer.Hand.Cards);
                IAction stealCardAction = PlayCardsWithoutNoping<StealRandomCardAction>(game, playerToPlay, [Card.TacoCat, Card.TacoCat], targetPlayer, null, null, false) as IAction;
                Assert.That(stealCardAction.CanBeNoped, Is.True, "A 'StealRandomCardAction' action should be noppable");

                IAction? pendingAction = game.PendingAction;
                Assert.That(pendingAction, Is.Not.Null, "After playing 2 cat cards, there should be a pending action");
                Assert.That(pendingAction.IsExecuted, Is.True,
                    "After playing 2 cat cards and all players confirming not noping, the action should be executed");

                Card? pickedCard = cardsBeforeSteal.Except(targetPlayer.Hand.Cards).FirstOrDefault();
                Assert.That(pickedCard, Is.Not.Null, "After executing a 'StealRandomCard' action, the target player should have lost exactly one card from their hand");
                TestContext.Out.WriteLine($"Player '{playerToPlay.Name}' steals '{pickedCard}' card from '{targetPlayer.Name}'");

                Assert.That(playerToPlay.Hand.Contains(pickedCard.Value), Is.True,
                    "After the 'StealRandomCard' action has been executed, the hand of the player who played the cat cards should contain the stolen card");
                Assert.That(targetPlayer.Hand.Cards.Count, Is.EqualTo(cardsBeforeSteal.Count - 1),
                    "After the 'StealRandomCard' action has been executed, the hand of the target player should contain one card less");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.False, "After playing a 'StealRandomCard' action, the turn should not advance to the next player");
                Assert.That(game.PendingDraws, Is.EqualTo(1),
                    "After playing a 'StealRandomCard' action, the number of pending draws should remain the same");
            }
            else
            {
                DrawCard(game, playerToPlay);
                numberOfTurns++;

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
        }
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("Shuffle,BeardCat,TacoCat,BeardCat,BeardCat",
       "TacoCat,TacoCat,TacoCat",
       "SeeTheFuture,BeardCat",
       "SeeTheFuture,Shuffle")]
    public void ThreePlayerGame_Play3IdenticalCatCards_TargetPlayerHasTheRequestedCard(
       string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < 3)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            if (playerToPlay.Hand.Contains(Card.TacoCat))
            {
                IPlayer targetPlayer = GetTargetPlayerForReceivingCardAction(game, playerToPlay.Id);
                var cardsBeforeSteal = new List<Card>(targetPlayer.Hand.Cards);
                IAction stealCardAction = PlayCardsWithoutNoping<StealSpecificCardAction>(game, playerToPlay, [Card.TacoCat, Card.TacoCat, Card.TacoCat], targetPlayer, Card.SeeTheFuture, null, false) as IAction;
                Assert.That(stealCardAction.CanBeNoped, Is.True, "A 'StealSpecificCard' action should be noppable");

                IAction? pendingAction = game.PendingAction;
                Assert.That(pendingAction, Is.Not.Null, "After playing 3 cat cards, there should be a pending action");
                Assert.That(pendingAction.IsExecuted, Is.True,
                    "After playing 3 cat cards and all players confirming not noping, the action should be executed");

                Card? pickedCard = cardsBeforeSteal.Except(targetPlayer.Hand.Cards).FirstOrDefault();
                Assert.That(pickedCard, Is.EqualTo(Card.SeeTheFuture), "After executing a 'StealSpecificCard' action, the target player should have lost the requested card");
                TestContext.Out.WriteLine($"Player '{playerToPlay.Name}' steals '{pickedCard}' card from '{targetPlayer.Name}'");

                Assert.That(playerToPlay.Hand.Contains(pickedCard.Value), Is.True,
                    "After the 'StealSpecificCard' action has been executed, the hand of the player who played the cat cards should contain the stolen card");
                Assert.That(targetPlayer.Hand.Cards.Count, Is.EqualTo(cardsBeforeSteal.Count - 1),
                    "After the 'StealSpecificCard' action has been executed, the hand of the target player should contain one card less");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.False, "After playing a 'StealSpecificCard' action, the turn should not advance to the next player");
                Assert.That(game.PendingDraws, Is.EqualTo(1),
                    "After playing a 'StealSpecificCard' action, the number of pending draws should remain the same");
            }
            else
            {
                DrawCard(game, playerToPlay);
                numberOfTurns++;

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
        }
        WriteGameSituation(game);
    }

    [MonitoredTest]
    [TestCase("Shuffle,BeardCat,TacoCat,BeardCat,BeardCat",
       "TacoCat,TacoCat,TacoCat",
       "SeeTheFuture,BeardCat",
       "SeeTheFuture,Shuffle")]
    public void ThreePlayerGame_Play3IdenticalCatCards_TargetPlayerDoesNotHaveTheRequestedCard(
       string drawPileCards, string player1Hand, string player2Hand, string player3Hand)
    {
        IGame game = CreateGameWithCustomCards(drawPileCards, player1Hand, player2Hand, player3Hand);

        int numberOfTurns = 0;
        int previousDrawPileCardCount = game.DrawPile.CardCount;

        while (numberOfTurns < 3)
        {
            IPlayer playerToPlay = GetPlayerToPlay(game);
            Assert.That(playerToPlay.Eliminated, Is.False, "The player to play should not be marked as eliminated");

            if (playerToPlay.Hand.Contains(Card.TacoCat))
            {
                IPlayer targetPlayer = GetTargetPlayerForReceivingCardAction(game, playerToPlay.Id);
                var cardsBeforeSteal = new List<Card>(targetPlayer.Hand.Cards);
                IAction stealCardAction = PlayCardsWithoutNoping<StealSpecificCardAction>(game, playerToPlay, [Card.TacoCat, Card.TacoCat, Card.TacoCat], targetPlayer, Card.Defuse, null, false) as IAction;
                Assert.That(stealCardAction.CanBeNoped, Is.True, "A 'StealSpecificCard' action should be noppable");

                IAction? pendingAction = game.PendingAction;
                Assert.That(pendingAction, Is.Not.Null, "After playing 3 cat cards, there should be a pending action");
                Assert.That(pendingAction.IsExecuted, Is.True,
                    "After playing 3 cat cards and all players confirming not noping, the action should be executed");

                Assert.That(targetPlayer.Hand.Cards, Is.EquivalentTo(cardsBeforeSteal), "After executing a 'StealSpecificCard' action, asking for a card the target player doesn't have, the target player should not have lost any cards");
                TestContext.Out.WriteLine($"Player '{playerToPlay.Name}' fails to steal '{Card.Defuse}' card from '{targetPlayer.Name}'");

                bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
                Assert.That(turnAdvanced, Is.False, "After playing a 'StealSpecificCard' action, the turn should not advance to the next player");
                Assert.That(game.PendingDraws, Is.EqualTo(1),
                    "After playing a 'StealSpecificCard' action, the number of pending draws should remain the same");
            }
            else
            {
                DrawCard(game, playerToPlay);
                numberOfTurns++;

                Assert.That(game.DrawPile.CardCount, Is.EqualTo(previousDrawPileCardCount - 1),
                    "After drawing a card, the draw pile should have one less card");
                previousDrawPileCardCount = game.DrawPile.CardCount;
            }
        }
        WriteGameSituation(game);
    }

    private static IPlayer GetTargetPlayerForReceivingCardAction(IGame game, Guid actingPlayerId)
    {
        List<IPlayer> candidates = game.Players.Where(p => p.Id != actingPlayerId && !p.Eliminated).ToList();
        Assert.That(candidates.Count, Is.GreaterThan(0), "There should be at least one valid target player for an action to receive a card");
        return Random.Shared.NextItem(candidates);
    }

    private static IPlayer GetPlayerToPlay(IGame game)
    {
        return game.GetPlayerById(game.PlayerToPlayId);
    }

    private static void DrawCard(IGame game, IPlayer playerToPlay)
    {
        int numberOfPendingDrawsBeforeDraw = game.PendingDraws;

        game.DrawCard(playerToPlay.Id);

        TestContext.Out.WriteLine($"Player '{playerToPlay.Name}' draws a card");

        bool turnAdvanced = game.PlayerToPlayId != playerToPlay.Id;
        if (turnAdvanced)
        {
            Assert.That(game.PendingDraws, Is.GreaterThan(0),
                "After advancing the turn, the number of pending draws should be greater than 0");
        }
        else
        {
            Assert.That(game.PendingDraws, Is.EqualTo(numberOfPendingDrawsBeforeDraw - 1),
                "After drawing a card, the number of pending draws should have decreased by 1 if the turn stays with the same player");
        }
    }

    private static void ConfirmNotNopingByOtherPlayers(IGame game, Guid actingPlayerId)
    {
        foreach (IPlayer player in game.Players)
        {
            if (player.Id != actingPlayerId)
            {
                TestContext.Out.WriteLine($"Player '{player.Name}' confirms not noping the action");
                game.ConfirmNotNopingPendingAction(player.Id);
            }
        }
    }

    private static void NopeThePendingAction(IGame game, Guid actingPlayerId)
    {
        var players = game.Players.Shuffle().ToList();
        foreach (IPlayer player in players)
        {
            if (player.Id != actingPlayerId)
            {
                if (!game.PendingAction!.IsNoped)
                {
                    if (player.Hand.Contains(Card.Nope))
                    {
                        int nopeCardsBeforeNoping = player.Hand.Cards.Count(c => c == Card.Nope);
                        game.NopePendingAction(player.Id);
                        TestContext.Out.WriteLine($"Player '{player.Name} (id: {player.Id})' has noped the action");
                        Assert.That(player.Hand.Cards.Count(c => c == Card.Nope), Is.EqualTo(nopeCardsBeforeNoping - 1),
                            "After noping a pending action, the nope card should have been removed from the player's hand");
                    }
                    else
                    {
                        game.ConfirmNotNopingPendingAction(player.Id);
                        TestContext.Out.WriteLine($"Player '{player.Name} (id: {player.Id})' has no nope cards");
                    }
                }
                else
                {
                    game.ConfirmNotNopingPendingAction(player.Id);
                    TestContext.Out.WriteLine($"Player '{player.Name} (id: {player.Id})' decided not to nope");
                }

            }
        }
        TestContext.Out.WriteLine($"Nope decisions: {string.Join(", ", game.PendingAction!.PlayerNopeDecisions.Select(d => d.ToString()))}");
    }

    private static ExpectedActionType PlayCardWithoutNoping<ExpectedActionType>(
        IGame game, IPlayer playerToPlay, Card card, IPlayer? targetPlayer = null, Card? targetCard = null, int? drawPileIndex = null, bool expectActionToBeExecuted = true) where ExpectedActionType : class
    {
        return PlayCardsWithoutNoping<ExpectedActionType>(game, playerToPlay, [card], targetPlayer, targetCard, drawPileIndex, expectActionToBeExecuted);
    }

    private static ExpectedActionType PlayCardsWithoutNoping<ExpectedActionType>(
       IGame game, IPlayer playerToPlay, List<Card> cards, IPlayer? targetPlayer = null, Card? targetCard = null, int? drawPileIndex = null, bool expectActionToBeExecuted = true) where ExpectedActionType : class
    {
        TestContext.Out.WriteLine($"Player '{playerToPlay.Name}' is playing cards '{string.Join(", ", cards)}'" +
                                  $"{(targetPlayer != null ? $" targeting player '{targetPlayer.Name}'" : "")}" +
                                  $"{(targetCard != null ? $" targeting card '{targetCard}'" : "")}" +
                                  $"{(drawPileIndex != null ? $" with draw pile index {drawPileIndex}" : "")}");

        int numberOfCardsInHandBefore = playerToPlay.Hand.Cards.Count;

        game.PlayAction(playerToPlay.Id, cards, targetPlayer?.Id, targetCard, drawPileIndex);

        Assert.That(playerToPlay.Hand.Cards.Count, Is.LessThan(numberOfCardsInHandBefore),
            $"After playing {cards.Count} card(s), the player's hand should have less cards");

        Assert.That(game.DiscardPile.Last(), Is.EqualTo(cards.Last()), $"After playing a '{cards.Last()}' card, it should be the last card in the discard pile");

        IAction? pendingAction = game.PendingAction;
        Assert.That(pendingAction, Is.Not.Null, $"After playing a {typeof(ExpectedActionType).Name} card, there should be a pending '{typeof(ExpectedActionType).Name}'");

        if (pendingAction.CanBeNoped)
        {
            Assert.That(pendingAction.IsExecuted, Is.False,
                "After playing an attack card, the pending action should not be executed yet (other players might nope)");

            ConfirmNotNopingByOtherPlayers(game, playerToPlay.Id);

            if (expectActionToBeExecuted)
            {
                Assert.That(pendingAction.IsExecuted, Is.True,
                    $"When all players have confirmed not noping the {typeof(ExpectedActionType).Name} action, it should be executed");
            }
        }
        else
        {
            Assert.That(pendingAction.IsExecuted, Is.True,
                $"A '{typeof(ExpectedActionType).Name}' action that cannot be noped should be executed immediately");
        }

        return pendingAction as ExpectedActionType;
    }

    private IGame CreateGameWithCustomCards(string drawPileCards, params string[] playerHands)
    {
        TestContext.Out.WriteLine("Starting situation:");
        TestContext.Out.WriteLine($"Draw pile cards (top to bottom): {drawPileCards}");

        Assert.That(playerHands.Length, Is.EqualTo(_players.Length),
            "The number of hand definitions must match the number of players.");

        ICardDeck drawPile = new CardDeck(ParseCards(drawPileCards)) as ICardDeck;

        for (int i = 0; i < _players.Length; i++)
        {
            TestContext.Out.WriteLine($"{_players[i].Name} hand: {playerHands[i]}");
            ArrangePlayerHand(_players[i], playerHands[i]);
        }

        IActionFactory actionFactory = new ActionFactory();
        TestContext.Out.WriteLine("--------------------");
        return new Game(Guid.NewGuid(), _players, drawPile, _player1.Id, actionFactory) as IGame;
    }

    private static void WriteGameSituation(IGame game)
    {
        TestContext.Out.WriteLine("--------------------");
        TestContext.Out.WriteLine("Game situation:");
        TestContext.Out.WriteLine($"Draw pile has {game.DrawPile.CardCount} cards");
        foreach (IPlayer player in game.Players)
        {
            TestContext.Out.WriteLine($"Player '{player.Name}' (eliminated: {player.Eliminated}) hand: {string.Join(",", player.Hand.Cards)}");
        }
        TestContext.Out.WriteLine($"Discard pile (bottom to top): {string.Join(",", game.DiscardPile)}");
        TestContext.Out.WriteLine("--------------------");
    }

    private static IList<Card> ParseCards(string cards)
    {
        return cards.Split(',').Select(Enum.Parse<Card>).ToList();
    }

    private static void ArrangePlayerHand(IPlayer player, string hand)
    {
        IList<Card> cards = ParseCards(hand);
        foreach (Card card in cards)
        {
            player.Hand.InsertCard(card);
        }
    }
}