import draftLog from 'draftlog';

draftLog(console);

console.clear = function () {
  process.stdout.isTTY &&
    process.stdout.write(
      process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H',
    );
};
