<template>
    <div id="game">
        <header>
            <div class="header-container">
                <div class="header-left">
                    <div class="icon-btn archives" :class="{ pressed: archivesMode, nopin: visitedArchives }" @click="switchArchivesMode" title="Archives">
                        <img class="icon" src="/icons/archive.svg" alt="Archives" />
                    </div>
                    <div class="icon-btn stats" @click="statsOpened = true" title="Statistiques">
                        <img class="icon" src="/icons/stats.svg" alt="Statistiques" />
                    </div>
                </div>
                <div class="game-title" v-if="!archivesMode"><!--MORDLE-->
                    <div class="title">
                        <div class="letter correct">L</div>
                        <div class="letter incorrect">E</div>
                        <div class="space"></div>
                        <div class="letter partial">M</div>
                        <div class="letter incorrect">O</div>
                        <div class="letter incorrect">T</div>
                        <div class="space"></div>
                        <div>(simplifié)</div>
                    </div>
                </div>
                <div class="archives-selector" v-if="archivesMode">
                    <div class="icon-btn archives-arrow archives-date-previous" :class="{ disabled: !canChangeArchivesDate(-1) }" @click="changeArchivesDate(-1)">
                        <img class="icon" src="/icons/caret-back.svg" alt="Date précédente">
                    </div>
                    <div class="archives-date">
                        {{ formatDate(archivesDate) }}
                    </div>
                    <div class="icon-btn archives-arrow archives-date-next" :class="{ disabled: !canChangeArchivesDate(1) }" @click="changeArchivesDate(1)">
                        <img class="icon" src="/icons/caret-forward.svg" alt="Date suivante">
                    </div>
                </div>
                <div class="header-right">
                    <div class="icon-btn settings" @click="settingsOpened = true" title="Paramètres">
                        <img class="icon" src="/icons/settings.svg" alt="Paramètres" />
                    </div>
                    <div class="icon-btn help" @click="helpOpened = true" title="Aide">
                        <img class="icon" src="/icons/help.svg" alt="Aide" />
                    </div>
                </div>
            </div>
        </header>
        <main>
            <transition name="fade">
                <div class="error" v-if="error">{{ error }}</div>
            </transition>
            <div class="grid">
                <div class="attempt" v-for="attempt, indexA in attempts" :key="indexA" :class="{ shake: error && indexA === currentAttempt - 1 }">
                    <LetterContainer 
                        :letter="attempts[indexA][indexL]" 
                        :color="results[indexA][indexL]" 
                        :placement="letter" 
                        :animate="animateLetter" 
                        :colorBlindMode="colorBlindMode"
                        :hasCursor="indexA === currentAttempt - 1 && indexL === attempts[indexA].length"
                        v-for="letter, indexL in NB_LETTERS" 
                        :key="letter" />
                </div>
            </div>
            <div class="keyboard">
                <div class="keyboard-line" v-for="line, index in keyboard.content" :key="index">
                    <Key
                        :keyContent="key"
                        :color="getKeyColor(key)"
                        :colorBlindMode="colorBlindMode"
                        v-for="key in line"
                        :key="key"
                        :keyboardName="keyboard.name"
                        @update:handleClick="handleKeyClick($event)"
                    />
                </div>
            </div>
            <transition name="fadeup">
                <div class="help-modal" v-if="helpOpened">
                    <div class="modal-backdrop" @click="helpOpened = false"></div>
                    <div class="help-modal-content">
                        <div class="close-btn" @click="helpOpened = false">
                            <img class="icon" src="/icons/close.svg" alt="Fermer" />
                        </div>
                        <h2>Kézako ?</h2>
                        <div class="help-content">
                            <p>Ce jeu reprend exactement le même concept que le <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank">Wordle</a>, mais en français, avec quelques simplifications.</p>
                            <p>Chaque jour, un mot de 5 lettres est choisi aléatoirement. Vous devez le deviner en 6 essais.</p>
                            <p>La liste de mots à trouver est très restreinte ({{words.length}} mots, sur {{words.length+playableWords.length}})&nbsp;:<br />
                            - aucun mot à trouver ne comportera deux lettres identiques<br />
                            - les variantes plurielles &amp; féminines sont absentes de la liste<br />
                            - il n'y a pas + de 2 mots à trouver ayant qu'1 lettre de différence<br />
                            - les verbes sont uniquement à l'infinitif ou au participe-passé<br />
                            - par défaut le safe-mode est activé sur toutes vos tentatives : il vous prévient que le mot saisi n'est pas dans la liste des mots à trouver<br />
                            <br />
                            Aucun mot ne retombera avant 814 jours minimum (2 ans 2 mois)
                            </p>
                        </div>
                        <p></p>
                        <h2>Comment jouer ?</h2>
                        <div class="help-content">
                            <p>À chaque essai, les lettres du mot que vous avez proposé changeront de couleur en fonction de à quel point vous êtes proche de le trouver.</p>
                            <div class="help-exemple">
                                <div class="help-word">
                                    <div class="help-letter-container correct" :class="{ 'color-blind': colorBlindMode }">
                                        F
                                    </div>
                                    <div class="help-letter-container">
                                        R
                                    </div>
                                    <div class="help-letter-container">
                                        U
                                    </div>
                                    <div class="help-letter-container">
                                        I
                                    </div>
                                    <div class="help-letter-container">
                                        T
                                    </div>
                                </div>
                                <p>La lettre <span class="correct" :class="{ 'color-blind': colorBlindMode }">F</span> est dans le mot, à la bonne place.</p>
                                <div class="help-word">
                                    <div class="help-letter-container">
                                        P
                                    </div>
                                    <div class="help-letter-container">
                                        O
                                    </div>
                                    <div class="help-letter-container partial" :class="{ 'color-blind': colorBlindMode }">
                                        C
                                    </div>
                                    <div class="help-letter-container">
                                        H
                                    </div>
                                    <div class="help-letter-container">
                                        E
                                    </div>
                                </div>
                                <p>La lettre <span class="partial" :class="{ 'color-blind': colorBlindMode }">C</span> est dans le mot, mais pas à la bonne place.</p>
                                <div class="help-word">
                                    <div class="help-letter-container">
                                        S
                                    </div>
                                    <div class="help-letter-container">
                                        O
                                    </div>
                                    <div class="help-letter-container">
                                        E
                                    </div>
                                    <div class="help-letter-container">
                                        U
                                    </div>
                                    <div class="help-letter-container incorrect" :class="{ 'color-blind': colorBlindMode }">
                                        R
                                    </div>
                                </div>
                                <p>La lettre <span>R</span> n'est pas dans le mot.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="fadeup">
                <div class="endgame-modal" v-if="statsOpened">
                    <div class="modal-backdrop" @click="statsOpened = false"></div>
                    <div class="endgame-modal-content" v-bind:class="{ 'finished' : finished}">
                        <div class="close-btn" @click="statsOpened = false">
                            <img class="icon" src="/icons/close.svg" alt="Fermer" />
                        </div>
                        <h2>Statistiques</h2>
                        <template v-if="!archivesMode">
                            <div class="stats">
                                <div class="stats-content">
                                    <div class="stats-line">
                                        <div class="stats-item games-played">
                                            <p class="stat-item-figure">{{ userResults.nbGames }}</p>
                                            <p class="stat-item-label">Parties</p>
                                        </div>
                                        <div class="stats-item win-rate">
                                            <p class="stat-item-figure">{{ Math.round((userResults.nbGames > 0 ? userResults.nbWins / userResults.nbGames : 0) * 100) }}</p>
                                            <p class="stat-item-label">Victoires (%)</p>
                                        </div>
                                    </div>
                                    <div class="stats-line">
                                        <div class="stats-item current-streak">
                                            <p class="stat-item-figure">{{ userResults.currentStreak }}</p>
                                            <p class="stat-item-label">Série actuelle</p>
                                        </div>
                                        <div class="stats-item current-streak">
                                            <p class="stat-item-figure">{{ userResults.bestStreak }}</p>
                                            <p class="stat-item-label">Meilleure série</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h2>Performances</h2>
                            <div class="graph">
                                <div class="graph-content">
                                    <div class="graph-item" v-for="attempt in NB_ATTEMPTS + 1" :key="attempt">
                                        <div class="attempt-number" v-if="attempt <= NB_ATTEMPTS">{{ attempt }}</div>
                                        <div class="attempt-skull" v-else>
                                            <img class="icon" src="/icons/skull.svg" alt="Mort" />
                                        </div>
                                        <div class="attempt-stat">
                                            <div class="attempt-bar" :class="{ best: finished && attempt === currentAttempt}" :style="{ width: `${getAttemptStatPercent(attempt)}%`}">{{ getAttemptStat(attempt) }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>Les stats ne sont ni visibles ni changées en mode Archive.</template>
                        <div class="soluce" v-if="finished">
                            <div class="subtitle">Le mot était</div>
                            <h2>{{ wordOfTheDay }}</h2>
                            <div class="ctas">
                                <a :href="`https://1mot.net/${this.wordOfTheDay.toLowerCase()}`" target="_blank" class="btn definition-btn">
                                    <img class="icon" src="/icons/book.svg" />
                                    <p>Définition</p>
                                </a>
                                <div class="btn sh4re-btn-anti-adblock" @click="sh4reAntiAdblock">
                                    <img class="icon" src="/icons/copy.svg" />
                                    <p>{{resultsCopied ? 'Copié !' : 'Partager'}}</p>
                                </div>
                            </div>
                            <div class="ctas">
                                <a href="https://utip.io/louanben" target="_blank" class="btn support-btn">
                                    <img class="icon" src="/icons/heart.svg" />
                                    <p>Soutenir l'auteur du projet</p>
                                </a>
                            </div>
                          <textarea id="clipboard-buffer"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer" v-if="finished && !archivesMode">
                        <div class="next-in">Prochain mot dans</div>
                        <div class="time">{{ countdownToNextWord }}</div>
                    </div>
                </div>
            </transition>
            <transition name="fadeup">
                <div class="settings-modal" v-if="settingsOpened">
                    <div class="modal-backdrop" @click="settingsOpened = false"></div>
                    <div class="settings-modal-content">
                        <div class="close-btn" @click="settingsOpened = false">
                            <img class="icon" src="/icons/close.svg" alt="Fermer" />
                        </div>
                        <h2>Paramètres</h2>
                        <div class="settings-content">
                            <div class="settings-item setting-toggle">
                                <h3>Lien partagé</h3>
                                <div class="toggle-button" @click="sharedLink = !sharedLink" :class="{ activated: sharedLink }">
                                    <div class="toggle"></div>
                                </div>
                            </div>
                            <div class="settings-item setting-toggle">
                                <h3>Mode daltoniens</h3>
                                <div class="toggle-button" @click="colorBlindMode = !colorBlindMode" :class="{ activated: colorBlindMode }">
                                    <div class="toggle"></div>
                                </div>
                            </div>
                            <div class="settings-item setting-button">
                                <h3>Clavier</h3>
                                <div class="buttons keyboard-buttons">
                                    <button :class="{ selected: keyboard.name === KEYBOARD_AZERTY.name }" @click="keyboard = KEYBOARD_AZERTY">AZERTY</button>
                                    <button :class="{ selected: keyboard.name === KEYBOARD_BEPO.name }" @click="keyboard = KEYBOARD_BEPO">BÉPO</button>
                                    <button :class="{ selected: keyboard.name === KEYBOARD_QWERTY.name }" @click="keyboard = KEYBOARD_QWERTY">QWERTY</button>
                                    <button :class="{ selected: keyboard.name === KEYBOARD_QWERTZ.name }" @click="keyboard = KEYBOARD_QWERTZ">QWERTZ</button>
                                </div>
                            </div>
                            <div class="settings-item setting-button">
                                <h3>Safe-mode</h3>
                                <div class="buttons keyboard-buttons">
                                    <button :class="{ selected: safeMode === 'always' }" @click="safeMode = 'always'">Toujours</button>
                                    <button :class="{ selected: safeMode === 'last-chance' }" @click="safeMode = 'last-chance'">Ligne 6</button>
                                    <button :class="{ selected: safeMode === 'never' }" @click="safeMode = 'never'">Jamais</button>
                                </div>
                            </div>
                            <div style="text-align:left">Le safe-mode vous avertit qu'un mot que vous venez de jouer n'est pas présent dans la liste des mots à trouver, vous pourrez choisir de le jouer malgré tout.</div>
                             <div v-if="isBetaEnabled" class="settings-item setting-button">
                                 <h3>Import / Export (BETA)</h3>
                                 <div class="btn" @click="showImportInput">
                                    <img class="icon" src="/icons/copy.svg" />
                                    <p>Importer</p>
                                </div>
                                 <div class="btn" @click="exportSave">
                                    <img class="icon" src="/icons/copy.svg" />
                                    <p>Exporter</p>
                                </div>
                             </div>
                             <div v-if="isBetaEnabled && isImportInputEnabled">
                                 <textarea v-model="importInput" ref="importInputTA" placeholder="Collez ici vos données précédemment exportées. Attention, cela va écraser (sans fusionner) les données présentes sur ce navigateur." style="background-color: white;width: 100%; height: 100px"></textarea>
                                 <button class="btn" style="color: white;background-color: #3EAA42;border-radius: 12px;height: 25px; width: 100%; cursor: pointer;" @click="importSave">Valider l'importation</button>
                             </div>
                            <div class="credits">
                                <h2>Crédits</h2>
                                <p>
                                    Jeu développé par <a href="https://twitter.com/louanben" target="_blank">@louanben</a>, simplifié par <a href="https://twitter.com/Richiesque" target="_blank">@Richiesque</a>.
                                </p>
                                <p>
                                    Concept et design librement inspirés de <strong>Wordle</strong> par <a href="https://twitter.com/powerlanguish" target="_blank">@powerlanguish</a> (Josh Wardle).
                                </p>
                                <p>
                                    Merci à <a href="https://twitter.com/Richiesque" target="_blank">@Richiesque</a> pour son aide précieuse, ainsi qu'à <a href="https://twitter.com/Reelwens" target="_blank">@Reelwens</a> pour le design !
                                </p>
                                <p>
                                    Pour toute demandes, contacter <strong>@louanben</strong> sur Twitter, ou bien par mail : <strong>louanben.pro@gmail.com</strong>.
                                </p>
                                <p>
                                    <strong>WordleFR</strong> est un projet <a href="https://github.com/louanben/wordle-fr" target="_blank">open-source</a>. Vous êtes sur <a href="https://github.com/richie3366/wordle-fr-simple" target="_blank">un fork</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </main>
    </div>
</template>

<script>
import * as seedrandom from 'seedrandom';
import moment from 'moment-timezone';

import LetterContainer from "./grid/LetterContainer.vue";
import Key from "./keyboard/Key.vue";
import words from "../assets/json/drawable-words.json";
import playableWords from "../assets/json/playable-words.json";

moment.locale('fr')
moment.tz.setDefault('Europe/Paris')

const DATA_VERSION = "2.0.0"; // Must be updated when data structure is changed
const FIRST_DAY = moment("2022-05-05T00:00:00");
const NB_LETTERS = 5;
const NB_ATTEMPTS = 6;
const KEYBOARD_AZERTY = {
    name: 'azerty',
    content: [
        ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
        ['Entrer', 'W', 'X', 'C', 'V', 'B', 'N', 'Suppr'],
    ],
};
const KEYBOARD_BEPO = {
    name: 'bepo',
    content: [
        ['B', 'E', 'P', 'O', 'W', 'V', 'D', 'L', 'J', 'Z'],
        ['A', 'U', 'I', 'C', 'T', 'S', 'R', 'N', 'M'],
        ['Entrer', 'Y', 'X', 'K', 'Q', 'G', 'H', 'F', 'Suppr'],
    ],
};
const KEYBOARD_QWERTY = {
    name: 'qwerty',
    content: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Entrer', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Suppr'],
    ],
}
const KEYBOARD_QWERTZ = {
    name: 'qwertz',
    content: [
        ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Entrer', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'Suppr'],
    ]
};

export default {
    name: 'Game',
    components: {
        LetterContainer,
        Key,
    },
    data() {
        return {
            seedrandom,
            isBetaEnabled: false,
            safeMode: 'always',
            NB_LETTERS,
            NB_ATTEMPTS,
            KEYBOARD_AZERTY,
            KEYBOARD_BEPO,
            KEYBOARD_QWERTY,
            KEYBOARD_QWERTZ,
            keyboard: KEYBOARD_AZERTY,
            today: moment(),
            yesterday: moment().subtract(1, 'day'),
            words,
            playableWords,
            attempts: [],
            results: [],
            currentAttempt: 1,
            countdownToNextWord: '',
            wordOfTheDay: '',
            error: '',
            correctLetters: [],
            partialLetters: [],
            incorrectLetters: [],
            won: false,
            finished: false,
            statsOpened: false,
            settingsOpened: false,
            helpOpened: false,
            colorBlindMode: false,
            sharedLink: true,
            animateLetter: true,
            bestAttemptPercent: 0,
            resultsCopied: false,
            visitedArchives: false,
            archivesMode: false,
            archivesDate: moment().subtract(1, 'days'),
            isImportInputEnabled: false,
            importInput: '',
            userResults: {
                nbGames: 0,
                nbWins: 0,
                currentStreak: 0,
                bestStreak: 0,
                games: [],
            },
        }
    },
    mounted() {
        
        let checkBeta = () => window.location.hash.toLowerCase() === '#beta'
        this.isBetaEnabled = checkBeta()
        
        window.addEventListener('hashchange', () => this.isBetaEnabled = checkBeta())

        // Update timer to next word
        setInterval((function () {
            let duration = moment.duration(this.today.clone().endOf('day').diff(moment()))
            this.countdownToNextWord = moment.utc(duration.as('milliseconds')).format('HH:mm:ss')
            if (duration.as('milliseconds') < 0)
                this.countdownToNextWord = '00:00:00'

        }).bind(this), 1000)

        window.addEventListener('keydown', event => {
            if (/^[a-zA-Z]$/.test(event.key)) {
                this.handleKeyClick(event.key.toUpperCase());
            } else if (event.key === 'Enter') {
                this.handleKeyClick('Entrer');
            } else if (event.key === 'Backspace') {
                this.handleKeyClick('Suppr');
            }
        });

        for (let i = 0; i < NB_ATTEMPTS; i++) {
            this.attempts.push([]);
            this.results.push(new Array(5));
        }
        this.getWordOfTheDay();
        this.getSavedData();

        if (localStorage.getItem('sharedLink')) {
            this.sharedLink = JSON.parse(localStorage.getItem('sharedLink'));
        }

        if (localStorage.getItem('colorBlindMode')) {
            this.colorBlindMode = JSON.parse(localStorage.getItem('colorBlindMode'));
        }

        if (localStorage.getItem('keyboard')) {
            this.keyboard = JSON.parse(localStorage.getItem('keyboard'));
        }

        if (localStorage.getItem('safeMode')) {
            this.safeMode = JSON.parse(localStorage.getItem('safeMode'));
        }

        if (localStorage.getItem('visitedArchives')) {
            this.visitedArchives = true;
        }
    },
    watch: {
        sharedLink() {
            this.setLSItem('sharedLink', JSON.stringify(this.sharedLink));
        },
        colorBlindMode() {
            this.setLSItem('colorBlindMode', JSON.stringify(this.colorBlindMode));
        },
        safeMode() {
            this.setLSItem('safeMode', JSON.stringify(this.safeMode));
        },
        keyboard() {
            this.setLSItem('keyboard', JSON.stringify(this.keyboard));
        },
        archivesMode() {
            this.getWordOfTheDay()
            if (!this.archivesMode) {
                this.getSavedData();
            } else {
                this.resetGridData();
            }
        },
    },
    methods: {
        switchArchivesMode () {
            if (!this.archivesMode && !this.visitedArchives) {
                this.visitedArchives = true;
                this.setLSItem('visitedArchives', true);
            }

            this.archivesMode = !this.archivesMode;
        },
        setLSItem (key, val) {
            if (this.archivesMode && !['colorBlindMode', 'keyboard', 'sharedLink'].includes(key))
                return
            
            if (typeof val !== 'string')
                val = JSON.stringify(val)

            localStorage.setItem(key, val)
        },
        resetGridData () {
            this.attempts = [];
            this.results = [];
            this.correctLetters = [];
            this.partialLetters = [];
            this.incorrectLetters = [];
            this.won = false;
            this.finished = false;
            this.currentAttempt = 1;

            for (let i = 0; i < NB_ATTEMPTS; i++) {
                this.attempts.push([]);
                this.results.push(new Array(5));
            }

        },
        simpleChecksum (str) {
            return str.split('').reduce((ac, cv) => ac + cv.charCodeAt(0), 0).toString(16)
        },
        async exportSave () {
            if (this.archivesMode) return alert(`Vous ne pouvez pas exporter vos données en mode archive, retirez le mode archive et retentez.`)

            let jsonStr = JSON.stringify({ dataVersion: DATA_VERSION, ...localStorage })
            let checksum = this.simpleChecksum(jsonStr)
            let exportData = btoa([jsonStr, checksum].join(''))
            await this.saveToClipboard(exportData)

            alert(`Les données ont été copiées dans votre presse-papier. Transmettez-les au nouvel appareil, et collez-les après avoir cliqué sur "Importer". Attention, pour éviter de perdre votre streak, ne faites l'import/export qu'au cours d'une même journée.`)

        },
        showImportInput () {
            if (this.archivesMode) return alert(`Vous ne pouvez pas importer vos données en mode archive, retirez le mode archive et retentez.`)
            this.isImportInputEnabled = true
            this.importInput = ''
            alert(`Veuillez coller vos données précédemment exportées dans le champ qui vient d'apparaître et cliquer sur "Valider". Attention, pour éviter de perdre votre streak, ne faites l'import/export qu'au cours d'une même journée. Cela va écraser (sans fusionner) les données actuellement stockées sur ce navigateur !`)
            this.$nextTick(() => this.$refs.importInputTA.focus())
        },
        importSave () {
            if (this.archivesMode) return alert(`Vous ne pouvez pas importer vos données en mode archive, retirez le mode archive et retentez.`)
            
            let b64 = this.importInput.trim()
            if (!b64) return alert(`Vous n'avez saisi aucune donnée`)
            
            let importData
            try {
                let str = atob(b64)
                let lastBacketsAt = str.lastIndexOf('}')
                let jsonStr = str.slice(0, lastBacketsAt + 1)
                let checksum = str.slice(lastBacketsAt + 1)
                let computedSum = this.simpleChecksum(jsonStr)

                if (checksum !== computedSum)
                    throw new Error('invalid checksum')

                importData = JSON.parse(jsonStr)
            } catch (err) {
                return alert(`Erreur : Les données semblent avoir été corrompues ou tronquées. Veuillez recommencer avec de nouvelles données.`)
            }

            if (importData.dataVersion !== DATA_VERSION)
                return alert(`Erreur : Votre sauvegarde est malheureusement obsolète, la structure de données a changé entre votre export & votre import. Veuillez recommencer avec de nouvelles données.`)

            Object.entries(importData).forEach(([key, val]) => this.setLSItem(key, val))

            alert(`Données importées avec succès !`)
            this.getSavedData()

            this.importInput = ''
            this.isImportInputEnabled = false
        },
        async getWordOfTheDay() {
            let wordID = this.getWordID() - 1
            if (wordID < 0) wordID = 0
            const groupNum = Math.floor(wordID / this.words.length)
            const wordNum = wordID % this.words.length
            const wcopy = this.words.slice()

            let word
            for (let i = 0; i <= wordNum; i++) {
                const seed = seedrandom(`group-${groupNum}/word-${wordNum}`);
                word = wcopy.splice(Math.floor(seed() * wcopy.length), 1)[0]
            }

            this.wordOfTheDay = word
        },
        canChangeArchivesDate (nbDays) {
            
            if (nbDays > 0 && this.archivesDate >= this.yesterday)
                return false;
            else if (nbDays < 0 && this.archivesDate <= moment(FIRST_DAY).add(1, 'days'))
                return false;

            return true;
        },
        changeArchivesDate (nbDays) {

            if (!this.canChangeArchivesDate(nbDays))
                return;

            if (nbDays > 0) {
                this.archivesDate = this.archivesDate.add(nbDays, 'days');
            } else {
                this.archivesDate = this.archivesDate.subtract(nbDays * -1, 'days');
            }
            this.resetGridData();
            this.getWordOfTheDay();
        },
        getSavedData() {
            if (localStorage.getItem('lastSave')) {
                const lastSave = localStorage.getItem('lastSave');
                if (lastSave === this.today.format('YYYY-M-D')) {
                    if (localStorage.getItem('attempts')) {
                        this.attempts = JSON.parse(localStorage.getItem('attempts'));
                    }
                    if (localStorage.getItem('results')) {
                        this.results = JSON.parse(localStorage.getItem('results'));
                    }
                    if (localStorage.getItem('currentAttempt')) {
                        this.currentAttempt = JSON.parse(localStorage.getItem('currentAttempt'));
                    }
                    if (localStorage.getItem('correctLetters')) {
                        this.correctLetters = JSON.parse(localStorage.getItem('correctLetters'));
                    }
                    if (localStorage.getItem('partialLetters')) {
                        this.partialLetters = JSON.parse(localStorage.getItem('partialLetters'));
                    }
                    if (localStorage.getItem('incorrectLetters')) {
                        this.incorrectLetters = JSON.parse(localStorage.getItem('incorrectLetters'));
                    }
                    if (localStorage.getItem('won')) {
                        this.won = JSON.parse(localStorage.getItem('won'));
                    }
                    if (localStorage.getItem('finished')) {
                        this.finished = JSON.parse(localStorage.getItem('finished'));
                    }
                    if (localStorage.getItem('userResults')) {
                        this.userResults = JSON.parse(localStorage.getItem('userResults'));
                    }
                } else {
                    this.reset();
                }
            } else {
                this.reset();
            }
        },
        reset() {
            this.setLSItem('dataVersion', DATA_VERSION);
            this.setLSItem('attempts', JSON.stringify(this.attempts));
            this.setLSItem('results', JSON.stringify(this.results));
            this.setLSItem('currentAttempt', JSON.stringify(this.currentAttempt));
            this.setLSItem('correctLetters', JSON.stringify(this.correctLetters));
            this.setLSItem('partialLetters', JSON.stringify(this.partialLetters));
            this.setLSItem('incorrectLetters', JSON.stringify(this.incorrectLetters));
            this.setLSItem('won', JSON.stringify(this.won));
            this.setLSItem('finished', JSON.stringify(this.finished));
            this.setLSItem('lastSave', this.today.format('YYYY-M-D'));
            if (localStorage.getItem('userResults')) {
                this.userResults = JSON.parse(localStorage.getItem('userResults'));
            }
        },
        getKeyColor(key) {
            if (this.correctLetters.includes(key)) {
                return 'correct';
            } else if (this.partialLetters.includes(key)) {
                return 'partial';
            } else if (this.incorrectLetters.includes(key)) {
                return 'incorrect';
            } else {
                return '';
            }
        },
        handleKeyClick(key) {
            this.animateLetter = true;
            this.error = '';

            if (this.finished) return;

            if (key === 'Entrer') {
                this.verifyWord(this.attempts[this.currentAttempt - 1]);
            } else if (key === 'Suppr') {
                if(this.attempts[this.currentAttempt - 1].length > 0) {
                    this.attempts[this.currentAttempt - 1].pop();
                }
            } else if (this.attempts[this.currentAttempt - 1].length < NB_LETTERS) {
                this.attempts[this.currentAttempt - 1].push(key);
            }
            this.setLSItem('attempts', JSON.stringify(this.attempts));
        },
        verifyWord(attempt) {
            if (attempt.length === NB_LETTERS) {

                let isDrawable = this.words.includes(attempt.join(''))
                let isPlayable = playableWords.includes(attempt.join(''))

                if (!isDrawable && isPlayable) {
                    if (this.safeMode === 'always' || (this.safeMode === 'last-chance' && this.currentAttempt === 6)) {
                        if (!confirm(`Le mot saisi existe, mais n'est pas dans la liste des mots à trouver. Le jouer quand même ? (oui = OK, non = annuler)\n\n(vous pouvez désactiver cette alerte dans les réglages [safe-mode])`))
                            return
                    }
                }

                if (isDrawable || isPlayable) {
                    this.verifyLetters(attempt);
                } else {
                    this.error = 'Ce mot n\'est pas dans la liste';
                    window.setTimeout(() => {
                        this.error = '';
                    }, 1000);
                }
            } else {
                this.error = 'Veuillez entrer un mot de ' + NB_LETTERS + ' lettres';
                window.setTimeout(() => {
                    this.error = '';
                }, 1000);
            }
        },
        verifyLetters(attempt) {
            let wordToGuess = this.wordOfTheDay.split('');
            let currentResult = this.results[this.currentAttempt - 1];
            
            attempt.forEach((letter, index) => {
                if (wordToGuess[index] === letter) {
                    currentResult[index] = 'correct';
                    wordToGuess[index] = '*';
                    if (!this.correctLetters.includes(letter)) {
                        this.correctLetters.push(letter);
                    }
                }
            });

            attempt.forEach((letter, index) => {
                if (currentResult[index] !== 'correct') {
                    if (wordToGuess.includes(letter)) {
                        let otherIndex = wordToGuess.indexOf(letter);
                        currentResult[index] = 'partial';
                        wordToGuess[otherIndex] = '*';
                        if (!this.partialLetters.includes(letter)) {
                            this.partialLetters.push(letter);
                        }
                    } else {
                        currentResult[index] = 'incorrect';
                        if (!this.incorrectLetters.includes(letter)) {
                            this.incorrectLetters.push(letter);
                        }
                    }
                }
            });

            // this updates cleanly this.results
            this.results.splice(this.currentAttempt - 1, 1, currentResult);

            this.setLSItem('results', JSON.stringify(this.results));
            this.setLSItem('correctLetters', JSON.stringify(this.correctLetters));
            this.setLSItem('partialLetters', JSON.stringify(this.partialLetters));
            this.setLSItem('incorrectLetters', JSON.stringify(this.incorrectLetters));
            if (attempt.join('') === this.wordOfTheDay) {
                this.won = true;
                this.finished = true;
                this.computeStats();
            } else {
                this.currentAttempt++;
                if (this.currentAttempt > NB_ATTEMPTS) {
                    this.finished = true;
                    this.computeStats();
                }
            }
            this.setLSItem('currentAttempt', JSON.stringify(this.currentAttempt));
            this.setLSItem('won', JSON.stringify(this.won));
            this.setLSItem('finished', JSON.stringify(this.finished));
        },
        computeStats() {
            let games = this.userResults.games;
            let todaysGame = games.find((game) => game.date === this.today.format('YYYY-M-D'));

            if(!todaysGame) {
                let yesterday = this.today.clone().subtract(1, 'day');
                let yesterdaysGame = games.find(game => game.date === yesterday.format('YYYY-M-D'));
                let isStreak = Boolean(yesterdaysGame && yesterdaysGame.won);

                this.userResults.nbGames++;

                if (this.won) {
                    this.userResults.nbWins += 1;
                    this.userResults.currentStreak = isStreak ? this.userResults.currentStreak + 1 : 1;
                } else {
                    this.userResults.currentStreak = 0;
                }

                if (this.userResults.currentStreak > this.userResults.bestStreak) {
                    this.userResults.bestStreak = this.userResults.currentStreak;
                }
                games.push({
                    date: this.today.format('YYYY-M-D'),
                    won: this.won,
                    nbAttempts: this.currentAttempt,
                });

                this.setLSItem('userResults', JSON.stringify(this.userResults));

                // Recalcul des streaks & victoires (temporaire)
                if (!this.archivesMode)
                try {
                    let expected = games.reduce((ac, game, i) => {
                        let today = moment(game.date, 'YYYY-M-D');
                        let yesterday = today.clone().subtract(1, 'day');
                        let yesterdaysGame = games.slice(i - 1, i).find(g => g.date === yesterday.format('YYYY-M-D'));
                        // console.log('parse', game.date, today.format('YYYY-M-D'), yesterday.format('YYYY-M-D'), yesterdaysGame)
                        let isStreak = Boolean(yesterdaysGame && yesterdaysGame.won);
                        ac.nbGames++;
                        if (game.won) {
                            ac.nbWins += 1;
                            ac.currentStreak = isStreak ? ac.currentStreak + 1 : 1;
                        } else {
                            ac.currentStreak = 0;
                        }

                        if (ac.currentStreak > ac.bestStreak) {
                            ac.bestStreak = ac.currentStreak;
                        }

                        return ac;
                    }, {
                        nbGames: 0,
                        nbWins: 0,
                        currentStreak: 0,
                        bestStreak: 0
                    });

                    // console.log(expected, this.userResults);
                    
                    let updated = false;
                    Object.entries(expected).filter(([k, v]) => this.userResults[k] !== v).forEach(([k, v]) => {
                        // console.log(`fixing "${k}" value, expected ${v}, got ${this.userResults[k]}`)
                        this.userResults[k] = v;
                        updated = true;
                    });

                    if (updated) {
                        this.setLSItem('userResults', JSON.stringify(this.userResults));
                    }
                } catch (err) {
                    console.error(err);
                }

            }
            window.setTimeout(() => { 
                this.statsOpened = true;
            }, 2000);
        },
        scrollStatsToBottom() {
            let stats = document.querySelector('.endgame-modal-content');
            stats.scrollTo({
                top: stats.scrollHeight,
                behavior: 'smooth'
            });
        },
        getAttemptStat(attemptNumber) {
            let iteration = 0;
            this.userResults.games.forEach((game) => {
                if (game.nbAttempts === attemptNumber) {
                    iteration++;
                }
            });
            return iteration;
        },
        getAttemptStatPercent(attemptNumber) {
            if (this.getAttemptStat(attemptNumber) === 0) {
                return 0;
            }
            let attemptPercent = Math.round((this.getAttemptStat(attemptNumber) / this.userResults.nbGames) * 100);
            this.bestAttemptPercent = attemptPercent > this.bestAttemptPercent ? attemptPercent : this.bestAttemptPercent;
            return attemptPercent;
        },
        getWordID() {
            let day = this.archivesMode ? this.archivesDate : this.today
            return day.clone().startOf('day').diff(FIRST_DAY, 'days') + 1
        },
        // Shitty function name to avoid shitty adblockers
        sh4reAntiAdblock() {
            const wordID = this.getWordID()
            const middle = this.archivesMode ? `archive${wordID > 0 ? ` #${wordID}`:''} [${this.archivesDate.format('DD/MM/YYYY')}]` : `#${wordID}`

            const title = `Le Mot Simple (@WordleFR) ${middle} ${this.currentAttempt <= NB_ATTEMPTS ? this.currentAttempt : '💀' }/${NB_ATTEMPTS}\n\n`;
            let schema = this.results.slice(0, this.currentAttempt).map((result) => {
                return result.map((letter) => {
                    if (letter === 'correct') {
                        return '🟩';
                    } else if (letter === 'partial') {
                        return '🟨';
                    } else {
                        return '⬛';
                    }
                }).join('');
            }).join('\n');
            const url = "https://wordle.richie.fr";

            let sharedContent = title + schema;

            if (this.sharedLink) {
                sharedContent = sharedContent + '\n\n' + url;
            }
            
            this.saveToClipboard(sharedContent);
            
        },
        async saveToClipboard (content) {
            const errMsg = "Votre navigateur ne permet pas de copier du texte via un bouton. Une solution alternative sera proposée dans une prochaine mise à jour."
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(content).then(() => this.changeCopiedStatus()).catch(() => alert(errMsg));
            } else if (typeof document.execCommand === 'function') {
                var clipboardBuffer = document.getElementById('clipboard-buffer')
                clipboardBuffer.value = content
                clipboardBuffer.style.display='block'
                clipboardBuffer.focus()
                clipboardBuffer.setSelectionRange(0, content.length); // select() does not work on old browsers (Safari/Firefox on iPhone 6 for instance)
                document.execCommand("copy");
                clipboardBuffer.style.display='none'
                clipboardBuffer.blur();
                clipboardBuffer.value = ''
                this.changeCopiedStatus()
            } else {
                alert(errMsg);
            }
        },
        formatDate(date) {
            return moment(date).format('DD/MM/YYYY');
        },
        changeCopiedStatus() {
            this.resultsCopied = true;
            setTimeout(() => (this.resultsCopied = false), 10000);
        }
    }
}
</script>

<style lang="sass" scoped>
#clipboard-buffer
  display: none
  width: 150px
  height: 40px

#game
    display: flex
    align-items: center
    justify-content: center
    width: 100%
    height: 100%
    overflow: hidden
    display: flex
    flex-direction: column
    background: #0E0E0F
    header
        width: 100%
        height: 60px
        display: flex
        justify-content: center
        background: #1D1D20
        @media (max-height: 540px)
            height: 40px
        .header-container
            max-width: 500px
            width: 100%
            height: 100%
            display: flex
            align-items: center
            justify-content: space-between
            @media (max-width: 512px)
                padding: 0 12px
                box-sizing: border-box
            .game-title
                .title
                    display: flex
                    align-items: center
                    justify-content: center
                    .letter
                        display: flex
                        align-items: center
                        justify-content: center
                        width: 24px
                        height: 24px
                        margin: 0 3px
                        font-size: 14px
                        font-weight: 700
                        border-radius: 4px
                        text-transform: uppercase
                        color: white
                        @media (max-height: 540px)
                            width: 20px
                            height: 20px
                            font-size: 12px
                            margin: 0 2px
                        @media (max-width: 320px)
                            width: 20px
                            height: 20px
                            font-size: 12px
                            margin: 0 1px
                        &.correct
                            background-color: #3EAA42
                        &.partial
                            background-color: #CD8729
                        &.incorrect
                            background-color: none
                            width: 14px
                    .space
                        width: 14px
                        @media (max-width: 320px)
                            width: 10px
                .subtitle
                    margin-top: 0.5em
                    font-size: 0.8em
            .archives-selector
                display: flex
                align-items: center
                justify-content: center
                color: white
                .archives-date
                    display: flex
                    align-items: center
                    justify-content: center
                    width: 100px
                    font-size: 14px
                    @media (max-width: 372px)
                        font-size: 13px
                        width: 84px
                    @media (max-width: 320px)
                        font-size: 11px
                        width: 70px
            .header-right, .header-left
                display: flex
                width: 70px
                justify-content: space-between
                @media (max-height: 540px)
                    width: 62px
            .header-right
                flex-direction: row-reverse
            .icon-btn
                position: relative
                display: flex
                align-items: center
                justify-content: center
                width: 32px
                height: 32px
                background-color: #3A3A3C
                border-radius: 5px
                border-bottom: 2px solid #2B2B2B
                cursor: pointer
                transition: all .3s
                @media (max-height: 540px)
                    width: 28px
                    height: 28px
                &:hover
                    background-color: #474748
                    border-color: #313131
                &:active
                    background-color: #2B2B2B
                    border-color: #2B2B2B
                &.pressed
                    background-color: #3EAA42
                    border-color: #157D19
                &.disabled
                    background: none
                    border: 2px solid #2C2C2C
                    cursor: default
                    .icon
                        opacity: .5
                .icon
                    height: 13px
                    user-select: none
    main
        max-width: 500px
        height: 95%
        display: flex
        flex-direction: column
        align-items: center
        justify-content: space-between
        box-sizing: border-box
        position: relative
        .fade-enter-active, .fade-leave-active
            transition: opacity .5s
        .fade-enter, .fade-leave-to
            opacity: 0
        .fadeup-enter-active, .fade-leave-active
            transition: opacity .5s
        .fadeup-enter, .fade-leave-to
            opacity: 0
            transform: translateY(10px)
        .error
            top: 20px
            margin-top: 6px
            position: absolute
            background: #ebebeb
            color: #121213
            padding: 0.5em 1em
            border-radius: 0.5em
            font-size: 18px
            font-weight: bold
            z-index: 10
        .grid
            margin-top: auto
            margin-bottom: auto
            .attempt
                display: flex
                animation-duration: 0.3s
                perspective: 800px
                &.shake
                    animation-name: shake
        .keyboard
            margin-bottom: 20px
            @media (max-height: 900px)
                margin-bottom: 7px
            .keyboard-line
                margin-top: 10px
                &:first-child
                    margin: 0
                @media (max-height: 540px)
                    margin-top: 4px
        .modal-backdrop
                position: fixed
                width: 100vw
                height: 100vh
                top: 0
                left: 0
        .help-modal
            position: fixed
            display: flex
            width: 100vw
            height: 100vh
            display: flex
            justify-content: center
            align-items: center
            background: rgba(0, 0, 0, 0.7)
            top: 0
            left: 0
            z-index: 10
            .help-modal-content
                position: relative
                display: flex
                align-items: flex-start
                flex-direction: column
                max-width: 450px
                width: 90%
                max-height: 90%
                box-sizing: border-box
                padding: 24px
                background: #1D1D20
                border-radius: 8px
                overflow-y: auto
                scrollbar-width: thin
                scrollbar-color: #d2d2d280 #fff0
                &::-webkit-scrollbar
                    -webkit-appearance: none
                    width: 4px
                &::-webkit-scrollbar-thumb
                    border-radius: 4px
                    background: rgba(0, 0, 0, 0.6)
                    &:hover 
                        background: rgba(0, 0, 0, 1)
                
                .close-btn
                    position: absolute
                    top: 24px
                    right: 24px
                    display: flex
                    align-items: center
                    justify-content: center
                    width: 24px
                    height: 24px
                    background-color: #3A3A3C
                    border-radius: 5px
                    border-bottom: 2px solid #2B2B2B
                    cursor: pointer
                    transition: all .3s
                    &:hover
                        background-color: #474748
                        border-color: #313131
                        .icon
                            transform: rotate(90deg)
                    &:active
                        background-color: #2B2B2B
                        border-color: #2B2B2B
                    .icon
                        height: 10px
                        transition: all .3s
                h2
                    color: white
                    font-size: 20px
                    font-weight: 700
                    margin-bottom: 16px
                p
                    font-size: 14px
                    line-height: 1.3
                    margin-bottom: 12px
                    text-align: left
                    color: #8E8E90
                    &:last-child
                        margin-bottom: 0
                    a
                        color: white
                        text-decoration: none
                        &:hover
                            text-decoration: underline
                .help-exemple
                    .help-word
                        display: flex
                        margin-top: 24px
                        margin-bottom: 8px
                        .help-letter-container
                            width: 36px
                            height: 36px
                            border: 2px solid #646464
                            box-sizing: border-box
                            margin: 2px
                            border-radius: 4px
                            display: flex
                            align-items: center
                            justify-content: center
                            font-size: 16px
                            font-weight: bold
                            color: white
                            &.correct
                                border: none
                                background: #3EAA42
                                &.color-blind
                                    background: #F5793A
                            &.partial
                                border: none
                                background: #CD8729

                                &.color-blind
                                    background: #85C0F9
                            &.incorrect
                                border: none
                                background: #3A3A3C
                    p
                        span
                            font-weight: bold
                            &.correct
                                color: #3EAA42
                                &.color-blind
                                    color: #F5793A
                            &.partial
                                color: #CD8729
                                &.color-blind
                                    color: #85C0F9
        .endgame-modal
            position: fixed
            display: flex
            flex-direction: column
            width: 100vw
            height: 100vh
            display: flex
            justify-content: center
            align-items: center
            background: rgba(0, 0, 0, 0.7)
            top: 0
            left: 0
            z-index: 10
            .endgame-modal-content
                position: relative
                display: flex
                align-items: flex-start
                flex-direction: column
                max-width: 450px
                width: 90%
                max-height: 90%
                box-sizing: border-box
                padding: 24px
                background: #1D1D20
                border-radius: 8px
                overflow-y: auto
                scrollbar-width: thin
                scrollbar-color: #d2d2d280 #fff0
                &::-webkit-scrollbar
                    -webkit-appearance: none
                    width: 4px
                &::-webkit-scrollbar-thumb
                    border-radius: 4px
                    background: rgba(0, 0, 0, 0.6)
                    &:hover 
                        background: rgba(0, 0, 0, 1)
                &.finished
                    border-bottom-left-radius: 0
                    border-bottom-right-radius: 0
                .close-btn
                    position: absolute
                    top: 24px
                    right: 24px
                    display: flex
                    align-items: center
                    justify-content: center
                    width: 24px
                    height: 24px
                    background-color: #3A3A3C
                    border-radius: 5px
                    border-bottom: 2px solid #2B2B2B
                    cursor: pointer
                    transition: all .3s
                    &:hover
                        background-color: #474748
                        border-color: #313131
                        .icon
                            transform: rotate(90deg)
                    &:active
                        background-color: #2B2B2B
                        border-color: #2B2B2B
                    .icon
                        height: 10px
                        transition: all .3s
                h2
                    color: white
                    font-size: 20px
                    font-weight: 700
                    margin-bottom: 16px
                .stats
                    margin-bottom: 32px
                    width: 100%
                    .stats-content
                        display: flex
                        @media (max-width: 380px)
                            flex-direction: column
                        .stats-line
                            display: flex
                            flex: 1
                            &:first-child
                                margin-right: 8px
                            @media (max-width: 380px)
                                &:first-child
                                    margin-right: 0px
                                &:first-child
                                    margin-bottom: 8px
                            .stats-item
                                display: flex
                                flex: 1
                                flex-direction: column
                                align-items: center
                                justify-content: center
                                height: 80px
                                margin-right: 8px
                                background-color: #0E0E0F
                                border-radius: 6px
                                &:last-child
                                    margin-right: 0
                                .stat-item-figure
                                    font-size: 28px
                                    font-weight: bold
                                    color: #3EAA42
                                .stat-item-label
                                    display: flex
                                    align-items: center
                                    height: 30px
                                    font-size: 12px
                                    color: white
                                    margin: 0 8px
                .graph
                    width: 100%
                    display: flex
                    flex-direction: column
                    .graph-content
                        width: 100%
                        display: flex
                        flex-direction: column
                        .graph-item
                            margin-top: 8px
                            width: 100%
                            display: flex
                            align-items: center
                            font-size: 12px
                            font-weight: 700
                            color: white
                            &:first-child
                                margin-top: 0
                            .attempt-number
                                width: 18px
                                display: flex
                                align-items: center
                            .attempt-skull
                                width: 18px
                                display: flex
                                align-items: center
                                .icon
                                    height: 10px
                            .attempt-stat
                                height: 17px
                                width: 100%
                                .attempt-bar
                                    height: 100%
                                    background: #3A3A3C
                                    color: white
                                    font-size: 10px
                                    font-weight: 400
                                    display: flex
                                    box-sizing: border-box
                                    padding: 0 6px
                                    justify-content: flex-end
                                    align-items: center
                                    min-width: 28px
                                    border-radius: 3px
                                    &.best
                                        background: #3EAA42
                .soluce
                    &.special
                        h2
                            margin-bottom: 0
                        .special-s
                            color: #E21C46
                        .ctas
                            .btn.support-btn
                                background: #E21C46
                                border-bottom: 2px solid #B90029
                                padding: 0 16px
                                p
                                    width: 100%
                                &.stretched
                                    height: 45px
                    display: flex
                    flex-direction: column
                    align-items: center
                    margin-top: 16px
                    width: 100%
                    .subtitle
                        font-size: 12px
                        font-weight: 700
                        color: rgba(255, 255, 255, 0.5)
                        &.special
                            margin-bottom: 12px
                            max-width: 225px
                    .big
                        font-size: 18px
                        font-weight: 700
                        color: white
                        margin-bottom: 16px
                        max-width: 250px
                    h2
                        margin-bottom: 8px
                    .ctas
                        display: flex
                        align-items: center
                        justify-content: center
                        .btn
                            display: flex
                            align-items: center
                            justify-content: center
                            width: 108px
                            height: 36px
                            border-radius: 5px
                            margin: 0 4px
                            color: white
                            text-decoration: none
                            font-size: 14px
                            font-weight: 700
                            cursor: pointer
                            user-select: none
                            .icon
                                height: 14px
                                margin-right: 8px
                            &.support-btn
                                background-color: #3A3A3C
                                border-bottom: 2px solid #2B2B2B
                                width: 224px
                                margin-top: 8px
                                .icon
                                    height: 16px
                            &.definition-btn
                                background-color: #3A3A3C
                                border-bottom: 2px solid #2B2B2B
                                &:hover
                                    background-color: #474748
                                    border-color: #313131
                                &:active
                                    background-color: #2B2B2B
                                    border-color: #2B2B2B
                            // Shitty class name to avoid shitty adblocker
                            &.sh4re-btn-anti-adblock
                                background-color: #3EAA42
                                border-bottom: 2px solid #157D19
                                &:hover
                                    background-color: #44b848
                                    border-color: #1c9320
                                &:active
                                    background-color: #157D19
                                    border-color: #157D19
                    .special-logo
                        margin-top: 16px
                        height: 36px
                        img
                            width: 100%
                            height: 100%
                            object-fit: contain
            .modal-footer
                display: flex
                flex-direction: column
                width: 100%
                justify-content: center
                align-items: center
                max-width: 450px
                width: 90%
                box-sizing: border-box
                padding: 12px
                background-color: #141415
                border-bottom-left-radius: 8px
                border-bottom-right-radius: 8px
                .next-in
                    display: flex
                    font-size: 12px
                    font-weight: 700
                    color: rgba(255, 255, 255, 0.5)
                    margin-bottom: 2px
                .time
                    font-size: 20px
                    font-weight: 700
                    color: white
        .settings-modal
            position: fixed
            display: flex
            flex-direction: column
            width: 100vw
            height: 100vh
            display: flex
            justify-content: center
            align-items: center
            background: rgba(0, 0, 0, 0.7)
            top: 0
            left: 0
            z-index: 10
            .settings-modal-content
                position: relative
                display: flex
                align-items: flex-start
                flex-direction: column
                max-width: 450px
                width: 90%
                box-sizing: border-box
                padding: 24px
                background: #1D1D20
                border-radius: 8px
                min-height: 420px
                max-height: 100%
                overflow-y: auto
                background: #121213
                border-radius: 8px
                overflow-y: auto
                scrollbar-width: thin
                scrollbar-color: #d2d2d280 #fff0
                &::-webkit-scrollbar
                    -webkit-appearance: none
                    width: 4px
                &::-webkit-scrollbar-thumb
                    border-radius: 4px
                    background: rgba(0, 0, 0, 0.6)
                    &:hover 
                        background: rgba(0, 0, 0, 1)
                .close-btn
                    position: absolute
                    top: 24px
                    right: 24px
                    display: flex
                    align-items: center
                    justify-content: center
                    width: 24px
                    height: 24px
                    background-color: #3A3A3C
                    border-radius: 5px
                    border-bottom: 2px solid #2B2B2B
                    cursor: pointer
                    transition: all .3s
                    &:hover
                        background-color: #474748
                        border-color: #313131
                        .icon
                            transform: rotate(90deg)
                    &:active
                        background-color: #2B2B2B
                        border-color: #2B2B2B
                    .icon
                        height: 10px
                        transition: all .3s
                h2
                    color: white
                    font-size: 20px
                    font-weight: 700
                    margin-bottom: 16px
                h3
                    font-size: 14px
                    font-weight: 700
                    color: #8E8E90
                .settings-content
                    width: 100%
                    .settings-item
                        width: 100%
                        padding: 8px 0
                        &.setting-toggle
                            display: flex
                            justify-content: space-between
                            align-items: center
                            .toggle-button
                                background: #3A3A3C
                                width: 46px
                                height: 25px
                                border-radius: 100px
                                box-sizing: border-box
                                cursor: pointer
                                transition: all 0.3s
                                position: relative
                                .toggle
                                    background: white
                                    width: 17px
                                    height: 17px
                                    border-radius: 100px
                                    position: absolute
                                    left: 4px
                                    top: 4px
                                    transition: all 0.3s
                                &.activated
                                    background: #3EAA42
                                    .toggle
                                        transform: translateX(21px)
                        &.setting-button
                            display: flex
                            justify-content: space-between
                            align-items: center
                            .btn
                                cursor: pointer
                            .buttons
                                background: #3A3A3C
                                border-radius: 100px
                                button
                                    font-family: Outfit, Avenir, Helvetica, Arial, sans-serif
                                    height: 25px
                                    padding: 0
                                    width: 68px
                                    background: none
                                    cursor: pointer
                                    font-size: 11px
                                    font-weight: 700
                                    color: white
                                    border: none
                                    &.selected
                                        background: #3EAA42
                                        border-radius: 100px
                            @media (max-width: 450px)
                                .keyboard-buttons
                                    display: flex
                                    flex-direction: column
                                    border-radius: 12px
                    .credits
                        h2
                            text-align: left
                            margin-top: 32px
                        p
                            font-size: 14px
                            line-height: 1.3
                            margin-bottom: 12px
                            text-align: left
                            color: #8E8E90
                            &:last-child
                                margin-bottom: 0
                            a
                                color: white
                                text-decoration: none
                                &:hover
                                    text-decoration: underline

@keyframes shake
    0%
        transform: translateX(0)
    20%
        transform: translateX(-10px)
    40%
        transform: translateX(10px)
    60%
        transform: translateX(-10px)
    80%
        transform: translateX(10px)
    100%
        transform: translateX(0)
</style>
