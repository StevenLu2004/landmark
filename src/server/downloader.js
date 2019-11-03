const Express = require('express');
const Path = require('path');
const Consts = require('./constants');

const DOWNLOAD_PATH = Path.join(Consts.ROOT, "filebank/download");

let router = Express.Router();
router.use(Express.static("filebank/download"));

module.exports = {
    router: router,
};
