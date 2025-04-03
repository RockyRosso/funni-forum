<template>
    <div>
        <div class="comment-wrapper" v-for="comment in comments">
            <div :id="comment.id" class="comment-section">
                <div class="comment-replyto" v-if="comment.commentRepliedToId">
                    <div>
                        <a
                            :href="`#${comment.commentRepliedToId}`"
                            data-text-style="nounderline"
                            style="font-size: 15px"
                            ><i class="fa-solid fa-reply"></i>
                            {{
                                comment.commentRepliedTo.deleted
                                    ? '[deleted]'
                                    : comment.commentRepliedTo.author.username
                            }}</a
                        >
                    </div>
                </div>
                <div class="comment-author">
                    <div>
                        <a :href="`/users/${comment.author.username}`"
                            ><img
                                class="pfp small"
                                :src="useAppConfig().cdnUrl + comment.author.picture"
                        /></a>
                    </div>

                    <div class="comment-author-name">
                        <h4>
                            {{ comment.author.username }}
                        </h4>

                        <p style="font-size: 15px">
                            {{ comment.date.split('T')[0] }}
                        </p>
                    </div>
                </div>

                <div style="">
                    <p class="comment-txt">{{ comment.content }}</p>
                </div>

                <div class="comment-options">
                    <button
                        v-if="$isAuthenticated()"
                        @click="reply(comment.id)"
                        class="comment-option"
                        data-btn-style="secondary"
                    >
                        <i class="fa-solid fa-comment"></i> Reply
                    </button>
                    <button
                        :class="`comment-option ${commentReplies[comment.id] ? 'selected-border' : ''}`"
                        v-if="comment.replies.length > 0"
                        @click="
                            commentReplies[comment.id]
                                ? (commentReplies[comment.id] = null)
                                : loadCommentReplies(
                                      comment.id,
                                  ) /* If the comment data is inside the table, remove it. Otherwise, fetch fresh data */
                        "
                        data-btn-style="secondary"
                    >
                        <i class="fa-solid fa-comments"></i> Replies
                    </button>
                    <button
                        v-if="comment.owner"
                        @click="deleteCommentPrompt(comment.id)"
                        class="comment-option"
                        data-btn-style="secondary"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>

                <div
                    class="comment-replies"
                    v-if="
                        comment.replies.length > 0 && commentReplies[comment.id]
                    "
                >
                    <div
                        class="comment-reply"
                        v-for="(commentReply, i) in commentReplies[comment.id]"
                    >
                        <div class="comment-author">
                            <div>
                                <a
                                    :href="`/users/${commentReply.author.username}`"
                                    ><img
                                        class="pfp small"
                                        :src="commentReply.author.picture"
                                /></a>
                            </div>

                            <div class="comment-author-name">
                                <h4>
                                    {{ commentReply.author.username }}
                                </h4>

                                <p style="font-size: 15px">
                                    {{ commentReply.date.split('T')[0] }}
                                </p>
                            </div>
                        </div>

                        <div style="">
                            <p class="comment-txt">
                                {{ commentReply.content }}
                            </p>
                        </div>

                        <a :href="`#${commentReply.id}`" class="btn"
                            ><i class="fa-solid fa-sort-down"></i
                        ></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            comments: [] as any,
            commentReplies: {} as any,

            commentPage: 1,
        };
    },

    methods: {
        deleteCommentPrompt(commentId: string) {
            const actionName = 'commentDelete';

            this.$showModal('confirmPrompt', {
                actionName,
                text: 'Are you sure you want to delete your comment? This is cannot be undone!',
            });

            this.$on(`actionConfirmed_${actionName}`, () => {
                this.deleteComment(commentId);
            });
        },

        async deleteComment(commentId: string) {
            const { popupErrors, popupMessages } = useAppConfig();

            const params = this.$route.params;
            const postId = params.id;

            if (!postId) return;

            this.$showPopup(popupMessages.loading);

            try {
                await $fetch(`/api/posts/${postId}/${commentId}`, {
                    method: 'DELETE',
                });

                this.$showPopup({
                    type: 'success',
                    content: 'Comment deleted!',
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (e) {
                console.error(e);
                this.$showPopup(popupErrors.default);
            }
        },

        async reply(commentId: string) {
            const params = this.$route.params;
            const postId = params.id;

            this.$showModal('textFormModal', {
                type: 'commentReply',
                target: `${postId}-${commentId}`,
            });
        },

        async loadCommentReplies(commentId: string) {
            const { popupErrors } = useAppConfig();

            const params = this.$route.params;
            const postId = params.id;

            if (!postId) return;

            try {
                const commentReplies = await $fetch(
                    `/api/posts/${postId}/${commentId}/replies`,
                    {
                        method: 'GET',
                    },
                );

                this.commentReplies[
                    commentId as keyof typeof this.commentReplies
                ] = commentReplies;
            } catch (e) {
                console.error(e);
                this.$showPopup(popupErrors.default);
            }
        },

        async loadComments() {
            const params = this.$route.params;
            const postId = params.id;

            try {
                const comments = await $fetch(`/api/posts/${postId}/comments`, {
                    method: 'GET',

                    query: {
                        page: this.commentPage,
                    },
                });

                for (let i = 0; i < comments.length; i++) {
                    this.comments.push(comments[i]);
                }
            } catch (e) {
                this.$showPopup({
                    type: 'error',
                    content: 'Unable to retrieve comments!',
                });
            }
        },

        onscroll() {
            const { maxPageSize } = useAppConfig();

            const currentScrollPosition =
                ($(window).scrollTop() || 0) + ($(window).height() || 0);
            const documentHeight = $(document).height() || 0;

            if (documentHeight - currentScrollPosition <= 10) {
                if (this.comments.length >= maxPageSize * this.commentPage) {
                    this.commentPage += 1;
                    this.loadComments();
                }
            }
        },
    },

    mounted() {
        document.addEventListener('scroll', this.onscroll, false);

        this.loadComments();
    },
};
</script>
