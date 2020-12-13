export interface Syscall {
  syscall: string,
  args: Array<string>,
  result: number,
  timing: number,
  pid: number,
  type: string
}