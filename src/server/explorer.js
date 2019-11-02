const Express = require("express");
const Path = require("path");
const FS = require("fs");
// const DirWalk = require("./dirwalk");

const FILEBANK_PATH = Path.join(__dirname, "../../filebank");

let router = Express.Router();

router.get("/*", function(req, res) {
    // req.originalUrl contains the full path
    var fullPath = Path.join(FILEBANK_PATH, req.path);
    console.log(fullPath);
    FS.readdir(fullPath, (err, list) => {
        console.log("readdir results:");
        console.dir((err) ? err : list);
        res.send(JSON.stringify((err) ? err : list));
    });
});

module.exports = {
    router: router
};
