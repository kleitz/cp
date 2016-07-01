'use strict';

const tapes = require('tapes');
const http = require('../utils/http');
const auth = require('../utils/auth');

const map = require('lodash').map;
const find = require('lodash').find;
const head = require('lodash').head;
const clone = require('lodash').clone;

const config = require('acm');
const fixture = clone(config('fixtures'));

tapes('notifications', t => {
    var ids_to_look_for = [],
        ids_to_delete = [],
        event = head(fixture.events);

    t.plan(1);

    auth.login(fixture.user.admin.auth_apikey).end((err, res) => {
        t.error(err);
        event.created_by = res.body.id;
        event.updated_by = res.body.id;
    });

    t.test('setup', st => {
        st.plan(3);

        http.purge(`/service/record/events/${event.id}`).end((err, res) => {
            st.ok(res.body.meta.ok, 'can delete an event');

            http.post('/service/record/events', event).end((err, res) => {
                st.error(err);
                st.ok(res.body.meta.ok, 'can create an event');
            });
        });
    });

    t.test('create', st => {
        st.plan(4);

        http.post('/service/notification/follow', {
            id: fixture.user.admin.id,
        }).end((err, res) => {
            st.error(err);
            ids_to_look_for.push(res.body.body.id);
        });

        http.post('/service/notification/favorite', {
            id: event.id,
            p_id: event.id,
            p_otype: 'tag',
        }).end((err, res) => {
            st.error(err);
            ids_to_look_for.push(res.body.body.id);
        });

        http.post('/service/notification/contribute', {
            id: event.id,
        }).end((err, res) => {
            st.error(err);
            ids_to_look_for.push(res.body.body.id);
        });

        http.post('/service/notification/modify', {
            id: event.id,
        }).end((err, res) => {
            st.error(err);
            ids_to_look_for.push(res.body.body.id);
        });
    });

    t.test('retrieve', st => {
        st.plan(ids_to_look_for.length + 1);

        http.get('/service/notification').end((err, res) => {
            ids_to_delete = map(res.body.body, 'id');
            st.error(err);

            ids_to_look_for.forEach(id =>
                st.ok(find(res.body.body, {id})));
        });
    });

    t.test('purge', st => {
        st.plan(ids_to_delete.length + 1);

        ids_to_delete.forEach(id => {
            http.purge(`/service/notification/${id}`).end((err, res) => {
                st.error(err);
            });
        });

        http.del(`/service/record/events/${fixture.events[0].id}`).end((err, res) =>
            st.ok(res.body.meta.ok, 'can delete an event'));
    });
});
