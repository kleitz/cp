'use strict';

process.env.NEW_RELIC_NO_CONFIG_FILE = true;
require('newrelic');

var app, config, log, debugging;

const express = require('express');
const index = require('serve-index');
const errors = require('errorhandler');
const favicon = require('serve-favicon');
const body_parser = require('body-parser');
const cookie = require('cookie-parser');
const timeout = require('connect-timeout');
const session = require('express-session');
const swig = require('swig');
const debug = require('debug');

const search_service = require('search-service');
const auth_service = require('auth-service');
const extract_service = require('extract-service');
const notification_service = require('notification-service');
const query_service = require('query-service');

log = debug('cp:server');
app = express();
config = require('acm');
debugging = !!config('debug');

app.set('view cache', true);
app.set('view engine', 'html');
app.set('views', `${__dirname}/app/modules`);
app.engine('html', swig.renderFile);

app.use('/build', express.static('build'));
app.use('/app', express.static('app'));
app.use('/assets', express.static('assets'));
app.use('/node_modules', express.static('node_modules'));
app.use(favicon(`${__dirname}/assets/images/favicon.png`));

if (debugging) {
    app.use('/app', index('app'));
    app.use('/assets', index('assets'));
    app.use(errors());
    app.set('view cache', false);
    swig.setDefaults({ cache: false });
}

app.use(body_parser.json());
app.use(cookie(config('session.secret')));
app.use(session({ secret: config('session.secret') }));

app.use(auth_service.passport.initialize());
app.use(auth_service.passport.session());
app.use(auth_service.as_guest);
app.use('/service/auth', timeout('10s'), auth_service);

app.use('/service/notification', auth_service.is_logged_in);
app.use('/service/notification', timeout('5s'), notification_service);

app.use('/service/search', timeout('5s'), search_service);
app.use('/service/extract', timeout('5s'), extract_service);

app.delete('/service/query/*', auth_service.is_logged_in);
app.patch('/service/query/*', auth_service.is_logged_in);
app.post('/service/query/*', auth_service.is_logged_in);
app.put('/service/query/*', auth_service.is_logged_in);
app.use('/service/query', timeout('60s'), query_service);

app.use((err, req, res, next) => {
    console.error(err);
    res.render('base/index', { debugging, err });
});

app.get('*', (req, res) =>
    res.render('base/index', {
        debugging,
        lang: req.query.lang
    }));

query_service.conn.sync().then(() =>
    log('ready for database requests'));

notification_service.connect(() =>
    log('ready for notification requests'));

app.listen(config('port') || 3000);
log('listening for requests');
