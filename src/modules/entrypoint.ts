import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';
import Syscall from '../utils/lib/Syscall';
import HermitOptions from '../utils/lib/HermitOptions'

const entrypointModule = (_inspectedData: SourceInfo, tracedData: SystemInfo, languageData: any, options: HermitOptions): Array<string> => {
  const syscalls: Array<Syscall> = tracedData.execve;
  const languageRuntime: string = languageData.languageRuntime;

  let entrypointData: Array<string> = new Array<string>();

  syscalls.forEach((call) => {

    const argsArray: Array<any> = call.args[1];
    const result: any = call.result;
    if (result == 0 && argsArray.includes(languageRuntime)) {
      // The non-minimalist images require the exectuble to the entrypoint
      if (options.multiStage) {
        argsArray.shift();
      }

      entrypointData = argsArray;
    }
  });

  return entrypointData;
}

export default entrypointModule;