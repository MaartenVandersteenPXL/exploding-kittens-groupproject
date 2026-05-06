using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>Target player gives you a card of their choice. Target chooses which card to give.</summary>
internal class FavorAction : ActionBase
{
    public FavorAction(IGame game, Guid playerId, Guid targetPlayerId) :
        base(game, playerId, new List<Card> { Card.Favor }, canBeNoped: true, targetCard: null, targetPlayerId: targetPlayerId, drawPileIndex: null)
    { }


    protected override void Execute()
    {
        if (!TargetPlayerId.HasValue || !TargetCard.HasValue)
        {
            return;
        }

        IPlayer targetPlayer = CurrentGame.GetPlayerById(TargetPlayerId.Value);
        IPlayer player = CurrentGame.GetPlayerById(PlayerId);
        Card? targetPlayerPickedCard = targetPlayer.Hand.PickSpecificCard(TargetCard.Value);

        if (targetPlayerPickedCard.HasValue)
        {
            player.Hand.InsertCard(targetPlayerPickedCard.Value);
        }
        // AANPASSINGEN:
        // 1. PickRandomCard verwijderd: Volgt nu de officiële regels (slachtoffer kiest, geen automatisme).
        // 2. Null-checks toegevoegd: Voorkomt crashes (NullReferenceExceptions) als TargetCard of kaartselectie leeg is.
        // 3. Data-validatie: De actie stopt nu netjes als de benodigde input (wie/wat) nog ontbreekt.
    }

}
