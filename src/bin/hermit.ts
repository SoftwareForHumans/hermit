import { getSystemInfo } from '../index';


const test = async () => {
  const systemInfo = await getSystemInfo(process.argv[2]);
  console.log(systemInfo);
}

test();