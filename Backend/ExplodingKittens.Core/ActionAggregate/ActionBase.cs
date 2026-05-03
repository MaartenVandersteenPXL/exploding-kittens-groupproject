using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;
using System.ComponentModel.Design;
using System.Runtime.CompilerServices;

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
    private bool _isExecuted;
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

    protected IGame Game
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
            

            foreach (KeyValuePair<Guid, NopeDecision> decision in _playerNopeDecisions)
            {
                if (decision.Value == NopeDecision.Nope)
                {
                    return true;
                }
            }
            return false;
            
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
        int countnotnoping = 0;
       

        foreach (KeyValuePair<Guid, NopeDecision> decision in _playerNopeDecisions)
        {
            if (decision.Value == NopeDecision.NotNoping)
            {
                countnotnoping++;
            }
            
        }
        if(_playerNopeDecisions.Count == countnotnoping )
            {
                _isExecuted = true;
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