import { getSystemCalls } from '../index';

const test = async () => {
  const syscalls = await getSystemCalls("neofetch");
  console.log(syscalls);
}

test();