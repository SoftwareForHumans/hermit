import Syscall from '../utils/lib/Syscall';

const dependenciesModule = (syscalls: Array<Syscall>): Array<string> => {
  const dependenciesData: Array<string> = new Array<string>()

  syscalls.forEach((call) => {
    const fileName: string = call.args[1];

    dependenciesData.push(fileName);
  });

  return dependenciesData;
}

export default dependenciesModule;