using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;
using System.Reflection.Emit;

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
        ITable table = _tableFactory.CreateNewForUser(user, preferences);
        _tableRepository.Add(table);
        return table;
    }

    public ITable JoinTable(Guid tableId, User user)
    {
       ITable table = _tableRepository.Get(tableId);
       table.Join(user);

       return table;
    }

    public void LeaveTable(Guid tableId, User user)
    {
        ITable table = _tableRepository.Get(tableId);
        table.Leave(user.Id);

        if (table.SeatedPlayers.Count == 0)
        {
            _tableRepository.Remove(tableId);
        }
    }

    public IGame StartGameForTable(Guid tableId)
    {
        ITable table = _tableRepository.Get(tableId);

        if (table.HasAvailableSeat)
        {
            throw new InvalidOperationException("Er zijn niet genoeg spelers aan de tafel.");
        }

        IGame game = _gameFactory.CreateNewForTable(table);
        table.GameId = game.Id;
        _gameRepository.Add(game);
        return game;
    }
}