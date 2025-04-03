<template>
    <div v-if="enabled">
        <LazyModal @close="enabled = false" display-name="Are you sure?">
            <div class="cnp-content">
                <p>{{ text }}</p>
            </div>

            <div class="cnp-options">
                <button
                    @click="
                        confirm();
                        enabled = false;
                    "
                    class="cnp-option-btn"
                    data-btn-style="success"
                >
                    Confirm
                </button>
                <button
                    @click="enabled = false"
                    class="cnp-option-btn"
                    data-btn-style="danger"
                >
                    Deny
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
type actionOptions = {
    actionName: string;
    text: string;
};

export default {
    data() {
        return {
            enabled: false,
            name: 'confirmPrompt',

            actionName: '',
            text: '',
        };
    },

    methods: {
        confirm() {
            this.$event(`actionConfirmed_${this.actionName}`);
        },

        deny() {
            this.$event(`actionDenied_${this.actionName}`);
        },
    },

    mounted() {
        this.$on(`showModal_${this.name}`, (actionOptions: actionOptions) => {
            this.enabled = true;
            this.actionName = actionOptions.actionName;
            this.text = actionOptions.text;
        });
    },
};
</script>
