import fs from 'fs';
import path from 'path';

export const TEMP_DIR: string = 'tmp';
export const SYSCALL_LOGS: string = 'syscall.log';

export const createTemporaryDir = () => {
  fs.mkdir(path.join('./', TEMP_DIR), (err) => {
    if (err) {
      return console.error(err);
    }
    console.log('Directory created successfully!');
  });
}

export const readSyscallLogs = (): string => (
  fs.readFileSync(`./${TEMP_DIR}/${SYSCALL_LOGS}`, { encoding: 'utf8', flag: 'r' }).toString()
);