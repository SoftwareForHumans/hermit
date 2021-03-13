import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';
import Syscall from '../utils/lib/Syscall';
import HermitOptions from '../utils/lib/HermitOptions'
import { args } from 'commander';

const entrypointModule = (_inspectedData: SourceInfo, tracedData: SystemInfo, languageData: any, options: HermitOptions): Array<string> => {
  const syscalls: Array<Syscall> = tracedData.execve;
  const languageRuntime: string = languageData.languageRuntime;
  const currentPath: string | undefined = process.env.PWD;

  let entrypointData: Array<string> = new Array<string>();

  syscalls.forEach((call) => {
    const argsArray: Array<any> = call.args[1];
    const result: any = call.result;

    if (result == 0 && argsArray.includes(languageRuntime)) {
      // The non-minimalist images require the exectuble to the entrypoint
      if (options.multiStage) {
        argsArray.shift();
      }

      if (currentPath != undefined) {
        for (let i = 0; i < argsArray.length; i++) {
          let arg: string = argsArray[i];

          if (arg.includes(currentPath)) {
            argsArray[i] = `.${arg.replace(currentPath, "")}`;
          }
        };
      }

      entrypointData = argsArray;
    }
  });

  return entrypointData;
}

export default entrypointModule;