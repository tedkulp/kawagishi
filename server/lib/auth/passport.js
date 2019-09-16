const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: BearerStrategy } = require('passport-http-bearer');
const { omit } = require('lodash');
const User = require('../database').User;

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        function(username, password, done) {
            User.findOne({ email: username }, 'email password token', (err, user) => {
                if (err) {
                    return done(err);
                }

                if (!user || !user.validPassword(password)) {
                    return done('Invalid user or password');
                }

                return done(null, user.toPassportReturn());
            });
        }
    )
);

passport.use(
    new BearerStrategy(function(token, done) {
        User.findOne({ token: token }, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user || !user.validPassword(password)) {
                return done('Invalid token');
            }

            return done(null, user.toPassportReturn());
        });
    })
);

module.exports = passport;
