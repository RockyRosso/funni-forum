//-- Variables

import {
    SendEmailCommand,
    SendEmailCommandInput,
    SESv2Client,
} from '@aws-sdk/client-sesv2';

import * as dotenv from 'dotenv';
import prisma from '~/server/db/prisma';
dotenv.config();

const accessKeyId = process.env.SES_ACCESS_KEY || '';
const secretAccessKey = process.env.SES_SECRET_KEY || '';

const verificationUrl = process.env.VERIFICATION_URL;

const sesClient = new SESv2Client({
    region: 'us-east-1',

    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

//--

//-- Classes

export default class MailManager {
    receiver: string;
    private senderEmail: string;

    constructor(receiver: string) {
        this.receiver = receiver;
        this.senderEmail = '@mail.funniforum.xyz';
    }

    async sendNewPostNotification(post: { title: string, id: string }, categoryId: number) {
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId
            },

            include: {
                watchers: {
                    select: {
                        owner: {
                            select: {
                                username: true
                            }
                        }
                    }
                }
            }
        });

        if (!category) return;

        const watchers = category.watchers;

        if (watchers.length > 0) {
            for (let i = 0; i < watchers.length; i++) {
                await this.sendMessage(
                    'notification', 
                    'Notification-PostNew',
                    {
                        post_title: post.title,
                        post_id: post.id,
                        category_name: category.name.split('_').join(' '),
                        user_name: watchers[i].owner?.username
                    }
                )
            }
        }
    }

    async sendPostNotification(
        post: { title: string; action: string; id: string },
        user: string,
    ) {
        await this.sendMessage(
            'notification',
            'Notification-PostAction',
            {
                post_action: post.action,
                post_title: post.title,
                post_id: post.id,
                user_name: user,
            }
        );
    }

    async sendVerificationEmail(verificationCode: string) {
        const url = verificationUrl + `?code=${verificationCode}`;

        return await this.sendMessage(
            'verification',
            'Verification',
            { verifylink: url }
        );
    }

    async sendMessage(
        name: string,
        templateName: 'Notification-PostAction' | 'Notification-PostNew' | 'Verification',
        templateData: any
    ) {
        const commandInput: SendEmailCommandInput = {
            FromEmailAddress: name + this.senderEmail,

            Destination: {
                ToAddresses: [this.receiver]
            },

            Content: {
                Template: {
                    TemplateName: templateName,
                    TemplateData: JSON.stringify(templateData),
                },
            },

            
        };

        const sendEmailCommand = new SendEmailCommand(commandInput);

        const result = await sesClient.send(sendEmailCommand);
        return result;
    }
}

//--
