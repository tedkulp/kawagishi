const express = require('express');
const _ = require('lodash');
const { jwtAuthenticate } = require('../auth/passport');

const { User } = require('../database');
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

exports.router = router;
