<template>
    <form @submit="verifyEmail" style="margin-top: 20px">
        <div class="form-content">
            <label class="form-label"
                ><span
                    >Check your inbox for
                    <strong
                        ><a
                            target="_blank"
                            :href="`https://${email.split('@')[1]}`"
                            >{{ email }}</a
                        ></strong
                    ></span
                ></label
            >
            <input
                v-if="codeVerification"
                v-model="form.code"
                data-input-style="sub"
                class="form-input"
                type="text"
            />
        </div>

        <div>
            <button
                v-if="codeVerification"
                type="submit"
                :disabled="disableActions"
                class="marginbox"
                data-btn-style="success"
            >
                Verify
            </button>
            <button
                type="button"
                @click="resendEmail"
                :disabled="!canResend"
                class="marginbox"
                data-btn-style="secondary"
            >
                {{ codeVerification ? 'Resend Code' : 'Send Code' }}
            </button>
        </div>
    </form>
</template>

<script lang="ts">
export default {
    data() {
        return {
            email: '',

            form: {
                code: '',
            },

            disableActions: false,
            canResend: true,
        };
    },

    props: {
        codeVerification: Boolean,
    },

    methods: {
        async resendEmail() {
            const { popupErrors } = useAppConfig();

            try {
                const result = await $fetch(
                    '/api/user/personal/verification/resend',
                    {
                        method: 'POST',

                        body: {
                            verificationMethod: this.codeVerification
                                ? 'code'
                                : 'link',
                        },
                    },
                );

                if (result.statusCode > 400) {
                    return this.$showPopup({
                        type: 'error',
                        content: result.message,
                        isTimed: true,
                    });
                }

                this.$showPopup({
                    type: 'success',
                    content: 'Check your inbox',
                    isTimed: true,
                });
            } catch (e) {
                console.error(e);
                return this.$showPopup(popupErrors.default);
            }
        },

        async verifyEmail(event: Event) {
            const formData = this.form;

            event.preventDefault();

            this.disableActions = true;

            this.form.code = formData.code.replace(/\s/g, '');

            if (formData.code === '') {
                this.disableActions = false;

                return this.$showPopup({
                    type: 'error',
                    content: 'No code in input',
                    isTimed: true,
                });
            }
        },
    },

    async mounted() {
        const user = await this.$getUser();

        this.email = user.email;
    },
};
</script>
