using ExplodingKittens.Core.PlayerAggregate;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using ExplodingKittens.Core.TableAggregate.Contracts;
using ExplodingKittens.Core.UserAggregate;

namespace ExplodingKittens.Core.TableAggregate;

/// <inheritdoc cref="ITable"/>
internal class Table : ITable
{
    private readonly IList<IPlayer> _seatedPlayers = new List<IPlayer>();

    //Constructor
    internal Table(Guid id, ITablePreferences preferences)
    {
        Id = id;
        Preferences = preferences;
    }

    //Public Properties - Table info
    public Guid Id { get; }

    public ITablePreferences Preferences { get; }


    //Public Properties - Players
    public IReadOnlyList<IPlayer> SeatedPlayers => _seatedPlayers.AsReadOnly();

    public bool HasAvailableSeat => _seatedPlayers.Count < Preferences.NumberOfPlayers + Preferences.NumberOfArtificialPlayers;


    //Public Properties - Game
    public Guid GameId { get; set; } = Guid.Empty;


    //Public Functies
    public void Join(User user)
    {
        if (!HasAvailableSeat)
        {
            throw new InvalidOperationException("De tafel is vol.");
        }
        if (_seatedPlayers.Any(player => player.Id == user.Id))
        {
            throw new InvalidOperationException("Deze speler zit al aan de tafel.");
        }

        _seatedPlayers.Add(new HumanPlayer(user.Id, user.ToString(), user.BirthDate));


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
        _seatedPlayers.Add(new ComputerPlayer("AI Player " + _seatedPlayers.Count, gamePlayStrategy));
    }
}