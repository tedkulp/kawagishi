const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo/streaming', { useNewUrlParser: true, useUnifiedTopology: true });

exports.User = mongoose.model('User', require('./UserSchema'));
