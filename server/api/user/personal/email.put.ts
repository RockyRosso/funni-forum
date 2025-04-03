//-- Variables

import {
    badRequestError,
    internalServerError,
} from '~/server/serverUtils/resonseGenerator';

import prisma from '~/server/db/prisma';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    let body = await readBody(event);

    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const email = body.email;

    if (!email.includes('@')) return badRequestError(event);

    const userId = getCookie(event, userIdCookieName);

    try {
        const user = await prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                email,
                verified: false
            },
        });

        return {
            message: 'Updated email!',
            data: {
                username: user.username,
                email: user.email,
                picture: user.picture,
            },
        };
    } catch (e) {
        console.error(e);
        return internalServerError(event);
    }
});
