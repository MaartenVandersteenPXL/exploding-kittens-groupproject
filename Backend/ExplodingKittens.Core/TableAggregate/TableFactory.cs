using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITableFactory"/>
internal class TableFactory : ITableFactory
{
    IGamePlayStrategy _gamePlayStrategy;
    public TableFactory(IGamePlayStrategy gamePlayStrategy)
    {
        this._gamePlayStrategy = gamePlayStrategy;
    }

    public ITable CreateNewForUser(User user, ITablePreferences preferences)
    {
        ITable table = new Table(Guid.NewGuid(), preferences);
        table.Join(user);
        return table;
    }
}
