/* Textes et réglages propres à chaque langue. */
window.LANGS = {
  fr: {
    name: "Français",
    htmlLang: "fr",
    docTitle: "Le Mot · Wordle en français",
    title: [["L", "correct"], ["E"], [" "], ["M", "partial"], ["O"], ["T"]],
    shareName: "Le Mot",
    firstDay: "2022-01-10",
    definitionUrl: (w) => `https://1mot.net/${w.toLowerCase()}`,
    dateLocale: "fr-CA",
    enter: "Entrer",
    del: "Suppr",
    layouts: {
      AZERTY: ["AZERTYUIOP", "QSDFGHJKLM", "<WXCVBN>"],
      "BÉPO": ["BEPOWVDLJZ", "AUICTSRNM", "<YXKQGHF>"],
      QWERTY: ["QWERTYUIOP", "ASDFGHJKL", "<ZXCVBNM>"],
      QWERTZ: ["QWERTZUIOP", "ASDFGHJKL", "<YXCVBNM>"],
    },
    defaultLayout: "AZERTY",
    t: {
      archives: "Archives",
      stats: "Statistiques",
      help: "Aide",
      settings: "Paramètres",
      changeLang: "Changer de langue",
      howToPlay: "Comment jouer ?",
      distribution: "Performances",
      wordWas: "Le mot était",
      definition: "Définition",
      share: "Partager",
      copied: "Copié !",
      nextWord: "Prochain mot dans",
      played: "Parties",
      winPct: "Victoires (%)",
      streak: "Série actuelle",
      maxStreak: "Meilleure série",
      archiveNoStats: "Les stats ne sont ni visibles ni changées en mode Archives.",
      hardMode: "Mode difficile",
      hardModeHint: "Les indices trouvés (lettres vertes et jaunes) doivent être réutilisés.",
      colorBlind: "Mode daltonien",
      nativeShare: "Partage natif (mobile)",
      keyboard: "Clavier",
      language: "Langue",
      notEnough: "Pas assez de lettres",
      notInList: "Ce mot n'est pas dans la liste",
      mustPlace: (l, n) => `La ${n === 1 ? "1re" : n + "e"} lettre doit être ${l}`,
      mustContain: (l) => `Le mot doit contenir ${l}`,
      hardLocked: "Impossible de changer en cours de partie",
      copyFail: "Impossible de copier le résultat",
      wins: ["Génial !", "Magnifique !", "Impressionnant !", "Splendide !", "Bien joué !", "Ouf !"],
      helpHtml: `
        <p>Devine le <strong>mot du jour</strong> en <strong>6 essais</strong>. Chaque essai doit être un mot valide de 5 lettres.</p>
        <p>Après chaque essai, la couleur des cases montre si tu es proche du mot.</p>
        {{ex:FRUIT:0:correct}}<p>La lettre <b class="c-correct">F</b> est dans le mot, à la <strong>bonne place</strong>.</p>
        {{ex:POCHE:2:partial}}<p>La lettre <b class="c-partial">C</b> est dans le mot, mais <strong>pas à la bonne place</strong>.</p>
        {{ex:SOEUR:4:incorrect}}<p>La lettre <b>R</b> n'est <strong>pas dans le mot</strong>.</p>
        <p>Les accents sont ignorés (É = E). Un nouveau mot chaque jour à minuit !</p>`,
      credits: `<h3>Crédits</h3>
        <p>Version FR basée sur <a href="https://github.com/louanben/wordle-fr" target="_blank" rel="noopener">wordle-fr</a> par @louanben (GPL-3.0).</p>
        <p>Concept inspiré de <strong>Wordle</strong> par Josh Wardle.</p>`,
    },
  },

  en: {
    name: "English",
    htmlLang: "en",
    docTitle: "Wordle · English",
    title: [["W", "correct"], ["O"], ["R", "partial"], ["D"], ["L"], ["E"]],
    shareName: "Wordle EN",
    firstDay: "2021-06-19",
    definitionUrl: (w) => `https://www.merriam-webster.com/dictionary/${w.toLowerCase()}`,
    dateLocale: "en-CA",
    enter: "Enter",
    del: "Del",
    layouts: {
      QWERTY: ["QWERTYUIOP", "ASDFGHJKL", "<ZXCVBNM>"],
      AZERTY: ["AZERTYUIOP", "QSDFGHJKLM", "<WXCVBN>"],
      DVORAK: ["PYFGCRL", "AOEUIDHTNS", "<QJKXBMWVZ>"],
    },
    defaultLayout: "QWERTY",
    t: {
      archives: "Archive",
      stats: "Statistics",
      help: "Help",
      settings: "Settings",
      changeLang: "Change language",
      howToPlay: "How to play",
      distribution: "Guess distribution",
      wordWas: "The word was",
      definition: "Definition",
      share: "Share",
      copied: "Copied!",
      nextWord: "Next word in",
      played: "Played",
      winPct: "Win %",
      streak: "Current streak",
      maxStreak: "Max streak",
      archiveNoStats: "Stats are hidden and not updated in Archive mode.",
      hardMode: "Hard mode",
      hardModeHint: "Any revealed hints (green and yellow letters) must be used in later guesses.",
      colorBlind: "Color-blind mode",
      nativeShare: "Native share (mobile)",
      keyboard: "Keyboard",
      language: "Language",
      notEnough: "Not enough letters",
      notInList: "Not in word list",
      mustPlace: (l, n) => `Letter ${n} must be ${l}`,
      mustContain: (l) => `Guess must contain ${l}`,
      hardLocked: "Can't change during a game",
      copyFail: "Couldn't copy the result",
      wins: ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"],
      helpHtml: `
        <p>Guess the <strong>word of the day</strong> in <strong>6 tries</strong>. Each guess must be a valid 5-letter word.</p>
        <p>After each guess, the tile colors show how close you are.</p>
        {{ex:WEARY:0:correct}}<p><b class="c-correct">W</b> is in the word and in the <strong>correct spot</strong>.</p>
        {{ex:PILLS:1:partial}}<p><b class="c-partial">I</b> is in the word but in the <strong>wrong spot</strong>.</p>
        {{ex:VAGUE:3:incorrect}}<p><b>U</b> is <strong>not in the word</strong>.</p>
        <p>A new word every day at midnight!</p>`,
      credits: `<h3>Credits</h3>
        <p>English word lists from <a href="https://github.com/everurstruly/The-New-York-Times-Wordle-Clone" target="_blank" rel="noopener">The-New-York-Times-Wordle-Clone</a>.</p>
        <p>Inspired by <strong>Wordle</strong> by Josh Wardle.</p>`,
    },
  },
};
