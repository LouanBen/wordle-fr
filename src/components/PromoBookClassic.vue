<!-- This whole page is temporary and done in a rush. Please don't judge the quality and readibility of the code here 😭 -->

<template>
    <div id="promo-book-classic">
        <header>
            <div class="header-container">
                <div class="header-left">
                    <div class="btn back" @click="goBackToGame" title="Retour au jeu">
                        <img class="icon" src="/icons/caret-back.svg" alt="Retour" />
                        Retour
                    </div>
                </div>
                <div class="game-title">
                    <div class="title">
                        <div class="letter correct">L</div>
                        <div class="letter incorrect">E</div>
                        <div class="space"></div>
                        <div class="letter partial">M</div>
                        <div class="letter incorrect">O</div>
                        <div class="letter incorrect">T</div>
                    </div>
                </div>
                <div class="header-right">
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
                <div class="attempt" v-for="attempt, indexA in attempts" :key="indexA" :class="{ shake: error && indexA === currentAttempt - 1 && !finished }">
                    <LetterContainer 
                        v-for="letter, indexL in NB_LETTERS" 
                        :key="letter"
                        :letter="attempts[indexA][indexL]" 
                        :color="results[indexA][indexL]" 
                        :placement="letter" 
                        :animate="false" 
                        :colorBlindMode="colorBlindMode"
                        :hasCursor="indexA === currentAttempt - 1 && indexL === attempts[indexA].length"
                    />
                </div>
            </div>
            <div class="keyboard">
                <div class="keyboard-line" v-for="line, index in keyboard.content" :key="index">
                    <Key
                         v-for="key in line"
                        :key="key"
                        :keyContent="key"
                        color=""
                        :colorBlindMode="colorBlindMode"
                        :keyboardName="keyboard.name"
                        @update:handleClick="handleKeyClick($event)"
                    />
                </div>
            </div>
            <transition name="fadeup">
                <div class="modal" v-if="helpOpened">
                    <div class="modal-backdrop" @click="helpOpened = false"></div>
                    <div class="modal-content">
                        <div class="close-btn" @click="helpOpened = false">
                            <img class="icon" src="/icons/close.svg" alt="Fermer" />
                        </div>
                        <h2>Le Mot - Version Classique</h2>
                        <div class="content">
                            <p>Ici, vous pouvez tester en exclusivité l'une des grilles que vous pourrez retrouver dans mon livre <b>Le Mot - Version Classique.</b></p>
                            <p>Bien que le concept reste similaire aux règles que vous connaissez déjà, il s'agit là d'une variante, qui vous permettra <b>d'expérimenter Le Mot différement.</b></p>
                            <p>En effet, cette fois-ci <b>une grille pré-remplie vous est imposée</b>. À vous de trouver le mot à l'aide des indices qui vous sont donnés dans celle-ci.</p>
                            <p><b>Une seule solution est possible. Saurez-vous la trouver ?</b></p>
                            <div class="ctas"> 
                                <a href="https://www.marabout.com/auteur/louan-bengmah/" target="_blank" class="btn large-btn">
                                    <img class="icon" src="/icons/book.svg" />
                                    En savoir plus
                                </a>
                            </div>
                            <div class="ctas">
                                <div class="ctas-container">
                                    <input @click="goBackToGame" type="button" value="Retour" class="btn">
                                    <input @click="helpOpened = false" type="button" value="Compris !" class="btn primary">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="fadeup">
                <div class="modal" v-if="winOpened">
                    <div class="modal-backdrop" @click="winOpened = false"></div>
                    <div class="modal-content">
                        <div class="close-btn" @click="winOpened = false">
                            <img class="icon" src="/icons/close.svg" alt="Fermer" />
                        </div>
                        <h2>Félicitations !</h2>
                        <div class="content">
                            <p><b>Seul le mot <span class="primary">AMOUR</span> correspondait à cette grille.</b></p>
                            <p>Retrouvez 130 grilles supplémentaires dans <b>Le Mot - Version Classique</b>, disponible en librairie&nbsp;!</p>
                            <p>Sans oublier 130 autres grilles dans <b>Le Mot - Version Extrême</b>&nbsp;! Cette fois, à vous de déterminer l'emplacement des indices...</p>
                            <div class="promo-images">
                                <img class="promo-image" src="/img/le-mot-classique.png" alt="Le Mot - Version Classique" />
                                <img class="promo-image" src="/img/le-mot-extreme.png" alt="Le Mot - Version Extrême" />
                            </div>
                            <div class="ctas">
                                <input @click="goBackToGame" type="button" value="Retour au mot du jour" class="btn large-btn">
                            </div>
                            <div class="ctas"> 
                                <a href="https://www.marabout.com/auteur/louan-bengmah/" target="_blank" class="btn large-btn primary">
                                    <img class="icon" src="/icons/book.svg" />
                                    Découvrir les livres Le Mot
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </main>
    </div>
</template>

<script>
import LetterContainer from "./grid/LetterContainer.vue";
import Key from "./keyboard/Key.vue";

import words from "../assets/json/drawable-words.json";
import playableWords from "../assets/json/playable-words.json";

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
    data() {
        return {
            NB_LETTERS,
            NB_ATTEMPTS,
            KEYBOARD_AZERTY,
            KEYBOARD_BEPO,
            KEYBOARD_QWERTY,
            KEYBOARD_QWERTZ,
            keyboard: KEYBOARD_AZERTY,
            settingsOpened: false,
            helpOpened: true,
            winOpened: false,
            attempts: [
                ['S', 'O', 'T', 'T', 'E'],
                ['C', 'H', 'A', 'N', 'T'],
                ['T', 'U', 'E', 'U', 'R'],
                ['D', 'O', 'G', 'M', 'E'],
                ['C', 'L', 'I', 'N', 'S'],
                []
            ],
            results: [
                ['incorrect', 'partial', 'incorrect', 'incorrect', 'incorrect'],
                ['incorrect', 'incorrect', 'partial', 'incorrect', 'incorrect'],
                ['incorrect', 'incorrect', 'incorrect', 'correct', 'correct'],
                ['incorrect', 'partial', 'incorrect', 'partial', 'incorrect'],
                ['incorrect', 'incorrect', 'incorrect', 'incorrect', 'incorrect'],
                []
            ],
            currentAttempt: 6,
            error: '',
            wordOfTheDay: 'AMOUR',
            colorBlindMode: false,
            finished: false,
        }
    },
    components: {
        LetterContainer,
        Key,
    },
    mounted() {
        window.addEventListener('keydown', this.onKeyDown);

        if (localStorage.getItem('keyboard')) {
            this.keyboard = JSON.parse(localStorage.getItem('keyboard'));
        }
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyDown);
    },
    methods: {
        goBackToGame() {
            this.$emit('goBackToGame');
        },
        goToExtreme() {
            this.$emit('goToExtreme');
        },
        onKeyDown() {
            if (/^[a-zA-Z]$/.test(event.key)) {
                this.handleKeyClick(event.key.toUpperCase());
            } else if (event.key === 'Enter') {
                this.handleKeyClick('Entrer');
            } else if (event.key === 'Backspace') {
                this.handleKeyClick('Suppr');
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
        },
        verifyWord(attempt) {
            if (attempt.length === NB_LETTERS) {
                if (words.includes(attempt.join('')) || playableWords.includes(attempt.join(''))) {
                    if (attempt.join('') === this.wordOfTheDay) {
                        this.finished = true;
                        this.error = 'Bravo !';
                        this.results[this.currentAttempt - 1] = ['correct', 'correct', 'correct', 'correct', 'correct'];
                        window.setTimeout(() => {
                            this.error = '';
                            this.winOpened = true;
                        }, 1000);
                    } else {
                        this.error = 'Perdu ! C\'est pas ça !';
                        window.setTimeout(() => {
                            this.error = '';
                        }, 1000);
                    }
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
    }
}
</script>

<style lang="sass" scoped>
#promo-book-classic
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

            .header-right, .header-left
                display: flex
                width: 70px
                justify-content: space-between
                @media (max-height: 540px)
                    width: 62px
            .header-right
                flex-direction: row-reverse
            .btn
                display: flex
                align-items: center
                justify-content: center
                gap: 4px
                height: 32px
                padding: 0 6px
                background-color: #3A3A3C
                border-radius: 5px
                border-bottom: 2px solid #2B2B2B
                cursor: pointer
                transition: all .3s
                color: white
                font-weight: 700
                @media (max-height: 540px)
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
                .icon
                    height: 13px
                    user-select: none
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
        .modal
            position: fixed
            display: flex
            width: 100vw
            height: 100vh
            justify-content: center
            align-items: center
            background: rgba(0, 0, 0, 0.7)
            top: 0
            left: 0
            z-index: 10
            .modal-content
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
                    @media (max-height: 540px)
                        font-size: 16px
                        margin-bottom: 12px
                p
                    font-size: 14px
                    line-height: 1.3
                    margin-bottom: 12px
                    text-align: left
                    color: #8E8E90
                    @media (max-height: 540px)
                        font-size: 12px
                        margin-bottom: 8px
                    &:last-child
                        margin-bottom: 0
                    a
                        color: white
                        text-decoration: none
                        &:hover
                            text-decoration: underline
                    b
                        color: white
                        font-weight: 700
                    span
                        &.primary
                            color: #3EAA42
                            font-weight: 700
                .promo-images
                    width: 100%
                    display: flex
                    justify-content: space-around
                    gap: 16px
                    margin-bottom: 16px
                    .promo-image
                        width: 160px
                        border-radius: 8px
                        @media (max-width: 420px)
                            width: 140px
                        @media (max-width: 360px)
                            width: 100px
                        
                .ctas
                    width: 100%
                    display: flex
                    justify-content: center
                    &:first-of-type
                        margin-top: 16px
                    .ctas-container
                        display: flex
                        justify-content: center
                        gap: 8px
                        width: 100%
                        max-width: 224px
                .btn
                    display: flex
                    align-items: center
                    justify-content: center
                    width: 108px
                    height: 36px
                    border-radius: 5px
                    margin: 0
                    text-decoration: none
                    font-size: 14px
                    font-weight: 700
                    cursor: pointer
                    user-select: none
                    color: white
                    background-color: #3A3A3C
                    border-bottom: 2px solid #2B2B2B
                    &.large-btn
                        width: 100%
                        max-width: 224px
                        margin: 8px 0
                    &:hover
                        background-color: #474748
                        border-color: #313131
                    &:active
                        background-color: #2B2B2B
                        border-color: #2B2B2B
                    &.primary
                        background-color: #3EAA42
                        border-bottom: 2px solid #157D19
                        &:hover
                            background-color: #44b848
                            border-color: #1c9320
                        &:active
                            background-color: #157D19
                            border-color: #157D19
                    .icon
                        height: 14px
                        margin-right: 8px


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