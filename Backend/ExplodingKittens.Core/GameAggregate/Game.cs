using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.CardAggregate.Contracts;
using ExplodingKittens.Core.GameAggregate.Contracts;
using ExplodingKittens.Core.PlayerAggregate.Contracts;

namespace ExplodingKittens.Core.GameAggregate;

/// <inheritdoc cref="IGame"/>
internal class Game : IGame
{
    /// <summary>
    /// Creates a new game. Does not deal cards or set first player; use <see cref="IGameFactory"/> for full setup.
    /// </summary>
    private Guid _id;
    private IPlayer[] _players;
    private ICardDeck _drawPile;
    private Guid _playerToPlayId;
    private IActionFactory _actionFactory;
    private IList<Card> _discardPile = new List<Card>();
    private int _pendingDraws = 1;
    private IAction? _pendingAction = null;

    public Game(Guid id, IPlayer[] players, ICardDeck drawPile, Guid startingPlayerId, IActionFactory actionFactory)
    {
        _id = id;
        _players = players;
        _drawPile = drawPile;
        _playerToPlayId = startingPlayerId;
        _actionFactory = actionFactory;
    }

    public Guid Id => _id;

    public IPlayer[] Players => _players;

    public Guid PlayerToPlayId => _playerToPlayId;

    public IList<Card> DiscardPile => _discardPile;

    public ICardDeck DrawPile => _drawPile;

    public int PendingDraws { get => _pendingDraws; set => _pendingDraws = value; }

    public IAction? PendingAction => _pendingAction;

    public bool HasEnded => _players.Count(p => !p.Eliminated) <= 1;

    public void AdvanceTurn()
    {
        if (_pendingDraws > 0)
        {
            throw new InvalidOperationException("Je kunt de beurt niet beëindigen zolang er nog kaarten getrokken moeten worden.");
        }
        else
        {
            /// Beurt wisselen naar de volgende speler die nog niet is geëlimineerd
            int currentPlayerIndex = Array.FindIndex(_players, player => player.Id == _playerToPlayId);
            int nextPlayerIndex = (currentPlayerIndex + 1) % _players.Length;
            while (_players[nextPlayerIndex].Eliminated)
            {
                nextPlayerIndex = (nextPlayerIndex + 1) % _players.Length;
            }
            _playerToPlayId = _players[nextPlayerIndex].Id;

            _pendingDraws = 1;
        }
    }

    public void ConfirmNotNopingPendingAction(Guid playerId)
    {
        if (_pendingAction == null)
        {
            throw new InvalidOperationException("Er is geen actie in behandeling.");
        }
        _pendingAction.ConfirmNotNoping(playerId);
        if (_pendingAction.IsExecuted)
        {
            _pendingAction = null;
        }
    }

    public void DrawCard(Guid playerId)
    {
        // 1. Validatie: Is de juiste speler aan de beurt?
        if (playerId != _playerToPlayId)
        {
            throw new InvalidOperationException("Het is niet jouw beurt.");
        }

        // 2. Validatie: Er mag geen actie (zoals een Favor) op antwoord wachten
        if (_pendingAction != null)
        {
            throw new InvalidOperationException("Er is nog een actie in behandeling. Behandel deze eerst.");
        }

        IPlayer currentPlayer = GetPlayerById(playerId);
        Card drawnCard = _drawPile.DrawTopCard();

        if (drawnCard == Card.ExplodingKitten)
        {
            if (currentPlayer.Hand.Contains(Card.Defuse))
            {
                // --- SPELER OVERLEEFT ---
                // Defuse gebruiken en naar de aflegstapel
                currentPlayer.Hand.PickSpecificCard(Card.Defuse);
                _discardPile.Add(Card.Defuse);

                // Kitten terug in het deck
                _drawPile.InsertCard(Card.ExplodingKitten, 0);
                _drawPile.Shuffle();

                // Het trekken van een kitten (en defusen) telt als één voltooide trekbeurt
                _pendingDraws--;
            }
            else
            {
                // --- SPELER ONTPLOFT ---
                // De kitten gaat in de hand (waardoor de property 'Eliminated' op true springt)
                currentPlayer.Hand.InsertCard(drawnCard);

                // Beurt stopt onmiddellijk, ongeacht hoeveel draws er nog over waren
                _pendingDraws = 0;
            }
        }
        else
        {
            // --- NORMALE KAART ---
            currentPlayer.Hand.InsertCard(drawnCard);
            _pendingDraws--;
        }

        // 3. Beurtwissel afhandelen
        if (_pendingDraws <= 0)
        {
            // We zetten draws op 0 zodat AdvanceTurn() niet throwt
            _pendingDraws = 0;
            AdvanceTurn();
        }
    }

    public IPlayer GetPlayerById(Guid playerId)
    {
        //Zoekt de speler met de gegeven ID en retourneert deze. Gooi een fout als er geen speler is met die ID.
        foreach (IPlayer player in _players)
        {
            if (player.Id == playerId)
            {
                return player;
            }
        }
        throw new InvalidOperationException("Speler niet gevonden");
    }

    public void NopePendingAction(Guid playerId)
    {
        //Controleert of er een actie in behandeling is
        if (_pendingAction == null)
        {
            throw new InvalidOperationException("Er is geen actie in behandeling.");
        }
        //Controleert of de speler een 'Nope' kaart in zijn hand heeft
        if (!GetPlayerById(playerId).Hand.Contains(Card.Nope))
        {
            throw new InvalidOperationException("Je hebt geen 'Nope' kaart in je hand.");
        }
        //Haalt de 'Nope' kaart uit de hand van de speler en legt deze op de aflegstapel
        GetPlayerById(playerId).Hand.PickSpecificCard(Card.Nope);
        _discardPile.Add(Card.Nope);

        //Voert de 'Nope' actie uit op de actie in behandeling
        _pendingAction.Nope(playerId);
        if (_pendingAction.IsExecuted)
        {
            _pendingAction = null;
        }
    }

    public void PlayAction(Guid playerId, IReadOnlyList<Card> cards, Guid? targetPlayerId, Card? targetCard, int? drawPileIndex)
    {
        //Controleert of het de speler aan de beurt is
        if (playerId != _playerToPlayId)
        {
            throw new InvalidOperationException("Het is niet jouw beurt.");
        }
        //Controleert of er al een actie bezig is
        if (_pendingAction != null)
        {
            throw new InvalidOperationException("Er is nog een actie in behandeling. Je moet deze eerst bevestigen of nopen voordat je een kaart kunt spelen.");
        }
        //Controleert of de speler de kaarten in zijn hand heeft
        foreach (Card card in cards)
        {
            if (!GetPlayerById(playerId).Hand.Contains(card))
            {
                throw new InvalidOperationException($"Je hebt de kaart {card} niet in je hand.");
            }
        }
        //Haalt de kaart uit de hand van de speler
        foreach (Card card in cards)
        {
            //Legt de kaart op de aflegstapel
            GetPlayerById(playerId).Hand.PickSpecificCard(card);
            _discardPile.Add(card);
        }

        IAction action = _actionFactory.Create(this, playerId, cards, targetPlayerId, targetCard, drawPileIndex);

        // Als de actie genoped kan worden, blijft deze in behandeling totdat alle spelers hebben bevestigd dat ze niet nopen of totdat iemand nopt
        if (action.CanBeNoped)
        {
            _pendingAction = action;
        }
        else
        {
            // Direct uitvoeren voor alle spelers (nodig voor o.a. Defuse)
            foreach (IPlayer player in _players)
            {
                action.ConfirmNotNoping(player.Id);
            }
            _pendingAction = null;
        }
    }

    
    public void SelectCardToGiveAsAFavor(Guid playerId, Card card)
    {
        if (_pendingAction == null)
        {
            throw new InvalidOperationException("Er is geen actie in behandeling.");
        }
        // Voegt de geselecteerde kaart toe aan de actie in behandeling en bevestigt dat de speler niet nopt
        _pendingAction.TargetCard = card;
        _pendingAction.ConfirmNotNoping(playerId);
        if (_pendingAction.IsExecuted)
        {
            _pendingAction = null;
        }
    }
}