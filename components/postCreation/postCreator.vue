<template>
    <div class="post-creator-wrapper">
        <div>
            <div class="post-editor">
                <div class="tabs">
                    <button
                        @click="switchTab"
                        class="tab-btn selected"
                        data-tab-target="post"
                        data-btn-style="secondary"
                    >
                        Post Editor
                    </button>
                    <button
                        @click="switchTab"
                        class="tab-btn"
                        data-tab-target="media"
                        data-btn-style="secondary"
                    >
                        Media
                    </button>
                </div>
                <KeepAlive>
                    <form class="msgForm" @submit.prevent>
                        <input
                            class="textbox title"
                            placeholder="Title"
                            type="text"
                            v-model="postTitle"
                            @change="
                                (event) => {
                                    postChanged({
                                        text: event.target.value,
                                        type: 'input',
                                    });
                                }
                            "
                        />

                        <PostCreationPostCategorySelector />

                        <div v-if="tab === 'post'">
                            <PostCreationTextEditor />
                        </div>
                    </form>
                </KeepAlive>
                <div v-if="tab === 'media'">
                    <PostCreationUploader />
                    <p>*These files will be attached to your post</p>
                </div>
            </div>

            <div class="post-options">
                <button
                    data-btn-style="success"
                    data-post-operation="post"
                    class="msg-send"
                    id="post-option"
                    @click="createPost"
                    :disabled="
                        inputText !== true ||
                        Object.keys(usePostData().category).length === 0
                    "
                >
                    <i class="fa-solid fa-paper-plane"></i>
                    <strong>Create Post</strong>
                </button>
            </div>
        </div>
    </div>
</template>

<style src="~/assets/styles/components/postCreator.scss" />

<script lang="ts">
import type { popupConfig } from '~/assets/types/popup';

type postChangedOptions = {
    text: string;
    type: string;
};

export default {
    data() {
        return {
            tab: 'post',
            postTitle: '',

            inputText: false,
            postHasContent: false,

            redirectDelay: 2,
        };
    },

    methods: {
        async uploadPostImage(
            fileName: string,
            postId: string,
            mediaData: string,
        ) {
            try {
                await $fetch('/api/user/personal/posts/media', {
                    method: 'POST',

                    body: {
                        mediaData,
                        postId,
                        fileName,
                    },
                });

                return true;
            } catch (e) {
                console.error(e);
                return;
            }
        },

        async uploadMedia(media: File[], postId: string) {
            let mediaUploaded;
            const mediaKeys: string[] = [];

            const popupOptions: popupConfig = {
                content: '',
                type: 'success',
            };

            if (media.length > 0) {
                popupOptions.content =
                    'Uploading Media... (DO NOT CLOSE THIS TAB)';

                this.$showPopup(popupOptions);

                for (let i = 0; i < media.length; i++) {
                    const fileExtension = media[i].type.split('/')[1];

                    const fileKey = `${postId}_${i}.${fileExtension}`;

                    const result = await this.$uploadObject(
                        fileKey,
                        postId,
                        media[i],
                    );

                    mediaUploaded = true;

                    if (!result) {
                        mediaUploaded = false;

                        popupOptions.content = 'Failed to upload media!';
                        popupOptions.type = 'error';

                        this.$showPopup(popupOptions);

                        break;
                    }

                    mediaKeys.push(fileKey);
                }

                if (mediaUploaded) {
                    popupOptions.content = 'Uploaded media!';
                    popupOptions.isTimed = true;

                    await $fetch('/api/user/personal/finishupload', {
                        method: 'POST',

                        body: {
                            keys: mediaKeys.map((key) => ({
                                Key: key,
                                Id: postId,
                            })),

                            fileUse: 'posts',
                        },
                    });

                    this.$showPopup(popupOptions);
                }
            }

            if (media.length > 0 && !mediaUploaded) {
                popupOptions.content = 'Failed to upload media!';
                popupOptions.isTimed = true;
                popupOptions.type = 'error';

                this.$showPopup(popupOptions);
            }

            return mediaKeys;
        },

        async generatePost(category: any) {
            const errorPopup = {
                content: 'Failed to create post!',
                type: 'error',
            };

            try {
                const postResult = await $fetch('/api/user/personal/posts', {
                    method: 'POST',

                    body: {
                        category,
                    },
                });

                const postData = postResult.data;

                if (!postData) {
                    this.$showPopup(errorPopup);
                    return;
                }

                return postData?.postId;
            } catch (e) {
                console.error(e);

                errorPopup.content = `${e}`;
                this.$showPopup(errorPopup);

                return;
            }
        },

        async createPost() {
            const postDataState = usePostData();

            const postTitle = $('.textbox.title').val();
            const postContent = postDataState.postContent;

            const postCreateButton = $('[data-post-operation="post"]');
            postCreateButton.attr('disabled', 'true');

            const category = postDataState.category;
            const mediaFiles = postDataState.files;

            // Generate Post Data

            const postId = await this.generatePost(category);

            if (!postId) return;

            const media = await this.uploadMedia(mediaFiles, postId);

            // Push data to generated post

            const putResult = await $fetch('/api/user/personal/posts', {
                method: 'PUT',

                body: {
                    postId,
                    postTitle,
                    postContent,
                    media,
                },
            });

            if (putResult.statusCode === 201) {
                this.$showPopup({
                    content: `Post Created! (Redirecting in ${this.redirectDelay} seconds...)`,
                    type: 'success',
                });

                postDataState.$dispose();

                setTimeout(() => {
                    window.location.href = `/posts/${postId}`;
                }, this.redirectDelay * 1000);
            }
        },

        switchTab(event: MouseEvent) {
            const tabTarget =
                event.currentTarget?.attributes['data-tab-target'];
            const tabButtons = $('.tab-btn');

            tabButtons.removeClass('selected');

            event.currentTarget?.classList.add('selected');
            this.tab = tabTarget.value;
        },

        postChanged(event: postChangedOptions) {
            const text = event.text.trim();
            const type = event.type;

            if (text !== '') {
                if (type === 'input') return (this.inputText = true);
            }

            if (type === 'input') return (this.inputText = false);
        },
    },
};
</script>
