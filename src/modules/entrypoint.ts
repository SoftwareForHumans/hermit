import Syscall from '../utils/lib/Syscall';

const entrypointModule = (syscalls: Array<Syscall>, languageRuntime: string): Array<string> => {
  let entrypointData: Array<string> = new Array<string>();

  syscalls.forEach((call) => {

    const argsArray: Array<any> = call.args[1];
    const result: any = call.result;
    if (result == 0 && argsArray.includes(languageRuntime)) {
      argsArray.shift();
      entrypointData = argsArray;
    }
  });

  return entrypointData;
}

export default entrypointModule;