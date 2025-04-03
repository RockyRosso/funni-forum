<template>
    <p v-if="isLoading" style="text-align: center">
        {{ loadingText || 'Loading...' }}
    </p>
</template>

<script lang="ts">
export default {
    props: {
        loadingText: String,
        isLoading: Boolean,
    },
};
</script>
