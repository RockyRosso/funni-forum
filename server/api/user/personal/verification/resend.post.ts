//-- Variables

import {
    badRequestError,
    rateLimitError,
    unauthorizedError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

import emailCodes from '~/server/schemas/emailCodes';

import { v4 as uuid } from 'uuid';

import MailManager from '~/server/serverUtils/managers/mailManager';

const cooldowns: Map<string, boolean> = new Map();

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName, emailResendCooldown } = useAppConfig();

    const { verificationMethod } = await readBody(event);

    if (!verificationMethod) return badRequestError(event);

    const sessionId = getCookie(event, sessionIdCookieName);

    if (!sessionId) return unauthorizedError(event);

    const user = await User.fetchUserFromSessionId(sessionId);

    if (!user) return unauthorizedError(event);
    if (user.verified) return unauthorizedError(event);

    if (cooldowns.get(user.id)) {
        setResponseStatus(event, 429);

        return {
            statusCode: 429,
            message: "You're on a cooldown for 30 seconds",
        };
    }

    const userCodes = await emailCodes.findOne({
        userId: user.id,
    });

    if (!userCodes) {
        await emailCodes.create({
            userId: user.id,
        });
    }

    if (verificationMethod === 'link') {
        const verificationCode = uuid();

        await emailCodes.updateOne(
            {
                userId: user.id,
            },

            {
                verificationId: verificationCode,
            },
        );

        const mailManager = new MailManager(user.email);
        await mailManager.sendVerificationEmail(verificationCode);

        cooldowns.set(user.id, true);

        setTimeout(() => {
            cooldowns.delete(user.id);
        }, emailResendCooldown * 1000);
    }

    return { statusCode: 200, message: 'Resent email!' };
});
