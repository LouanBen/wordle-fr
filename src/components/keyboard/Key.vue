<template>
    <button id="key" @click="handleClick" :class="{ 
        big,
        correct: color === 'correct', 
        partial: color === 'partial', 
        incorrect: color === 'incorrect',
        'color-blind': colorBlindMode,
    }">
        {{ keyContent }}
    </button>
</template>

<script>

export default {
    name: 'Key',
    props: {
        keyContent: String,
        color: String,
        colorBlindMode: Boolean,
    },
    data() {
        return {
            big: false,
        }
    },
    mounted() {
        if (this.keyContent === 'Entrer' || this.keyContent === 'Suppr') {
            this.big = true;
        }
    },
    methods: {
        handleClick() {
            this.$emit('update:handleClick', this.keyContent);
        }
    }
}
</script>

<style lang="sass" scoped>
#key
    width: 43px
    height: 58px
    cursor: pointer
    margin: 2px
    font-weight: bold
    color: #D7DADC
    background: #818384
    border-radius: 4px
    border: none
    &.big
        width: 64px
    &.correct
        background: #538D4E
        &.color-blind
            background: #F5793A
    &.partial
        background: #B59E3B
        &.color-blind
            background: #85C0F9
    &.incorrect
        background: #3A3A3C
    &.color-blind
        color: white
    @media (max-width: 500px)
        width: 32px
        &.big
            width: 54px
        @media (max-width: 330px)
            width: 24px
            &.big
                width: 50px
            @media (max-width: 300px)
                width: 22px
                &.big
                    width: 40px
                    font-size: 0.6em
    @media (max-height: 600px)
        height: 48px
</style>