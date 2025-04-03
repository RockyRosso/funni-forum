<template>
    <div class="vid-container">
        <video
            ref="video_player"
            @timeupdate="updateProgress"
            @ended="isPlaying = false"
            @click="togglePlay"
            class="vid"
        >
            <source :src="src" type="video/mp4" />
        </video>

        <div class="vid-controls">
            <div class="vid-controls-options primary">
                <button @click="togglePlay" class="vid-controls-option">
                    <i class="fa-solid fa-play" v-if="!isPlaying"></i
                    ><i class="fa-solid fa-pause" v-if="isPlaying"></i>
                </button>
                <div
                    ref="progressBar"
                    @mouseleave="mouseDown = false"
                    @mousemove="mouseDown && changeProgress($event)"
                    @mousedown="mouseDown = true"
                    @mouseup="mouseDown = false"
                    @click="changeProgress"
                    class="vid-progress"
                >
                    <div
                        :style="`flex-basis: ${progress}%`"
                        class="vid-progress-filled"
                    ></div>
                </div>
            </div>

            <div
                style="justify-content: end"
                class="vid-controls-options secondary"
            >
                <div style="display: flex; align-items: center">
                    <button class="vid-controls-option">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>

                    <div>
                        <input
                            @input="updateVolume"
                            v-model="volume"
                            class="vid-controls-volume"
                            type="range"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>

                <div>
                    <button
                        @click="toggleFullscreen"
                        class="vid-controls-option"
                    >
                        <i class="fa-solid fa-expand"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            isPlaying: false,
            initialPlay: false,

            mouseDown: false,

            volumeHover: false,

            progress: 0,

            volume: 100,
        };
    },

    props: {
        src: String,
    },

    methods: {
        toggleFullscreen() {
            const video = this.$refs.video_player;

            if (video.requestFullscreen) {
                video.requestFullscreen();
            }

            if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            }

            if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        },

        togglePlay(event: MouseEvent) {
            let video = event.currentTarget;

            if (!video) return;
            if (video.tagName !== 'VIDEO') {
                video = this.$refs.video_player;
            }

            if (video.paused) {
                console.log('hi');
                video.play();
                this.isPlaying = true;
                return;
            }

            video.pause();
            this.isPlaying = false;
        },

        updateVolume() {
            const video = this.$refs.video_player;
            video.volume = this.volume / 100;
        },

        updateProgress(event: Event) {
            const video = event.currentTarget;

            if (!video) return;

            this.progress = (video.currentTime / video.duration) * 100;
        },

        changeProgress(event: MouseEvent) {
            const video = this.$refs.video_player;
            const progressBar = this.$refs.progressBar;

            const newTime =
                (event.offsetX / progressBar.offsetWidth) * video.duration;
            video.currentTime = newTime;
        },
    },

    mounted() {
        const video = this.$refs.video_player;
        video.load();
    },
};
</script>
