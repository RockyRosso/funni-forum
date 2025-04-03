<template>
    <div class="auth-form">
        <form @submit.prevent>
            <div class="form-input">
                <label class="form-label"><span>E-Mail</span></label>
                <input
                    v-model="inputFields.email"
                    id="email"
                    class="form-input"
                    type="email"
                    required
                />
            </div>

            <div class="form-input">
                <label class="form-label"><span>Password</span></label>
                <input
                    id="password"
                    class="form-input"
                    type="password"
                    v-model="inputFields.password"
                    required
                />
            </div>

            <div class="form-input">
                <button
                    class="auth-form-submit"
                    @click="authenticate"
                    data-btn-style="secondary"
                    type="submit"
                >
                    {{ type?.toUpperCase() }}
                </button>
                <a
                    v-if="type === 'login'"
                    href="/signup"
                    style="
                        text-align: start;
                        display: flex;
                        align-items: center;
                    "
                    ><img
                        src="~/assets/img/icon/no_account.png"
                        width="40px"
                    />No Account?</a
                >

                <p>
                    By continuing you agree to our
                    <a href="/policies/useragreement">User Agreement</a> and
                    <a href="/policies/tos">Terms of Service</a> as well as you
                    understanding our
                    <a href="/policies/privacy">Privacy Policy</a>
                </p>
            </div>
        </form>

        <div class="auth-form-oauth">
            <button
                @click="oauthSignin"
                class="oauth-button"
                data-btn-style="secondary"
                type="button"
            >
                <i class="fa-brands fa-google"></i> Sign in with Google
            </button>
        </div>
    </div>
</template>

<style scoped src="~/assets/styles/components/authForm.scss" />

<script lang="ts">
export default {
    data() {
        return {
            isAuthenticating: false,

            inputFields: {
                email: '',
                password: '',
            },
        };
    },

    props: {
        type: String,
    },

    methods: {
        async oauthSignin() {
            const oauthUrl = await $fetch('/api/user/generateoauth', {
                method: 'GET',
            });

            if (!oauthUrl) return;

            window.location.href = oauthUrl;
        },

        async authenticate() {
            const { popupMessages } = useAppConfig();

            if (!this.type) return;
            if (this.isAuthenticating) return;

            this.isAuthenticating = true;

            const inputFields = this.inputFields;

            const submitButton = $('.auth-form-submit');
            submitButton.attr('disabled', 'true');

            if (inputFields.email === '' || inputFields.password === '') {
                submitButton.removeAttr('disabled');

                return this.$showPopup({
                    type: 'error',
                    content: 'Fields require input',
                });
            }

            const authenicated = await fetch(`/api/user/${this.type}`, {
                method: 'POST',

                body: JSON.stringify({
                    email: inputFields.email,
                    password: inputFields.password,
                }),
            });

            if (authenicated.status === 403 || authenicated.status === 401) {
                this.$showPopup({
                    content: JSON.parse(await authenicated.text()).message,
                    type: 'error',
                });

                submitButton.removeAttr('disabled');
                this.isAuthenticating = false;

                return;
            }

            this.$showPopup(popupMessages.loading);

            if (this.type === 'login') {
                window.location.href = '/';
                return;
            }

            window.location.href = '/personal/welcome';
        },
    },
};
</script>
