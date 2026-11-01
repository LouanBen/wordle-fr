/* =========================================================================
   Le Mot / Wordle — FR & EN
   Interface du jeu (affichage, clavier, sauvegarde). Les règles sont dans logic.js.
   ========================================================================= */
(function () {
  "use strict";

  const G = window.WordleLogic;
  const { NB_LETTERS, NB_ATTEMPTS, pad, addDays, daysBetween, evaluate } = G;
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

  // ---------- Listes de mots : chargées seulement quand la langue est choisie ----------
  // (une balise <script> ajoutée à la volée marche aussi en ouvrant index.html sans serveur)
  const loading = {};
  function loadWords(lang) {
    if (window.WORDS && window.WORDS[lang]) return Promise.resolve();
    return (loading[lang] = loading[lang] || new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `assets/js/words-${lang}.js`;
      s.onload = resolve;
      s.onerror = () => { delete loading[lang]; reject(new Error("words " + lang)); };
      document.head.appendChild(s);
    }));
  }

  const dict = {};
  function getDict(lang) {
    if (dict[lang]) return dict[lang];
    const src = window.WORDS[lang];
    const answers = G.chunk5(src.answers);
    const cfg = window.LANGS[lang];
    return (dict[lang] = {
      answers,
      order: cfg.pick === "shuffle" ? G.shuffled(answers, "le-mot-" + lang) : null,
      valid: new Set(answers.concat(G.chunk5(src.valid))), // Set = recherche instantanée
    });
  }

  // ---------- Sauvegarde (localStorage) ----------
  function loadStore() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { /* données abîmées */ }
    s.settings = Object.assign({ colorBlind: false, webShare: false, hardMode: false, theme: null, layout: {} }, s.settings);
    for (const lang of Object.keys(window.LANGS)) {
      s[lang] = Object.assign({ game: null, stats: {}, archives: {} }, s[lang]);
    }
    return s;
  }
  const store = loadStore();
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { /* mode privé */ } };

  // ---------- État de la partie en cours ----------
  const state = {
    lang: null,
    date: null,
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
  const today = () => G.todayKey(L.timeZone);

  const wordFor = (dateKey) => {
    const d = getDict(state.lang);
    return G.wordFor(L, d.answers, dateKey, d.order);
  };
  const wordNumber = () => daysBetween(L.firstDay, state.date) + L.numberOffset;

  // ---------- Chargement / sauvegarde d'une partie ----------
  // Partie du jour : store[lang].game — Archives : store[lang].archives[date]
  function savedSlot() {
    const s = store[state.lang];
    if (state.archive) return s.archives[state.date];
    return s.game && s.game.date === state.date ? s.game : null;
  }

  function loadGame() {
    state.answer = wordFor(state.date);
    state.busy = false;
    const saved = savedSlot();
    // On ignore une sauvegarde faite pour un autre mot (ex. : ancienne version du jeu).
    if (saved && saved.answer === state.answer) {
      state.guesses = saved.guesses.slice();
      state.current = saved.current || "";
      state.hardMode = !!saved.hardMode;
    } else {
      state.guesses = [];
      state.current = "";
      state.hardMode = store.settings.hardMode;
    }
    state.won = state.guesses.includes(state.answer);
    state.finished = state.won || state.guesses.length >= NB_ATTEMPTS;
    if (state.finished) state.current = "";
    renderAll();
  }

  function persistGame() {
    const s = store[state.lang];
    const slot = { answer: state.answer, guesses: state.guesses, current: state.current, hardMode: state.hardMode };
    if (state.archive) {
      s.archives[state.date] = slot; // gardé, mais ne compte pas dans les stats
    } else {
      s.game = Object.assign({ date: state.date }, slot);
      if (state.finished) s.stats[state.date] = { won: state.won, n: state.guesses.length };
    }
    save();
  }

  // ---------- Affichage ----------
  const gridEl = $("#grid");
  const kbEl = $("#keyboard");
  const tiles = [];

  function buildGrid() {
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

  function archiveDone(dateKey) {
    const a = store[state.lang].archives[dateKey];
    return !!a && a.answer === wordFor(dateKey) && (a.guesses.includes(a.answer) || a.guesses.length >= NB_ATTEMPTS);
  }

  function renderHeader() {
    $("#game-title").hidden = state.archive;
    $("#archives-selector").hidden = !state.archive;
    $("#btn-archives").classList.toggle("pressed", state.archive);
    if (state.archive) {
      const first = L.firstDay;
      const last = addDays(today(), -1);
      $("#archive-date-label").textContent = state.date + (archiveDone(state.date) ? " ✓" : "");
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
      if (!state.current) return;
      state.current = state.current.slice(0, -1);
    } else if (/^[A-Z]$/.test(key) && state.current.length < NB_LETTERS) {
      state.current += key;
    } else {
      return;
    }
    renderGrid();
    if (key !== "Backspace") tiles[state.guesses.length][state.current.length - 1].classList.add("pop");
    persistGame(); // la ligne en cours survit à une fermeture de la page
  }

  function submit() {
    const guess = state.current;
    if (guess.length < NB_LETTERS) { toast(T("notEnough")); return shakeRow(); }
    if (!getDict(state.lang).valid.has(guess)) { toast(T("notInList")); return shakeRow(); }
    if (state.hardMode) {
      const err = G.hardModeError(state.guesses, state.answer, guess);
      if (err) {
        toast(err.type === "place" ? T("mustPlace", err.letter, err.pos) : T("mustContain", err.letter));
        return shakeRow();
      }
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
      renderHeader(); // ✓ dans les archives
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
  function renderStats() {
    const body = $("#stats-body");
    const graph = $("#graph");
    body.innerHTML = "";
    graph.innerHTML = "";
    $("#dist-title").hidden = state.archive;

    if (state.archive) {
      body.appendChild(el("p", "muted", T("archiveNoStats")));
    } else {
      const s = G.computeStats(store[state.lang].stats, today());
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

  function tick() {
    if (!L) return;
    const s = G.secondsToMidnight(L.timeZone);
    $("#countdown").textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
    // Nouveau jour pendant que la page est ouverte → on charge le nouveau mot.
    if (!state.archive && state.date !== today() && !state.busy) { state.date = today(); loadGame(); }
  }
  setInterval(tick, 1000);

  // ---------- Partage ----------
  function shareText() {
    const cb = store.settings.colorBlind;
    const light = document.body.classList.contains("light");
    const emoji = { correct: cb ? "🟧" : "🟩", partial: cb ? "🟦" : "🟨", incorrect: light ? "⬜" : "⬛" };
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
  const isLight = () => store.settings.theme === "light"; // sombre par défaut (look original)

  function renderSettings() {
    const values = {
      hardMode: state.hardMode,
      colorBlind: store.settings.colorBlind,
      webShare: store.settings.webShare,
      lightTheme: isLight(),
    };
    $$(".toggle").forEach((t) => {
      const on = !!values[t.dataset.setting];
      t.classList.toggle("on", on);
      t.setAttribute("aria-checked", on);
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
    } else if (key === "lightTheme") {
      store.settings.theme = isLight() ? "dark" : "light";
      save();
    } else {
      store.settings[key] = !store.settings[key];
      save();
    }
    applyLook();
    renderSettings();
  }));

  function applyLook() {
    const light = isLight();
    document.body.classList.toggle("light", light);
    document.body.classList.toggle("color-blind", !!store.settings.colorBlind);
    $('meta[name="theme-color"]').content = light ? "#ffffff" : "#1d1d20";
  }

  // ---------- Archives ----------
  $("#btn-archives").addEventListener("click", () => {
    if (state.busy) return;
    state.archive = !state.archive;
    state.date = state.archive ? addDays(today(), -1) : today();
    loadGame();
  });
  const goArchive = (k) => {
    if (state.busy || !k || k < L.firstDay || k > addDays(today(), -1)) return;
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

  let langRequest = 0;
  async function setLang(lang) {
    if (!window.LANGS[lang]) return;
    const req = ++langRequest;
    try {
      await loadWords(lang);
    } catch (e) {
      alert("Impossible de charger les mots / Could not load word list.");
      return;
    }
    if (req !== langRequest) return; // un autre choix a été fait entre-temps

    state.lang = store.lang = lang;
    L = window.LANGS[lang];
    save();
    state.archive = false;
    state.date = today();
    applyTexts();
    buildKeyboard();
    $("#lang-picker").hidden = true;
    $("#game").hidden = false;
    closeModals();
    loadGame();
    tick();
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
  applyLook();
  const fromHash = location.hash.slice(1);
  if (window.LANGS[fromHash]) setLang(fromHash);
  else if (store.lang && window.LANGS[store.lang]) setLang(store.lang);
  else showPicker();

  // Mode hors-ligne (seulement si le site est servi en http/https)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
