//-- Variables

import prisma from '../../../db/prisma';
import {
    badRequestError,
    notFoundError,
} from '../../../serverUtils/resonseGenerator';

const pageSize = 10;

//--

export default defineEventHandler(async (event) => {
    const { page } = getQuery(event);

    if (!page) return badRequestError(event);
    if (!Number(page)) return badRequestError(event);

    const pageNumber = Number(page);

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.username) return badRequestError(event);
    if (params.username === 'personal') return badRequestError(event);

    const username = params.username;

    const user = await prisma.user.findFirst({
        include: {
            posts: true,
        },

        where: {
            username,
        },
    });

    if (!user) return notFoundError(event);
    if (!user.posts) return notFoundError(event);

    const posts = user.posts.slice(
        pageSize * pageNumber - pageSize,
        pageSize * pageNumber,
    );

    if (!posts) return badRequestError(event);

    return posts;
});
