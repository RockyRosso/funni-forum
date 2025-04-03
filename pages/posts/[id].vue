<template>
    <Title>{{ title }}</Title>

    <div class="modals">
        <ModalsConfirmPrompt />
        <ModalsTextFormModal />
    </div>

    <LayoutContainer>
        <div class="post-content-wrapper">
            <div class="post-author">
                <h3>
                <a :href="`/users/${username}`"><img class="pfp small" :src="useAppConfig().cdnUrl + picture" /></a> 
                {{ username }}'s post:
                </h3>
                
                <div class="post-engagement">
                    <div class="post-engagement-option">
                        <p>{{ abbreviationConvert(engagement.likes) }}</p>
                        <button id="eng-like" @click="sendFeedback" data-btn-style="text-only"><i v-if="user.hasLiked" id="heart" class="fa-solid fa-heart"></i><i v-if="!user.hasLiked" id="heart" class="fa-regular fa-heart"></i></button>
                    </div>

                    <div class="post-engagement-option">
                        <p>{{ abbreviationConvert(engagement.dislikes) }}</p>
                        <button id="eng-dislike" @click="sendFeedback" data-btn-style="text-only"><i v-if="user.hasDisliked" class="fa-solid fa-thumbs-down"></i><i v-if="!user.hasDisliked" class="fa-regular fa-thumbs-down"></i></button>
                    </div>
                </div>

                <div class="post-content">
                    <h1 style="text-align: left; margin-left: 10px;">{{ title }}</h1>
                    <div class="post-content-text" v-html="content"></div>
                </div>

                <div class="post-attachments">
                    <PostMediaCarousel :files="imageMedia" />
                    
                    <div v-if="videoMedia.length > 0 && videoSrc !== ''" class="post-attachments-videos">
                        <component :src="videoSrc" class="post-attachments-video" :is="components.videoPlayer"></component>
                    </div>
                </div>

                <div class="post-actions">
                    <p v-if="!$isAuthenticated()"><a href="/login">Login</a> to comment</p>
                    <button v-if="$isAuthenticated()" @click="user.isCreatingComment ? user.isCreatingComment = false : user.isCreatingComment = true" id="eng-comment" class="post-option-btn" data-btn-style="secondary"><i class="fa-solid fa-comment"></i></button>
                    <button @click="deletePostPrompt" v-if="user.isOwner" id="eng-delete" class="post-option-btn" data-btn-style="danger"><i class="fa-solid fa-trash"></i></button>
                </div>

                <PostCommentCreation v-if="user.isCreatingComment" />
            </div>
            <PostComments />
        </div>
    </LayoutContainer>
</template>

<style src="~/assets/styles/pages/postPage.scss" />

<!-- TYPESCRIPT -->
<script lang="ts">
import { generateHTML } from '@tiptap/html';
import { createExtentions } from '~/assets/scripts/essentialExtentions';

import { createMediaProcessing } from '~/assets/scripts/componentCreator';

import { VideoPlayer } from '#components';

import abbreviationConvert from '~/assets/scripts/abbreviationConvert';

export default {
    data() {
        return {
            title: '',
            content: '',
            picture: '',
            username: '',

            engagement: {
                likes: 0,
                dislikes: 0
            },

            media: [],
            imageMedia: [],
            videoMedia: [],

            videoSrc: '',

            components: {
                videoPlayer: shallowRef(VideoPlayer)
            },

            user: {
                hasLiked: false,
                hasDisliked: false,
                isOwner: false,

                isCreatingComment: false
            },

            postId: ''
        };
    },

    methods: {
        abbreviationConvert,

        deletePostPrompt() {
            const actionName = 'postDeletion'

            this.$showModal('confirmPrompt', {
                actionName,
                text: 'Are you sure you want to delete this post? This action cannot be reversed!'
            });

            this.$on(`actionConfirmed_${actionName}`, this.deletePost);
        },

        async deletePost() {
            const { popupMessages, popupErrors } = useAppConfig();

            const params = this.$route.params;
            const postId = params.id;

            if (!postId) return;

            this.$showPopup(popupMessages.loading);

            try {
                await $fetch(`/api/posts/${postId}`, {
                    method: 'DELETE'
                });

                this.$showPopup({
                    type: 'success',
                    content: 'Post has been deleted!'
                });

                setTimeout(() => {
                    window.location.replace('/');
                }, 1000);
            } catch(e) {
                console.error(e);

                this.$showPopup(popupErrors.default);
            }
        },

        promptCommentCreation() {
            this.$event('showModal')
        },

        async updateFeedback(type: string, action: string) {
            const params = this.$route.params;
            const postId = params.id;

            try {
                await $fetch(`/api/posts/${postId}/feedback`, {
                    method: 'PATCH',

                    body: {
                        feedbackType: type,
                        action
                    }
                });
            } catch(e) {
                console.error(e);
            }
        },

        async sendFeedback(event: MouseEvent) {
            const target = event.currentTarget;

            if (!target) return;

            const userData = useUserData();

            if (Object.keys(userData.user).length === 0) return;

            const id = target.id;
            const user = this.user;

            if (id === 'eng-like') {
                if (!user.hasLiked) {
                    if (user.hasDisliked) {
                        this.user.hasDisliked = false;
                        this.engagement.dislikes -= 1;

                        await this.updateFeedback('dislike', 'remove');
                    }

                    this.user.hasLiked = true;
                    this.engagement.likes += 1;

                    await this.updateFeedback('like', 'add');

                    return;
                }
                
                if (user.hasLiked) {
                    this.user.hasLiked = false;
                    this.engagement.likes -= 1;

                    await this.updateFeedback('like', 'remove');

                    return;
                }
            }

            if (id === 'eng-dislike') {
                if (!user.hasDisliked) {
                    if (user.hasLiked) {
                        this.user.hasLiked = false;
                        this.engagement.likes -= 1;

                        await this.updateFeedback('like', 'remove');
                    }

                    this.user.hasDisliked = true;
                    this.engagement.dislikes += 1;

                    await this.updateFeedback('dislike', 'add');

                    return;
                }
                

                if (user.hasDisliked) {
                    this.user.hasDisliked = false;
                    this.engagement.dislikes -= 1;

                    await this.updateFeedback('dislike', 'remove');

                    return;
                }
            }
        },

        async validateMedia(postId: string, mediapath: string) {
            try {
                const mediaIsValid = await $fetch(`/api/posts/${postId}/validate-media`, {
                    method: 'GET',

                    params: {
                        mediapath
                    }
                });

                if (mediaIsValid) {
                    return true;
                }
            } catch(e) {
                console.error(e);
                return;
            }
        },

        async loadVideoMedia() {
            const params = this.$route.params;
            const postId = params.id;

            const { cdnUrl } = useAppConfig();
            const pathName = window.location.pathname;

            const postAttachments = $('.post-attachments');
            
            if (this.videoMedia.length === 0) return;
            

            for (let i = 0; i < this.videoMedia.length; i++) {
                const httpReq = new XMLHttpRequest();
                httpReq.open('HEAD', `${cdnUrl}${pathName}/${this.videoMedia[i]}`, false);
                httpReq.send();

                

                if (httpReq.status === 200 || httpReq.status === 304) {
                    this.videoSrc = `${cdnUrl}${pathName}/${this.videoMedia[i]}`;
                } else {
                    const isValid = await this.validateMedia(postId, this.videoMedia[i]);

                    if (!isValid) return;
                    
                    postAttachments.append(createMediaProcessing());
                }
            }
        },

        loadUserFeedback(postData: any) {
            const userData = useUserData();

            const likes = postData.likes;
            const dislikes = postData.dislikes;

            if (Object.keys(userData.user).length > 0) {
                const hasDisliked = dislikes.find((u) => u.id === userData.user.id);
                const hasLiked = likes.find((u) => u.id === userData.user.id);

                if (hasDisliked) {
                    this.user.hasDisliked = true;
                }

                if (hasLiked) {
                    this.user.hasLiked = true;
                }
            }
        }
    },

    async beforeCreate() {
        const params = this.$route.params;
        const postId = params.id;

        const postData = await useFetch(`/api/posts/${postId}/post`, {
            method: 'get',
        });

        const data = postData.data.value;

        if (!data) {
            return showError({
                statusCode: 404,
                statusMessage: 'Post not found!'
            });
        }

        const mainPostData = data.post;

        this.title = mainPostData.title;
        this.content = generateHTML(
            JSON.parse(mainPostData.content),
            createExtentions(),
        );

        this.media = mainPostData.media;

        const likes = mainPostData.likes;
        const dislikes = mainPostData.dislikes;

        this.engagement.likes = likes.length;
        this.engagement.dislikes = dislikes.length;

        this.loadUserFeedback(mainPostData);
        
        if (this.media.length > 0) {
            this.imageMedia = mainPostData.media.filter((m) => m.endsWith('.jpeg') || m.endsWith('.png') || m.endsWith('.jpg'));
            this.videoMedia = mainPostData.media.filter((m) => m.endsWith('.mp4'));

            //this.loadVideoMedia();
        }

        this.picture = mainPostData.author.picture;
        this.username = mainPostData.author.username;
        //console.log(data);
        this.user.isOwner = data.isOwner;
    },

    mounted() {
        this.loadVideoMedia();
    },
};
</script>
