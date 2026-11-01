/* =========================================================================
   Logique « pure » du jeu : aucune dépendance à la page (pas de DOM).
   Utilisée par le navigateur (window.WordleLogic) ET par les tests Node.
   ========================================================================= */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WordleLogic = api;
})(typeof self !== "undefined" ? self : this, function (root) {
  "use strict";

  const NB_LETTERS = 5;
  const NB_ATTEMPTS = 6;

  // seedrandom : déjà chargé dans le navigateur (Math.seedrandom), sinon via require (Node).
  const seedrandom = typeof Math.seedrandom === "function"
    ? Math.seedrandom
    : typeof require === "function" ? require("./vendor/seedrandom.min.js") : null;

  // ---------- Dates (format AAAA-MM-JJ) ----------
  const pad = (n) => String(n).padStart(2, "0");
  const utc = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 864e5);
  function addDays(k, n) {
    const d = new Date(utc(k) + n * 864e5);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }

  function timeParts(timeZone, now) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(now);
    const o = {};
    parts.forEach((p) => (o[p.type] = p.value));
    return o;
  }

  /** Date du jour dans un fuseau horaire (undefined = heure de l'appareil). */
  function todayKey(timeZone, now = new Date()) {
    const p = timeParts(timeZone, now);
    return `${p.year}-${p.month}-${p.day}`;
  }

  /** Secondes avant le prochain minuit dans ce fuseau horaire. */
  function secondsToMidnight(timeZone, now = new Date()) {
    const p = timeParts(timeZone, now);
    return 86400 - (Number(p.hour) * 3600 + Number(p.minute) * 60 + Number(p.second));
  }

  // ---------- Hasard déterministe ----------
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (str) => [...str].reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 7);

  /** Copie mélangée d'une liste, toujours dans le même ordre pour une même graine. */
  function shuffled(list, seedText) {
    const rnd = mulberry32(hash(seedText));
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const chunk5 = (str) => str.match(/.{5}/g) || [];

  /**
   * Mot du jour.
   * - pick "seedrandom" : même calcul que wordle.louan.me (graine = date « AAAA-M-J »).
   * - pick "shuffle"    : liste mélangée une fois, un mot par jour, sans répétition.
   */
  function wordFor(cfg, answers, dateKey, order) {
    if (cfg.specialDays && cfg.specialDays[dateKey]) return cfg.specialDays[dateKey];
    if (cfg.pick === "seedrandom") {
      const [y, m, d] = dateKey.split("-").map(Number);
      return answers[Math.floor(seedrandom(`${y}-${m}-${d}`)() * answers.length)];
    }
    order = order || shuffled(answers, "le-mot-" + cfg.id);
    const idx = daysBetween(cfg.firstDay, dateKey);
    return order[((idx % order.length) + order.length) % order.length];
  }

  // ---------- Règles ----------
  /** Couleur de chaque lettre. 2 passages pour bien gérer les lettres en double. */
  function evaluate(guess, answer) {
    const res = Array(NB_LETTERS).fill("incorrect");
    const left = answer.split("");
    for (let i = 0; i < NB_LETTERS; i++) {
      if (guess[i] === answer[i]) { res[i] = "correct"; left[i] = null; }
    }
    for (let i = 0; i < NB_LETTERS; i++) {
      if (res[i] === "correct") continue;
      const j = left.indexOf(guess[i]);
      if (j !== -1) { res[i] = "partial"; left[j] = null; }
    }
    return res;
  }

  /**
   * Mode difficile : renvoie null si l'essai est permis, sinon
   * { type: "place", letter, pos } ou { type: "contain", letter }.
   */
  function hardModeError(guesses, answer, guess) {
    for (const prev of guesses) {
      const res = evaluate(prev, answer);
      for (let i = 0; i < NB_LETTERS; i++) {
        if (res[i] === "correct" && guess[i] !== prev[i]) return { type: "place", letter: prev[i], pos: i + 1 };
      }
      const need = {};
      res.forEach((r, i) => { if (r !== "incorrect") need[prev[i]] = (need[prev[i]] || 0) + 1; });
      for (const l in need) {
        if (guess.split(l).length - 1 < need[l]) return { type: "contain", letter: l };
      }
    }
    return null;
  }

  /** Stats à partir de { "AAAA-MM-JJ": { won, n } }. */
  function computeStats(games, today) {
    const days = Object.keys(games).sort();
    const s = { played: days.length, wins: 0, streak: 0, maxStreak: 0, dist: Array(NB_ATTEMPTS + 1).fill(0) };
    let run = 0, prev = null;
    for (const d of days) {
      const g = games[d];
      if (g.won) {
        s.wins++;
        s.dist[g.n - 1]++;
        run = prev && addDays(prev, 1) === d && games[prev].won ? run + 1 : 1;
      } else {
        s.dist[NB_ATTEMPTS]++;
        run = 0;
      }
      s.maxStreak = Math.max(s.maxStreak, run);
      prev = d;
    }
    // La série actuelle compte seulement si la dernière partie est d'aujourd'hui ou d'hier.
    s.streak = prev && (prev === today || prev === addDays(today, -1)) ? run : 0;
    return s;
  }

  return {
    NB_LETTERS, NB_ATTEMPTS,
    pad, daysBetween, addDays, todayKey, secondsToMidnight,
    shuffled, chunk5, wordFor, evaluate, hardModeError, computeStats,
  };
});
