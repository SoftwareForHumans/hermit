import Syscall from '../utils/lib/Syscall';

const dependenciesModule = (syscalls: Array<Syscall>, installationSteps: Array<string>): Array<string> => {
  const dependenciesData: Array<string> = new Array<string>()

  syscalls.forEach((call) => {
    const fileName: string = call.args[1];

    dependenciesData.push(fileName);
  });

  return installationSteps;
}

export default dependenciesModule;