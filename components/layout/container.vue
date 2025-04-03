<template>
    <main>
        <div
            class="main-container"
            :stlye="`align-items: ${align_center ? 'center' : ''}`"
        >
            <div style="width: 100%; height: 100%; overflow: hidden">
                <slot />
            </div>
        </div>
    </main>
</template>

<script lang="ts">
export default {
    props: {
        align_center: String,
    },
};
</script>
