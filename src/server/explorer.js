const Express = require("express");
const Path = require("path");
const FS = require("fs");
const Events = require("events");

const FILEBANK_PATH = Path.join(__dirname, "../../filebank");

class WalkReady extends Events { };

var walk = function (dir, superUpdater, callback) {
    // Create return object
    var ret = { folders: [], files: [] };
    // Call callback immediately, just to return the value
    callback(ret);
    // Define and initialize event listener
    var ready = -1;
    var retUpdater = new WalkReady();
    retUpdater.on("ready", () => {
        if (ready > 0) ready--;
        if (!ready) superUpdater.emit("ready"); // TODO: super-readiness
    });
    retUpdater.on("setReady", (rd) => {
        ready = rd;
        if (!ready) superUpdater.emit("ready");
    });
    // Scan dir
    FS.readdir(dir, function (err, files) {
        if (err) {
            // If there's an error, silence and make ret ready immediately
            retUpdater.emit("setReady", 0);
            return;
        }
        // Set ret.ready to the number of files. If no files, immediately ready
        retUpdater.emit("setReady", files.length);
        // Go over every file
        files.forEach((file) => {
            var filep = Path.resolve(dir, file);
            FS.stat(filep, function (err, stat) {
                if (stat) {
                    if (stat.isDirectory()) {
                        var tmp = { name: file };
                        ret.folders.push(tmp);
                        // Define callback function
                        var save = (res) => {
                            if (err) return;
                            tmp.contents = res;
                        };
                        // Recurse deeper. Folders are not immediately ready, but walk will call retUpdater.emit
                        walk(Path.join(dir, file), retUpdater, save);
                    } else {
                        var tmp = { name: file };
                        ret.files.push(tmp);
                        // Single file is ready
                        retUpdater.emit("ready");
                    }
                }
            });
        });
    });
};

// Test walk
(() => {
    var ret = { res: undefined };
    var callback = (res) => {
        ret.res = res;
    };
    var retUpdater = new WalkReady();
    retUpdater.on("ready", () => {
        console.dir(ret.res, {depth: null}); // Indefinite depth for debug
    });
    walk(FILEBANK_PATH, retUpdater, callback);
})();

let router = Express.Router();

router.get("/*", function (req, res) {
    // req.originalUrl contains the full path
    var fullPath = Path.join(FILEBANK_PATH, req.path);
    console.log(fullPath);
    var ret = { res: undefined };
    var callback = (res) => {
        ret.res = res;
    };
    var retUpdater = new WalkReady();
    retUpdater.on("ready", () => {
        console.log(ret.res); // Don't give depth here
        res.send(JSON.stringify(ret.res));
    });
    walk(FILEBANK_PATH, retUpdater, callback);
});

module.exports = {
    router: router
};
