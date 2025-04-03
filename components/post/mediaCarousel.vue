<template>
    <div
        style="margin: 20px"
        class="mc-container"
        v-if="files && files.length > 0"
    >
        <div class="mc-content">
            <div class="mc-media">
                <img
                    v-for="(file, i) in files"
                    :id="`img-${i}`"
                    style="display: none"
                    class="mc-item"
                    width="500px"
                    :src="`${appData.cdnUrl}${$route.path}/${file}`"
                />
            </div>

            <div class="mc-switch" v-if="maxPage > 0">
                <button
                    disabled
                    @click="
                        toggleLeft();
                        updateButtonState($event);
                    "
                    class="mc-switch-btn-left mc-switch-btn"
                    data-btn-style="secondary"
                >
                    <i class="fa-solid fa-caret-left"></i>
                </button>
                <button
                    @click="
                        toggleRight();
                        updateButtonState($event);
                    "
                    class="mc-switch-btn-right mc-switch-btn"
                    data-btn-style="secondary"
                >
                    <i class="fa-solid fa-caret-right"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style src="~/assets/styles/components/mediaCarousel.scss" />

<script lang="ts">
export default {
    data() {
        return {
            maxPage: 0,
            currentPage: 0,

            appData: useAppConfig(),
        };
    },

    props: {
        files: Array<string>,
    },

    methods: {
        toggleLeft() {
            this.currentPage -= 1;
        },

        toggleRight() {
            console.log(this.currentPage);
            this.currentPage += 1;
        },

        updateButtonState(event?: MouseEvent) {
            if (!this.files) return;

            if (event) {
                const eventTarget = event.currentTarget;

                if (!eventTarget) return;

                $('.mc-item').hide();

                $('.mc-switch-btn-right').removeAttr('disabled');
                $('.mc-switch-btn-left').removeAttr('disabled');

                if (eventTarget.classList.contains('mc-switch-btn-left')) {
                    if (this.currentPage < 0) {
                        this.currentPage = 0;
                        return;
                    }
                }

                if (eventTarget.classList.contains('mc-switch-btn-right')) {
                    if (this.currentPage > this.maxPage) {
                        this.currentPage = this.maxPage;
                        return;
                    }
                }
            }

            if (this.currentPage === this.maxPage) {
                $('.mc-switch-btn-right').attr('disabled', '');
            }

            if (this.currentPage === 0) {
                $('.mc-switch-btn-left').attr('disabled', '');
            }

            $(`#img-${this.currentPage}`).show();
        },
    },

    mounted() {
        if (this.files) {
            this.maxPage = this.files.length - 1;
            this.updateButtonState();
        }
    },
};
</script>
