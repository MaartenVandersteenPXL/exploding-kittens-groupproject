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
        _gamePlayStrategy = gamePlayStrategy;

    }

    public ITable CreateNewForUser(User user, ITablePreferences preferences)
    {
        ITable createdTable = new Table(Guid.NewGuid(), preferences);
        createdTable.Join(user);

        // Laat virtuele spelers toe om aan tafel aan te schuiven indien dit is gespecificeerd in de voorkeuren.
        for (int i = 0; i < preferences.NumberOfArtificialPlayers; i++)
        {
            createdTable.LetArtificialPlayersJoin(_gamePlayStrategy);
        }

        return createdTable;
    }
}
