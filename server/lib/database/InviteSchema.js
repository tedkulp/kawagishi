const mongoose = require('mongoose');
const { randomBytes } = require('crypto');
const Schema = mongoose.Schema;

const InviteSchema = new Schema({
    email: String,
    token: String,
    inviting_user_id: Schema.Types.ObjectId,
});

InviteSchema.methods.generateToken = () => {
    return randomBytes(16).toString('hex');
};

InviteSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id;
    },
});

module.exports = InviteSchema;
