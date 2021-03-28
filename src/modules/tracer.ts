import { ChildProcess, exec } from 'child_process';
import path from 'path'
import { buildImage, createContainer, removeImage } from '../utils/containers';

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

const parseProcLogs = (options: HermitOptions): SystemInfo => {
  const systemInfo: SystemInfo = {
    openat: new Array<Syscall>(),
    bind: new Array<Syscall>(),
    execve: new Array<Syscall>()
  }

  const logs: string = readSyscallLogs(options.container);
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

  if (!options.container) {
    pids.forEach((pid) => {
      try {
        process.kill(pid);
      }
      catch (e) { }
    });
  }

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

    resolve(parseProcLogs(options));
  });

  tracerProcess.on('error', (error) => {
    reject(error);
  });
})

const injectStraceContainer = (options: HermitOptions) => {
  const dockerfilePath = path.join(options.path, 'Dockerfile');
  const dockerfileLines = readDockerfile(dockerfilePath);

  let image: string = "";
  let workdir: string = "";
  let cmdIndex: number = -1;

  for (let i = 0; i < dockerfileLines.length; i++) {
    let line = dockerfileLines[i];

    if (line.includes("FROM")) {
      image = line.replace("FROM", "").trim();
    }

    if (line.includes("WORKDIR")) {
      workdir = line.replace("WORKDIR", "").trim();
    }

    if (line.includes("CMD") || line.includes("ENTRYPOINT")) {
      cmdIndex = i;
      const cmdRegex = RegExp('\\[.*?\\]').exec(line);
      if (cmdRegex == null) throw new Error('Dockerfile has no entrypoint');

      const parsedCmd = JSON.parse(cmdRegex[0]);
      const newEntrypoint = ['strace', '-o', `${SYSCALL_LOGS}`, '-v', '-s 200', '-f', '-e', 'trace=execve,network,open,openat']
        .concat(parsedCmd);

      dockerfileLines[cmdIndex] = `${line.replace(cmdRegex[0], "")}${JSON.stringify(newEntrypoint)}`;
    }
  };

  const installCmd: string = `RUN ${image.includes("alpine") ? "apk add --no-cache" : "apt install -y"} strace`;

  dockerfileLines.splice(cmdIndex - 1, 0, installCmd);

  writeDockerfileStrace(dockerfileLines.join('\n'));

  return workdir;
}

const traceContainerSyscalls = async (workdir: string, cmd: string, options: HermitOptions) => {
  logger.info("Building image");
  const imageId = await buildImage(options);

  logger.info(`Creating container from image with ID ${imageId}`);
  const container = await createContainer(imageId, cmd, options, workdir);

  logger.info(`Starting container from image with ID ${imageId}`);
  await container.start();

  logger.info("Running service");
  await new Promise((resolve) => setTimeout(resolve, options.timeout * 1000));

  logger.info("Stoping and removing container");
  await container.remove({ force: true });

  logger.info("Stoping and removing image");
  try {
    await removeImage(imageId);
  }
  catch { }

  logger.info("Finished Docker Analysis");
  return parseProcLogs(options);
}

const tracerModule = async (command: string, options: HermitOptions) => {
  if (options.container) {
    // TODO: docker run -v `pwd`:/<WORKDIR> $(docker build -q -f Dockerfile.strace .)
    logger.info("Creating Dockerfile.strace");
    const workdir = injectStraceContainer(options);
    const syscalls: SystemInfo = await traceContainerSyscalls(workdir, command, options);

    logger.info("Finished Tracing");
    return syscalls;
  }

  const syscalls: SystemInfo = await traceSystemCalls(command, options);

  return syscalls;
}

export default tracerModule;