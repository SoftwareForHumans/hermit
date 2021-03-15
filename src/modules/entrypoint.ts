import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';
import Syscall from '../utils/lib/Syscall';
import HermitOptions from '../utils/lib/HermitOptions'

const entrypointModule = (inspectedData: SourceInfo, tracedData: SystemInfo, languageData: any, options: HermitOptions): Array<string> => {
  let entrypointData: Array<string> = new Array<string>();

  if (inspectedData.scripts.start != undefined && !options.multiStage) {
    entrypointData = inspectedData.scripts.start.split(" ");

    return entrypointData;
  }

  const syscalls: Array<Syscall> = tracedData.execve;
  const languageRuntime: string = languageData.languageRuntime;
  const currentPath: string = options.path;

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