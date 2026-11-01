# Le Mot / Wordle — FR & EN

Jeu de mots du jour (style Wordle) en **français** 🇫🇷 et en **anglais** 🇬🇧.

## Jouer

**Ouvre simplement `index.html` dans ton navigateur** (double-clic) — aucun serveur, aucune installation, aucune compilation.

Au premier lancement, choisis ta langue. Tu peux la changer avec le bouton **FR / EN** en haut à droite, dans les paramètres, ou directement par l'adresse : `index.html#fr` ou `index.html#en`.

## Fonctions

- Un mot par jour et par langue (change à minuit, heure locale)
- Statistiques séparées FR / EN (parties, % de victoires, séries, distribution)
- Mode **Archives** : rejoue les mots des jours précédents
- Mode **difficile**, mode **daltonien**
- Claviers AZERTY, BÉPO, QWERTY, QWERTZ (FR) — QWERTY, AZERTY, DVORAK (EN)
- Accents ignorés au clavier (é → E)
- Partage du résultat en emojis 🟩🟨⬛
- Hors-ligne (PWA) quand le site est hébergé (ex. GitHub Pages)

## Structure

```
index.html            page unique (choix de langue + jeu)
assets/css/style.css  style
assets/js/game.js     logique du jeu (JavaScript pur, sans framework)
assets/js/i18n.js     textes et claviers FR / EN
assets/js/words-*.js  listes de mots (réponses + mots acceptés)
assets/icons, img     icônes
sw.js, manifest.json  mode hors-ligne / installation (PWA)
```

## Crédits

- Version FR basée sur [louanben/wordle-fr](https://github.com/louanben/wordle-fr) (GPL-3.0)
- Listes de mots anglaises tirées de [everurstruly/The-New-York-Times-Wordle-Clone](https://github.com/everurstruly/The-New-York-Times-Wordle-Clone)
- Concept original : **Wordle** par Josh Wardle
