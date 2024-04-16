<template>
    <button id="key" @click="handleClick"
        :class="[{
            big,
            correct: color === 'correct', 
            partial: color === 'partial', 
            incorrect: color === 'incorrect',
            'color-blind': colorBlindMode,
            'light-mode': lightMode,
        }, isBig && keyboardName]"
    >
        <div v-if="isBig">
            <img v-if="lightMode" :src="`/icons/${keyContent.toLowerCase()}_blk.svg`" :alt="keyContent" class="icon"/>
            <img v-else :src="`/icons/${keyContent.toLowerCase()}.svg`" :alt="keyContent" class="icon"/>
        </div>
        <template v-else>
            {{ keyContent }}
        </template>
    </button>
</template>

<script>

export default {
    name: 'Key',
    props: {
        keyContent: String,
        color: String,
        colorBlindMode: Boolean,
        lightMode: Boolean,
        keyboardName: String
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
    computed: {
        isBig() {
            return ['Entrer','Suppr'].includes(this.keyContent);
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
    height: 60px
    cursor: pointer
    margin: 2px
    font-size: 22px
    font-weight: 700
    color: #FFFFFF
    background: #636363
    &.light-mode
        color: black
        background: #d3d6da
    border-radius: 6px
    border: none
    border-bottom: 2px solid #4D4D4D
    user-select: none
    transition: transform 0.2s
    -webkit-tap-highlight-color: transparent
    @media (max-height: 700px)
        height: 50px
    @media (max-height: 700px), (max-width: 500px)
        font-size: 18px
    &:hover
        background: #5A5A5A
    &:active
        background: #4D4D4D
        transform: translateY(1px)
    &.big
        width: 90px
        &.bepo, &.qwerty, &.qwertz
            width: 66px
    &.correct
        background: #3EAA42
        border-color: #157D19
        &.light-mode
            color: white
        &:active
            background: #157D19
        &.color-blind
            background: #F5793A
            border-color: #CB581E
            &:active
                background: #CB581E
    &.partial
        background: #CD8729
        border-color: #9f6414

        &.light-mode
            color: white
        &:active
            background: #9f6414
        &.color-blind
            background: #85C0F9
            border-color: #3C80C1
            &:active
                background: #3C80C1
    &.incorrect
        background: #2C2C2C
        border-color: #212121
        color: #969696
        &.light-mode
            color: white
            background: #787c7e
            border-color: #6e6e6e

        &:active
            background: #212121
    .icon
        height: 15px
        transform: translateY(1px)
        @media (max-height: 700px), (max-width: 500px)
            height: 13px
    @media (max-width: 500px)
        width: 34px
        &.big
            width: 72px
            &.bepo, &.qwerty, &.qwertz
                width: 53px
    @media (max-width: 393px)
        width: 32px
        &.big
            width: 68px
            &.bepo, &.qwerty, &.qwertz
                width: 50px
    @media (max-width: 372px)
        width: 28px
        &.big
            width: 60px
            &.qwerty, &.qwertz
                width: 44px
    @media (max-width: 320px)
        width: 22px
        &.big
            width: 48px
            &.bepo, &.qwerty, &.qwertz
                width: 35px
    @media (max-height: 600px)
        height: 48px
</style>