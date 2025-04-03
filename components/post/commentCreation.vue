<template>
    <div class="cc-container">
        <div class="cc-editor">
            <textarea
                class="form-textarea"
                v-model="commentContent"
                @input="
                    $event.target.value.length > 0
                        ? (canPost = true)
                        : (canPost = false)
                "
            ></textarea>
        </div>

        <button
            @click="postComment"
            :disabled="!canPost"
            data-btn-style="success"
            class="cc-create-btn"
        >
            <i class="fa-solid fa-paper-plane"></i>
            <strong>Post Comment</strong>
        </button>
    </div>
</template>

<style scoped src="~/assets/styles/components/commentCreation.scss" />

<script lang="ts">
export default {
    data() {
        return {
            canPost: false,
            commentContent: '',
        };
    },

    methods: {
        async postComment() {
            const { popupErrors, popupMessages } = useAppConfig();

            const params = this.$route.params;
            const postId = params.id;

            if (!postId) return;

            this.canPost = false;

            this.$showPopup(popupMessages.loading);

            try {
                await $fetch('/api/user/personal/comment', {
                    method: 'POST',

                    body: {
                        commentContent: this.commentContent,
                        postId,
                    },
                });

                window.location.reload();
            } catch (e) {
                console.error(e);

                this.canPost = true;
                this.$showPopup(popupErrors.default);
            }
        },
    },
};
</script>
