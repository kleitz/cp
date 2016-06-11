import { UUID } from 'cp/lang';
import { clone } from 'lodash';
import { Collection, InsertOneWriteOpResult,
    DeleteWriteOpResultObject } from 'mongodb';

import Message, { CATEGORY, SUBCATEGORY } from './message';

export function save(coll: Collection, message: Message): Promise<InsertOneWriteOpResult> {
    return coll.insertOne(message);
}

export function purge(coll: Collection, id: UUID): Promise<DeleteWriteOpResultObject> {
    return coll.deleteOne({id});
}

export function find(
    coll: Collection,
    to: UUID,
    category: CATEGORY,
    subcategories: SUBCATEGORY[] = [],
    query: any = {}
): Promise<Message[]> {
    query = clone(query);
    query.to = to;
    query.category = category;
    query.subcategory = { $in: subcategories };

    return coll.find(query).toArray();
}