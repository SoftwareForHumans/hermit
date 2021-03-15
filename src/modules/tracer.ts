import { ChildProcess, exec } from 'child_process';

import { TEMP_DIR, SYSCALL_LOGS, readSyscallLogs, createTemporaryDir } from '../utils/fileSystem';
import { parseLine } from '../utils/parser';
import logger from '../utils/logger';
import Syscall from '../utils/lib/Syscall';
import SystemInfo from '../utils/lib/SystemInfo';
import HermitOptions from '../utils/lib/HermitOptions';

const PROGRAMS_BLACKLIST: Array<string> = ["google-chrome-stable"];

const isBlacklisted = (program: string) => {
  for (const p in PROGRAMS_BLACKLIST) {
    if (program.includes(p)) return true
  };

  return false;
}

const parseProcLogs = (): SystemInfo => {
  const systemInfo: SystemInfo = {
    openat: new Array<Syscall>(),
    bind: new Array<Syscall>(),
    execve: new Array<Syscall>()
  }

  const logs: string = readSyscallLogs();
  const pids: Array<number> = new Array<number>();
  const pidBlacklist: Array<number> = new Array<number>();

  logs.split('\n').forEach((line: string) => {

    const syscall: Syscall | null = parseLine(line);

    if (syscall == null) return;

    const syscallName: string = syscall.syscall;

    if (!pids.includes(syscall.pid)) pids.push(syscall.pid);

    if (pidBlacklist.includes(syscall.pid)) return;

    switch (syscallName) {
      case 'openat':
        systemInfo.openat.push(syscall);
        break;
      case 'bind':
        systemInfo.bind.push(syscall);
        break;
      case 'execve':
        if (isBlacklisted(syscall.args[0])) {
          pidBlacklist.push(syscall.pid);
          return;
        }

        systemInfo.execve.push(syscall);
        break;
      default:
        break;
    }
  });

  pids.forEach((pid) => {
    try {
      process.kill(pid);
    }
    catch (e) { }
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
      logger.info(`Process terminated after ${PROC_TIMEOUT} miliseconds have passed`);
    }
    else {
      logger.info(`Process finished with code ${code}`);
    }

    resolve(parseProcLogs());
  });

  tracerProcess.on('error', (error) => {
    reject(error);
  });
})

const tracerModule = async (command: string, options: HermitOptions) => {
  if (options.container) {
    // TODO: docker run -v <host_path>:<container_path> $(docker build -q .)
  }

  const syscalls: SystemInfo = await traceSystemCalls(command, options);

  return syscalls;
}

export default tracerModule;