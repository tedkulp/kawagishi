const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { logger } = require('../util/logger');

const { User } = require('../database');

const handleResponse = (res, code, statusMsg) => {
    res.status(code).json(statusMsg);
};

const signupChecks = [
    check('username')
        .not()
        .isEmpty()
        .withMessage('Username cannot be blank')
        .isLength(3)
        .withMessage('Username must be at least 3 characters long'),
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
    check('confirmPassword')
        .not()
        .isEmpty()
        .withMessage('Password Confirmation cannot be blank')
        .custom((value, { req, loc, path }) => {
            if (value !== req.body.password) {
                // trow error if passwords do not match
                throw new Error('Passwords must match');
            } else {
                return value;
            }
        }),
];

router.post('/', signupChecks, (req, res, next) => {
    const errors = validationResult(req);

    logger.debug(['errors', errors]);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = new User();
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = user.generateHash(req.body.password);
    user.token = user.generateToken();
    user.stream_key = user.generateStreamKey();
    user.save(err => {
        if (err) {
            return handleResponse(res, 400, { error: err });
        }

        return passport.authenticate('local', (err, user, _info) => {
            if (err) {
                return handleResponse(res, 400, { error: err });
            }
            if (user) {
                return handleResponse(res, 200, user);
            }
        })(req, res, next);
    });
});

exports.router = router;
