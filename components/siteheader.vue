<template>
    <div class="header">
        <div class="header-start">
            <div>
                <a href="/">
                    <img
                        id="desktop"
                        class="site-logo"
                        src="~/assets/img/brand_title_logo.png"
                        width="300px"
                    />
                    <img
                        id="mobile"
                        class="site-logo"
                        src="~/assets/img/brand_logo.png"
                        width="80px"
                    />
                </a>
            </div>
        </div>

        <div class="header-end">
            <a href="/posteditor" style="font-size: 20px" class="button padding" data-btn-style="secondary"
                >+ Create a Post</a
            >
            <a v-if="authorized === false" href="/login">Login / Signup</a>

            <Userdropdown
                :authorized="authorized || Boolean(false)"
                :username="username"
                :admin="admin"
            />
        </div>
    </div>
</template>

<style src="~/assets/styles/components/siteheader.scss" />

<script lang="ts">
export default {
    data() {
        return {
            authorized: false,
            admin: false,

            username: '',

            userDropdownOpened: true,
        };
    },

    async beforeCreate() {
        const userState = useUserData();
        const userData = await this.$getUser(true);

        if (!userData) return;

        if (Object.keys(userData).length === 0) {
            this.authorized = false;
            return;
        }

        userState.setAuthState(true);

        if (userData.permission.name === 'ADMIN') {
            userState.setAdminSate(true);
            this.admin = true;
        }

        this.authorized = true;
        this.username = userData.username || '';
    },
};
</script>
