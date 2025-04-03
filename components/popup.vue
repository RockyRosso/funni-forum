<template>
    <div v-if="enabled">
        <div class="popup-container">
            <div class="popup-content" :data-popup-style="type">
                <p class="popup-text">{{ errorMsg }}{{ timeLeft }}</p>
                <button
                    @click="closePopup"
                    data-btn-style="text-only"
                    style="font-size: 20px"
                >
                    X
                </button>
            </div>
        </div>
    </div>
</template>

<style src="../assets/styles/components/popup.scss" />

<script lang="ts">
import { type popupConfig } from '../assets/types/popup';

let delayTimer: any;

export default {
    data() {
        return {
            enabled: false,
            errorMsg: '',
            timeLeft: '',
            type: '',
            delayTimer,
        };
    },

    methods: {
        display(options: popupConfig) {
            this.enabled = true;
            this.errorMsg = options.content;

            if (options.isTimed) {
                if (this.delayTimer) {
                    clearTimeout(this.delayTimer);
                }

                this.delayTimer = setTimeout(() => {
                    this.enabled = false;
                }, 5000);
            }

            this.type = options.type;
        },

        closePopup() {
            this.enabled = false;
        },
    },

    mounted() {
        this.$on('showPopup', this.display);
    },
};
</script>
