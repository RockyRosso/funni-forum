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
                    default: 'Email Code on Login',

                    readOnly: true,
                },

                slug: {
                    type: 'string',
                    default: 'email_code_on_login',

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

const data = [{}];

const validate = ajv.compile(schema);
validate(data);

export default { data, validator: validate };
