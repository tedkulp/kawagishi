const jwt = require('jsonwebtoken');

const token = process.env.JWT_SECRET || 'lksfkljuwlksjwelkjsdlkjsdlkjweoiseijlxlvkjsldkfjewoirwlkjsdfklj';
const sign = obj => jwt.sign( obj, token );

module.exports = {
    token,
    sign,
};
