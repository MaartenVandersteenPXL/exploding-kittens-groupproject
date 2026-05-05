using ExplodingKittens.Core.CardAggregate.Contracts;

namespace ExplodingKittens.Core.CardAggregate;

/// <inheritdoc cref="ICardDeckFactory"/>
internal class CardDeckFactory : ICardDeckFactory
{
    public ICardDeck CreateStandardDeckWithoutExplodingKittens(int numberOfPlayers)
    {
        IList<Card> cards = new List<Card>();

       // kaarten toevoegen tot de lijst
        
        for (int i = 0; i < 4; i++)
        {
            cards.Add(Card.Attack);
            cards.Add(Card.Skip);
            cards.Add(Card.Favor);
            cards.Add(Card.Shuffle);
            cards.Add(Card.BeardCat);
            cards.Add(Card.Cattermelon);
            cards.Add(Card.HairyPotatoCat);
            cards.Add(Card.RainbowRalphingCat);
            cards.Add(Card.TacoCat);
        }

        for (int i = 0; i < 5; i++)
        {
            cards.Add(Card.SeeTheFuture);
            cards.Add(Card.Nope);
        }

        // defuse kaarten volgens test moeten per speler dus standaard op 2 ,
        // allen bij 5 spelers wordt het 1, drna loopt de for loop om het juistaantal defuse toetevoegen tot de lijst.

        int numberOfDefuseCards = numberOfPlayers == 5 ? 1 : 2;
        for (int i = 0; i < numberOfDefuseCards; i++)
        {
            cards.Add(Card.Defuse);
          
        }


        return new CardDeck(cards);
    }
}