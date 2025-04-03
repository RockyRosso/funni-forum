//-- Variables
import prisma from '../db/prisma';
import emailCodes from '../schemas/emailCodes';
import User from '../serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName } = useAppConfig();

    const { code } = getQuery(event);

    const sessionId = getCookie(event, sessionIdCookieName);

    if (!sessionId)
        throw createError({
            statusCode: 403,
            statusMessage: 'Unauthorized',
        });

    if (!code)
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid code',
        });

    const user = await User.fetchUserFromSessionId(sessionId);

    if (!user)
        throw createError({
            statusCode: 403,
            statusMessage: 'Unauthorized',
        });

    const emailCode = await emailCodes.findOne({
        userId: user.id,
    });

    if (!emailCode) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Code not found',
        });
    }

    if (!emailCode.verificationId)
        throw createError({
            statusCode: 404,
            statusMessage: 'Code not found',
        });

    if (emailCode.verificationId === code) {
        await emailCodes.updateOne(
            {
                userId: user.id,
            },

            {
                verificationId: null,
            },
        );

        try {
            await prisma.user.update({
                where: {
                    id: user.id,
                },

                data: {
                    verified: true,
                },
            });
        } catch (e) {
            console.error(e);

            throw createError({
                statusCode: 500,
                statusMessage: 'Internal error',
            });
        }

        if (!user.username || user.username === '') {
            return await sendRedirect(event, '/personal/welcome');
        }

        return await sendRedirect(event, '/');
    }
});
