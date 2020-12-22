import { ChildProcess, exec } from 'child_process';

import { TEMP_DIR, SYSCALL_LOGS, readSyscallLogs, createTemporaryDir } from './utils/fileSystem';
import { parseLine } from './utils/parser';
import { Syscall } from './utils/lib/syscall';

const PROC_TIMEOUT: number = 5000;

const parseProcLogs = (): Array<Object> => {
  const syscalls: Array<Object> = [];

  const logs: string = readSyscallLogs();

  logs.split('\n').forEach((line: string) => {

    const syscall: Syscall | null = parseLine(line);

    if (syscall == null) return;

    syscalls.push(syscall);
  });

  return syscalls;
}

const getSystemCalls = (command: string) => new Promise<Array<Syscall>>((resolve: Function, reject: Function) => {
  createTemporaryDir();

  const tracerProcess: ChildProcess = exec(
    `strace -f -e trace=network,openat ${command} 2>&1 | grep -E "bind|openat" > ${TEMP_DIR}/${SYSCALL_LOGS}`,
    { timeout: PROC_TIMEOUT }
  );

  tracerProcess.on('exit', (code) => {
    if (code == null) {
      console.log(`Process terminated after ${PROC_TIMEOUT} have passed`);
    }
    else {
      console.log(`Process finished with code ${code}`);
    }

    resolve(parseProcLogs());
  });

  tracerProcess.on('error', (error) => {
    reject(error);
  });
})

export const getSystemInfo = async (command: string) => {
  const syscalls: Array<Syscall> = await getSystemCalls(command);

  const systemInfo = {
    dependencies: new Array<string>(),
    ports: new Array<number>()
  }

  syscalls.forEach((call) => {
    const syscallName: string = call.syscall;

    switch (syscallName) {
      case 'openat':
        const fileName: string = call.args[1];
        systemInfo.dependencies.push(fileName);
        break;
      case 'bind':
        const port: number = call.args[1]['sin6_port'].params[0]
        systemInfo.ports.push(port);
        break;
      default:
        break;
    }
  });

  return systemInfo;
}
