import fs from 'fs';
import path from 'path';

export const TEMP_DIR: string = 'tmp';
export const SYSCALL_LOGS: string = 'syscall.log';
export const DOCKERFILE_NAME: string = "Dockerfile";
export const DOCKERFILE_STRACE_NAME: string = "Dockerfile.strace";
export const DOCKERIGNORE_NAME: string = ".dockerignore";

export const DEBIAN_PACKAGES_LIST: string = 'allpackages.txt';

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

export const readSyscallLogs = (isContainer: boolean = false): string => (
  fs.readFileSync(`./${isContainer ? "" : TEMP_DIR + '/'}${SYSCALL_LOGS}`,
    { encoding: 'utf8', flag: 'r' }).toString()
);

export const readPackagesFile = (file: string): string => (
  fs.readFileSync(`${__dirname}/res/${file}`, { encoding: 'utf8', flag: 'r' }).toString()
);

export const readDebianPackages = (): Array<string> => (
  readPackagesFile(DEBIAN_PACKAGES_LIST).split('\n')
);

export const readLanguagePackages = (languagePackagesFile: string): Array<string> => (
  readPackagesFile(languagePackagesFile).split('\n')
);

export const readDockerfile = (dockerfilePath: string) => (
  fs.readFileSync(dockerfilePath, { encoding: 'utf8', flag: 'r' }).toString().split('\n')
);

const writeDockerfileTemplate = (dockerfileName: string, content: string) => {
  try {
    fs.writeFileSync(dockerfileName, content);
  }
  catch (e) {
    console.log('Dockerfile created successfully!');
  }
}

export const writeDockerfile = (content: string, isContainer: boolean = false) => (
  writeDockerfileTemplate(`${DOCKERFILE_NAME}${isContainer ? ".hermit" : ""}`, content)
)

export const writeDockerfileStrace = (content: string) => (
  writeDockerfileTemplate(DOCKERFILE_STRACE_NAME, content)
)

export const writeDockerignore = (content: string) => {
  fs.writeFile(DOCKERIGNORE_NAME, content, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
}