//-- Variables

import { Prisma } from '@prisma/client';
import prisma from '~/server/db/prisma';
import {
    badRequestError,
    internalServerError,
    unauthorizedError,
} from '~/server/serverUtils/resonseGenerator';
import User from '~/server/serverUtils/user';

import { validateSchemas } from '~/server/schemas/settings';

//--

export default defineEventHandler(async (event) => {
    const { sessionIdCookieName } = useAppConfig(event);

    let body = await readBody(event);

    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const sessionId = getCookie(event, sessionIdCookieName);
    const user = await User.fetchUserFromSessionId(sessionId || '');

    if (!user) return unauthorizedError(event);

    const settings = user.settings;

    if (!settings) return internalServerError(event);

    const userSettings = validateSchemas(body);

    if (!userSettings) return badRequestError(event);

    const categoryNotifications = settings.category_notifications;

    let categoriesToSet: Prisma.CategoryWhereUniqueInput[] | null = null;

    if (categoryNotifications) {
        const newCategoryNotifications = userSettings.category_notifications;

        if (
            JSON.stringify(categoryNotifications) !==
            JSON.stringify(newCategoryNotifications)
        ) {
            categoriesToSet = newCategoryNotifications.map((c: any) => ({
                id: c.id,
            }));
        }
    }

    let updatedSettings = userSettings;

    if (categoriesToSet) {
        updatedSettings['category_notifications'] = { set: categoriesToSet };
    } else {
        delete updatedSettings['category_notifications'];
    }

    delete updatedSettings['id'];

    try {
        await prisma.userSetting.update({
            where: {
                id: settings.id,
            },

            data: updatedSettings,
        });
    } catch (e) {
        console.error(e);

        return internalServerError(event);
    }

    return { message: 'Updated!', data: userSettings };
});
