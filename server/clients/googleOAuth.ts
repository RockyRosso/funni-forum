import { google } from 'googleapis';

import * as dotenv from 'dotenv';
dotenv.config();

export default new google.auth.OAuth2({
    clientId: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    redirectUri: process.env.REDIRECT_URL,
});
