//-- Variables

import prisma from '~/server/db/prisma';
import { internalServerError } from '~/server/serverUtils/resonseGenerator';
import UserAuth from '~/server/serverUtils/userAuth';

//--

export default defineEventHandler(async (event) => {
    const { userIdCookieName } = useAppConfig();

    let body = await readBody(event);

    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const personalSettings = body.personalSettings;

    try {
        const userId = getCookie(event, userIdCookieName);

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                personal_settings: personalSettings,
            },
        });

        return { message: 'Updated!', data: updatedUser.personal_settings };
    } catch (e) {
        console.error(e);
        return internalServerError(event);
    }
});
