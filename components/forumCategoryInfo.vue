<script lang="ts">
export default {
    data() {
        return {
            categoryDescription: '',
            categoryColor: '#ffff',
        };
    },

    methods: {
        updateDescription(category: any) {
            this.categoryDescription = category.description;
            this.categoryColor = category.color;
        },
    },

    created() {
        this.$on('selectCategory', this.updateDescription);
    },
};
</script>

<template>
    <div :style="`border-color: ${categoryColor};`" class="category-info">
        <p>{{ categoryDescription }}</p>
    </div>
</template>

<style scoped lang="scss">
.category-info {
    $pad: 5px;

    position: relative;
    left: 50%;
    transform: translate(-50%);

    width: 100%;
    max-width: 900px;

    border-style: solid;
    border-radius: 20px;

    padding: $pad $pad $pad $pad;
}
</style>
