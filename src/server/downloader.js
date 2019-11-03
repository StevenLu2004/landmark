const Express = require('express');
const Path = require('path');
const Consts = require('./constants');

const FILEBANK_PATH = Path.join(Consts.ROOT, "filebank");

let router = Express.Router();
router.use(Express.static("filebank"));

module.exports = {
    router: router,
};
