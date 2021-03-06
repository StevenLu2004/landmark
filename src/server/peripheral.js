const Express = require('express');
const Multer = require('multer');
const SocketIO = require('socket.io');
const FS = require('fs');
const Path = require('path');
const Http = require('http');
const Url = require('url');
const Consts = require('./constants');

const PERIPHERAL_PATH = Path.join(Consts.ROOT, "filebank/peripheral");

// Test peripheral path availability
(() => {
    FS.stat(PERIPHERAL_PATH, (err, stat) => {
        if (!stat) FS.mkdirSync(PERIPHERAL_PATH);
    });
})(); // Self-call

// Initialize peripheral path
// Delete all files ;)
(() => {
    var _clear = function () {
        FS.readdir(PERIPHERAL_PATH, (err, files) => {
            if (err) {
                console.log(`Error in _clear: ${err}`);
                return;
            }
            files.forEach((file) => {
                var filep = Path.join(PERIPHERAL_PATH, file);
                FS.stat(filep, (err, stat) => {
                    if (!stat || !stat.isDirectory()) {
                        FS.unlink(filep, (err) => {
                            if (err) console.log(`Error in FS.unlink in _clear: ${err}`);
                        });
                    } else {
                        FS.rmdir(filep, (err) => {
                            if (err) console.log(`Error in FS.rmdir in _clear: ${err}`);
                        });
                    }
                });
            });
        });
    };
    _clear();
})(); // Self-call

// Give timeout dict

timeouts = {};

// Init socket.io

http = Http.createServer();
io = SocketIO(http);
io.on('connection', (socket) => {
    console.log(`connection from ${socket}`);
    socket.emit("refresh");
});
http.listen(3001);

// Create express router
let router = Express.Router();

// Explorer
router.get("/", (req, res) => {
    res.sendFile(Path.join(Consts.ROOT, "dist/peripheral", "index.html"));
});

router.get(/^\/files\/?$/, (req, res) => {
    FS.readdir(PERIPHERAL_PATH, (err, files) => {
        if (err) {
            console.log(`Error reading ${PERIPHERAL_PATH}: ${err}`);
            return;
        }
        var fileObjs = [];
        files.forEach((file) => {
            // Skip file info files and hidden files
            if (file.match(/^\./)) return;
            var fileObj = null;
            try {
                var fileInfo = JSON.parse(FS.readFileSync(Path.join(PERIPHERAL_PATH, `.$${file}.landmark.json`), { encoding: 'utf8' }));
                fileObj = { name: file, info: fileInfo };
            } catch (err) {
                console.log(`Error parsing file info: ${err}`);
            }
            if (fileObj) fileObjs.push(fileObj);
        });
        res.send(JSON.stringify(fileObjs));
    });
})

// Upload
var getDate = () => {
    var date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${((date.getHours() < 10) ? '0' : '') + date.getHours()}${((date.getMinutes() < 10) ? '0' : '') + date.getMinutes()}${((date.getSeconds() < 10) ? '0' : '') + date.getSeconds()}`;
};

let upload = Multer({
    // Peripheral is designed to be a temporary file hub, and only hidden files are filtered
    fileFilter: function (req, file, cb) {
        if (file.originalname.match(/^\./))
            cb(null, false);
        cb(null, true);
    },
    storage: Multer.diskStorage({
        destination: (req, file, cb) => {
            return cb(null, PERIPHERAL_PATH);
        },
        filename: (req, file, cb) => {
            var path = PERIPHERAL_PATH;
            var m = file.originalname.match(/(.*)\.([A-Za-z0-9-_]*)/);
            var name = `${req.ip.replace(/[:<>!@#$%^&*~,|\\]/g, "_")} – ${getDate()} – ${m[1]}`, ext = m[2];
            var nameTransform = (name, i) => {
                FS.stat(Path.join(path, `${name}${(i) ? ` ${i}` : ""}.${ext}`), (err, stat) => {
                    if (!stat) {
                        // File doesn't exist, OK with it
                        return cb(null, `${name}${(i) ? ` ${i}` : ""}.${ext}`);
                    }
                    // Increment name and try again
                    return nameTransform(name, i + 1);
                });
            };
            return nameTransform(name, 0);
        }
    }),
});

let uploadSingleFile = (req, res, next) => {
    // Wrapper
    var ret = upload.single("file")(req, res, next);
    return ret;
};

router.post(/^\/(index.html)?$/, uploadSingleFile, (req, res, next) => {
    // Save file info to serve in peripheral explorer
    var fileData = { uploadTime: Date.now(), constraints: req.body };
    if (!fileData.constraints.expire || fileData.constraints.expire > 600) // In seconds
        fileData.constraints.expire = 600;
    FS.writeFile(Path.join(PERIPHERAL_PATH, `.$${req.file.filename}.landmark.json`), JSON.stringify(fileData), (err) => {
        if (err) console.log(`Error writing file: ${err}`);
    });
    // TODO: add persistence and download constraints
    timeouts[req.file.filename] = setTimeout(() => {
        try {
            FS.unlinkSync(Path.join(PERIPHERAL_PATH, req.file.filename));
            FS.unlinkSync(Path.join(PERIPHERAL_PATH, `.$${req.file.filename}.landmark.json`));
            timeouts[req.file.filename] = undefined;
        } catch (err) {
            console.log(`Error in timeout unlink: ${err}`);
        }
        io.emit("update");
    }, fileData.constraints.expire * 1000);
    // Redirect
    res.redirect("/peripheral");
    // Socket.IO integration
    io.emit("update");
});

// Download
let routerDownload = Express.Router();

routerDownload.get(/.*/, (req, res) => {
    var rpath = decodeURIComponent(req.path.match(/^\/?(.*?)$/)[1]);
    console.log(rpath);
    var path = Path.join(PERIPHERAL_PATH, rpath);
    var infoPath = Path.join(PERIPHERAL_PATH, `.$${rpath}.landmark.json`);
    console.log(path);
    console.log(infoPath);
    FS.stat(path, (err, stat) => {
        if (!stat) {
            // 404
            res.status(404).send("404 File not found. The file might have expired, or its downloads might have been used up.");
            return;
        }
        res.sendFile(path, null, (err) => {
            if (err) {
                console.log(`Error in sendFile: ${err}`);
                return;
            }
            try {
                var fileInfo = JSON.parse(FS.readFileSync(infoPath, { encoding: "utf8" }));
                fileInfo.constraints.downloadCount--;
                FS.writeFileSync(infoPath, JSON.stringify(fileInfo));
                // TODO: clear files after downloads are used out
                if (!fileInfo.constraints.downloadCount) {
                    try {
                        clearTimeout(timeouts[rpath]);
                        FS.unlinkSync(Path.join(PERIPHERAL_PATH, rpath));
                        FS.unlinkSync(Path.join(PERIPHERAL_PATH, `.$${rpath}.landmark.json`));
                        timeouts[rpath] = undefined;
                    } catch (err) {
                        console.log(`Error in delete unlink: ${err}`);
                    }
                    io.emit("update");
                }
            } catch (err) {
                console.log(`Error updating file info: ${err}`);
                return;
            }
        });
    });
});

module.exports = {
    router: router,
    download: routerDownload
};
