<template>
    <div class="fullwidth">
        <h1>Users</h1>

        <div class="section noshadow padding primarybackground">
            <DataGrid :use-section-box="true" v-for="user in users">
                <p class="ellipsisoverflow">{{ user.id }}</p>
                <p class="ellipsisoverflow">{{ user.username }}</p>
                <p class="ellipsisoverflow">
                    {{ $formatTime(user.join_date) }}
                </p>

                <Dropdown
                    :open="true"
                    name="Actions"
                    buttonsize="20px"
                    unique-id="uad"
                    buttonstyle="secondary"
                    :relative="true"
                >
                    <button
                        @click="changeUsername(user.username)"
                        class="dropdown-option-select"
                    >
                        <span
                            ><i class="fa-solid fa-pen"></i> Change
                            Username</span
                        >
                    </button>
                    <button
                        @click="changeUserRole(user.username)"
                        class="dropdown-option-select"
                    >
                        <span
                            ><i class="fa-solid fa-user"></i> Change Role</span
                        >
                    </button>
                    <button
                        @click="toggleBanConfirm(user.username, user.banned)"
                        class="dropdown-option-select"
                    >
                        <span
                            ><i class="fa-solid fa-gavel"></i>
                            {{ user.banned ? 'Unban' : 'Ban' }} User</span
                        >
                    </button>
                </Dropdown>
            </DataGrid>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            users: [] as any[],
            userPages: 1,
        };
    },

    methods: {
        changeUserRole(username: string) {
            this.$showModal('changeRole', username);
        },

        changeUsername(username: string) {
            this.$showModal('changeUsername', username);
        },

        toggleBanConfirm(username: string, isBanned: boolean) {
            const banAction = isBanned ? 'unban' : 'ban';
            const actionName = `${username}_moderate`;

            this.$showModal('confirmPrompt', {
                actionName,
                text: `Are you sure you want to ${banAction} ${username}?`,
            });

            this.$on(`actionConfirmed_${actionName}`, () => {
                this.toggleBan(username, !isBanned);
            });
        },

        async toggleBan(username: string, ban: boolean) {
            const { popupErrors } = useAppConfig();

            try {
                const result = await $fetch(`/api/user/${username}/moderate`, {
                    method: 'PATCH',

                    body: {
                        ban,
                    },
                });

                if (result) {
                    this.$showPopup({
                        type: 'success',
                        content: `${username} has been ${!ban ? 'un' : ''}suspended!`,
                    });

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } catch (e) {
                this.$showPopup(popupErrors.default);
            }
        },

        async loadUsers() {
            const result = await $fetch('/api/users', {
                method: 'GET',

                query: {
                    page: this.userPages,
                },
            });

            if (result) {
                this.users = result;
            }
        },

        onscroll() {
            const { maxPageSize } = useAppConfig();

            const currentScrollPosition =
                ($(window).scrollTop() || 0) + ($(window).height() || 0);
            const documentHeight = $(document).height() || 0;

            if (documentHeight - currentScrollPosition <= 10) {
                if (this.users.length >= maxPageSize * this.userPages) {
                    this.userPages += 1;
                    this.loadUsers();
                }
            }
        },
    },

    mounted() {
        document.addEventListener('scroll', this.onscroll, false);
        this.loadUsers();
    },

    setup() {
        definePageMeta({
            layout: 'admin',
        });
    },
};
</script>
