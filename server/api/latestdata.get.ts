//-- Variables

import prisma from '../db/prisma';
import {
    badRequestError,
    notFoundError,
} from '../serverUtils/resonseGenerator';

//--

export default defineEventHandler(async (event) => {
    if (!getQuery(event)) return badRequestError(event);

    const { data, limit } = getQuery(event);

    if (!data) return badRequestError(event);
    if (typeof data !== 'string') return badRequestError(event);

    const defaultLimit = 20;

    switch (data) {
        case 'user':
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    join_date: true,
                },

                take: Number(limit) ? Number(limit) : defaultLimit,

                orderBy: {
                    join_date: 'desc',
                },
            });

            return users;

        case 'post':
            const posts = await prisma.post.findMany({
                select: {
                    id: true,
                    title: true,
                    date: true,
                },

                take: Number(limit) ? Number(limit) : defaultLimit,

                orderBy: {
                    date: 'desc',
                },
            });

            return posts;

        case 'comment':
            const comments = await prisma.comment.findMany({
                select: {
                    id: true,
                    date: true,
                },

                take: Number(limit) ? Number(limit) : defaultLimit,

                orderBy: {
                    date: 'desc',
                },
            });

            return comments;

        default:
            return notFoundError(event);
    }
});
