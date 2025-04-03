export default defineNuxtConfig({
    css: [
        '/assets/styles/base.scss',
        '/assets/styles/components/videoPlayer.scss',
    ],

    devtools: { enabled: false },

    features: {
        devLogs: false
    },

    ssr: true,

    routeRules: {
        '/api/**': {
            cors: true,
            headers: {
                'access-control-allow-origin': 'same-origin',
                'access-control-allow-methods':
                    'HEAD, GET, OPTIONS, POST, PATCH, PUT, DELETE',
            },
        },
    },

    typescript: {
        tsConfig: {
            compilerOptions: {
                baseUrl: '.',
                types: ['jquery', 'node'],

                removeComments: true,
                esModuleInterop: true,
            },
        },
    },

    app: {
        head: {
            titleTemplate: '%s | Funni Forum',

            meta: [
                {
                    name: 'viewport',
                    content:
                        'width=device-width,height=device-height,initial-scale=1,minimum-scale=1',
                },

                {
                    name: 'content-type',
                    content: 'text/html; charset=utf-8',
                },

                {
                    name: 'description',
                    content:
                        'Funni Forum is an internet forum to share your favorite media as well as spark discussions with the community.',
                },

                {
                    name: 'theme-color',
                    content: '#da570b',
                },

                {
                    name: 'keywords',
                    content: 'forum, social media, media, discussion',
                },
            ],

            link: [
                {
                    rel: 'stylesheet',
                    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
                },
            ],

            script: [
                {
                    src: 'https://code.jquery.com/jquery-3.7.1.min.js',
                    type: 'text/javascript',
                },
            ],
        },
    },

    
    gtag: {
        id: 'G-BKE0WV2NG7',
    },

    modules: ['@pinia/nuxt', '@nuxt/content', 'nuxt-gtag'],
});
