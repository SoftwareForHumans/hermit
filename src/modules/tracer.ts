import { ChildProcess, exec } from 'child_process';

import { TEMP_DIR, SYSCALL_LOGS, readSyscallLogs, createTemporaryDir } from '../utils/fileSystem';
import { parseLine } from '../utils/parser';
import Syscall from '../utils/lib/Syscall';
import SystemInfo from '../utils/lib/SystemInfo';

const PROC_TIMEOUT: number = 5 * 1000;

const parseProcLogs = (): SystemInfo => {
  const systemInfo: SystemInfo = {
    openat: new Array<Syscall>(),
    bind: new Array<Syscall>(),
    execve: new Array<Syscall>()
  }

  const logs: string = readSyscallLogs();

  logs.split('\n').forEach((line: string) => {

    const syscall: Syscall | null = parseLine(line);

    if (syscall == null) return;

    const syscallName: string = syscall.syscall;

    switch (syscallName) {
      case 'openat':
        systemInfo.openat.push(syscall);
        break;
      case 'bind':
        systemInfo.bind.push(syscall);
        break;
      case 'execve':
        systemInfo.execve.push(syscall);
        break;
      default:
        break;
    }
  });

  return systemInfo;
}

const traceSystemCalls = (command: string) => new Promise<SystemInfo>((resolve: Function, reject: Function) => {
  createTemporaryDir();

  const tracerProcess: ChildProcess = exec(
    `strace -v -s 200 -f -e trace=execve,network,openat ${command} 2>&1 | grep -E "execve|bind|openat" > ${TEMP_DIR}/${SYSCALL_LOGS}`,
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

const tracerModule = async (command: string) => {
  const syscalls: SystemInfo = await traceSystemCalls(command);

  return syscalls;
}

export default tracerModule;