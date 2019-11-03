const Express = require('express');
const Multer = require('multer');
const Path = require('path');
const FS = require('fs');
const Consts = require('./constants');

const UPLOAD_PATH = Path.join(Consts.ROOT, "filebank/upload");

let blacklist = [];

(() => {
    Consts.SETTINGS.blacklist.forEach((restr) => {
        blacklist.push(RegExp(restr)); // Turn regex strings into regex objects
    });
})(); // Self-call

var getDate = () => {
    var date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

var getPath = (req, file) => Path.join(UPLOAD_PATH, `${req.ip.replace(/[:<>!@#$%^&*~,|\\]/g, "_")} – ${getDate()}`);

let upload = Multer({
    fileFilter: function (req, file, cb) {
        console.dir(file);
        for (var i = 0; i < blacklist.length; i++)
            if (file.originalname.match(blacklist[i])) {
                console.log(`blocked: ${blacklist[i]}`);
                return cb(null, false);
            }
        return cb(null, true);
    },
    storage: Multer.diskStorage({
        destination: (req, file, cb) => {
            var path = getPath(req, file);
            FS.stat(path, (err, stat) => {
                if (!stat) FS.mkdirSync(path);
                return cb(null, path);
            });
        },
        filename: (req, file, cb) => {
            var path = getPath(req, file);
            var m = file.originalname.match(/(.*)\.([A-Za-z0-9-_]*)/);
            var name = m[1], ext = m[2];
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

let routerUpload = Express.Router();

routerUpload.post(/^\/(index.html)?$/, uploadSingleFile, (req, res, next) => {
    console.dir(req.file);
    res.sendFile(Path.join(Consts.ROOT, "dist/upload/index.html"));
});

routerUpload.use(Express.static("dist/upload"));

module.exports = {
    router: routerUpload
};
