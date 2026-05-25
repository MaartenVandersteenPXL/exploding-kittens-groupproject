using ExplodingKittens.Core.ActionAggregate.Contracts;
using ExplodingKittens.Core.CardAggregate;
using ExplodingKittens.Core.GameAggregate.Contracts;

namespace ExplodingKittens.Core.ActionAggregate;

/// <inheritdoc cref="IActionFactory"/>
internal class ActionFactory : IActionFactory
{
    
    public IAction Create(
        IGame game, 
        Guid playerId, 
        IReadOnlyList<Card> cards, 
        Guid? targetPlayerId, 
        Card? targetCard,
        int? drawPileIndex = null
        )
    {
        
        if(cards.Count == 1)
        {
            Card topCard = cards.FirstOrDefault();
            switch (topCard)
            {
                case Card.Defuse:
                    if ( drawPileIndex == null)
                    {
                        throw new InvalidOperationException("To create a 'Defuse' action, a draw pile index must be specified");
                    }
                    else if (targetCard != Card.ExplodingKitten)
                    {
                        throw new InvalidOperationException("To create a 'Defuse' action, the target card must be an exploding kitten");
                    }
                    else return new DefuseAction(game, playerId, drawPileIndex.Value);

                case Card.Skip:
                    return new SkipAction(game, playerId);

                case Card.Attack:
                    return new AttackAction(game, playerId);
                
                case Card.Favor:
                    if(targetPlayerId == null){
                        throw new InvalidOperationException("A target player must be specified for a 'Favor' action");
                    };
                    return new FavorAction(game, playerId, targetPlayerId.Value);

                case Card.Shuffle:
                    return new ShuffleAction(game, playerId);

                case Card.SeeTheFuture:
                    return new SeeTheFutureAction(game, playerId);

                case Card.Nope:
                    throw new InvalidOperationException("A 'Nope' card cannot be used to create an action");
                
                default:
                    throw new InvalidOperationException("At least one card must be provided");
            }
        }



        else if(IsValidCatCardCombination(cards) && cards.All(IsSpecialCatCard))
        {
            if (cards.Count == 2)
            {
                if (targetPlayerId == null)
                {
                    throw new InvalidOperationException("A target player must be specified for a 'Steal random card' action");
                }
                return new StealRandomCardAction(game, playerId, cards, targetPlayerId.Value);
            }
            else if (cards.Count == 3)
            {
                if (targetPlayerId == null || targetCard == null)
                {
                    throw new InvalidOperationException("A target player or target card must be specified for a 'Steal specific card' action");
                }
                return new StealSpecificCardAction(game, playerId, cards, targetCard.Value, targetPlayerId.Value);     
            }
            else throw new InvalidOperationException("More then three cards are provided");
        }
        else throw new InvalidOperationException("At least one card must be provided");
    
    }

    
    private static bool IsSpecialCatCard(Card card)
    {
        return (int)card >= 100 && (int)card <= 104;
    }

    private static bool IsValidCatCardCombination(IReadOnlyList<Card> cards)
    {
        return cards.Distinct().Count() == 1 || (cards.Count == 3 && cards.Distinct().Count() == 3);
    }
}
