import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const processes = [
  spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], { stdio: 'inherit', shell: isWindows }),
  spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], { stdio: 'inherit', shell: isWindows }),
];

const shutdown = (signal) => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown('SIGTERM');
    }
  });
}
