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
       ITable table = new Table(user.Id, preferences) as ITable;
        for (int i = 0; i < preferences.NumberOfArtificialPlayers; i++)
        {
            table.LetArtificialPlayersJoin(this._gamePlayStrategy);
        }
        return table;
    }
}