<template>
    <div v-if="enabled">
        <LazyModal @close="enabled = false" :display-name="title">
            <div class="cnp-content">
                <p>{{ text }}</p>
            </div>

            <div class="cnp-options">
                <button
                    @click="enabled = false"
                    class="cnp-option-btn"
                    data-btn-style="success"
                    v-if="displayButton"
                >
                    Okay
                </button>
            </div>
        </LazyModal>
    </div>
</template>

<style scoped lang="scss">
@import '~/assets/styles/base.scss';

.cnp-content {
    $pad: 10px;

    background-color: $sub;
    padding: $pad $pad $pad $pad;

    margin: 10px;

    max-width: 400px;
}

.cnp-options {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

.cnp-option-btn {
    font-size: 1.5em;
}
</style>

<script lang="ts">
export default {
    data() {
        return {
            enabled: false,
            name: 'info',

            title: '',
            text: '',

            displayButton: true,
        };
    },

    mounted() {
        this.$on(
            `showModal_${this.name}`,
            (options: {
                title: string;
                text: string;
                displayButton?: boolean;
            }) => {
                this.enabled = true;

                this.title = options.title;
                this.text = options.text;

                if (options.displayButton !== undefined) {
                    this.displayButton = options.displayButton;
                }
            },
        );
    },
};
</script>
