<template>
    <div class="categories" style="margin-top: -20px;">
        <div class="category" v-for="(category, i) in categories">
            <button
                @click="switchCategory"
                data-btn-style="secondary"
                :class="`category-btn cn-${category.classname} ${category.classname === defaultCategoryName ? 'selected' : ''}`"
            >
                {{ category.name }}
            </button>
        </div>
    </div>
</template>

<style src="~/assets/styles/components/forumcategories.scss" />

<script lang="ts">
import formatCategoryNames from '~/assets/scripts/formatCategoryNames';

let categories: any;
let defaultCategoryObj: any;

export default {
    data() {
        return {
            categories,
            defaultCategoryName: useAppConfig().defaultCategory,
            defaultCategoryObj,
        };
    },

    methods: {
        switchCategory(event: MouseEvent) {
            const category = this.categories.find(
                (c) => c.name === event.target.innerHTML,
            );

            if (!category) return;

            $('.category-btn').removeClass('selected');
            $(`.category-btn.cn-${category.classname}`).addClass('selected');

            this.$event('selectCategory', category);
        },
    },

    async created() {
        const categoriesData = await useFetch('/api/categories', {
            method: 'get',
        });

        const data = categoriesData.data.value;

        if (!data) return;

        const categories = formatCategoryNames(data);

        this.defaultCategoryObj = categories.find(
            (c) => c.classname === this.defaultCategoryName,
        );
        this.categories = categories;

        this.$event('selectCategory', this.defaultCategoryObj);
    },
};
</script>
