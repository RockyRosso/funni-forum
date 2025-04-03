<template>
    <LoadingIndicator
        :is-loading="isLoading"
        loading-text="Fetching Posts..."
    />

    <div class="posts">
        <div :id="post.id" class="post" v-for="post in posts">
            <DataGrid :use-flex="true">
                <div id="psection">
                    <p>{{ $formatTime(post.date) }}</p>
                </div>

                <a id="ptitle" :href="`/posts/${post.id}`"
                    ><strong>{{ post.title }}</strong></a
                >
                <DataGrid :use-flex="true">
                    <a id="pauthor" :href="`/users/${post.author.username}`">{{
                        post.author.username
                    }}</a>
                    <a :href="`/users/${post.author.username}`"
                        ><img
                            class="post-author-img"
                            :src="useAppConfig().cdnUrl + post.author.picture"
                    /></a>
                </DataGrid>
            </DataGrid>

            <DataGrid :use-flex="true" style="justify-content: left">
                <i id="heart" class="fa-solid fa-heart"></i>
                <p>{{ $abbreviationConvert(post._count.likes) }}</p>

                <i class="fa-solid fa-message"></i>
                <p>{{ $abbreviationConvert(post._count.comments) }}</p>
            </DataGrid>
        </div>

        <p v-if="posts.length === 0">No posts in this category :(</p>

        <DataGrid :use-flex="true" v-if="isLoading">
            <div>
                <img src="~/assets/img/indicator/load_gif.gif" width="50px" />
            </div>
        </DataGrid>
    </div>
</template>

<style src="~/assets/styles/components/posts.scss" />

<script lang="ts">
export default {
    data() {
        return {
            posts: [] as any[],
            isLoading: true,

            postPages: 1,

            currentCategory: '',
        };
    },

    methods: {
        async loadPosts(category?: any) {
            let categoryName = this.currentCategory;

            if (category) {
                categoryName = category.classname;

                this.postPages = 1;

                if (typeof category === 'string') {
                    categoryName = category;
                }

                this.currentCategory = categoryName;
            }

            this.isLoading = true;

            try {
                const posts = await $fetch('/api/posts', {
                    method: 'GET',

                    query: {
                        categoryName,
                        page: this.postPages,
                    },
                });

                if (!category) {
                    for (let i = 0; i < posts.length; i++) {
                        this.posts.push(posts[i]);
                    }
                } else {
                    this.posts = posts;
                }

                this.isLoading = false;
            } catch (e) {
                this.$showPopup({
                    content: 'Unable to retrieve posts',
                    type: 'error',
                });

                this.isLoading = false;
            }
        },

        onscroll() {
            const { maxPageSize } = useAppConfig();

            const currentScrollPosition =
                ($(window).scrollTop() || 0) + ($(window).height() || 0);
            const documentHeight = $(document).height() || 0;

            if (documentHeight - currentScrollPosition <= 10) {
                if (this.posts.length >= maxPageSize * this.postPages) {
                    this.postPages += 1;
                    this.loadPosts();
                }
            }
        },
    },

    mounted() {
        document.addEventListener('scroll', this.onscroll, false);
    },

    created() {
        this.$on('selectCategory', this.loadPosts);
    },
};
</script>
