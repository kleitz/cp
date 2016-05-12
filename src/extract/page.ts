import { Request, Response } from 'express';
import { BadGatewayError } from '../errors';
import { filter, flatten, map, uniq, sortBy as sort } from 'lodash';
import { service_handler, service_response } from '../utilities';

import { EmbedlyRequest, EmbedlyResponse, EmbedlyScoredWord,
    EmbedlyPageResponse } from 'embedly';

import config = require('acm');
import request = require('request');

const EMBEDLY_URL = config('embedly.api.url');
const EMBEDLY_KEY = config('embedly.api.key');

function build_query(url: string): EmbedlyRequest {
    return {
        key: EMBEDLY_KEY,
        maxwidth: 1000,
        maxheight: 1000,
        url: url
    };
}

function parse_response(body: EmbedlyResponse): EmbedlyPageResponse {
    return {
        title: body.title,
        published: body.published,
        type: body.type,
        url: body.url,
        description: body.description,
        keywords: make_keywords(body.keywords, body.entities),
    };
}

function all_lowercase(strs: string[]): string[] {
    return map(strs, str => str.toLowerCase());
}

export function make_keywords(...words_arr: EmbedlyScoredWord[][]): string[] {
    return sort(uniq(all_lowercase(filter(<string[]>map(flatten(words_arr), 'name')))));
}

export function extract(url: string) {
    return new Promise<EmbedlyPageResponse>((resolve, reject) => {
        request({
            uri: EMBEDLY_URL,
            qs: build_query(url)
        }, (err, res, body) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                resolve(parse_response(JSON.parse(body)));
            } catch (ignore) {
                reject(new BadGatewayError('could not parse response from embedly'));
            }
        });
    });
}

export const extract_handler: CPServiceRequestHandler = service_handler(req =>
    extract(req.query.url));