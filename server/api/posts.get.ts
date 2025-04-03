//-- Variables

import {
    badRequestError,
    internalServerError,
} from '../serverUtils/resonseGenerator';

import * as postsManager from '~/server/serverUtils/managers/postsManager';

//--

export default defineEventHandler(async (event) => {
    const { categoryName, page } = getQuery(event);

    if (typeof categoryName !== 'string') return badRequestError(event);
    if (typeof page !== 'string') return badRequestError(event);

    const pageNumber = Number(page);

    if (!pageNumber) return badRequestError(event);

    const posts = await postsManager.loadPostsFromCategory(
        categoryName,
        pageNumber,
    );

    if (!posts) return internalServerError(event);

    return posts;
});
