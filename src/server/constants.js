const Path = require('path');
const FS = require('fs');

const ROOT = Path.join(__dirname, '../..');

let pkgInfo;

(() => {
    var pkg = FS.readFileSync(Path.join(ROOT, "package.json"), { encoding: 'utf8' });
    pkgInfo = JSON.parse(pkg);
    console.log(`LANdmark ${pkgInfo.version}`);
})();

const SETTINGS = JSON.parse(FS.readFileSync(Path.join(ROOT, 'landmark_settings.json'), { encoding: 'utf8' }));

module.exports = {
    ROOT: ROOT,
    SETTINGS: SETTINGS,
    PKGINFO: pkgInfo,
};
