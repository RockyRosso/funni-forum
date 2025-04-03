//-- Variables

import prisma from '~/server/db/prisma';
import {
    badRequestError,
    internalServerError,
    notAcceptableError,
    notFoundError,
} from '~/server/serverUtils/resonseGenerator';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.postId) return badRequestError(event);

    const { feedbackType, action } = await readBody(event);

    if (!feedbackType) return badRequestError(event);
    if (!action) return badRequestError(event);

    const userId = getCookie(event, userIdCookieName);
    const postId = params.postId;

    const post = await prisma.post.findFirst({
        where: {
            id: postId,
        },

        select: {
            likes: true,
            dislikes: true,
        },
    });

    if (!post) return notFoundError(event);

    const actionName = `${feedbackType}s`;
    const postFeedbackTypes =
        feedbackType === 'like'
            ? post.likes.find((u) => u.id === userId)
            : post.dislikes.find((u) => u.id === userId);

    if (action === 'add') {
        if (postFeedbackTypes) return notAcceptableError(event);

        try {
            await prisma.post.update({
                where: {
                    id: postId,
                },

                data: {
                    [actionName]: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        } catch (e) {
            console.error(e);
            return internalServerError(event);
        }
    }

    if (action === 'remove') {
        if (!postFeedbackTypes) return notAcceptableError(event);

        try {
            await prisma.post.update({
                where: {
                    id: postId,
                },

                data: {
                    [actionName]: {
                        disconnect: {
                            id: userId,
                        },
                    },
                },
            });
        } catch (e) {
            console.error(e);
            return internalServerError(event);
        }
    }

    return { message: 'Feedback Sent!' };
});
