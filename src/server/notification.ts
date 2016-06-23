import * as express from 'express';
import * as record from './record';
import * as Schema from 'cp/record';

import { DeleteWriteOpResultObject } from 'mongodb';
import { service_handler, runtime_purge_allowed } from '../utilities';
import { ServiceUnavailableError, UnauthorizedError, BadRequestError,
    InternalServerError, ERR_MSG_MISSING_FIELDS } from '../errors';

import Message, { CATEGORY, NOTIFICATION, OTYPE } from '../notification/message';
import { save, find, purge, update, purge_signature } from '../notification/collection';
import connect from '../service/mongo';
import config = require('acm');

const Event = record.models.Event;
export var app = express();

connect(config('mongo.collections.notifications'), (err, coll) => {
    app.use((req, res, next) => {
        if (!req.user || !req.user.id) {
            next(new UnauthorizedError());
        } else {
            next();
        }
    });

    app.use((req, res, next) => {
        if (err) {
            next(new ServiceUnavailableError());
        } else {
            next();
        }
    });

    app.get('/', service_handler(req =>
        find(coll, req.user.id, CATEGORY.NOTIFICATION, [
            NOTIFICATION.CONTRIBUTED,
            NOTIFICATION.FAVORITED,
            NOTIFICATION.FOLLOWED,
            NOTIFICATION.MODIFIED,
        ])));

    app.delete('/:id', service_handler((req, res, next) => {
        if (runtime_purge_allowed(req)) {
            return purge(coll, req.params.id);
        } else {
            next(new UnauthorizedError());
        }
    }));

    app.put('/completed', service_handler(req =>
        update(coll, req.body.ids, { $set: { completed: true } })));

    app.put('/viewed', service_handler(req =>
        update(coll, req.body.ids, { $set: { viewed: true } })));

    app.post('/follow', service_handler((req, res, next) => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.FOLLOWED, req.body.id, {
            id: req.user.id,
            otype: OTYPE.USER,
            name: req.user.name,
        });

        if (!req.body.id) {
            next(new BadRequestError(ERR_MSG_MISSING_FIELDS(['id'])));
            return;
        }

        return save(coll, msg).then(ack => msg);
    }));

    app.delete('/follow/:id', service_handler(req => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.FOLLOWED, req.params.id, {
            id: req.user.id,
            otype: OTYPE.USER,
        });

        return purge_signature(coll, msg.signature);
    }));

    app.post('/favorite', service_handler((req, res, next) => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.FAVORITED, null, {
            id: req.user.id,
            otype: OTYPE.USER,
            name: req.user.name,
            obj_id: req.body.id,
            obj_otype: OTYPE.EVENT,
            obj_name: req.body.id,
        });

        if (!req.body.id) {
            next(new BadRequestError(ERR_MSG_MISSING_FIELDS(['id'])));
            return;
        }

        // XXX check this isn't our own event
        return new Promise<Message>((resolve, reject) =>
            Event.findById(req.body.id)
                .then((ev: Schema.Event) => {
                    msg.to = ev.created_by;
                    msg.payload.obj_name = ev.title;
                    msg.sign();

                    save(coll, msg)
                        .then(ack => resolve(msg))
                        .catch(err => reject(new InternalServerError(err.message)));
                })
                .catch(err => reject(new InternalServerError(err.message))));
    }));

    app.delete('/favorite/:id', service_handler(req => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.FAVORITED, null, {
            id: req.user.id,
            otype: OTYPE.USER,
            obj_id: req.params.id,
            obj_otype: OTYPE.EVENT,
        });

        return new Promise<DeleteWriteOpResultObject>((resolve, reject) =>
            Event.findById(req.params.id)
                .then((ev: Schema.Event) => {
                    msg.to = ev.created_by;
                    msg.sign();

                    purge_signature(coll, msg.signature)
                        .then(resolve)
                        .catch(err => reject(new InternalServerError(err.message)));
                })
                .catch(err => reject(new InternalServerError(err.message))));
    }));

    app.post('/contribute', service_handler((req, res, next) => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.CONTRIBUTED, null, {
            id: req.user.id,
            otype: OTYPE.USER,
            name: req.user.name,
            obj_id: req.body.id,
            obj_otype: OTYPE.EVENT,
            obj_name: req.body.id,
        });

        if (!req.body.id) {
            next(new BadRequestError(ERR_MSG_MISSING_FIELDS(['id'])));
            return;
        }

        // XXX check this isn't our own event
        return new Promise<Message>((resolve, reject) =>
            Event.findById(req.body.id)
                .then((ev: Schema.Event) => {
                    msg.to = ev.created_by;
                    msg.payload.obj_name = ev.title;
                    msg.sign();

                    save(coll, msg)
                        .then(ack => resolve(msg))
                        .catch(err => reject(new InternalServerError(err.message)));
                })
                .catch(err => reject(new InternalServerError(err.message))));
    }));

    app.delete('/contribute/:id', service_handler(req => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.CONTRIBUTED, null, {
            id: req.user.id,
            otype: OTYPE.USER,
            obj_id: req.params.id,
            obj_otype: OTYPE.EVENT,
        });

        return new Promise<DeleteWriteOpResultObject>((resolve, reject) =>
            Event.findById(req.params.id)
                .then((ev: Schema.Event) => {
                    msg.to = ev.created_by;
                    msg.sign();

                    purge_signature(coll, msg.signature)
                        .then(resolve)
                        .catch(err => reject(new InternalServerError(err.message)));
                })
                .catch(err => reject(new InternalServerError(err.message))));
    }));

    app.post('/modify', service_handler((req, res, next) => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.MODIFIED, null, {
            id: req.user.id,
            otype: OTYPE.USER,
            name: req.user.name,
            obj_id: req.body.id,
            obj_otype: OTYPE.EVENT,
            obj_name: req.body.id,
        });

        if (!req.body.id) {
            next(new BadRequestError(ERR_MSG_MISSING_FIELDS(['id'])));
            return;
        }

        // XXX check this isn't our own event
        return new Promise<Message>((resolve, reject) =>
            Event.findById(req.body.id)
                .then((ev: Schema.Event) => {
                    msg.to = ev.created_by;
                    msg.payload.obj_name = ev.title;
                    msg.sign();

                    save(coll, msg)
                        .then(ack => resolve(msg))
                        .catch(err => reject(new InternalServerError(err.message)));
                })
                .catch(err => reject(new InternalServerError(err.message))));
    }));

    app.delete('/modify/:id', service_handler(req => {
        let msg = new Message(CATEGORY.NOTIFICATION, NOTIFICATION.MODIFIED, null, {
            id: req.user.id,
            otype: OTYPE.USER,
            obj_id: req.params.id,
            obj_otype: OTYPE.EVENT,
        });

        return new Promise<DeleteWriteOpResultObject>((resolve, reject) =>
            Event.findById(req.params.id)
                .then((ev: Schema.Event) => {
                    msg.to = ev.created_by;
                    msg.sign();

                    purge_signature(coll, msg.signature)
                        .then(resolve)
                        .catch(err => reject(new InternalServerError(err.message)));
                })
                .catch(err => reject(new InternalServerError(err.message))));
    }));
});
