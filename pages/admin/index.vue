<template>
    <div style="width: 100%" class="section noshadow padding">
        <div>
            <h1>Welcome {{ username }}</h1>

            <AdminSitestats />
        </div>

        <div
            class="grid-layout gl-1fr-column-size"
            style="margin-top: 50px; gap: 20px"
        >
            <div>
                <h2>Latest Users:</h2>
                <AdminLatestData data-type="user" />
            </div>
            <div>
                <h2>Latest Posts:</h2>
                <AdminLatestData data-type="post" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            username: 'N/A',
        };
    },

    created() {
        const userData = useUserData();
        this.username = userData.user.username;
    },

    setup() {
        definePageMeta({
            layout: 'admin',
        });
    },
};
</script>
