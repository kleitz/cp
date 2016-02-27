///<reference path="../typings/main.d.ts" />

declare module "acm" {
    function fn(str: string): string;
    export = fn;
}

interface CPServiceResponseV1<T> {
    body: T | Array<T> | { [index: string]: T };
    meta?: any;
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
