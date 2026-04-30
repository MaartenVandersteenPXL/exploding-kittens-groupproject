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

    public Guid PlayerId
    {
        get
        {
            return _playerId;
        }
    }
        
        
        // => throw new NotImplementedException();

    public IReadOnlyList<Card> Cards
    {
        get
        {
            return _cards;
        }
    }
        
        
        //=> throw new NotImplementedException();

    public bool CanBeNoped
    {
        get
        {
            return _canBeNoped;
        }
    } 
        
        
        //=> throw new NotImplementedException();

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
            
            
   //=> throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public int? DrawPileIndex
    {
        get
        {
            return _drawPileIndex;
        }
    } 
        
        
        //=> throw new NotImplementedException();

    public IReadOnlyDictionary<Guid, NopeDecision> PlayerNopeDecisions
    {
        get
        {

        }
        set
        {
            _playerNopeDecisions = _game.Players.ToDictionary(p => p.Id, p => NopeDecision.NotDecided);
        }
    }
        
        
        //=> throw new NotImplementedException();

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


    // => throw new NotImplementedException();

    public bool IsExecuted
    {
        get
        {

            return _isExecuted;
        }
    }

    /// <summary>
    /// TRUE if the action has been executed.
    /// ALSO TRUE if the action is 'noped' and all players have confirmed that they are not 'noping' it.
    /// FALSE otherwise.
    /// </summary>
    // => throw new NotImplementedException();

    public void ConfirmNotNoping(Guid notNopingPlayerId)
    {
        _playerNopeDecisions[notNopingPlayerId] = NopeDecision.NotNoping;
        int count = 0;

        foreach (KeyValuePair<Guid, NopeDecision> decision in _playerNopeDecisions)
        {
            if (decision.Value == NopeDecision.NotNoping)
            {
                count++;
            }
        }
        if(_playerNopeDecisions.Count == count)
            {
                _isExecuted = true;
            }


        /// <summary>
        /// Confirms that the specified player chooses not to 'Nope' this action.
        /// </summary>
        /// <param name="notNopingPlayerId">Unique identifier of a player</param>
        //throw new NotImplementedException();
    }

    public void Nope(Guid nopingPlayerId)
    {
        var keys = _playerNopeDecisions.Keys;
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

        /// <summary>
        /// When the action is not 'noped' yet:
        ///    - Records that the specified player 'Nopes' this action.
        ///    - Resets the 'Nope' decisions of all other players
        /// When the action is already 'noped', the 'nope' should be undone and thus:
        ///    - Records that the specified player is not 'Noping' this action.
        ///    - Resets the 'Nope' decisions of all other players.
        /// </summary>
        //throw new NotImplementedException();
    }

    /// <summary>
    /// Classes that inherit from ActionBase should implement this method to execute the specific logic of the action.
    /// </summary>
    protected abstract void Execute();
}