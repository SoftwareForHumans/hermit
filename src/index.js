"use strict";
exports.__esModule = true;
exports.getSystemCalls = void 0;
var child_process_1 = require("child_process");
var fileSystem_1 = require("./utils/fileSystem");
var parser_1 = require("./utils/parser");
var getSystemCalls = function (command) { return new Promise(function (resolve, reject) {
    var syscalls = [];
    fileSystem_1.createTemporaryDir();
    var tracerProcess = child_process_1.exec("strace -f " + command + " 2>&1 | grep open > " + fileSystem_1.TEMP_DIR + "/" + fileSystem_1.SYSCALL_LOGS);
    tracerProcess.on('exit', function (_code) {
        var logs = fileSystem_1.readSyscallLogs();
        logs.split('\n').forEach(function (line) {
            console.log(line);
            var syscall = parser_1.parseLine(line);
            if (syscall == null)
                return;
            console.log(syscall);
            syscalls.push(syscall);
        });
        resolve(syscalls);
    });
    tracerProcess.on('error', function (error) {
        reject(error);
    });
}); };
exports.getSystemCalls = getSystemCalls;
