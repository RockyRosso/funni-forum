//-- Variables

import {
    deletePost,
    fetchPost,
} from '~/server/serverUtils/managers/postsManager';
import {
    unauthorizedError,
    badRequestError,
    internalServerError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.postId) return badRequestError(event);

    const postId = params.postId;

    const userId = getCookie(event, userIdCookieName);

    if (!userId) return unauthorizedError(event);

    const post = await fetchPost(postId);

    const user = new User(userId);

    if (!post) return badRequestError(event);

    if (post.authorId !== userId) {
        const hasPermission = await user.verifyValidPermission('DELETE_POST');

        if (!hasPermission) return unauthorizedError(event);
    }

    const postDeleted = await deletePost(postId);

    if (postDeleted) return { message: 'Deleted post!' };

    return internalServerError(event);
});
