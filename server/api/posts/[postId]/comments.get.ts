//-- Variables

import { loadPostComments } from '~/server/serverUtils/managers/postsManager';
import {
    badRequestError,
    notFoundError,
} from '~/server/serverUtils/resonseGenerator';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const params = event.context.params;

    if (!params) return badRequestError(event);
    if (!params.postId) return badRequestError(event);

    let dataPage: number;

    const { page } = getQuery(event);

    const userId = getCookie(event, userIdCookieName);

    if (page) {
        if (!Number(page)) return badRequestError(event);

        dataPage = Number(page);
    } else {
        dataPage = 1;
    }

    const postId = params.postId;

    const comments = await loadPostComments(postId, dataPage, userId);

    if (!comments) return notFoundError(event);

    return comments;
});
