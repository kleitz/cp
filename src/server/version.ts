import * as express from 'express';

export var app = express();

const STAMP = require('../../stamp.json');

app.use((req, res) => {
    res.json({
        date: STAMP.date,
        head: STAMP.head,
        branch: STAMP.branch,
    });
});
