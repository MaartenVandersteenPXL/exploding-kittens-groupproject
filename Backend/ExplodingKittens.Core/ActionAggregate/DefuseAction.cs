using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using System.Data;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>
/// Defuse an Exploding Kitten: place it back in the draw pile at the chosen index.
/// The turn is over after playing this card
/// </summary>
internal class DefuseAction : ActionBase
{
    public DefuseAction(IGame game, Guid playerId, int drawPileIndex) : base(game, playerId, new List<Card> { Card.Defuse }, canBeNoped: false, targetCard: null, targetPlayerId: null, drawPileIndex: drawPileIndex)
    {

    }
    protected override void Execute()
    {
        IPlayer player = CurrentGame.GetPlayerById(PlayerId);

        player.Hand.PickSpecificCard(Card.ExplodingKitten);
        
        CurrentGame.DrawPile.InsertCard(Card.ExplodingKitten, DrawPileIndex!.Value);
        CurrentGame.PendingDraws = 0;
        CurrentGame.AdvanceTurn();

    }
}
