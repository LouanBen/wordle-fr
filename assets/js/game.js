/* =========================================================================
   Le Mot / Wordle — FR & EN
   Tout le jeu en JavaScript « pur » (sans framework, sans compilation).
   ========================================================================= */
(function () {
  "use strict";

  const NB_LETTERS = 5;
  const NB_ATTEMPTS = 6;
  const STORAGE_KEY = "lemot:v3";
  const FLIP_MS = 300; // délai entre chaque case qui se retourne

  // ---------- Petits utilitaires ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const chunk5 = (str) => str.match(/.{5}/g) || [];

  // Dates « locales » au format AAAA-MM-JJ (le mot change à minuit chez toi).
  const pad = (n) => String(n).padStart(2, "0");
  const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); };
  const utc = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 864e5);
  const todayKey = () => toKey(new Date());

  // Générateur pseudo-aléatoire déterministe (même graine = même suite de nombres).
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (str) => [...str].reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0) | 0, 7);

  // ---------- Dictionnaires (préparés une seule fois par langue) ----------
  const dict = {};
  function getDict(lang) {
    if (dict[lang]) return dict[lang];
    const src = window.WORDS[lang];
    const answers = chunk5(src.answers);
    // Ordre mélangé fixe : chaque mot sort une fois avant de revenir.
    const rnd = mulberry32(hash("le-mot-" + lang));
    const order = answers.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    // Un Set rend la vérification « ce mot existe ? » instantanée.
    const valid = new Set(answers.concat(chunk5(src.valid)));
    return (dict[lang] = { order, valid });
  }

  // ---------- Sauvegarde (localStorage) ----------
  const defaultStore = () => ({
    lang: null,
    settings: { colorBlind: false, webShare: false, hardMode: false, layout: {} },
    fr: { game: null, stats: {} },
    en: { game: null, stats: {} },
  });
  let store;
  try {
    store = Object.assign(defaultStore(), JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
  } catch (e) {
    store = defaultStore();
  }
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* mode privé */ } };

  // ---------- État de la partie en cours ----------
  const state = {
    lang: null,
    date: todayKey(),
    archive: false,
    answer: "",
    guesses: [],   // mots déjà validés
    current: "",   // mot en train d'être tapé
    finished: false,
    won: false,
    busy: false,   // vrai pendant l'animation (on bloque le clavier)
    hardMode: false,
  };
  let L = null; // config de la langue active (window.LANGS[lang])
  const T = (key, ...args) => { const v = L.t[key]; return typeof v === "function" ? v(...args) : v; };

  function wordFor(lang, dateKey) {
    const { order } = getDict(lang);
    const idx = daysBetween(window.LANGS[lang].firstDay, dateKey);
    return order[((idx % order.length) + order.length) % order.length];
  }
  const wordNumber = () => daysBetween(L.firstDay, state.date);

  // Couleurs d'un essai : 2 passages pour bien gérer les lettres en double.
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

  // Mode difficile : vérifie qu'on réutilise les indices déjà trouvés.
  function hardModeError(guess) {
    for (const prev of state.guesses) {
      const res = evaluate(prev, state.answer);
      for (let i = 0; i < NB_LETTERS; i++) {
        if (res[i] === "correct" && guess[i] !== prev[i]) return T("mustPlace", prev[i], i + 1);
      }
      const need = {};
      res.forEach((r, i) => { if (r !== "incorrect") need[prev[i]] = (need[prev[i]] || 0) + 1; });
      for (const l in need) {
        if (guess.split(l).length - 1 < need[l]) return T("mustContain", l);
      }
    }
    return null;
  }

  // ---------- Chargement d'une partie ----------
  function loadGame() {
    state.answer = wordFor(state.lang, state.date);
    state.current = "";
    state.busy = false;
    const saved = store[state.lang].game;
    if (!state.archive && saved && saved.date === state.date) {
      state.guesses = saved.guesses.slice();
      state.hardMode = !!saved.hardMode;
    } else {
      state.guesses = [];
      state.hardMode = store.settings.hardMode;
    }
    state.won = state.guesses.includes(state.answer);
    state.finished = state.won || state.guesses.length >= NB_ATTEMPTS;
    renderAll(false);
  }

  function persistGame() {
    if (state.archive) return; // les archives ne sont jamais sauvegardées
    store[state.lang].game = { date: state.date, guesses: state.guesses, hardMode: state.hardMode };
    if (state.finished) {
      store[state.lang].stats[state.date] = { won: state.won, n: state.guesses.length };
    }
    save();
  }

  // ---------- Affichage ----------
  const gridEl = $("#grid");
  const kbEl = $("#keyboard");
  const tiles = [];

  function buildGrid() {
    gridEl.innerHTML = "";
    tiles.length = 0;
    for (let r = 0; r < NB_ATTEMPTS; r++) {
      const row = el("div", "row");
      const rowTiles = [];
      for (let c = 0; c < NB_LETTERS; c++) {
        const t = el("div", "tile");
        row.appendChild(t);
        rowTiles.push(t);
      }
      gridEl.appendChild(row);
      tiles.push(rowTiles);
    }
  }

  function renderGrid(animateRow) {
    for (let r = 0; r < NB_ATTEMPTS; r++) {
      const word = r < state.guesses.length ? state.guesses[r] : r === state.guesses.length ? state.current : "";
      const res = r < state.guesses.length ? evaluate(word, state.answer) : null;
      for (let c = 0; c < NB_LETTERS; c++) {
        const t = tiles[r][c];
        const letter = word[c] || "";
        t.textContent = letter;
        t.className = "tile";
        t.style.animationDelay = t.style.transitionDelay = "";
        if (letter) t.classList.add("filled");
        if (!state.finished && r === state.guesses.length && c === state.current.length) t.classList.add("cursor");
        if (res) {
          t.classList.add(res[c]);
          if (r === animateRow) {
            t.classList.add("reveal");
            t.style.animationDelay = `${c * FLIP_MS}ms`;
            t.style.transitionDelay = `${c * FLIP_MS + 250}ms`;
          }
        }
      }
    }
  }

  function buildKeyboard() {
    kbEl.innerHTML = "";
    const layoutName = store.settings.layout[state.lang] || L.defaultLayout;
    const rows = L.layouts[layoutName] || L.layouts[L.defaultLayout];
    rows.forEach((line) => {
      const row = el("div", "kb-row");
      for (const ch of line) {
        const key = el("button", "key");
        if (ch === "<" || ch === ">") {
          const isEnter = ch === "<";
          key.classList.add("big");
          key.dataset.key = isEnter ? "Enter" : "Backspace";
          key.setAttribute("aria-label", isEnter ? L.enter : L.del);
          const img = el("img", "icon");
          img.src = `assets/icons/${isEnter ? "entrer" : "suppr"}.svg`;
          img.alt = "";
          key.appendChild(img);
        } else {
          key.dataset.key = ch;
          key.textContent = ch;
        }
        row.appendChild(key);
      }
      kbEl.appendChild(row);
    });
  }

  function renderKeyboard() {
    const rank = { incorrect: 1, partial: 2, correct: 3 };
    const best = {};
    state.guesses.forEach((g) => evaluate(g, state.answer).forEach((r, i) => {
      if (!best[g[i]] || rank[r] > rank[best[g[i]]]) best[g[i]] = r;
    }));
    kbEl.querySelectorAll(".key").forEach((k) => {
      k.classList.remove("correct", "partial", "incorrect");
      if (best[k.dataset.key]) k.classList.add(best[k.dataset.key]);
    });
  }

  function renderHeader() {
    $("#game-title").hidden = state.archive;
    $("#archives-selector").hidden = !state.archive;
    $("#btn-archives").classList.toggle("pressed", state.archive);
    if (state.archive) {
      const first = L.firstDay;
      const last = addDays(todayKey(), -1);
      $("#archive-date-label").textContent = fromKey(state.date).toLocaleDateString(L.dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" });
      const input = $("#archive-date-input");
      input.min = first; input.max = last; input.value = state.date;
      $("#archive-prev").disabled = state.date <= first;
      $("#archive-next").disabled = state.date >= last;
    }
  }

  function renderAll(animateRow) {
    renderHeader();
    renderGrid(animateRow);
    renderKeyboard();
  }

  // ---------- Messages (toast) ----------
  let toastTimer;
  function toast(msg, ms = 1200) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), ms);
  }

  function shakeRow() {
    const row = gridEl.children[state.guesses.length];
    row.classList.remove("shake");
    void row.offsetWidth; // relance l'animation
    row.classList.add("shake");
  }

  // ---------- Saisie ----------
  function onKey(key) {
    if (state.finished || state.busy || !L) return;
    if (key === "Enter") return submit();
    if (key === "Backspace") {
      state.current = state.current.slice(0, -1);
      return renderGrid();
    }
    if (/^[A-Z]$/.test(key) && state.current.length < NB_LETTERS) {
      state.current += key;
      renderGrid();
      const t = tiles[state.guesses.length][state.current.length - 1];
      t.classList.add("pop");
    }
  }

  function submit() {
    const guess = state.current;
    if (guess.length < NB_LETTERS) { toast(T("notEnough")); return shakeRow(); }
    if (!getDict(state.lang).valid.has(guess)) { toast(T("notInList")); return shakeRow(); }
    if (state.hardMode) {
      const err = hardModeError(guess);
      if (err) { toast(err); return shakeRow(); }
    }

    const row = state.guesses.length;
    state.guesses.push(guess);
    state.current = "";
    state.won = guess === state.answer;
    state.finished = state.won || state.guesses.length >= NB_ATTEMPTS;
    persistGame();

    state.busy = true;
    renderGrid(row);
    const revealTime = FLIP_MS * (NB_LETTERS - 1) + 500;
    setTimeout(() => {
      state.busy = false;
      renderKeyboard();
      if (!state.finished) return;
      if (state.won) {
        toast(T("wins")[row], 2000);
        tiles[row].forEach((t, i) => { t.style.animationDelay = `${i * 100}ms`; t.classList.remove("reveal"); t.classList.add("win"); });
      } else {
        toast(state.answer, 2500);
      }
      setTimeout(() => openModal("stats"), 1800);
    }, revealTime);
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") return closeModals();
    if (document.querySelector(".modal:not([hidden])") || !$("#lang-picker").hidden) return;
    if (e.target.tagName === "INPUT") return;
    if (e.key === "Enter" || e.key === "Backspace") {
      e.preventDefault();
      return onKey(e.key);
    }
    // « é » → « E », etc.
    const k = e.key.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
    if (/^[A-Z]$/.test(k)) onKey(k);
  });

  kbEl.addEventListener("click", (e) => {
    const k = e.target.closest(".key");
    if (k) { onKey(k.dataset.key); k.blur(); }
  });

  // ---------- Statistiques ----------
  function computeStats() {
    const games = store[state.lang].stats;
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
    // La série actuelle compte seulement si la dernière partie gagnée est d'aujourd'hui ou d'hier.
    const today = todayKey();
    s.streak = prev && (prev === today || prev === addDays(today, -1)) ? run : 0;
    return s;
  }

  function renderStats() {
    const body = $("#stats-body");
    const graph = $("#graph");
    body.innerHTML = "";
    graph.innerHTML = "";
    $("#dist-title").hidden = state.archive;

    if (state.archive) {
      body.appendChild(el("p", "muted", T("archiveNoStats")));
    } else {
      const s = computeStats();
      const box = el("div", "stats-grid");
      [[s.played, "played"], [s.played ? Math.round((s.wins / s.played) * 100) : 0, "winPct"], [s.streak, "streak"], [s.maxStreak, "maxStreak"]]
        .forEach(([v, k]) => {
          const item = el("div", "stat");
          item.append(el("div", "stat-figure", v), el("div", "stat-label", T(k)));
          box.appendChild(item);
        });
      body.appendChild(box);

      const max = Math.max(1, ...s.dist);
      s.dist.forEach((count, i) => {
        const line = el("div", "graph-line");
        const label = el("div", "graph-label");
        if (i < NB_ATTEMPTS) label.textContent = i + 1;
        else { const img = el("img", "icon"); img.src = "assets/icons/skull.svg"; img.alt = "✗"; label.appendChild(img); }
        const bar = el("div", "graph-bar", count);
        bar.style.width = `${Math.max(8, (count / max) * 100)}%`;
        const isToday = state.finished && (state.won ? i === state.guesses.length - 1 : i === NB_ATTEMPTS);
        if (isToday) bar.classList.add("best");
        line.append(label, bar);
        graph.appendChild(line);
      });
    }

    $("#solution").hidden = !state.finished;
    $("#countdown-box").hidden = !state.finished || state.archive;
    if (state.finished) {
      $("#solution-word").textContent = state.answer;
      $("#btn-definition").href = L.definitionUrl(state.answer);
      $("#share-label").textContent = T("share");
    }
  }

  function tickCountdown() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const s = Math.max(0, Math.floor((midnight - now) / 1000));
    $("#countdown").textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
    // Nouveau jour pendant que la page est ouverte → on charge le nouveau mot.
    if (!state.archive && L && state.date !== todayKey()) { state.date = todayKey(); loadGame(); }
  }
  setInterval(tickCountdown, 1000);

  // ---------- Partage ----------
  function shareText() {
    const cb = store.settings.colorBlind;
    const emoji = { correct: cb ? "🟧" : "🟩", partial: cb ? "🟦" : "🟨", incorrect: "⬛" };
    const score = state.won ? state.guesses.length : "X";
    const tag = state.archive ? ` (${state.date})` : "";
    const lines = state.guesses.map((g) => evaluate(g, state.answer).map((r) => emoji[r]).join(""));
    return `${L.shareName} #${wordNumber()}${tag} ${score}/${NB_ATTEMPTS}${state.hardMode ? "*" : ""}\n\n${lines.join("\n")}`;
  }

  async function share() {
    const text = shareText();
    const copied = () => {
      $("#share-label").textContent = T("copied");
      setTimeout(() => ($("#share-label").textContent = T("share")), 3000);
    };
    if (store.settings.webShare && navigator.share) {
      try { await navigator.share({ text }); return; } catch (e) { /* annulé → copie */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      copied();
    } catch (e) {
      // Plan B pour les vieux navigateurs / file://
      const ta = el("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand("copy");
      ta.remove();
      ok ? copied() : toast(T("copyFail"));
    }
  }
  $("#btn-share").addEventListener("click", share);

  // ---------- Fenêtres (modales) ----------
  function openModal(name) {
    closeModals();
    if (name === "stats") renderStats();
    if (name === "settings") renderSettings();
    $(`#modal-${name}`).hidden = false;
  }
  function closeModals() { $$(".modal").forEach((m) => (m.hidden = true)); }

  $$(".modal").forEach((m) => m.addEventListener("click", (e) => {
    if (e.target === m || e.target.closest("[data-close]")) closeModals();
  }));
  $("#btn-help").addEventListener("click", () => openModal("help"));
  $("#btn-stats").addEventListener("click", () => openModal("stats"));
  $("#btn-settings").addEventListener("click", () => openModal("settings"));

  // ---------- Paramètres ----------
  function renderSettings() {
    $$(".toggle").forEach((t) => {
      const key = t.dataset.setting;
      const on = key === "hardMode" ? state.hardMode : store.settings[key];
      t.classList.toggle("on", !!on);
      t.setAttribute("aria-checked", !!on);
    });
    const current = store.settings.layout[state.lang] || L.defaultLayout;
    const box = $("#layout-buttons");
    box.innerHTML = "";
    Object.keys(L.layouts).forEach((name) => {
      const b = el("button", name === current ? "selected" : "", name);
      b.addEventListener("click", () => {
        store.settings.layout[state.lang] = name;
        save();
        buildKeyboard();
        renderKeyboard();
        renderSettings();
      });
      box.appendChild(b);
    });
    $$("#modal-settings [data-lang]").forEach((b) => b.classList.toggle("selected", b.dataset.lang === state.lang));
  }

  $$(".toggle").forEach((t) => t.addEventListener("click", () => {
    const key = t.dataset.setting;
    if (key === "hardMode") {
      // On ne peut pas activer/désactiver le mode difficile au milieu d'une partie.
      if (state.guesses.length && !state.finished) return toast(T("hardLocked"));
      state.hardMode = store.settings.hardMode = !state.hardMode;
      persistGame();
    } else {
      store.settings[key] = !store.settings[key];
      save();
    }
    applyColorBlind();
    renderSettings();
  }));

  function applyColorBlind() {
    document.body.classList.toggle("color-blind", !!store.settings.colorBlind);
  }

  // ---------- Archives ----------
  $("#btn-archives").addEventListener("click", () => {
    state.archive = !state.archive;
    state.date = state.archive ? addDays(todayKey(), -1) : todayKey();
    loadGame();
  });
  const goArchive = (k) => {
    const first = L.firstDay, last = addDays(todayKey(), -1);
    if (!k || k < first || k > last) return;
    state.date = k;
    loadGame();
  };
  $("#archive-prev").addEventListener("click", () => goArchive(addDays(state.date, -1)));
  $("#archive-next").addEventListener("click", () => goArchive(addDays(state.date, 1)));
  $("#archive-date-input").addEventListener("change", (e) => goArchive(e.target.value));

  // ---------- Langue ----------
  function applyTexts() {
    document.documentElement.lang = L.htmlLang;
    document.title = L.docTitle;
    $$("[data-i18n]").forEach((e) => (e.textContent = T(e.dataset.i18n)));
    $$("[data-i18n-html]").forEach((e) => (e.innerHTML = T(e.dataset.i18nHtml)));
    $$("[data-i18n-title]").forEach((e) => { e.title = T(e.dataset.i18nTitle); e.setAttribute("aria-label", e.title); });
    $("#btn-lang").textContent = state.lang.toUpperCase();

    // Titre en cases colorées
    const title = $("#game-title");
    title.innerHTML = "";
    L.title.forEach(([ch, cls]) => title.appendChild(ch === " " ? el("span", "gap") : el("span", "tile " + (cls || ""), ch)));

    // Aide : {{ex:MOT:position:couleur}} → exemple en cases
    $("#help-content").innerHTML = T("helpHtml").replace(/\{\{ex:(\w+):(\d):(\w+)\}\}/g, (_, word, pos, cls) =>
      `<div class="example">${[...word].map((ch, i) => `<span class="tile filled ${i === +pos ? cls : ""}">${ch}</span>`).join("")}</div>`);
  }

  function setLang(lang) {
    if (!window.LANGS[lang]) return;
    state.lang = store.lang = lang;
    L = window.LANGS[lang];
    save();
    state.archive = false;
    state.date = todayKey();
    applyTexts();
    buildKeyboard();
    $("#lang-picker").hidden = true;
    $("#game").hidden = false;
    closeModals();
    loadGame();
    if (location.hash !== "#" + lang) history.replaceState(null, "", "#" + lang);
  }

  function showPicker() {
    closeModals();
    $("#game").hidden = true;
    $("#lang-picker").hidden = false;
  }

  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  $("#btn-lang").addEventListener("click", showPicker);
  window.addEventListener("hashchange", () => {
    const h = location.hash.slice(1);
    if (window.LANGS[h] && h !== state.lang) setLang(h);
  });

  // ---------- Démarrage ----------
  buildGrid();
  applyColorBlind();
  const fromHash = location.hash.slice(1);
  if (window.LANGS[fromHash]) setLang(fromHash);
  else if (store.lang) setLang(store.lang);
  else showPicker();

  // Mode hors-ligne (seulement si le site est servi en http/https)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
