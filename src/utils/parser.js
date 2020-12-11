"use strict";
exports.__esModule = true;
exports.parseLine = void 0;
// Import parser from the lib in b3-strace-parser
var parser = require('b3-strace-parser/lib/parser');
var errors = require('b3-strace-parser/lib/errors');
parser.initialize({
    trace: process.env.TRACE == 'true'
});
var parseLine = function (line) {
    try {
        console.log('Received line: ' + line);
        var parsed = parser.parseLine(line, { debug: true });
        return parsed;
    }
    catch (e) {
        switch (true) {
            case e instanceof errors.UnfinishedSyscallException:
                console.log('Encountered partial syscall, skipping: ' + line);
                // suppress
                return null;
        }
        console.log('[PARSE ERROR] ' + e);
        return null;
    }
};
exports.parseLine = parseLine;
