import { ChildProcess, spawn } from 'child_process';

// Import parser from the lib in b3-strace-parser
const parser = require('b3-strace-parser/lib/parser');

export const getSystemCalls = (command: string) => new Promise((resolve, reject) => {
  parser.initialize({
    trace: process.env.TRACE == 'true'
  });

  const syscalls: Array<Object> = [];

  const tracerProcess: ChildProcess = spawn('strace', ["-f", command]);

  tracerProcess.stdout?.on("data", (line) => {
    const syscall: Object = parser.parseLine(line, { debug: true });

    console.log(line);
    console.log(syscall);
    syscalls.push(syscall);
  });

  tracerProcess.on('exit', (_code) => {
    resolve(syscalls);
  });

  tracerProcess.on('error', (error) => {
    reject(error);
  });
})
