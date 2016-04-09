///<reference path="../typings/main.d.ts" />

type CPServiceRequestHandler = (Request, Response, Function) => void;

interface CPSearchServiceResultMetadata {
    timed_out: boolean;
    took: number;
    total: number;
}

interface CPServiceResponseV1<T> {
    body: T | Array<T> | { [index: string]: T };
    meta: CPSearchServiceResultMetadata | any
}

declare module "acm" {
    function fn(str: string): string;
    export = fn;
}

declare module "deep-get-set" {
    function fn(store: Object, get: string, set?: any): any;
    export = fn;
}

declare module "striptags" {
    function fn(html: string): string;
    export = fn;
}

declare module "request" {
    interface Request {
        uri: string,
        qs?: string | {},
    }

    function fn(req: Request, callback: Function);
    export = fn;
}

declare module "urijs" {
    export function withinString(source: string, callback: (uri: string) => any): any[];
}

declare module "md5" {
    function fn(str: string): string;
    export = fn;
}

declare module "query-service" {
    import {Sequelize} from 'sequelize';

    export type QueryResult = any;

    export interface Model {
        findOne(query: { where: any });
    }

    export interface User extends Model {
        avatar_url?: string;
        email?: string;
    }

    export interface Company extends Model {
    }

    export var conn: Sequelize;

    export var models: {
        User: User,
        Company: Company,
    }
}

declare module "elasticsearch" {
    interface Promise {
        then(any): Promise;
        catch(any): Promise;
    }

    interface Query {
        from?: number;
        index: string;
        size?: number;
        type: string;
        body: {
            query: {
                fuzzy_like_this?: {
                    fuzziness: number | string;
                    like_text: string;
                }
            }
        }
    }

    export interface Hit {
        _index: string;
        _type: string;
        _id: string;
        _score: number;
        _source: any;
    }

    export interface Results {
        took: number;
        timed_out: boolean;

        _shards: {
            total: number;
            successful: number;
            failed: number;
        };

        hits: {
            total: number;
            max_score: number;
            hits: Array<Hit>
        };
    }

    export class Client {
        constructor({ host: string });
        search(query: Query): Promise;
    }
}

declare module "node-uuid" {
    interface UUIDOptions {

        /**
         * Node id as Array of 6 bytes (per 4.1.6).
         * Default: Randomly generated ID. See note 1.
         */
        node?: any[];

        /**
         * (Number between 0 - 0x3fff) RFC clock sequence.
         * Default: An internally maintained clockseq is used.
         */
        clockseq?: number;

        /**
         * (Number | Date) Time in milliseconds since unix Epoch.
         * Default: The current time is used.
         */
        msecs?: number|Date;

        /**
         * (Number between 0-9999) additional time, in 100-nanosecond units. Ignored if msecs is unspecified.
         * Default: internal uuid counter is used, as per 4.2.1.2.
         */
        nsecs?: number;
    }

    interface UUID {
        v1(options?: UUIDOptions): string;
        v1(options?: UUIDOptions, buffer?: number[], offset?: number): number[];

        v2(options?: UUIDOptions): string;
        v2(options?: UUIDOptions, buffer?: number[], offset?: number): number[];

        v3(options?: UUIDOptions): string;
        v3(options?: UUIDOptions, buffer?: number[], offset?: number): number[];

        v4(options?: UUIDOptions): string;
        v4(options?: UUIDOptions, buffer?: number[], offset?: number): number[];

        parse(id: string, buffer?: number[], offset?: number): number[];

        unparse(buffer: number[], offset?: number): string;
    }

    export = UUID;
}
