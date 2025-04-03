//-- Variables

import prisma from '~/server/db/prisma';
import {
    badRequestError,
    notFoundError,
} from '~/server/serverUtils/resonseGenerator';

//--

export default defineEventHandler(async (event) => {
    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.username) return badRequestError(event);
    if (params.username === 'personal') return badRequestError(event);

    const username = params.username;

    const user = await prisma.user.findFirst({
        select: {
            username: true,
            id: true,
            display_name: true,
            picture: true,

            posts: true,
        },

        where: {
            username,
        },
    });

    if (!user) return notFoundError(event);

    return user;
});
