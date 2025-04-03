<template>
    <div v-if="enabled">
        <LazyModal
            @close="enabled = false"
            :display-name="`Change Roles for: ${user}`"
        >
            <div>
                <h3>Current Roles:</h3>

                <div>
                    <div class="section noshadow">
                        <div
                            style="margin-top: 10px"
                            class="section noshadow pad-10"
                            v-for="userPermission in userPermissions"
                        >
                            <p
                                class="nopmargins"
                                style="font-size: 25px; font-weight: 600"
                            >
                                <button
                                    @click="toggleRole"
                                    :data-role-name="userPermission.name"
                                    data-role-action="remove"
                                    data-btn-style="text-only"
                                    :disabled="disableActions"
                                >
                                    <span
                                        ><i
                                            data-text-color="danger"
                                            class="fa-solid fa-circle-xmark"
                                        ></i>
                                        {{ userPermission.name }}</span
                                    >
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3>Roles:</h3>

                <div>
                    <div
                        style="margin-top: 10px"
                        class="section noshadow pad-10"
                        v-for="permission in permissions"
                    >
                        <p
                            class="nopmargins"
                            style="font-size: 25px; font-weight: 600"
                        >
                            <button
                                @click="toggleRole"
                                :data-role-name="permission.name"
                                data-role-action="add"
                                data-btn-style="text-only"
                                :disabled="disableActions"
                            >
                                <span
                                    ><i
                                        data-text-color="success"
                                        class="fa-solid fa-circle-plus"
                                    ></i>
                                    {{ permission.name }}</span
                                >
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </LazyModal>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            enabled: false,
            name: 'changeRole',

            user: 'username',

            userPermissions: [] as any[],
            permissions: [] as any[],

            disableActions: false,
        };
    },

    methods: {
        async loadRoles() {
            const { popupErrors } = useAppConfig();

            try {
                const result = await $fetch('/api/permission-roles', {
                    method: 'GET',

                    query: {
                        ownedby: this.user,
                    },
                });

                if (!result) return;

                const permissions = result.permissions;
                const userPermissions = result.userPermissions;

                this.permissions = permissions;
                this.userPermissions = userPermissions;
            } catch (e) {
                this.$showPopup(popupErrors.default);
            }
        },

        async toggleRole(event: MouseEvent) {
            const { popupErrors } = useAppConfig();

            this.disableActions = true;

            const target = event.currentTarget;

            if (!target) return;

            const permission = target.getAttribute('data-role-name');
            const action = target.getAttribute('data-role-action');

            try {
                await $fetch(`/api/user/${this.user}/permission`, {
                    method: 'PATCH',

                    body: {
                        permission: action === 'add' ? permission : 'MEMBER',
                    },
                });
            } catch (e) {
                console.error(e);
                this.$showPopup(popupErrors.default);
            }

            await this.loadRoles();
            this.disableActions = false;
        },
    },

    mounted() {
        this.$on(`showModal_${this.name}`, async (username: string) => {
            this.user = username;

            await this.loadRoles();

            this.enabled = true;
        });
    },
};
</script>
