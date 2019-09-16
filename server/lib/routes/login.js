const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const handleResponse = (res, code, statusMsg) => {
    res.status(code).json(statusMsg);
};

exports.postLoginChecks = [
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

router.post('/', (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    return passport.authenticate('local', (err, user, _info) => {
        if (err) {
            return handleResponse(res, 400, { error: err });
        }
        if (user) {
            handleResponse(res, 200, user);
        }
    })(req, res, next);
});

module.exports = router;
