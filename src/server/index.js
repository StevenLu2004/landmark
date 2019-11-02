const FS = require('fs');
const Express = require('express');
const Path = require('path');
const Explorer = require('./explorer');
const Consts = require('./constants');

const PORT = 3000;
let pkgInfo;

(() => {
    var pkg = FS.readFileSync(Path.join(Consts.ROOT, "package.json"), {encoding: 'utf8'});
    pkgInfo = JSON.parse(pkg);
    console.log(`LANdmark ${pkgInfo.version}`);
})();

let app = Express();

app.use("/explorer", Explorer.router);
app.use(Express.static("public"));
app.use(Express.static("dist"));

app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`);
})
