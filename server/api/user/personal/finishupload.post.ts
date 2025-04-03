//-- Variables

import {
    badRequestError,
    internalServerError,
} from '~/server/serverUtils/resonseGenerator';

import * as dotenv from 'dotenv';
dotenv.config();

const appState = process.env.APP_STATE;

//--

export default defineEventHandler(async (event) => {
    const { keys, fileUse } = await readBody(event);

    if (!keys) return badRequestError(event);
    if (!fileUse) return badRequestError(event);

    const { fileProcessorUrl } = useAppConfig();

    for (let i = 0; i < keys.length; i++) {
        console.log(keys[i].Id, keys[i].Key);

        const waitUntilFinish =
            keys[i].Key.endsWith('.jpeg') ||
            keys[i].Key.endsWith('.jpg') ||
            keys[i].Key.endsWith('.png')
                ? true
                : false;

        if (waitUntilFinish) {
            try {
                await $fetch(`${fileProcessorUrl}/api/processmedia`, {
                    method: 'POST',

                    body: {
                        Id: keys[i].Id,
                        Key: keys[i].Key,

                        fileUse,
                        appType: appState || '',
                    },
                });
            } catch (e) {
                console.error(e);
                return internalServerError(event);
            }
        } else {
            try {
                $fetch(`${fileProcessorUrl}/api/processmedia`, {
                    method: 'POST',

                    body: {
                        Id: keys[i].Id,
                        Key: keys[i].Key,

                        fileUse,
                        appType: appState || '',
                    },
                }).then(() => {
                    console.log(`Successfully processed: ${keys[i].Key}`);
                });
            } catch (e) {
                console.error(e);
            }
        }
    }

    return { message: 'File(s) processed' };
});
