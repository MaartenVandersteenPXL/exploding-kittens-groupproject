using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>Target player gives you a card of their choice. Target chooses which card to give.</summary>
internal class FavorAction: ActionBase
{
    private readonly IGame _game;

    public FavorAction(IGame game, Guid playerId, Guid targetPlayerId): 
        base (game, playerId, cards: [], canBeNoped: true, targetCard: null, targetPlayerId: targetPlayerId, drawPileIndex: null )
    {
        _game = game;
    }

    protected override void Execute()
    {
        IPlayer targetPlayer = _game.GetPlayerById(TargetPlayerId!.Value);
        IPlayer player = _game.GetPlayerById(PlayerId);
        Card targetPlayerPickedCard = targetPlayer.Hand.PickSpecificCard(TargetCard!);
        player.Hand.InsertCard((Card)targetPlayerPickedCard);
    }

}
