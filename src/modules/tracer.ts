import { ChildProcess, exec } from 'child_process';
import path from 'path'

import { TEMP_DIR, SYSCALL_LOGS, readSyscallLogs, createTemporaryDir, readDockerfile, writeDockerfileStrace } from '../utils/fileSystem';
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
      case 'open':
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

const traceContainerSyscalls = (options: HermitOptions) => {
  const dockerfilePath = path.join(options.path, 'Dockerfile');
  const dockerfileLines = readDockerfile(dockerfilePath);

  let workdir: string = "";
  let cmdIndex: number = -1;

  for (let i = 0; i < dockerfileLines.length; i++) {
    let line = dockerfileLines[i];

    if (line.includes("WORKDIR")) {
      workdir = line.replace("WORKDIR", "");
    }

    if (line.includes("CMD")) {
      cmdIndex = i;
      const cmdRegex = RegExp('\\[.*?\\]').exec(line);
      if (cmdRegex == null) throw new Error('Dockerfile has no enrypoint');

      const parsedCmd = JSON.parse(cmdRegex[0]);
      const newEntrypoint = ['strace', `-o ${TEMP_DIR}/${SYSCALL_LOGS}`, '-v', '-s 200', '-f', '-e', 'trace=execve,network,open,openat']
        .concat(parsedCmd);

      dockerfileLines[cmdIndex] = `${line.replace(cmdRegex[0], "")}${JSON.stringify(newEntrypoint)}`;
    }
  };

  dockerfileLines.splice(cmdIndex - 1, 0, "RUN apt install -y strace\nRUN mkdir tmp");

  writeDockerfileStrace(dockerfileLines.join('\n'));
}

const tracerModule = async (command: string, options: HermitOptions) => {
  if (options.container) {
    // TODO: docker run -v `pwd`:/<WORKDIR> $(docker build -q -f Dockerfile.strace .)
    traceContainerSyscalls(options);
    process.exit();
  }

  const syscalls: SystemInfo = await traceSystemCalls(command, options);

  return syscalls;
}

export default tracerModule;