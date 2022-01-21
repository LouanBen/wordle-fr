<template>
    <div id="game">
        <header>
            <div class="header-container">
                <div class="header-left">
                    <div class="icon-btn help" @click="helpOpened = true">
                        <img class="icon" src="/icons/help.svg" />
                    </div>
                </div>
                <div class="game-title"><!--MORDLE-->
                    <div class="letter correct">L</div>
                    <div class="letter incorrect">E</div>
                    <div class="space"></div>
                    <div class="letter partial">M</div>
                    <div class="letter incorrect">O</div>
                    <div class="letter incorrect">T</div>
                </div> 
                <div class="header-right">
                    <div class="icon-btn stats" @click="statsOpened = true">
                        <img class="icon" src="/icons/stats.svg" />
                    </div>
                    <div class="icon-btn settings" @click="settingsOpened = true">
                        <img class="icon" src="/icons/settings.svg" />
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
                        @update:handleClick="handleKeyClick($event)"
                    />
                </div>
            </div>
            <transition name="fadeup">
                <div class="help-modal" v-if="helpOpened">
                    <div class="help-modal-content">
                        <div class="close-btn" @click="helpOpened = false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#919191" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </div>
                        <div class="help-content">
                            <h2>Comment jouer ?</h2>
                            <p>Ce jeu reprend exactement le même concept que le <a href="https://www.powerlanguage.co.uk/wordle/">Wordle</a>, mais en français.</p>
                            <p>Chaque jour, un mot de 5 lettres est choisi aléatoirement. Vous devez le deviner en 6 essais.</p>
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
                                <p>La lettre <span>F</span> est dans le mot, à la bonne place.</p>
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
                                <p>La lettre <span>C</span> est dans le mot, mais pas à la bonne place.</p>
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
                    <div class="endgame-modal-content">
                        <div class="close-btn" @click="statsOpened = false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#919191" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </div>
                        <div class="stats">
                            <h2>Statistiques</h2>
                            <div class="stats-content">
                                <div class="stats-item games-played">
                                    <p class="stat-item-figure">{{ userResults.nbGames }}</p>
                                    <p class="stat-item-label">Parties</p>
                                </div>
                                <div class="stats-item win-rate">
                                    <p class="stat-item-figure">{{ Math.round((userResults.nbGames > 0 ? userResults.nbWins / userResults.nbGames : 0) * 100) }}</p>
                                    <p class="stat-item-label">Victoires (%)</p>
                                </div>
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
                        <div class="graph">
                            <h2>Performances</h2>
                            <div class="graph-content">
                                <div class="graph-item" v-for="attempt in NB_ATTEMPTS + 1" :key="attempt">
                                    <div class="attempt-number" v-if="attempt <= NB_ATTEMPTS">{{ attempt }}</div>
                                    <div class="attempt-skull" v-else>
                                        💀
                                    </div>
                                    <div class="attempt-stat">
                                        <div class="attempt-bar" :class="{ best: getAttemptStatPercent(attempt) === bestAttemptPercent && getAttemptStat(attempt) > 0 }" :style="{ width: `${getAttemptStatPercent(attempt)}%`}">{{ getAttemptStat(attempt) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="soluce" v-if="finished">Le mot était : 
                            <strong>{{ wordOfTheDay }}</strong> 
                            <a :href="`https://1mot.net/${this.wordOfTheDay.toLowerCase()}`" target="_blank" class="definition-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Définition</title><path d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 11-26 26 26 26 0 0126-26zm48 226h-88a16 16 0 010-32h28v-88h-16a16 16 0 010-32h32a16 16 0 0116 16v104h28a16 16 0 010 32z"/></svg>
                            </a>
                        </div>
                        <div class="modal-footer" v-if="finished">
                            <div class="next-in">Prochain mot dans : <strong class="time">{{ countdownToNextWord }}</strong></div>
                            <div class="separator"></div>
                            <div class="share">
                                <button class="share-button" @click="share">
                                    <p>{{resultsCopied ? 'Copié !' : 'Partager'}}</p>
                                    <svg v-if="!resultsCopied" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Partager</title><path d="M384 336a63.78 63.78 0 00-46.12 19.7l-148-83.27a63.85 63.85 0 000-32.86l148-83.27a63.8 63.8 0 10-15.73-27.87l-148 83.27a64 64 0 100 88.6l148 83.27A64 64 0 10384 336z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="fadeup">
                <div class="settings-modal" v-if="settingsOpened">
                    <div class="settings-modal-content">
                        <div class="close-btn" @click="settingsOpened = false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#919191" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </div>
                        <div class="settings-content">
                            <h2>Paramètres</h2>
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
                                <div class="buttons">
                                    <button class="first" :class="{ selected: keyboard.name === KEYBOARD_AZERTY.name }" @click="keyboard = KEYBOARD_AZERTY">AZERTY</button>
                                    <button :class="{ selected: keyboard.name === KEYBOARD_QWERTY.name }" @click="keyboard = KEYBOARD_QWERTY">QWERTY</button>
                                    <button class="last" :class="{ selected: keyboard.name === KEYBOARD_QWERTZ.name }" @click="keyboard = KEYBOARD_QWERTZ">QWERTZ</button>
                                </div>
                            </div>
                            <div class="settings-item credits">
                                <h3>Crédits</h3>
                                <p>
                                    Jeu développé par <a href="https://twitter.com/louanben">@louanben</a>.
                                </p>
                                <p>
                                    Concept et design librement inspirés de <strong>Wordle</strong> par <a href="https://twitter.com/powerlanguish">@powerlanguish</a> (Josh Wardle).
                                </p>
                                <p>
                                    Merci à <a href="https://twitter.com/Richiesque">Richie</a> pour son aide précieuse !
                                </p>
                                <p>
                                    Pour toute demandes, contacter <strong>@louanben</strong> sur Twitter, ou bien par mail : <strong>louanben.pro@gmail.com</strong>
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
            NB_LETTERS,
            NB_ATTEMPTS,
            KEYBOARD_AZERTY,
            KEYBOARD_QWERTY,
            KEYBOARD_QWERTZ,
            keyboard: KEYBOARD_AZERTY,
            today: moment(),
            words,
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
            isStreak: false,
            animateLetter: true,
            bestAttemptPercent: 0,
            resultsCopied: false,
            userResults: {
                nbGames: 0,
                nbWins: 0,
                currentStreak: 0,
                bestStreak: 0,
                games: [],
            },
            // {
            //     nbGames: 0,
            //     nbWins: 0,
            //     currentStreak: 0,
            //     bestStreak: 0,
            //     games: [
            //         {
            //              date: '',
            //              won: false,
            //              nbAttempts: 6,
            //          }
            //     ],
            // }
        }
    },
    mounted() {

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
    },
    watch: {
        sharedLink() {
            localStorage.setItem('sharedLink', JSON.stringify(this.sharedLink));
        },
        colorBlindMode() {
            localStorage.setItem('colorBlindMode', JSON.stringify(this.colorBlindMode));
        },
        keyboard() {
            localStorage.setItem('keyboard', JSON.stringify(this.keyboard));
        },
    },
    methods: {
        async getWordOfTheDay() {
            const formatedDate = this.today.format('YYYY-M-D');
            const seed = seedrandom(formatedDate);
            const random = seed();
            this.wordOfTheDay = this.words[Math.floor(random * (this.words.indexOf('PIZZA') + 1))];

            // Forcing temporaire pour éviter de changer le mot du jour de déploiement
            if (formatedDate === '2022-1-14')
                this.wordOfTheDay = 'SMURA'.split('').reverse().join('')
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
            }
        },
        reset() {
            localStorage.setItem('attempts', JSON.stringify(this.attempts));
            localStorage.setItem('results', JSON.stringify(this.results));
            localStorage.setItem('currentAttempt', JSON.stringify(this.currentAttempt));
            localStorage.setItem('correctLetters', JSON.stringify(this.correctLetters));
            localStorage.setItem('partialLetters', JSON.stringify(this.partialLetters));
            localStorage.setItem('incorrectLetters', JSON.stringify(this.incorrectLetters));
            localStorage.setItem('won', JSON.stringify(this.won));
            localStorage.setItem('finished', JSON.stringify(this.finished));
            let yesterday = moment().subtract(1, 'day')
            if (localStorage.getItem('lastSave') === yesterday.format('YYYY-M-D')) {
                this.isStreak = true;
            }
            localStorage.setItem('lastSave', this.today.format('YYYY-M-D'));
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
            localStorage.setItem('lastSave', this.today.format('YYYY-M-D'));
            this.animateLetter = true;
            this.error = '';
            if (key === 'Entrer') {
                this.verifyWord(this.attempts[this.currentAttempt - 1]);
            } else if (key === 'Suppr') {
                if(!this.userResults.games.find((game) => {
                    return game.date === this.today.format('YYYY-M-D');
                })) {
                    this.attempts[this.currentAttempt - 1].pop();
                }
            } else if (this.attempts[this.currentAttempt - 1].length < NB_LETTERS) {
                this.attempts[this.currentAttempt - 1].push(key);
            }
            localStorage.setItem('attempts', JSON.stringify(this.attempts));
        },
        verifyWord(attempt) {
            if (attempt.length === NB_LETTERS) {
                if (this.words.includes(attempt.join('')) || playableWords.includes(attempt.join(''))) {
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
            localStorage.setItem('results', JSON.stringify(this.results));
            localStorage.setItem('correctLetters', JSON.stringify(this.correctLetters));
            localStorage.setItem('partialLetters', JSON.stringify(this.partialLetters));
            localStorage.setItem('incorrectLetters', JSON.stringify(this.incorrectLetters));
            if (attempt.join('') === this.wordOfTheDay) {
                this.won = true;
                this.finished = true;
                this.getStats();
            } else {
                this.currentAttempt++;
                if (this.currentAttempt > NB_ATTEMPTS) {
                    this.finished = true;
                    this.getStats();
                }
            }
            localStorage.setItem('currentAttempt', JSON.stringify(this.currentAttempt));
            localStorage.setItem('won', JSON.stringify(this.won));
            localStorage.setItem('finished', JSON.stringify(this.finished));
        },
        getStats() {
            if(!this.userResults.games.find((game) => {
                return game.date === this.today.format('YYYY-M-D');
            })) {
                this.userResults.nbGames++;
                this.userResults.nbWins += this.won ? 1 : 0;
                this.userResults.currentStreak = this.isStreak && this.won ? this.userResults.currentStreak + 1 : 1;
                if (this.userResults.currentStreak > this.userResults.bestStreak) {
                    this.userResults.bestStreak = this.userResults.currentStreak;
                }
                this.userResults.games.push({
                    date: this.today.format('YYYY-M-D'),
                    won: this.won,
                    nbAttempts: this.currentAttempt,
                });
                localStorage.setItem('userResults', JSON.stringify(this.userResults));
            }
            window.setTimeout(() => { this.statsOpened = true }, 2000);
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
            return this.today.clone().startOf('day').diff(moment("2022-01-10T00:00:00"), 'days') + 1
        },
        share() {
            const title = `Le Mot (@WordleFR) #${this.getWordID()} ${this.currentAttempt <= NB_ATTEMPTS ? this.currentAttempt : '💀' }/${NB_ATTEMPTS}\n\n`;
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
            const url = "wordle.louan.me";

            let sharedContent = title + schema;

            if (this.sharedLink) {
                sharedContent = sharedContent + '\n\n' + url;
            }

            navigator.clipboard.writeText(sharedContent);
            this.resultsCopied = true;
        }
    }
}
</script>

<style lang="sass" scoped>
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
                    font-size: 11px
                    font-weight: 700
                    border-radius: 4px
                    text-transform: uppercase
                    color: white
                    &.correct
                        background-color: #3EAA42
                    &.partial
                        background-color: #D3952A
                    &.incorrect
                        background-color: none
                        width: 16px
                .space
                    width: 10px
            .header-right
                display: flex
                width: 70px
                justify-content: space-between
            .header-left 
                width: 70px
            .icon-btn
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
                &:hover
                    background-color: #474748
                    border-color: #313131
                &:active
                    background-color: #2B2B2B
                .icon
                    height: 13px
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
            z-index: 2
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
        .help-modal
            position: fixed
            width: 100vw
            height: 100vh
            display: flex
            justify-content: center
            align-items: center
            background: rgba(0, 0, 0, 0.5)
            top: 0
            left: 0
            z-index: 10
            .help-modal-content
                max-width: 450px
                width: 90%
                min-height: 420px
                max-height: 100%
                overflow-y: auto
                background: #121213
                border-radius: 8px
                padding: 12px
                display: flex
                flex-direction: column
                align-items: center
                font-size: 14px
                position: relative
                .close-btn
                    align-self: flex-end
                    cursor: pointer
                h2
                    text-transform: uppercase
                    padding-bottom: 12px
                    border-bottom: 1px solid #919191
                p
                    margin-top: 12px
                    text-align: left
                    a
                        color: white
                        text-decoration: none
                .help-exemple
                    border-top: 1px solid #919191
                    border-bottom: 1px solid #919191
                    margin-top: 12px
                    padding-bottom: 12px
                    .help-word
                        display: flex
                        margin-top: 12px
                        .help-letter-container
                            width: 36px
                            height: 36px
                            border: 2px solid #919191
                            box-sizing: border-box
                            margin: 2px
                            display: flex
                            align-items: center
                            justify-content: center
                            font-size: 20px
                            font-weight: bold
                            color: white
                            &.correct
                                border: none
                                background: #538D4E
                                &.color-blind
                                    background: #F5793A
                            &.partial
                                border: none
                                background: #B59E3B
                                &.color-blind
                                    background: #85C0F9
                            &.incorrect
                                border: none
                                background: #3A3A3C
                    p
                        span
                            font-weight: bold  
        .endgame-modal
            position: fixed
            width: 100vw
            height: 100vh
            display: flex
            justify-content: center
            align-items: center
            background: rgba(0, 0, 0, 0.5)
            top: 0
            left: 0
            z-index: 10
            .endgame-modal-content
                max-width: 450px
                width: 90%
                min-height: 420px
                max-height: 100%
                overflow-y: auto
                background: #121213
                border-radius: 8px
                padding: 12px
                display: flex
                flex-direction: column
                align-items: center
                h2
                    font-size: 18px
                    text-transform: uppercase
                    font-weight: bold
                .close-btn
                    align-self: flex-end
                    cursor: pointer
                .stats
                    .stats-content
                        display: flex
                        .stats-item
                            margin-top: 12px
                            width: 70px
                            .stat-item-figure
                                font-size: 30px
                                font-weight: bold
                            .stat-item-label
                                font-size: 12px
                .graph
                    margin-top: 18px
                    width: 100%
                    display: flex
                    flex-direction: column
                    align-items: center
                    .graph-content
                        margin-top: 12px
                        width: 80%
                        display: flex
                        flex-direction: column
                        .graph-item
                            margin-top: 6px
                            width: 100%
                            display: flex
                            font-size: 14px
                            .attempt-number
                                width: 20px
                                height: 20px
                                display: flex
                                align-items: center
                                justify-content: center
                            .attempt-skull
                                width: 20px
                                height: 20px
                                display: flex
                                align-items: center
                            .attempt-stat
                                height: 100%
                                width: 100%
                                .attempt-bar
                                    margin-left: 6px
                                    height: 100%
                                    background: #3A3A3C
                                    color: white
                                    display: flex
                                    box-sizing: border-box
                                    padding: 0 6px
                                    justify-content: flex-end
                                    align-items: center
                                    min-width: 20px
                                    &.best
                                        background: #538D4E
                .soluce
                    margin-top: 24px
                    display: flex
                    strong
                        padding-left: 4px
                        display: block
                    .definition-icon
                        svg
                            width: 1em
                            height: 1em
                            margin-left: 8px
                            fill: #919191
                .modal-footer
                    display: flex
                    width: 100%
                    max-width: 400px
                    justify-content: space-around
                    align-items: center
                    margin-top: 24px
                    .next-in
                        display: flex
                        flex-direction: column
                        .time
                            font-size: 24px
                            color: darken(white, 20%)
                    @media (max-width: 400px)
                        margin-top: 12px
                        .next-in
                            font-size: 12px
                            .time
                                font-size: 20px
                    .separator
                        width: 1px
                        height: 36px
                        background: #919191
                    .share
                        .share-button
                            display: flex
                            align-items: center
                            justify-content: space-around
                            background: #538D4E
                            border: none
                            padding: 0.5em 1em
                            border-radius: 8px
                            cursor: pointer
                            width: 136px
                            p
                                text-transform: uppercase
                                font-weight: bold
                                font-size: 14px
                                color: white
                            svg
                                width: 24px
                                height: 24px
                                margin-left: 8px
                                path
                                    fill: white
        .settings-modal
            position: fixed
            width: 100vw
            height: 100vh
            display: flex
            justify-content: center
            align-items: center
            background: rgba(0, 0, 0, 0.5)
            top: 0
            left: 0
            z-index: 10
            .settings-modal-content
                max-width: 450px
                width: 90%
                min-height: 420px
                max-height: 100%
                overflow-y: auto
                background: #121213
                border-radius: 8px
                padding: 12px
                display: flex
                flex-direction: column
                align-items: center
                .close-btn
                    align-self: flex-end
                    cursor: pointer
                h2
                    text-transform: uppercase
                    padding-bottom: 12px
                    border-bottom: 1px solid #919191
                .settings-content
                    width: 100%
                    .settings-item
                        width: 100%
                        padding: 12px 0
                        border-bottom: 1px solid #919191
                        &.setting-toggle
                            display: flex
                            justify-content: space-between
                            align-items: center
                            .toggle-button
                                background: #3A3A3C
                                width: 36px
                                height: 1.2em
                                border-radius: 1.2em
                                box-sizing: border-box
                                cursor: pointer
                                transition: all 0.3s
                                position: relative
                                .toggle
                                    background: #919191
                                    height: calc(100% - 4px)
                                    width: 45%
                                    border-radius: 1.2em
                                    position: absolute
                                    left: 2px
                                    top: 1px
                                    transition: all 0.3s
                                &.activated
                                    background: #538D4E
                                    .toggle
                                        background: white
                                        left: 50%
                        &.setting-button
                            display: flex
                            justify-content: space-between
                            align-items: center
                            button
                                background: transparent
                                cursor: pointer
                                color: #919191
                                border: 1px solid #919191
                                padding: 0.5em 1em
                                &.first
                                    border-radius: 8px 0 0 8px
                                &.last
                                    border-radius: 0 8px 8px 0
                                &.selected
                                    background: #919191
                                    color: white
                                    font-weight: bold
                            @media (max-width: 375px)
                                button
                                    font-size: 12px
                                @media (max-width: 320px)
                                    button
                                        font-size: 10px
                                    @media (max-width: 300px)
                                        button
                                            padding: 0.3em
                        &.credits
                            h3
                                text-align: left
                            p
                                text-align: left
                                margin-top: 6px
                                font-size: 12px
                                line-height: 16px
                                a
                                    color: white
                                    text-decoration: none

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
