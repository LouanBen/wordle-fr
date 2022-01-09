<template>
    <div id="letter-container" :style="{ transitionDelay: `${0.15 + 0.3 * (placement - 1)}s`, animationDelay: `${0.3 * (placement - 1)}s` }" :class="{ 
        validated: color, 
        correct: color === 'correct', 
        partial: color === 'partial', 
        incorrect: color === 'incorrect',
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
    width: 64px
    height: 64px
    border: 2px solid #919191
    box-sizing: border-box
    margin: 2px
    transition: all 0.1s
    &.validated
        border: 2px solid transparent
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
        background: #538D4E
        animation-name: flip
        &.color-blind
            background: #F5793A
    &.partial
        background: #B59E3B
        animation-name: flip
        &.color-blind
            background: #85C0F9
    &.incorrect
        background: #3A3A3C
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
        color: #D1DFD4
        display: flex
        align-items: center
        justify-content: center
        font-weight: bolder
        font-size: 36px

    @keyframes flip
        from
            transform: rotateX(0deg)
        to
            transform: rotateX(180deg)
</style>