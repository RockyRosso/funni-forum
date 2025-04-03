//-- Variables

import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    PutObjectCommand,
    S3Client,
    UploadPartCommand,
} from '@aws-sdk/client-s3';

const secretAccessKey = 'kE/15OThfD1FsQ3pTTwVgChpF6E221KqK5qIgF6n';
const accessKeyId = 'AKIAXLWQAQ6ZLOKLVYH4';

const region = 'us-east-2';

const bucket = 'funny-forum-uploads';

const s3Client = new S3Client({
    region,

    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

//--

//-- Functions

async function multiPartUpload(key: string, buffer: File) {
    const mutlipartUploadCommand = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
    });

    const multipartUploadResult = await s3Client.send(mutlipartUploadCommand);

    const uploadId = multipartUploadResult.UploadId;
    const uploads = [];

    const chunkSize = Math.ceil(buffer.size / 5);

    try {
        for (let i = 0; i < 5; i++) {
            const uploadStart = i * chunkSize;
            const uploadEnd = uploadStart + chunkSize;

            const uploadPartCommand = new UploadPartCommand({
                Bucket: bucket,
                Key: key,
                UploadId: uploadId,
                Body: buffer.slice(uploadStart, uploadEnd),
                PartNumber: i + 1,
            });

            uploads.push(
                s3Client.send(uploadPartCommand).then((data) => {
                    return data;
                }),
            );
        }

        const uploadResults = await Promise.all(uploads);

        const completeMultipartUploadCommand =
            new CompleteMultipartUploadCommand({
                Bucket: bucket,
                Key: key,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: uploadResults.map(({ ETag }, i) => ({
                        ETag,
                        PartNumber: i + 1,
                    })),
                },
            });

        const result = await s3Client.send(completeMultipartUploadCommand);

        return result;
    } catch (error) {
        if (uploadId) {
            const abortMultipartUploadCommand = new AbortMultipartUploadCommand(
                {
                    Bucket: bucket,
                    Key: key,
                    UploadId: uploadId,
                },
            );

            await s3Client.send(abortMultipartUploadCommand);
        }
    }
}

//--

export default defineNuxtPlugin(() => {
    return {
        provide: {
            uploadObject: async (key: string, id: string, Body: File) => {
                const fileKey = `raw_uploads/${id}/${key}`;

                console.log(fileKey);

                const MB = 1024 * 1024;
                const twentyMB = 20 * MB;
                const maxMB = 25 * MB;

                let result;

                if (Body.size > maxMB) return;

                if (Body.size > twentyMB) {
                    result = await multiPartUpload(fileKey, Body);
                } else {
                    const putObjectCommand = new PutObjectCommand({
                        Bucket: bucket,
                        Body,
                        Key: fileKey,
                    });

                    result = await s3Client.send(putObjectCommand);
                }

                if (!result) return;

                return result;
            },
        },
    };
});
