//-- Variables

import { dataUrlToBuffer } from '~/server/serverUtils/pictureHandler';
import prisma from '../../../db/prisma';
import {
    badRequestError,
    internalServerError,
    notFoundError,
    unauthorizedError,
} from '../../../serverUtils/resonseGenerator';
import { uploadObject } from '~/server/serverUtils/s3Manager';
import { validatePost } from '~/server/serverUtils/managers/postsManager';
import MailManager from '~/server/serverUtils/managers/mailManager';

//--

//-- Functions

async function uploadMedia(media: Array<string>, postId: string) {
    const { mediaUploadPaths } = useAppConfig();

    for (let i = 0; i < media.length; i++) {
        if (media[i].startsWith('data:')) {
            const buffer = dataUrlToBuffer(media[i]);

            if (!buffer) return;

            const result = await uploadObject(
                `${mediaUploadPaths.rawUploads}/${postId}/${postId}_${i}`,
                buffer,
            );

            if (!result) return;
        }
    }
}

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const { postId, postContent, postTitle, media } = await readBody(event);

    if (!postId) return badRequestError(event);
    if (!postTitle) return badRequestError(event);
    if (!postContent) return badRequestError(event);
    if (!media) return badRequestError(event);

    if (typeof postId !== 'string') return badRequestError(event);
    if (typeof postTitle !== 'string') return badRequestError(event);
    if (typeof postContent !== 'string') return badRequestError(event);

    const userId = getCookie(event, userIdCookieName);

    if (!userId) return unauthorizedError(event);

    const isValid = await validatePost(postId, userId);

    if (!isValid) return unauthorizedError(event);

    let postMedia = media;

    if (postMedia.length > 0) {
        postMedia = await uploadMedia(media, postId);
    }

    try {
        const createdPost = await prisma.post.update({
            where: {
                id: postId,
            },

            data: {
                title: postTitle,
                content: postContent,
                media,
            },
        });

        if (!createdPost) return internalServerError(event);

        const email = event.headers.get('x-user-email');

        const mailManager = new MailManager(email || '');

        mailManager.sendNewPostNotification(
            {
                title: postTitle,
                id: postId
            },
            createdPost.categoryId
        ).then(() => console.log(`Sent notifications for post: ${postId}`))
        .catch((e) => console.error(e));

    } catch (error) {
        console.error(error);
        return notFoundError(event);
    }

    setResponseStatus(event, 201, 'Created');

    return {
        statusCode: 201,
        statusMessage: 'Created',
    };
});
