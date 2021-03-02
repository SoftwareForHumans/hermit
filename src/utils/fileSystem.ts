import fs from 'fs';
import path from 'path';

export const TEMP_DIR: string = 'tmp';
export const SYSCALL_LOGS: string = 'syscall.log';
export const DOCKERFILE_NAME: string = "Dockerfile";

export const DEBIAN_PACKAGES_LIST: string = 'allpackages.txt';
export const NODE_PACKAGES_LIST: string = 'nodepackages.txt';
export const PYTHON_PACKAGES_LIST: string = 'pythonpackages.txt';

export const createTemporaryDir = () => {
  const dir_path: string = path.join('./', TEMP_DIR);

  if (fs.existsSync(dir_path)) return;

  fs.mkdir(dir_path, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log('Directory created successfully!');
  });
}

export const readSyscallLogs = (): string => (
  fs.readFileSync(`./${TEMP_DIR}/${SYSCALL_LOGS}`, { encoding: 'utf8', flag: 'r' }).toString()
);

export const readPackagesFile = (file: string): string => (
  fs.readFileSync(`${__dirname}/res/${file}`, { encoding: 'utf8', flag: 'r' }).toString()
);

export const readDebianPackages = (): Array<string> => (
  readPackagesFile(DEBIAN_PACKAGES_LIST).split('\n')
);

export const readPythonPackages = (): Array<string> => (
  readPackagesFile(PYTHON_PACKAGES_LIST).split('\n')
);

export const writeDockerfile = (content: string) => {
  fs.writeFile(DOCKERFILE_NAME, content, (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Dockerfile created successfully!');
  })
}