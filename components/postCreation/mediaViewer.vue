<template>
    <div class="mv" style="margin-bottom: 10px">
        <div class="mv-display">
            <div class="mv-file-display">
                <component
                    :id="`filepos-${currentFile}`"
                    class="mv-file preview"
                    :src="fileUrl"
                    :is="
                        isVideo && fileUrl !== ''
                            ? components.videoPlayer
                            : 'img'
                    "
                ></component>
            </div>

            <div class="mv-sidebar"></div>
        </div>
    </div>
</template>

<style src="~/assets/styles/components/mediaViewer.scss" />

<script lang="ts">
import { createFilePreview } from '~/assets/scripts/componentCreator';
import generateThumbnail from '~/assets/scripts/thumbnailGenerator';

import { VideoPlayer } from '#components';

let vidPlayer: any;

export default {
    data() {
        return {
            currentFile: 0,
            vidPlayer,

            fileUrl: '',
            isVideo: false,

            components: {
                videoPlayer: VideoPlayer,
            },
        };
    },

    props: {
        files: Array<File>,
        editmode: String,
    },

    methods: {
        async addFileElement(file: File, position: number) {
            const sidebar = $('.mv-sidebar');
            let elementSrc;

            if (file.type.startsWith('video/')) {
                const thumbnail = await generateThumbnail(document, file);
                elementSrc = thumbnail;
            }

            if (file.type.startsWith('image/')) {
                elementSrc = URL.createObjectURL(file);
            }

            sidebar.append(
                createFilePreview(elementSrc || '', position.toString()),
            );
        },

        removeFileElement(position: number) {
            const sidebar = $('.mv-sidebar');
            sidebar.remove(`#${position}`);
        },

        loadSidebarFiles() {
            if (!this.files) return;

            for (let i = 0; i < this.files.length; i++) {
                this.addFileElement(this.files[i], i);
            }

            this.updatePreview();
        },

        updatePreview() {
            this.fileUrl = '';
            if (!this.files) return;
            if (this.files.length === 0) return;

            const fileSlot = $(`#${this.currentFile}`);
            const sidebar = $('.mv-sidebar');

            const file = this.files[this.currentFile];

            this.isVideo = false;

            if (file.type.startsWith('video/')) {
                this.isVideo = true;
            }

            this.fileUrl = URL.createObjectURL(file);

            sidebar.children().children().removeClass('selected');
            fileSlot.children().addClass('selected');
        },

        // Events

        fileAdd(file: File) {
            if (!this.files) return;

            this.addFileElement(file, this.files.length - 1);

            this.currentFile = this.files.length - 1;

            this.updatePreview();
        },

        fileRemove() {
            const sidebar = $('.mv-sidebar');
            sidebar.empty();

            this.currentFile = 0;
            this.loadSidebarFiles();
        },

        displayFile(event: JQuery.ClickEvent) {
            let displayButton = event.target;

            if (
                displayButton.nodeName === 'IMG' &&
                displayButton.parentElement.nodeName === 'BUTTON'
            ) {
                displayButton = displayButton.parentElement;
            }

            if (
                !isNaN(Number(displayButton.parentElement.id)) &&
                displayButton.parentElement.id !== ''
            ) {
                this.currentFile = Number(displayButton.parentElement.id);
                this.updatePreview();
            }
        },
    },

    mounted() {
        this.$on('fileAdd', this.fileAdd);
        this.$on('fileRemove', this.fileRemove);

        $('html').on('click', this.displayFile);

        this.loadSidebarFiles();
    },

    beforeUnmount() {
        this.$off('fileAdd', this.fileAdd);
        this.$off('fileRemove', this.fileRemove);

        $('html').off('click', this.displayFile);
    },
};
</script>
