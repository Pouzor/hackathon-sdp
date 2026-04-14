/**
 * Punchlines inter-planètes pour les bulles de BD du système solaire.
 * Chaque planète a des vannes envers chacune des 3 autres.
 */

export type Punchline = {
  from: string; // planet id de l'émetteur
  to: string;   // planet id de la cible
  text: string;
};

export const PUNCHLINES: Punchline[] = [
  // ── Duck Invaders → SchizoCats ──────────────────────────────────────────────
  { from: "duck", to: "cats", text: "Les chats ont 9 vies… 0 victoire 🐥" },
  { from: "duck", to: "cats", text: "Schizo ? C'est votre classement ou votre stratégie ? 😏" },
  { from: "duck", to: "cats", text: "Miaou = la traduction de « on a encore perdu »" },
  { from: "duck", to: "cats", text: "Les chats retombent toujours sur leurs pattes… sauf au classement 🐾" },
  { from: "duck", to: "cats", text: "T'as beau avoir 9 vies, t'as qu'un seul score nul 🦆" },
  { from: "duck", to: "cats", text: "On avait peur des chats. Puis on a vu leurs points 😂" },
  { from: "duck", to: "cats", text: "Schizo par le nom, stables dans la médiocrité 👀" },
  { from: "duck", to: "cats", text: "Les chats chassent les souris. Pas les podiums 🏆" },
  { from: "duck", to: "cats", text: "Faire ronronner ça oui. Gagner, c'est autre chose 🎵" },
  { from: "duck", to: "cats", text: "On vous aime bien, les chats. Juste pas au classement 💛" },

  // ── Duck Invaders → Donut Factory ───────────────────────────────────────────
  { from: "duck", to: "donut", text: "Un donut c'est un zéro avec du glaçage 🍩" },
  { from: "duck", to: "donut", text: "Votre planète sent le sucre brûlé et la défaite 💀" },
  { from: "duck", to: "donut", text: "Les donuts, ronds comme votre score 🔵" },
  { from: "duck", to: "donut", text: "Beaucoup de calories, peu de points 🦆" },
  { from: "duck", to: "donut", text: "Le trou du donut c'est l'endroit où sont vos victoires 😬" },
  { from: "duck", to: "donut", text: "On peut pas tout avoir : la viennoiserie ET le podium 🥐" },
  { from: "duck", to: "donut", text: "Votre usine tourne, votre classement non ⚙️" },
  { from: "duck", to: "donut", text: "Même Homer Simpson gagnerait plus de points 🍩😂" },
  { from: "duck", to: "donut", text: "Du sucre partout, de l'amertume au classement 🏳️" },
  { from: "duck", to: "donut", text: "Factory ? On dirait plutôt une usine à défaites 🏭" },

  // ── Duck Invaders → Raccoons ─────────────────────────────────────────────────
  { from: "duck", to: "raccoon", text: "Les ratons fouillent nos poubelles de victoires 🦝" },
  { from: "duck", to: "raccoon", text: "Asgard c'est haut, votre score c'est bas 📉" },
  { from: "duck", to: "raccoon", text: "Des masques sur les yeux, ça cache quoi exactement ? 😏" },
  { from: "duck", to: "raccoon", text: "Thor serait déçu de ce classement 🔨" },
  { from: "duck", to: "raccoon", text: "Les ratons volent la nuit. Les Duck dominent le jour 🌅" },
  { from: "duck", to: "raccoon", text: "Asgard ou pas, c'est nous les dieux ici 🦆👑" },
  { from: "duck", to: "raccoon", text: "Mignons les ratons. Mais mignons ça gagne pas 🥲" },
  { from: "duck", to: "raccoon", text: "Vous cherchez des points comme des déchets dans une poubelle 🗑️" },
  { from: "duck", to: "raccoon", text: "Même Rocket Raccoon ferait mieux 🚀" },
  { from: "duck", to: "raccoon", text: "Les ratons d'Asgard… perdants de galaxie 💫" },

  // ── Donut Factory → Duck Invaders ───────────────────────────────────────────
  { from: "donut", to: "duck", text: "Les canards font quack, pas des points 🦆" },
  { from: "donut", to: "duck", text: "Duck Invaders ? Même les envahisseurs perdent 👾" },
  { from: "donut", to: "duck", text: "Un canard sans sucre c'est triste. Et sans points aussi 🍩" },
  { from: "donut", to: "duck", text: "Le pain de canard ? Ça se mange et ça se bat 🥖" },
  { from: "donut", to: "duck", text: "Les canards migrent vers le sud… du classement 🐥📉" },
  { from: "donut", to: "duck", text: "Vous volez bas pour des « Invaders » 🛸" },
  { from: "donut", to: "duck", text: "Coin coin = notre réponse à vos performances 😂" },
  { from: "donut", to: "duck", text: "Les canards barbotent, nous on produit 🏭" },
  { from: "donut", to: "duck", text: "Duck Season ? Non, Donut Season 🍩🎯" },
  { from: "donut", to: "duck", text: "Même en caoutchouc vous êtes moins résistants que nos donuts 💪" },

  // ── Donut Factory → SchizoCats ──────────────────────────────────────────────
  { from: "donut", to: "cats", text: "Les chats adorent nos donuts… dans notre poubelle 🐱🗑️" },
  { from: "donut", to: "cats", text: "9 vies = 9 façons de finir dernier 😸" },
  { from: "donut", to: "cats", text: "Schizo, c'est votre nom ou votre gestion de saison ?" },
  { from: "donut", to: "cats", text: "Les chats poussent les objets par terre… leurs points surtout 📊" },
  { from: "donut", to: "cats", text: "Chat noir = mauvais augure pour votre classement 🖤" },
  { from: "donut", to: "cats", text: "Même Grumpy Cat ferait mieux que vous 😾" },
  { from: "donut", to: "cats", text: "Les chats dorment 16h. Ça explique le score 😴" },
  { from: "donut", to: "cats", text: "Le ronronnement de votre moteur est en panne 🔧" },
  { from: "donut", to: "cats", text: "Curiosité, saut, chute libre. Votre parcours en 3 mots 📉" },
  { from: "donut", to: "cats", text: "On vous aimerait bien sur une box de donuts… comme décor 🍩🐾" },

  // ── Donut Factory → Raccoons ────────────────────────────────────────────────
  { from: "donut", to: "raccoon", text: "Les ratons adorent nos donuts. Normal, ils les volent 🦝🍩" },
  { from: "donut", to: "raccoon", text: "Asgard est loin. Le podium encore plus 🌌" },
  { from: "donut", to: "raccoon", text: "Masqués de nuit, absents du classement de jour 🎭" },
  { from: "donut", to: "raccoon", text: "Les ratons d'Asgard fouillent nos scores aussi ? 😂" },
  { from: "donut", to: "raccoon", text: "Thor a son marteau, vous avez vos poubelles 🗑️🔨" },
  { from: "donut", to: "raccoon", text: "Sympas les ratons. Sympas ET derniers 🥲" },
  { from: "donut", to: "raccoon", text: "Asgard ou Midgard, vous perdez pareil 🌍" },
  { from: "donut", to: "raccoon", text: "On recycle tout à la Donut Factory… sauf vos excuses 🏭" },
  { from: "donut", to: "raccoon", text: "Les ratons fouillent, nous on gagne. C'est ça la différence 💡" },
  { from: "donut", to: "raccoon", text: "Même Rocket Raccoon aurait honte de ce score 🚀😬" },

  // ── SchizoCats → Duck Invaders ───────────────────────────────────────────────
  { from: "cats", to: "duck", text: "Un canard, ça nage. Dans la médiocrité surtout 🐥💧" },
  { from: "cats", to: "duck", text: "Duck Invaders ? Vous envahissez quoi exactement ? 👀" },
  { from: "cats", to: "duck", text: "On vous a cherchés dans les étoiles… et dans le top 3 😏" },
  { from: "cats", to: "duck", text: "Les canards migrent en automne, comme vos points 📉" },
  { from: "cats", to: "duck", text: "Coin coin = SOS en morse ? On comprend 🆘" },
  { from: "cats", to: "duck", text: "Même un canard en plastique flotte mieux que votre score 🛁" },
  { from: "cats", to: "duck", text: "Invaders ? On vous a pas vus envahir grand-chose 👾" },
  { from: "cats", to: "duck", text: "Les chats chassent les canards. Classement pareil 🐾🦆" },
  { from: "cats", to: "duck", text: "Duck season. Mais pas pour les points apparemment 🎯" },
  { from: "cats", to: "duck", text: "On a 9 vies, vous avez 0 podium. L'arithmétique est cruelle 😸" },

  // ── SchizoCats → Donut Factory ───────────────────────────────────────────────
  { from: "cats", to: "donut", text: "Les donuts c'est rond, vide au centre, comme votre stratégie 🍩" },
  { from: "cats", to: "donut", text: "Même avec du glaçage votre score est amer 💔" },
  { from: "cats", to: "donut", text: "Usine à donuts = usine à défaites 🏭" },
  { from: "cats", to: "donut", text: "Les chats poussent les donuts par terre exprès 🐾😈" },
  { from: "cats", to: "donut", text: "Homer Simpson vous gère mieux que vous vous gérez 🍩😂" },
  { from: "cats", to: "donut", text: "Beaucoup de sucre, zéro mordant au classement 🦷" },
  { from: "cats", to: "donut", text: "La Factory tourne… en rond 🔄" },
  { from: "cats", to: "donut", text: "Un trou au centre : là où sont vos ambitions 😬" },
  { from: "cats", to: "donut", text: "Les SchizoCats ont du goût. Pas pour les donuts perdants 😸" },
  { from: "cats", to: "donut", text: "Vos donuts sont délicieux. Vos résultats beaucoup moins 🥲" },

  // ── SchizoCats → Raccoons ────────────────────────────────────────────────────
  { from: "cats", to: "raccoon", text: "Les chats et les ratons s'entendent bien. Sauf au classement 🐱🦝" },
  { from: "cats", to: "raccoon", text: "Asgard ? C'est loin pour une équipe aussi près du fond 📉" },
  { from: "cats", to: "raccoon", text: "Les ratons masqués cachent un score honteux 🎭" },
  { from: "cats", to: "raccoon", text: "Thor aurait lancé son marteau de honte 🔨😤" },
  { from: "cats", to: "raccoon", text: "9 vies > vos 0 victoires. Les maths sont simples 🐾" },
  { from: "cats", to: "raccoon", text: "Les ratons fouillent nos poubelles de nuit. On les comprend 🌙" },
  { from: "cats", to: "raccoon", text: "Mignons les ratons. Mais mignons ça monte pas dans le classement 🥲" },
  { from: "cats", to: "raccoon", text: "D'Asgard à la cave du classement, sacré voyage 🛸📉" },
  { from: "cats", to: "raccoon", text: "Les ratons laveurs lavent tout… sauf leur score 🧼" },
  { from: "cats", to: "raccoon", text: "Rocket Raccoon pleurerait en voyant ça 🚀😭" },

  // ── Raccoons → Duck Invaders ─────────────────────────────────────────────────
  { from: "raccoon", to: "duck", text: "Les canards, on les a vus dans nos poubelles 🦆🗑️" },
  { from: "raccoon", to: "duck", text: "Duck Invaders ? L'invasion est annulée, classement oblige 👾" },
  { from: "raccoon", to: "duck", text: "D'Asgard, votre score ressemble à un grain de poussière 🌌" },
  { from: "raccoon", to: "duck", text: "Coin coin = le bruit que fait votre classement qui chute 📉" },
  { from: "raccoon", to: "duck", text: "Les ratons volent la nuit. Vos points aussi 😈" },
  { from: "raccoon", to: "duck", text: "Thor > Duck. Le débat est clos 🔨🦆" },
  { from: "raccoon", to: "duck", text: "Un canard ça vole bas. Niveau classement aussi 🛩️" },
  { from: "raccoon", to: "duck", text: "Duck season ? Raton season 🎯🦝" },
  { from: "raccoon", to: "duck", text: "On a Asgard, vous avez quoi ? Un étang ? 🏞️" },
  { from: "raccoon", to: "duck", text: "Les Invaders envahissent… la dernière place 😂" },

  // ── Raccoons → Donut Factory ─────────────────────────────────────────────────
  { from: "raccoon", to: "donut", text: "Les donuts atterrissent dans nos poubelles. Comme vos espoirs 🍩🗑️" },
  { from: "raccoon", to: "donut", text: "Forme ronde = trajectoire du classement ? Logique 🔵📉" },
  { from: "raccoon", to: "donut", text: "La Factory produit beaucoup. Des défaites surtout 🏭" },
  { from: "raccoon", to: "donut", text: "D'Asgard vos donuts sont invisibles. Comme vos points 🌌" },
  { from: "raccoon", to: "donut", text: "Homer Simpson aurait pas laissé filer ce classement 😤" },
  { from: "raccoon", to: "donut", text: "Croustillants les donuts. Fragile le score 💔" },
  { from: "raccoon", to: "donut", text: "Le trou du donut ? C'est là qu'on a mis vos victoires 😬" },
  { from: "raccoon", to: "donut", text: "Une planète entière pour produire… ça 🥲" },
  { from: "raccoon", to: "donut", text: "Les ratons raffolent du sucre. Mais pas de vos résultats 🦝" },
  { from: "raccoon", to: "donut", text: "Factory en surcharge. Usine à excuses en tout cas 🔧" },

  // ── Raccoons → SchizoCats ────────────────────────────────────────────────────
  { from: "raccoon", to: "cats", text: "9 vies, 0 titre. Les chats gâchent leur potentiel 😸" },
  { from: "raccoon", to: "cats", text: "Schizo ? On dirait votre courbe de points 📊😂" },
  { from: "raccoon", to: "cats", text: "Les ratons d'Asgard > les chats de nulle part 🦝👑" },
  { from: "raccoon", to: "cats", text: "Les chats dorment 16h. Ça laisse peu de temps pour gagner 😴" },
  { from: "raccoon", to: "cats", text: "Thor a terrassé des dieux. Les chats, ça devrait aller 🔨😏" },
  { from: "raccoon", to: "cats", text: "Même un chat noir vous porterait chance. Pas assez 🖤" },
  { from: "raccoon", to: "cats", text: "Les chats retombent sur leurs pattes ? Pas sur le podium 🐾" },
  { from: "raccoon", to: "cats", text: "Ronron = son du moteur calé 🎵💀" },
  { from: "raccoon", to: "cats", text: "D'Asgard votre planète ressemble à une boule de poils 🌌🐱" },
  { from: "raccoon", to: "cats", text: "Curiosité tua le chat ET son classement 📉" },
];
