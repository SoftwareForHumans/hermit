import { getSystemCalls } from '../index';

const test = async () => {
  const syscalls = await getSystemCalls("ping google.pt -c 5");
  console.log(syscalls);
}

test();