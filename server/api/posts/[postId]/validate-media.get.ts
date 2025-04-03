//-- Variables

import prisma from '~/server/db/prisma';
import { badRequestError } from '~/server/serverUtils/resonseGenerator';
import { getObject } from '~/server/serverUtils/s3Manager';

//--

export default defineEventHandler(async (event) => {
    if (!getQuery(event)) return badRequestError(event);

    const params = event.context.params;

    if (!params) return badRequestError(event);

    const { mediapath } = getQuery(event);
    const postId = params.postId;

    if (!mediapath) return badRequestError(event);

    const post = await prisma.post.findFirst({
        where: {
            id: postId,
        },
    });

    if (!post) return badRequestError(event);
    if (!post.media.includes(mediapath)) return badRequestError(event);

    const object = await getObject(`raw_uploads/${postId}/${mediapath}`);

    if (!object) return badRequestError(event);

    return { message: 'Media is valid!' };
});
