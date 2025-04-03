//-- Variables

import {
    deleteComment,
    fetchComment,
} from '~/server/serverUtils/managers/commentManager';
import {
    badRequestError,
    internalServerError,
    notFoundError,
    unauthorizedError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.postId) return badRequestError(event);
    if (!params.commentId) return badRequestError(event);

    const postId = params.postId;
    const commentId = params.commentId;

    const userId = getCookie(event, userIdCookieName);

    if (!userId) return unauthorizedError(event);

    const comment = await fetchComment(commentId, postId);
    const user = new User(userId);

    if (!comment) return notFoundError(event);
    if (comment.authorId !== userId) {
        const hasPermission = await user.verifyValidPermission('DELETE_POST');

        if (!hasPermission) return unauthorizedError(event);
    }

    const deletedComment = await deleteComment(commentId, postId);

    if (deletedComment) return { message: 'Deleted comment!' };

    return internalServerError(event);
});
