import db_connect from '../service/dbms';
import es_connect from '../service/elasticsearch';
import { get, elasticsearch } from '../search/updater';
import { LinkConfiguration, LinkDefinition } from '../river/sync';
import { Duration } from '../lang';
import * as config from 'acm';

const log = require('debug')('worker:river');
const models: LinkDefinition[] = config('river.models').map((def: LinkConfiguration) =>
    new LinkDefinition(def.name, def.fields, def.soft_delete,
        def.primary_key, def.label));

export default function (since: Duration) {
    var db = db_connect(),
        es = es_connect();

    models.map(model => log(model));
    Promise.all(models.map(model => get(db, model, { since })
        .then(rows => elasticsearch(es, model, rows))
        .then(ack => log('done updating %s', model.name))))
            .then(db.close.bind(db));
};
