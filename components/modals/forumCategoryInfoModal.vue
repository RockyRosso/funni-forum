<template>
    <LazyModal
        :displayName="categoryName"
        @close="enabled = false"
        v-if="enabled"

        
    >
        <div style="max-width: 600px;">
            <p>{{ categoryDescription }}</p>
        </div>
    </LazyModal>
</template>

<script lang="ts">
import { type Category } from '~/assets/types/event';

export default {
    data() {
        return {
            enabled: false,
            name: 'forumCategoryInfo',

            categoryName: '',
            categoryDescription: '',
        };
    },

    mounted() {
        this.$on(`showModal_${this.name}`, (options: Category) => {
            this.categoryName = options.categoryName;
            this.categoryDescription = options.categoryDescription;

            this.enabled = true;
        });
    },
};
</script>
