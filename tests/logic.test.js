// Tests automatiques de la logique du jeu.
// Lancer :  node --test   (ou npm test)
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const G = require("../assets/js/logic.js");

// Les fichiers de mots et i18n écrivent dans « window » : on en crée un faux.
global.window = global;
for (const f of ["words-fr.js", "words-en.js", "i18n.js"]) require(path.join("../assets/js", f));
const LANGS = window.LANGS;
const words = (lang) => ({
  answers: G.chunk5(window.WORDS[lang].answers),
  valid: G.chunk5(window.WORDS[lang].valid),
});
const colors = (guess, answer) =>
  G.evaluate(guess, answer).map((r) => ({ correct: "V", partial: "J", incorrect: "-" })[r]).join("");

// ---------- Couleurs ----------
test("evaluate : mot trouvé = tout vert", () => {
  assert.equal(colors("PELLE", "PELLE"), "VVVVV");
});

test("evaluate : aucune lettre commune = tout gris", () => {
  assert.equal(colors("BRUIT", "PELLE"), "-----");
});

test("evaluate : lettre au mauvais endroit = jaune", () => {
  assert.equal(colors("SOEUR", "PELLE"), "--J--");
});

test("evaluate : lettre en double dans l'essai, une seule dans la réponse", () => {
  // Un seul E dans CRANE : seul le E bien placé est vert, l'autre est gris.
  assert.equal(colors("EERIE", "CRANE"), "--J-V");
  // Le vert passe avant le jaune, même si la lettre bien placée vient après.
  assert.equal(colors("LLAMA", "HELLO"), "JJ---");
});

test("evaluate : lettre en double dans la réponse", () => {
  // PELLE a deux L : les deux L de l'essai sont colorés.
  assert.equal(colors("LILAS", "PELLE"), "J-V--");
  assert.equal(colors("ALLEE", "PELLE"), "-JVJV");
});

// ---------- Mode difficile ----------
test("mode difficile : premier essai toujours permis", () => {
  assert.equal(G.hardModeError([], "PELLE", "BRUIT"), null);
});

test("mode difficile : une lettre verte doit rester à sa place", () => {
  const err = G.hardModeError(["PETIT"], "PELLE", "SPELL");
  assert.deepEqual(err, { type: "place", letter: "P", pos: 1 });
});

test("mode difficile : une lettre jaune doit être réutilisée", () => {
  const err = G.hardModeError(["SOEUR"], "PELLE", "BALAI");
  assert.deepEqual(err, { type: "contain", letter: "E" });
});

test("mode difficile : il faut autant d'exemplaires que d'indices trouvés", () => {
  // ALLEE vs PELLE révèle deux L et deux E.
  assert.deepEqual(G.hardModeError(["ALLEE"], "PELLE", "PELEE"), { type: "contain", letter: "L" });
  assert.equal(G.hardModeError(["ALLEE"], "PELLE", "PELLE"), null);
});

// ---------- Mot du jour ----------
test("FR : même mot que wordle.louan.me (valeurs calculées avec le code original)", () => {
  const { answers } = words("fr");
  const expected = {
    "2022-01-10": "FIGEE",
    "2022-03-08": "DROIT", // journée des droits des femmes
    "2023-05-12": "FAIRE",
    "2024-02-29": "LAURE",
    "2025-12-25": "LAVEE",
    "2026-11-01": "COGNE",
    "2026-11-02": "VIVES",
  };
  for (const [date, word] of Object.entries(expected)) {
    assert.equal(G.wordFor(LANGS.fr, answers, date), word, date);
  }
});

test("FR : 1 792 réponses possibles, la dernière est PIZZA", () => {
  const { answers } = words("fr");
  assert.equal(answers.length, 1792);
  assert.equal(answers[answers.length - 1], "PIZZA");
});

test("EN : un mot différent chaque jour pendant toute la liste", () => {
  const { answers } = words("en");
  const order = G.shuffled(answers, "le-mot-en");
  const seen = new Set();
  for (let i = 0; i < answers.length; i++) {
    seen.add(G.wordFor(LANGS.en, answers, G.addDays(LANGS.en.firstDay, i), order));
  }
  assert.equal(seen.size, answers.length);
});

test("le tirage est stable : même date = même mot", () => {
  const { answers } = words("en");
  assert.equal(G.wordFor(LANGS.en, answers, "2026-11-01"), G.wordFor(LANGS.en, answers, "2026-11-01"));
});

// ---------- Listes de mots ----------
for (const lang of ["fr", "en"]) {
  test(`${lang} : tous les mots font 5 lettres A-Z, sans doublon`, () => {
    const { answers, valid } = words(lang);
    const all = answers.concat(valid);
    assert.ok(all.every((w) => /^[A-Z]{5}$/.test(w)));
    assert.equal(new Set(all).size, all.length);
  });
}

// ---------- Dates ----------
test("dates : jours entre deux dates, années bissextiles", () => {
  assert.equal(G.daysBetween("2024-02-28", "2024-03-01"), 2);
  assert.equal(G.addDays("2024-12-31", 1), "2025-01-01");
  assert.equal(G.addDays("2024-03-01", -1), "2024-02-29");
});

test("dates : le mot FR change à minuit heure de Paris", () => {
  // 1er nov. 2026 à 23 h 30 UTC = déjà le 2 nov. à Paris, mais encore le 1er à Montréal.
  const t = new Date("2026-11-01T23:30:00Z");
  assert.equal(G.todayKey("Europe/Paris", t), "2026-11-02");
  assert.equal(G.todayKey("America/Montreal", t), "2026-11-01");
  assert.equal(G.secondsToMidnight("Europe/Paris", new Date("2026-11-01T22:59:00Z")), 60);
});

// ---------- Stats ----------
test("stats : séries, victoires et distribution", () => {
  const games = {
    "2026-10-27": { won: true, n: 3 },
    "2026-10-28": { won: true, n: 4 },
    "2026-10-29": { won: false, n: 6 },
    "2026-10-30": { won: true, n: 2 },
    "2026-10-31": { won: true, n: 4 },
  };
  const s = G.computeStats(games, "2026-11-01");
  assert.equal(s.played, 5);
  assert.equal(s.wins, 4);
  assert.equal(s.streak, 2);
  assert.equal(s.maxStreak, 2);
  assert.deepEqual(s.dist, [0, 1, 1, 2, 0, 0, 1]);
});

test("stats : un jour sauté casse la série", () => {
  const games = { "2026-10-28": { won: true, n: 3 }, "2026-10-30": { won: true, n: 3 } };
  assert.equal(G.computeStats(games, "2026-10-30").maxStreak, 1);
  assert.equal(G.computeStats(games, "2026-11-05").streak, 0);
});
