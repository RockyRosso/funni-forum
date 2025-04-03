<template>
    <div style="margin: 20px" class="uploader-container">
        <div class="uploader-files">
            <input
                title=""
                style="display: none"
                class="file-upload"
                id="file"
                accept="image/png, image/jpeg, video/mp4, video/mov, video/webm"
                type="file"
                multiple
                @change="uploadPrepare"
            />

            <PostCreationMediaViewer :files="files" editmode="true" />
        </div>

        <div class="uploader-options" style="text-align: center">
            <button
                style="margin-bottom: 10px"
                @click="promptFile"
                data-btn-style="secondary"
            >
                + Add File(s)
            </button>

            <div v-if="files.length > 0">
                <button @click="removeFile" data-btn-style="danger">
                    <i class="fa-solid fa-trash"></i> Remove File
                </button>
            </div>
        </div>
    </div>
</template>

<style src="~/assets/styles/components/uploader.scss" />

<script lang="ts">
const files: File[] = [];

export default {
    data() {
        return {
            files,
        };
    },

    methods: {
        removeFile() {
            const currentFile = $('.mv-file.preview');
            const filePosition = currentFile.attr('id');

            const postStateDate = usePostData();

            if (!filePosition) return;

            this.files.splice(Number(filePosition?.split('-')[1]), 1);
            postStateDate.modify('files', this.files);

            this.$event('fileRemove');
        },

        promptFile() {
            $('#file').trigger('click');
        },

        dragOver(event: Event) {
            event.preventDefault();
        },

        drop(event: DragEvent) {
            event.preventDefault();

            const dropData = event.dataTransfer;

            if (!dropData?.files) return;

            this.uploadPrepare(undefined, dropData.files);
        },

        async uploadPrepare(event?: Event, data?: FileList) {
            const postStateDate = usePostData();
            const { maxMB, maxPostVideos, maxPostImages } = useAppConfig();

            let form = null;

            if (event) {
                form = event?.target;
            }

            const files: FileList = form?.files || data;

            const videoFile = this.files.filter((f) =>
                f.type.startsWith('video/'),
            );
            const imageFile = this.files.filter((f) =>
                f.type.startsWith('image/'),
            );

            for (let i = 0; i < files.length; i++) {
                if (files[i].size > maxMB)
                    return this.$showPopup({
                        content: 'Max file size is 25 MB!',
                        type: 'error',
                        isTimed: true,
                    });

                if (files[i].type.startsWith('video/')) {
                    if (videoFile.length >= maxPostVideos) {
                        return this.$showPopup({
                            type: 'error',
                            content: `Post can only have a max amount of ${maxPostVideos} video(s)`,
                        });
                    }
                }

                if (files[i].type.startsWith('image/')) {
                    if (imageFile.length >= maxPostImages) {
                        return this.$showPopup({
                            type: 'error',
                            content: `Post can only have a max amount of ${maxPostImages} image(s)`,
                        });
                    }
                }

                this.files.push(files[i]);
                postStateDate.modify('files', this.files);

                this.$event('fileAdd', files[i]);
            }

            usePostData().modify('files', this.files);
        },
    },
};
</script>
