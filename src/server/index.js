const Express = require('express');
const FS = require('fs');
const Path = require('path');
const Explorer = require('./explorer');
const Downloader = require('./downloader');
const Uploader = require('./uploader');
const Peripheral = require('./peripheral');
const Consts = require('./constants');

const PORT = Consts.SETTINGS["main-server-port"];

let app = Express();

app.use("/explorer", Explorer.download);
app.use("/download", Downloader.router);
app.use("/upload", Uploader.router);
app.use("/peripheral", Peripheral.router);
app.use("/p-download", Peripheral.download);
app.use(Express.static("public"));
app.use(Express.static("dist"));

app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`);
})
