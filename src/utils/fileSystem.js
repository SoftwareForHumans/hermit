"use strict";
exports.__esModule = true;
exports.readSyscallLogs = exports.createTemporaryDir = exports.SYSCALL_LOGS = exports.TEMP_DIR = void 0;
var fs = require("fs");
var path_1 = require("path");
exports.TEMP_DIR = 'tmp';
exports.SYSCALL_LOGS = 'syscall.log';
var createTemporaryDir = function () {
    fs.mkdir(path_1["default"].join('./', exports.TEMP_DIR), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully!');
    });
};
exports.createTemporaryDir = createTemporaryDir;
var readSyscallLogs = function () { return (fs.readFileSync("./" + exports.TEMP_DIR + "/" + exports.SYSCALL_LOGS, { encoding: 'utf8', flag: 'r' }).toString()); };
exports.readSyscallLogs = readSyscallLogs;
