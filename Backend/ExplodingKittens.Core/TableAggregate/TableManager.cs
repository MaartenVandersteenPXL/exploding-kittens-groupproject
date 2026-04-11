using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
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
        ITable table = this._tableFactory.CreateNewForUser(user, preferences);
        this._tableRepository.Add(table);
        return table;
    }

    public ITable JoinTable(Guid tableId, User user)
    {
       ITable table = this._tableRepository.Get(tableId);
       table.Join(user);

       return table;
    }

    public void LeaveTable(Guid tableId, User user)
    {
        this._tableRepository.Get(tableId).Leave(user.Id);
    }

    public IGame StartGameForTable(Guid tableId)
    {
        IGame game = this._gameFactory.CreateNewForTable(this._tableRepository.Get(tableId));
        this._gameRepository.Add(game);

        return game;
    }
}