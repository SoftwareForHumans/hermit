import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';
import Syscall from '../utils/lib/Syscall';

const entrypointModule = (_inspectedData: SourceInfo, tracedData: SystemInfo, languageData: any): Array<string> => {
  const syscalls: Array<Syscall> = tracedData.execve;
  const languageRuntime: string = languageData.languageRuntime;

  let entrypointData: Array<string> = new Array<string>();

  syscalls.forEach((call) => {

    const argsArray: Array<any> = call.args[1];
    const result: any = call.result;
    if (result == 0 && argsArray.includes(languageRuntime)) {
      // The python image requires the exectuble to the entrypoint
      if (languageRuntime != "python3") {
        argsArray.shift();
      }
      entrypointData = argsArray;
    }
  });

  return entrypointData;
}

export default entrypointModule;