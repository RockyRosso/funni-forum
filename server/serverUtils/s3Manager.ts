//-- Variables

import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';

import * as dotenv from 'dotenv';
dotenv.config();

const secretAccessKey = process.env.S3_SERVERLVL_SECRET_KEY;
const accessKey = process.env.S3_SERVERLVL_ACCESS_KEY;

const bucket = 'funny-forum-uploads';

const s3Client = new S3Client({
    region: 'us-east-2',

    credentials: {
        accessKeyId: accessKey || '',
        secretAccessKey: secretAccessKey || '',
    },
});

//--

//-- Functions

export async function deleteObject(Key: string) {
    const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key
    });

    return await s3Client.send(deleteObjectCommand);
}

export async function getObject(Key: string) {
    const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key,
    });

    return await s3Client.send(getObjectCommand);
}

export async function uploadObject(Key: string, Body: Buffer) {
    const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Body,
        Key,
    });

    return await s3Client.send(putObjectCommand);
}

//--
