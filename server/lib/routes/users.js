const express = require('express');
const _ = require('lodash');
const { check, validationResult } = require('express-validator');
const { jwtAuthenticate } = require('../auth/passport');

const { Invite, User } = require('../database');
const router = express.Router();

router.get('/me', jwtAuthenticate(), async (req, res, _next) => {
    User.findOne({ _id: req.user.id }).then(foundUser => {
        res.json(foundUser.toMeReturn());
    });
});

router.put('/me/reset_streaming_key', jwtAuthenticate(), async (req, res, _next) => {
    User.findOne({ _id: req.user.id }).then(user => {
        user.stream_key = user.generateStreamKey();
        return user
            .save()
            .then(() => {
                return res.json(user.toMeReturn());
            })
            .catch(err => {
                return res.status(400).json({ errors: err.array() });
            });
    });
});

const inviteChecks = [
    check('email')
        .not()
        .isEmpty()
        .withMessage('Email cannot be blank')
        .isEmail()
        .withMessage('Email is not valid'),
];

router.post('/invite_user', jwtAuthenticate(), inviteChecks, async (req, res, _next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const invite = new Invite();
    invite.email = req.body.email;
    invite.inviting_user_id = req.user.id;
    invite.token = invite.generateToken();
    invite.save(err => {
        if (err) {
            res.status(400).json({ error: err });
        }

        // TODO: Send email here

        res.status(201).json(invite);
    });
});

exports.router = router;
