//-- Variables

import prisma from '~/server/db/prisma';
import { uploadImage } from '~/server/serverUtils/pictureHandler';
import {
    badRequestError,
    internalServerError,
    unauthorizedError,
} from '~/server/serverUtils/resonseGenerator';

import { JSONPatchDocument, immutableJSONPatch } from 'immutable-json-patch';
import { generateIdWithCheck } from '~/server/serverUtils/credentialGenerator';

//--

export default defineEventHandler(async (event) => {
    const allowModification = ['picture', 'display_name'];

    const { userIdCookieName, idLengths } = useAppConfig(event);

    let body = await readBody(event);

    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const userId = getCookie(event, userIdCookieName);

    if (!userId) return unauthorizedError(event);

    const user = await prisma.user.findFirst({
        select: {
            picture: true,
            pictureId: true,
            display_name: true,
        },

        where: {
            id: userId,
        },
    });

    if (!user) return unauthorizedError(event); // Typescript is a bitch >:(

    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);

    let modifiedUser;
    const patchOperations: JSONPatchDocument = [];

    for (let i = 0; i < bodyKeys.length; i++) {
        modifiedUser = null;

        const key = bodyKeys[i] as keyof typeof user;

        if (user[key] && allowModification.includes(bodyKeys[i])) {
            if (typeof user[key] !== typeof bodyValues[i])
                return badRequestError(event);

            if (
                bodyKeys[i] === 'picture' &&
                typeof bodyValues[i] === 'string'
            ) {
                const pictureId = await generateIdWithCheck(
                    idLengths.pictureId,
                    'pictureId',
                );
                const result = await uploadImage(
                    userId,
                    pictureId,
                    'users',
                    bodyValues[i],
                );

                if (!result) return internalServerError(event);

                patchOperations.push(
                    {
                        op: 'replace',
                        path: '/picture',
                        value: result.picture,
                    },

                    {
                        op: 'replace',
                        path: '/pictureId',
                        value: pictureId,
                    },
                );
            } else {
                patchOperations.push({
                    op: 'replace',
                    path: `/${bodyKeys[i]}`,
                    value: JSON.stringify(bodyValues[i]),
                });
            }
        }
    }

    if (patchOperations.length === 0) return;

    const updatedData = immutableJSONPatch(user, patchOperations);

    if (!updatedData) return;

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },

            data: updatedData,
        });
    } catch (e) {
        console.error(e);
        return internalServerError(event);
    }

    return { message: 'Updated!', data: updatedData };
});
