import SourceInfo from '../utils/lib/SourceInfo';
import SystemInfo from '../utils/lib/SystemInfo';
import Syscall from '../utils/lib/Syscall';
import HermitOptions from '../utils/lib/HermitOptions'

const portsModule = (_inspectedData: SourceInfo, tracedData: SystemInfo, _languageData: any, _options: HermitOptions): Array<number> => {
  const syscalls: Array<Syscall> = tracedData.bind;
  const portsData: Array<number> = new Array<number>()

  syscalls.forEach((call) => {
    const portData = call.args[1]['sin6_port'];

    if (portData != undefined) {
      const port: number = portData.params[0];

      if (portsData.includes(port)) return;

      portsData.push(port);
    }
    else {
      const portData = call.args[1]['sin_port'];

      if (portData != undefined) {
        const port: number = portData.params[0];

        if (portsData.includes(port)) return;

        portsData.push(port);
      }
    }
  });

  return portsData;
}

export default portsModule;