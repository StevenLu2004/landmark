const Path = require('path');
const FS = require('fs');

const ROOT = Path.join(__dirname, '../..');

const SETTINGS = JSON.parse(FS.readFileSync(Path.join(ROOT, 'landmark_settings.json'), { encoding: 'utf8' }));

module.exports = {
    ROOT: ROOT,
    SETTINGS: SETTINGS,
};
