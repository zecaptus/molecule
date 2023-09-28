import { ExecSyncOptionsWithStringEncoding, execSync } from 'child_process';
import chalk from 'chalk';
import detect from 'detect-port';
import inquirer from 'inquirer';

const isInteractive = process.stdout.isTTY;

const execOptions: ExecSyncOptionsWithStringEncoding = {
  encoding: 'utf8',
  stdio: [
    'pipe', // stdin (default)
    'pipe', // stdout (default)
    'ignore', //stderr
  ],
};
function getProcessIdOnPort(port: number) {
  return execSync('lsof -i:' + port + ' -P -t -sTCP:LISTEN', execOptions)
    .split('\n')[0]
    .trim();
}

function getDirectoryOfProcessById(processId: string) {
  return execSync(
    'lsof -p ' +
      processId +
      ' | awk \'$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}\'',
    execOptions,
  ).trim();
}

function getProcessCommand(processId: string, processDirectory?: string) {
  const command = execSync(
    'ps -o command -p ' + processId + ' | sed -n 2p',
    execOptions,
  );

  return command.replace(/\n$/, '');
}

function getProcessForPort(port: number) {
  try {
    const processId = getProcessIdOnPort(port);
    const directory = getDirectoryOfProcessById(processId);
    const command = getProcessCommand(processId, directory);
    return (
      chalk.cyan(command) +
      chalk.grey(' (pid ' + processId + ')\n') +
      chalk.blue('  in ') +
      chalk.cyan(directory)
    );
  } catch (e) {
    return null;
  }
}

function choosePort(defaultPort: number): Promise<number | null> {
  return detect(defaultPort).then(
    (port) =>
      new Promise((resolve) => {
        if (port === defaultPort) {
          return resolve(port);
        }
        const message =
          process.platform !== 'win32' && defaultPort < 1024
            ? `Admin permissions are required to run a server on a port below 1024.`
            : `Something is already running on port ${defaultPort}.`;
        if (isInteractive) {
          const existingProcess = getProcessForPort(defaultPort);
          const question = [
            {
              type: 'confirm',
              name: 'shouldChangePort',
              message:
                chalk.yellow(
                  message +
                    `${
                      existingProcess ? ` Probably:\n  ${existingProcess}` : ''
                    }`,
                ) +
                '\n\nWould you like to run the app on another port instead?',
              default: true,
            },
          ];
          inquirer.prompt(question).then((answer) => {
            if (answer.shouldChangePort) {
              resolve(port);
            } else {
              resolve(null);
            }
          });
        } else {
          console.log(chalk.red(message));
          resolve(null);
        }
      }),
    (err) => {
      throw new Error(
        chalk.red(`Could not find an open port at ${chalk.bold('host')}.`) +
          '\n' +
          ('Network error message: ' + err.message || err) +
          '\n',
      );
    },
  );
}

export { getProcessForPort, choosePort };
