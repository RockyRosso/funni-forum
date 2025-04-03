//-- Variables

import prisma from '~/server/db/prisma';
import {
    badRequestError,
    notFoundError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName } = useAppConfig();
    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.postId) return badRequestError(event);

    const postId = params.postId;

    const sessionId = getCookie(event, sessionIdCookieName);

    const user = await User.fetchUserFromSessionId(sessionId || '');
    let isOwner = false;

    const post = await prisma.post.findFirst({
        where: {
            id: postId,

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

            comments: true,

            likes: {
                select: {
                    id: true,
                },
            },

            dislikes: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!post) return notFoundError(event);

    if (user) {
        const userClass = new User(user.id);
        const hasPermission =
            await userClass.verifyValidPermission('DELETE_POST');

        if (user.id === post.authorId) {
            isOwner = true;
        }

        if (hasPermission) {
            isOwner = true;
        }
    }

    return { post: post, isOwner };
});
