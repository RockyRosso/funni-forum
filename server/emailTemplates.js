//-- Variables

const {
    UpdateEmailTemplateCommand,
    SESv2Client,
    GetEmailTemplateCommand,
    CreateEmailTemplateCommand,
} = require('@aws-sdk/client-sesv2');

const dotenv = require('dotenv');
dotenv.config();

const accessKeyId = process.env.SES_ACCESS_KEY || '';
const secretAccessKey = process.env.SES_SECRET_KEY || '';

const sesClient = new SESv2Client({
    region: 'us-east-1',

    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

const templates = [
    {
        TemplateName: 'Verification',

        TemplateContent: {
            Subject: 'Account Verification - Funni Forum',
            Html: '<h1>Click the link below to verify your account</h1><a href="{{verifylink}}">{{verifylink}}</a>',
            Text: 'Click the link below to verify your account\r\n\n{{verifylink}}',
        },
    },

    {
        TemplateName: 'Notification-PostAction',

        TemplateContent: {
            Subject: '{{post_action}} - Funni Forum',
            Html: `<!DOCTYPE html><html lang="en">    <head>        <meta charset="UTF-8">        <meta name="viewport" content="width=device-width, initial-scale=1.0">        <title>Post Dislike Template</title>        <style type="text/css">            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap&family=Grandstander:wght@500&display=swap');            :root {                --bg: #242424;            }            textarea,            li,            label,            span,            a,            p,            button,            h1,            h2,            h3,            h4 {                color: #fff;                font-family: 'Montserrat', sans-serif;                table-layout: fixed;            }            .default {                color: #000;            }            .container {                background-color: var(--bg);                width: 100%;                max-width: 660px;                padding: 20px;                margin: 0 auto;            }            .outer-container {                width: 100%;                max-width: 660px;            }        </style>    </head>    <body>        <center class="wrapper">            <div class="outer-container" style="margin-bottom: 10px;">                <img width="100%" src="https://static.funniforum.xyz/branding/brand_title_logo.png" />            </div>            <table class="container" width="100%">                <tr>                    <td style="display: flex; align-items: center; gap: 20px">                        <img width="50px" src="https://static.funniforum.xyz/branding/logo.png" />                        <p>{{user_name}}</p>                    </td>                </tr>                <tr>                    <td style="text-align: center;">                        <h1>{{post_action}}</h1>                    </td>                </tr>                <tr>                    <td style="text-align: center;">                        <h1><a href="https://funniforum.xyz/posts/{{post_id}}">{{post_title}}</a></h1>                    </td>                </tr>            </table>            <div class="outer-container" style="margin-top: 10px;">                <p class="default">If you would like to stop recieving these emails, change your <a class="default" href="https://funniforum.xyz/personal/settings">email preferences</a></p>            </div>        </center>    </body></html>`,
            Text: '{{post_action}}\n\n{{post_title}}\nhttps://funniforum.xyz/posts/{{post_id}}',
        },
    },

    {
        TemplateName: 'Notification-PostNew',

        TemplateContent: {
            Subject: 'New Post in {{category_name}} Category - Funni Forum',
            Html: `<!DOCTYPE html><html lang="en">    <head>        <meta charset="UTF-8">        <meta name="viewport" content="width=device-width, initial-scale=1.0">        <title>New Post</title>        <style type="text/css">            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap&family=Grandstander:wght@500&display=swap');            textarea,            li,            label,            span,            a,            p,            button,            h1,            h2,            h3,            h4 {                color: #fff;                font-family: 'Montserrat', sans-serif;                table-layout: fixed;            }            .default {                color: #000;            }            .container {                background-color: #242424;                width: 100%;                max-width: 660px;                padding: 20px;                margin: 0 auto;            }            .outer-container {                width: 100%;                max-width: 660px;            }        </style>    </head>    <body>        <center class="wrapper">            <div class="outer-container" style="margin-bottom: 10px;">                <img width="100%" src="https://static.funniforum.xyz/branding/brand_title_logo.png" />            </div>            <table class="container" width="100%">                <tr>                    <td style="display: flex; align-items: center; gap: 20px">                        <img width="50px" src="https://static.funniforum.xyz/branding/logo.png" />                        <p>{{user_name}}</p>                    </td>                </tr>                <tr>                    <td style="text-align: center;">                        <h1>New post from the {{category_name}} category</h1>                    </td>                </tr>                <tr>                    <td style="text-align: center;">                        <h1><a href="https://funniforum.xyz/posts/{{post_id}}">{{post_title}}</a></h1>                    </td>                </tr>            </table>            <div class="outer-container" style="margin-top: 10px;">                <p class="default">If you would like to stop recieving these emails, change your <a class="default" href="https://funniforum.xyz/personal/settings">email preferences</a></p>            </div>        </center>    </body></html>`,
            Text: 'New Post in {{category_name}} Category\n\n{{post_title}}\nhttps://funniforum.xyz/posts/{{post_id}}'
        }
    }
];

//--

const templatePushes = [];

for (let i = 0; i < templates.length; i++) {
    const getEmailTemplateCommand = new GetEmailTemplateCommand({
        TemplateName: templates[i].TemplateName
    });

    sesClient.send(getEmailTemplateCommand).then((value) => {
        pushTemplate(value, i);
    })
    .catch(() => {
        pushTemplate(undefined, i);
    })
}

function pushTemplate(template, i) {
    if (!template) {
        const createEmailTemplateCommand = new CreateEmailTemplateCommand(
            templates[i]
        );

        templatePushes.push(sesClient.send(createEmailTemplateCommand));
    } else {
        const updateEmailTemplateCommand = new UpdateEmailTemplateCommand(
            templates[i],
        );
    
        templatePushes.push(sesClient.send(updateEmailTemplateCommand));
    }
}

Promise.all(templatePushes)
    .catch((e) => {
        console.error(e);
    })
    .then(() => {
        console.log('Templates pushed!');
    });