// https://www.jokecamp.com/tutorial-passportjs-authentication-in-nodejs/


require('dotenv').config({silent:true});
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var GithubStrategy = require('passport-github').Strategy;


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





// passport

// set up a github strategy - this setsup github for authing logins
passport.use(new GithubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/passport/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));


// set up our session
app.use(session({secret: "somethingAboutCats"}));
// init and connect passport (to session store)
app.use(passport.initialize());
app.use(passport.session());


// a method for saving our passport user to the session cookie
passport.serializeUser(function(user, done) {
  // null is for errors
  done(null, user.id);
});

// a method for deserializing a user
passport.deserializeUser(function(user, done) {
  // null is for errors
  done(null, user);

  // ex Maybe we are getting the user from a database?
  // User.findById(id, function (err, user) {
  //   done(err, user);
  // });

});


// check our request to see if passport has auth'd and in turn, placed
//  a var called isAuthenticated  to track our auth status
// place this method into subsequent calls where auth is required
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next(); }
  // denied. redirect to login
  res.redirect('/')
}


app.get('/', function(req,res){
  var html = "<ul><li><a href='/passport'>GitHub</a></li><li><a href='/logout'>Logout</a></li></ul>"

  // indicate authorization
  if (req.isAuthenticated()) {
    html += "<p>authenticated as user:</p>"
    html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
  }

  res.send(html);
});

app.get('/logout', function(req, res){
  console.log('logging out');
  req.logout();
  res.redirect('/');
});


app.get('/protected', ensureAuthenticated, function(req, res) {
  res.send("access granted. secure stuff happens here");
});


// AUTH WITH PASSPORT
// we will call this to start the GitHub Login process
app.get('/passport', passport.authenticate('github'));

// GitHub will call this URL
app.get('/passport/callback', passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var server = app.listen(3000, function () {
  console.log('Example app listening at http://%s:%s',
    server.address().address, server.address().port);
});

module.exports = app;
