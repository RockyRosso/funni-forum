<template>
    <Title>Home</Title>

    <header>
        <ForumCategories />
    </header>

    <div class="modals">
        <ModalsVerifyEmail />
    </div>

    <LayoutContainer>
        <div style="margin-bottom: 50px"></div>
        <div>
            <ForumCategoryInfo />
        </div>
        <div>
            <PostList />
        </div>
    </LayoutContainer>
</template>

<script lang="ts">
export default {
    async mounted() {
        const user = await this.$getUser();

        if (!user) return;

        if (!user.verified) {
            this.$showModal('verifyEmail');
        }
    },
};
</script>
