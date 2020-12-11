import { ChildProcess, exec } from 'child_process';

import { TEMP_DIR, SYSCALL_LOGS, readSyscallLogs, createTemporaryDir } from './utils/fileSystem';
import { parseLine } from './utils/parser';


export const getSystemCalls = (command: string) => new Promise((resolve, reject) => {
  const syscalls: Array<Object> = [];

  createTemporaryDir();

  const tracerProcess: ChildProcess = exec(
    `strace -f ${command} 2>&1 | grep open > ${TEMP_DIR}/${SYSCALL_LOGS}`
  );

  tracerProcess.on('exit', (_code) => {
    const logs: string = readSyscallLogs();

    logs.split('\n').forEach((line: string) => {
      console.log(line);

      const syscall: Object | null = parseLine(line);

      if (syscall == null) return;

      console.log(syscall);
      syscalls.push(syscall);
    });

    resolve(syscalls);
  });

  tracerProcess.on('error', (error) => {
    reject(error);
  });
})
