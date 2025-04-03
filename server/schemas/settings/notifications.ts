import Ajv from 'ajv';

const ajv = new Ajv({
    useDefaults: true,
    removeAdditional: true,
});

const schema = {
    additionalProperties: false,

    items: [
        {
            type: 'object',

            additionalProperties: false,
            properties: {
                name: {
                    type: 'string',
                    default: 'Post Likes',

                    readOnly: true,
                },

                slug: {
                    type: 'string',
                    default: 'post_likes',

                    readOnly: true,
                },

                enabled: {
                    type: 'boolean',
                    default: true,
                },
            },
        },
        {
            type: 'object',

            additionalProperties: false,
            properties: {
                name: {
                    type: 'string',
                    default: 'Post Dislikes',

                    readOnly: true,
                },

                slug: {
                    type: 'string',
                    default: 'post_dislikes',

                    readOnly: true,
                },

                enabled: {
                    type: 'boolean',
                    default: false,
                },
            },
        },
    ],
};

const data = [{}, {}];

const validate = ajv.compile(schema);
validate(data);

export default { data, validator: validate };
