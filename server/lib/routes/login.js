const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const handleResponse = (res, code, statusMsg) => {
    res.status(code).json(statusMsg);
};

const loginChecks = [
    check('email')
        .not()
        .isEmpty()
        .withMessage('Email cannot be blank')
        .isEmail()
        .withMessage('Email is not valid'),
    check('password')
        .not()
        .isEmpty()
        .withMessage('Password cannot be blank')
        .isLength(4)
        .withMessage('Password must be at least 4 characters long'),
];

router.post('/', loginChecks, (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    return passport.authenticate('local', { session: false }, (err, user, _info) => {
        if (err || !user) {
            return handleResponse(res, 400, { error: err });
        }

        const token = jwt.sign(
            user,
            process.env.JWT_SECRET ||
                'lksfkljuwlksjwelkjsdlkjsdlkjweoiseijlxlvkjsldkfjewoirwlkjsdfklj'
        );
        handleResponse(res, 200, { user, token });
    })(req, res, next);
});

exports.router = router;
