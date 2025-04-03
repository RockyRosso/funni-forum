<template>
    <div :id="uniqueId" class="dropdown">
        <button
            :id="uniqueId"
            @click="openDropdown"
            :data-btn-style="buttonstyle ? buttonstyle : `text-only`"
            class="dropdown-btn"
            :style="`font-size: ${buttonsize};`"
            :disabled="disable"
        >
            {{ name }}
        </button>

        <div
            :id="uniqueId"
            :class="`dropdown-content ${relative ? 'dropdown-content-relative' : ''}`"
            v-if="open"
        >
            <slot />
        </div>
    </div>
</template>

<style src="~/assets/styles/components/dropdown.scss" />

<script lang="ts">
export default {
    props: {
        name: String,
        open: Boolean || String,
        uniqueId: String,

        buttonsize: String,
        buttonstyle: String,

        disable: Boolean,

        relative: Boolean,
    },

    methods: {
        openDropdown() {
            this.$emit('opendropdown');
        },
    },
};
</script>
