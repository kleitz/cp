import { BadGatewayError, ERR_MSG_EXTERNAL_ERROR } from '../errors';
import * as config from 'acm';

import Trello = require('trello');

const TRELLO_KEY = config('trello.key');
const TRELLO_TOKEN = config('trello.token');
const TRELLO_LIST_ID = config('trello.list_id');
const TRELLO_BOARD_ID = config('trello.board_id');

export const trello = new Trello(TRELLO_KEY, TRELLO_TOKEN);

export namespace card {
    export function add(name: string, desc: string) {
        return trello.addCard(name, desc, TRELLO_LIST_ID)
            .then(errw);
    }

    export function get(id: string) {
        return trello.getCard(TRELLO_BOARD_ID, id)
            .then(errw);
    }

    export function del(id: string) {
        return trello.deleteCard(id)
            .then(errw);
    }
}

function errw(ack) {
    if (typeof ack === 'string') {
        throw new BadGatewayError(ERR_MSG_EXTERNAL_ERROR(ack));
    }

    return ack;
}
