<template>
    <button id="key" @click="handleClick" :class="{ 
        big,
        correct: color === 'correct', 
        partial: color === 'partial', 
        incorrect: color === 'incorrect',
        'color-blind': colorBlindMode,
    }">
        <div v-if="['Entrer', 'Suppr'].includes(keyContent)">
            <img :src="`/icons/${keyContent.toLowerCase()}.svg`" :alt="keyContent" class="icon" />
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
    height: 50px
    cursor: pointer
    margin: 2px
    font-size: 18px
    font-weight: 700
    color: #FFFFFF
    background: #636363
    border-radius: 4px
    border: none
    border-bottom: 2px solid #4D4D4D
    &:active
        background: #4D4D4D
    &.big
        width: 90px
    &.correct
        background: #3EAA42
        border-color: #157D19
        &:active
            background: #157D19
        &.color-blind
            background: #F5793A
            border-color: #CB581E
            &:active
                background: #CB581E
    &.partial
        background: #D3952A
        border-color: #A06F19
        &:active
            background: #A06F19
        &.color-blind
            background: #85C0F9
            border-color: #3C80C1
            &:active
                background: #3C80C1
    &.incorrect
        background: #2C2C2C
        border-color: #212121
        color: #969696

        &:active
            background: #212121
    .icon
        height: 13px
    @media (max-width: 500px)
        width: 34px
        &.big
            width: 72px
    @media (max-width: 393px)
        width: 32px
        &.big
            width: 68px
    @media (max-width: 372px)
        width: 28px
        &.big
            width: 60px
    @media (max-width: 320px)
        width: 22px
        &.big
            width: 48px
    @media (max-height: 600px)
        height: 48px
</style>