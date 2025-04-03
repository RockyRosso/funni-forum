<template>
    <div v-if="enabled">
        <LazyModal @close="enabled = false" width="60%">
            <div class="">
                <textarea
                    style="font-size: 17px"
                    v-model="content"
                    @change="
                        $event.target.value.length > 0
                            ? (canPost = true)
                            : (canPost = false)
                    "
                    class="form-textarea"
                ></textarea>
                <button
                    @click="submit"
                    :disabled="!canPost"
                    style="margin-top: 20px"
                    data-btn-style="success"
                >
                    <i class="fa-solid fa-comment"></i> Reply
                </button>
            </div>
        </LazyModal>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            enabled: false,
            name: 'textFormModal',

            canPost: false,

            content: '',

            submissionTarget: '',
            targetId: '',
        };
    },

    methods: {
        async submitComment() {
            const { popupErrors, popupMessages } = useAppConfig();

            const targetId = this.targetId;

            const postId = targetId.split('-')[0];
            const commentId = targetId.split('-')[1];

            this.$showPopup(popupMessages.loading);

            this.canPost = false;

            try {
                await $fetch('/api/user/personal/comment', {
                    method: 'POST',

                    body: {
                        postId,
                        replyingTo: commentId,
                        commentContent: this.content,
                    },
                });

                window.location.reload();
            } catch (e) {
                console.log(e);
                this.$showPopup(popupErrors.default);
            }
        },

        async submit() {
            if (this.submissionTarget === '') return;

            if (this.submissionTarget === 'commentReply') {
                return await this.submitComment();
            }
        },
    },

    mounted() {
        this.$on(`showModal_${this.name}`, (options: any) => {
            this.submissionTarget = options.type;
            this.targetId = options.target;

            this.enabled = true;
        });
    },
};
</script>
