//-- Variables

import { postComment } from '~/server/serverUtils/managers/commentManager';
import { fetchPost } from '~/server/serverUtils/managers/postsManager';

import {
    badRequestError,
    internalServerError,
    notFoundError,
    unauthorizedError,
} from '~/server/serverUtils/resonseGenerator';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const { postId, commentContent, replyingTo } = await readBody(event);

    if (!postId) return badRequestError(event);
    if (!commentContent) return badRequestError(event);

    const userId = getCookie(event, userIdCookieName);

    if (!userId) return unauthorizedError(event);

    const post = await fetchPost(postId);

    if (!post) return notFoundError(event);

    const comment = await postComment(
        userId,
        postId,
        commentContent,
        replyingTo,
    );

    if (comment) return { message: 'Comment created!' };

    return internalServerError(event);
});
