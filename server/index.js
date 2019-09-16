const express = require('express');
const app = express();
const port = 3000;

// Add on the top next to imports
const passport = require('./lib/auth/passport');

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/login', require('./lib/routes/login'));
app.use('/api/v1/signup', require('./lib/routes/signup'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
