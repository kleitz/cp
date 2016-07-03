import { ServiceResponseV1 } from 'cp';
import { Query, Result } from 'cp/search';
import { Client as Elasticsearch, Results, Hit } from 'elasticsearch';
import { map } from 'lodash';
import config = require('acm');

export const IDX_RECORD = 'record';

function hit_to_result(hit: Hit): Result {
    return {
        id: hit._id,
        index: hit._index,
        score: hit._score,
        type: hit._type,
        source: hit._source,
    };
}

export function normalize(res: Results): ServiceResponseV1<Result[]> {
    return {
        meta: {
            ok: true,
            took: res.took,
        },
        body: map<Hit, Result>(res.hits.hits, hit_to_result)
    };
}

export function fuzzy(es: Elasticsearch, query: Query): Promise<Results> {
    return es.search({
        from: query.from,
        index: query.index,
        size: query.size,
        type: query.type.join(','),
        body: {
            query: {
                fuzzy_like_this: {
                    fuzziness: config('elasticsearch.fuzziness'),
                    like_text: query.query,
                }
            }
        }
    });
}
