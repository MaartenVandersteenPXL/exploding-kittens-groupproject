export const CardType = Object.freeze({
    ExplodingKitten: 0,
    Defuse: 1,
    Skip: 2,
    Attack: 3,
    Favor: 4,
    Shuffle: 5,
    SeeTheFuture: 6,
    Nope: 7,
    BeardCat: 100,
    Cattermelon: 101,
    HairyPotatoCat: 102,
    RainbowRalphingCat: 103,
    TacoCat: 104
});

export const CardImage = {
    [CardType.Attack]: "assets/attack.jpg",
    [CardType.BeardCat]: "assets/beardcat.jpg",
    [CardType.Cattermelon]: "assets/cattermelon.jpg",
    [CardType.Defuse]: "assets/defuse.jpg",
    [CardType.ExplodingKitten]: "assets/explodingkitten.jpg",
    [CardType.Favor]: "assets/favor.jpg",
    [CardType.HairyPotatoCat]: "assets/hairypotatocat.jpg",
    [CardType.Nope]: "assets/nope.jpg",
    [CardType.RainbowRalphingCat]: "assets/rainbowralphingcat.jpg",
    [CardType.SeeTheFuture]: "assets/seethefuture.jpg",
    [CardType.Shuffle]: "assets/shuffle.jpg",
    [CardType.Skip]: "assets/skip.jpg",
    [CardType.TacoCat]: "assets/tacocat.jpg"
}
