import { ChildProcess, exec } from 'child_process';

import { TEMP_DIR, SYSCALL_LOGS, readSyscallLogs, createTemporaryDir } from '../utils/fileSystem';
import { parseLine } from '../utils/parser';
import Syscall from '../utils/lib/Syscall';
import SystemInfo from '../utils/lib/SystemInfo';
import HermitOptions from '../utils/lib/HermitOptions';

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

const traceSystemCalls = (command: string, options: HermitOptions) => new Promise<SystemInfo>((resolve: Function, reject: Function) => {
  const PROC_TIMEOUT: number = options.timeout * 1000;

  createTemporaryDir();

  const tracerProcess: ChildProcess = exec(
    `strace -o ${TEMP_DIR}/${SYSCALL_LOGS} -v -s 200 -f -e trace=execve,network,openat ${command}`,
    { timeout: PROC_TIMEOUT }
  );

  tracerProcess.on('exit', (code) => {
    if (code == null) {
      console.log(`Process terminated after ${PROC_TIMEOUT} miliseconds have passed`);
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

const tracerModule = async (command: string, options: HermitOptions) => {
  const syscalls: SystemInfo = await traceSystemCalls(command, options);

  return syscalls;
}

export default tracerModule;