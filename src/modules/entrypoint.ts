import Syscall from '../utils/lib/Syscall';

const entrypointModule = (syscalls: Array<Syscall>): Array<string> => {
  let entrypointData: Array<string> = new Array<string>();

  syscalls.forEach((call) => {

    const argsArray: Array<any> = call.args[1];
    const result: any = call.result;
    if (result == 0 && argsArray.includes('node')) {
      argsArray.shift();
      entrypointData = argsArray;
    }
  });

  return entrypointData;
}

export default entrypointModule;