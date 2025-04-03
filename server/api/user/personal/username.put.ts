//-- Variables

import prisma from '~/server/db/prisma';
import {
    badRequestError,
    internalServerError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const body = JSON.parse(await readBody(event));

    const username = body.username;

    if (!username) return badRequestError(event);

    const existingUser = await User.fetchUserFromUsername(username);

    if (existingUser) {
        setResponseStatus(event, 409);
        return { statusCode: 409, message: 'This username is already taken!' };
    }

    const validUsername = User.checkUsername(username);

    if (!validUsername) {
        setResponseStatus(event, 406);
        return {
            statusCode: 406,
            message: 'Username contains invalid characters (!@#$%^&&*()_)',
        };
    }

    const userId = getCookie(event, userIdCookieName);

    try {
        const user = await prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                username: username.toLowerCase(),
            },
        });

        return {
            message: 'Updated username!',
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
