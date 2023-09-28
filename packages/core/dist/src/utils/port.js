"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.choosePort = exports.getProcessForPort = void 0;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const detect_port_1 = __importDefault(require("detect-port"));
const inquirer_1 = __importDefault(require("inquirer"));
const isInteractive = process.stdout.isTTY;
const execOptions = {
    encoding: 'utf8',
    stdio: [
        'pipe',
        'pipe',
        'ignore', //stderr
    ],
};
function getProcessIdOnPort(port) {
    return (0, child_process_1.execSync)('lsof -i:' + port + ' -P -t -sTCP:LISTEN', execOptions)
        .split('\n')[0]
        .trim();
}
function getDirectoryOfProcessById(processId) {
    return (0, child_process_1.execSync)('lsof -p ' +
        processId +
        ' | awk \'$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}\'', execOptions).trim();
}
function getProcessCommand(processId, processDirectory) {
    const command = (0, child_process_1.execSync)('ps -o command -p ' + processId + ' | sed -n 2p', execOptions);
    return command.replace(/\n$/, '');
}
function getProcessForPort(port) {
    try {
        const processId = getProcessIdOnPort(port);
        const directory = getDirectoryOfProcessById(processId);
        const command = getProcessCommand(processId, directory);
        return (chalk_1.default.cyan(command) +
            chalk_1.default.grey(' (pid ' + processId + ')\n') +
            chalk_1.default.blue('  in ') +
            chalk_1.default.cyan(directory));
    }
    catch (e) {
        return null;
    }
}
exports.getProcessForPort = getProcessForPort;
function choosePort(defaultPort) {
    return (0, detect_port_1.default)(defaultPort).then((port) => new Promise((resolve) => {
        if (port === defaultPort) {
            return resolve(port);
        }
        const message = process.platform !== 'win32' && defaultPort < 1024
            ? `Admin permissions are required to run a server on a port below 1024.`
            : `Something is already running on port ${defaultPort}.`;
        if (isInteractive) {
            const existingProcess = getProcessForPort(defaultPort);
            const question = [
                {
                    type: 'confirm',
                    name: 'shouldChangePort',
                    message: chalk_1.default.yellow(message +
                        `${existingProcess ? ` Probably:\n  ${existingProcess}` : ''}`) +
                        '\n\nWould you like to run the app on another port instead?',
                    default: true,
                },
            ];
            inquirer_1.default.prompt(question).then((answer) => {
                if (answer.shouldChangePort) {
                    resolve(port);
                }
                else {
                    resolve(null);
                }
            });
        }
        else {
            console.log(chalk_1.default.red(message));
            resolve(null);
        }
    }), (err) => {
        throw new Error(chalk_1.default.red(`Could not find an open port at ${chalk_1.default.bold('host')}.`) +
            '\n' +
            ('Network error message: ' + err.message || err) +
            '\n');
    });
}
exports.choosePort = choosePort;
