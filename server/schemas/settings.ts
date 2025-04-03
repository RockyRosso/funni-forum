import { Prisma } from '@prisma/client';

import notifications from './settings/notifications';
import security from './settings/security';

import { generateId } from '../serverUtils/credentialGenerator';

function generateSchemas(): Prisma.UserSettingCreateNestedOneWithoutOwnerInput {
    return {
        create: {
            id: generateId(32),

            security: security.data,
            notifications: notifications.data,
        },
    };
}

export function validateSchemas(settings: any) {
    if (settings.notifications) {
        const validator = notifications.validator;

        if (!validator(settings.notifications)) return;
    }

    if (settings.security) {
        const validator = security.validator;

        if (!validator(settings.security)) return;
    }

    return settings;
}

export default generateSchemas;
