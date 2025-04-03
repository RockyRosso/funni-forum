<template>
    <div
        style="gap: 10px"
        :class="`${useFlex ? 'flex' : 'grid-layout gl-1fr-column-size'} ${useSectionBox ? 'section noshadow padding' : ''} margintopbottom-10px `"
    >
        <slot />
    </div>
</template>

<script lang="ts">
export default {
    props: {
        useFlex: Boolean,
        useSectionBox: Boolean,
    },
};
</script>
