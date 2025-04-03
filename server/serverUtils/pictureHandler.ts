//-- Variables

import * as dotenv from 'dotenv';
import { uploadObject } from './s3Manager';

dotenv.config();

//--

//-- Functions

export function dataUrlToBuffer(pictureData: string) {
    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = pictureData.match(regex);

    if (!matches) return;

    const pictureBuffer = Buffer.from(matches[2], 'base64');

    return pictureBuffer;
}

export async function uploadImage(
    id: string,
    name: string,
    target: string,
    pictureData: string,
) {
    const appState = process.env.APP_STATE;

    const pictureBuffer = dataUrlToBuffer(pictureData);

    if (!pictureBuffer) return;

    const fileKey = `${target}/${id}/${name}.png`;
    const result = await uploadObject(
        `${appState}/uploads/${fileKey}`,
        pictureBuffer,
    );

    if (!result) {
        return;
    }

    return { picture: `/${fileKey}` };
}

//--
