<template>
    <form class="pfp-form">
        <div class="profile-picture-display" style="margin: 10px">
            <img
                class="pfp-preview pfp medium"
                :src="`${picture && picture !== '' ? picture : `${staticAssetsUrl}/logo.png`}`"
                height="300px"
                loading="lazy"
            />
            <button
                @click="prompt"
                class="pfp-btn"
                data-btn-style="secondary"
                type="button"

                :disabled="disableActions"
            >
                <i class="fa-solid fa-file-arrow-up"></i>
            </button>
            <button
                @click="uploadPicture"
                id="submit"
                class="pfp-btn"
                data-btn-style="secondary"
                type="button"

                :disabled="disableActions"
            >
                Submit
            </button>
        </div>

        <div style="display: none">
            <input
                @change="updatePreview"
                id="picture"
                class="pfp-upload"
                title=""
                accept="image/png, image/jpeg"
                type="file"
            />
        </div>
    </form>
</template>

<style scoped lang="scss">
.pfp-btn {
    width: 100%;
    text-align: center;

    margin-top: 30px;
}
</style>

<script lang="ts">
let file: File | null = null;

export default {
    data() {
        return {
            file,
            staticAssetsUrl: useAppConfig().staticAssetsUrl,

            disableActions: false
        };
    },

    props: {
        picture: String,
    },

    methods: {
        prompt() {
            $('.pfp-upload').trigger('click');
        },

        updatePreview(event: Event) {
            if (!event.target) return;

            const pfpPreview = $('.pfp-preview');

            const files = event.target.files;

            this.file = files[0];
            pfpPreview.attr('src', URL.createObjectURL(files[0]));
        },

        async uploadPicture(event: Event) {
            const { maxPfpMB } = useAppConfig();

            this.disableActions = true;

            if (!event.target) return;

            const pfpPreview = $('.pfp-preview');
            const pfpWidth = pfpPreview.width();
            const pfpHeight = pfpPreview.height();

            const pfpSubmitButton = $('.pfp-submit');
            pfpSubmitButton.attr('disabled', 'true');

            if (this.file) {
                if (this.file.size > maxPfpMB) {
                    this.disableActions = false;

                    this.$showPopup({
                        content: `Max file size is ${maxPfpMB / 1000000}`,
                        type: 'error',
                    });

                    return;
                }
            }

            const userId = useCookie('u_id').value;

            if (!userId) return;

            await this.$uploadImage(pfpPreview[0], 'user', pfpWidth, pfpHeight);

            this.$event('pfpUploadComplete');

            this.disableActions = false;
        },
    },
};
</script>
