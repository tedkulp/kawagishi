const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../database').User;
const { token } = require('../auth/jwt');

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
            User.findOne({ email: username }, (err, user) => {
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
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: token,
        },
        function(payload, done) {
            User.findById(payload.id, (err, user) => {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done('Invalid token');
                }

                return done(null, user.toPassportReturn());
            });
        }
    )
);

module.exports = {
    passport,
    jwtAuthenticate: () => passport.authenticate('jwt', { session: false }),
};
