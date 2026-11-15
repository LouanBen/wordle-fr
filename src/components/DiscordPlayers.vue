<template>
    <div class="discord-players" v-if="players.length">
        <h2>{{ title }}</h2>
        <div class="player" v-for="player in players" :key="player.user_id">
            <img class="avatar" :src="avatarUrl(player)" alt="" />
            <p class="name">{{ player.name }}</p>
            <div class="grid" :class="{ colorblind: colorBlindMode }">
                <div class="row" v-for="(row, index) in player.grid.split('\n')" :key="index">
                    <span v-for="(cell, column) in row" :key="column" :class="cell"></span>
                </div>
            </div>
            <p class="score">{{ score(player) }}</p>
        </div>
    </div>
</template>

<script>
import { fetchPlayers } from '../discord';

export default {
    name: 'DiscordPlayers',
    props: {
        day: { type: String, required: true },
        colorBlindMode: { type: Boolean, default: false },
    },
    data() {
        return { players: [] };
    },
    computed: {
        title() {
            return this.players.length > 1 ? `${this.players.length} joueurs aujourd'hui` : "1 joueur aujourd'hui";
        },
    },
    // ponytail: loaded each time the stats open; poll or push if live updates matter.
    async mounted() {
        this.players = await fetchPlayers(this.day).catch(() => []);
    },
    methods: {
        score(player) {
            return player.attempts === 7 ? '💀' : `${player.attempts}/6`;
        },
        // Discord's CDN is reached through the Activity's /discord-cdn URL mapping.
        avatarUrl(player) {
            return player.avatar
                ? `/discord-cdn/avatars/${player.user_id}/${player.avatar}.png?size=64`
                : '/discord-cdn/embed/avatars/0.png';
        },
    },
};
</script>

<style lang="sass" scoped>
.discord-players
    margin-top: 24px
    .player
        display: flex
        align-items: center
        gap: 12px
        padding: 8px 0
        .avatar
            width: 32px
            height: 32px
            border-radius: 50%
        .name
            flex: 1
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap
        .score
            font-weight: 700
        .grid
            display: flex
            flex-direction: column
            gap: 2px
            .row
                display: flex
                gap: 2px
            span
                width: 8px
                height: 8px
                border-radius: 2px
                &.c
                    background: #3EAA42
                &.p
                    background: #CD8729
                &.i
                    background: #3A3A3C
            &.colorblind
                .c
                    background: #F5793A
                .p
                    background: #85C0F9
</style>
