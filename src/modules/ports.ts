import Syscall from '../utils/lib/Syscall';

const portsModule = (syscalls: Array<Syscall>): Array<number> => {
  const portsData: Array<number> = new Array<number>()

  syscalls.forEach((call) => {

    const portData = call.args[1]['sin6_port'];
    if (portData == undefined) return;

    const port: number = portData.params[0]
    portsData.push(port);

  });

  return portsData;
}

export default portsModule;