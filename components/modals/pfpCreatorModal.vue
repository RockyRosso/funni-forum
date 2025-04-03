<template>
    <LazyModal @close="enabled = false" v-if="enabled">
        <PfpCreator :picture="picture" />
    </LazyModal>
</template>

<script lang="ts">
export default {
    data() {
        return {
            enabled: false,
            name: 'pfpCreatorModal',
        };
    },

    props: {
        picture: String,
    },

    mounted() {
        this.$on(`showModal_${this.name}`, () => (this.enabled = true));
        this.$on('pfpUploadComplete', () => (this.enabled = false));
    },
};
</script>
