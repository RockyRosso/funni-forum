//-- Variables

import prisma from '~/server/db/prisma';

import googleOAuth from '../clients/googleOAuth';
import { google } from 'googleapis';
import {
    generateIdWithCheck,
    generateSessionId,
    generateId,
} from './credentialGenerator';

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { uploadObject } from './s3Manager';

import fetch from 'node-fetch';

import settingsSchema from '../schemas/settings';
import { generateHash, hashMatch } from './secureHashing';
import UserOAuth from './userOauth';
import { authResult, oAuthResult } from '../types/authentication';

const { cdnUrl } = useAppConfig();

//--

//-- Functions

function generatePasswordHash(password: string, storedSalt?: string) {
    let salt = storedSalt;

    if (!salt) {
        salt = randomBytes(16).toString('hex');
    }

    const hash = scryptSync(password, salt, 64).toString('hex');

    return { salt, hash };
}

async function uploadProfilePicture(url: string, id: string) {
    const file = await fetch(url.split('=')[0], {
        method: 'GET',
    });

    const pictureId = generateId(32);

    await uploadObject(
        `${process.env.APP_STATE}/uploads/users/${id}/${pictureId}.png`,
        Buffer.from(await file.arrayBuffer()),
    );

    return pictureId;
}

//--

//-- Classes

export default class UserAuth {
    id?: string;
    errorMessage: string;

    constructor(id?: string) {
        this.id = id;

        this.errorMessage = '';
    }

    // Fancy typescript magic 👻

    async signup(
        passwordOrTokens: string | any,
        oauth?: true,
        email?: string,
    ): Promise<oAuthResult | undefined>;
    async signup(
        passwordOrTokens: string | any,
        oauth?: false,
        email?: string,
    ): Promise<authResult | undefined>;
    async signup(
        passwordOrTokens: string | any,
        oauth?: boolean,
        email?: string,
        ip?: string,
    ) {
        if (oauth) {
            const userOAuth = new UserOAuth();
            return await userOAuth.signup(passwordOrTokens);
        }

        if (!email) return;

        const id = await generateIdWithCheck(16, 'id');
        const { salt, hash } = generatePasswordHash(passwordOrTokens);

        try {
            await prisma.user.create({
                data: {
                    id,

                    username: id,

                    oauth: false,
                    email: email,

                    verified: true,

                    picture: `${cdnUrl}/users/default.png`,

                    password_salt: salt,
                    password_hash: hash,

                    settings: settingsSchema(),
                },
            });

            const sessionId = await this.generateSession(ip, id);

            return { sessionId, id, action: 'signup' };
        } catch (e) {
            console.error(e);
            return;
        }
    }

    // More fancy typescript magic 👻

    async login(
        email: string,
        passwordOrTokens: string | any,
        oauth: true,
        ip?: string | null,
    ): Promise<oAuthResult | undefined>;
    async login(
        email: string,
        passwordOrTokens: string | any,
        oauth: false,
        ip?: string | null,
    ): Promise<authResult | undefined>;
    async login(
        email: string,
        passwordOrTokens: string | any,
        oauth?: boolean,
        ip?: string | null,
    ) {
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                password_hash: true,
                password_salt: true,
            },

            where: {
                email,
            },
        });

        if (!user) {
            this.errorMessage = "This account doesn't exist!";
            return;
        }

        if (oauth) {
            const userOAuth = new UserOAuth();

            return await userOAuth.login(email, passwordOrTokens, user.id, ip);
        }

        this.errorMessage = 'Incorrect Password!';

        if (!user.password_salt) return;
        if (!user.password_hash) return;

        const newHash = generateHash(passwordOrTokens, user.password_salt);

        if (!hashMatch(user.password_hash, newHash.hash)) return;

        const sessionId = await this.generateSession(ip, user.id);

        return {
            sessionId,
            id: user.id,
            action: 'login',
        };
    }

    async logout(sessionId: string) {
        try {
            await prisma.user.update({
                where: {
                    id: this.id,
                },

                data: {
                    sessions: {
                        delete: {
                            id: sessionId,
                        },
                    },
                },
            });

            return true;
        } catch (e) {
            console.error(e);
            return;
        }
    }

    async generateSession(ip?: string | null, id?: string) {
        let userId = this.id;

        if (!this.id) {
            if (!id) return;

            userId = id;
        }

        if (!userId) return; // Typescript moment

        const sessionId = await generateSessionId(userId);

        await prisma.session.create({
            data: {
                id: sessionId,

                owner: {
                    connect: {
                        id: userId,
                    },
                },

                ip,
            },
        });

        return sessionId;
    }

    static async generateOauthData(code: string) {
        const { tokens } = await googleOAuth.getToken(code);
        googleOAuth.setCredentials(tokens);

        const userAuth = google.oauth2({
            version: 'v2',
            auth: googleOAuth,
        });

        const userInfo = await userAuth.userinfo.get();

        return { tokens, userInfo };
    }
}

//--
