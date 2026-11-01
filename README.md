# Le Mot / Wordle — FR & EN

Jeu de mots du jour (style Wordle) en **français** 🇫🇷 et en **anglais** 🇬🇧.

## Jouer

**Ouvre simplement `index.html` dans ton navigateur** (double-clic) — aucun serveur, aucune installation, aucune compilation.

Au premier lancement, choisis ta langue. Tu peux la changer avec le bouton **FR / EN** en haut à droite, dans les paramètres, ou directement par l'adresse : `index.html#fr` ou `index.html#en`.

## Fonctions

- Un mot par jour et par langue
  - **FR : le même mot que [wordle.louan.me](https://wordle.louan.me)** (même liste, même calcul `seedrandom`, minuit heure de Paris = 18 h au Québec)
  - EN : liste mélangée une fois, aucun mot ne revient avant que toute la liste soit passée (minuit heure locale)
- Statistiques séparées FR / EN (parties, % de victoires, séries, distribution)
- Mode **Archives** : rejoue les mots des jours précédents (progression sauvegardée, ✓ quand fini)
- La ligne en cours est sauvegardée si tu fermes la page
- Mode **difficile**, mode **daltonien**, **thème clair**
- Claviers AZERTY, BÉPO, QWERTY, QWERTZ (FR) — QWERTY, AZERTY, DVORAK (EN)
- Accents ignorés au clavier (é → E)
- Partage du résultat en emojis 🟩🟨⬛
- Hors-ligne (PWA) quand le site est hébergé (ex. GitHub Pages)

## Tests

```
node --test
```

(ou `npm test`) — vérifie les couleurs (lettres en double), le mode difficile, le mot du jour FR (identique à wordle.louan.me), les listes de mots, les dates et les stats. Aucune installation nécessaire, juste [Node.js](https://nodejs.org).

## Structure

```
index.html            page unique (choix de langue + jeu)
assets/css/style.css  style
assets/js/game.js     interface (affichage, clavier, sauvegarde)
assets/js/logic.js    règles pures (couleurs, mode difficile, mot du jour, stats)
assets/js/i18n.js     textes, claviers et réglages FR / EN
assets/js/words-*.js  listes de mots, chargées seulement pour la langue choisie
assets/js/vendor/     seedrandom (MIT) — même tirage que wordle.louan.me
tests/                tests automatiques (node --test)
assets/icons, img     icônes
sw.js, manifest.json  mode hors-ligne / installation (PWA)
```

## Crédits

- Version FR basée sur [louanben/wordle-fr](https://github.com/louanben/wordle-fr) (GPL-3.0)
- Listes de mots anglaises tirées de [everurstruly/The-New-York-Times-Wordle-Clone](https://github.com/everurstruly/The-New-York-Times-Wordle-Clone)
- Concept original : **Wordle** par Josh Wardle
