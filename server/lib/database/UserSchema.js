const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const shortid = require('shortid');
const { pick } = require('lodash');
const { randomBytes } = require('crypto');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: String,
    password: String,
    token: String,
    stream_key: String,
});

const getMethods = obj => {
    let properties = new Set();
    let currentObj = obj;
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
    } while ((currentObj = Object.getPrototypeOf(currentObj)));
    return [...properties.keys()].filter(item => typeof obj[item] === 'function');
};

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
    return pick(this, ['email', 'token']);
};

module.exports = UserSchema;
