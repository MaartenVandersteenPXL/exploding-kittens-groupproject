using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <summary>Target player gives you a card of their choice. Target chooses which card to give.</summary>
internal class FavorAction: ActionBase
{
    private readonly IGame _game;
    private Guid _playerId;
    private Guid _targetPlayerId;

    public FavorAction(IGame game, Guid playerId, Guid targetPlayerId): base (game, playerId, cards [], true )
    {
        _game = game;
        _playerId = playerId;
        _targetPlayerId = targetPlayerId;
    }

    protected override void Execute()
    {
        throw new NotImplementedException();
    }

}
