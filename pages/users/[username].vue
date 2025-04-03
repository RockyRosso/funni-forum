<template>
    <Title>{{ username }}'s Profile</Title>

    <LayoutContainer>
        <div class="section padding">
            <div>
                <h1>{{ username }}</h1>
            </div>

            <div>
                <img class="pfp" :src="useAppConfig().cdnUrl + picture" />
            </div>
        </div>

        <div style="margin-bottom: 20px" />
    </LayoutContainer>
</template>

<script lang="ts">
export default {
    data() {
        return {
            id: '',

            displayName: '',

            username: '',
            picture: '',
            posts: [],
        };
    },

    async beforeCreate() {
        const params = this.$route.params;
        const username = params.username;

        const result = await useFetch(`/api/user/${username}`, {
            method: 'GET',
        });

        const data = result.data;
        const userData = data.value;

        if (!userData) {
            return showError({
                statusCode: 404,
                statusMessage: 'User not found!',
            });
        }

        this.id = userData.id;
        this.displayName = userData.display_name;

        this.username = userData.username;
        this.picture = userData.picture;

        this.posts = userData.posts;
    },
};
</script>
