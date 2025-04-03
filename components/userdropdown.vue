<template>
    <Dropdown
        unique-id="ud"
        v-if="authorized"
        :open="userDropdownOpened"
        :name="username"
    >
        <a
            id="ud"
            :href="`/users/${username}`"
            class="dropdown-option-select button"
            style="text-decoration: none"
            ><i class="fa-solid fa-user"></i> Profile</a
        >
        <a
            id="ud"
            href="/personal/settings"
            class="dropdown-option-select button"
            style="text-decoration: none"
            ><span><i class="fa-solid fa-gear"></i> Settings</span></a
        >
        <a
            id="ud"
            href="/policies"
            class="dropdown-option-select button"
            style="text-decoration: none"
            ><span><i class="fa-solid fa-book"></i> Policies</span></a
        >
        <a
            id="ud"
            href="/admin"
            class="dropdown-option-select button"
            style="text-decoration: none"
            v-if="admin"
        >
            <span><i class="fa-solid fa-gavel"></i> Admin Dashboard</span>
        </a>
        <button id="ud" @click="logout" class="dropdown-option-select">
            <i class="fa-solid fa-door-open"></i> Log Out
        </button>
    </Dropdown>
</template>

<style src="~/assets/styles/components/userdropdown.scss" />

<script lang="ts">
export default {
    data() {
        return {
            userDropdownOpened: true,
        };
    },

    props: {
        username: String,
        authorized: Boolean,
        admin: Boolean,
    },

    methods: {
        async logout() {
            await $fetch('/api/user/personal/logout', {
                method: 'POST',

                body: {
                    post: true,
                },
            }).catch((e) => console.error(e));

            window.location.assign('/');
        },
    },
};
</script>
