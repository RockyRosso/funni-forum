//-- Variables

import { generatePostId } from '~/server/serverUtils/credentialGenerator';
import prisma from '../../../db/prisma';
import {
    badRequestError,
    internalServerError,
    notFoundError,
    unauthorizedError,
} from '../../../serverUtils/resonseGenerator';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    const { category } = await readBody(event);

    if (!category) return badRequestError(event);

    const postId = await generatePostId();

    const userId = getCookie(event, userIdCookieName);

    if (!userId) return unauthorizedError(event);

    const userPermission = event.headers.get('x-user-permission');

    if (!userPermission) return internalServerError(event);

    const requestedCategory = await prisma.category.findFirst({
        where: {
            id: category.id
        }
    });

    if (!requestedCategory) return notFoundError(event);

    if (requestedCategory.permission_required_id) {
        if (requestedCategory.permission_required_id !== Number(userPermission)) return unauthorizedError(event);
    }

    try {
        await prisma.post.create({
            data: {
                id: postId,

                author: {
                    connect: {
                        id: userId,
                    },
                },

                category: {
                    connect: {
                        id: category.id,
                    },
                },
            },
        });
    } catch (e) {
        console.error(e);
        return internalServerError(event);
    }

    setResponseStatus(event, 201, 'Created');

    return {
        statusCode: 201,
        statusMessage: 'Created',
        data: {
            postId,
        },
    };
});
