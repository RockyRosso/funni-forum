<template>
    <Title>Welcome</Title>

    <LayoutContainer>
        <div class="div-form">
            <form @submit="completeStage" v-if="stage === stages[0]">
                <h1 class="welcome-form-title">Enter a Username!</h1>
                <div class="form-input">
                    <input
                        data-input-style="primary"
                        id="username"
                        type="text"
                        required
                    />
                    <label
                        :class="`result ${result}`"
                        v-if="formResult !== ''"
                        >{{ formResult }}</label
                    >
                </div>

                <button id="next" type="submit" data-btn-style="success">
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>

            <div v-if="stage === stages[1]">
                <h1 class="welcome-form-title">
                    Choose a profile picture (optional)
                </h1>
                <p style="text-align: center">
                    The picture below will be your profile picture
                </p>

                <PfpCreator :picture="useAppConfig().cdnUrl + welcomeFormData.picture" />
            </div>

            <form @submit.prevent v-if="stage === stages[2]">
                <h1 class="welcome-form-title">All good!</h1>

                <div>
                    <img
                        style="margin: 50px"
                        src="~/assets/img/icon/success_checkmark.svg"
                        width="300px"
                    />
                </div>

                <button
                    @click="redirectToHome"
                    id="next"
                    type="submit"
                    data-btn-style="success"
                >
                    Finish
                </button>
            </form>
        </div>
    </LayoutContainer>
</template>

<style lang="scss">
@import '~/assets/styles/base.scss';
.result {
    &.success {
        color: $success;
    }

    &.failed {
        color: $danger;
    }
}

.welcome-form-title {
    font-size: 2.5em;
    text-align: center;
}
</style>

<script lang="ts">
export default {
    data() {
        return {
            formResult: '',
            result: '',

            stagePos: 0,
            stage: 'username',
            stages: ['username', 'picture', 'confirm'],

            welcomeFormData: {
                username: '',
                picture: '',
            },
        };
    },

    methods: {
        redirectToHome() {
            window.location.assign('/');
        },

        updateStage() {
            this.stage = this.stages[this.stagePos];
        },

        async updateUsername(username: string) {
            const result = await fetch('/api/user/personal/username', {
                method: 'PUT',

                body: JSON.stringify({
                    username,
                }),
            });

            const response = await result.json();

            if (result.status < 266) {
                this.formResult = '';
                return true;
            }

            this.formResult = response?.message;
            this.result = 'failed';
            return;
        },

        async completeStage(event: Event) {
            event.preventDefault();

            if (this.stage === 'username') {
                const usernameInput = $('#username').val();

                if (typeof usernameInput !== 'string') return;

                const result = await this.updateUsername(usernameInput);

                if (!result) return;

                this.stagePos += 1;
                this.updateStage();
            }

            if (this.stage === 'picture') {
                this.$on('pfpUploadComplete', () => {
                    this.stagePos += 1;
                    this.updateStage();
                });
            }
        },
    },

    async beforeCreate() {
        const userData = await this.$getUser(true);

        if (!userData) return;

        this.welcomeFormData.picture = userData.picture;
    },
};
</script>
