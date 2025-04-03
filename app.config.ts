export default defineAppConfig({
    cdnUrl: 'https://cdn.funniforum.xyz',
    fileProcessorUrl: 'https://ff-fp.funniforum.xyz',
    staticAssetsUrl: 'https://static.funniforum.xyz',

    sessionIdCookieName: 'ff_session',
    userIdCookieName: 'u_id',

    mediaUploadPaths: {
        rawUploads: 'raw_uploads',
    },

    videoPlayerConfig: {
        playbackRates: [0.5, 1, 1.5, 2],

        controlBar: {
            skipButtons: {
                forward: 5,
                backward: 5,
            },
        },
    },

    videoPlayerClasses: ['video-js', 'vjs-default-skin'],

    maxMB: 26214400,
    maxPfpMB: 5000000,

    maxPostVideos: 1,
    maxPostImages: 10,

    maxPageSize: 20,

    emailResendCooldown: 30, // Seconds

    defaultCategory: 'announcements',

    popupErrors: {
        default: {
            content: 'An internal error occured!',
            type: 'error',
        },
    },

    popupMessages: {
        loading: {
            content: 'Please wait...',
            type: 'success',
        },
    },

    fileUses: {
        user: 'users',
        post: 'posts',
    },

    idLengths: {
        pictureId: 32,
    },
});
