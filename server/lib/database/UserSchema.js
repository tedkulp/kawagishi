const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const shortid = require('shortid');
const { pick } = require('lodash');
const { randomBytes } = require('crypto');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
    token: String,
    stream_key: String,
    channel_title: String,
});

UserSchema.methods.generateHash = password => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.generateToken = () => {
    return randomBytes(16).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateStreamKey = () => {
    return shortid.generate();
};

UserSchema.methods.toPassportReturn = function() {
    return pick(this, ['id', 'username', 'email']);
};

UserSchema.methods.toMeReturn = function() {
    return pick(this, ['id', 'username', 'email', 'stream_key']);
};

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id;
    },
});

module.exports = UserSchema;
