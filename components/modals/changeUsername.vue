<template>
    <div v-if="enabled">
        <LazyModal
            @close="enabled = false"
            :display-name="`Change username of: ${user}`"
        >
            <div>
                <form style="margin-top: 20px" @submit="changeUsername">
                    <div class="form-content">
                        <label class="form-label"
                            >Choose a new username for {{ user }}</label
                        >
                        <input
                            v-model="form.username"
                            data-input-style="sub"
                            class="form-input"
                            type="text"
                        />
                    </div>

                    <button :disabled="disableActions" data-btn-style="success">
                        Change Username
                    </button>
                </form>
            </div>
        </LazyModal>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            enabled: false,
            name: 'changeUsername',

            user: 'username',

            disableActions: false,

            form: {
                username: '',
            },
        };
    },

    methods: {
        async changeUsername(event: Event) {
            const { popupErrors } = useAppConfig();

            event.preventDefault();
            this.disableActions = true;

            const result = await $fetch(`/api/user/${this.user}/username`, {
                method: 'PATCH',

                body: {
                    newuser: this.form.username,
                },
            });

            this.disableActions = false;

            if (!result) return this.$showPopup(popupErrors.default);

            if (result.failed) {
                return this.$showPopup({
                    type: 'error',
                    content: result.message,
                    isTimed: true,
                });
            }

            this.$showPopup({
                type: 'success',
                content: `Updated username for: ${this.user}`,
            });

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
    },

    mounted() {
        this.$on(`showModal_${this.name}`, async (username: string) => {
            this.user = username;

            this.enabled = true;
        });
    },
};
</script>
