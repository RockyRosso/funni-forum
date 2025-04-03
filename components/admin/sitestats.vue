<template>
    <div class="grid-layout" style="gap: 10px; margin-top: 20px">
        <LoadingIndicator
            :is-loading="stats.length === 0 ? true : false"
            loading-text="Retrieving Statistics..."
        />

        <div
            v-for="stat in stats"
            tyle="width: 250px;"
            class="section noshadow primarybackground noposition grid"
        >
            <div>
                <img :src="appConfig.staticAssetsUrl + stat.img" width="200px" />
            </div>

            <div>
                <h3 class="nomargin">
                    <p class="nomargin">{{ stat.name }}:</p>
                </h3>
                <h3 class="nomargin">{{ abbrivationConvert(stat.value) }}</h3>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import abbrivationConvert from '~/assets/scripts/abbreviationConvert';

export default {
    data() {
        return {
            stats: [] as any[],
            appConfig: useAppConfig(),
        };
    },

    methods: {
        abbrivationConvert,

        async loadStats() {
            const stats = await $fetch('/api/stats', {
                method: 'GET',
            });

            if (!stats) return;

            this.stats = stats;
        },
    },

    created() {
        this.loadStats();
    },
};
</script>
