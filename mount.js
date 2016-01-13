'use strict';

var COLL;

const MISSING_INFO_FIELDS = ['user_id', 'obj_id', 'obj_type', 'obj_fields'];
const MISSING_INFO_FIELDS_ERR = new Error(`Missing data. Required: ${MISSING_INFO_FIELDS.join(', ')}`);

const express = require('express');
const mongodb = require('mongodb').MongoClient;

const debug = require('debug');
const config = require('acm');
const body = require('body-parser');
const pick = require('lodash/object/pick');

const app = express();

// XXX bit of a hack, but this is the only way that I can reference the local
// copy of `config/rbac.yml`
config.ref.$paths.push(require('path').join(__dirname, 'config'));

const NotificationsApi = require('./src/notification');
const notifications_collection = config('mongo.collections.notifications');

const Notifications = {
    TYPE: NotificationsApi.TYPE,
    push: pass_coll(NotificationsApi.push),
    find: pass_coll(NotificationsApi.find),
};

var log = debug('service:notification');

app.use(body.json());
app.use(is_logged_in);

app.get('/notifications', (req, res, next) =>
    find_for(null, req, res, next));

app.get('/notifications/missing', (req, res, next) =>
    find_for(Notifications.TYPE.MISSING_INFORMATION, req, res, next));

app.post('/notifications/missing', (req, res, next) =>
    !validate_missing_info_message(req.body) ? next(MISSING_INFO_FIELDS_ERR) :
        Notifications.push(Notifications.TYPE.MISSING_INFORMATION,
            pick(req.body, MISSING_INFO_FIELDS),
            (err, items) => find_for(Notifications.TYPE.MISSING_INFORMATION, req, res, next)));

/**
 * @param {Object} data
 * @return {Boolean}
 */
function validate_missing_info_message(data) {
    return data.user_id && data.obj_id && data.obj_type && data.obj_fields;
}

/**
 * @param {Notifications.TYPE} type
 * @param {http.Request} req
 * @param {http.Response} res
 * @param {Function} next
 * @return {void}
 */
function find_for(type, req, res, next) {
    Notifications.find(type, { 'payload.user_id': req.user.id },
        (err, items) => err ? next(err) : res.json(items));
}

/**
 * @param {Function} [cb]
 * @return {void}
 */
function connect(cb) {
    cb = cb || function () {};
    log('connecting to mongodb');
    mongodb.connect(config('mongo.url'), (err, db) => {
        log('connected to mongodb');
        log('pushing notifications to %s collection', notifications_collection);
        COLL = db.collection(notifications_collection);
        cb(err, db);
    });
}

/**
 * @return {void}
 * @throws {Error}
 */
function coll_check() {
    if (!COLL) {
        log('mongodb connection not yet initialized');
        throw new Error('mongodb connection not yet initialized');
    }
}

/**
* @param {Function} fn
* @return {Function(*)}
*/
function pass_coll(fn) {
    return function () {
        coll_check();
        fn.apply(null, [COLL].concat(
            [].splice.call(arguments, 0)));
    };
}

/**
 * @param {http.Request} req
 * @param {http.Response} res
 * @param {Function} next
 * @return {void}
 */
function is_logged_in(req, res, next) {
    // XXX
    req.user = {id: 'b2df88fa-dd25-42ba-b456-3c8d164d3343'};
    next(req.user && req.user.id ? null :
        new Error('Authentication required'));
}

module.exports = app;
module.exports.connect = connect;
module.exports.Notifications = Notifications;

if (!module.parent) {
    connect(() => app.listen(config('port') || 3000));
}
