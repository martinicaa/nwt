const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwTokens = require('jsonwebtoken');

// ES6 promises
mongoose.Promise = global.Promise;

// mongodb connection
mongoose.connect("mongodb://localhost/db", {
    useMongoClient: true,
    promiseLibrary: global.Promise
});

var db = mongoose.connection;

// mongodb error
db.on('error', console.error.bind(console, 'connection error:'));

// mongodb connection open
db.once('open', function(){
    const date = new Date();
    console.log('Connected to Mongo at: %s %s', date.toDateString(), date.toTimeString());
});

const app = express();

const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// models
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// routers
const apiRoutes = require('./routes/api')(User);
app.use('/', apiRoutes);

const usersRouter = require('./routes/users')(User);
app.use('/api/users', usersRouter);

const postsRouter = require('./routes/posts')(Post, Comment, User);
app.use('/api/posts', postsRouter);


app.listen( port , function(){
    console.log('Server starting on port %d', port);
});

module.exports = app;
