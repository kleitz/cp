"use strict";
var debug = require('debug');
var express = require('express');
var passport = require('passport');
var config = require('acm');
var app = express(), log = debug('service:auth');
config.ref.$paths.push(require('path').join(__dirname, '..', 'config'));
module.exports = app;
module.exports.passport = passport;
module.exports.permissions = require('./permissions');
var model = require('./model');
var linkedin_1 = require('./linkedin');
var apikey_1 = require('./apikey');
var linkedin = linkedin_1["default"]();
var apikey = apikey_1["default"]();
var user = function (req, res) { res.json(req.user || {}); };
module.exports.is_logged_in = model.is_logged_in;
module.exports.as_guest = model.as_guest;
if (!module.parent) {
    app.use(require('body-parser').json());
    app.use(require('cookie-parser')('session.secret'));
    app.use(require('express-session')({ secret: 'session.secret' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(model.as_guest);
    require('query-service').conn.sync().then(function () {
        app.listen(config('port') || 3000);
        log('ready for database requests');
    });
}
passport.serializeUser(model.serialize);
passport.deserializeUser(model.deserialize);
passport.use(linkedin.strategy);
passport.use(apikey.strategy);
app.get('/user', user);
app.get('/logout', function (req, res, next) { req.logout(); next(); }, model.js_update);
app.get('/linkedin', linkedin.pre_base, linkedin.login);
app.get('/linkedin/callback', linkedin.callback, model.js_update);
if (process.env.DEBUG && process.env.CP_ALLOW_APIKEY_AUTH) {
    app.post('/key', apikey.login, user);
}
