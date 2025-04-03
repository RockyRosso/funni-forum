import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
    userId: {
        type: String,
        required: true,
    },

    code: {
        type: String,
    },

    verificationId: {
        type: String,
    },
});

const name = 'email_codes';

export default mongoose.model(name, schema);
