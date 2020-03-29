var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Instantiate a Keycloak class
var session = require('express-session');
var Keycloak = require('keycloak-connect');
var memoryStore = new session.MemoryStore();
var keycloak = new Keycloak({ store: memoryStore });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Keycloak session
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// keycloak logout
app.use(keycloak.middleware({logout:'/logout'}));
 
//keycloak dashboard
app.use('/', keycloak.protect(), function(req, res){
  res.render('dashboard', 
    { 
      nameUser: req.kauth.grant.access_token.content.preferred_username, 
      roleUser: req.kauth.grant.access_token.content.realm_access.roles
    });
  // console.log(req.kauth.grant.access_token.content.realm_access.roles);
})

// keycloak public
app.use('/public', function (req, res) {
  res.json({message: req.kauth.grant.access_token.content.preferred_username});
});

// keycloak secured
app.use('/secured', keycloak.protect('realm:user'), function (req, res) {
  res.json({message: 'secured'});
});

//app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
