<template>
    <div class="modal-backdrop">
        <dialog class="modal" open :style="`width: ${width};`">
            <div class="modal-header">
                <h1 class="modal-header-name">{{ displayName }}</h1>
                <button
                    @click="closeModal"
                    data-btn-style="danger"
                    class="modal-close"
                >
                    <strong>X</strong>
                </button>
            </div>

            <div class="modal-content">
                <slot></slot>
            </div>
        </dialog>
    </div>
</template>

<style src="~/assets/styles/components/modal.scss" />

<script lang="ts">
export default {
    props: {
        displayName: String,
        width: String,
    },

    methods: {
        closeModal() {
            this.$emit('close');
        },
    },
};
</script>
