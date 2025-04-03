//-- Variables

import { google } from 'googleapis';
import googleOAuth from '../clients/googleOAuth';

import { generateIdWithCheck, generateSessionId } from './credentialGenerator';
import User from './user';
import prisma from '../db/prisma';

import settingsSchema from '../schemas/settings';
import { authResult } from '../types/authentication';
import UserAuth from './userAuth';

//--

//-- Classes

export default class UserOAuth {
    sessionId?: string;

    constructor(sessionId?: string) {
        this.sessionId = sessionId;
    }

    async signup(tokens: any) {
        const response = {
            result: null as authResult | null,
            error: null as string | null,
        };

        googleOAuth.setCredentials(tokens);

        const userAuth = google.oauth2({
            version: 'v2',
            auth: googleOAuth,
        });

        const userInfo = await userAuth.userinfo.get();

        const id = await generateIdWithCheck(16, 'id');

        const user = new User(id);

        const pictureId = await user.uploadProfilePicture(
            userInfo.data.picture || '',
        );

        try {
            await prisma.user.create({
                data: {
                    id,

                    username: id,

                    oauth: true,
                    email: userInfo.data.email || '',

                    verified: true,

                    picture: `/users/${id}/${pictureId}.png`,

                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,

                    settings: settingsSchema(),
                },
            });

            const userAuthClass = new UserAuth(id);
            const sessionId = await userAuthClass.generateSession(id);

            if (!sessionId) {
                response.error = 'Failed to generate session ID';
                return response;
            }

            response.result = { sessionId, id, action: 'signup' };

            return response;
        } catch (e) {
            console.error(e);

            response.error = JSON.stringify(e);

            return response;
        }
    }

    async login(
        email: string,
        tokens: any,
        userId: string,
        ip?: string | null,
    ) {
        const response = {
            result: null as authResult | null,
            error: null as string | null,
        };

        googleOAuth.setCredentials(tokens);

        const userAuth = google.oauth2({
            version: 'v2',
            auth: googleOAuth,
        });

        const refreshTokenResult = await googleOAuth.refreshAccessToken();
        const credentials = refreshTokenResult.credentials;

        const userInfo = await userAuth.userinfo.get();

        if (userInfo.data.email !== email) {
            response.error = "This account doesn't exist!";
            return response;
        }

        const userAuthClass = new UserAuth(userId);
        const sessionId = await userAuthClass.generateSession(ip);

        if (!sessionId) {
            response.error = 'Failed to generate session ID';

            return response;
        }

        try {
            await prisma.user.update({
                where: {
                    id: userId,
                },

                data: {
                    access_token: credentials.access_token,
                    refresh_token: credentials.refresh_token,
                },
            });
        } catch (e) {
            console.error(e);

            response.error = JSON.stringify(e);

            return response;
        }

        response.result = {
            sessionId,
            id: userId,
            action: 'login',
        };

        return response;
    }
}

//--
