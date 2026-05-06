using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <inheritdoc cref="IAction"/>
public abstract class ActionBase : IAction
{
    private IGame _game;
    private Guid _playerId;
    private IReadOnlyList<Card> _cards;
    private bool _canBeNoped;
    private Guid? _targetPlayerId;
    private Card? _targetCard;
    private int? _drawPileIndex;
    private Dictionary<Guid, NopeDecision> _playerNopeDecisions;
    private bool _isExecuted = false;
    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped)
    {
        _game = game;
        _playerId = playerId;
        _cards = cards;
        _canBeNoped = canBeNoped;
        _playerNopeDecisions = new Dictionary<Guid, NopeDecision>();
        foreach (IPlayer player in _game.Players)
        {
            _playerNopeDecisions.Add(player.Id, NopeDecision.NotDecided);
        }
        
    }

    protected ActionBase(IGame game, Guid playerId, IReadOnlyList<Card> cards, bool canBeNoped, Card? targetCard, Guid? targetPlayerId, int? drawPileIndex) : this(game, playerId, cards, canBeNoped)
    {
        _targetCard = targetCard;
        _targetPlayerId = targetPlayerId;
        _drawPileIndex = drawPileIndex;
    }

    protected IGame CurrentGame
    {
        get
        {
            return _game;
        }
    }

    public Guid PlayerId
    {
        get
        {
            return _playerId;
        }
    }
        
    public IReadOnlyList<Card> Cards
    {
        get
        {
            return _cards;
        }
    }
        
    public bool CanBeNoped
    {
        get
        {
            return _canBeNoped;
        }
    } 
        
    public Guid? TargetPlayerId
    {
        get
        {
            return _targetPlayerId;
        }
    }

    public Card? TargetCard
    {
        get
        {
            return _targetCard;
        }
        set
        {
            _targetCard = value;
        }
    }
            
    public int? DrawPileIndex
    {
        get
        {
            return _drawPileIndex;
        }
    } 
        
    public IReadOnlyDictionary<Guid, NopeDecision> PlayerNopeDecisions
    {
        get
        {
            return _playerNopeDecisions;
        }
    }
        
    public bool IsNoped
    {
        get
        {
            
            int check = _playerNopeDecisions.Count(x => x.Value == NopeDecision.Nope);
            if(check > 2)
            {
                _isExecuted = true;
                return false;
            }

            else if(_playerNopeDecisions.Values.Contains(NopeDecision.Nope)){

                return true;

            }
            else
            {
                _isExecuted = true;
                return false;
            }
        }
    }

    public bool IsExecuted
    {
        get
        {
            return _isExecuted;
        }
    }

    public void ConfirmNotNoping(Guid notNopingPlayerId)
    {
        _playerNopeDecisions[notNopingPlayerId] = NopeDecision.NotNoping;

        bool allDecided = true;
        foreach (KeyValuePair<Guid, NopeDecision> decision in _playerNopeDecisions)
        {
            if (decision.Value == NopeDecision.NotDecided)
            {
                allDecided = false;
                break;
            }
        }

        // Een actie is pas uitgevoerd (of afgehandeld) als iedereen beslist heeft.
        // Als er nog iemand op 'NotDecided' staat, MOET _isExecuted false zijn.
        _isExecuted = allDecided;

        if (allDecided && !IsNoped)
        {
            Execute();
        }
    }

    public void Nope(Guid nopingPlayerId)
    {
        ICollection<Guid> keys = _playerNopeDecisions.Keys;
        if (!IsNoped)
        {
            foreach (Guid key in keys)
            {
                if (key.Equals(nopingPlayerId))
                {
                    _playerNopeDecisions[key] = NopeDecision.Nope;
                } else
                {
                    _playerNopeDecisions[key] = NopeDecision.NotDecided;
                }
            }
           
        }
        else
        {
            foreach (Guid key in keys)
            {
                if (key.Equals(nopingPlayerId))
                {
                    _playerNopeDecisions[key] = NopeDecision.NotNoping;
                }
                else
                {
                    _playerNopeDecisions[key] = NopeDecision.NotDecided;
                }
            }
        }
    }



    protected abstract void Execute();
}