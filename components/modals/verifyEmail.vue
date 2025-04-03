<template>
    <div v-if="enabled">
        <LazyModal @close="enabled = false" display-name="Verify your Email">
            <div>
                <EmailVerification />
            </div>
        </LazyModal>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            enabled: false,
            name: 'verifyEmail',
        };
    },

    props: {
        codeVerification: Boolean,
    },

    mounted() {
        this.$on(`showModal_${this.name}`, async () => {
            this.enabled = true;
        });
    },
};
</script>
