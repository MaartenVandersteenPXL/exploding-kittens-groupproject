using ExplodingKittens.Core.PlayerAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITable"/>
internal class Table: ITable
{
    Guid _id;
    ITablePreferences _preferences;
    IList<IPlayer> _seatedPlayers ;
    internal Table(Guid id, ITablePreferences preferences)
    {
        this._id = id;
        this._preferences = preferences;
        this._seatedPlayers = new List<IPlayer>();
        
    }

    public Guid Id => this._id;

    public ITablePreferences Preferences => this._preferences;

    public IReadOnlyList<IPlayer>? SeatedPlayers => _seatedPlayers as IReadOnlyList<IPlayer>;

    public bool HasAvailableSeat => this._seatedPlayers.ToArray().Length < this._preferences.NumberOfPlayers;

    public Guid GameId { get; set; } = Guid.Empty;

    public void Join(User user)
    {
        if (!HasAvailableSeat)
        {
            throw new InvalidOperationException("De tafel is vol.");
        }
        if(_seatedPlayers.Any(player => player.Id == user.Id))
        {
            throw new InvalidOperationException("Deze speler zit al aan de tafel.");
        }

        this._seatedPlayers.Add(new HumanPlayer(user.Id, user.ToString(), user.BirthDate));
        
       
    }

    public void Leave(Guid userId)
    {
        IPlayer? playerToRemove = _seatedPlayers.FirstOrDefault(player => player.Id == userId);

        if (playerToRemove == null)
        {
            throw new InvalidOperationException("Deze speler zit niet aan de tafel.");
        }

        _seatedPlayers.Remove(playerToRemove);
    }

    public void LetArtificialPlayersJoin(IGamePlayStrategy gamePlayStrategy)
    {
        this._seatedPlayers.Add(new ComputerPlayer("AI Player " + this._seatedPlayers.ToArray().Length, gamePlayStrategy));
    }
}