const Express = require('express');
const FS = require('fs');
const Path = require('path');
const Explorer = require('./explorer');
const Downloader = require('./downloader');
const Uploader = require('./uploader');
const Peripheral = require('./peripheral');
const Consts = require('./constants');

const PORT = 3000;
let pkgInfo;

(() => {
    var pkg = FS.readFileSync(Path.join(Consts.ROOT, "package.json"), { encoding: 'utf8' });
    pkgInfo = JSON.parse(pkg);
    console.log(`LANdmark ${pkgInfo.version}`);
})();

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
