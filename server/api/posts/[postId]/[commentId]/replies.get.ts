//-- Variables

import prisma from '~/server/db/prisma';
import {
    badRequestError,
    internalServerError,
    notFoundError,
} from '~/server/serverUtils/resonseGenerator';

//--

export default defineEventHandler(async (event) => {
    const params = event.context.params;

    if (!params) return badRequestError(event);

    const postId = params.postId;
    const commentId = params.commentId;

    if (!postId) return notFoundError(event);
    if (!commentId) return notFoundError(event);

    try {
        const replies = await prisma.comment.findMany({
            where: {
                postId,
                commentRepliedToId: commentId,

                NOT: {
                    deleted: {
                        equals: true,
                    },
                },
            },

            include: {
                author: {
                    select: {
                        username: true,
                        picture: true,
                    },
                },
            },
        });

        return replies;
    } catch (e) {
        console.error(e);
        return internalServerError(event);
    }
});
