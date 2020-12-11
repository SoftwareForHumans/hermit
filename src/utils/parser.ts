// Import parser from the lib in b3-strace-parser
const parser = require('b3-strace-parser/lib/parser');
const errors = require('b3-strace-parser/lib/errors');

parser.initialize({
  trace: process.env.TRACE == 'true'
});

export const parseLine = (line: string): Object | null => {
  try {
    console.log('Received line: ' + line);

    let parsed = parser.parseLine(line, { debug: true });
    return parsed;
  } catch (e) {
    switch (true) {
      case e instanceof errors.UnfinishedSyscallException:
        console.log('Encountered partial syscall, skipping: ' + line);
        // suppress
        return null;
    }

    console.log('[PARSE ERROR] ' + e);

    return null;
  }
}