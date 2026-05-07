using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITableManager"/>
internal class TableManager : ITableManager
{
    private readonly ITableRepository _tableRepository;
    private readonly ITableFactory _tableFactory;
    private readonly IGameRepository _gameRepository;
    private readonly IGameFactory _gameFactory;

    public TableManager(
        ITableRepository tableRepository,
        ITableFactory tableFactory,
        IGameRepository gameRepository,
        IGameFactory gameFactory)
    {
        _tableRepository = tableRepository;
        _tableFactory = tableFactory;
        _gameRepository = gameRepository;
        _gameFactory = gameFactory;
    }

    public ITable CreateTable(User user, ITablePreferences preferences)
    {
        ITable newTable = _tableFactory.CreateNewForUser(user, preferences);
        _tableRepository.Add(newTable);
        return newTable;
    }

    public ITable JoinTable(Guid tableId, User user)
    {
       ITable tableToJoin = _tableRepository.Get(tableId);        
        foreach (IPlayer SeatedPlayer in tableToJoin.SeatedPlayers)
        {
            if (SeatedPlayer.Id == user.Id)
            {
                return tableToJoin;
            };
        }
        tableToJoin.Join(user);
        return tableToJoin;
    }

    public void LeaveTable(Guid tableId, User user)
    {
        ITable tableToLeave = _tableRepository.Get(tableId);
        tableToLeave.Leave(user.Id);

        if (tableToLeave.SeatedPlayers.Count == 0)
        {
            _tableRepository.Remove(tableId);
        }
    }

    public IGame StartGameForTable(Guid tableId)
    {
        ITable tableToStart = _tableRepository.Get(tableId);

        if (tableToStart.HasAvailableSeat)
        {
            throw new InvalidOperationException("Er zijn niet genoeg spelers aan de tafel.");
        }

        IGame newGame = _gameFactory.CreateNewForTable(tableToStart);
        tableToStart.GameId = newGame.Id;
        _gameRepository.Add(newGame);
        return newGame;
    }
}