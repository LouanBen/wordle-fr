<template>
    <div id="letter-container" :style="{ transitionDelay: !color ? '0s' : `${0.15 + 0.3 * (placement - 1)}s`, animationDelay: `${0.3 * (placement - 1)}s` }" :class="{ 
        'has-letter': letter,
        validated: color, 
        correct: color === 'correct', 
        partial: color === 'partial', 
        incorrect: color === 'incorrect',
        special: color === 'special',
        'no-animation': !animate,
        'color-blind': colorBlindMode,
    }">
        <div class="letter" v-if="letter" :style="{ transitionDelay: `${0.15 + 0.3 * (placement - 1)}s`}">
            {{ letter }}
        </div>
    </div>
</template>

<script>

export default {
    name: 'LetterContainer',
    props: {
        letter: String,
        placement: Number,
        color: String,
        animate: Boolean,
        colorBlindMode: Boolean,
    },
}
</script>

<style lang="sass" scoped>
#letter-container
    width: 62px
    height: 62px
    border: 3px solid #2F2F2F
    border-radius: 6px
    box-sizing: border-box
    margin: 4px
    transition: transform 0.1s, background 0.1s, border 0.1s
    user-select: none
    &.color-blind
            border-color: #919191
    @media (max-width: 380px)
        width: 54px
        height: 54px
    @media (max-width: 300px)
        width: 48px
        height: 48px
    @media (max-height: 700px)
        width: 48px
        height: 48px
    @media (max-height: 600px)
        width: 40px
        height: 40px
        border-radius: 4px
    @media (max-height: 540px)
        width: 32px
        height: 32px
        border-radius: 3px
    &.has-letter
        border-color: #646464
    &.validated
        animation: flip
        animation-duration: 0.5s
        animation-timing-function: ease-in-out
        animation-fill-mode: forwards
        .letter
            transition: all 0.1s
            transform: rotateX(180deg)
        &.color-blind
            .letter
                color: white
    &.correct
        border-color: #3EAA42
        background: #3EAA42
        animation-name: flip
        &.color-blind
            border-color: #F5793A
            background: #F5793A
    &.partial
        border-color: #D3952A
        background: #D3952A
        animation-name: flip
        &.color-blind
            border-color: #85C0F9
            background: #85C0F9
    &.incorrect
        border-color: #3A3A3C
        background: #3A3A3C
    &.special
        border-color: #E21C46
        background: #E21C46
    &.no-animation
        transition: none
        animation: none
        transform: none
        .letter
            transition: none
            transform: none
    .letter
        width: 100%
        height: 100%
        color: #FFFFFF
        display: flex
        align-items: center
        justify-content: center
        font-weight: bolder
        font-size: 28px
        position: relative
        z-index: 3
        @media (max-height: 540px)
            font-size: 24px

    @keyframes flip
        from
            transform: rotateX(0deg)
        to
            transform: rotateX(180deg)
</style>