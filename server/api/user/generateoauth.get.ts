//-- Variables

import googleOAuth from '~/server/clients/googleOAuth';

const oauthScopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

//--

export default defineEventHandler(async (event) => {
    const url = googleOAuth.generateAuthUrl({
        access_type: 'offline',
        scope: oauthScopes,
        prompt: 'consent',
    });

    return url;
});
