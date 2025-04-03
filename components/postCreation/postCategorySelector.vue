<template>
    <Dropdown
        @opendropdown="openDropdown = true"
        unique-id="cs"
        :open="openDropdown"
        :name="`Selected Category: ${selectedCategory ? selectedCategory.name : 'None'}`"
    >
        <div class="post-category-option">
            <button
                id="cs"
                :data-category-name="category.name"
                @click="selectCategory"
                class="dropdown-option-select"
                v-for="category in categories"
            >
                <h1 class="category-option-title">{{ category.name }}</h1>
                <p
                    @click="viewCategoryInfo"
                    :data-category-name="category.classname"
                    class="category-option-info"
                >
                    More Info
                </p>
            </button>
        </div>
    </Dropdown>

    <div style="margin-bottom: 10px"></div>
</template>

<style src="~/assets/styles/components/postCategorySelector.scss" />

<script lang="ts">
import formatCategoryNames from '~/assets/scripts/formatCategoryNames';

type Category = {
    name: string;
    classname: string;
    id: number;
    description: string | null;
    color: string;
};

const categories: Category[] = [];
let selectedCategory: Category | null;

export default {
    data() {
        return {
            selectedCategory,
            categories,

            openDropdown: false,
        };
    },

    methods: {
        selectCategory(event: MouseEvent) {
            const postDataState = usePostData();

            const classList = event.target.classList;
            const target = event.currentTarget;

            if (classList.contains('category-option-info')) return;

            const categoryName = target.getAttribute('data-category-name');
            const category = this.categories.find(
                (c) => c.name === categoryName,
            );

            if (!category) return;

            this.selectedCategory = category;
            this.openDropdown = false;

            postDataState.modify('category', category);
        },

        viewCategoryInfo(event: MouseEvent) {
            const categoryName =
                event.target.getAttribute('data-category-name');
            const category = this.categories.find(
                (c) => c.classname === categoryName,
            );

            if (!category) return;

            this.$showModal('forumCategoryInfo', {
                categoryName: category.name,
                categoryDescription: category?.description,
            });
        },
    },

    async mounted() {
        const categoryData = await $fetch('/api/categories', {
            method: 'GET',

            query: {
                permissionToPost: true
            }
        });

        this.categories = formatCategoryNames(categoryData);
    },
};
</script>
